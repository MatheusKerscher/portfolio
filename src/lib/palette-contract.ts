export type PalettePair = {
  /** CSS variable of the colour on top. */
  foreground: string;
  /** CSS variable of the colour behind it. */
  background: string;
  /** WCAG 2.2 AA minimum: 4.5 for text, 3 for the boundary of a control. */
  minimum: 4.5 | 3;
};

/**
 * The colour pairs the interface uses, and the contrast each one must reach in both themes.
 * `e2e/palette.spec.ts` computes them from the live CSS variables of `globals.css`.
 */
export const palettePairs: PalettePair[] = [
  { foreground: "--ink", background: "--paper", minimum: 4.5 },
  { foreground: "--ink", background: "--surface", minimum: 4.5 },
  { foreground: "--ink-muted", background: "--paper", minimum: 4.5 },
  { foreground: "--ink-muted", background: "--surface", minimum: 4.5 },
  { foreground: "--brand", background: "--paper", minimum: 4.5 },
  { foreground: "--brand", background: "--surface", minimum: 4.5 },
  { foreground: "--on-brand", background: "--brand", minimum: 4.5 },
  { foreground: "--on-brand", background: "--brand-hover", minimum: 4.5 },
  { foreground: "--danger", background: "--paper", minimum: 4.5 },
  { foreground: "--danger", background: "--surface", minimum: 4.5 },
  { foreground: "--line-strong", background: "--paper", minimum: 3 },
  { foreground: "--line-strong", background: "--surface", minimum: 3 },
];
