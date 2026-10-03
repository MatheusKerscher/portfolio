import { expect, test } from "@playwright/test";
import { projects } from "../src/app/data/projects";
import { signaturePage, site } from "../src/app/data/site";
import { parseColor } from "../src/lib/contrast";
import { readJsonLd } from "./helpers";

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[a-z]{2,})+/gi;

test.describe("SEO and GEO", () => {
  // Metadata is the same HTML for every engine.
  test.skip(
    ({ browserName, isMobile }) => browserName !== "chromium" || isMobile,
    "checked once, in desktop Chromium",
  );

  test("home has title, description, canonical and social tags", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(site.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      site.description,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      site.url,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      site.url,
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      site.locale,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /opengraph-image/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });

  test("email signature page has its own title, description and canonical", async ({
    page,
  }) => {
    await page.goto(signaturePage.path);
    await expect(page).toHaveTitle(`${signaturePage.title} | ${site.name}`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      signaturePage.description,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${site.url}${signaturePage.path}`,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `${site.url}${signaturePage.path}`,
    );
  });

  test("one JSON-LD graph describes the site, the page, the person and the projects", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.locator('script[type="application/ld+json"]'),
    ).toHaveCount(1);
    const { "@graph": graph } = await readJsonLd(page);
    const types = graph.map((node) => node["@type"]);
    for (const type of ["WebSite", "ProfilePage", "Person", "ItemList"]) {
      expect(types, `@type ${type}`).toContain(type);
    }
    const person = graph.find((node) => node["@type"] === "Person");
    expect(person?.email).toBe(site.email);
    const list = graph.find((node) => node["@type"] === "ItemList") as {
      itemListElement: unknown[];
    };
    expect(list.itemListElement).toHaveLength(projects.length);
  });

  test("only one email address is published", async ({ request }) => {
    // The signature page is left out: its form has a placeholder address.
    for (const path of ["/", "/llms.txt"]) {
      const body = await (await request.get(path)).text();
      const found = [...new Set(body.match(EMAIL) ?? [])];
      expect(found, path).toEqual([site.email]);
    }
  });

  test("metadata routes respond", async ({ request }) => {
    for (const path of [
      "/sitemap.xml",
      "/robots.txt",
      "/llms.txt",
      "/manifest.webmanifest",
      "/favicon.ico",
      "/opengraph-image",
    ]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
  });

  test("sitemap lists both routes", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain(`<loc>${site.url}</loc>`);
    expect(xml).toContain(`<loc>${site.url}${signaturePage.path}</loc>`);
    expect(xml).toContain(`<lastmod>${site.contentUpdatedAt}`);
  });

  test("robots.txt welcomes AI crawlers and points at the sitemap", async ({
    request,
  }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("User-Agent: GPTBot");
    expect(robots).toContain("User-Agent: ClaudeBot");
    expect(robots).toContain(`Sitemap: ${site.url}/sitemap.xml`);
  });

  test("llms.txt is generated from the site data", async ({ request }) => {
    const response = await request.get("/llms.txt");
    expect(response.headers()["content-type"]).toContain("text/markdown");
    const text = await response.text();
    expect(text).toContain(`# ${site.name}`);
    expect(text).toContain(site.summary);
    for (const project of projects) {
      expect(text, project.title).toContain(
        `[${project.title}](${project.websiteUrl ?? project.repositoryUrl})`,
      );
    }
    expect(text).toContain(`${site.url}${signaturePage.path}`);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`theme-color matches the page background in the ${scheme} theme`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");
      const paper = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--paper")
          .trim(),
      );
      // Compared as RGB: the CSS minifier may shorten the hex notation.
      expect(parseColor(paper)).toEqual(parseColor(site.themeColor[scheme]));
      await expect(
        page.locator(
          `meta[name="theme-color"][media="(prefers-color-scheme: ${scheme})"]`,
        ),
      ).toHaveAttribute("content", site.themeColor[scheme]);
    });
  }
});
