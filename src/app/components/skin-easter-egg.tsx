"use client";

import { useEffect } from "react";
import { toggleSkin, useSkin } from "@/lib/skin";
import { skinCopy } from "../data/site";

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

/**
 * The way into the 8-bit skin, which nothing else in the normal skin announces: one small
 * pixel, a real button for a pointer, a touch screen or a screen reader, and the Konami code
 * for a keyboard.
 */
export default function SkinEasterEgg() {
  const active = useSkin() === "8bit";

  useEffect(() => {
    let typed: string[] = [];
    const onKeyDown = (event: KeyboardEvent) => {
      // Keys typed in a form field are text, not an attempt at the code.
      if (
        event.target instanceof Element &&
        event.target.closest("input, textarea, select, [contenteditable]")
      ) {
        return;
      }
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      typed = [...typed, key].slice(-KONAMI.length);
      if (KONAMI.every((expected, index) => typed[index] === expected)) {
        typed = [];
        toggleSkin();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    // 24 px is the smallest target WCAG 2.2 accepts; the pixel it shows is a quarter of that.
    <button
      type="button"
      aria-pressed={active}
      aria-label={skinCopy.toggle}
      onClick={toggleSkin}
      className="group flex h-6 w-6 items-center justify-center"
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 bg-brand transition-transform duration-200 group-hover:scale-200 group-aria-pressed:bg-ink"
      />
    </button>
  );
}
