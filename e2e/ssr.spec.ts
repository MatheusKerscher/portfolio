import { expect, test } from "@playwright/test";
import { education, experience } from "../src/app/data/curriculum";
import { projects } from "../src/app/data/projects";
import { aboutCopy, heroCopy, stats, technologies } from "../src/app/data/site";

test.describe("server rendering", () => {
  test("raw HTML already holds the content", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain(heroCopy.heading);
    for (const project of projects) {
      expect(html, project.title).toContain(project.title);
    }
    for (const item of [...experience, ...education]) {
      expect(html, item.title).toContain(item.title);
    }
    // Slides that start outside the carousel viewport are in the HTML too.
    for (const technology of technologies) {
      expect(html, technology.name).toContain(technology.description);
    }
    // The stats are the real numbers, not the start of a count-up animation.
    for (const stat of stats) {
      expect(html, stat.label).toContain(`>${stat.value}${stat.suffix}<`);
    }
  });

  test("hero is not gated on hydration", async ({ page, request }) => {
    // The hero holds the LCP element: an entrance that starts hidden would delay it.
    const html = await (await request.get("/")).text();
    const start = html.indexOf('id="hero"');
    const hero = html.slice(start, html.indexOf("</section>", start));
    expect(hero.length).toBeGreaterThan(0);
    expect(hero).not.toContain("opacity:0");
    expect(hero).not.toContain("translateY(");

    await page.goto("/");
    expect(
      await page.locator("h1").evaluate((el) => getComputedStyle(el).opacity),
    ).toBe("1");
  });

  test("headings keep the spaces between their words", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator("h1").textContent()).toBe(heroCopy.heading);
    expect(await page.locator("#sobre-heading").textContent()).toBe(
      aboutCopy.heading,
    );
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("content is visible", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible();
      for (const id of ["sobre", "projetos", "curriculo", "contato"]) {
        await expect(page.locator(`#${id}-heading`)).toBeVisible();
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
