# Tasks — Dots for the carousels of a phone, and the technologies as a marquee band

States: `[ ]` open · `[~]` in progress · `[x]` done and verified · `[!]` blocked · `[-]` dropped

"The gate" below means:
`npm run lint:eslint:check && npm run lint:prettier:check && npm run build && npm run test:e2e`, all
exiting 0.

## Prerequisites

- [x] Plan approved by the requester — _verified by:_ approved in the conversation on 2026-10-04, after
      two questions (what an item of the band shows, where the dots replace the buttons).
- [x] Baseline captured before any change — _verified by:_ 112 screenshots of the build of `25cff3f`,
      one per panel plus the navbar and the footer, kept outside the repository.

## Implementation

- [x] Dots below 768 px, with the window and the look of the reference — _verified by:_ the `carousel`
      suite in the mobile projects and the direct tests of `carousel-dots.ts`.
- [x] The band of technologies — _verified by:_ the `marquee` suite, in both languages and the five
      projects.
- [x] The descriptions leave the dictionaries — _verified by:_ `npm run build` (the dictionaries are
      typed against each other) and the `ssr` and `i18n` suites; `grep -rn "Framework React" src`
      returns nothing.
- [x] The new checks can fail — _verified by:_ a build with the position of the dots and the pause rule
      broken failed 12 tests.
- [x] The other panels did not move — _verified by:_ the pixel comparison per panel: 95 of 96 identical,
      one footer off by one level of grey in a hairline.
- [x] "Sobre" fits a laptop screen — _verified by:_ the "on a laptop screen" tests; it needs 478 px at
      1512×749 and 387 px at 1366×641.
- [x] Loading measured — _verified by:_ `npm run audit` on `/` and `/en`: 100 in every category,
      197.2 KB of script against 196.9 KB.
- [x] The gate — _verified by:_ 462 passed, 258 skipped on `47ea17b`.
- [x] Documentation: `CLAUDE.md`, `README.md`, `findings.md`, `.specs/memory/` — _verified by:_
      `npm run lint:prettier:check`.

## Rollout

- [ ] The requester reviews `review.jpg` and the site on a phone — _verified by:_ their answer in the
      conversation.
- [ ] Push and pull request — _verified by:_ their go-ahead; nothing is pushed without it.

## Blocked

| Item | Blocked by | Who unblocks it |
| ---- | ---------- | --------------- |

## Dropped
