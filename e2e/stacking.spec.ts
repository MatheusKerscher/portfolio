import { expect, test, type Page } from "@playwright/test";
import { headingId, sections } from "../src/app/data/site";
import {
  DEFAULT_COPY,
  homeOf,
  horizontalOverflow,
  isUnobscured,
  LOCALES,
  navbarHeight,
  revealAll,
  scrollToNatural,
  scrollToY,
  SECTION_IDS,
  storeSkin,
  waitForStack,
} from "./helpers";

// How the panels pin does not depend on the language; whether they fit does.
const navCopy = DEFAULT_COPY.nav;

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

/** Where the panel of a slot is on screen, and where its slot sits in normal flow. */
async function panelBox(page: Page, id: string) {
  return page.evaluate((slotId) => {
    const slot = document.querySelector(`#${slotId}`)!;
    const rect = slot
      .querySelector("[data-stack-panel]")!
      .getBoundingClientRect();
    return {
      top: rect.top,
      height: rect.height,
      naturalTop: slot.getBoundingClientRect().top + window.scrollY,
      viewport: window.innerHeight,
    };
  }, id);
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

  test("no panel goes behind the navbar", async ({ page }) => {
    await page.goto("/");
    await waitForStack(page);
    const navbar = await navbarHeight(page);

    // A panel taller than the screen scrolls past the navbar, so it must not show through:
    // `rgb()` is an opaque colour, `rgba()` a translucent one.
    expect(
      await page
        .getByRole("navigation", { name: navCopy.label })
        .evaluate((nav) => getComputedStyle(nav).backgroundColor),
    ).toMatch(/^rgb\(/);

    for (const [index, id] of SECTION_IDS.entries()) {
      const { naturalTop } = await panelBox(page, id);
      await scrollToY(page, naturalTop - navbar);
      const arrived = await panelBox(page, id);
      expect(
        Math.abs(arrived.top - navbar),
        `#${id} starts at the bottom edge of the navbar`,
      ).toBeLessThanOrEqual(1);

      // The last panel never pins, and a panel taller than the space below the navbar pins by
      // its bottom edge.
      const pins = index < SECTION_IDS.length - 1;
      if (pins && arrived.height <= arrived.viewport - navbar + 1) {
        await scrollToY(page, naturalTop - navbar + 200);
        expect(
          Math.abs((await panelBox(page, id)).top - navbar),
          `#${id} pins under the navbar, not behind it`,
        ).toBeLessThanOrEqual(1);
      }
    }
  });

  test.describe("on a laptop screen", () => {
    // Where the space below the navbar is shortest on a wide screen: a 14-inch MacBook with the
    // Dock showing, and a 1366×768 laptop.
    const VIEWPORTS = [
      { width: 1512, height: 749 },
      { width: 1366, height: 641 },
    ];

    for (const locale of LOCALES) {
      for (const viewport of VIEWPORTS) {
        for (const skin of ["normal", "8-bit"] as const) {
          test(`every panel fits below the navbar at ${viewport.width}×${viewport.height}, ${skin} skin, ${locale}`, async ({
            page,
            isMobile,
          }) => {
            test.skip(isMobile, "a laptop screen is not a phone");
            await page.setViewportSize(viewport);
            if (skin === "8-bit") await storeSkin(page);
            await page.goto(homeOf(locale));
            await waitForStack(page);
            await page.evaluate(() => document.fonts.ready);
            const navbar = await navbarHeight(page);
            const space = viewport.height - navbar;

            for (const [index, id] of SECTION_IDS.entries()) {
              const { naturalTop, height } = await panelBox(page, id);
              expect(height, `#${id} fits`).toBeLessThanOrEqual(space + 1);

              // The last panel never pins. The others stay put while the next one covers them.
              if (index === SECTION_IDS.length - 1) continue;
              await scrollToY(page, naturalTop - navbar + space / 2);
              expect(
                Math.abs((await panelBox(page, id)).top - navbar),
                `#${id} stays below the navbar while it is covered`,
              ).toBeLessThanOrEqual(1);
            }
          });
        }
      }
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
          // A checkbox drawn by its label is hidden itself: the label is what has to be seen.
          const shown = element.closest("label") ?? element;
          const rect = shown.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          const top = document.elementFromPoint(x, y);
          if (top && (shown === top || shown.contains(top))) return null;
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
        .getByRole("link", { name: navCopy.links.projects })
        .click();
    } else {
      await page
        .getByRole("navigation", { name: navCopy.label })
        .getByRole("link", { name: navCopy.links.projects })
        .click();
    }

    await expect(page).toHaveURL(new RegExp(`#${sections.projects}$`));
    await expect
      .poll(() => isUnobscured(page.locator(`#${headingId("projects")}`)))
      .toBe(true);
    // The panel stops at the navbar instead of going behind it.
    const navbar = await navbarHeight(page);
    await expect
      .poll(async () =>
        Math.abs((await panelBox(page, sections.projects)).top - navbar),
      )
      .toBeLessThanOrEqual(1);
  });

  test("a direct load of a fragment lands on its panel", async ({ page }) => {
    await page.goto(`/#${sections.experience}`);
    await waitForStack(page);
    await expect
      .poll(() => isUnobscured(page.locator(`#${headingId("experience")}`)))
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
        // What is not displayed at this width, the buttons of a carousel, cannot be covered.
        if (!(await target.evaluate((element) => element.checkVisibility()))) {
          continue;
        }
        await scrollToNatural(target);
        if (!(await isUnobscured(target))) {
          cut.push((await target.textContent())?.trim().slice(0, 40) ?? "");
        }
      }
      expect(cut).toEqual([]);
    });

    for (const locale of LOCALES) {
      test(`the page does not scroll sideways at 320 px, ${locale}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 320, height: 640 });
        await page.goto(homeOf(locale));
        expect(await horizontalOverflow(page)).toEqual({
          overflow: 0,
          clipped: [],
        });
      });
    }
  });
});
