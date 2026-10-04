import { expect, test } from "@playwright/test";
import { yearsOfExperience } from "../src/app/data/curriculum";
import { localePath, locales } from "../src/app/data/locales";
import { projects } from "../src/app/data/projects";
import { site } from "../src/app/data/site";
import { parseColor } from "../src/lib/contrast";
import { copyOf, homeOf, LOCALES, readJsonLd } from "./helpers";

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[a-z]{2,})+/gi;
/** A Brazilian phone number, with or without the country code and punctuation. */
const PHONE = /(?:\+?55[\s-]?)?\(?\b\d{2}\)?[\s-]?9\d{4}[\s-]?\d{4}\b/g;

/** The address of a path on the production host, without a trailing slash for the root. */
const absolute = (path: string) => `${site.url}${path === "/" ? "" : path}`;

/** The same page in every language: what each of them has to declare, itself included. */
const ALTERNATES = [
  ...LOCALES.map((code) => ({
    hreflang: locales[code].htmlLang,
    href: absolute(homeOf(code)),
  })),
  { hreflang: "x-default", href: absolute("/") },
];

test.describe("SEO and GEO", () => {
  // Metadata is the same HTML for every engine.
  test.skip(
    ({ browserName, isMobile }) => browserName !== "chromium" || isMobile,
    "checked once, in desktop Chromium",
  );

  for (const locale of LOCALES) {
    const { meta, projects: projectsCopy } = copyOf(locale);
    const home = homeOf(locale);
    const llms = localePath(locale, "/llms.txt");

    test.describe(locale, () => {
      test("the page has its language, title, description, canonical and social tags", async ({
        page,
      }) => {
        await page.goto(home);
        await expect(page.locator("html")).toHaveAttribute(
          "lang",
          locales[locale].htmlLang,
        );
        await expect(page).toHaveTitle(meta.title);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
          "content",
          meta.description,
        );
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          "href",
          absolute(home),
        );
        await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
          "content",
          absolute(home),
        );
        await expect(
          page.locator('meta[property="og:locale"]'),
        ).toHaveAttribute("content", locales[locale].openGraph);
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
          "content",
          /opengraph-image/,
        );
        await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
          "content",
          "summary_large_image",
        );
      });

      test("the page names itself and every other language", async ({
        page,
      }) => {
        await page.goto(home);
        const links = await page
          .locator('link[rel="alternate"][hreflang]')
          .evaluateAll((elements) =>
            elements.map((element) => ({
              hreflang: element.getAttribute("hreflang"),
              href: element.getAttribute("href"),
            })),
          );
        expect(links).toEqual(ALTERNATES);
      });

      test("the Open Graph image of the page loads", async ({
        page,
        request,
      }) => {
        await page.goto(home);
        const image = await page
          .locator('meta[property="og:image"]')
          .getAttribute("content");
        const response = await request.get(new URL(image!).pathname);
        expect(response.status()).toBe(200);
        expect(response.headers()["content-type"]).toBe("image/png");
      });

      test("one JSON-LD graph describes the site, the page, the person and the projects", async ({
        page,
      }) => {
        await page.goto(home);
        await expect(
          page.locator('script[type="application/ld+json"]'),
        ).toHaveCount(1);
        const { "@graph": graph } = await readJsonLd(page);
        const node = (type: string) =>
          graph.find((entry) => entry["@type"] === type);
        for (const type of ["WebSite", "ProfilePage", "Person", "ItemList"]) {
          expect(node(type), `@type ${type}`).toBeDefined();
        }

        // The person is one entity, whatever the language of the page that describes it.
        const person = node("Person")!;
        expect(person["@id"]).toBe(`${site.url}/#person`);
        expect(person.email).toBe(site.email);
        expect(person.jobTitle).toBe(meta.role);

        const profile = node("ProfilePage")!;
        expect(profile.url).toBe(absolute(home));
        expect(profile.inLanguage).toBe(locales[locale].htmlLang);

        const list = node("ItemList") as unknown as {
          itemListElement: { item: { description: string } }[];
        };
        expect(
          list.itemListElement.map((entry) => entry.item.description),
        ).toEqual(
          projects.map((project) => projectsCopy.descriptions[project.id]),
        );
      });

      test("llms.txt is generated from the site data, in the language", async ({
        request,
      }) => {
        const response = await request.get(llms);
        expect(response.headers()["content-type"]).toContain("text/markdown");
        expect(response.headers()["content-language"]).toBe(
          locales[locale].htmlLang,
        );
        const text = await response.text();
        expect(text).toContain(`# ${site.name}`);
        expect(text).toContain(meta.summary(yearsOfExperience));
        for (const project of projects) {
          expect(text, project.title).toContain(
            `[${project.title}](${project.websiteUrl ?? project.repositoryUrl}): ${projectsCopy.descriptions[project.id]}`,
          );
        }
        expect(text).toContain(`(${absolute(home)})`);
        expect(text).not.toContain("email-signature");
        // It points at the same file in every other language.
        for (const other of LOCALES.filter((code) => code !== locale)) {
          expect(text, other).toContain(
            `${site.url}${localePath(other, "/llms.txt")}`,
          );
        }
      });

      test("only one email address and no phone number are published", async ({
        request,
      }) => {
        for (const path of [home, llms]) {
          const body = await (await request.get(path)).text();
          expect([...new Set(body.match(EMAIL) ?? [])], path).toEqual([
            site.email,
          ]);
          // Checked on the text: digits inside hashed file names are not a phone number.
          const text = body.replace(/<script[\s\S]*?<\/script>|<[^>]+>/g, " ");
          expect(text.match(PHONE) ?? [], path).toEqual([]);
        }
      });
    });
  }

  test("a URL has one address: duplicates and the removed page redirect", async ({
    request,
  }) => {
    for (const [from, to] of [
      // The default language is served without its prefix.
      ["/pt", "/"],
      ["/pt/llms.txt", "/llms.txt"],
      // The email signature tool was removed.
      ["/email-signature", "/"],
    ]) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), from).toBe(308);
      expect(response.headers().location, from).toBe(to);
    }
  });

  test("an unknown path is a 404", async ({ request }) => {
    for (const path of ["/de", "/pt/nothing", "/nothing/at/all"]) {
      expect((await request.get(path)).status(), path).toBe(404);
    }
  });

  test("metadata routes respond", async ({ request }) => {
    for (const path of [
      "/sitemap.xml",
      "/robots.txt",
      "/manifest.webmanifest",
      "/favicon.ico",
      "/icon.png",
      "/apple-icon.png",
      "/avatar/icon-192.png",
      "/avatar/icon-512.png",
    ]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
  });

  test("the sitemap lists the home page of every language, with its alternates", async ({
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const locale of LOCALES) {
      expect(xml).toContain(`<loc>${absolute(homeOf(locale))}</loc>`);
      expect(xml).toContain(
        `hreflang="${locales[locale].htmlLang}" href="${absolute(homeOf(locale))}"`,
      );
    }
    expect(xml.match(/<url>/g)).toHaveLength(LOCALES.length);
    expect(xml).toContain(`<lastmod>${site.contentUpdatedAt}`);
    expect(xml).not.toContain("email-signature");
  });

  test("robots.txt welcomes AI crawlers and points at the sitemap", async ({
    request,
  }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("User-Agent: GPTBot");
    expect(robots).toContain("User-Agent: ClaudeBot");
    expect(robots).toContain(`Sitemap: ${site.url}/sitemap.xml`);
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
