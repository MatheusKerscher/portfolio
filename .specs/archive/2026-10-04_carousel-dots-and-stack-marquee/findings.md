# Findings — Dots for the carousels of a phone, and the technologies as a marquee band

Measured on 2026-10-04 on macOS, Node 22.21.0, Next 16.3.8, against the production build
(`next build && next start -p 3100`). "Before" is `25cff3f`; "after" is `47ea17b`.

`review.jpg`, next to this file, shows the result on a phone and on a desktop.

## The references

Both are the requester's own code, read on the same machine and not imported.

- **Dots:** `nuvemshop-academy/frontend/src/ui/layout/CourseCarousel.tsx` and the `.ne-carousel-dot*`
  rules of `src/main.css`. Its comments record why each part of the logic exists: counting screens
  instead of items gave 4 dots for 3 cards; dividing by the viewport width left the last dot
  unreachable; slicing the list of dots made the strip flicker; a transition on the track lagged
  behind the scroll.
- **Band:** `my-clients/rafael-goncalves/components/brand/marquee.tsx`.

## Dots

- **Measures of the reference, as squares.** 6 px dots, 6 px apart (a step of 12 px), a window of
  54 px for five dots; the current dot in the accent colour, the others in the faintest neutral;
  150 ms with `cubic-bezier(0.2, 0, 0, 1)` on the colour and on the size; a dot at an end of the window
  at 60% of its size. The reference values are `--nimbus-motion-speed-fast: 150ms`,
  `--ne-ease-out: cubic-bezier(0.2, 0, 0, 1)`, `--ne-gray-10: #eff1f4` and the primary colour.
- **The first version looked different**, and the requester asked for the look of the reference while
  the work was in progress: it had 4 px gaps, `line-strong` for the other dots and a 200 ms transition.
- **The other dots are faint on purpose.** `line` on `paper` is 1.19:1 in the light theme and 1.39:1 in
  the dark one; the reference is 1.13:1. The current dot is `brand` on `paper`, a pair of the palette
  contract. With `line-strong`, which reaches 3:1 against the page, the current dot differed from its
  neighbours by 1.57:1 only and was hard to tell.
- **Both carousels have five items**, so they show five dots in a row. The window is exercised by a test
  that clones items in the page up to nine: the dots follow, because the controls count the items of
  the region and observe its list.
- **A scroll position is a fraction of a pixel off.** With item 5 of 9 in view the row was shifted by
  19.9857 px in Chromium and 20.015 px in WebKit, where 20 px was expected (two steps of 10 px, in the
  first version). The test compares within half a pixel.

## The band of technologies

- **Width and speed:** on a desktop the two copies measure 4881 px, 2440 px each; the loop takes 40 s,
  61 px per second. In the 8-bit skin the pair is 4654 px.
- **"Sobre" is shorter.** Height its content needs, against the space below the navbar:

  | Viewport | Space | Before               | After |
  | -------- | ----- | -------------------- | ----- |
  | 1512×749 | 685   | 657                  | 478   |
  | 1366×641 | 577   | —                    | 387   |
  | 1152×640 | 576   | —                    | 385   |
  | 1024×640 | 576   | misses by 4 to 18 px | 414   |
  | 1024×600 | 536   | —                    | 414   |

  The "before" values are those of the `2026-10-03_layout-redesign` findings. At 1024 px of width the
  panel now fits, where it did not between 640 and 720 px of height.

- **On a phone**, 390×844: "Sobre" is 843 px, 1026 before; "Projetos" 850 px, 872 before, with dots in
  the place of the buttons.
- **Under reduced motion** the list wraps: on a phone "Sobre" is 1143 px, with the nine technologies on
  six rows.
- **The pause control stayed on screen under reduced motion** in the first version. Its `display: none`
  was a rule of the `components` layer and the control has the `flex` utility, which wins. The `marquee`
  suite caught it; the control is hidden with `motion-reduce:hidden`.

## The other panels did not move

112 screenshots before and after: the five panels, the navbar and the footer, on `/` and `/en`, at
1440×900 and 1024×768, in both themes and both skins, in normal flow.

- The 16 screenshots of "Sobre" differ, as intended.
- 95 of the other 96 are identical, pixel by pixel.
- One differs: the footer of `/` at 1024×768 in the dark theme, in its top border row only, 940 pixels
  that read 45 where the baseline reads 46, of 255. Four more captures of the new build are identical to
  each other, and that row holds both values in the other fifteen footers, before and after. It is a
  difference of one level of grey in a hairline that the work does not touch, not a change of layout;
  which of the two captures is the odd one cannot be told without the old build.

## What the gate caught

The first complete version failed 28 tests of the older suites, for three reasons, none of them a defect
of the page:

- **"Nothing is cut at 320 px"** counted the items of the band, which are off screen on purpose. The
  helper now leaves out what is inside the band; that none is cut when it stands still is a test of the
  `marquee` suite.
- **"Keyboard focus is never obscured"** reported the checkbox of the band: a visually hidden input is
  never the element at its own centre. The test, and `StackController`, which scrolls to a focused
  element that is covered, now look at the label that draws it.
- **"Every heading, link and button can be reached"** at 390 px tried the buttons of the carousels,
  which are not displayed there any more. It skips what is not displayed.

## Tests

- The gate on `47ea17b`: 462 passed, 258 skipped. Before the work: 413 passed, 237 skipped.
- **The new checks fail when they should.** With the position of the dots computed against the number
  of items instead of the number of steps, and without the rule that reads the checkbox, 12 tests
  failed: the arithmetic, the lit dot of each carousel, the window, and the pause control with and
  without JavaScript.

## Loading

`npm run audit`, median of 5, 40 ms of latency, on `47ea17b`:

| Page  | Preset  | Performance | Accessibility | Best practices | SEO | FCP    | LCP     | TBT  | CLS | Script   |
| ----- | ------- | ----------- | ------------- | -------------- | --- | ------ | ------- | ---- | --- | -------- |
| `/`   | mobile  | 100         | 100           | 100            | 100 | 986 ms | 1586 ms | 4 ms | 0   | 197.2 KB |
| `/`   | desktop | 100         | 100           | 100            | 100 | 324 ms | 444 ms  | 0 ms | 0   | 197.2 KB |
| `/en` | mobile  | 100         | 100           | 100            | 100 | 985 ms | 1585 ms | 3 ms | 0   | 197.2 KB |
| `/en` | desktop | 100         | 100           | 100            | 100 | 325 ms | 445 ms  | 0 ms | 0   | 197.2 KB |

The previous build transferred 196.9 KB of script: the dots cost 0.3 KB. The band has no script. The
LCP element is still the `h1`.
