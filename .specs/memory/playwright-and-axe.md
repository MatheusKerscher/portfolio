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
