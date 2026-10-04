import { expect, test } from "@playwright/test";
import { headingId } from "../src/app/data/site";
import { defaultLocale } from "../src/app/data/locales";
import {
  homeOf,
  LOCALES,
  pixelCopyOf,
  revealAll,
  storeSkin,
  violations,
} from "./helpers";

const ROUTES = LOCALES.map(homeOf);
const THEMES = ["light", "dark"] as const;
const SKINS = ["normal", "8-bit"] as const;

test.describe("accessibility", () => {
  for (const route of ROUTES) {
    for (const theme of THEMES) {
      for (const skin of SKINS) {
        test(`${route} in the ${theme} theme and the ${skin} skin has no axe violations`, async ({
          page,
          browserName,
          isMobile,
        }) => {
          // The tokens are the same for every engine; the others check the default mode.
          test.skip(
            (browserName !== "chromium" || isMobile) &&
              (theme !== "light" || skin !== "normal"),
            "the full theme and skin matrix runs in desktop Chromium",
          );
          await page.emulateMedia({ colorScheme: theme });
          if (skin === "8-bit") await storeSkin(page);
          await page.goto(route);
          await revealAll(page);
          expect(await violations(page)).toEqual([]);
        });
      }
    }
  }

  for (const theme of THEMES) {
    test(`the PAUSE menu and the locked Inspector of the 8-bit skin have no axe violations in the ${theme} theme`, async ({
      page,
      browserName,
      isMobile,
    }) => {
      test.skip(
        browserName !== "chromium" || isMobile,
        "the tokens are the same for every engine",
      );
      const copy = pixelCopyOf(defaultLocale);
      await page.emulateMedia({ colorScheme: theme });
      await storeSkin(page);
      await page.goto("/");
      // The lock is in the navbar, and a press on it puts its hint among the notices.
      await page.getByRole("button", { name: copy.inspector.locked }).click();
      await expect(page.locator(".px-toasts")).toContainText(
        copy.inspector.hint,
      );
      await page.getByRole("button", { name: copy.pause.open }).click();
      await expect(page.locator("#pause-menu")).toBeVisible();
      // A notice that is still dropping in is read in the middle of its way.
      await expect(page.locator(".px-toast")).toHaveCount(2);
      await page.waitForTimeout(500);
      expect(await violations(page)).toEqual([]);
    });
  }

  test("reduced motion keeps the content visible and the scroll cue still", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await revealAll(page);
    await expect(page.locator(`#${headingId("about")}`)).toBeVisible();
    expect(
      await page
        .locator(".scroll-cue")
        .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe("none");
  });
});
