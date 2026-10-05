import { expect, test, type Locator } from "@playwright/test";
import { headingId, sections, site } from "../src/app/data/site";
import {
  copyOf,
  homeOf,
  LOCALES,
  revealAll,
  SECTION_IDS,
  storeSkin,
  waitForStack,
} from "./helpers";

for (const locale of LOCALES) {
  const copy = copyOf(locale);

  test.describe(`home page, ${locale}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(homeOf(locale));
    });

    test("renders a single h1 and every section", async ({ page }) => {
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(site.heading);
      for (const id of SECTION_IDS) {
        await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(1);
      }
    });

    test("hero shows the portrait", async ({ page }) => {
      const portrait = page.getByRole("img", { name: copy.hero.portraitAlt });
      await expect(portrait).toBeVisible();
      await expect
        .poll(() =>
          portrait.evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);
    });

    test("desktop nav links scroll to their section", async ({
      page,
      isMobile,
    }) => {
      test.skip(isMobile, "desktop navigation only");
      await page
        .getByRole("navigation", { name: copy.nav.label })
        .getByRole("link", { name: copy.nav.links.contact })
        .click();
      await expect(page).toHaveURL(new RegExp(`#${sections.contact}$`));
      await expect(page.locator(`#${headingId("contact")}`)).toBeInViewport();
    });

    test("mobile menu opens, navigates and closes", async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile, "mobile menu only");
      await page.getByRole("button", { name: copy.nav.openMenu }).click();
      const menu = page.locator("#mobile-nav");
      await expect(menu).toBeVisible();
      await menu.getByRole("link", { name: copy.nav.links.projects }).click();
      await expect(menu).toBeHidden();
      await expect(page).toHaveURL(new RegExp(`#${sections.projects}$`));
      await expect(page.locator(`#${headingId("projects")}`)).toBeInViewport();
    });
  });
}

/** The groups of links where a pointer over one link dims the others. */
const LINK_GROUPS = {
  navbar: "[data-nav-bar] .nav-links-group a",
  about: `#${sections.about} .nav-links-group a`,
  contact: `#${sections.contact} .nav-links-group a`,
  footer: "footer .nav-links-group a",
};

const opacities = (links: Locator) =>
  links.evaluateAll((all) => all.map((link) => getComputedStyle(link).opacity));

// The effect is one rule of the stylesheet: it does not depend on the language.
for (const skin of ["normal", "8-bit"] as const) {
  test(`a pointer over a link dims the other links of its group, ${skin} skin`, async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "a touch screen has no pointer that hovers");
    // In normal flow, so that no panel is pinned under the next one while its links are pointed at.
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (skin === "8-bit") await storeSkin(page);
    await page.goto("/");
    await waitForStack(page);
    // A section that is still sliding in would carry its links away from under the pointer.
    await revealAll(page);

    for (const [name, selector] of Object.entries(LINK_GROUPS)) {
      const links = page.locator(selector);
      const count = await links.count();
      expect(count, name).toBeGreaterThan(1);
      // It is a fade, not a jump.
      expect(
        await links.evaluateAll((all) =>
          all.every((link) =>
            getComputedStyle(link).transitionProperty.includes("opacity"),
          ),
        ),
        `${name} fades`,
      ).toBe(true);

      for (let pointed = 0; pointed < count; pointed += 1) {
        // Pointed at again on every try: a page that is still settling carries the link away
        // from under the pointer, and the fade takes a moment.
        await expect(async () => {
          await links.nth(pointed).hover();
          expect(
            await opacities(links),
            `${name}, link ${pointed + 1}`,
          ).toEqual(
            Array.from({ length: count }, (_, index) =>
              index === pointed ? "1" : "0.4",
            ),
          );
        }).toPass({ timeout: 10_000 });
      }
    }

    // A group does not reach outside itself: the email address is a link of its own.
    const contact = page.locator(LINK_GROUPS.contact);
    const email = page.locator(`#${sections.contact} a[href^="mailto:"]`);
    const footer = page.locator(LINK_GROUPS.footer);
    await expect(async () => {
      await contact.first().hover();
      expect(await opacities(contact)).toContain("0.4");
    }).toPass({ timeout: 10_000 });
    expect(await opacities(email)).toEqual(["1"]);
    expect(new Set(await opacities(footer))).toEqual(new Set(["1"]));

    await expect(async () => {
      await email.hover();
      expect(new Set(await opacities(contact))).toEqual(new Set(["1"]));
    }).toPass({ timeout: 10_000 });
  });
}
