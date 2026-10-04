import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** The axe violations of the page as it is now, one line per rule. */
export async function violations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
  );
}

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

/** Waits until StackController has measured every panel, which is what lets them pin. */
export async function waitForStack(page: Page) {
  await page.waitForFunction(() => {
    const panels = Array.from(
      document.querySelectorAll<HTMLElement>("[data-stack-panel]"),
    );
    return (
      panels.length > 0 &&
      panels.every((panel) => panel.style.getPropertyValue("--panel-h") !== "")
    );
  });
}

/** Height of the fixed navbar, which the stacked sections are laid out below. */
export async function navbarHeight(page: Page) {
  return page
    .locator("[data-nav-bar]")
    .evaluate((bar) => bar.getBoundingClientRect().height);
}

/** Starts the next navigation with the 8-bit skin already stored, as for a returning visitor. */
export const storeSkin = (page: Page) =>
  page.addInitScript(() => localStorage.setItem("skin", "8bit"));

/** Jumps to a scroll position and gives layout a moment to settle. */
export async function scrollToY(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(120);
}

/**
 * Scrolls to where an element inside a panel is visible in normal flow: before its panel pins
 * and the next one starts to cover it. A slide is first brought into its carousel.
 */
export async function scrollToNatural(locator: Locator) {
  await locator.evaluate((element) => {
    const panel = element.closest<HTMLElement>("[data-stack-panel]");
    const slot = panel?.parentElement;
    if (!panel || !slot) return;

    const item = element.closest<HTMLElement>(".carousel-item");
    const region = element.closest<HTMLElement>("[data-carousel]");
    if (item && region && element !== region) {
      const first = region.querySelector<HTMLElement>(".carousel-item");
      region.scrollLeft = item.offsetLeft - (first?.offsetLeft ?? 0);
    }

    const navbar =
      document.querySelector("[data-nav-bar]")?.getBoundingClientRect()
        .height ?? 0;
    const slotTop = slot.getBoundingClientRect().top + window.scrollY;
    const offset =
      element.getBoundingClientRect().top - panel.getBoundingClientRect().top;
    const lastUnpinned = slotTop + panel.offsetHeight - window.innerHeight;
    window.scrollTo(
      0,
      Math.max(
        slotTop - navbar,
        Math.min(slotTop + offset - navbar - 16, lastUnpinned),
      ),
    );
  });
  await locator.page().waitForTimeout(120);
}

/** Whether the centre of the element is inside the viewport and nothing is painted over it. */
export async function isUnobscured(locator: Locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    if (x < 0 || x >= window.innerWidth || y < 0 || y >= window.innerHeight) {
      return false;
    }
    const top = document.elementFromPoint(x, y);
    return !!top && (element === top || element.contains(top));
  });
}

/**
 * How far the page scrolls sideways, and which elements stick out past the right edge without
 * being inside something that scrolls sideways on purpose (a carousel).
 */
export async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const scrollsSideways = (element: Element) => {
      for (let node = element.parentElement; node; node = node.parentElement) {
        if (getComputedStyle(node).overflowX === "auto") return true;
      }
      return false;
    };
    return {
      overflow: Math.max(0, document.documentElement.scrollWidth - width),
      clipped: Array.from(document.querySelectorAll("main *, footer *, nav *"))
        .filter(
          (element) =>
            element.getBoundingClientRect().right > width + 1 &&
            !scrollsSideways(element),
        )
        .map((element) => element.tagName.toLowerCase()),
    };
  });
}
