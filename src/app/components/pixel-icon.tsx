import type { CSSProperties } from "react";
import { pathOf, type PixelGrid } from "@/lib/pixel-grid";

type PixelIconProps = {
  /** One of the drawings of `pixel-icons.ts`. */
  grid: PixelGrid;
  /** A multiple of 16, so every pixel of the drawing is a whole number of pixels on screen. */
  size?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * An icon of the 8-bit skin. It sits next to the vector icon it replaces: both are in the markup
 * and the stylesheet shows one, because the skin is only known in the browser. The vector one
 * carries `pixel:hidden` and `data-icon="vector"`.
 *
 * Neither of the two takes a `display` utility of its own, which would compete with the ones
 * that swap them: an icon that is shown conditionally goes inside a wrapper with `contents`.
 */
export default function PixelIcon({
  grid,
  size = 16,
  className = "",
  style,
}: PixelIconProps) {
  return (
    <svg
      data-icon="pixel"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      className={`hidden pixel:block ${className}`}
      style={style}
    >
      <path d={pathOf(grid)} />
    </svg>
  );
}
