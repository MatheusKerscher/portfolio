"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DOT_STEP,
  MAX_DOTS,
  dotProgress,
  dotWindowStart,
  dotWindowWidth,
} from "@/lib/carousel-dots";
import PixelIcon from "./pixel-icon";
import { chevronLeft, chevronRight } from "./pixel-icons";

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
  /** Number of items, one dot each, and how far the list is scrolled in items. */
  count: number;
  dot: number;
};

const INITIAL: Position = {
  overflows: true,
  atStart: true,
  atEnd: false,
  visible: 0,
  progress: 0,
  count: 0,
  dot: 0,
};

/**
 * What tells where a `Carousel` is and moves it. From `md` up: previous and next buttons and a
 * position bar. Below it: dots, one per item. On a touch screen the gesture is to drag, so a
 * button would spend space on what the finger already does; what is missing there is how much
 * more there is. Both are rendered at every width and the stylesheet shows one of them.
 */
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
      // One dot per item, not per screenful: the two disagree when they do not divide evenly.
      const count = viewport.querySelectorAll(".carousel-item").length;
      setPosition({
        overflows: max > 1,
        atStart: viewport.scrollLeft <= 1,
        atEnd: viewport.scrollLeft >= max - 1,
        visible: viewport.clientWidth / viewport.scrollWidth,
        progress: max > 0 ? viewport.scrollLeft / max : 0,
        count,
        dot: dotProgress(viewport.scrollLeft, max, count),
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
    // The box of the region does not change when an item is added or removed; its list does.
    const track = viewport.firstElementChild;
    if (track) observer.observe(track);

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
    "carousel-button flex h-11 w-11 items-center justify-center border border-line-strong text-ink transition-colors duration-200 hover:border-brand hover:text-brand aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:border-line-strong aria-disabled:hover:text-ink max-md:hidden";

  // Which dot is lit is a discrete choice, so it rounds. The ends of the window follow it, and
  // the window itself follows the unrounded position: it glides with the scroll.
  const { count, dot } = position;
  const active = Math.round(dot);
  const windowStart = dotWindowStart(active, count);
  const windowEnd = windowStart + MAX_DOTS - 1;

  return (
    <div
      data-js-only
      data-overflows={position.overflows}
      className="flex shrink-0 items-center gap-4 data-[overflows=false]:invisible max-lg:order-last max-lg:mt-3 max-lg:justify-center"
    >
      {/* Below `lg` it sits between the two buttons, which are placed around it by `order`. */}
      <div
        aria-hidden="true"
        className="relative h-0.5 w-24 bg-line max-lg:order-2 max-md:hidden"
      >
        <div
          className="absolute inset-y-0 bg-brand"
          style={{
            width: `${position.visible * 100}%`,
            left: `${position.progress * (1 - position.visible) * 100}%`,
          }}
        />
      </div>
      <div className="flex gap-2 max-lg:contents">
        {/* aria-disabled, not disabled: the button keeps the focus when it reaches an end. */}
        <button
          type="button"
          aria-label={previousLabel}
          aria-controls={viewportId}
          aria-disabled={position.atStart}
          onClick={() => move(-1)}
          className={`${buttonClass} max-lg:order-1`}
        >
          <ChevronLeft
            size={18}
            aria-hidden="true"
            data-icon="vector"
            className="pixel:hidden"
          />
          <PixelIcon grid={chevronLeft} />
        </button>
        <button
          type="button"
          aria-label={nextLabel}
          aria-controls={viewportId}
          aria-disabled={position.atEnd}
          onClick={() => move(1)}
          className={`${buttonClass} max-lg:order-3`}
        >
          <ChevronRight
            size={18}
            aria-hidden="true"
            data-icon="vector"
            className="pixel:hidden"
          />
          <PixelIcon grid={chevronRight} />
        </button>
      </div>

      {/*
        Hidden from assistive technology and not clickable: it says nothing the scrollable region
        does not already expose. Every dot is always rendered and the row slides inside a window
        of `MAX_DOTS`; slicing the list instead would remount the dots on every step.
      */}
      {count > 1 && (
        <div
          aria-hidden="true"
          data-carousel-dots={viewportId}
          className="carousel-dots md:hidden"
          style={{ width: dotWindowWidth(count) }}
        >
          <div
            className="carousel-dots-track"
            style={{
              transform: `translateX(-${dotWindowStart(dot, count) * DOT_STEP}px)`,
            }}
          >
            {Array.from({ length: count }, (_, index) => (
              <span
                key={index}
                className="carousel-dot"
                data-active={index === active}
                // A dot at an end of the window is smaller when there are more beyond it.
                data-edge={
                  (index === windowStart && windowStart > 0) ||
                  (index === windowEnd && windowEnd < count - 1)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
