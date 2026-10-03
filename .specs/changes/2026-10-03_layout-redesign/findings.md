# Findings — Layout redesign: stacked sections, carousels, pixel art, 8-bit and Inspector modes

Measured on macOS, Node 22.21.0, Lighthouse 13.5.0 with Playwright's Chromium (build 1243), against
`next build && next start` on localhost. Local runs have no network latency, so they score higher than
PageSpeed Insights will; the timings are the useful signal.

## Baseline (2026-10-03, branch at `96880d8`, site code identical to `main`)

`npm run audit`, median of 5 runs:

| Preset  | Performance | Accessibility | Best Practices | SEO | FCP    | LCP     | TBT  | CLS | Speed Index | Script transferred |
| ------- | ----------- | ------------- | -------------- | --- | ------ | ------- | ---- | --- | ----------- | ------------------ |
| mobile  | 95          | 96            | 100            | 100 | 754 ms | 2985 ms | 2 ms | 0   | 754 ms      | 200.2 KB           |
| desktop | 100         | 96            | 100            | 100 | 203 ms | 619 ms  | 0 ms | 0   | 203 ms      | 200.2 KB           |

- **LCP waits for hydration.** On mobile LCP is 2.2 s after FCP, and on desktop 0.4 s. The LCP element is
  the hero label (`<p … style="opacity: 1; transform: none;">`), a framer-motion element that only
  becomes visible after the bundle runs. The five runs differ by at most 15 ms, so the gap is not noise.
- **Accessibility is 96 because of contrast.** The only failing audit is `color-contrast`, on
  `<a href="#projetos" class="btn-accent">` (white on `#16a34a`, 3.30:1).
- **Initial JavaScript is 200.2 KB transferred.** This is the baseline for the "baseline plus 15 KB"
  criterion.
- **PageSpeed Insights could not be measured.** The public API answered 429 ("Quota exceeded … Queries per
  day") twice on 2026-10-03, hours apart. No production baseline exists yet.

## Defects found while measuring, not listed in `spec.md`

- **Animated headings lose the spaces between words.** `AnimatedText` renders one `<span>` per word with
  no whitespace between them. The served `h1` has the text content `MATHEUSKERSCHER`, and the first `h2`
  `Apaixonadoporcriarexperiênciasdigitaisquefazemsentido.` Crawlers and screen readers get one word.
  Evidence: `curl -s http://localhost:3100/` with the tags stripped. Fixed in phase 1, and the `ssr` suite
  asserts the text.
