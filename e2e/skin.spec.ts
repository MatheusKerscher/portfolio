import { expect, test, type Page } from "@playwright/test";
import { defaultLocale } from "../src/app/data/locales";
import {
  DEFAULT_COPY,
  homeOf,
  horizontalOverflow,
  inspectorCopyOf,
  isUnobscured,
  LOCALES,
  revealAll,
  scrollToNatural,
  storeSkin,
  waitForStack,
} from "./helpers";

type WithSkinProbe = Window & { skinAtDomContentLoaded?: string };

// How the skin is entered and left does not depend on the language.
const { hero: heroCopy, nav: navCopy, skin: skinCopy } = DEFAULT_COPY;
const inspectorCopy = inspectorCopyOf(defaultLocale);

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
    await expect(inspector(page)).toBeVisible();

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

  test("the 8-bit skin shows the sprite, pixelated thumbnails and the pixel font", async ({
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
        /\/avatar\/avatar\.png|\/thumbnails\/8bit\//.test(url),
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
