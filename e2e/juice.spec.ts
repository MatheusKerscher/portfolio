import { expect, test, type Locator, type Page } from "@playwright/test";
import { defaultLocale, locales } from "../src/app/data/locales";
import { ACHIEVEMENTS } from "../src/lib/pixel-prefs";
import {
  audioProbe,
  DEFAULT_COPY,
  holdAudioUntilPress,
  homeOf,
  inspectorCopyOf,
  isUnobscured,
  LATER_SECTIONS,
  LOCALES,
  pixelCopyOf,
  revealAll,
  scrollToY,
  spyOnAudio,
  storeSkin,
  visitSections,
  waitForStack,
} from "./helpers";

// What the skin does, not what it says: the default language is enough.
const { hero: heroCopy, nav: navCopy, skin: skinCopy } = DEFAULT_COPY;
const copy = pixelCopyOf(defaultLocale);
const inspectorCopy = inspectorCopyOf(defaultLocale);
/** Where a change of language leads, and the copy of the runtime there. */
const otherLocale = LOCALES.find((locale) => locale !== defaultLocale)!;
const otherCopy = pixelCopyOf(otherLocale);

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const html = (page: Page) => page.locator("html");
const navbar = (page: Page) =>
  page.getByRole("navigation", { name: navCopy.label });
/** The hidden way in: the pixel in the footer. */
const pixel = (page: Page) =>
  page.getByRole("contentinfo").getByRole("button", { name: skinCopy.toggle });
const exit = (page: Page) =>
  navbar(page).getByRole("button", { name: skinCopy.toggle });
const pauseButton = (page: Page, names = copy) =>
  page
    .locator("[data-nav-bar]")
    .getByRole("button", { name: names.pause.open });
const pauseMenu = (page: Page) => page.locator("#pause-menu");
const switchOf = (page: Page, name: string) =>
  pauseMenu(page).getByRole("switch", { name });
/** What takes the place of the Inspector in the navbar until it is unlocked. */
const lock = (page: Page) =>
  navbar(page).getByRole("button", { name: copy.inspector.locked });
const magnifier = (page: Page) =>
  navbar(page).getByRole("button", { name: inspectorCopy.toggle });
const toasts = (page: Page) => page.locator('.px-toasts[role="status"]');
const dialogue = (page: Page) => page.locator('[data-px="dialogue"]');

/** The runtime is a lazy chunk: it is there once it has put its controls in the navbar. */
async function waitForRuntime(page: Page, names = copy) {
  await expect(pauseButton(page, names)).toBeVisible();
}

/** Opens the home page with the skin stored, as a returning visitor has it. */
async function openInSkin(page: Page) {
  await storeSkin(page);
  await page.goto("/");
  await waitForStack(page);
  await waitForRuntime(page);
}

/** Enters the skin from the normal one, with the pixel of the footer: a gesture, and an entry. */
async function enterSkin(page: Page) {
  await page.goto("/");
  await waitForStack(page);
  await pixel(page).click();
  await expect(html(page)).toHaveAttribute("data-skin", "8bit");
  await waitForRuntime(page);
}

async function openPause(page: Page, names = copy) {
  await pauseButton(page, names).click();
  await expect(pauseMenu(page)).toBeVisible();
}

/** A full page load, like every change of language: the link of the footer, at any width. */
async function changeLanguage(page: Page) {
  await page
    .getByRole("contentinfo")
    .locator(`a[hreflang="${locales[otherLocale].htmlLang}"]`)
    .click();
  await page.waitForURL(new RegExp(`${homeOf(otherLocale)}$`));
  await waitForStack(page);
  await waitForRuntime(page, otherCopy);
}

/** Whether sounds keep being started: twice in a row, more than a jingle has. */
async function expectSoundsToKeepStarting(page: Page) {
  for (let round = 0; round < 2; round += 1) {
    const before = (await audioProbe(page)).sounds;
    await expect
      .poll(async () => (await audioProbe(page)).sounds)
      .toBeGreaterThan(before + 10);
  }
}

/** Where the controls of the navbar are, the Inspector and its lock aside. */
const otherControls = (page: Page) =>
  page.evaluate(() =>
    Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-bar] :is(a, button)"),
    )
      .filter(
        (control) =>
          !control.matches('[data-px="lock"], [data-px="inspector"]') &&
          control.getClientRects().length > 0,
      )
      .map((control) => {
        const { left, top, width, height } = control.getBoundingClientRect();
        return { left, top, width, height };
      }),
  );

/** The animations of the runtime that are running: the ones `pixel.css` names. */
const runtimeAnimations = (page: Page) =>
  page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation instanceof CSSAnimation &&
            animation.animationName.startsWith("px-") &&
            animation.playState === "running",
        ).length,
  );

type WithBursts = Window & { bursts?: number };

/**
 * Starts counting the bursts of particles. A burst removes itself when it ends, so looking for
 * one later says nothing: what is counted is every one that was ever added.
 */
const countBursts = (page: Page) =>
  page.evaluate(() => {
    (window as WithBursts).bursts = 0;
    new MutationObserver((records) => {
      for (const record of records) {
        (window as WithBursts).bursts! += record.addedNodes.length;
      }
    }).observe(document.querySelector(".px-fx")!, { childList: true });
  });

const bursts = (page: Page) =>
  page.evaluate(() => (window as WithBursts).bursts ?? -1);

/** What assistive technology reads in an element: its text outside `aria-hidden`. */
const accessibleText = (locator: Locator) =>
  locator.evaluate((element) => {
    let text = "";
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (!walker.currentNode.parentElement?.closest('[aria-hidden="true"]')) {
        text += walker.currentNode.textContent;
      }
    }
    return text;
  });

test.describe("juice of the 8-bit skin", () => {
  test("the normal skin carries no runtime and makes no sound", async ({
    page,
  }) => {
    await spyOnAudio(page);
    await page.goto("/");
    await waitForStack(page);
    await revealAll(page);
    await navbar(page).getByRole("button", { name: navCopy.darkTheme }).click();

    expect(await audioProbe(page)).toEqual({ contexts: 0, sounds: 0 });
    await expect(page.locator(".px-scenery, .px-xp, .px-notices")).toHaveCount(
      0,
    );
    await expect(pauseButton(page)).toBeHidden();
    await expect(html(page)).not.toHaveAttribute("data-fx");
  });

  test("entering the skin fetches the runtime and is greeted with sound", async ({
    page,
  }) => {
    const scripts: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "script") scripts.push(request.url());
    });
    await spyOnAudio(page);
    await page.goto("/");
    await waitForStack(page);
    const firstLoad = scripts.length;

    await pixel(page).click();
    await waitForRuntime(page);
    // The runtime is not part of the first load.
    expect(scripts.length).toBeGreaterThan(firstLoad);
    await expect(page.locator(".px-scenery")).toHaveCount(1);
    // The context is created by the gesture, the jingle is played by the runtime.
    expect((await audioProbe(page)).contexts).toBe(1);
    await expect
      .poll(async () => (await audioProbe(page)).sounds)
      .toBeGreaterThan(0);
  });

  test("a press makes a sound, none when muted, and the mute survives a reload", async ({
    page,
    isMobile,
  }) => {
    await spyOnAudio(page);
    await enterSkin(page);
    // The toast of the first entry has its own sound: it is waited for, not counted.
    await expect(toasts(page)).toContainText(
      copy.achievements.items["easter-egg"].title,
    );

    let before = (await audioProbe(page)).sounds;
    await openPause(page);
    await expect
      .poll(async () => (await audioProbe(page)).sounds)
      .toBeGreaterThan(before);

    await switchOf(page, copy.pause.sound).click();
    await expect(switchOf(page, copy.pause.sound)).toHaveAttribute(
      "aria-checked",
      "false",
    );
    // Let what was scheduled before the mute start.
    await page.waitForTimeout(400);
    before = (await audioProbe(page)).sounds;
    await switchOf(page, copy.pause.effects).click();
    await switchOf(page, copy.pause.effects).click();
    await page.waitForTimeout(400);
    expect((await audioProbe(page)).sounds).toBe(before);

    await page.reload();
    await waitForStack(page);
    await waitForRuntime(page);
    expect(await page.evaluate(() => localStorage.getItem("sound"))).toBe(
      "false",
    );
    // The mute button is in the navbar from `sm` up; below it, the PAUSE menu has the switch.
    if (!isMobile) {
      await expect(
        navbar(page).getByRole("button", { name: copy.sound.mute }),
      ).toHaveAttribute("aria-pressed", "true");
    }
    await openPause(page);
    await expect(switchOf(page, copy.pause.sound)).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  test("the PAUSE menu is a dialog that Escape closes, with the focus back on its button", async ({
    page,
  }) => {
    await openInSkin(page);
    await openPause(page);

    await expect(pauseMenu(page)).toHaveAttribute("role", "dialog");
    await expect(pauseButton(page)).toHaveAttribute("aria-expanded", "true");
    await expect(
      pauseMenu(page).getByRole("heading", { name: copy.pause.title }),
    ).toBeFocused();
    await expect(pauseMenu(page).getByRole("switch")).toHaveCount(3);

    await page.keyboard.press("Escape");
    await expect(pauseMenu(page)).toBeHidden();
    await expect(pauseButton(page)).toBeFocused();
  });

  test("the scenery moves and a press bursts, and the effects switch stops both", async ({
    page,
  }) => {
    await openInSkin(page);
    await expect(page.locator(".px-scenery .px-shape").first()).toBeAttached();
    await expect.poll(() => runtimeAnimations(page)).toBeGreaterThan(0);

    await countBursts(page);
    await pauseButton(page).click();
    await expect.poll(() => bursts(page)).toBe(1);
    // It is removed when it ends.
    await expect(page.locator(".px-burst")).toHaveCount(0);

    // The press that turns the effects off is the last one that bursts.
    await switchOf(page, copy.pause.effects).click();
    await expect(html(page)).toHaveAttribute("data-fx", "off");
    await expect.poll(() => runtimeAnimations(page)).toBe(0);
    await switchOf(page, copy.pause.sound).click();
    await page.waitForTimeout(200);
    expect(await bursts(page)).toBe(2);

    // The switch is kept, like the mute.
    await page.reload();
    await waitForStack(page);
    await waitForRuntime(page);
    await expect(html(page)).toHaveAttribute("data-fx", "off");
    expect(await runtimeAnimations(page)).toBe(0);
  });

  test("nothing of the runtime moves under reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openInSkin(page);
    await expect(page.locator(".px-scenery .px-shape").first()).toBeAttached();

    expect(await runtimeAnimations(page)).toBe(0);
    await countBursts(page);
    await pauseButton(page).click();
    await page.waitForTimeout(200);
    expect(await bursts(page)).toBe(0);
    // The tagline is not typed: it is whole, one text node, from the start.
    expect(await dialogue(page).evaluate((p) => p.childNodes.length)).toBe(1);
    await expect(dialogue(page)).toHaveText(heroCopy.tagline);
  });

  test("the XP bar fills with the scroll and the notice names the stage", async ({
    page,
  }) => {
    await openInSkin(page);
    const bar = page.locator(".px-xp");
    await expect(bar).toHaveAttribute("data-xp", "0");

    const projects = await page.evaluate(
      () =>
        document.querySelector("#projects")!.getBoundingClientRect().top +
        window.scrollY,
    );
    await scrollToY(page, projects);
    await expect(page.locator(".px-stage")).toContainText(copy.stages.projects);
    await expect(page.locator(".px-stage")).toBeHidden({ timeout: 6000 });

    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    await expect(bar).toHaveAttribute("data-xp", "20");
  });

  test("the first entry unlocks an achievement, which is announced and kept", async ({
    page,
  }) => {
    await enterSkin(page);
    const { title } = copy.achievements.items["easter-egg"];
    await expect(toasts(page)).toContainText(title);
    expect(
      await page.evaluate(() => localStorage.getItem("achievements")),
    ).toBe('["easter-egg"]');

    await openPause(page);
    await expect(pauseMenu(page).locator("[data-achievements]")).toHaveText(
      `1/${ACHIEVEMENTS.length}`,
    );
    await expect(pauseMenu(page).getByText(title)).toBeVisible();

    // Kept: a reload lists it and does not announce it again.
    await page.reload();
    await waitForStack(page);
    await waitForRuntime(page);
    await page.waitForTimeout(1200);
    await expect(toasts(page)).toBeEmpty();
    await openPause(page);
    await expect(pauseMenu(page).locator("[data-achievements]")).toHaveText(
      `1/${ACHIEVEMENTS.length}`,
    );
  });

  test("the Konami code unlocks a second achievement", async ({ page }) => {
    await page.goto("/");
    await waitForStack(page);
    for (const key of KONAMI) await page.keyboard.press(key);
    await expect(html(page)).toHaveAttribute("data-skin", "8bit");
    await waitForRuntime(page);

    await expect(toasts(page)).toContainText(
      copy.achievements.items.konami.title,
      { timeout: 8000 },
    );
    await openPause(page);
    await expect(pauseMenu(page).locator("[data-achievements]")).toHaveText(
      `2/${ACHIEVEMENTS.length}`,
    );
  });

  test("the music is off on a first visit and keeps playing once it is on", async ({
    page,
  }) => {
    await spyOnAudio(page);
    await enterSkin(page);
    await openPause(page);
    const music = switchOf(page, copy.pause.music);
    await expect(music).toHaveAttribute("aria-checked", "false");

    // Muted, so that only the sequencer starts anything: it schedules whether it is heard or not.
    await switchOf(page, copy.pause.sound).click();
    await page.waitForTimeout(600);
    const silent = (await audioProbe(page)).sounds;
    await page.waitForTimeout(600);
    expect((await audioProbe(page)).sounds).toBe(silent);

    await music.click();
    await expect(music).toHaveAttribute("aria-checked", "true");
    await expectSoundsToKeepStarting(page);

    await music.click();
    await expect(music).toHaveAttribute("aria-checked", "false");
    // Let what was scheduled before the switch start.
    await page.waitForTimeout(400);
    const stopped = (await audioProbe(page)).sounds;
    await page.waitForTimeout(600);
    expect((await audioProbe(page)).sounds).toBe(stopped);
  });

  test("the three switches are kept through a change of language and a reload", async ({
    page,
  }) => {
    await spyOnAudio(page);
    await enterSkin(page);
    await openPause(page);
    // Muted first: from here on, only the sequencer starts anything.
    await switchOf(page, copy.pause.sound).click();
    await switchOf(page, copy.pause.effects).click();
    await switchOf(page, copy.pause.music).click();
    await expect(switchOf(page, copy.pause.music)).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await page.keyboard.press("Escape");

    const expectKept = async () => {
      // The probe starts again with each page: what it counts was started there, with nothing
      // pressed on it.
      await expectSoundsToKeepStarting(page);
      await openPause(page, otherCopy);
      const { pause } = otherCopy;
      for (const [name, state] of [
        [pause.sound, "false"],
        [pause.music, "true"],
        [pause.effects, "false"],
      ]) {
        await expect(switchOf(page, name)).toHaveAttribute(
          "aria-checked",
          state,
        );
      }
    };

    await changeLanguage(page);
    await expectKept();

    await page.reload();
    await waitForStack(page);
    await waitForRuntime(page, otherCopy);
    await expectKept();
  });

  test("where the audio waits for a press, the music that was on starts with the first one", async ({
    page,
  }) => {
    // The page a reload leads to, with the music on and nothing pressed yet. Muted, so that only
    // the sequencer starts anything.
    await spyOnAudio(page);
    await holdAudioUntilPress(page);
    await page.addInitScript(() => {
      localStorage.setItem("skin", "8bit");
      localStorage.setItem("sound", "false");
      sessionStorage.setItem("music", "true");
    });
    await page.goto("/");
    await waitForStack(page);
    await waitForRuntime(page);

    // The clock of the context stands still, and the sequencer with it: nothing piles up.
    await page.waitForTimeout(800);
    const waiting = (await audioProbe(page)).sounds;
    await page.waitForTimeout(800);
    expect((await audioProbe(page)).sounds).toBe(waiting);

    await page.keyboard.press("Shift");
    await expectSoundsToKeepStarting(page);
    expect((await audioProbe(page)).contexts).toBe(1);
  });

  test("the music does not follow to a new tab, and leaving the skin turns it off", async ({
    page,
  }) => {
    await enterSkin(page);
    await openPause(page);
    await switchOf(page, copy.pause.music).click();
    await expect(switchOf(page, copy.pause.music)).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await page.keyboard.press("Escape");

    // A new tab is a new session: it has the skin, which is kept across visits, and no music.
    const tab = await page.context().newPage();
    await tab.goto("/");
    await waitForStack(tab);
    await waitForRuntime(tab);
    await openPause(tab);
    await expect(switchOf(tab, copy.pause.music)).toHaveAttribute(
      "aria-checked",
      "false",
    );
    await tab.close();

    await expect.poll(() => isUnobscured(exit(page))).toBe(true);
    await exit(page).click();
    await expect(html(page)).not.toHaveAttribute("data-skin");
    expect(await page.evaluate(() => sessionStorage.getItem("music"))).toBe(
      "false",
    );

    await pixel(page).scrollIntoViewIfNeeded();
    await expect.poll(() => isUnobscured(pixel(page))).toBe(true);
    await pixel(page).click();
    await expect(html(page)).toHaveAttribute("data-skin", "8bit");
    await waitForRuntime(page);
    await openPause(page);
    await expect(switchOf(page, copy.pause.music)).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  test("the Inspector is locked until the five sections have been visited", async ({
    page,
    isMobile,
  }) => {
    await openInSkin(page);
    await expect(html(page)).toHaveAttribute("data-px-inspector", "locked");
    await expect(lock(page)).toBeVisible();
    await expect(magnifier(page)).toBeHidden();
    if (isMobile) {
      const box = (await lock(page).boundingBox())!;
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
    }
    const whileLocked = await otherControls(page);
    expect(whileLocked.length).toBeGreaterThan(2);

    // A press opens nothing, and says what to do.
    await lock(page).click();
    await expect(toasts(page)).toContainText(copy.inspector.hint);
    await expect(page.locator("#inspector-panel")).toHaveCount(0);
    await expect(lock(page)).toBeVisible();

    // Pressed again with one section to go, so that its hint is on screen when the Inspector is
    // unlocked. And focused, as a press leaves it in Chromium and in Firefox.
    await visitSections(page, defaultLocale, LATER_SECTIONS.slice(0, -1));
    await lock(page).click();
    await expect(toasts(page)).toContainText(copy.inspector.hint);
    await lock(page).focus();
    await visitSections(page, defaultLocale, LATER_SECTIONS.slice(-1));
    await expect(toasts(page)).toContainText(
      copy.achievements.items.explorer.title,
    );
    await expect(toasts(page)).toContainText(copy.inspector.unlocked);
    // The hint goes with the lock. Read once: it would go away by itself a few seconds later,
    // and an assertion that retries would wait for that.
    expect(await toasts(page).textContent()).not.toContain(copy.inspector.hint);
    await expect(html(page)).toHaveAttribute("data-px-inspector", "unlocked");
    await expect(lock(page)).toHaveCount(0);
    await expect(magnifier(page)).toBeVisible();
    await expect(magnifier(page)).toBeFocused();

    // One took the place of the other: nothing else in the bar moved.
    const unlocked = await otherControls(page);
    expect(unlocked.length).toBe(whileLocked.length);
    for (const [index, box] of unlocked.entries()) {
      for (const side of ["left", "top", "width", "height"] as const) {
        expect(Math.abs(box[side] - whileLocked[index][side])).toBeLessThan(1);
      }
    }

    await magnifier(page).click();
    await expect(page.locator("#inspector-panel")).toBeVisible();

    // Kept, like every achievement.
    await page.reload();
    await waitForStack(page);
    await waitForRuntime(page);
    await expect(magnifier(page)).toBeVisible();
    await expect(lock(page)).toHaveCount(0);
  });

  test("the tagline is typed, and reads whole while it is and after it", async ({
    page,
  }) => {
    await openInSkin(page);
    const typed = dialogue(page).locator('[aria-hidden="true"] > span').first();

    // While it types: a copy grows letter by letter, and the whole text is there to be read.
    await expect(typed).not.toBeEmpty();
    expect(await accessibleText(dialogue(page))).toBe(heroCopy.tagline);
    expect(
      heroCopy.tagline.startsWith((await typed.textContent()) ?? "?"),
    ).toBe(true);

    // After it: the paragraph is one text node again.
    await expect(dialogue(page).locator("span")).toHaveCount(0, {
      timeout: 10_000,
    });
    await expect(dialogue(page)).toHaveText(heroCopy.tagline);
    expect(await accessibleText(dialogue(page))).toBe(heroCopy.tagline);
  });

  test("leaving the skin while the tagline is typed puts its text back", async ({
    page,
  }) => {
    await openInSkin(page);
    await expect(dialogue(page).locator('[aria-hidden="true"]')).toBeAttached();

    await exit(page).click();
    await expect(html(page)).not.toHaveAttribute("data-skin");
    await expect(dialogue(page)).toHaveText(heroCopy.tagline);
    expect(await dialogue(page).evaluate((p) => p.childNodes.length)).toBe(1);
    await expect(page.locator(".px-scenery, .px-xp, .px-notices")).toHaveCount(
      0,
    );
    await expect(html(page)).not.toHaveAttribute("data-fx");
  });
});
