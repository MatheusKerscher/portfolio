import { expect, test, type Page } from "@playwright/test";
import { navCopy } from "../src/app/data/site";
import {
  isUnobscured,
  revealAll,
  scrollToNatural,
  scrollToY,
  SECTION_IDS,
  waitForStack,
} from "./helpers";

/** Every panel but the last pins; each one is paired with the panel that covers it. */
const PAIRS = SECTION_IDS.slice(0, -1).map(
  (id, index) => [id, SECTION_IDS[index + 1]] as const,
);

async function geometry(page: Page, current: string, next: string) {
  return page.evaluate(
    ([currentId, nextId]) => {
      // `100svh` is what the stylesheet pins against; measure it instead of assuming it.
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;top:0;width:0;height:100svh;visibility:hidden";
      document.body.append(probe);
      const smallViewport = probe.getBoundingClientRect().height;
      probe.remove();

      const panel = document.querySelector(`#${currentId} [data-stack-panel]`)!;
      const nextSlot = document.querySelector(`#${nextId}`)!;
      const nextPanel = nextSlot.querySelector("[data-stack-panel]")!;
      return {
        smallViewport,
        panelBottom: panel.getBoundingClientRect().bottom,
        nextTop: nextPanel.getBoundingClientRect().top,
        // The slot is never sticky, so this is where the next panel sits in normal flow.
        nextNaturalTop: nextSlot.getBoundingClientRect().top + window.scrollY,
      };
    },
    [current, next] as const,
  );
}

/** Scrolls to the middle of the overlap: the next panel covers half of the viewport. */
async function scrollToHalfOverlap(page: Page, current: string, next: string) {
  const { nextNaturalTop, smallViewport } = await geometry(page, current, next);
  await scrollToY(page, nextNaturalTop - smallViewport / 2);
  return geometry(page, current, next);
}

test.describe("stacked sections", () => {
  test("each panel pins while the next one covers it", async ({ page }) => {
    await page.goto("/");
    await waitForStack(page);

    for (const [current, next] of PAIRS) {
      const during = await scrollToHalfOverlap(page, current, next);
      expect(
        Math.abs(during.panelBottom - during.smallViewport),
        `#${current} stays pinned to the bottom of the viewport`,
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(during.nextTop - during.smallViewport / 2),
        `#${next} is halfway up`,
      ).toBeLessThanOrEqual(1);

      const covering = await page.evaluate(
        ([nextId, y]) => {
          const hit = document.elementFromPoint(window.innerWidth / 2, y);
          return !!hit && document.querySelector(`#${nextId}`)!.contains(hit);
        },
        [next, during.nextTop + 24] as const,
      );
      expect(covering, `#${next} is painted over #${current}`).toBe(true);
    }
  });

  test("panels do not pin under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await waitForStack(page);

    for (const [current, next] of PAIRS) {
      const during = await scrollToHalfOverlap(page, current, next);
      // In normal flow a panel ends exactly where the next one starts.
      expect(
        Math.abs(during.panelBottom - during.nextTop),
        `#${current} scrolls with the page`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("panels do not pin", async ({ page }) => {
      await page.goto("/");

      for (const [current, next] of PAIRS) {
        const during = await scrollToHalfOverlap(page, current, next);
        expect(
          Math.abs(during.panelBottom - during.nextTop),
          `#${current} scrolls with the page`,
        ).toBeLessThanOrEqual(1);
      }
    });
  });

  test("keyboard focus is never obscured", async ({ page }) => {
    await page.goto("/");
    await waitForStack(page);
    await revealAll(page);

    const focusable = await page
      .locator("a[href], button, [tabindex='0']")
      .count();
    const obscured: string[] = [];

    for (const key of ["Tab", "Shift+Tab"]) {
      for (let step = 0; step < focusable + 2; step += 1) {
        await page.keyboard.press(key);
        // The browser scrolls to the element, then StackController corrects on the next frame.
        await page.waitForTimeout(150);
        const problem = await page.evaluate(() => {
          const element = document.activeElement;
          if (!element || element === document.body) return null;
          const rect = element.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          const top = document.elementFromPoint(x, y);
          if (top && (element === top || element.contains(top))) return null;
          const name =
            element.getAttribute("aria-label") ??
            element.textContent?.trim().slice(0, 40);
          return `${element.tagName.toLowerCase()} "${name}" at ${Math.round(x)},${Math.round(y)}`;
        });
        if (problem) obscured.push(`${key}: ${problem}`);
      }
    }

    expect(obscured).toEqual([]);
  });

  test("an in-page link lands on its panel when it is above", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    await waitForStack(page);
    await scrollToY(page, 1_000_000);

    if (isMobile) {
      await page.getByRole("button", { name: navCopy.openMenu }).click();
      await page
        .locator("#mobile-nav")
        .getByRole("link", { name: "Projetos" })
        .click();
    } else {
      await page
        .getByRole("navigation", { name: navCopy.label })
        .getByRole("link", { name: "Projetos" })
        .click();
    }

    await expect(page).toHaveURL(/#projetos$/);
    await expect
      .poll(() => isUnobscured(page.locator("#projetos-heading")))
      .toBe(true);
  });

  test("a direct load of a fragment lands on its panel", async ({ page }) => {
    await page.goto("/#curriculo");
    await waitForStack(page);
    await expect
      .poll(() => isUnobscured(page.locator("#curriculo-heading")))
      .toBe(true);
  });

  test.describe("on a small viewport", () => {
    test.use({ viewport: { width: 390, height: 667 } });

    test("every heading, link and button can be reached un-obscured", async ({
      page,
    }) => {
      await page.goto("/");
      await waitForStack(page);
      await revealAll(page);

      const targets = page.locator(
        "[data-stack-panel] :is(h1, h2, h3, a, button)",
      );
      const total = await targets.count();
      expect(total).toBeGreaterThan(20);

      const cut: string[] = [];
      for (let index = 0; index < total; index += 1) {
        const target = targets.nth(index);
        await scrollToNatural(target);
        if (!(await isUnobscured(target))) {
          cut.push((await target.textContent())?.trim().slice(0, 40) ?? "");
        }
      }
      expect(cut).toEqual([]);
    });

    test("the page does not scroll sideways at 320 px", async ({ page }) => {
      for (const path of ["/", "/email-signature"]) {
        await page.setViewportSize({ width: 320, height: 640 });
        await page.goto(path);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow, path).toBeLessThanOrEqual(0);

        // Nothing is clipped at the right edge either, apart from content that scrolls sideways
        // on purpose (carousels, the signature preview).
        const clipped = await page.evaluate(() => {
          const width = document.documentElement.clientWidth;
          const scrollsSideways = (element: Element) => {
            for (
              let node = element.parentElement;
              node;
              node = node.parentElement
            ) {
              if (getComputedStyle(node).overflowX === "auto") return true;
            }
            return false;
          };
          return Array.from(
            document.querySelectorAll("main *, footer *, nav *"),
          )
            .filter(
              (element) =>
                element.getBoundingClientRect().right > width + 1 &&
                !scrollsSideways(element),
            )
            .map((element) => element.tagName.toLowerCase());
        });
        expect(clipped, path).toEqual([]);
      }
    });
  });
});
