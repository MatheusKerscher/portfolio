import { expect, test } from "@playwright/test";
import { SECTION_IDS } from "./helpers";

test.describe("home page", () => {
  test("renders a single h1 and every section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(/MATHEUS\s*KERSCHER/);
    for (const id of SECTION_IDS) {
      await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(1);
    }
  });
});

test.describe("email signature page", () => {
  test("renders its heading and the preview", async ({ page }) => {
    await page.goto("/email-signature");
    await expect(page.locator("h1")).toHaveText(
      "Gerador de assinatura de email",
    );
    await expect(
      page.getByRole("button", { name: "Copiar assinatura" }),
    ).toBeVisible();
  });
});
