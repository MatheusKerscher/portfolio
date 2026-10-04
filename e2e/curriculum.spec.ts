import { expect, test } from "@playwright/test";
import {
  experience,
  formatPeriod,
  yearsOfExperience,
  yearsSince,
} from "../src/app/data/curriculum";
import { curriculumCopy } from "../src/app/data/site";
import { readJsonLd } from "./helpers";

test.describe("curriculum", () => {
  // The same HTML and the same functions for every engine.
  test.skip(
    ({ browserName, isMobile }) => browserName !== "chromium" || isMobile,
    "checked once, in desktop Chromium",
  );

  test("the timeline is the one of the LinkedIn profile, in its order", async ({
    page,
  }) => {
    await page.goto("/");
    const cards = page.locator("#carrossel-curriculo article");
    const organizations = await cards.locator("h3 + p").allTextContents();
    expect(organizations.map((text) => text.split(" · ")[0])).toEqual([
      "Coopers Digital",
      "Freelance",
      "CWB Tecnologia",
      "Vetor Sistemas",
      "Universidade Federal do Paraná (UFPR)",
    ]);

    // Coopers Digital is the current job, and CWB Tecnologia ended when it started.
    await expect(cards.nth(0).locator("time")).toHaveAttribute(
      "datetime",
      "2026-06",
    );
    await expect(cards.nth(0).locator("time")).toContainText(
      curriculumCopy.present,
    );
    await expect(cards.nth(2).locator("time")).toHaveAttribute(
      "datetime",
      "2024-05/2026-06",
    );
  });

  test("structured data names the current employer", async ({ page }) => {
    await page.goto("/");
    const { "@graph": graph } = await readJsonLd(page);
    const person = graph.find((node) => node["@type"] === "Person") as {
      worksFor: { name: string };
    };
    expect(person.worksFor.name).toBe("Coopers Digital");
    expect(experience[0].organization).toContain(person.worksFor.name);
    expect(experience[0].endDate).toBeUndefined();
  });

  test("years of experience are whole years since the first job", () => {
    // Local dates: the function reads the local year and month.
    expect(yearsSince("2022-02", new Date(2026, 0, 31))).toBe(3);
    expect(yearsSince("2022-02", new Date(2026, 1, 1))).toBe(4);
    expect(yearsSince("2022-02", new Date(2026, 9, 4))).toBe(4);
    expect(yearsOfExperience).toBe(yearsSince("2022-02"));
  });

  test("a period is written from its dates", () => {
    expect(
      formatPeriod(
        { startDate: "2024-05", endDate: "2026-06" },
        curriculumCopy,
      ),
    ).toBe("Mai 2024 — Jun 2026");
    expect(formatPeriod({ startDate: "2026-06" }, curriculumCopy)).toBe(
      "Jun 2026 — Presente",
    );
  });
});
