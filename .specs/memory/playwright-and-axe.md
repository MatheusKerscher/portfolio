# Playwright and axe: what behaves differently from what one expects

Observed on 2026-10-03 with `@playwright/test` 1.63.0 and `@axe-core/playwright` 4.13.0, in the projects
`chromium`, `firefox`, `webkit`, `mobile-chrome` (Pixel 7) and `mobile-safari` (iPhone 15). From the work
in the `2026-10-03_layout-redesign` spec.

- **`page.evaluate` works with `javaScriptEnabled: false`** in the three engines. Evidence: the
  no-JavaScript test of the `stacking` suite reads `getBoundingClientRect` and passes in the five
  projects.
- **`mouse.wheel` does not exist in mobile WebKit.** Evidence: on the iPhone 15 device it throws
  `mouse.wheel: Mouse wheel is not supported in mobile WebKit`. The wheel test of the `carousel` suite is
  skipped on mobile.
- **WebKit moves focus to links with Tab on Linux and not on macOS.** On macOS it behaves as Safari does
  by default: Tab reaches buttons, fields and regions, and Option+Tab reaches links as well. Evidence:
  the focus test reached only buttons and regions locally; with `Alt+Tab` 33 of the 44 elements it
  focused were links. On the Linux runner of CI plain Tab reached the links: the log of the first `E2E`
  run (pull request #44) names project cards focused by Tab in `webkit` and `mobile-safari`.
  **Rule:** a keyboard walk presses `Alt+Tab` when the browser is WebKit and the platform is macOS, and
  asserts how many links it reached. Without that, the gate was green on macOS with a focus defect that
  CI caught (`2026-10-04_focus-reveal-in-carousel`).
- **A click that Playwright retries scrolls the page**, with a different alignment on each try. During
  the cross-fade of the skin the view transition is on top of the page, so a click is retried, the hero
  scrolls and the next panel covers it. Evidence: the skin test failed until it waited for a hit-test on
  the button to pass before clicking.
- **A test file cannot import a JSON module without an import attribute, and spec files cannot import
  each other.** Evidence: both were errors when `inspector.spec.ts` was first written. It reads
  `audit.json` with `readFileSync`, and what the suites share is in `e2e/helpers.ts`.
- **axe reads a colour in the middle of a CSS transition.** Evidence: a tab trigger whose background
  changes at once while its text colour fades was reported for `color-contrast` right after a click. The
  Inspector tabs have `transition-none`.
- **axe reads a colour in the middle of a fade-in as well.** Evidence (2026-10-04, the
  `2026-10-04_mobile-experience` spec): right after the full-screen menu opened, `mobile-safari` reported
  `color-contrast` on its first link, which was still at a partial opacity. The `mobile` suite waits for
  the menu and its items to reach an opacity of 1 before the scan.
- **A range over an element includes its screen-reader-only text at its natural width.** Evidence: a
  check that every line of a card title is centred reported the first line 97.6 px off, because the
  `.sr-only` span inside the link ("opens in a new tab") returned a rectangle as wide as its text, not
  the 1 px box it is clipped to. The check walks the text nodes and skips those inside `.sr-only`.
- **`img.decode()` never settles for a hidden lazy image.** Evidence: a screenshot script that awaited
  `decode()` on every image of the page hung on the first page; the 8-bit thumbnails are `display: none`
  and `loading="lazy"` in the normal skin, so they never load. Waiting only for the displayed images that
  are not complete finished in two minutes for 48 screenshots.
- **`toEqual` tells `-0` from `0`.** Evidence (2026-10-04, the `2026-10-04_carousel-dots-and-stack-marquee`
  spec): `-new DOMMatrix(transform).m41` of an untransformed element is `-0`, and the assertion failed
  with `+ "shift": -0`. The test takes the absolute value.
- **A scroll position that was set is a fraction of a pixel off.** Evidence: after `scrollLeft` was set
  to the offset of an item, a value derived from it read 19.9857 in Chromium and 20.015 in WebKit where
  20 was expected. Positions derived from a scroll are compared within half a pixel.
- **A visually hidden input is never the element at its own centre.** Evidence: the focus test of the
  `stacking` suite reported the checkbox of the band as obscured: `elementFromPoint` at its centre
  returns the label that draws it. The test, and `StackController`, look at the label of such an input.
- **An element screenshot can differ by one level of grey between two builds that did not change it.**
  Evidence: of 16 footer screenshots, one (`/`, 1024×768, dark) differed from the baseline in its top
  border row only, 46 against 45 of 255. Four more captures of the new build were identical to each
  other. A comparison of panels is read with that in mind: a one-level difference in a hairline is not
  a layout change.
