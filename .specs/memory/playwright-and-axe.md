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
- **An assertion that retries passes for something that removes itself.** Evidence (2026-10-04, the
  `2026-10-04_pixel-art-and-juice` spec): a burst of particles is removed 400 ms after it is added. The
  test "no burst while the effects are off" was `toHaveCount(0)` after a wait, and it passed on a build
  where the effects switch did nothing: the burst had come and gone. It counts additions with a
  `MutationObserver` now, and fails on that build.
- **The three engines run an `AudioContext` on a page nobody has pressed: they cannot show what a
  gesture changes.** Corrected on 2026-10-04 (the `2026-10-04_skin-settings-konami-inspector-lock`
  spec); this entry used to say only that they "run a context that a click creates", which is true and
  proves less than it reads. Evidence: a context created by `page.evaluate` on a page with no press read
  `running` after 400 ms in Chromium, Firefox and WebKit, and the same on the page reached through a
  link and after a reload. It was not possible to make them hold it back: Chromium launched with
  `--autoplay-policy=document-user-activation-required`, as the headless shell and as the full build
  (`channel: "chromium"`), and Firefox launched with `media.autoplay.default: 5`,
  `media.autoplay.blocking_policy: 0` and `media.autoplay.block-webaudio: true`, read `running` too.
  With `OscillatorNode.prototype.start` and `AudioBufferSourceNode.prototype.start` wrapped by an init
  script, the `juice` suite counts the sounds of a jingle, of a press and of a music loop in the five
  projects: that proves the sounds are started, not that a browser would let them be heard.
  **Rule:** what depends on the gesture is checked against a model — `holdAudioUntilPress` of
  `e2e/helpers.ts` suspends a context created before the first press — and is reported as checked
  against a model. Only a real browser is evidence of its policy.
- **`locator.click()` does not press a control marked `aria-disabled="true"`.** Evidence (2026-10-04,
  the same spec): the click on a button with that attribute waited for it to be "enabled" and timed out
  after 30 s with `element is not enabled`, 59 retries in the log. A control that answers a press is
  not marked that way; one that is can only be pressed with `{ force: true }`.
- **A server left on port 3100 is reused, and it may be serving an older build.** Evidence (2026-10-04,
  the same spec): a `next start -p 3100` started by hand was still up when `npm run test:e2e` ran. The
  configuration reuses a server that answers on the port, outside CI, so nothing was started; the build
  that had just been written replaced the chunks the old server pointed to, one of them answered 500,
  and 15 tests timed out at 30 s, most of them in suites that had not changed.
  `pkill -f "next start"` had not stopped it: the process renames itself `next-server (v16.3.8)`.
  **Rule:** before the gate, `lsof -nP -iTCP:3100 -sTCP:LISTEN` prints nothing; a server started by
  hand is stopped by its process id.
- **Firefox on the Linux runner of CI starts no `AudioContext` without an audio output.** Evidence
  (2026-10-05, pull request #47): in the first `E2E` run of the `juice` suite, five tests failed, all in
  `firefox` and all about sound: 0 sounds on entering the skin and on a press, and the music stopped
  after the 5 sounds of its first step, which is what a context whose clock stands still gives.
  `chromium` and `webkit` passed on the same runner, and the three engines pass on macOS. With
  PulseAudio installed and started before the suites (`.github/workflows/e2e.yaml`), which gives a null
  sink, the same five tests passed in the next run.
- **A context can still be starting when the page asks for the first sound.** Evidence: in that next
  run, the first audio test of `firefox` failed once with 0 sounds and passed on the retry. The entry
  jingle and the sound of the first achievement, 700 ms later, were both asked for before the context
  ran, and were dropped. The jingle now waits for the context (`whenAudioRuns`), and `delayAudioStart`
  of `e2e/helpers.ts` models a context that takes two seconds to start: with it the test of the
  greeting fails in the five projects on a build without the wait.
- **The function of an init script reaches the page as the text Playwright compiled it to.** Evidence:
  a class with a private field (`#started`) inside `page.addInitScript` made `new AudioContext()` throw
  `ReferenceError: _classPrivateFieldInitSpec is not defined` in the three engines. The page caught the
  error, as it does for a browser without audio, so the test failed for a reason that was not the one
  it was written for, on a build with the fix and on one without it. Such a function uses closures in
  place of private fields, and `Real.prototype.method.call(this)` in place of `super` in a callback.
