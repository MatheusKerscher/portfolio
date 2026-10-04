const STORAGE_KEY = "scroll-position";
/** A remembered position is for the navigation that follows it, not for a later reload. */
const MAX_AGE = 15_000;

/**
 * Where the visitor is: the stacked section under the navbar and how far into it, as a share of
 * its height. A share, not pixels, because a section is not as tall in every language.
 */
type ScrollPosition = { section: string; ratio: number; at: number };

/**
 * Remembers the current position for the page that is about to load. Called by the language
 * switch, so the other language opens where this one was being read.
 */
export function rememberScrollPosition() {
  const navbar = document.querySelector("[data-nav-bar]")?.clientHeight ?? 0;
  // The slots are in normal flow even while their panels are pinned.
  const slots = Array.from(
    document.querySelectorAll<HTMLElement>(".stack-slot"),
  );
  const current = slots.findLast(
    (slot) => slot.getBoundingClientRect().top <= navbar + 1,
  );
  const panel = current?.querySelector<HTMLElement>("[data-stack-panel]");
  if (!current || !panel) return;

  const position: ScrollPosition = {
    section: current.id,
    ratio: (navbar - current.getBoundingClientRect().top) / panel.offsetHeight,
    at: Date.now(),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch {
    // Storage is unavailable: the other language opens at the top.
  }
}

/**
 * Runs at the end of `<body>`, when the sections exist and before the first paint, and scrolls
 * to the remembered position. Inline for the same reason as the skin script: waiting for the
 * client bundle would show the top of the page first.
 */
export const restoreScrollScript = `(function(){try{var raw=sessionStorage.getItem("${STORAGE_KEY}");if(!raw)return;sessionStorage.removeItem("${STORAGE_KEY}");var p=JSON.parse(raw);if(Date.now()-p.at>${MAX_AGE})return;var slot=document.getElementById(p.section);var panel=slot&&slot.querySelector("[data-stack-panel]");var bar=document.querySelector("[data-nav-bar]");if(!panel)return;window.scrollTo(0,slot.getBoundingClientRect().top+window.scrollY-(bar?bar.clientHeight:0)+p.ratio*panel.offsetHeight)}catch(e){}})()`;
