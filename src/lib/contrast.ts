type Rgb = [number, number, number];

/** Parses `#rgb`, `#rrggbb` and `rgb()` / `rgba()` strings. */
export function parseColor(value: string): Rgb {
  const color = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color)?.[1];
  if (hex) {
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((digit) => digit + digit)
            .join("")
        : hex;
    return [0, 2, 4].map((start) =>
      parseInt(full.slice(start, start + 2), 16),
    ) as Rgb;
  }
  const channels = /^rgba?\(([^)]+)\)$/i.exec(color)?.[1].match(/[\d.]+/g);
  if (channels && channels.length >= 3) {
    return channels.slice(0, 3).map(Number) as Rgb;
  }
  throw new Error(`Unsupported colour: "${value}"`);
}

/** WCAG 2 relative luminance of an sRGB colour. */
export function relativeLuminance([red, green, blue]: Rgb): number {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two colours, from 1 to 21. */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(parseColor(foreground));
  const b = relativeLuminance(parseColor(background));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
