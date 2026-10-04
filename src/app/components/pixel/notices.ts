import type { AchievementId } from "@/lib/pixel-prefs";
import { createStore, useStore } from "@/lib/store";
import type { SectionKey } from "../../data/site";

type Notices = {
  /** The section that has just become the current one. */
  stage: SectionKey | null;
  /** The achievements being announced. */
  toasts: AchievementId[];
  /**
   * How many times the way to unlock the Inspector has been asked for, while it is shown; 0
   * otherwise. Each press shows it anew, so it is announced again.
   */
  hint: number;
};

const STAGE_TIME = 2200;
const TOAST_TIME = 4500;

const NONE: Notices = { stage: null, toasts: [], hint: 0 };

const notices = createStore<Notices>(() => NONE);
let stageTimer = 0;
let hintTimer = 0;
let hints = 0;

export const useNotices = () => useStore(notices);

/** Shows the notice of a stage for a moment. Timers, not animations: it also goes away when nothing moves. */
export function announceStage(stage: SectionKey) {
  notices.set({ ...notices.get(), stage });
  window.clearTimeout(stageTimer);
  stageTimer = window.setTimeout(
    () => notices.set({ ...notices.get(), stage: null }),
    STAGE_TIME,
  );
}

export function announceAchievement(id: AchievementId) {
  notices.set({ ...notices.get(), toasts: [...notices.get().toasts, id] });
  window.setTimeout(
    () =>
      notices.set({
        ...notices.get(),
        toasts: notices.get().toasts.filter((toast) => toast !== id),
      }),
    TOAST_TIME,
  );
}

/** Shows how the Inspector is unlocked, for as long as a toast. */
export function announceHint() {
  hints += 1;
  notices.set({ ...notices.get(), hint: hints });
  window.clearTimeout(hintTimer);
  hintTimer = window.setTimeout(
    () => notices.set({ ...notices.get(), hint: 0 }),
    TOAST_TIME,
  );
}

/** Takes the hint away: what it says stopped being true when the Inspector was unlocked. */
export function dismissHint() {
  window.clearTimeout(hintTimer);
  if (notices.get().hint) notices.set({ ...notices.get(), hint: 0 });
}

export function clearNotices() {
  window.clearTimeout(stageTimer);
  window.clearTimeout(hintTimer);
  notices.set(NONE);
}
