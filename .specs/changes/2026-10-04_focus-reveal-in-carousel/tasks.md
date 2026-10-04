# Tasks — Keyboard focus on a card that is outside its carousel

States: `[ ]` open · `[~]` in progress · `[x]` done and verified · `[!]` blocked · `[-]` dropped

## Prerequisites

- [x] Approved by the requester — _verified by:_ "faça a correção", in the conversation on 2026-10-04,
      after the cause was reported.
- [x] The defect is reproduced locally — _verified by:_ Option+Tab in WebKit on macOS focuses the cards
      at the positions the CI log reports (−140 on an iPhone 15, 19 on the desktop).

## Implementation

- [ ] The focus walk reaches links in WebKit on macOS and fails on the defect — _verified by:_ the test
      fails in `webkit` and `mobile-safari` before the fix.
- [ ] A carousel scrolls to the item that holds the focused element — _verified by:_ the same test
      passes in the five projects.
- [ ] The gate — _verified by:_ all four commands exit 0.

## Rollout

- [ ] Pull request opened and the `E2E` workflow green — _verified by:_ its run on the pull request.

## Blocked

| Item | Blocked by | Who unblocks it |
| ---- | ---------- | --------------- |

## Dropped
