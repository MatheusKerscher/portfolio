"use client";

import { useEffect } from "react";
import { useLenis } from "./lenis-context";

const BREATHING_ROOM = 16;

/** The fixed navbar covers this much of the top of the viewport. */
function navbarHeight() {
  return document.querySelector("[data-nav-bar]")?.clientHeight ?? 0;
}

/**
 * Whether something else is painted over the centre of the element. A checkbox drawn by its
 * label is hidden itself, so its label is what is looked at.
 */
function isObscured(focused: Element) {
  const element = focused.closest("label") ?? focused;
  const rect = element.getBoundingClientRect();
  const x = Math.min(
    Math.max(rect.left + rect.width / 2, 0),
    window.innerWidth - 1,
  );
  const y = rect.top + rect.height / 2;
  if (y < 0 || y >= window.innerHeight) return true;
  const top = document.elementFromPoint(x, y);
  return !top || !(element === top || element.contains(top));
}

/**
 * Scrolls a carousel to the item that holds the element, when that item is not wholly inside the
 * visible part of its region. Chromium and Firefox do it on their own when focus moves; WebKit
 * leaves a card focused outside the region, when moving backwards above all. The target is the
 * position of the item itself, which is where the snap of the carousel would leave it.
 */
function revealInCarousel(element: Element) {
  const item = element.closest<HTMLElement>(".carousel-item");
  const region = item?.closest<HTMLElement>("[data-carousel]");
  if (!item || !region) return;

  const frame = region.getBoundingClientRect();
  const box = item.getBoundingClientRect();
  if (box.left >= frame.left - 1 && box.right <= frame.right + 1) return;

  const first = region.querySelector<HTMLElement>(".carousel-item");
  region.scrollLeft = Math.min(
    item.offsetLeft - (first?.offsetLeft ?? 0),
    region.scrollWidth - region.clientWidth,
  );
}

/**
 * Behaviour of the stacked sections; the rules are in globals.css.
 *
 * - Keeps `--panel-h` equal to the height of each panel. A panel only pins once that value
 *   exists, so nothing is hidden before this runs, or if it never runs.
 * - A pinned panel is inside the viewport even while the next one covers it, so the browser
 *   sees a focused element in it as visible and does not scroll. This scrolls to the part of
 *   the page where that element really is visible (WCAG 2.4.11, Focus Not Obscured).
 * - For the same reason a focused card is first brought into its carousel.
 */
export default function StackController() {
  const lenis = useLenis();

  useEffect(() => {
    const panels = document.querySelectorAll<HTMLElement>("[data-stack-panel]");

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const panel = entry.target as HTMLElement;
        panel.style.setProperty("--panel-h", `${panel.offsetHeight}px`);
      }
    });
    panels.forEach((panel) => observer.observe(panel));

    function reveal(element: Element) {
      revealInCarousel(element);

      const panel = element.closest<HTMLElement>("[data-stack-panel]");
      const slot = panel?.parentElement;
      if (!panel || !slot || !isObscured(element)) return;

      const navbar = navbarHeight();
      // The slot is never sticky, so its top is where the panel sits in normal flow.
      const slotTop = slot.getBoundingClientRect().top + window.scrollY;
      const offsetInPanel =
        element.getBoundingClientRect().top - panel.getBoundingClientRect().top;
      // Past this point the panel is pinned and the next one starts to cover it.
      const lastUnpinned = slotTop + panel.offsetHeight - window.innerHeight;
      // Not before the panel reaches the navbar: the previous one would still be on top of it.
      const target = Math.max(
        slotTop - navbar,
        Math.min(
          slotTop + offsetInPanel - navbar - BREATHING_ROOM,
          lastUnpinned,
        ),
      );

      if (lenis.current) lenis.current.scrollTo(target, { immediate: true });
      else window.scrollTo(0, target);
    }

    let frame = 0;
    function onFocusIn(event: FocusEvent) {
      const element = event.target;
      if (!(element instanceof Element)) return;
      // After the browser's own scroll to the focused element.
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => reveal(element));
    }

    document.addEventListener("focusin", onFocusIn);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [lenis]);

  return null;
}
