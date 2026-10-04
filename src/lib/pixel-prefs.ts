import { createStore, useStore } from "./store";

/** The achievements of the 8-bit skin, in the order the PAUSE menu lists them. */
export const ACHIEVEMENTS = [
  "easter-egg",
  "konami",
  "explorer",
  "inspector",
  "theme",
  "polyglot",
  "music",
  "contact",
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number];

/** The achievement that unlocks the Inspector: the five sections visited. */
export const INSPECTOR_KEY: AchievementId = "explorer";

export type PixelPrefs = {
  /** Whether the effects and the music can be heard. Kept across visits. */
  sound: boolean;
  /** Whatever moves on its own, the particles and the typing. Kept across visits. */
  effects: boolean;
  /**
   * The background loop. Kept for the session of the tab: through a reload and a change of
   * language, not for a later visit, where a tune that starts by itself would be a surprise.
   */
  music: boolean;
  /** Kept across visits. */
  achievements: AchievementId[];
  /** The languages the skin has been seen in. Kept across visits. */
  locales: string[];
};

type StorageArea = "localStorage" | "sessionStorage";

function stored(key: string, area: StorageArea = "localStorage"): unknown {
  try {
    return JSON.parse(window[area].getItem(key) ?? "null");
  } catch {
    return null;
  }
}

function keep(key: string, value: unknown, area: StorageArea = "localStorage") {
  try {
    window[area].setItem(key, JSON.stringify(value));
  } catch {
    // Storage is unavailable: the preference still applies to this page view.
  }
}

const strings = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const prefs = createStore<PixelPrefs>(() => ({
  sound: stored("sound") !== false,
  effects: stored("effects") !== false,
  music: stored("music", "sessionStorage") === true,
  achievements: ACHIEVEMENTS.filter((id) =>
    strings(stored("achievements")).includes(id),
  ),
  locales: strings(stored("locales")),
}));

export const pixelPrefs = prefs.get;
export const usePixelPrefs = () => useStore(prefs);

export function setSound(sound: boolean) {
  keep("sound", sound);
  prefs.set({ ...prefs.get(), sound });
}

export function setEffects(effects: boolean) {
  keep("effects", effects);
  prefs.set({ ...prefs.get(), effects });
}

export function setMusic(music: boolean) {
  if (prefs.get().music === music) return;
  keep("music", music, "sessionStorage");
  prefs.set({ ...prefs.get(), music });
}

/** Records an achievement. `true` the first time, which is when it is announced. */
export function unlock(id: AchievementId) {
  const current = prefs.get();
  if (current.achievements.includes(id)) return false;
  const achievements = [...current.achievements, id];
  keep("achievements", achievements);
  prefs.set({ ...current, achievements });
  return true;
}

/** Records a language the skin was seen in, and returns how many it has been seen in. */
export function seeLocale(locale: string) {
  const current = prefs.get();
  if (current.locales.includes(locale)) return current.locales.length;
  const locales = [...current.locales, locale];
  keep("locales", locales);
  prefs.set({ ...current, locales });
  return locales.length;
}

/**
 * Whether the runtime may move things: the effects are on and the visitor has not asked the
 * system for less motion. Sound does not depend on it.
 */
export const motionAllowed = () =>
  prefs.get().effects &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
