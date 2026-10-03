/**
 * Captures the top of a page as a PNG, for a project thumbnail or the README.
 *
 *   node scripts/capture-thumbnail.mjs <url> <output.png> [--width=1500] [--height=900]
 */
import { chromium } from "@playwright/test";

const [url, output, ...flags] = process.argv.slice(2);
if (!url || !output) {
  console.error(
    "Usage: node scripts/capture-thumbnail.mjs <url> <output.png> [--width=1500] [--height=900]",
  );
  process.exit(1);
}

const options = Object.fromEntries(
  flags.map((flag) => flag.replace(/^--/, "").split("=")),
);
const width = Number(options.width ?? 1500);
const height = Number(options.height ?? 900);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.screenshot({ path: output });
  console.log(`Saved ${output} (${width}×${height}) from ${page.url()}`);
} finally {
  await browser.close();
}
