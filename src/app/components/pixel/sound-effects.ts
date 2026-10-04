import { useEffect } from "react";
import { play, type Effect } from "@/lib/pixel-audio";

/** What makes a sound when it is pointed at, focused or pressed. */
const CONTROL = 'a, button, label:has(input), [role="tab"]';

/**
 * The effect of a press, read before the page reacts to it: the listeners are on the capture
 * phase, so a toggle is still in the state the press is about to leave.
 */
function effectOfPress(target: Element): Effect | null {
  if (target.closest('[data-px="sprite"]')) return "jump";
  const control = target.closest(CONTROL);
  if (!control) return null;

  // Leaving the skin has its own sound, played by the runtime on its way out.
  if (control.matches('[data-px="skin"]')) return null;
  // What cannot be done answers with a thud: the locked Inspector, a carousel at its end.
  if (control.matches('[data-px="lock"]')) return "bump";
  if (control.matches('[aria-controls^="carousel-"]')) {
    return control.getAttribute("aria-disabled") === "true" ? "bump" : "tick";
  }
  if (control.matches('[data-px="theme"]')) {
    return document.documentElement.classList.contains("dark") ? "on" : "off";
  }
  if (control.matches('[data-px="top"]')) return "jump";
  if (control.matches('a[href^="mailto:"]')) return "coin";
  if (control.matches("[aria-expanded]")) {
    return control.getAttribute("aria-expanded") === "true" ? "close" : "open";
  }
  const state =
    control.getAttribute("aria-checked") ??
    control.getAttribute("aria-pressed");
  if (state) return state === "true" ? "off" : "on";
  return "select";
}

/** Sound for what the visitor does, by delegation: no component of the page knows about it. */
export function useSoundEffects() {
  useEffect(() => {
    let pointed: Element | null = null;
    let pressed: Element | null = null;
    let pressedAt = 0;
    let blippedAt = 0;

    // Not more than one in 60 ms: a pointer that crosses a row of links is not a drum roll.
    const blip = () => {
      if (performance.now() - blippedAt < 60) return;
      blippedAt = performance.now();
      play("hover");
    };

    const onPointerOver = (event: PointerEvent) => {
      // A finger has no hover; its sounds are the ones of a tap.
      if (event.pointerType !== "mouse" || !(event.target instanceof Element)) {
        return;
      }
      const control = event.target.closest(CONTROL);
      if (control === pointed) return;
      pointed = control;
      if (control) blip();
    };

    const onFocusIn = (event: FocusEvent) => {
      if (
        event.target instanceof Element &&
        event.target.matches(":focus-visible") &&
        event.target.closest(CONTROL)
      ) {
        blip();
      }
    };

    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      // A press on a label is followed by a click on its checkbox: it is one press.
      const control = event.target.closest(CONTROL) ?? event.target;
      if (control === pressed && performance.now() - pressedAt < 80) return;
      pressed = control;
      pressedAt = performance.now();

      const effect = effectOfPress(event.target);
      if (!effect) return;
      play(effect);
      if (effect === "jump" && event.target.closest('[data-px="sprite"]')) {
        window.setTimeout(() => play("coin"), 180);
      }
    };

    // The numbers of "Sobre" count up when they come into view: a coin for each.
    const stats = document.querySelector("#about dl");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        play("coin");
        window.setTimeout(() => play("coin"), 260);
      },
      { threshold: 0.6 },
    );
    if (stats) observer.observe(stats);

    document.addEventListener("pointerover", onPointerOver, true);
    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("click", onClick, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("pointerover", onPointerOver, true);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
}
