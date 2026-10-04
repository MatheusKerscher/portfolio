import { useEffect } from "react";
import { play } from "@/lib/pixel-audio";
import { seeLocale, unlock, type AchievementId } from "@/lib/pixel-prefs";
import { recentSkinEntry } from "@/lib/skin";
import type { Locale } from "../../data/locales";
import { announceAchievement } from "./notices";

/** Unlocks an achievement and announces it, the first time only. */
export function award(id: AchievementId) {
  if (!unlock(id)) return;
  announceAchievement(id);
  play("achievement");
}

/**
 * The achievements that come from what the visitor does on the page. The ones of the stages and
 * of the music are awarded where those happen (`hud.tsx`, `pause-menu.tsx`).
 */
export function useAchievements(locale: Locale) {
  useEffect(() => {
    // One after the other, and after the jingle of the entry, so each one is heard.
    const timers = [window.setTimeout(() => award("easter-egg"), 700)];
    if (recentSkinEntry() === "konami") {
      timers.push(window.setTimeout(() => award("konami"), 2000));
    }
    if (seeLocale(locale) > 1) {
      timers.push(window.setTimeout(() => award("polyglot"), 3300));
    }

    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('[data-px="theme"]')) award("theme");
      else if (event.target.closest('[data-px="inspector"]')) {
        award("inspector");
      } else if (event.target.closest('a[href^="mailto:"]')) award("contact");
    };
    document.addEventListener("click", onClick, true);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      document.removeEventListener("click", onClick, true);
    };
  }, [locale]);
}
