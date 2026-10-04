"use client";

import { toggleSkin, useSkin } from "@/lib/skin";
import MiniSprite from "./mini-sprite";

/**
 * The way out of the 8-bit skin, in the navbar. It is displayed only inside that skin; the way
 * in is hidden (see SkinEasterEgg).
 */
export default function SkinToggle({ label }: { label: string }) {
  const active = useSkin() === "8bit";

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={toggleSkin}
      className="hidden h-8 w-8 items-center justify-center overflow-hidden border border-ink bg-brand shadow-[3px_3px_0_var(--ink)] transition-shadow duration-200 hover:shadow-[1px_1px_0_var(--ink)] pixel:flex"
    >
      <MiniSprite size={30} />
    </button>
  );
}
