"use client";

import { setSkin, useSkin } from "@/lib/skin";
import { skinCopy } from "../data/site";
import MiniSprite from "./mini-sprite";

type SkinToggleProps = {
  /** `icon` is the mini sprite, for the navbar; `chip` is the label on the portrait. */
  variant: "icon" | "chip";
  className?: string;
};

/** Switches the whole site between the normal and the 8-bit skin. */
export default function SkinToggle({ variant, className }: SkinToggleProps) {
  const active = useSkin() === "8bit";

  function toggle() {
    const next = active ? "normal" : "8bit";
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // A stepped cross-fade where the browser supports it; the rule is in globals.css.
    if (!still && document.startViewTransition) {
      document.startViewTransition(() => setSkin(next));
    } else {
      setSkin(next);
    }
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={variant === "icon" ? skinCopy.toggle : undefined}
      title={skinCopy.toggle}
      onClick={toggle}
      // Joined by hand: `cn` would bring tailwind-merge into the client bundle of every page.
      className={`border border-ink bg-pixel-yellow text-on-yellow transition-shadow duration-200 hover:shadow-[3px_3px_0_var(--ink)] aria-pressed:shadow-[3px_3px_0_var(--brand)] ${
        variant === "icon"
          ? "flex h-8 w-8 items-center justify-center overflow-hidden"
          : "px-2.5 py-1 text-xs font-bold tracking-widest uppercase"
      } ${className ?? ""}`}
    >
      {variant === "icon" ? (
        <MiniSprite size={30} />
      ) : (
        <>
          <span aria-hidden="true">{skinCopy.chip}</span>
          <span className="sr-only">{skinCopy.toggle}</span>
        </>
      )}
    </button>
  );
}
