/**
 * Pixel art written as text: one string per row, one character per pixel, `.` for an empty one.
 * A drawing can be read, and reviewed, in the source.
 */
export type PixelGrid = readonly string[];

export type PixelRun = { x: number; y: number; width: number; cell: string };

/** Horizontal runs of the same character, so a drawing takes few rectangles. */
export function runsOf(grid: PixelGrid): PixelRun[] {
  return grid.flatMap((line, y) => {
    const runs: PixelRun[] = [];
    for (let x = 0; x < line.length; x += 1) {
      const cell = line[x];
      const last = runs.at(-1);
      if (cell === ".") continue;
      if (last && last.cell === cell && last.x + last.width === x)
        last.width += 1;
      else runs.push({ x, y, width: 1, cell });
    }
    return runs;
  });
}

/**
 * A drawing in one colour as the `d` of a single SVG path. Runs that sit on top of each other
 * with the same span are one rectangle, which keeps the path, and the markup, short.
 */
export function pathOf(grid: PixelGrid) {
  const rectangles: (PixelRun & { height: number })[] = [];
  for (const run of runsOf(grid)) {
    const above = rectangles.find(
      (rectangle) =>
        rectangle.x === run.x &&
        rectangle.width === run.width &&
        rectangle.y + rectangle.height === run.y,
    );
    if (above) above.height += 1;
    else rectangles.push({ ...run, height: 1 });
  }
  return rectangles
    .map(
      ({ x, y, width, height }) => `M${x} ${y}h${width}v${height}h-${width}z`,
    )
    .join("");
}
