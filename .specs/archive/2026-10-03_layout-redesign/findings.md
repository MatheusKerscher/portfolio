# Findings — Layout redesign: stacked sections, carousels, pixel art, 8-bit and Inspector modes

Measured on 2026-10-03 on macOS, Node 22.21.0, Lighthouse 13.5.0 with Playwright's Chromium (build
1243), against `next build && next start`. Every number is the median of 5 runs unless it says otherwise.
"Simulated" is what Lighthouse scores; "observed" is the unthrottled timing of the same load.

## How the site is measured, and why not on the raw localhost

**On the raw localhost the mobile score flips between two values.** After the hero became static, five
identical runs gave a simulated LCP of 2409, 2406, 2983, 2983 and 2982 ms. Later builds did the same, 500
to 800 ms apart, so a median of five moved by three or four points between two runs of the same build.

**Cause, from two runs of one build.** Both loaded the same 24 requests (331.6 KB) before the first paint.

| Run | Main-thread tasks                              | First paint | Simulated LCP | Performance |
| --- | ---------------------------------------------- | ----------- | ------------- | ----------- |
| A   | script 18 ms (9.3 ms), hydration 39 ms (14 ms) | 35 ms       | 2706 ms       | 96          |
| B   | script 18 ms (6.4 ms), hydration 31 ms (14 ms) | 55 ms       | 3212 ms       | 93          |

Lighthouse treats what ran before the observed first paint as render-blocking. On localhost every script
arrives within about 20 ms, so whether the first frame is produced before or after hydration is decided
by a few milliseconds of scheduling. A visitor always has a round trip between the document and its
scripts.

**The audit therefore serves the build through a proxy that delays every response**, 40 ms by default
(`--latency`). With it, five runs of one build differ by at most 4 ms of simulated LCP. `--latency=0`
measures the raw localhost. The median of raw runs hid the two modes; where a conclusion had been drawn
from such a median, it is corrected below.

## Before and after, with 40 ms of latency

| Build                 | Preset  | Performance | Accessibility | Best Practices | SEO | Simulated FCP | Simulated LCP | Observed FCP | Observed LCP | TBT  | CLS | Script transferred |
| --------------------- | ------- | ----------- | ------------- | -------------- | --- | ------------- | ------------- | ------------ | ------------ | ---- | --- | ------------------ |
| baseline (`96880d8`)  | mobile  | 94          | 96            | 100            | 100 | 834 ms        | 3093 ms       | 126 ms       | 1082 ms      | 0 ms | 0   | 200.2 KB           |
| baseline (`96880d8`)  | desktop | 100         | 96            | 100            | 100 | 284 ms        | 736 ms        | 109 ms       | 1076 ms      | 0 ms | 0   | 200.2 KB           |
| after phase 5         | mobile  | 100         | 100           | 100            | 100 | 987 ms        | 1587 ms       | 122 ms       | 122 ms       | 1 ms | 0   | 195.4 KB           |
| after phase 5         | desktop | 100         | 100           | 100            | 100 | 326 ms        | 446 ms        | 119 ms       | 119 ms       | 0 ms | 0   | 195.4 KB           |
| final (`75db4b7`)     | mobile  | 100         | 100           | 100            | 100 | 984 ms        | 1584 ms       | 121 ms       | 121 ms       | 0 ms | 0   | 197.9 KB           |
| final (`75db4b7`)     | desktop | 100         | 100           | 100            | 100 | 325 ms        | 445 ms        | 117 ms       | 117 ms       | 0 ms | 0   | 197.9 KB           |
| phase 6.2 (`ecefe2f`) | mobile  | 100         | 100           | 100            | 100 | 986 ms        | 1586 ms       | 118 ms       | 118 ms       | 1 ms | 0   | 197.9 KB           |
| phase 6.2 (`ecefe2f`) | desktop | 100         | 100           | 100            | 100 | 325 ms        | 445 ms        | 118 ms       | 118 ms       | 0 ms | 0   | 197.9 KB           |

The baseline is `main` (the site code of `96880d8`), built in a separate worktree with its own `npm ci`.
The final rows are the build of `75db4b7`, with the Inspector and the adjustments of phase 6.1. The rows
of phase 6.2 are the build of `ecefe2f`, measured on 2026-10-04 after the panels were made to fit below
the navbar; they are the values in `src/app/data/audit.json`.

- **LCP waited for hydration.** In the baseline the observed LCP is about 0.95 s after the observed FCP in
  both presets. The LCP element was the hero label (`<p … style="opacity: 1; transform: none;">`), a
  framer-motion element that became visible only after the bundle ran, its delay passed and its animation
  ended. Now the LCP element is the static `<h1 id="hero-heading">` and the observed LCP equals the
  observed FCP.
- **Accessibility was 96 because of contrast.** The only failing audit was `color-contrast`, on
  `<a href="#projetos" class="btn-accent">` (white on `#16a34a`, 3.30:1).
- **Initial JavaScript went from 200.2 KB to 197.9 KB transferred**, with the stack, the carousels, the
  8-bit mode, the Easter egg and the Inspector toggle added (195.4 KB after phase 5). The Inspector panel
  is not part of it: it is fetched when opened. The criterion is "baseline plus 15 KB".
- **PageSpeed Insights could not be measured.** The public API answered 429 ("Quota exceeded … Queries per
  day") on every attempt on 2026-10-03. No production number exists yet.

## Raw localhost history

Kept for the record. Each cell is the five mobile runs, as performance@simulated LCP.

| Build                                             | Mobile runs                             | Script transferred |
| ------------------------------------------------- | --------------------------------------- | ------------------ |
| baseline                                          | 95@2991 95@2985 95@2982 95@2985 95@2984 | 200.2 KB           |
| phase 1 (static hero, tokens)                     | 98@2409 98@2406 95@2983 95@2983 95@2982 | 200.7 KB           |
| phase 3 (stack, carousels, portrait)              | 92@3372 97@2557 93@3280 93@3212 93@3289 | 201.9 KB           |
| phase 3 with `inlineCss`                          | 97@2562 96@2708 92@3361 93@3285 96@2781 | 201.9 KB           |
| phase 5 (8-bit mode), `inlineCss` on              | 97@2635 93@3286 96@2783 92@3363 92@3362 | 211.3 KB           |
| the same, `cn` out of the client bundle           | 96@2711 93@3287 92@3362 92@3363 96@2781 | 203.1 KB           |
| the same, `content-visibility: auto` on carousels | 97@2514 93@3211 93@3209 93@3211 93@3210 | 203.1 KB           |
| the same, `LazyMotion` and `m`                    | 98@2482 94@3063 94@3061 94@3062 94@3061 | 189.2 KB           |
| the same, Lenis loaded when idle                  | 98@2480 94@3061 94@3061 94@3059 94@3060 | 189.2 KB           |

The baseline has one mode because its LCP always came after hydration.

## Contingency steps: what each one really did

**`experimental.inlineCss` was adopted in phase 3 on a wrong reading, and is reverted.** The phase 3
median went from 93 to 96 when it was turned on, and that was recorded as a 500 ms gain. The run lists
above show both builds have the same two modes; the median only landed on the other one. Measured
properly, on the phase 5 build with the other steps applied, three runs at 15 and 100 ms and five at 40 ms:

| Latency | `inlineCss` on: performance, simulated LCP | `inlineCss` off: performance, simulated LCP |
| ------- | ------------------------------------------ | ------------------------------------------- |
| 15 ms   | 97, 97, 97 — 2583 to 2585 ms               | 100, 100, 100 — 1535 to 1835 ms             |
| 40 ms   | 97 in all five — 2633 to 2635 ms           | 100 in all five — 1584 to 1588 ms           |
| 100 ms  | 99, 96, 96 — 2158 to 2755 ms               | 100, 100, 100 — 1706 to 1709 ms             |

Inlining costs about a second of simulated LCP at every latency, and it makes the document 43.8 KB
gzipped, because the stylesheet is inlined twice (`<style>` and the RSC payload). A likely reason, not
verified beyond these numbers: while a stylesheet request is in flight Chrome holds back low-priority
script requests, so the scripts are evaluated after the first paint; with the CSS inlined they are
requested at once and evaluated before it.

**The other steps were measured on the raw localhost and then reverted**, because the corrected
measurement is 100 without them and `design.md` applies them only when the measurement asks:

- `LazyMotion` with `m` components: 14 KB less script (203.1 to 189.2 KB) and about 150 ms less simulated
  LCP in the slow mode (3210 to 3061 ms). The first thing to bring back if PageSpeed Insights falls short.
- Lenis loaded by a dynamic import when idle: no measurable change (3061 to 3060 ms).
- `content-visibility: auto` on the carousels (not on the list in `design.md`; tried because the
  thumbnails were loading during the page load): 5 fewer image requests at load (30 to 25) and about
  100 ms in the slow mode (3287 to 3210 ms).

## Defects found on the way, not listed in `spec.md`

- **Animated headings lost the spaces between words.** `AnimatedText` rendered one `<span>` per word with
  no whitespace between them. The served `h1` had the text content `MATHEUSKERSCHER`, and the first `h2`
  `Apaixonadoporcriarexperiênciasdigitaisquefazemsentido.` Fixed in phase 1; the `ssr` suite asserts it.
- **The signature preview was unreadable in the dark theme:** the name is `#111111` and the preview box
  was `#1a1a1a`. The box is now white in both themes, since it previews an email.
- **Firefox alone reported `target-size`** on the email and site links of the signature preview (two
  13 px lines, 2 px apart). The preview now renders them as plain text; they are links only in the copied
  HTML, which is unchanged apart from its colours.
- **The back-to-top button covered the footer icons** on viewports narrower than 1216 px. Found by the
  focus test in `mobile-chrome`. The footer now keeps clear of the button.
- **`/email-signature` scrolled 71 px sideways at 320 px:** a grid item is as wide as its widest
  unbreakable content. Fixed with `min-w-0`.
- **The `h1` did not fit a 320 px screen** at its 3 rem minimum and was clipped by the hero. Its size is
  now `clamp(2.5rem, 7.5vw + 1rem, 6.5rem)`, and the reflow test also looks for clipped elements.

## Behaviour that differed from `design.md`

- **A Tailwind utility beats a rule of the `components` layer.** The hero had the `relative` class for
  its scroll cue, which overrode `position: sticky`, so the hero alone did not pin. `.stack-panel` is now
  positioned in the stylesheet and panels must not carry a position utility. For the same reason the
  rules of the 8-bit skin are unlayered.
- **A custom property that refers to a font variable must be declared where that variable exists.**
  `next/font` variables were on `<body>`, and `--font-display` on `:root` resolved to nothing, so every
  heading fell back to the body font. The font variable classes are now on `<html>`.
- **`cn` in a Client Component ships tailwind-merge to the browser:** 8 KB transferred on every page for
  one toggle (211.3 to 203.1 KB). Client components join their classes by hand.
- **Carousel buttons during a smooth scroll.** A second click was computed from the position in between
  and went nowhere; the controls now continue from where the scroll is heading. At the end of the track
  the item starts are capped, otherwise "previous" aimed at a position past the end.
- **Lenis `anchors` and `allowNestedScroll` work as assumed.** In-page links land on the slot in both
  directions and on a direct load, and a horizontal wheel gesture scrolls the carousel in Chromium,
  Firefox and WebKit while a vertical one scrolls the page. Whether the anchor scroll shows a visible
  jump has not been checked by eye.
- **Next refuses an ICO that holds an indexed PNG.** With a palette PNG inside `src/app/favicon.ico` the
  build failed: `Format error decoding Ico: The PNG is not in RGBA format!` The favicon is written as a
  32-bit RGBA PNG (450 bytes); every other asset stays indexed.
- **Pixelify Sans covers the pt-BR diacritics.** `ÁÉÍÓÚÂÊÔÃÕÇ áéíóúâêôãõç` rendered in an 8-bit heading
  shows no fallback glyph; its `latin` subset is U+0000–00FF.
- **Lazy images inside `display: none` are not requested** in Chromium, Firefox and WebKit: the `skin`
  suite finds no request for the sprite or the 8-bit thumbnails in the normal skin, and the pixel font
  stays `unloaded`.

## Facts about the tools

- `page.evaluate` works with `javaScriptEnabled: false` in the three engines, so the no-JavaScript tests
  can measure geometry.
- `mouse.wheel` does not exist in mobile WebKit, and WebKit does not move focus to links with Tab, so the
  wheel test is desktop only and the focus test covers links only in Chromium and Firefox.
- A click that Playwright retries makes it scroll the page with different alignments. On the stack that
  covers the hero, so a test that clicks during the skin cross-fade must first wait for it to end.
- The `no-img-element` rule does not fire in `opengraph-image.tsx`; a disable comment there is reported
  as unused.
- `sharp` 0.35.5 does not cap a PNG palette at the number given in `colours`: the option only selects
  the bit depth. Measured on a 150×90 resize of a project screenshot: `colours` 8 and 16 both write 16
  colours; 17, 24, 32, 64 and 128 all write 254. `palette: true` changes nothing. The 8-bit thumbnails
  had been asking for 24 and getting 254; they now ask for 16 (532 to 1,560 bytes each, from 1,976 to
  4,783).
- A test file imports JSON only with an import attribute, and spec files cannot import each other, so
  `inspector.spec.ts` reads `audit.json` from disk and shared helpers live in `e2e/helpers.ts`.
- axe reads a colour in the middle of a CSS transition. A tab trigger whose background flips at once
  while its text colour fades reported `color-contrast`; the Inspector tabs have no transition.

## The adjustments of phase 6.1

- **The stack below the navbar.** With the navbar outside the panels, the sections lost the padding that
  used to clear it (6 rem to 4 rem; the hero from 6 rem to 2 rem at the top). Measured on the production
  build: at 1440×900 (836 px below the navbar) and at 1920×1080 (1016 px) every panel is exactly that
  space tall, so each one pins with its top at the navbar. At 1366×768 (704 px) "Sobre" is 832 px and
  "Projetos" 795 px, and on a Pixel 7 (775 px) "Sobre" is 1061 px: those pin by their bottom edge and
  their top scrolls behind the opaque navbar, as on any page with a fixed header. Before the padding
  change, a screenshot at 1440×900 showed the top of "Sobre" behind the navbar while it was pinned.
- **Lenis applies the scroll margin.** The in-page link test ends with the top of the panel within 1 px
  of the bottom edge of the navbar in the five projects.
- **Showing the navbar toggles with CSS needed no state.** They are in the server HTML with
  `display: none` and the `pixel` variant displays them; `getByRole` does not see them in the normal
  skin, which is what the tests assert.
- **Closing the Inspector when the skin is left** is a state update during render, guarded by its
  condition (`if (open && !pixel) setOpen(false)`). ESLint accepts it, and the `inspector` suite checks
  that the panel is gone.
- **The suite after the adjustments:** 236 passed, 99 skipped, in 1.4 minutes. The skipped ones are the
  theme and skin matrix of axe and the palette outside desktop Chromium, and the desktop-only tests on
  mobile.

## The adjustment of phase 6.2

On the requester's screen, 1512×749 with 685 px below the navbar, "Sobre" needed 835 px and "Projetos"
797 px. Both pinned by their bottom edge and rested with their heading cut by the navbar. What phase 6.1
recorded as "as on any page with a fixed header" is true while the page moves; a pinned panel stays in
that position, which is what the requester saw.

Height each panel needs for its content, production build, Chromium:

| Viewport  | Space | Before: Sobre | Before: Projetos | After: Sobre | After: Projetos | After: Hero |
| --------- | ----- | ------------- | ---------------- | ------------ | --------------- | ----------- |
| 1512×749  | 685   | 835           | 797              | 657          | 642             | 583         |
| 1280×720  | 656   | 824           | 792              | 632          | 620             | 579         |
| 1024×768  | 704   | 831           | 780              | 694          | 652             | 586         |
| 1920×1080 | 1016  | 835           | 797              | 835          | 797             | 613         |

Margin of the tallest panel against the space below the navbar (negative fits), measured over widths
from 1152 to 2560 px, where it does not depend on the width:

| Viewport height | 600 | 625 | 640 | 660 | 700 | 749 | 800 | 900 | 960 |
| --------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Normal skin     | +32 | +7  | −8  | −14 | −21 | −28 | −36 | −52 | −61 |
| 8-bit skin      | +34 | +9  | −6  | −11 | −18 | −25 | −33 | −49 | −58 |

- Firefox and WebKit give the same margins as Chromium at the heights checked (640, 660, 749, 900).
- At 1024 px wide the biography wraps onto a third line, and "Sobre" misses by 4 to 18 px between 640
  and 720 px of height. The padding above its label is at least 19 px there, so nothing visible is cut.
- Below 640 px the hero is the first to miss. At 625 px it is by 7 px, inside its 32 px of top padding.
- Phones are untouched: on a Pixel 7 "Sobre" is still 1061 px, as in phase 6.1.
- A `max-height` on a box with `aspect-ratio` keeps the full width and cuts the height, so the project
  thumbnail is cropped from the bottom instead of the card getting narrower.

## The sprite

The drawn draft (92×92, 18 colours, 850 bytes, four rounds of review against the photo) was shown to the
requester on a contact sheet. The answer was a generated pixel-art portrait added to the branch, which
is now the source (`scripts/assets/portrait-art.jpeg`, 1024×1024, 331 KB, not served).

- A generated image is not pixel art: resized straight to 92×92 it has 2,376 colours. One median colour
  per cell, taken from the middle half of the cell, gives clean cells.
- The first palette reduction was a median cut. It wrote three near-identical navy tones for the shirt
  and seven for the skin, because it splits by population. Merging each colour into the most frequent
  one within reach keeps one tone per flat area and leaves the palette for the details.
- Cells on the edge of the white outline are a mix of white and background. Kept, they showed as a cream
  fringe on a paper or dark background; they now go with whichever of the two they have more of.
- Result: `public/avatar/avatar.png` is 92×92, indexed, 30 colours with transparency, 1,250 bytes. A
  second run of `npm run assets:pixel` produces byte-identical files.
- The tile behind it changed from the yellow of the reference to the `brand` green at the requester's
  request. The white outline keeps the figure apart from the tile in both themes (`#137a3a` and
  `#4ade80`); on a white or near-black tile it would disappear in one of them.

## Rollout (2026-10-04)

- **Pull requests:** #44 carried the four specs of the redesign and was merged with one test of the
  `E2E` workflow red; #45 fixed what that test had found and was merged with every check green.
- **Production**, `https://kerscher.dev.br`, checked with `curl` after the deploy of `24d20b1`:

  | Request                        | Answer                                                         |
  | ------------------------------ | -------------------------------------------------------------- |
  | `/`                            | 200, `lang="pt-BR"`, canonical and three `hreflang` alternates |
  | `/en`                          | 200, `lang="en"`, canonical and three `hreflang` alternates    |
  | `https://www.kerscher.dev.br/` | 308 to the apex                                                |
  | `/llms.txt`, `/en/llms.txt`    | 200; the second with `Content-Language: en`                    |
  | `/pt`, `/email-signature`      | 308 to `/`                                                     |
  | `/sitemap.xml`                 | 200                                                            |

- **PageSpeed Insights:** the API answered 429 again, "Quota exceeded for quota metric 'Queries'", as on
  2026-10-03. The requester ran it in the browser and reported 100 on mobile and on desktop.
- **JSON-LD and real devices:** validated by the requester, in validator.schema.org and on phones.
- **README thumbnail:** recaptured from `/en` on production, 1500×900.
