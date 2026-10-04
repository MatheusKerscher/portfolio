import { expect, test } from "@playwright/test";
import { revealAll, storeSkin, violations } from "./helpers";

const ROUTES = ["/"];
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

  test("reduced motion keeps the content visible and the scroll cue still", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await revealAll(page);
    await expect(page.locator("#sobre-heading")).toBeVisible();
    expect(
      await page
        .locator(".scroll-cue")
        .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe("none");
  });
});
