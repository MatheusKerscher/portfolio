import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page } from "@playwright/test";
import { dictionaryFor } from "../src/app/data/dictionaries";
import { inspectorDictionaryFor } from "../src/app/data/dictionaries/inspector";
import { pixelDictionaryFor } from "../src/app/data/dictionaries/pixel";
import {
  defaultLocale,
  localeCodes,
  localePath,
  type Locale,
} from "../src/app/data/locales";
import { sections, type SectionKey } from "../src/app/data/site";
import { INSPECTOR_KEY } from "../src/lib/pixel-prefs";

/** The languages of the site. A suite that depends on copy or on layout runs in each of them. */
export const LOCALES = localeCodes;

/** The home page of a language: `/` or `/en`. */
export const homeOf = (locale: Locale) => localePath(locale);

export const copyOf = dictionaryFor;
export const inspectorCopyOf = inspectorDictionaryFor;
/** The copy of the runtime of the 8-bit skin: the PAUSE menu, the HUD and the toasts. */
export const pixelCopyOf = pixelDictionaryFor;

/** For the suites that check behaviour, not copy, and run in the default language only. */
export const DEFAULT_COPY = dictionaryFor(defaultLocale);

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** The axe violations of the page as it is now, one line per rule. */
export async function violations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
  );
}

/** The anchors of the page, in its order; they are the same in every language. */
export const SECTION_IDS = Object.values(sections);

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

/**
 * Starts the next navigation with the Inspector unlocked: the achievement that unlocks it is
 * already stored, as for a visitor who has been through the page before.
 */
export const unlockInspector = (page: Page) =>
  page.addInitScript(
    (key) => localStorage.setItem("achievements", JSON.stringify([key])),
    INSPECTOR_KEY,
  );

/** The sections after the first one, which is where the page opens. */
export const LATER_SECTIONS = SECTION_IDS.slice(1);

/**
 * Goes through sections of a page opened at its top, in the 8-bit skin, waiting for the HUD to
 * name each one. All of them is what a visitor does to earn the achievement of the five sections.
 */
export async function visitSections(
  page: Page,
  locale: Locale = defaultLocale,
  ids: string[] = LATER_SECTIONS,
) {
  const { stages } = pixelDictionaryFor(locale);
  for (const id of ids) {
    await page.evaluate((section) => {
      const navbar = document.querySelector("[data-nav-bar]")!.clientHeight;
      const top = document.getElementById(section)!.getBoundingClientRect().top;
      window.scrollTo(0, top + window.scrollY - navbar);
    }, id);
    await expect(page.locator(".px-stage")).toContainText(
      stages[id as SectionKey],
    );
  }
}

type AudioProbe = { contexts: number; sounds: number };
type WithAudioProbe = Window & { audioProbe?: AudioProbe };

/**
 * Counts, from before the first script of the page, the `AudioContext`s it creates and the
 * sounds it starts: every oscillator and every burst of noise.
 */
export const spyOnAudio = (page: Page) =>
  page.addInitScript(() => {
    const probe = { contexts: 0, sounds: 0 };
    (window as WithAudioProbe).audioProbe = probe;
    if (!window.AudioContext) return;

    window.AudioContext = class extends window.AudioContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        probe.contexts += 1;
      }
    };
    for (const node of [OscillatorNode, AudioBufferSourceNode]) {
      const start = node.prototype.start;
      node.prototype.start = function (
        this: AudioScheduledSourceNode,
        ...parameters: Parameters<AudioScheduledSourceNode["start"]>
      ) {
        probe.sounds += 1;
        return start.apply(this, parameters);
      };
    }
  });

/** What `spyOnAudio` has counted so far. */
export const audioProbe = (page: Page) =>
  page.evaluate(
    () => (window as WithAudioProbe).audioProbe ?? { contexts: -1, sounds: -1 },
  );

/**
 * A model of the autoplay policy of a browser, which the engines of Playwright do not apply: an
 * `AudioContext` created before the first press on the page is suspended, and no `resume()`
 * settles until there has been one. What a real browser does is not checked by it.
 */
export const holdAudioUntilPress = (page: Page) =>
  page.addInitScript(() => {
    if (!window.AudioContext) return;
    let pressed = false;
    for (const type of ["pointerdown", "pointerup", "keydown"]) {
      window.addEventListener(type, () => (pressed = true), true);
    }

    window.AudioContext = class extends window.AudioContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        if (!pressed) void this.suspend();
      }

      resume() {
        return pressed ? super.resume() : new Promise<void>(() => {});
      }
    };
  });

/**
 * A model of an audio output that is slow to start, as Firefox was on the CI runner and as a
 * wireless headset is when it wakes up: an `AudioContext` reads `suspended` for `delay`
 * milliseconds after it is created, whatever asks it to resume, and runs from then on.
 *
 * No private class field and no `super` in a callback: this function is sent to the page as the
 * text Playwright compiled it to, and the helpers that syntax compiles to do not exist there.
 */
export const delayAudioStart = (page: Page, delay: number) =>
  page.addInitScript((wait) => {
    if (!window.AudioContext) return;
    const Real = window.AudioContext;
    const realState = Object.getOwnPropertyDescriptor(
      BaseAudioContext.prototype,
      "state",
    )!.get!;
    const started = new WeakSet<AudioContext>();
    const starts = new WeakMap<AudioContext, Promise<void>>();

    window.AudioContext = class extends Real {
      constructor(options?: AudioContextOptions) {
        super(options);
        const context = this as AudioContext;
        void Real.prototype.suspend.call(context);
        starts.set(
          context,
          new Promise((resolve) => setTimeout(resolve, wait)).then(() => {
            started.add(context);
            return Real.prototype.resume.call(context);
          }),
        );
      }

      get state(): AudioContextState {
        return started.has(this) ? realState.call(this) : "suspended";
      }

      resume() {
        return started.has(this)
          ? Real.prototype.resume.call(this)
          : starts.get(this)!;
      }
    };
  }, delay);

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
    // The band of technologies holds its items off screen on purpose and moves them in. That
    // none is cut when it stands still is checked by the `marquee` suite.
    const movesIntoView = (element: Element) =>
      !!element.closest("[data-marquee]");
    return {
      overflow: Math.max(0, document.documentElement.scrollWidth - width),
      clipped: Array.from(document.querySelectorAll("main *, footer *, nav *"))
        .filter(
          (element) =>
            element.getBoundingClientRect().right > width + 1 &&
            !scrollsSideways(element) &&
            !movesIntoView(element),
        )
        .map((element) => element.tagName.toLowerCase()),
    };
  });
}
