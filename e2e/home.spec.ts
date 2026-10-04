import { expect, test } from "@playwright/test";
import { headingId, sections, site } from "../src/app/data/site";
import { copyOf, homeOf, LOCALES, SECTION_IDS } from "./helpers";

for (const locale of LOCALES) {
  const copy = copyOf(locale);

  test.describe(`home page, ${locale}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(homeOf(locale));
    });

    test("renders a single h1 and every section", async ({ page }) => {
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(site.heading);
      for (const id of SECTION_IDS) {
        await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(1);
      }
    });

    test("hero shows the portrait", async ({ page }) => {
      const portrait = page.getByRole("img", { name: copy.hero.portraitAlt });
      await expect(portrait).toBeVisible();
      await expect
        .poll(() =>
          portrait.evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);
    });

    test("desktop nav links scroll to their section", async ({
      page,
      isMobile,
    }) => {
      test.skip(isMobile, "desktop navigation only");
      await page
        .getByRole("navigation", { name: copy.nav.label })
        .getByRole("link", { name: copy.nav.links.contact })
        .click();
      await expect(page).toHaveURL(new RegExp(`#${sections.contact}$`));
      await expect(page.locator(`#${headingId("contact")}`)).toBeInViewport();
    });

    test("mobile menu opens, navigates and closes", async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile, "mobile menu only");
      await page.getByRole("button", { name: copy.nav.openMenu }).click();
      const menu = page.locator("#mobile-nav");
      await expect(menu).toBeVisible();
      await menu.getByRole("link", { name: copy.nav.links.projects }).click();
      await expect(menu).toBeHidden();
      await expect(page).toHaveURL(new RegExp(`#${sections.projects}$`));
      await expect(page.locator(`#${headingId("projects")}`)).toBeInViewport();
    });
  });
}
