/**
 * A 16×16 version of the pixel-art portrait, drawn inline so it costs no request. One character
 * per pixel; the colours are those of `scripts/pixel-assets.mjs`.
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
  H: "#3b2b22",
  S: "#f0bf9d",
  I: "#111111",
  W: "#f6f2ea",
  K: "#3a2416",
  M: "#a8514f",
  B: "#28345a",
  L: "#3b4b7c",
};

/** Horizontal runs of the same colour, so the SVG has few rectangles. */
const RUNS = PIXELS.flatMap((line, y) => {
  const runs: { x: number; y: number; width: number; fill: string }[] = [];
  for (let x = 0; x < line.length; x += 1) {
    const fill = COLOURS[line[x]];
    const last = runs.at(-1);
    if (!fill) continue;
    if (last && last.fill === fill && last.x + last.width === x)
      last.width += 1;
    else runs.push({ x, y, width: 1, fill });
  }
  return runs;
});

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
          fill={run.fill}
        />
      ))}
    </svg>
  );
}
