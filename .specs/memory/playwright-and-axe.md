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
- **WebKit does not move focus to links with Tab**, as Safari does by default. Evidence: the focus test
  reached only buttons and regions there; it covers links in Chromium and Firefox.
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
