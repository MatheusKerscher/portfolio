import type { ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import PixelIcon from "./pixel-icon";
import { pause, play } from "./pixel-icons";

type MarqueeProps = {
  /** Shown above the band, and the accessible name of its region. */
  label: string;
  /** Accessible name of the control that stops the movement, e.g. "Pausar animação". */
  pauseLabel: string;
  /** The items, each one a `MarqueeItem`. */
  children: ReactNode;
};

/**
 * A band of items that moves on its own, in a loop. It is CSS only: the list is rendered twice
 * side by side, the pair is shifted by the width of one copy and starts again. The second copy
 * is hidden from assistive technology.
 *
 * - Content that moves on its own needs a way to stop it (WCAG 2.2.2). The control is a
 *   checkbox, read by the stylesheet with `:has()`, so it works before hydration and without
 *   JavaScript. A pointer over the band, a press on it and keyboard focus stop it as well.
 * - Under `prefers-reduced-motion` nothing moves: the list wraps and the second copy is not
 *   displayed (see `.marquee-track` in globals.css), and neither is the control. The control
 *   is hidden by a utility: its `flex` utility would win over a rule of the stylesheet.
 * - Below `lg` the label is centred and the control goes below the band, like the controls of
 *   a carousel; the row that holds them dissolves (`contents`).
 */
export function Marquee({ label, pauseLabel, children }: MarqueeProps) {
  return (
    <div className="marquee max-lg:flex max-lg:flex-col">
      <div className="mb-(--panel-gap-sm) flex items-center justify-between gap-6 max-lg:contents">
        <h3 className="text-xs font-semibold tracking-widest text-ink-muted uppercase max-lg:mb-(--panel-gap-sm) max-lg:text-center">
          {label}
        </h3>
        <label
          title={pauseLabel}
          className="marquee-pause flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center border border-line-strong text-ink transition-colors duration-200 hover:border-brand hover:text-brand motion-reduce:hidden max-lg:order-last max-lg:mt-5 max-lg:self-center"
        >
          <input
            type="checkbox"
            aria-label={pauseLabel}
            className="peer sr-only"
          />
          {/* Each state holds both drawings of its icon; the wrappers swap the states. */}
          <span className="contents peer-checked:hidden">
            <Pause
              size={16}
              aria-hidden="true"
              data-icon="vector"
              className="pixel:hidden"
            />
            <PixelIcon grid={pause} />
          </span>
          <span className="hidden peer-checked:contents">
            <Play
              size={16}
              aria-hidden="true"
              data-icon="vector"
              className="pixel:hidden"
            />
            <PixelIcon grid={play} />
          </span>
        </label>
      </div>
      <div
        role="region"
        aria-label={label}
        tabIndex={0}
        data-marquee
        className="marquee-viewport -mx-6 lg:-mx-8"
      >
        <div className="marquee-track">
          <ul className="marquee-list">{children}</ul>
          <ul aria-hidden="true" className="marquee-list">
            {children}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** One item of the band, followed by the square that separates it from the next. */
export function MarqueeItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex flex-none items-center gap-10">
      {children}
      <span
        aria-hidden="true"
        className="marquee-separator h-1.5 w-1.5 bg-brand"
      />
    </li>
  );
}
