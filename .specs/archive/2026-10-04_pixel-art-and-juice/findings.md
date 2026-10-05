# Findings — 8-bit mode: everything in pixel art, and juice

Measured on 2026-10-04 on macOS, Node 22.21.0, Next 16.3.8, against the production build
(`next build && next start -p 3100`). "Before" is `f835431`; "after" is the working tree of the branch
`feat/pixel-art-and-juice`, which is not committed yet.

## What the normal skin pays

| Page  | Measure            | Before    | After     | Difference | Budget    |
| ----- | ------------------ | --------- | --------- | ---------- | --------- |
| `/`   | Document, gzip     | 24,103 B  | 26,944 B  | +2,841 B   | +4,096 B  |
| `/en` | Document, gzip     | 23,775 B  | 26,683 B  | +2,908 B   | +4,096 B  |
| both  | Stylesheet, gzip   | 9,934 B   | 10,323 B  | +389 B     | +2,048 B  |
| both  | Script transferred | 197.3 KB  | 198.6 KB  | +1.3 KB    | +1.5 KB   |
| `/`   | Document, raw      | 153,613 B | 181,954 B | +28,341 B  | no budget |
| both  | Stylesheet, raw    | 48,052 B  | 50,146 B  | +2,094 B   | no budget |

- **Document and stylesheet:** the bytes of the response body with `Accept-Encoding: gzip`, and the same
  body decompressed. One stylesheet is linked by the page, before and after.
- **Script:** the median of five Lighthouse runs, mobile and desktop alike, at 40 ms of latency.
- **Where the document grew:** the second drawing of each icon (22 pairs in the prerendered page), the
  eighteen hidden `<img>` of the pixel logos, and the same again in the payload React embeds. It
  compresses well because it repeats: 28 KB raw are 2.8 KB on the wire.
- **Merging the runs of an icon into rectangles saved at least 3.8 KB raw.** With one path segment per
  run of a row the document was 185,725 B raw and 27,177 B gzipped; with runs of the same span stacked
  into one rectangle, 181,954 B and 26,944 B. The second build also has the slots of the navbar and the
  `data-px` attributes, which the first did not.
- **No request and no audio.** In the normal skin the `skin` suite records no request under
  `/avatar/avatar.png`, `/thumbnails/8bit/`, `/tech/8bit/` or `/pixel/`, and the `juice` suite counts
  zero `AudioContext` and zero sounds after a scroll through the page and a press.

## Lighthouse

`npm run audit`, median of 5, 40 ms of latency, before and after:

| Page  | Preset  | Performance | Accessibility | Best Practices | SEO | FCP          | LCP            | TBT      | CLS |
| ----- | ------- | ----------- | ------------- | -------------- | --- | ------------ | -------------- | -------- | --- |
| `/`   | mobile  | 100 → 100   | 100 → 100     | 100 → 100      | 100 | 985 → 985 ms | 1585 → 1585 ms | 3 → 3 ms | 0   |
| `/`   | desktop | 100 → 100   | 100 → 100     | 100 → 100      | 100 | 324 → 325 ms | 444 → 445 ms   | 0 → 0 ms | 0   |
| `/en` | mobile  | 100 → 100   | 100 → 100     | 100 → 100      | 100 | 985 → 986 ms | 1585 → 1586 ms | 3 → 2 ms | 0   |
| `/en` | desktop | 100 → 100   | 100 → 100     | 100 → 100      | 100 | 325 → 327 ms | 445 → 447 ms   | 0 → 0 ms | 0   |

The LCP element is the `h1`, before and after. `src/app/data/audit.json` was not rewritten: the scores
it stores did not change.

## The normal skin did not move

Twelve full-page screenshots: `/` and `/en`, at 1440×900, 1024×768 and 390×844, in both themes, under
reduced motion (the page in normal flow, the band standing still), after a scroll through the page.

- **The method is deterministic.** Two captures of the build of `f835431` are identical, pixel by pixel,
  in the twelve files.
- **Zero differing pixels** between the baseline and two builds of the work: the one with the first
  paint rules and both drawings of every icon, and the final one.

## Where the runtime loads

The risk the design named — Next putting the stylesheet of the lazy chunk in the first load — did not
happen.

- The stylesheet the page links has no rule of `pixel.css`: `px-scenery` occurs 0 times in it.
- Entering the skin from the normal one requests, of `_next`, one script (22,179 B raw, 7,907 B
  gzipped), one stylesheet (6,265 B raw, 1,960 B gzipped) and the pixel font; then the two cursors, the
  sprite, the logos and the thumbnails that are on screen.
- One `AudioContext` is created, by the gesture, and nine sounds start in the first two seconds: the
  four of the jingle and the five of the first achievement.

## Inside the skin

- **Text:** `body`, the tagline, the bio, a card and the footer compute to Pixelify Sans, and no text
  on the page is smaller than 12 px (`skin` suite).
- **The copyright sign and the at sign of Pixelify Sans are small.** In the screenshots of the skin `©`
  reads close to a degree sign at 14 px, and `@` is smaller than the letters around it. Both are the
  font's own glyphs; neither was replaced.
- **The navbar at 320 px.** By its classes the bar has 282 px for the brand and its controls, and inside
  the skin they are six 44 px boxes with no gap: 264 px. One more would not fit, which is why the mute
  button is in the bar from `sm` up. Not measured on screen; the 320 px test of the `skin` suite passes
  with the runtime mounted.
- **`--scenery`** against the text that passes over it, from the live stylesheet (`palette` suite):

  | Theme | `--scenery` | On `--paper` | `ink` on it | `ink-muted` on it | `brand` on it |
  | ----- | ----------- | ------------ | ----------- | ----------------- | ------------- |
  | light | `#eeede8`   | 1.09:1       | 16.11:1     | 5.45:1            | 4.63:1        |
  | dark  | `#2c2c2c`   | 1.35:1       | 13.38:1     | 5.54:1            | 8.01:1        |

  In the light theme the shapes are faint on purpose: `brand` on `--paper` is 5.1:1, so a shape that
  green text has to stay readable on cannot be much darker than the page.

## The reset of the sticky position was redundant

The first version undid the stack with three rules: no spacer, no negative margin, and
`position: relative` on the panels. A build without the third passed "panels do not pin in the 8-bit
skin" in the same way. Without the spacer a slot is exactly as tall as its panel, and a sticky element
has nowhere to stick inside a container of its own height. The rule was removed.

## The new checks can fail

Two builds were broken on purpose and the `juice` and `stacking` suites were run against them in
Chromium.

| Build                                                                                        | Failed                                                                                             |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `play()` ignores the mute; `motionAllowed()` is always true; no reset of the sticky position | the mute test, the music test (it counts on the mute), the reduced-motion test                     |
| `motionAllowed()` is always true; the slots keep their negative margin                       | the effects test, the reduced-motion test, "panels do not pin in the 8-bit skin", and three others |

- **The first build exposed a test that could not fail.** "No burst while the effects are off" was
  `toHaveCount(0)` after a short wait, and it passed with the switch doing nothing: a burst removes
  itself after 400 ms, and the assertion retries until it is gone. The test now counts every burst that
  is added, with a `MutationObserver`, and fails on the second build.
- **The first build also showed that a rule did nothing**: see the section above.
- The three others that failed on the second build are the notice of the stage and the two counts of
  achievements. They were not looked into one by one; they pass on the restored build.

## Sound in the three engines

The `juice` suite wraps `OscillatorNode.prototype.start` and `AudioBufferSourceNode.prototype.start`
before the first script of the page and counts what starts. In the five projects — Chromium, Firefox,
WebKit, Pixel 7 and iPhone 15 — the context created by the press that enters the skin runs, the jingle
and a press are counted, a muted press is not, and the music keeps scheduling on the clock of the
context.

## The development server

`npm run dev`, with StrictMode, on `/` and `/en`: entering the skin, the music on and off, a scroll to
the end and back, and leaving the skin. No error. After leaving: the tagline is one text node, no node
of the runtime is left, and `localStorage` holds the achievements (`easter-egg`, `music`, `polyglot`)
and the two languages.

- **One warning, not from this work:** `Image with src "/react.svg" has either width or height
modified`. It appears in the normal skin, before the skin is ever entered: the logo is rendered 24 px
  wide and 21.36 px tall, because the file is not square and the base stylesheet sets `height: auto` on
  images. Recorded as B-004 in `.specs/BACKLOG.md`.

## The gate

`npm run lint:eslint:check && npm run lint:prettier:check && npm run build && npm run test:e2e`:
**532 passed, 263 skipped**, 795 tests in 14 files, in 2.3 minutes. The gate was not run on `f835431`
before the work, so there is no count to compare it with.

## Approved by the requester

On 2026-10-04, in the conversation, the requester confirmed the three things no check of this work could
decide: the drawings of `icon-sheet.png`, next to this file; the sound and the music, by ear; and that
the normal scroll is for the 8-bit skin only.

## Not verified

- **The sound, by anything but the requester's ear.** Every check counts sounds that start; none hears
  them.
- **A real phone.** WebKit in Playwright is not Safari on a phone, and no touch device was used in this
  work. The one behaviour that depends on it is the `AudioContext` created inside the gesture.
