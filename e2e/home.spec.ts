import { expect, test } from "@playwright/test";
import { heroCopy, navCopy } from "../src/app/data/site";
import { SECTION_IDS } from "./helpers";

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders a single h1 and every section", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(heroCopy.heading);
    for (const id of SECTION_IDS) {
      await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(1);
    }
  });

  test("hero shows the portrait", async ({ page }) => {
    const portrait = page.getByRole("img", { name: heroCopy.portraitAlt });
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
      .getByRole("navigation", { name: navCopy.label })
      .getByRole("link", { name: "Contato" })
      .click();
    await expect(page).toHaveURL(/#contato$/);
    await expect(page.locator("#contato-heading")).toBeInViewport();
  });

  test("mobile menu opens, navigates and closes", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "mobile menu only");
    await page.getByRole("button", { name: navCopy.openMenu }).click();
    const menu = page.locator("#mobile-nav");
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Projetos" }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#projetos$/);
    await expect(page.locator("#projetos-heading")).toBeInViewport();
  });
});
