import { expect, test, type Locator, type Page } from "@playwright/test";
import { timeline } from "../src/app/data/curriculum";
import { projects } from "../src/app/data/projects";
import {
  DOT_STEP,
  MAX_DOTS,
  dotProgress,
  dotWindowStart,
  dotWindowWidth,
} from "../src/lib/carousel-dots";
import { DEFAULT_COPY, scrollToNatural, waitForStack } from "./helpers";

// How a carousel behaves does not depend on the language.
const copy = DEFAULT_COPY;

const CAROUSELS = [
  {
    id: "carousel-projects",
    label: copy.projects.carousel,
    count: projects.length,
  },
  {
    id: "carousel-experience",
    label: copy.curriculum.carousel,
    count: timeline.length,
  },
];

test.describe("carousels", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForStack(page);
  });

  for (const carousel of CAROUSELS) {
    test(`${carousel.id} lays its ${carousel.count} items on one row`, async ({
      page,
    }) => {
      const items = page.locator(`#${carousel.id} .carousel-item`);
      await expect(items).toHaveCount(carousel.count);
      const tops = await items.evaluateAll((elements) =>
        elements.map((element) =>
          Math.round(element.getBoundingClientRect().top),
        ),
      );
      expect(new Set(tops).size).toBe(1);
    });

    test(`${carousel.id} moves with its buttons and stops at both ends`, async ({
      page,
      isMobile,
    }) => {
      test.skip(isMobile, "below `md` a carousel has dots, not buttons");
      const region = page.locator(`#${carousel.id}`);
      const previous = page.getByRole("button", {
        name: copy.carousel.previous(carousel.label),
      });
      const next = page.getByRole("button", {
        name: copy.carousel.next(carousel.label),
      });
      const scrollLeft = () => region.evaluate((element) => element.scrollLeft);
      // A smooth scroll is over when two readings in a row are equal. Without this the test
      // races the animation: a button can become disabled between the check and the click.
      const settle = async () => {
        let last = -1;
        await expect
          .poll(
            async () => {
              const now = await scrollLeft();
              const stable = now === last;
              last = now;
              return stable;
            },
            { intervals: [150] },
          )
          .toBe(true);
      };

      await scrollToNatural(region);
      await expect(previous).toBeDisabled();
      await expect(next).toBeEnabled();

      await next.click();
      await expect.poll(scrollLeft).toBeGreaterThan(0);
      await expect(previous).toBeEnabled();
      await settle();

      for (let step = 0; step < carousel.count; step += 1) {
        if (await next.isDisabled()) break;
        const before = await scrollLeft();
        await next.click();
        await expect.poll(scrollLeft).toBeGreaterThan(before);
        await settle();
      }
      await expect(next).toBeDisabled();

      for (let step = 0; step < carousel.count + 1; step += 1) {
        if (await previous.isDisabled()) break;
        const before = await scrollLeft();
        await previous.click();
        await expect.poll(scrollLeft).toBeLessThan(before);
        await settle();
      }
      await expect(previous).toBeDisabled();
      expect(await scrollLeft()).toBeLessThanOrEqual(1);
    });
  }

  test.describe("dots, below `md`", () => {
    test.skip(
      ({ isMobile }) => !isMobile,
      "the dots replace the buttons there",
    );

    const dotsOf = (page: Page, id: string) =>
      page.locator(`[data-carousel-dots="${id}"]`);

    /** Index of the lit dot, and which dots are drawn smaller. */
    const state = (dots: Locator) =>
      dots.evaluate((element) => {
        const all = [...element.querySelectorAll<HTMLElement>(".carousel-dot")];
        return {
          active: all.findIndex((dot) => dot.dataset.active === "true"),
          lit: all.filter((dot) => dot.dataset.active === "true").length,
          edges: all.flatMap((dot, index) =>
            dot.dataset.edge === "true" ? [index] : [],
          ),
        };
      });

    /** Scrolls the region so that item `index` is the one in view. */
    const showItem = (region: Locator, index: number) =>
      region.evaluate((element, item) => {
        const items = element.querySelectorAll<HTMLElement>(".carousel-item");
        element.scrollLeft = items[item].offsetLeft - items[0].offsetLeft;
      }, index);

    for (const carousel of CAROUSELS) {
      test(`${carousel.id} has one dot per item, and the lit one follows the scroll`, async ({
        page,
      }) => {
        const region = page.locator(`#${carousel.id}`);
        const dots = dotsOf(page, carousel.id);
        await scrollToNatural(region);

        await expect(dots).toBeVisible();
        await expect(dots.locator(".carousel-dot")).toHaveCount(carousel.count);
        // They say nothing the scrollable region does not already expose.
        await expect(dots).toHaveAttribute("aria-hidden", "true");
        // The buttons are for a pointer: they are not displayed here.
        await expect(
          page.getByRole("button", {
            name: copy.carousel.next(carousel.label),
          }),
        ).toBeHidden();

        // The current dot is in the accent colour and the others are faint; both the colour
        // and the size of a dot take 150 ms to change.
        const look = await dots.evaluate((element) => {
          const probe = document.createElement("span");
          element.append(probe);
          const colour = (value: string) => {
            probe.style.backgroundColor = value;
            return getComputedStyle(probe).backgroundColor;
          };
          const tokens = {
            brand: colour("var(--brand)"),
            line: colour("var(--line)"),
          };
          probe.remove();
          const [first, second] = element.querySelectorAll(".carousel-dot");
          const style = getComputedStyle(first);
          return {
            ...tokens,
            current: style.backgroundColor,
            other: getComputedStyle(second).backgroundColor,
            size: [style.width, style.height, style.borderRadius],
            gap: getComputedStyle(first.parentElement!).columnGap,
            transition: [style.transitionProperty, style.transitionDuration],
          };
        });
        expect(look.current).toBe(look.brand);
        expect(look.other).toBe(look.line);
        expect(look.size).toEqual(["6px", "6px", "0px"]);
        expect(look.gap).toBe("6px");
        expect(look.transition).toEqual([
          "background-color, transform",
          "0.15s, 0.15s",
        ]);

        for (let index = 0; index < carousel.count; index += 1) {
          await showItem(region, index);
          await expect
            .poll(() => state(dots), { message: `item ${index + 1}` })
            .toMatchObject({ active: index, lit: 1 });
        }
      });
    }

    test("with more items than fit, five dots slide in a window with smaller ends", async ({
      page,
    }) => {
      const id = "carousel-projects";
      const region = page.locator(`#${id}`);
      const dots = dotsOf(page, id);
      await scrollToNatural(region);

      // Nine items: the list is cloned in the page, and the controls count what is there.
      const count = await region.evaluate((element) => {
        const track = element.firstElementChild!;
        for (const item of [...track.children].slice(0, 4)) {
          track.append(item.cloneNode(true));
        }
        return track.children.length;
      });
      expect(count).toBeGreaterThan(MAX_DOTS);
      await expect(dots.locator(".carousel-dot")).toHaveCount(count);

      /** The dots that are inside the window, and how far the row is shifted. */
      const view = () =>
        dots.evaluate((element) => {
          const frame = element.getBoundingClientRect();
          const row = element.firstElementChild as HTMLElement;
          return {
            width: frame.width,
            shown: [...row.children].flatMap((dot, index) => {
              const rect = dot.getBoundingClientRect();
              const centre = (rect.left + rect.right) / 2;
              return centre > frame.left && centre < frame.right ? [index] : [];
            }),
            shift: Math.abs(new DOMMatrix(getComputedStyle(row).transform).m41),
          };
        });
      const range = (from: number) =>
        Array.from({ length: MAX_DOTS }, (_, index) => from + index);

      // A scroll position is a fraction of a pixel off: the shift is compared within half a pixel.
      const expectWindow = async (from: number) => {
        const { width, shown, shift } = await view();
        expect(width).toBe(dotWindowWidth(count));
        expect(shown).toEqual(range(from));
        expect(Math.abs(shift - from * DOT_STEP)).toBeLessThan(0.5);
      };

      // At the start: the first five, and only the last of them is smaller.
      await showItem(region, 0);
      await expect
        .poll(() => state(dots))
        .toMatchObject({ active: 0, edges: [4] });
      await expectWindow(0);

      // In the middle: the lit dot is centred and both ends are smaller.
      await showItem(region, 4);
      await expect
        .poll(() => state(dots))
        .toMatchObject({ active: 4, edges: [2, 6] });
      await expectWindow(2);

      // At the end: the last five, and only the first of them is smaller.
      await showItem(region, count - 1);
      await expect
        .poll(() => state(dots))
        .toMatchObject({ active: count - 1, edges: [count - MAX_DOTS] });
      await expectWindow(count - MAX_DOTS);

      // Between two items the window is between two steps: it glides with the scroll.
      await region.evaluate((element) => {
        element.style.scrollSnapType = "none";
        const items = element.querySelectorAll<HTMLElement>(".carousel-item");
        element.scrollLeft =
          (items[3].offsetLeft + items[4].offsetLeft) / 2 - items[0].offsetLeft;
      });
      await expect
        .poll(async () => (await view()).shift)
        .toBeCloseTo(1.5 * DOT_STEP, 0);
    });
  });

  test("the arithmetic of the dots", ({ browserName, isMobile }) => {
    test.skip(
      browserName !== "chromium" || isMobile,
      "pure functions: checked once",
    );
    // From 0 at the start to the last item at the end, whatever the scrollable distance.
    expect(dotProgress(0, 1000, 5)).toBe(0);
    expect(dotProgress(500, 1000, 5)).toBe(2);
    expect(dotProgress(1000, 1000, 5)).toBe(4);
    expect(dotProgress(0, 0, 5)).toBe(0);

    // Every dot fits: the window does not move.
    expect(dotWindowStart(4, 5)).toBe(0);
    expect(dotWindowStart(2, 3)).toBe(0);
    // More than fit: centred on the position, and held at both ends of the row.
    expect([0, 2, 3, 4, 6, 8].map((at) => dotWindowStart(at, 9))).toEqual([
      0, 0, 1, 2, 4, 4,
    ]);
    // A fraction moves it by a fraction.
    expect(dotWindowStart(3.5, 9)).toBe(1.5);

    // Five dots of 6 px, 6 px apart, at most.
    expect(dotWindowWidth(3)).toBe(30);
    expect(dotWindowWidth(5)).toBe(54);
    expect(dotWindowWidth(9)).toBe(54);
  });

  test("every project card has a thumbnail that loads", async ({ page }) => {
    const region = page.locator("#carousel-projects");
    await scrollToNatural(region);
    // Each card holds both skins' thumbnails; only the current one is rendered.
    const thumbnails = region.getByRole("img");
    await expect(thumbnails).toHaveCount(projects.length);
    for (const [index, project] of projects.entries()) {
      const thumbnail = thumbnails.nth(index);
      await expect(thumbnail).toHaveAttribute(
        "alt",
        copy.projects.thumbnailAlt(project.title),
      );
      // Lazy images load once their slide is scrolled into the carousel.
      await thumbnail.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          thumbnail.evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);
    }
  });

  test("wheel gestures reach the right scroller", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "touch devices have no wheel");
    const region = page.locator("#carousel-projects");
    await scrollToNatural(region);
    const box = (await region.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    // Sideways: the carousel scrolls, even though Lenis handles the wheel of the page.
    await page.mouse.wheel(300, 0);
    await expect
      .poll(() => region.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);

    // Up and down: the page scrolls, the carousel does not trap the gesture.
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 300);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(before);
  });
});
