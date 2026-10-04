# Tasks — Keyboard focus on a card that is outside its carousel

States: `[ ]` open · `[~]` in progress · `[x]` done and verified · `[!]` blocked · `[-]` dropped

## Prerequisites

- [x] Approved by the requester — _verified by:_ "faça a correção", in the conversation on 2026-10-04,
      after the cause was reported.
- [x] The defect is reproduced locally — _verified by:_ Option+Tab in WebKit on macOS focuses the cards
      at the positions the CI log reports (−140 on an iPhone 15, 19 on the desktop).

## Implementation

- [x] The focus walk reaches links in WebKit on macOS and fails on the defect — _verified by:_ before the
      fix the test failed in `mobile-safari` with the two lines CI printed. In `webkit` on the desktop it
      passed locally, as it did on one of its two tries in CI.
- [x] A carousel scrolls to the item that holds the focused element — _verified by:_ the same test
      passed 15 times out of 15 in the five projects, and the Option+Tab walk of `findings.md` finds
      every focused card wholly inside its region.
- [x] The gate — _verified by:_ 462 passed, 258 skipped.

## Rollout

- [x] Pull request opened and the `E2E` workflow green — _verified by:_ run 37216724364 on pull request
      #45: 462 passed, 258 skipped, none failed or flaky. Merged on 2026-10-04.

## Blocked

| Item | Blocked by | Who unblocks it |
| ---- | ---------- | --------------- |

## Dropped
