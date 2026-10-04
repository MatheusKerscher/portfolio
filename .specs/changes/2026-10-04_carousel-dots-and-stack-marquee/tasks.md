# Tasks — Dots for the carousels of a phone, and the technologies as a marquee band

States: `[ ]` open · `[~]` in progress · `[x]` done and verified · `[!]` blocked · `[-]` dropped

"The gate" below means:
`npm run lint:eslint:check && npm run lint:prettier:check && npm run build && npm run test:e2e`, all
exiting 0.

## Prerequisites

- [x] Plan approved by the requester — _verified by:_ approved in the conversation on 2026-10-04, after
      two questions (what an item of the band shows, where the dots replace the buttons).
- [ ] Baseline captured before any change — _verified by:_ screenshots of each panel of the build of
      `25cff3f`, kept outside the repository.

## Implementation

- [ ] Dots below 768 px, with the window of the reference — _verified by:_ the `carousel` suite in the
      mobile projects and the direct tests of `carousel-dots.ts`.
- [ ] The band of technologies — _verified by:_ the `marquee` suite, in both languages.
- [ ] The descriptions leave the dictionaries — _verified by:_ `npm run build` (the dictionaries are
      typed against each other) and the `ssr` and `i18n` suites.
- [ ] The new checks can fail — _verified by:_ a build with the logic broken fails them.
- [ ] The other panels did not move — _verified by:_ the pixel comparison per panel.
- [ ] Loading measured — _verified by:_ `npm run audit` on `/` and `/en`, numbers in `findings.md`.
- [ ] Documentation: `CLAUDE.md`, `README.md`, `findings.md` — _verified by:_ the gate.

## Rollout

- [ ] The requester reviews the screenshots — _verified by:_ their answer in the conversation.
- [ ] Push and pull request — _verified by:_ their go-ahead; nothing is pushed without it.

## Blocked

| Item | Blocked by | Who unblocks it |
| ---- | ---------- | --------------- |

## Dropped
