import { useSyncExternalStore } from "react";
import {
  SKIN_ATTRIBUTE as ATTRIBUTE,
  SKIN_STORAGE_KEY as STORAGE_KEY,
} from "./skin-script";

export type Skin = "normal" | "8bit";

const listeners = new Set<() => void>();

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

/** Switches to the other skin, with a stepped cross-fade where the browser supports it. */
export function toggleSkin() {
  const next: Skin = read() === "8bit" ? "normal" : "8bit";
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The rule of the cross-fade is in globals.css.
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
