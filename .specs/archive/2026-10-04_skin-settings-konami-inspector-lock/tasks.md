# Tasks — 8-bit skin: settings across languages, the Konami code, a locked Inspector

States: `[ ]` open · `[~]` in progress · `[x]` done and verified · `[!]` blocked · `[-]` dropped

"The gate" below means:
`npm run lint:eslint:check && npm run lint:prettier:check && npm run build && npm run test:e2e`, all
exiting 0.

## Prerequisites

- [x] The three reports measured before any change — _verified by:_ the table and the root cause
      analysis of `spec.md`.
- [x] Spec approved by the requester, with its two proposals — _verified by:_ their answer in the
      conversation, 2026-10-04: the Inspector unlocks after the five sections, spec approved.

## Implementation

- [x] The music is kept for the session of the tab — _verified by:_ the `juice` suite: on through a
      change of language and a reload, off in a new tab and after leaving the skin. Against a model of
      a browser that holds the audio back, it starts with the first press.
- [x] The Konami code with the focus on a checkbox — _verified by:_ the `skin` suite, in the three
      engines; the text-field test still passes.
- [x] The Inspector locked, and unlocked by the five sections — _verified by:_ the `juice` suite (lock,
      hint, reward, magnifier, reload, positions in the navbar) and the `inspector` suite, unlocked.
- [x] The normal skin did not move — _verified by:_ the pixel comparison of 12 screenshots.
- [x] The five sections can be visited at every size — _verified by:_ a scroll through `/` and `/en`
      at ten viewports, from 320×568 to 3840×2160 (`findings.md`). Added during the work: the
      Inspector depends on it now.
- [x] Loading measured — _verified by:_ `npm run audit` on `/` and `/en`, in `findings.md`.
- [x] The new checks can fail — _verified by:_ two builds broken on purpose (`findings.md`). One check
      could not, and was rewritten.
- [x] Documentation: `CLAUDE.md`, the correction in `.specs/memory/playwright-and-axe.md`,
      `findings.md` — _verified by:_ `npm run lint:prettier:check`.
- [x] The gate — _verified by:_ the totals of the last run, in `findings.md`: 557 passed, 263 skipped,
      none failed.

## Rollout

- [x] The Konami code works for the requester — _verified by:_ their answer in the conversation,
      2026-10-04: "funcionou".

## Blocked

| Item | Blocked by | Who unblocks it |
| ---- | ---------- | --------------- |

## Dropped

Nothing yet.
