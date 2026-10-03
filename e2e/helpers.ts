import type { Page } from "@playwright/test";

export const SITE_URL = "https://kerscher.dev.br";

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
