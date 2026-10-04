import { expect, test } from "@playwright/test";
import { timeline } from "../src/app/data/curriculum";
import { projects } from "../src/app/data/projects";
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
    }) => {
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
