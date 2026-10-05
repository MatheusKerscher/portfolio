import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Locale } from "../src/app/data/locales";
import { site } from "../src/app/data/site";
import { palettePairs } from "../src/lib/palette-contract";
import {
  copyOf,
  homeOf,
  inspectorCopyOf,
  LOCALES,
  storeSkin,
  unlockInspector,
  violations,
  waitForStack,
} from "./helpers";

// Read from disk: a JSON module would need an import attribute in the test runner.
const audit = JSON.parse(readFileSync("src/app/data/audit.json", "utf8")) as {
  commit: string;
  mobile: { performance: number };
};

const panel = (page: Page) => page.locator("#inspector-panel");

function suite(locale: Locale) {
  const copy = inspectorCopyOf(locale);
  const { meta, nav: navCopy, skin: skinCopy } = copyOf(locale);
  const home = homeOf(locale);
  const pageUrl = `${site.url}${home === "/" ? "" : home}`;
  const toggle = (page: Page) =>
    page.getByRole("button", { name: copy.toggle });

  /**
   * The Inspector is reachable only inside the 8-bit skin, once it is unlocked. How it is locked
   * and unlocked is checked by the `juice` suite.
   */
  async function open(page: Page) {
    await storeSkin(page);
    await unlockInspector(page);
    await page.goto(home);
    await waitForStack(page);
    await toggle(page).click();
    await expect(panel(page)).toBeVisible();
  }

  test.describe(`Inspector mode, ${locale}`, () => {
    test("it exists only inside the 8-bit skin", async ({ page }) => {
      await page.goto(home);
      await waitForStack(page);
      await expect(toggle(page)).toBeHidden();

      await open(page);
      await page
        .getByRole("navigation", { name: navCopy.label })
        .getByRole("button", { name: skinCopy.toggle })
        .click();
      await expect(page.locator("html")).not.toHaveAttribute("data-skin");
      await expect(panel(page)).toHaveCount(0);
      await expect(toggle(page)).toBeHidden();
    });

    test("its code is fetched only when it is opened", async ({ page }) => {
      const scripts: string[] = [];
      page.on("request", (request) => {
        if (request.resourceType() === "script") scripts.push(request.url());
      });

      await storeSkin(page);
      await unlockInspector(page);
      await page.goto(home);
      await waitForStack(page);
      await page.waitForLoadState("networkidle");
      await expect(panel(page)).toHaveCount(0);
      const before = scripts.length;

      await toggle(page).click();
      await expect(panel(page)).toBeVisible();
      expect(scripts.length).toBeGreaterThan(before);
    });

    test("it is a labelled dialog with four tabs", async ({ page }) => {
      await open(page);
      await expect(
        page.getByRole("dialog", { name: copy.title }),
      ).toBeVisible();
      await expect(toggle(page)).toHaveAttribute("aria-expanded", "true");

      const tabs = panel(page).getByRole("tab");
      await expect(tabs).toHaveCount(4);
      for (const name of Object.values(copy.tabs)) {
        await panel(page).getByRole("tab", { name }).click();
        await expect(panel(page).getByRole("tabpanel")).toBeVisible();
      }
    });

    test("the Performance tab shows what the browser measured", async ({
      page,
      browserName,
    }) => {
      await open(page);

      // A row holds a measured value, a note that it is still waiting, or says the browser cannot
      // report it. It never holds a number the browser did not produce.
      for (const row of await panel(page).locator("[data-vital]").all()) {
        const supported = (await row.getAttribute("data-supported")) === "true";
        const value = row.locator("[data-value]");
        if (supported) {
          await expect(value).toHaveText(
            new RegExp(
              `\\d|${copy.vitals.waiting}|${copy.vitals.waitingForInput}`,
            ),
          );
        } else {
          await expect(value).toHaveText(copy.vitals.unsupported);
        }
      }
      if (browserName === "chromium") {
        await expect(
          panel(page).locator('[data-vital="LCP"] [data-value]'),
        ).toHaveText(/^\d+(\.\d+)? (ms|s)$/);
      }

      await expect(panel(page).locator("[data-weight]")).toHaveText(
        new RegExp(`\\d+ ${copy.weight.requests}|${copy.weight.cached}`),
      );

      // The lab scores are the ones the audit script wrote.
      const lab = panel(page).locator("[data-lab] tbody tr");
      await expect(lab).toHaveCount(4);
      await expect(lab.first()).toContainText(String(audit.mobile.performance));
      await expect(panel(page)).toContainText(audit.commit);
    });

    test("the Accessibility tab lists every palette pair and draws overlays", async ({
      page,
    }) => {
      await open(page);
      await panel(page)
        .getByRole("tab", { name: copy.tabs.accessibility })
        .click();

      const pairs = panel(page).locator("[data-contrast] li");
      await expect(pairs).toHaveCount(palettePairs.length);
      await expect(
        panel(page).locator('[data-contrast] li[data-pass="false"]'),
      ).toHaveCount(0);

      const landmarks = page.locator('[data-overlay="landmarks"]');
      await expect(landmarks).toHaveCount(0);
      const button = panel(page).getByRole("button", {
        name: copy.overlays.landmarks,
      });
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");

      // At the top of the page the navbar, `main` and the hero are on screen.
      await expect.poll(() => landmarks.count()).toBeGreaterThanOrEqual(3);
      const labels = await landmarks.allTextContents();
      expect(labels.some((label) => label.startsWith("navigation"))).toBe(true);
      expect(labels).toContain("main");

      await button.click();
      await expect(landmarks).toHaveCount(0);
    });

    test("the SEO tab reads the page and the Code tab the repository", async ({
      page,
    }) => {
      await open(page);
      await panel(page).getByRole("tab", { name: copy.tabs.seo }).click();
      await expect(panel(page).locator('[data-field="title"]')).toHaveText(
        meta.title,
      );
      await expect(panel(page).locator('[data-field="canonical"]')).toHaveText(
        pageUrl,
      );
      await expect(panel(page).locator("[data-structured] li")).toHaveCount(4);

      await panel(page).getByRole("tab", { name: copy.tabs.code }).click();
      await expect(
        panel(page).getByRole("link", { name: /github\.com/ }),
      ).toHaveAttribute("href", site.repository);
    });

    test("Escape closes it and returns focus to the toggle", async ({
      page,
    }) => {
      await open(page);
      await page.keyboard.press("Escape");
      await expect(panel(page)).toHaveCount(0);
      await expect(toggle(page)).toBeFocused();
      await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
    });

    for (const theme of ["light", "dark"] as const) {
      test(`it has no axe violations in the ${theme} theme`, async ({
        page,
        browserName,
        isMobile,
      }) => {
        test.skip(
          browserName !== "chromium" || isMobile,
          "the palette is the same for every engine",
        );
        await page.emulateMedia({ colorScheme: theme });
        await open(page);
        for (const name of Object.values(copy.tabs)) {
          await panel(page).getByRole("tab", { name }).click();
          expect(await violations(page), name).toEqual([]);
        }
      });
    }
  });
}

for (const locale of LOCALES) suite(locale);
