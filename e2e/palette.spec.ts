import { expect, test } from "@playwright/test";
import { contrastRatio } from "../src/lib/contrast";
import { palettePairs } from "../src/lib/palette-contract";

const variables = [
  ...new Set(
    palettePairs.flatMap((pair) => [pair.foreground, pair.background]),
  ),
];

test.describe("palette contract", () => {
  // The ratios depend on the stylesheet, not on the engine.
  test.skip(
    ({ browserName, isMobile }) => browserName !== "chromium" || isMobile,
    "computed once, in desktop Chromium",
  );

  for (const [theme, skin] of [
    ["light", "normal"],
    ["dark", "normal"],
    ["light", "8-bit"],
    ["dark", "8-bit"],
  ] as const) {
    test(`every pair meets its minimum in the ${theme} theme and the ${skin} skin`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: theme });
      if (skin === "8-bit") {
        await page.addInitScript(() => localStorage.setItem("skin", "8bit"));
      }
      await page.goto("/");
      const values = await page.evaluate((names) => {
        const style = getComputedStyle(document.documentElement);
        return Object.fromEntries(
          names.map((name) => [name, style.getPropertyValue(name).trim()]),
        );
      }, variables);

      for (const pair of palettePairs) {
        const ratio = contrastRatio(
          values[pair.foreground],
          values[pair.background],
        );
        expect(
          ratio,
          `${pair.foreground} on ${pair.background} is ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(pair.minimum);
      }
    });
  }
});
