import { useLayoutEffect, useRef } from "react";
import { INSPECTOR_KEY, usePixelPrefs } from "@/lib/pixel-prefs";
import PixelIcon from "../pixel-icon";
import { lock } from "../pixel-icons";
import { announceHint, dismissHint } from "./notices";
import Slot from "./slot";

/**
 * The Inspector is a reward of the skin: an achievement unlocks it. Until then a lock takes its
 * place in the navbar, and a press on it says what to do. Which of the two is displayed follows
 * `data-px-inspector` on the root: the lock is rendered here, and the stylesheet of the runtime
 * displays the toggle of the Inspector, which is part of the page.
 */
export default function InspectorLock({ label }: { label: string }) {
  const unlocked = usePixelPrefs().achievements.includes(INSPECTOR_KEY);
  const focused = useRef(false);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-px-inspector", unlocked ? "unlocked" : "locked");
    if (unlocked) dismissHint();
    // The lock had the focus when it gave way: the toggle that takes its place takes it over.
    if (unlocked && focused.current) {
      document
        .querySelector<HTMLElement>('[data-px="inspector"]')
        ?.focus({ preventScroll: true });
    }
    return () => root.removeAttribute("data-px-inspector");
  }, [unlocked]);

  if (unlocked) return null;

  return (
    <Slot name="inspector">
      {/* A button like any other, not a disabled one: a press on it is answered. */}
      <button
        // The cleanup runs while the button is still in the page, and still the active element.
        ref={(button) => () => {
          focused.current = document.activeElement === button;
        }}
        type="button"
        aria-label={label}
        title={label}
        data-px="lock"
        onClick={announceHint}
        className="flex h-8 w-8 items-center justify-center text-ink-muted transition-colors duration-200 hover:text-ink max-lg:h-11 max-lg:w-11"
      >
        <PixelIcon grid={lock} />
      </button>
    </Slot>
  );
}
