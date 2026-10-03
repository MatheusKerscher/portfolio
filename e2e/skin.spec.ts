import { expect, test, type Page } from "@playwright/test";
import { heroCopy, signaturePage, skinCopy } from "../src/app/data/site";
import {
  horizontalOverflow,
  isUnobscured,
  revealAll,
  scrollToNatural,
  waitForStack,
} from "./helpers";

type WithSkinProbe = Window & { skinAtDomContentLoaded?: string };

const toggles = (page: Page) =>
  page.getByRole("button", { name: skinCopy.toggle });

/** Starts the next navigation with the 8-bit skin already stored, as for a returning visitor. */
const storeSkin = (page: Page) =>
  page.addInitScript(() => localStorage.setItem("skin", "8bit"));

test.describe("8-bit mode", () => {
  test("both toggles switch the skin and stay in step", async ({ page }) => {
    await page.goto("/");
    await waitForStack(page);
    await expect(toggles(page)).toHaveCount(2);
    await expect(page.locator("html")).not.toHaveAttribute("data-skin");
    for (const index of [0, 1]) {
      await expect(toggles(page).nth(index)).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    }

    // The mini sprite in the navbar.
    await toggles(page).first().click();
    await expect(page.locator("html")).toHaveAttribute("data-skin", "8bit");
    for (const index of [0, 1]) {
      await expect(toggles(page).nth(index)).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    }

    // The chip on the portrait. While the skin cross-fades, the view transition is on top of
    // the page; clicking then would make Playwright scroll, and a scrolled hero is covered.
    await expect.poll(() => isUnobscured(toggles(page).nth(1))).toBe(true);
    await toggles(page).nth(1).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-skin");
    for (const index of [0, 1]) {
      await expect(toggles(page).nth(index)).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    }
  });

  test("the choice persists and is applied before the first paint", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForStack(page);
    await toggles(page).first().click();
    await expect(page.locator("html")).toHaveAttribute("data-skin", "8bit");

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
    await expect(toggles(page).first()).toHaveAttribute("aria-pressed", "true");
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

    const region = page.locator("#carrossel-projetos");
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

  test("the 8-bit skin fits a 320 px wide screen", async ({ page }) => {
    await storeSkin(page);
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of ["/", signaturePage.path]) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      expect(await horizontalOverflow(page), path).toEqual({
        overflow: 0,
        clipped: [],
      });
    }
  });
});
