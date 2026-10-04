import { expect, test, type Page } from "@playwright/test";
import { defaultLocale, locales, type Locale } from "../src/app/data/locales";
import { sections } from "../src/app/data/site";
import {
  copyOf,
  homeOf,
  inspectorCopyOf,
  LOCALES,
  revealAll,
  scrollToY,
  storeSkin,
  waitForStack,
} from "./helpers";

/** Every string of a dictionary, by its path. The few entries that are functions are left out. */
function leaves(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (typeof value !== "object" || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, path ? `${path}.${key}` : key),
  );
}

/**
 * Strings of `from` that the same key of `to` says differently: they must not be on a page
 * written in the language of `to`. Keywords are left out, because they are a list of proper
 * names in a meta tag, not copy.
 *
 * It is checked from the source language to a translation, not the other way round: job titles
 * and technical terms are English in every language, so English is expected on any page.
 */
function foreignStrings(from: unknown, to: unknown) {
  const translated = new Map(leaves(to));
  return leaves(from).filter(
    ([path, text]) =>
      !path.startsWith("meta.keywords") && translated.get(path) !== text,
  );
}

/**
 * As a whole word or phrase: "Mai" is not found inside "Main". Without regard to case, because
 * the rendered text of a label is in capitals.
 */
const contains = (haystack: string, text: string) =>
  new RegExp(
    `(?<![\\p{L}\\p{N}])${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`,
    "iu",
  ).test(haystack);

/** What a visitor reads or hears: the text, and the attributes that carry copy. */
const readable = (page: Page, selector: string) =>
  page.locator(selector).evaluate((root) => {
    const attributes = Array.from(
      root.querySelectorAll("[aria-label], [alt], [title]"),
    ).flatMap((element) =>
      ["aria-label", "alt", "title"].map(
        (name) => element.getAttribute(name) ?? "",
      ),
    );
    return [(root as HTMLElement).innerText, ...attributes].join("\n");
  });

/** The section under the navbar and how far into it the page is scrolled, as a share of it. */
const position = (page: Page) =>
  page.evaluate(() => {
    const navbar = document.querySelector("[data-nav-bar]")!.clientHeight;
    const current = Array.from(
      document.querySelectorAll<HTMLElement>(".stack-slot"),
    )
      .filter((slot) => slot.getBoundingClientRect().top <= navbar + 1)
      .at(-1)!;
    const panel = current.querySelector<HTMLElement>("[data-stack-panel]")!;
    return {
      section: current.id,
      ratio:
        (navbar - current.getBoundingClientRect().top) / panel.offsetHeight,
    };
  });

const other = (locale: Locale) =>
  LOCALES.find((code) => code !== locale) ?? defaultLocale;

for (const locale of LOCALES) {
  const copy = copyOf(locale);
  const home = homeOf(locale);
  const target = other(locale);

  test.describe(`languages, from ${locale}`, () => {
    test("the switch marks the language and opens the other one at the same place", async ({
      page,
      isMobile,
    }) => {
      await page.goto(home);
      await waitForStack(page);
      // A place no link leads to: part of the way into the experience section.
      const start = await page.evaluate((id) => {
        const slot = document.getElementById(id)!;
        const panel = slot.querySelector<HTMLElement>("[data-stack-panel]")!;
        const navbar = document.querySelector("[data-nav-bar]")!.clientHeight;
        return (
          slot.getBoundingClientRect().top +
          window.scrollY -
          navbar +
          0.4 * panel.offsetHeight
        );
      }, sections.experience);
      await scrollToY(page, start);
      const before = await position(page);
      expect(before.section).toBe(sections.experience);
      expect(before.ratio).toBeCloseTo(0.4, 1);

      // Below `md` the switch of the navbar is inside the menu.
      if (isMobile) {
        await page.getByRole("button", { name: copy.nav.openMenu }).click();
      }
      const languages = page
        .getByRole("navigation", { name: copy.nav.label })
        .getByRole("list", { name: copy.nav.language })
        .filter({ visible: true });

      await expect(languages.getByRole("link")).toHaveCount(LOCALES.length);
      const current = languages.locator('a[aria-current="true"]');
      await expect(current).toHaveCount(1);
      await expect(current).toContainText(locales[locale].label);

      const link = languages.locator(
        `a[hreflang="${locales[target].htmlLang}"]`,
      );
      await expect(link).toContainText(locales[target].label);
      await link.click();

      await expect(page).toHaveURL(new RegExp(`${homeOf(target)}$`));
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        locales[target].htmlLang,
      );
      // The other language opens where this one was being read, not at the top.
      await expect
        .poll(async () => (await position(page)).section)
        .toBe(before.section);
      await waitForStack(page);
      const after = await position(page);
      expect(Math.abs(after.ratio - before.ratio)).toBeLessThan(0.05);

      // The position was for that navigation only: nothing is left to apply to a later one.
      expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
    });

    test("nothing on the page is left in the source language", async ({
      page,
    }) => {
      test.skip(locale === defaultLocale, "the source language");
      await page.goto(home);
      await waitForStack(page);
      await revealAll(page);
      const text = [
        await page.title(),
        await readable(page, "body"),
        (await page
          .locator('meta[name="description"]')
          .getAttribute("content")) ?? "",
      ].join("\n");

      const found = foreignStrings(copyOf(defaultLocale), copy)
        .filter(([, foreign]) => contains(text, foreign))
        .map(([path]) => path);
      expect(found).toEqual([]);
    });

    test("nothing in the Inspector is left in the source language", async ({
      page,
    }) => {
      test.skip(locale === defaultLocale, "the source language");
      const inspector = inspectorCopyOf(locale);
      await storeSkin(page);
      await page.goto(home);
      await waitForStack(page);
      await page.getByRole("button", { name: inspector.toggle }).click();
      const panel = page.locator("#inspector-panel");
      await expect(panel).toBeVisible();

      let text = "";
      for (const name of Object.values(inspector.tabs)) {
        await panel.getByRole("tab", { name }).click();
        await expect(panel.getByRole("tabpanel")).toBeVisible();
        text += `${await readable(page, "#inspector-panel")}\n`;
      }

      const found = foreignStrings(inspectorCopyOf(defaultLocale), inspector)
        .filter(([, foreign]) => contains(text, foreign))
        .map(([path]) => path);
      expect(found).toEqual([]);
    });

    test.describe("without JavaScript", () => {
      test.use({ javaScriptEnabled: false });

      test("the switch of the footer leads to the other language", async ({
        page,
      }) => {
        await page.goto(home);
        const link = page
          .getByRole("contentinfo")
          .getByRole("list", { name: copy.nav.language })
          .locator(`a[hreflang="${locales[target].htmlLang}"]`);
        await link.click();
        await expect(page).toHaveURL(new RegExp(`${homeOf(target)}$`));
        await expect(page.locator("html")).toHaveAttribute(
          "lang",
          locales[target].htmlLang,
        );
      });
    });
  });
}
