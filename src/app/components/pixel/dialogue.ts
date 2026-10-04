import { useEffect } from "react";
import { play } from "@/lib/pixel-audio";
import { motionAllowed } from "@/lib/pixel-prefs";

/** Milliseconds per letter. */
const PACE = 28;

/**
 * Types the text of an element letter by letter and returns what ends it at once.
 *
 * While it types, the element holds its whole text for assistive technology and an `aria-hidden`
 * copy in two parts: what has been typed, and the rest, hidden but in place, so the box has its
 * final size from the first letter. When it ends the element is one text node again.
 */
function type(element: HTMLElement) {
  const text = element.textContent ?? "";
  const whole = document.createElement("span");
  whole.className = "sr-only";
  whole.textContent = text;
  const typed = document.createElement("span");
  const rest = document.createElement("span");
  rest.style.visibility = "hidden";
  rest.textContent = text;
  const copy = document.createElement("span");
  copy.setAttribute("aria-hidden", "true");
  copy.append(typed, rest);
  element.replaceChildren(whole, copy);

  let letters = 0;
  const finish = () => {
    window.clearInterval(timer);
    if (whole.isConnected) element.replaceChildren(text);
  };
  const timer = window.setInterval(() => {
    letters += 1;
    typed.textContent = text.slice(0, letters);
    rest.textContent = text.slice(letters);
    // A blip every third letter, and none for a space.
    if (letters % 3 === 0 && text[letters - 1] !== " ") play("type");
    if (letters >= text.length || !motionAllowed()) finish();
  }, PACE);
  return finish;
}

/**
 * The tagline of the hero, a dialogue box inside the skin, is typed the first time it is on
 * screen. With the effects off, or less motion asked for, it is left as it is: whole.
 */
export function useDialogue() {
  useEffect(() => {
    const paragraph = document.querySelector<HTMLElement>(
      '[data-px="dialogue"]',
    );
    if (!paragraph || !motionAllowed()) return;

    let finish: (() => void) | null = null;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      finish = type(paragraph);
    });
    observer.observe(paragraph);
    return () => {
      observer.disconnect();
      finish?.();
    };
  }, []);
}
