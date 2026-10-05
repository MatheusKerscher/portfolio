import { useSyncExternalStore } from "react";
import { unlockAudio } from "./audio-context";
import {
  SKIN_ATTRIBUTE as ATTRIBUTE,
  SKIN_STORAGE_KEY as STORAGE_KEY,
} from "./skin-script";

export type Skin = "normal" | "8bit";

/** The two ways into the 8-bit skin: the pixel of the footer and the Konami code. */
export type SkinEntry = "pixel" | "konami";

const listeners = new Set<() => void>();
let entry: { by: SkinEntry; at: number } | null = null;

/**
 * How the skin was entered, while that is recent. The runtime of the skin greets an entry, not a
 * page that loads with the skin already stored.
 */
export const recentSkinEntry = () =>
  entry && performance.now() - entry.at < 5000 ? entry.by : null;

function read(): Skin {
  return document.documentElement.getAttribute(ATTRIBUTE) === "8bit"
    ? "8bit"
    : "normal";
}

function apply(skin: Skin) {
  if (skin === "8bit") document.documentElement.setAttribute(ATTRIBUTE, skin);
  else document.documentElement.removeAttribute(ATTRIBUTE);
  listeners.forEach((listener) => listener());
}

export function setSkin(skin: Skin) {
  try {
    if (skin === "8bit") localStorage.setItem(STORAGE_KEY, skin);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage is unavailable: the skin still applies to this page view.
  }
  apply(skin);
}

/** Switches to the other skin, with a wipe in bands where the browser supports it. */
export function toggleSkin(by: SkinEntry = "pixel") {
  const next: Skin = read() === "8bit" ? "normal" : "8bit";
  if (next === "8bit") {
    entry = { by, at: performance.now() };
    // Inside the gesture: the sound engine of the skin arrives after it has ended.
    unlockAudio();
  }
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The rule of the wipe is in globals.css.
  if (!still && document.startViewTransition) {
    document.startViewTransition(() => setSkin(next));
  } else {
    setSkin(next);
  }
}

function subscribe(listener: () => void) {
  // Keeps other tabs of the site in step.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      apply(event.newValue === "8bit" ? "8bit" : "normal");
    }
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The current skin. The server, and the first client render, always see the normal one. */
export function useSkin(): Skin {
  return useSyncExternalStore(subscribe, read, () => "normal");
}

const EXPO: [number, number, number, number] = [0.19, 1, 0.22, 1];
const inSteps = (progress: number) => Math.ceil(progress * 5) / 5;

/**
 * The easing of a scroll reveal: a curve in the normal skin and five discrete steps in the 8-bit
 * one, where things move like a sprite, not like a slide.
 */
export function useRevealEase() {
  return useSkin() === "8bit" ? inSteps : EXPO;
}
