/**
 * Measures the production build with Lighthouse, mobile and desktop.
 *
 *   node scripts/lighthouse.mjs [--runs=5] [--min=95] [--latency=40] [--presets=mobile,desktop]
 *                               [--write] [--external] [--url=<url>]
 *
 * Without --url it builds the site and serves it with `next start`. Each preset runs --runs
 * times and the median is reported. It exits 1 when the median Performance is below --min or
 * any other category is below 95. --write stores the medians in src/app/data/audit.json.
 *
 * --latency delays every response by that many milliseconds. On localhost every script arrives
 * before the first frame, so the first paint lands before or after hydration by chance, and
 * Lighthouse's simulated LCP flips between two values 500 ms apart. A real connection always
 * has a round trip; 40 ms is a fast one. --latency=0 measures the raw localhost.
 *
 * --external measures a server that is already listening on port 3100 (another build of the
 * site, for a comparison) instead of building and starting this one.
 */
import { execFile, spawn } from "node:child_process";
import http from "node:http";
import { writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { chromium } from "@playwright/test";
import * as prettier from "prettier";

const run = promisify(execFile);

const PORT = 3100;
const PROXY_PORT = 3101;
const OTHER_CATEGORIES_MIN = 95;
const ALL_PRESETS = ["mobile", "desktop"];
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];
const AUDIT_FILE = "src/app/data/audit.json";

const options = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const [key, value = "true"] = argument.replace(/^--/, "").split("=");
    return [key, value];
  }),
);
const PRESETS = options.presets ? options.presets.split(",") : ALL_PRESETS;
const runs = Number(options.runs ?? 5);
const min = Number(options.min ?? 95);
const latency = Number(options.latency ?? 40);
const origin = `http://localhost:${PORT}/`;
const url =
  options.url ?? (latency > 0 ? `http://localhost:${PROXY_PORT}/` : origin);

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

/** Depth-first search for the first Lighthouse `node` detail, which carries the HTML snippet. */
function findNode(value) {
  if (!value || typeof value !== "object") return null;
  if (value.type === "node" && value.snippet) return value;
  for (const child of Object.values(value)) {
    const found = findNode(child);
    if (found) return found;
  }
  return null;
}

function summarise(report) {
  const { audits, categories } = report;
  const requests = audits["network-requests"]?.details?.items ?? [];
  const lcpAudit =
    audits["largest-contentful-paint-element"] ??
    audits["lcp-breakdown-insight"] ??
    audits["lcp-discovery-insight"];
  // Unthrottled timings of the real load. The simulated ones are estimated from them, and on
  // localhost that estimate counts every request that ended before the first paint.
  const observed = audits.metrics?.details?.items?.[0] ?? {};
  return {
    observedFcp: Math.round(observed.observedFirstContentfulPaint ?? 0),
    observedLcp: Math.round(observed.observedLargestContentfulPaint ?? 0),
    scores: Object.fromEntries(
      CATEGORIES.map((id) => [
        id,
        Math.round((categories[id]?.score ?? 0) * 100),
      ]),
    ),
    fcp: Math.round(audits["first-contentful-paint"].numericValue),
    lcp: Math.round(audits["largest-contentful-paint"].numericValue),
    tbt: Math.round(audits["total-blocking-time"].numericValue),
    cls: Number(audits["cumulative-layout-shift"].numericValue.toFixed(3)),
    speedIndex: Math.round(audits["speed-index"].numericValue),
    scriptBytes: requests
      .filter((request) => request.resourceType === "Script")
      .reduce((total, request) => total + (request.transferSize ?? 0), 0),
    lcpElement: findNode(lcpAudit?.details)?.snippet ?? "unknown",
  };
}

async function lighthouse(preset) {
  const flags = [
    url,
    "--output=json",
    "--output-path=stdout",
    "--quiet",
    `--chrome-flags=--headless=new${process.env.CI ? " --no-sandbox" : ""}`,
  ];
  if (preset === "desktop") flags.push("--preset=desktop");
  const { stdout } = await run("node_modules/.bin/lighthouse", flags, {
    env: { ...process.env, CHROME_PATH: chromium.executablePath() },
    maxBuffer: 256 * 1024 * 1024,
  });
  return JSON.parse(stdout);
}

/** Forwards every request to `next start` after `latency` milliseconds. */
function startProxy() {
  const proxy = http.createServer((request, response) => {
    setTimeout(() => {
      const upstream = http.request(
        {
          host: "127.0.0.1",
          port: PORT,
          path: request.url,
          method: request.method,
          headers: request.headers,
        },
        (answer) => {
          response.writeHead(answer.statusCode ?? 502, answer.headers);
          answer.pipe(response);
        },
      );
      upstream.on("error", () => response.destroy());
      request.pipe(upstream);
    }, latency);
  });
  return new Promise((resolve) =>
    proxy.listen(PROXY_PORT, () => resolve(proxy)),
  );
}

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      if ((await fetch(origin)).ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No answer from ${origin}`);
}

let server;
let proxy;
if (!options.url) {
  if (!options.external) {
    await run("npm", ["run", "build"], { maxBuffer: 64 * 1024 * 1024 });
    server = spawn("npx", ["next", "start", "-p", String(PORT)], {
      stdio: "ignore",
      detached: true,
    });
  }
  await waitForServer();
  if (latency > 0) proxy = await startProxy();
  console.log(`Measuring ${url} with ${latency} ms of latency per response\n`);
}

const results = {};
let lighthouseVersion = "";
try {
  for (const preset of PRESETS) {
    const summaries = [];
    for (let index = 1; index <= runs; index += 1) {
      const report = await lighthouse(preset);
      lighthouseVersion = report.lighthouseVersion;
      const summary = summarise(report);
      summaries.push(summary);
      const s = summary.scores;
      console.log(
        `${preset} run ${index}: perf ${s.performance} a11y ${s.accessibility} bp ${s["best-practices"]} seo ${s.seo} | FCP ${summary.fcp} ms LCP ${summary.lcp} ms TBT ${summary.tbt} ms CLS ${summary.cls} SI ${summary.speedIndex} ms | observed FCP ${summary.observedFcp} ms LCP ${summary.observedLcp} ms | JS ${(summary.scriptBytes / 1024).toFixed(1)} KB`,
      );
    }
    results[preset] = {
      performance: median(summaries.map((s) => s.scores.performance)),
      accessibility: median(summaries.map((s) => s.scores.accessibility)),
      bestPractices: median(summaries.map((s) => s.scores["best-practices"])),
      seo: median(summaries.map((s) => s.scores.seo)),
      fcp: median(summaries.map((s) => s.fcp)),
      lcp: median(summaries.map((s) => s.lcp)),
      tbt: median(summaries.map((s) => s.tbt)),
      cls: median(summaries.map((s) => s.cls)),
      speedIndex: median(summaries.map((s) => s.speedIndex)),
      observedFcp: median(summaries.map((s) => s.observedFcp)),
      observedLcp: median(summaries.map((s) => s.observedLcp)),
      scriptBytes: median(summaries.map((s) => s.scriptBytes)),
      lcpElement: summaries[0].lcpElement,
    };
    const m = results[preset];
    console.log(
      `${preset} MEDIAN of ${runs}: perf ${m.performance} a11y ${m.accessibility} bp ${m.bestPractices} seo ${m.seo} | FCP ${m.fcp} ms LCP ${m.lcp} ms TBT ${m.tbt} ms CLS ${m.cls} SI ${m.speedIndex} ms | observed FCP ${m.observedFcp} ms LCP ${m.observedLcp} ms | JS ${(m.scriptBytes / 1024).toFixed(1)} KB\n  LCP element: ${m.lcpElement}`,
    );
  }
} finally {
  proxy?.close();
  proxy?.closeAllConnections();
  if (server) process.kill(-server.pid);
}

if (options.write) {
  const { stdout: commit } = await run("git", ["rev-parse", "--short", "HEAD"]);
  const data = {
    measuredAt: new Date().toISOString().slice(0, 10),
    commit: commit.trim(),
    lighthouseVersion,
    runs,
    ...Object.fromEntries(
      PRESETS.map((preset) => [
        preset,
        {
          performance: results[preset].performance,
          accessibility: results[preset].accessibility,
          bestPractices: results[preset].bestPractices,
          seo: results[preset].seo,
        },
      ]),
    ),
  };
  await writeFile(
    AUDIT_FILE,
    await prettier.format(JSON.stringify(data), { parser: "json" }),
  );
  console.log(`Wrote ${AUDIT_FILE}`);
}

const failures = PRESETS.flatMap((preset) => {
  const m = results[preset];
  return [
    m.performance < min && `${preset} performance ${m.performance} < ${min}`,
    ...["accessibility", "bestPractices", "seo"].map(
      (category) =>
        m[category] < OTHER_CATEGORIES_MIN &&
        `${preset} ${category} ${m[category]} < ${OTHER_CATEGORIES_MIN}`,
    ),
  ].filter(Boolean);
});

if (failures.length > 0) {
  console.error(`\nBelow the threshold:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("\nEvery category is at or above its threshold.");
