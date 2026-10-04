import { expect, test } from "@playwright/test";
import { timeline } from "../src/app/data/curriculum";
import { projects } from "../src/app/data/projects";
import {
  headingId,
  site,
  stats,
  technologies,
  type SectionKey,
} from "../src/app/data/site";
import { copyOf, homeOf, LOCALES } from "./helpers";

for (const locale of LOCALES) {
  const copy = copyOf(locale);
  const home = homeOf(locale);

  test.describe(`server rendering, ${locale}`, () => {
    test("raw HTML already holds the content", async ({ request }) => {
      const html = await (await request.get(home)).text();
      expect(html).toContain(site.heading);
      for (const project of projects) {
        expect(html, project.title).toContain(project.title);
      }
      for (const item of timeline) {
        expect(html, item.id).toContain(copy.curriculum.items[item.id].title);
      }
      // Every technology of the band, the ones that start off screen included.
      for (const technology of technologies) {
        expect(html, technology.name).toContain(`>${technology.name}<`);
      }
      // The stats are the real numbers, not the start of a count-up animation.
      for (const stat of stats) {
        expect(html, stat.id).toContain(`>${stat.value}${stat.suffix}<`);
        expect(html, stat.id).toContain(copy.about.stats[stat.id]);
      }
    });

    test("hero is not gated on hydration", async ({ page, request }) => {
      // The hero holds the LCP element: an entrance that starts hidden would delay it.
      const html = await (await request.get(home)).text();
      const start = html.indexOf('id="hero"');
      const hero = html.slice(start, html.indexOf("</section>", start));
      expect(hero.length).toBeGreaterThan(0);
      expect(hero).not.toContain("opacity:0");
      expect(hero).not.toContain("translateY(");

      await page.goto(home);
      expect(
        await page.locator("h1").evaluate((el) => getComputedStyle(el).opacity),
      ).toBe("1");
    });

    test("headings keep the spaces between their words", async ({ page }) => {
      await page.goto(home);
      expect(await page.locator("h1").textContent()).toBe(site.heading);
      expect(await page.locator(`#${headingId("about")}`).textContent()).toBe(
        copy.about.heading,
      );
    });

    test.describe("without JavaScript", () => {
      test.use({ javaScriptEnabled: false });

      test("content is visible", async ({ page }) => {
        await page.goto(home);
        await expect(page.locator("h1")).toBeVisible();
        const keys: SectionKey[] = [
          "about",
          "projects",
          "experience",
          "contact",
        ];
        for (const key of keys) {
          await expect(page.locator(`#${headingId(key)}`)).toBeVisible();
        }
        await expect(page.getByText(projects[0].title).first()).toBeVisible();

        // Playwright treats opacity 0 as visible, so the reveal start state is checked directly.
        const stillHidden = await page.locator("[data-reveal]").evaluateAll(
          (elements) =>
            elements.filter((element) => {
              const style = getComputedStyle(element);
              return style.opacity !== "1" || style.transform !== "none";
            }).length,
        );
        expect(stillHidden).toBe(0);
      });
    });
  });
}
