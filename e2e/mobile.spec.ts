import { expect, test, type Page } from "@playwright/test";
import { headingId, sections } from "../src/app/data/site";
import {
  copyOf,
  DEFAULT_COPY,
  homeOf,
  LOCALES,
  navbarHeight,
  revealAll,
  scrollToY,
  storeSkin,
  violations,
  waitForStack,
} from "./helpers";

/** Widths of a phone: the narrowest supported, a common Android and a common iPhone. */
const PHONES = [320, 360, 390];
const SKINS = ["normal", "8-bit"] as const;
/** The smallest side of a touch target, in CSS pixels. */
const TARGET = 44;

const HEADINGS = Object.keys(sections).map((key) =>
  headingId(key as keyof typeof sections),
);

async function open(page: Page, path: string, width: number, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto(path);
  await waitForStack(page);
  await page.evaluate(() => document.fonts.ready);
}

/**
 * What is not centred in the viewport, with how far off it is. `cards` also checks the first
 * item of each carousel and its text, which is centred on a phone only.
 */
async function offCentre(page: Page, headings: string[], cards: boolean) {
  return page.evaluate(
    ({ headings, cards }) => {
      const middle = document.documentElement.clientWidth / 2;
      const found: string[] = [];
      const shown = (element: Element) =>
        (element as HTMLElement).offsetParent !== null &&
        getComputedStyle(element).visibility !== "hidden";
      const all = (name: string, selector: string) => {
        const elements = [...document.querySelectorAll(selector)].filter(shown);
        if (!elements.length) found.push(`${name}: nothing matches`);
        return elements;
      };
      const report = (name: string, left: number, right: number) => {
        const offset = (left + right) / 2 - middle;
        if (Math.abs(offset) > 1) found.push(`${name}: ${offset.toFixed(1)}`);
      };

      /** The box of each element. */
      const box = (name: string, selector: string) =>
        all(name, selector).forEach((element) => {
          const rect = element.getBoundingClientRect();
          report(name, rect.left, rect.right);
        });

      /** What the matching descendants of each element occupy together. */
      const row = (name: string, selector: string, parts = ":scope > *") =>
        all(name, selector).forEach((element) => {
          const rects = [...element.querySelectorAll(parts)]
            .filter(shown)
            .map((part) => part.getBoundingClientRect());
          report(
            name,
            Math.min(...rects.map((rect) => rect.left)),
            Math.max(...rects.map((rect) => rect.right)),
          );
        });

      /** Each line of text of each element, without the text that is for screen readers only. */
      const lines = (name: string, selector: string) =>
        all(name, selector).forEach((element) => {
          const rects: DOMRect[] = [];
          const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
          );
          while (walker.nextNode()) {
            const text = walker.currentNode;
            if (text.parentElement?.closest(".sr-only")) continue;
            const range = document.createRange();
            range.selectNodeContents(text);
            rects.push(
              ...[...range.getClientRects()].filter((rect) => rect.width > 0),
            );
          }
          rects.sort((a, b) => a.top - b.top);

          const rows: {
            top: number;
            bottom: number;
            left: number;
            right: number;
          }[] = [];
          for (const rect of rects) {
            const centre = (rect.top + rect.bottom) / 2;
            const line = rows.find(
              (row) => centre >= row.top && centre <= row.bottom,
            );
            if (line) {
              line.left = Math.min(line.left, rect.left);
              line.right = Math.max(line.right, rect.right);
            } else {
              rows.push({
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right,
              });
            }
          }
          rows.forEach((line, index) =>
            report(`${name}, line ${index + 1}`, line.left, line.right),
          );
        });

      box("portrait", "#hero img");
      box("dots of the hero", "#hero .pixel-dots");
      lines("role", "#hero p:has(+ h1)");
      lines("tagline", "#hero h1 + p");
      // Stacked on a phone, side by side from `sm` up: centred as a group.
      row("buttons of the hero", "#hero h1 ~ div");
      for (const id of headings) lines(`#${id}`, `#${id}`);

      // A label is its squares, a gap and its text.
      all("section label", ".section-label").forEach((label) => {
        const range = document.createRange();
        range.selectNodeContents(label);
        const text = range.getBoundingClientRect();
        const squares = parseFloat(getComputedStyle(label, "::before").width);
        const gap = parseFloat(getComputedStyle(label).columnGap);
        report("section label", text.left - gap - squares, text.right);
      });

      row("stats", "#about dl");
      lines("bio", "#about dl + div > p");
      row("profiles of the about section", "#about dl + div > ul");
      lines("heading of the technologies", "#about h3");
      lines("number of projects", "#projects h2 + p");
      row("carousel controls", "[data-js-only]", "button");

      lines("contact text", "#contact h2, #contact p:not(.section-label)");
      box("email", '#contact a[href^="mailto:"]');
      row("profiles of the contact section", "#contact ul");
      box("row of the footer", "footer > div > div");

      if (cards) {
        box("first card", ".carousel-item:first-child");
        lines(
          "text of the first card",
          ".carousel-item:first-child :is(h3, p:not(.flex))",
        );
        row("tags of the first project", ".carousel-item:first-child ul");
      }

      return found;
    },
    { headings, cards },
  );
}

/** Number of lines the text of an element takes. */
async function lineCount(page: Page, selector: string) {
  return page.locator(selector).evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const tops = [...range.getClientRects()].map((rect) =>
      Math.round(rect.top),
    );
    return new Set(tops).size;
  });
}

/** The links and buttons whose touch target is smaller than `TARGET`, with their size. */
async function smallTargets(page: Page) {
  return page.evaluate((minimum) => {
    const found: string[] = [];
    for (const element of document.querySelectorAll<HTMLElement>("a, button")) {
      const style = getComputedStyle(element);
      if (element.offsetParent === null && style.position !== "fixed") continue;
      if (style.visibility === "hidden") continue;
      // The skip link is shown on keyboard focus only.
      if (element.classList.contains("sr-only")) continue;
      // The way into the 8-bit skin is small on purpose.
      if (element.matches("footer button[aria-pressed]")) continue;
      // The link of a card covers the card.
      const target = element.closest(".slide-card") ?? element;
      const { width, height } = target.getBoundingClientRect();
      if (width < minimum - 0.5 || height < minimum - 0.5) {
        const name =
          element.getAttribute("aria-label") ??
          element.textContent?.trim().slice(0, 30);
        found.push(`${name}: ${Math.round(width)}×${Math.round(height)}`);
      }
    }
    return found;
  }, TARGET);
}

test.describe("on a phone", () => {
  test.skip(({ isMobile }) => !isMobile, "the layout of a phone");

  for (const locale of LOCALES) {
    const copy = copyOf(locale);
    const home = homeOf(locale);

    test(`the page is one centred column, ${locale}`, async ({ page }) => {
      for (const width of PHONES) {
        await open(page, home, width);
        await revealAll(page);
        expect(await offCentre(page, HEADINGS, true), `${width} px`).toEqual(
          [],
        );
      }
    });

    for (const skin of SKINS) {
      test(`the name takes two lines and the role at most two, ${skin} skin, ${locale}`, async ({
        page,
      }) => {
        if (skin === "8-bit") await storeSkin(page);
        for (const width of PHONES) {
          await open(page, home, width);
          expect(await lineCount(page, "#hero h1"), `${width} px`).toBe(2);
          expect(
            await lineCount(page, "#hero p:has(+ h1)"),
            `${width} px`,
          ).toBeLessThanOrEqual(2);
        }
      });

      test(`every link and button is a ${TARGET} px touch target, ${skin} skin, ${locale}`, async ({
        page,
      }) => {
        if (skin === "8-bit") await storeSkin(page);
        for (const width of [PHONES[0], PHONES[2]]) {
          await open(page, home, width);
          await revealAll(page);
          expect(await smallTargets(page), `${width} px`).toEqual([]);

          await page.getByRole("button", { name: copy.nav.openMenu }).click();
          await expect(page.locator("#mobile-nav")).toBeVisible();
          expect(await smallTargets(page), `${width} px, menu`).toEqual([]);
        }
      });
    }

    test(`the type is large enough to read, ${locale}`, async ({ page }) => {
      for (const width of [PHONES[0], PHONES[2]]) {
        await open(page, home, width);
        const sizes = await page.evaluate(() => {
          const size = (element: Element) =>
            parseFloat(getComputedStyle(element).fontSize);
          const smallest = (selector: string) =>
            Math.min(...[...document.querySelectorAll(selector)].map(size));

          let floor = Infinity;
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
          );
          while (walker.nextNode()) {
            const parent = walker.currentNode.parentElement;
            if (
              !parent ||
              !walker.currentNode.textContent?.trim() ||
              parent.closest("script, style, noscript") ||
              parent.offsetParent === null
            ) {
              continue;
            }
            floor = Math.min(floor, size(parent));
          }

          return {
            paragraphs: smallest(
              "#hero h1 + p, #about dl + div > p, #contact p:not(.section-label)",
            ),
            cards: smallest(".slide-card p.leading-relaxed"),
            floor,
          };
        });
        expect(sizes.paragraphs, `${width} px`).toBeGreaterThanOrEqual(16);
        expect(sizes.cards, `${width} px`).toBeGreaterThanOrEqual(15);
        expect(sizes.floor, `${width} px`).toBeGreaterThanOrEqual(12);
      }
    });
  }

  test("a tablet in portrait is centred too, with its carousels at the start", async ({
    page,
  }) => {
    await open(page, "/", 768, 1024);
    await revealAll(page);
    expect(await offCentre(page, HEADINGS, false)).toEqual([]);
    // Several cards fit: the first one starts the row instead of sitting in its middle.
    const first = await page
      .locator("#carousel-projects .carousel-item")
      .first()
      .boundingBox();
    expect(first!.x).toBeLessThan(40);
  });

  test("from 1024 px up the column is not centred", async ({ page }) => {
    await open(page, "/", 1024, 768);
    const alignment = await page
      .locator("#hero h1")
      .evaluate((heading) => getComputedStyle(heading).textAlign);
    expect(["start", "left"]).toContain(alignment);
  });

  test.describe("menu", () => {
    const { nav } = DEFAULT_COPY;

    test("fills the screen below the navbar and keeps the page still", async ({
      page,
      browserName,
    }) => {
      await page.goto("/");
      await waitForStack(page);
      await scrollToY(page, 400);
      const button = page.getByRole("button", { name: nav.openMenu });
      await button.click();

      const menu = page.locator("#mobile-nav");
      await expect(menu).toBeVisible();
      const box = (await menu.boundingBox())!;
      const viewport = page.viewportSize()!;
      expect(Math.abs(box.y - (await navbarHeight(page)))).toBeLessThanOrEqual(
        1,
      );
      expect(
        Math.abs(box.y + box.height - viewport.height),
      ).toBeLessThanOrEqual(1);
      expect(box.width).toBe(viewport.width);

      // The page behind it does not scroll and cannot be reached.
      const locked = () =>
        page.evaluate(() => ({
          overflow: getComputedStyle(document.documentElement).overflowY,
          inert: [
            ...document.querySelectorAll<HTMLElement>("main, footer"),
          ].map((element) => element.inert),
        }));
      expect(await locked()).toEqual({
        overflow: "hidden",
        inert: [true, true],
      });
      // Mobile WebKit has no wheel to try it with.
      if (browserName === "chromium") {
        const before = await page.evaluate(() => window.scrollY);
        await page.mouse.move(viewport.width / 2, viewport.height / 2);
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(400);
        expect(await page.evaluate(() => window.scrollY)).toBe(before);
      }

      // The menu and its links fade in; a contrast read while they do is not the final one.
      await expect
        .poll(() =>
          menu.evaluate((element) =>
            [element, ...element.querySelectorAll("li")].every(
              (item) => getComputedStyle(item).opacity === "1",
            ),
          ),
        )
        .toBe(true);
      expect(await violations(page)).toEqual([]);

      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(
        page.getByRole("button", { name: nav.openMenu }),
      ).toBeFocused();
      const unlocked = await locked();
      expect(unlocked.overflow).not.toBe("hidden");
      expect(unlocked.inert).toEqual([false, false]);
    });

    test("holds the language switch and the profiles", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: nav.openMenu }).click();
      const menu = page.locator("#mobile-nav");
      await expect(
        menu.getByRole("list", { name: nav.language }).getByRole("link"),
      ).toHaveCount(LOCALES.length);
      for (const name of ["LinkedIn", "GitHub", "Instagram"]) {
        await expect(
          menu.getByRole("link", { name: DEFAULT_COPY.layout.profileOf(name) }),
        ).toBeVisible();
      }
    });
  });

  test("the back-to-top button shows only while scrolling up", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForStack(page);
    const button = page.getByRole("button", {
      name: DEFAULT_COPY.nav.backToTop,
    });

    for (const y of [200, 600, 1000]) await scrollToY(page, y);
    await expect(button).toBeHidden();

    await scrollToY(page, 900);
    await expect(button).toBeVisible();
    await scrollToY(page, 1200);
    await expect(button).toBeHidden();

    await scrollToY(page, 1100);
    await button.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(button).toBeHidden();
  });
});
