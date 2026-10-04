/**
 * Side of a dot, and that side plus the gap to the next dot, in CSS pixels. The stylesheet
 * (`.carousel-dot`, `.carousel-dots-track`) draws the same two numbers.
 */
export const DOT_SIZE = 6;
export const DOT_STEP = 12;

/** How many dots are on screen at once when a carousel has more items than that. */
export const MAX_DOTS = 5;

/**
 * Where the scroll is, in items: 0 at the start and `count - 1` at the end. It is a fraction of
 * the scrollable distance, not a number of viewport widths, so the last dot is always reached.
 */
export function dotProgress(
  scrollLeft: number,
  maxScroll: number,
  count: number,
) {
  return maxScroll > 0 ? (scrollLeft / maxScroll) * (count - 1) : 0;
}

/**
 * The first dot of the window of visible ones: the window is centred on `position` and held
 * inside the row. With a whole `position` it says which dots are at the ends of the window; with
 * a fraction it moves the window with the scroll instead of in steps. It is 0 when every dot fits.
 */
export function dotWindowStart(
  position: number,
  count: number,
  visible = MAX_DOTS,
) {
  const half = Math.floor(visible / 2);
  const lastStart = Math.max(0, count - visible);
  return Math.min(Math.max(0, position - half), lastStart);
}

/** Width of the window, which clips the row of dots. */
export const dotWindowWidth = (count: number, visible = MAX_DOTS) =>
  Math.min(count, visible) * DOT_STEP - (DOT_STEP - DOT_SIZE);
