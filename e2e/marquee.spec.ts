import { expect, test, type Page } from "@playwright/test";
import { technologies } from "../src/app/data/site";
import {
  copyOf,
  homeOf,
  LOCALES,
  scrollToNatural,
  waitForStack,
} from "./helpers";

const NAMES = technologies.map((technology) => technology.name);

/** Whether the strip is moving, and by which animation. */
const motion = (page: Page) =>
  page.locator(".marquee-track").evaluate((track) => {
    const style = getComputedStyle(track);
    return { name: style.animationName, state: style.animationPlayState };
  });

/** How far the strip has moved, in CSS pixels. */
const offset = (page: Page) =>
  page
    .locator(".marquee-track")
    .evaluate((track) => new DOMMatrix(getComputedStyle(track).transform).m41);

for (const locale of LOCALES) {
  const copy = copyOf(locale);
  const home = homeOf(locale);
  const bandOf = (page: Page) =>
    page.getByRole("region", { name: copy.about.technologies });
  const pauseOf = (page: Page) =>
    page.getByRole("checkbox", { name: copy.marquee.pause });

  test.describe(`band of technologies, ${locale}`, () => {
    test("names every technology once to assistive technology", async ({
      page,
    }) => {
      await page.goto(home);
      const band = bandOf(page);
      // The second copy, which makes the loop, is in the page and hidden from the tree.
      await expect(band.locator("ul")).toHaveCount(2);
      await expect(band.locator('ul[aria-hidden="true"]')).toHaveCount(1);
      await expect(band.getByRole("listitem")).toHaveText(NAMES);
    });

    test("moves on its own, in a loop of exactly one copy", async ({
      page,
    }) => {
      await page.goto(home);
      await waitForStack(page);
      await scrollToNatural(bandOf(page));
      expect(await motion(page)).toEqual({ name: "marquee", state: "running" });

      const before = await offset(page);
      await expect.poll(() => offset(page)).toBeLessThan(before);

      // The animation shifts the strip by half of its width: that has to be one copy.
      const widths = await bandOf(page).evaluate((band) => ({
        track: band.querySelector(".marquee-track")!.getBoundingClientRect()
          .width,
        copies: [...band.querySelectorAll("ul")].map(
          (list) => list.getBoundingClientRect().width,
        ),
      }));
      expect(widths.copies[0]).toBeCloseTo(widths.copies[1], 1);
      expect(widths.track).toBeCloseTo(2 * widths.copies[0], 1);
    });

    test("the control stops it and starts it again", async ({ page }) => {
      await page.goto(home);
      await waitForStack(page);
      await scrollToNatural(bandOf(page));
      const control = page.locator(".marquee-pause");

      await control.click();
      await expect(pauseOf(page)).toBeChecked();
      // Away from the band, so the pointer is not what holds it.
      await page.mouse.move(0, 0);
      expect((await motion(page)).state).toBe("paused");
      // It comes to rest and stays there. On a busy runner WebKit moved the band 1.9 px more
      // after its state read paused, so the first reading is not taken as the resting place.
      await expect
        .poll(async () => {
          const before = await offset(page);
          await page.waitForTimeout(300);
          return (await offset(page)) === before;
        })
        .toBe(true);

      // From the keyboard: the checkbox is focusable, and Space toggles it.
      await pauseOf(page).focus();
      await page.keyboard.press("Space");
      await expect(pauseOf(page)).not.toBeChecked();
      expect((await motion(page)).state).toBe("running");
    });

    test("a pointer over it stops it", async ({ page, isMobile }) => {
      test.skip(isMobile, "a touch screen has no hover");
      await page.goto(home);
      await waitForStack(page);
      const band = bandOf(page);
      await scrollToNatural(band);

      await band.hover();
      expect((await motion(page)).state).toBe("paused");
      await page.mouse.move(0, 0);
      expect((await motion(page)).state).toBe("running");
    });

    test("with reduced motion nothing moves and every technology is on screen", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(home);
      const band = bandOf(page);
      await band.scrollIntoViewIfNeeded();

      expect((await motion(page)).name).toBe("none");
      // Nothing to pause.
      await expect(page.locator(".marquee-pause")).toBeHidden();
      await expect(band.locator('ul[aria-hidden="true"]')).toBeHidden();

      const cut = await band.evaluate((region) => {
        const width = document.documentElement.clientWidth;
        return [...region.querySelectorAll("ul:not([aria-hidden]) > li")]
          .filter((item) => {
            const rect = item.getBoundingClientRect();
            return rect.left < 0 || rect.right > width || rect.width === 0;
          })
          .map((item) => item.textContent);
      });
      expect(cut).toEqual([]);
      await expect(band.getByRole("listitem")).toHaveText(NAMES);
    });

    test.describe("without JavaScript", () => {
      test.use({ javaScriptEnabled: false });

      test("it moves, and the control still stops it", async ({ page }) => {
        await page.goto(home);
        await bandOf(page).scrollIntoViewIfNeeded();
        expect(await motion(page)).toEqual({
          name: "marquee",
          state: "running",
        });

        await page.locator(".marquee-pause").click();
        await page.mouse.move(0, 0);
        expect((await motion(page)).state).toBe("paused");
      });
    });
  });
}
