import { expect, test, type Page } from "@playwright/test";
import { defaultLocale } from "../src/app/data/locales";
import {
  DEFAULT_COPY,
  homeOf,
  horizontalOverflow,
  inspectorCopyOf,
  isUnobscured,
  LOCALES,
  pixelCopyOf,
  revealAll,
  scrollToNatural,
  storeSkin,
  waitForStack,
} from "./helpers";

type WithSkinProbe = Window & { skinAtDomContentLoaded?: string };

// How the skin is entered and left does not depend on the language.
const {
  hero: heroCopy,
  marquee: marqueeCopy,
  nav: navCopy,
  skin: skinCopy,
} = DEFAULT_COPY;
const inspectorCopy = inspectorCopyOf(defaultLocale);
const pixelCopy = pixelCopyOf(defaultLocale);

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const html = (page: Page) => page.locator("html");
const navbar = (page: Page) =>
  page.getByRole("navigation", { name: navCopy.label });
/** The hidden way in: the pixel in the footer. */
const pixel = (page: Page) =>
  page.getByRole("contentinfo").getByRole("button", { name: skinCopy.toggle });
/** The way out, displayed in the navbar only inside the skin. */
const exit = (page: Page) =>
  navbar(page).getByRole("button", { name: skinCopy.toggle });
const inspector = (page: Page) =>
  navbar(page).getByRole("button", { name: inspectorCopy.toggle });
/** What a first visit to the skin finds in the place of the Inspector. */
const inspectorLock = (page: Page) =>
  navbar(page).getByRole("button", { name: pixelCopy.inspector.locked });

async function typeCode(page: Page) {
  for (const key of KONAMI) await page.keyboard.press(key);
}

test.describe("8-bit mode", () => {
  test("nothing in the normal skin announces it", async ({ page }) => {
    await page.goto("/");
    await waitForStack(page);
    await expect(html(page)).not.toHaveAttribute("data-skin");

    await expect(exit(page)).toBeHidden();
    await expect(inspector(page)).toBeHidden();
    await expect(inspectorLock(page)).toHaveCount(0);
    await expect(page.locator("#hero").getByRole("button")).toHaveCount(0);
    // The pixel is the only control with the name of the mode.
    await expect(
      page.getByRole("button", { name: skinCopy.toggle }),
    ).toHaveCount(1);
    await expect(pixel(page)).toHaveAttribute("aria-pressed", "false");
  });

  test("the pixel in the footer enters it and the navbar toggle leaves it", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForStack(page);

    await pixel(page).click();
    await expect(html(page)).toHaveAttribute("data-skin", "8bit");
    await expect(pixel(page)).toHaveAttribute("aria-pressed", "true");
    await expect(exit(page)).toHaveAttribute("aria-pressed", "true");
    await expect(inspectorLock(page)).toBeVisible();
    await expect(inspector(page)).toBeHidden();

    // While the skin cross-fades, the view transition is on top of the page; clicking then
    // would make Playwright scroll and retry.
    await expect.poll(() => isUnobscured(exit(page))).toBe(true);
    await exit(page).click();
    await expect(html(page)).not.toHaveAttribute("data-skin");
    await expect(exit(page)).toBeHidden();
    await expect(pixel(page)).toHaveAttribute("aria-pressed", "false");
  });

  test("the Konami code enters it", async ({ page }) => {
    await page.goto("/");
    await waitForStack(page);

    // A wrong start does not spoil the code that follows it.
    await page.keyboard.press("ArrowUp");
    await typeCode(page);
    await expect(html(page)).toHaveAttribute("data-skin", "8bit");
    await expect(exit(page)).toBeVisible();
  });

  test("the Konami code is read with the focus on a checkbox", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForStack(page);

    // A press on the pause of the band leaves the focus on its checkbox in Chromium and in
    // Firefox. It is focused here, so that the three engines are in that state.
    const pause = page.getByRole("checkbox", { name: marqueeCopy.pause });
    await pause.focus();
    await expect(pause).toBeFocused();
    await typeCode(page);
    await expect(html(page)).toHaveAttribute("data-skin", "8bit");
    await expect(pause).not.toBeChecked();
  });

  test("the Konami code is not read from a form field", async ({ page }) => {
    await storeSkin(page);
    await page.goto("/");
    // The stored skin reaches the toggle only once the page has hydrated and is listening.
    await expect(exit(page)).toHaveAttribute("aria-pressed", "true");

    // The site has no form: the field is added for the test.
    await page.evaluate(() =>
      document.body.append(document.createElement("input")),
    );
    const field = page.locator("body > input");
    await field.focus();
    await typeCode(page);
    await field.blur();
    // Had the field let the code through, this second one would switch the skin back on.
    await typeCode(page);
    await expect(html(page)).not.toHaveAttribute("data-skin");
    await expect(exit(page)).toBeHidden();
  });

  test("the choice persists and is applied before the first paint", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForStack(page);
    await pixel(page).click();
    await expect(html(page)).toHaveAttribute("data-skin", "8bit");

    // DOMContentLoaded fires before the client bundle runs: only the inline script in <head>
    // can have set the attribute by then.
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        (window as WithSkinProbe).skinAtDomContentLoaded =
          document.documentElement.dataset.skin;
      });
    });
    await page.reload();
    expect(
      await page.evaluate(
        () => (window as WithSkinProbe).skinAtDomContentLoaded,
      ),
    ).toBe("8bit");
    await waitForStack(page);
    await expect(exit(page)).toHaveAttribute("aria-pressed", "true");
  });

  test("every icon has two drawings and each skin shows one", async ({
    page,
  }) => {
    const drawings = () =>
      page.evaluate(() => {
        const all = (kind: string) =>
          Array.from(
            document.querySelectorAll<SVGElement>(`[data-icon="${kind}"]`),
          );
        const shown = (kind: string) =>
          all(kind).filter((icon) => getComputedStyle(icon).display !== "none")
            .length;
        return {
          vector: shown("vector"),
          pixel: shown("pixel"),
          total: all("pixel").length,
          // The pixel drawing follows the vector one it replaces.
          unpaired: all("vector").filter(
            (icon) =>
              icon.nextElementSibling?.getAttribute("data-icon") !== "pixel",
          ).length,
        };
      });

    await page.goto("/");
    await waitForStack(page);
    const normal = await drawings();
    expect(normal.total).toBeGreaterThan(15);
    expect(normal.unpaired).toBe(0);
    expect(normal.pixel).toBe(0);
    expect(normal.vector).toBe(normal.total);

    await pixel(page).click();
    await expect(html(page)).toHaveAttribute("data-skin", "8bit");
    const skin = await drawings();
    expect(skin.vector).toBe(0);
    expect(skin.pixel).toBe(skin.total);
  });

  test("the 8-bit skin sets every text in the pixel font", async ({ page }) => {
    await storeSkin(page);
    await page.goto("/");
    await waitForStack(page);

    const families = await page.evaluate(() =>
      [
        "body",
        "#hero h1 + p",
        "#about dl + div > p",
        ".slide-card p.leading-relaxed",
        "footer p",
      ].map((selector) => {
        const element = document.querySelector(selector);
        return element ? getComputedStyle(element).fontFamily : selector;
      }),
    );
    for (const family of families) expect(family).toMatch(/^"?pixelify/i);

    // Nothing is smaller than the smallest size of the normal skin.
    const floor = await page.evaluate(() => {
      let smallest = Infinity;
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
        smallest = Math.min(
          smallest,
          parseFloat(getComputedStyle(parent).fontSize),
        );
      }
      return smallest;
    });
    expect(floor).toBeGreaterThanOrEqual(12);
  });

  test("the 8-bit skin shows the sprite, pixelated thumbnails and logos, and the pixel font", async ({
    page,
  }) => {
    await storeSkin(page);
    await page.goto("/");
    await waitForStack(page);

    const portrait = page.getByRole("img", { name: heroCopy.portraitAlt });
    await expect(portrait).toHaveAttribute("src", /\/avatar\/avatar\.png/);
    expect(
      await portrait.evaluate(
        (element) => getComputedStyle(element).imageRendering,
      ),
    ).toBe("pixelated");

    expect(
      await page
        .locator("h1")
        .evaluate((element) => getComputedStyle(element).fontFamily),
    ).toMatch(/pixelify/i);
    await expect
      .poll(() =>
        page.evaluate(() =>
          Array.from(document.fonts).some(
            (font) => /pixelify/i.test(font.family) && font.status === "loaded",
          ),
        ),
      )
      .toBe(true);

    const logos = page.locator("#about [data-marquee] img:visible");
    await scrollToNatural(page.locator("#about [data-marquee]"));
    expect(await logos.count()).toBeGreaterThan(0);
    for (const logo of await logos.all()) {
      await expect(logo).toHaveAttribute("src", /\/tech\/8bit\/[a-z]+\.png/);
      expect(
        await logo.evaluate(
          (element) => getComputedStyle(element).imageRendering,
        ),
      ).toBe("pixelated");
    }

    const region = page.locator("#carousel-projects");
    await scrollToNatural(region);
    const thumbnail = region.getByRole("img").first();
    await expect(thumbnail).toHaveAttribute("src", /\/thumbnails\/8bit\//);
    expect(
      await thumbnail.evaluate(
        (element) => getComputedStyle(element).imageRendering,
      ),
    ).toBe("pixelated");
  });

  test("the normal skin never downloads the 8-bit assets", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));

    await page.goto("/");
    await waitForStack(page);
    await revealAll(page);

    expect(
      requests.filter((url) =>
        /\/avatar\/avatar\.png|\/thumbnails\/8bit\/|\/tech\/8bit\/|\/pixel\//.test(
          url,
        ),
      ),
    ).toEqual([]);
    // Font files have hashed names, so the font is checked through the loading API.
    const pixelFaces = await page.evaluate(async () => {
      await document.fonts.ready;
      return Array.from(document.fonts)
        .filter((font) => /pixelify/i.test(font.family))
        .map((font) => font.status);
    });
    expect(pixelFaces.length).toBeGreaterThan(0);
    expect(pixelFaces.every((status) => status === "unloaded")).toBe(true);
  });

  for (const locale of LOCALES) {
    test(`the 8-bit skin fits a 320 px wide screen, ${locale}`, async ({
      page,
    }) => {
      await storeSkin(page);
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(homeOf(locale));
      await page.evaluate(() => document.fonts.ready);
      expect(await horizontalOverflow(page)).toEqual({
        overflow: 0,
        clipped: [],
      });
    });
  }
});
