import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-skin"],
  });
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  motion.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    motion.removeEventListener("change", onChange);
  };
}

const snapshot = () =>
  [
    document.documentElement.classList.contains("dark") ? "dark" : "light",
    document.documentElement.getAttribute("data-skin") === "8bit"
      ? "8bit"
      : "normal",
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "reduce"
      : "motion",
  ].join("|");

/**
 * The theme, the skin and the motion preference as the page has them right now. Reading them
 * from the document, and re-rendering when it changes, keeps the Inspector honest while the
 * visitor flips the toggles behind it.
 */
export function usePageState() {
  const [theme, skin, motion] = useSyncExternalStore(
    subscribe,
    snapshot,
    () => "light|normal|motion",
  ).split("|");
  return {
    theme: theme as "light" | "dark",
    skin: skin as "normal" | "8bit",
    reducedMotion: motion === "reduce",
  };
}
