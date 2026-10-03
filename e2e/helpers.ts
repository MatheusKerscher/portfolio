import type { Page } from "@playwright/test";

export const SECTION_IDS = [
  "hero",
  "sobre",
  "projetos",
  "curriculo",
  "contato",
] as const;

/** Scrolls through the page so every scroll-triggered reveal has played. */
export async function revealAll(page: Page) {
  await page.evaluate(async () => {
    for (
      let y = 0;
      y < document.body.scrollHeight;
      y += window.innerHeight / 2
    ) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}

export async function readJsonLd(page: Page) {
  const raw = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  return JSON.parse(raw ?? "{}") as {
    "@graph": Array<Record<string, unknown>>;
  };
}
