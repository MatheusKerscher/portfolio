# Findings — 8-bit skin: settings across languages, the Konami code, a locked Inspector

Measured on 2026-10-04 on macOS, Node 22.21.0, Next 16.3.8, `@playwright/test` 1.63.0, against the
production build (`next build && next start -p 3100`) unless a line says otherwise. "Before" is the
working tree as `2026-10-04_pixel-art-and-juice` left it; nothing of either spec is committed yet.

## The three reports, before and after

| Report                                             | Before                           | After                                            |
| -------------------------------------------------- | -------------------------------- | ------------------------------------------------ |
| Music on, then the language link                   | Music off at the other language  | Music on, and sounds keep starting with no press |
| The same, then a reload                            | Music off                        | Music on                                         |
| The Konami code with the focus on the band's pause | Nothing, in Chromium and Firefox | The skin switches, in the three engines          |
| The Inspector on a first visit to the skin         | One press on the magnifier       | A lock; the magnifier after the five sections    |

- **Sound and effects were already kept**, in `localStorage`. The music was the one setting in memory.
- **The Konami failure that was reproduced is fixed, and the requester confirmed on 2026-10-04 that the
  code works for them.** It had not failed in any other flow that was tried (`spec.md`, "Problem").

## What a browser does with audio on a page nobody has pressed

This is what decides whether the music is back by itself after a change of language. It could not be
measured here.

- **The three engines of Playwright run a context whatever happens.** A context created by
  `page.evaluate` read `running` 400 ms later on a page with no press, on the page reached through a
  link, and after a reload, in Chromium, Firefox and WebKit.
- **They could not be made to hold it back.** Chromium with
  `--autoplay-policy=document-user-activation-required`, as the headless shell and as the full build in
  the new headless mode, and Firefox with `media.autoplay.default: 5`,
  `media.autoplay.blocking_policy: 0` and `media.autoplay.block-webaudio: true`: `running` every time.
- **So the path of a held context is checked against a model.** `holdAudioUntilPress` suspends a context
  that is created before the first press and lets no `resume()` settle until there is one. With the
  music stored as on and that model, the sequencer started **5 sounds** and stopped, in the five
  projects: one step of the loop, the arpeggio, the bass, the hat, the kick and the lead. After a
  press of a key it kept scheduling. Without the model the same test read 21 sounds, then 41, and
  failed, which is what shows the model is what holds the sequencer.
- **Not verified:** what Chrome, Safari and Firefox do, as a visitor has them. From their documented
  policies the expectation is that a context starts by itself after a navigation inside the site in
  some of them and waits for a press in the others. In both cases the code does the same thing, and the
  worst case is the one the model covers: the music starts with the first press.
- **`pointerup` was added to what resumes the context**, next to `pointerdown` and `keydown`. The reason
  is the HTML Standard, which counts the end of a touch and not its start as a user activation. It was
  not measured on a phone.

## The five sections can be visited at every size that was tried

The Inspector now depends on the "Explorer" achievement, which is awarded when each section has crossed
the middle tenth of the viewport. A section that cannot get there would lock the Inspector for ever.

A scroll from the top to the end of the page, a third of the viewport at a time, on `/` and `/en`:

| Viewport                                                                                              | Result on both pages |
| ----------------------------------------------------------------------------------------------------- | -------------------- |
| 320×568, 390×844, 820×1180, 1080×1920, 1280×720, 1440×900, 1440×2560, 1920×1080, 2560×1440, 3840×2160 | Unlocked             |

The last section is the one at risk, because the page ends under it. At the end of the page it covered
the middle of the viewport in the ten sizes: it is at least as tall as the viewport, and the footer
under it is 97 px, or 141 px on a phone.

- **The sections have to be visited in one page view.** The set of visited sections is not stored: a
  reload or a change of language starts it again. Not changed, and not asked for.

## What changed from the approved spec, and why

Each is recorded in `spec.md` or `design.md` where it applies.

- **The lock is an ordinary button, not `aria-disabled`.** The spec asked for the attribute. Playwright
  would not press such a button (`element is not enabled`, 59 retries, a timeout), and the reading is
  the right one: the attribute says that the control cannot be operated, and this one answers a press
  with the way to unlock the Inspector.
- **The attribute on `<html>` is `data-px-inspector`, not `data-inspector`.** The Inspector already uses
  `data-inspector` for its own panel and overlays, and skips whatever is inside an element that carries
  it. On the root that was the whole page: the overlay of landmarks drew 0 boxes where the `inspector`
  suite expects at least 3. Caught by that suite on the first run.
- **`pixel-music.ts` did not change.** The design had the sequencer wait for `statechange`. Its
  look-ahead already bounds what is scheduled on a clock that stands still, to the one step measured
  above.
- **The hint of the lock goes away when the Inspector is unlocked.** Not in the spec. A screenshot taken
  after a press on the lock and a quick scroll showed "Inspector locked" under "Inspector unlocked" for
  the rest of its 4.5 s.
- **The focus follows.** Not in the first version of the spec. If the lock is the focused element when
  it gives way, the magnifier takes the focus; otherwise a keyboard user who pressed the lock and then
  scrolled through the page would be left with the focus on nothing.
- **"A new tab" in place of "a new browser context"** in the criterion of the music: a new tab of the
  same browser is the stricter case. It has the skin, the mute and the achievements, and no music.

## Loading

The Inspector lock, its copy and its rule are in the lazy chunk of the skin. The first load gained the
box of the navbar: one `span` around the toggle of the Inspector and one inside it.

| Page  | Measure                      | Before    | After     | Difference | Budget  |
| ----- | ---------------------------- | --------- | --------- | ---------- | ------- |
| both  | Script transferred           | 198.6 KB  | 198.6 KB  | 0.0 KB     | +0.2 KB |
| `/`   | Document, gzip               | 26,944 B  | 26,971 B  | +27 B      | none    |
| `/en` | Document, gzip               | 26,683 B  | 26,708 B  | +25 B      | none    |
| `/`   | Document, raw                | 181,954 B | 182,260 B | +306 B     | none    |
| both  | Stylesheet of the page, gzip | 10,323 B  | 10,323 B  | 0 B        | none    |

`npm run audit`, median of 5, 40 ms of latency: 100 in Performance, Accessibility, Best Practices and
SEO on `/` and on `/en`, with the mobile and the desktop presets. FCP and LCP are 985 ms and 1585 ms on
mobile and 324 ms and 444 ms on desktop (`/en`: 325 ms and 445 ms), the same as before to the
millisecond. The LCP element is the `h1`. `src/app/data/audit.json` was not rewritten.

## The normal skin did not move

The twelve full-page screenshots of the previous spec, taken again from this build: **0 differing
pixels** in each, against the baseline of `f835431`.

## The new checks can fail

Two builds broken on purpose, each run against the new tests, then the sources put back and compared
byte by byte with the copies that were kept.

| What was broken                                                 | The check that failed                                                        |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| The Konami listener ignores every `input` again                 | "the Konami code is read with the focus on a checkbox", in the five projects |
| The music is not read back when the page loads                  | "the three switches are kept…": 0 sounds where more than 10 are expected     |
| The same                                                        | "where the audio waits for a press…": 0 sounds after the press               |
| The music is stored for ever, in `localStorage`                 | "…a new tab…": the switch is on in the new tab                               |
| Leaving the skin does not turn the music off                    | the same test: `sessionStorage` has no `"false"`, and the music is on again  |
| The stylesheet displays the magnifier whatever the attribute is | "the Inspector is locked…": the magnifier is visible where it must be hidden |
| The focus is not handed to the magnifier                        | the same test: `toBeFocused` reads `inactive`                                |
| No box in the navbar, and a lock 16 px wider                    | the same test: the other controls are 8 px and 16 px from where they were    |
| The hint is not taken away when the Inspector is unlocked       | the same test: the status region still holds the hint                        |

- **One check could not fail, and was rewritten.** The first broken build left the hint on screen and
  the test passed: it was `not.toContainText`, which retried until the hint went away by itself, 4.5 s
  after the press. It is the pitfall `.specs/memory/playwright-and-axe.md` already describes for the
  bursts of particles. The test now presses the lock again one section before the last, and reads the
  status region once when the reward is there. The second broken build made it fail.
- **Not broken on purpose:** the text of the hint and of the reward, the panel opening, the reload, the
  44 px of the lock. Each is a plain assertion on something the test has just caused.

## The development server

`npm run dev`, in Chromium, Firefox and WebKit, where React runs every effect twice: the Konami code
with the focus on the checkbox of the band entered the skin; the lock was there and answered with its
hint; after the five sections the attribute was `unlocked`, no lock was left, the focus was on the
magnifier and the toast named the reward; the magnifier opened the panel; with the music on, the
language link led to a page with the Music switch on and the Inspector unlocked. No error in the console.

## The gate

`npm run lint:eslint:check && npm run lint:prettier:check && npm run build && npm run test:e2e`, on the
final tree:

| Result  | Tests |
| ------- | ----- |
| Passed  | 557   |
| Skipped | 263   |
| Failed  | 0     |

820 tests in the five projects, 2.6 minutes, exit code 0. They are 25 more than the 795 of the previous
spec: four new tests in the `juice` suite and one in the `skin` suite, in five projects each.

Two earlier runs do not count, and are recorded because they looked like failures of the work:

- **A run against a server that was serving an older build:** 15 tests timed out. The cause and the rule
  that follows from it are in `.specs/memory/playwright-and-axe.md`.
- **A run with 552 passed and 5 failed.** The five failed together: one in `chromium` and four in
  `firefox`, in the `stacking`, `carousel` and `i18n` suites, each reported as lasting between 6.2 and
  6.4 minutes against a limit of 30 s, one of them inside a `waitForTimeout` of 800 ms. Run again by
  themselves, the five passed in 18.6 s, and they passed in the final run. Something stopped the
  machine or its clock for those minutes; what, was not established.

## Not checked by a person

- **By ear and by eye in a real browser.** Everything above was read by a script. The screenshots of the
  lock, of its hint and of the reward were looked at in both themes, at 1280, 390 and 320 px.
- **The music after a change of language in Chrome, Safari and Firefox**, for the reason given above.
- **A screen reader** announcing the hint and the reward from the status region.
