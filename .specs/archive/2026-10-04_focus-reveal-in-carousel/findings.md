# Findings — Keyboard focus on a card that is outside its carousel

Measured on 2026-10-04 on macOS, Node 22.21.0, Next 16.3.8, Playwright 1.63.0, against the production
build. "Before" is `51d5200`, the merge of pull request #44.

## What CI reported

Run 37206592109 of the `E2E` workflow, the first one the repository ever had: 460 passed, 1 failed,
1 flaky, 258 skipped, in 8 minutes. Linting, commitlint and Lighthouse passed.

| Project         | Result                           | What the test printed                                                  |
| --------------- | -------------------------------- | ---------------------------------------------------------------------- |
| `mobile-safari` | failed on its three tries        | `Shift+Tab: a "MyMock" at -138,287`, `a "Web Carros" at -140,285`      |
| `webkit`        | failed once, passed on the retry | `Tab: a "MyMock" at 1442,481`, `Shift+Tab: a "Dev Controle" at 19,479` |

## Reproduced on macOS

With Option+Tab in WebKit, which moves focus to links there. Centre of each focused card link, in CSS
pixels, moving backwards through "Projetos":

| Device                  | Before                            | After                   |
| ----------------------- | --------------------------------- | ----------------------- |
| iPhone 15 (393 px wide) | 194, **−140**, 194, **−140**, 195 | 194, 195, 194, 195, 195 |
| Desktop (1280 px wide)  | 906, 432, **19**, 585, 138        | 906, 432, 155, 585, 138 |

- On the phone every other card was focused one card to the left of the screen: its carousel had not
  moved. Moving forwards all five were in place.
- On the desktop "Dev Controle" was focused with its card cut by the left edge.
- After the fix the item that holds the focused link is wholly inside its region in every case, in both
  directions.

## The test

- **Before the fix, with the walk reaching links**, the test fails locally in `mobile-safari` with the
  two lines CI printed (`MyMock` and `Web Carros` at −140). In `webkit` on the desktop it passed
  locally: there the centre of the link stays on screen, at 19 px, and CI itself only failed it once in
  two tries.
- **After the fix** it passed 15 times out of 15, three runs in the five projects.
- The walk now counts the links it reached and fails below ten. With plain Tab in WebKit on macOS it
  reached none, which is how the defect got through the local gate.

## The gate

462 passed, 258 skipped, the same counts as before the fix: no test was added, one was made to see
more.

## Loading

`npm run audit -- --runs=3`, not stored: 100 in every category, mobile and desktop, and 197.3 KB of
script against 197.2 KB. The stored scores of `audit.json` are those of `47ea17b` and still hold.

## On Linux

The Linux build of WebKit, where CI had failed, was not run locally. The `E2E` workflow of pull request
#45 ran it: 462 passed, 258 skipped, none failed and none flaky, in 7 minutes.
