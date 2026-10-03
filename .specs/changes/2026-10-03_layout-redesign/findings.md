# Findings — Layout redesign: stacked sections, carousels, pixel art, 8-bit and Inspector modes

Measured on macOS, Node 22.21.0, Lighthouse 13.5.0 with Playwright's Chromium (build 1243), against
`next build && next start` on localhost. Local runs have no network latency, so they score higher than
PageSpeed Insights will; the timings are the useful signal.

## Baseline (2026-10-03, branch at `96880d8`, site code identical to `main`)

`npm run audit`, median of 5 runs. "Simulated" is what Lighthouse scores; "observed" is the unthrottled
timing of the same load.

| Preset  | Performance | Accessibility | Best Practices | SEO | Simulated FCP | Simulated LCP | Observed FCP | Observed LCP | TBT  | CLS | Script transferred |
| ------- | ----------- | ------------- | -------------- | --- | ------------- | ------------- | ------------ | ------------ | ---- | --- | ------------------ |
| mobile  | 95          | 96            | 100            | 100 | 754 ms        | 2985 ms       | 38 ms        | 980 ms       | 2 ms | 0   | 200.2 KB           |
| desktop | 100         | 96            | 100            | 100 | 204 ms        | 619 ms        | 44 ms        | 981 ms       | 0 ms | 0   | 200.2 KB           |

- **LCP waits for hydration.** The observed LCP is 0.94 s after the observed FCP in both presets. The LCP
  element is the hero label (`<p … style="opacity: 1; transform: none;">`), a framer-motion element that
  becomes visible only after the bundle runs, its delay passes and its animation ends. The five runs
  differ by at most 15 ms, so the gap is not noise.
- **Accessibility is 96 because of contrast.** The only failing audit is `color-contrast`, on
  `<a href="#projetos" class="btn-accent">` (white on `#16a34a`, 3.30:1).
- **Initial JavaScript is 200.2 KB transferred.** This is the baseline for the "baseline plus 15 KB"
  criterion.
- **PageSpeed Insights could not be measured.** The public API answered 429 ("Quota exceeded … Queries per
  day") twice on 2026-10-03, hours apart. No production baseline exists yet.

The observed columns were measured afterwards, from a worktree of `96880d8` with its own `npm ci`; the
scores and simulated timings of that second measurement matched the first one exactly.

## The local mobile score is pinned by the simulation, not by the page

Lighthouse estimates the mobile LCP from the observed load: every request that ended before the observed
LCP is treated as if it had blocked rendering. On localhost all nine scripts (200 KB) arrive within 24 ms,
before the first paint at about 45 ms, so the pessimistic half of the estimate always includes all of
them. Evidence, one mobile run after phase 1: observed FCP 48 ms and LCP 48 ms, simulated LCP 2986 ms,
LCP score 0.78, every other metric at 1.00.

Consequences:

- The simulated mobile LCP did not move when the hero became static (2985 ms before, 2982 ms after),
  although the observed LCP fell from 980 ms to 43 ms. On a real network the scripts do not all arrive
  before the first paint, so PageSpeed Insights is expected to reward the change; that is still to be
  measured.
- Performance is `0.25 × 0.78 + 0.75 = 0.945`, which rounds to 95. The local mobile score is exactly on
  the acceptance threshold, and what moves it is the number of bytes loaded before the first paint, not
  when the hero renders. Any JavaScript added to the first load can cost the point.

## Defects found while measuring, not listed in `spec.md`

- **Animated headings lose the spaces between words.** `AnimatedText` renders one `<span>` per word with
  no whitespace between them. The served `h1` has the text content `MATHEUSKERSCHER`, and the first `h2`
  `Apaixonadoporcriarexperiênciasdigitaisquefazemsentido.` Crawlers and screen readers get one word.
  Evidence: `curl -s http://localhost:3100/` with the tags stripped. Fixed in phase 1, and the `ssr` suite
  asserts the text.

## Phase 1 — foundations (2026-10-03)

`npm run audit`, median of 5 runs:

| Preset  | Performance | Accessibility | Best Practices | SEO | Simulated FCP | Simulated LCP | Observed FCP | Observed LCP | TBT  | CLS | Script transferred |
| ------- | ----------- | ------------- | -------------- | --- | ------------- | ------------- | ------------ | ------------ | ---- | --- | ------------------ |
| mobile  | 95          | 100           | 100            | 100 | 904 ms        | 2982 ms       | 43 ms        | 43 ms        | 2 ms | 0   | 200.7 KB           |
| desktop | 100         | 100           | 100            | 100 | 244 ms        | 638 ms        | 39 ms        | 39 ms        | 0 ms | 0   | 200.7 KB           |

- **LCP is now the first paint.** The LCP element is the static `<h1 id="hero-heading">`, and the observed
  LCP equals the observed FCP.
- **Accessibility is 100** with the new tokens.
- **The simulated FCP rose by 150 ms** (754 to 904 ms on mobile), one simulated round trip. It still scores
  1.00. Not investigated further.
- **Firefox alone reported `target-size`** on the email and site links of the signature preview on
  `/email-signature` (two 13 px lines, 2 px apart). The preview now renders them as plain text; they are
  links only in the copied HTML, which is unchanged apart from its colours.
- **The signature preview was unreadable in the dark theme before this work:** the name is `#111111` and
  the preview box was `#1a1a1a`. The box is now white in both themes, since it previews an email.

## Phase 3 — layout (2026-10-03)

`npm run audit`, median of 5 runs, before and after the first contingency step of `design.md`:

| Build                      | Preset  | Performance | Simulated FCP | Simulated LCP | Observed FCP | Observed LCP | Script transferred |
| -------------------------- | ------- | ----------- | ------------- | ------------- | ------------ | ------------ | ------------------ |
| stack, carousels, portrait | mobile  | 93          | 905 ms        | 3280 ms       | 39 ms        | 39 ms        | 201.9 KB           |
| stack, carousels, portrait | desktop | 100         | 244 ms        | 680 ms        | 40 ms        | 40 ms        | 201.9 KB           |
| + `experimental.inlineCss` | mobile  | 96          | 942 ms        | 2781 ms       | 41 ms        | 41 ms        | 201.9 KB           |
| + `experimental.inlineCss` | desktop | 100         | 252 ms        | 699 ms        | 50 ms        | 50 ms        | 201.9 KB           |

Accessibility, Best Practices and SEO are 100 in every row. The LCP element is the `h1` in both presets.

- **The portrait cost two points on mobile.** The observed LCP did not change, but the simulated LCP rose
  by 300 ms: the image is a high-priority request that ends before the first paint, so it counts in both
  halves of the estimate. JavaScript grew by only 1.2 KB over phase 1.
- **`experimental.inlineCss` was applied, as the first contingency step.** It removes the only
  render-blocking request and took the simulated mobile LCP from 3280 ms to 2781 ms. The cost is in the
  document: the stylesheet is inlined twice, in `<style>` and in the RSC payload, so `index.html` is
  43.8 KB gzipped. The other steps (`LazyMotion`, Lenis on idle) have not been needed so far.

Behaviour that differed from `design.md`, or was found by the new suites:

- **A Tailwind utility beats a rule of the `components` layer.** The hero had the `relative` class for its
  scroll cue, which overrode `position: sticky`, so the hero alone did not pin. `.stack-panel` is now
  positioned in the stylesheet and panels must not carry a position utility.
- **The back-to-top button covered the footer icons** on viewports narrower than 1216 px, before this
  work too. Found by the focus test in `mobile-chrome`. The footer now keeps clear of the button.
- **`/email-signature` scrolled 71 px sideways at 320 px**, before this work too: a grid item is as wide
  as its widest unbreakable content. Fixed with `min-w-0`.
- **The `h1` did not fit a 320 px screen** at its 3 rem minimum and was clipped by the hero. Its size is
  now `clamp(2.5rem, 7.5vw + 1rem, 6.5rem)`, and the reflow test also looks for clipped elements.
- **Carousel buttons during a smooth scroll.** A second click was computed from the position in between
  and went nowhere; the controls now continue from where the scroll is heading. At the end of the track
  the item starts are capped, otherwise "previous" aimed at a position past the end.
- **Lenis `anchors` and `allowNestedScroll` work as assumed.** In-page links land on the slot in both
  directions and on a direct load, and a horizontal wheel gesture scrolls the carousel in Chromium,
  Firefox and WebKit while a vertical one scrolls the page. Whether the anchor scroll shows a visible
  jump has not been checked by eye.
- **Playwright facts.** `page.evaluate` works with `javaScriptEnabled: false` in the three engines, so the
  no-JavaScript tests can measure geometry. `mouse.wheel` does not exist in mobile WebKit. WebKit does
  not move focus to links with Tab, so the focus test covers links only in Chromium and Firefox.
