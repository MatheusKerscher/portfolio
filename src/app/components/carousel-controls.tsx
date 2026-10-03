"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselControlsProps = {
  viewportId: string;
  previousLabel: string;
  nextLabel: string;
};

type Position = {
  /** Whether the list is wider than its region. */
  overflows: boolean;
  atStart: boolean;
  atEnd: boolean;
  /** Share of the list that is visible, and how far it is scrolled, both from 0 to 1. */
  visible: number;
  progress: number;
};

const INITIAL: Position = {
  overflows: true,
  atStart: true,
  atEnd: false,
  visible: 0,
  progress: 0,
};

/** Previous and next buttons and the position indicator of a `Carousel`. */
export default function CarouselControls({
  viewportId,
  previousLabel,
  nextLabel,
}: CarouselControlsProps) {
  const [position, setPosition] = useState(INITIAL);
  // Where a smooth scroll started by a button is heading, so a second click during the
  // animation continues from there instead of from the position in between.
  const heading = useRef<number | null>(null);

  useEffect(() => {
    const viewport = document.getElementById(viewportId);
    if (!viewport) return;

    let frame = 0;
    let settled = 0;
    const measure = () => {
      frame = 0;
      const max = viewport.scrollWidth - viewport.clientWidth;
      setPosition({
        overflows: max > 1,
        atStart: viewport.scrollLeft <= 1,
        atEnd: viewport.scrollLeft >= max - 1,
        visible: viewport.clientWidth / viewport.scrollWidth,
        progress: max > 0 ? viewport.scrollLeft / max : 0,
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
      window.clearTimeout(settled);
      settled = window.setTimeout(() => (heading.current = null), 150);
    };

    schedule();
    viewport.addEventListener("scroll", schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(viewport);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settled);
      viewport.removeEventListener("scroll", schedule);
      observer.disconnect();
    };
  }, [viewportId]);

  function move(direction: 1 | -1) {
    const viewport = document.getElementById(viewportId);
    const items = viewport?.querySelectorAll<HTMLElement>(".carousel-item");
    if (!viewport || !items?.length) return;

    // Where each item starts, capped at the end of the track: the last ones cannot reach the
    // left edge. The first item's offset is the left padding of the region.
    const max = viewport.scrollWidth - viewport.clientWidth;
    const origin = items[0].offsetLeft;
    const starts = Array.from(items, (item) =>
      Math.min(item.offsetLeft - origin, max),
    );
    const current = heading.current ?? viewport.scrollLeft;
    const target =
      direction === 1
        ? starts.find((start) => start > current + 1)
        : [...starts].reverse().find((start) => start < current - 1);
    if (target === undefined) return;
    heading.current = target;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    viewport.scrollTo({
      left: target,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  const buttonClass =
    "flex h-11 w-11 items-center justify-center border border-line-strong text-ink transition-colors duration-200 hover:border-brand hover:text-brand aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:border-line-strong aria-disabled:hover:text-ink";

  return (
    <div
      data-js-only
      data-overflows={position.overflows}
      className="flex shrink-0 items-center gap-4 data-[overflows=false]:invisible"
    >
      <div
        aria-hidden="true"
        className="relative hidden h-0.5 w-24 bg-line sm:block"
      >
        <div
          className="absolute inset-y-0 bg-brand"
          style={{
            width: `${position.visible * 100}%`,
            left: `${position.progress * (1 - position.visible) * 100}%`,
          }}
        />
      </div>
      <div className="flex gap-2">
        {/* aria-disabled, not disabled: the button keeps the focus when it reaches an end. */}
        <button
          type="button"
          aria-label={previousLabel}
          aria-controls={viewportId}
          aria-disabled={position.atStart}
          onClick={() => move(-1)}
          className={buttonClass}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={nextLabel}
          aria-controls={viewportId}
          aria-disabled={position.atEnd}
          onClick={() => move(1)}
          className={buttonClass}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
