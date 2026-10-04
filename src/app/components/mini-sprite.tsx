import { runsOf } from "@/lib/pixel-grid";

/**
 * A 16×16 version of the pixel-art portrait, drawn inline so it costs no request. One character
 * per pixel; the colours are taken from the sprite that `scripts/pixel-assets.mjs` exports.
 */
const PIXELS = [
  "................",
  ".....HHHHHH.....",
  "...HHHHHHHHHH...",
  "..HHHHHHHHHHHH..",
  "..HHSSSSSSSSHH..",
  "..HSSSSSSSSSSH..",
  ".SIIIIIISIIIIIIS",
  ".SIWWKWISIWWKWIS",
  ".SIIIIIISIIIIIIS",
  "..SSSSSSSSSSSS..",
  "..SSSHHHHHHSSS..",
  "..SSSSMMMMSSSS..",
  "...SSSSHHSSSS...",
  "....SSHHHHSS....",
  "..BBBLSSSSLBBB..",
  ".BBBBBLSSLBBBBB.",
];

const COLOURS: Record<string, string> = {
  H: "#482c26",
  S: "#f7ab93",
  I: "#322b3a",
  W: "#f8d3a7",
  K: "#301411",
  M: "#bc606f",
  B: "#333b69",
  L: "#3a4775",
};

const RUNS = runsOf(PIXELS);

export default function MiniSprite({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {RUNS.map((run) => (
        <rect
          key={`${run.x}-${run.y}`}
          x={run.x}
          y={run.y}
          width={run.width}
          height={1}
          fill={COLOURS[run.cell]}
        />
      ))}
    </svg>
  );
}
