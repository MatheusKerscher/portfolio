import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { revealAll } from "./helpers";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const ROUTES = ["/", "/email-signature"];
const THEMES = ["light", "dark"] as const;

export async function violations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
  );
}

test.describe("accessibility", () => {
  for (const route of ROUTES) {
    for (const theme of THEMES) {
      test(`${route} in the ${theme} theme has no axe violations`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(route);
        await revealAll(page);
        expect(await violations(page)).toEqual([]);
      });
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
