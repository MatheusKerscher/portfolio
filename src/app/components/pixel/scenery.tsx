import type { CSSProperties } from "react";

type Shape = {
  kind: "square" | "plus" | "diamond" | "triangle" | "ring" | "cloud" | "star";
  /** Where it starts, as a share of the width and of the height of the viewport. */
  x: number;
  y: number;
  /** Its side, in pixels. */
  size: number;
  /** How much of the scroll it follows: the further away, the less. */
  depth: number;
  /** How long one drift takes, in seconds, and where in it the shape starts. */
  time: number;
  delay: number;
};

/** Fixed positions: the same sky on every visit, and nothing to compute while rendering. */
const SHAPES: Shape[] = [
  { kind: "square", x: 4, y: 12, size: 24, depth: 0.1, time: 14, delay: -3 },
  { kind: "plus", x: 14, y: 58, size: 36, depth: 0.22, time: 18, delay: -9 },
  { kind: "ring", x: 23, y: 28, size: 40, depth: 0.14, time: 22, delay: -5 },
  { kind: "diamond", x: 34, y: 82, size: 30, depth: 0.3, time: 16, delay: -1 },
  {
    kind: "triangle",
    x: 44,
    y: 8,
    size: 32,
    depth: 0.18,
    time: 20,
    delay: -12,
  },
  { kind: "square", x: 52, y: 66, size: 16, depth: 0.34, time: 12, delay: -6 },
  { kind: "plus", x: 61, y: 36, size: 24, depth: 0.12, time: 17, delay: -2 },
  { kind: "ring", x: 69, y: 90, size: 28, depth: 0.26, time: 19, delay: -8 },
  {
    kind: "diamond",
    x: 77,
    y: 18,
    size: 40,
    depth: 0.16,
    time: 23,
    delay: -14,
  },
  {
    kind: "triangle",
    x: 85,
    y: 62,
    size: 24,
    depth: 0.28,
    time: 15,
    delay: -4,
  },
  { kind: "square", x: 92, y: 38, size: 32, depth: 0.2, time: 21, delay: -10 },
  { kind: "plus", x: 96, y: 84, size: 20, depth: 0.32, time: 13, delay: -7 },

  { kind: "cloud", x: 8, y: 20, size: 48, depth: 0.06, time: 90, delay: -10 },
  { kind: "cloud", x: 38, y: 48, size: 64, depth: 0.09, time: 120, delay: -70 },
  { kind: "cloud", x: 66, y: 12, size: 40, depth: 0.05, time: 100, delay: -40 },
  { kind: "cloud", x: 82, y: 72, size: 56, depth: 0.08, time: 110, delay: -90 },

  { kind: "star", x: 3, y: 40, size: 4, depth: 0.04, time: 2.4, delay: -1 },
  { kind: "star", x: 10, y: 6, size: 8, depth: 0.07, time: 3.2, delay: -2 },
  { kind: "star", x: 19, y: 74, size: 4, depth: 0.05, time: 2.8, delay: 0 },
  { kind: "star", x: 29, y: 46, size: 4, depth: 0.03, time: 3.6, delay: -3 },
  { kind: "star", x: 37, y: 16, size: 8, depth: 0.06, time: 2.2, delay: -1 },
  { kind: "star", x: 47, y: 88, size: 4, depth: 0.04, time: 3, delay: -2 },
  { kind: "star", x: 56, y: 22, size: 4, depth: 0.05, time: 2.6, delay: 0 },
  { kind: "star", x: 64, y: 54, size: 8, depth: 0.03, time: 3.4, delay: -1 },
  { kind: "star", x: 72, y: 4, size: 4, depth: 0.07, time: 2.4, delay: -2 },
  { kind: "star", x: 80, y: 44, size: 4, depth: 0.04, time: 3.8, delay: -3 },
  { kind: "star", x: 88, y: 94, size: 8, depth: 0.06, time: 2.8, delay: 0 },
  { kind: "star", x: 95, y: 10, size: 4, depth: 0.05, time: 3.2, delay: -1 },
];

/**
 * The background of the 8-bit skin: one fixed layer behind the content, with clouds in the
 * light theme, stars in the dark one, and geometric shapes in both. The content scrolls over
 * it and each shape follows a part of the scroll, which is the parallax. Everything is painted
 * in `--scenery`, a colour the text of the page stays readable on.
 */
export default function Scenery() {
  return (
    <div aria-hidden="true" className="px-scenery">
      {SHAPES.map((shape, index) => (
        <i
          key={index}
          className={`px-shape px-${shape.kind}`}
          style={
            {
              "--x": `${shape.x}%`,
              "--y": shape.y,
              "--s": `${shape.size}px`,
              "--d": shape.depth,
              "--t": `${shape.time}s`,
              "--delay": `${shape.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
