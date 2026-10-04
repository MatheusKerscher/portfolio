# Tasks — The page on a phone: centred layout, type scale and touch

States: `[ ]` open · `[~]` in progress · `[x]` done and verified · `[!]` blocked · `[-]` dropped

"The gate" below means:
`npm run lint:eslint:check && npm run lint:prettier:check && npm run build && npm run test:e2e`, all
exiting 0.

## Prerequisites

- [x] Plan approved by the requester — _verified by:_ approved in the conversation on 2026-10-04, after
      four questions (how far to centre, fonts, back to top, menu). Its approval is the approval of
      this scope.
- [ ] Baseline captured before any change — _verified by:_ screenshots of the build of `b20063d` at
      1440×900 and 1024×768, `/` and `/en`, both themes and both skins, kept outside the repository.

## Implementation

- [ ] Navbar: 44 px targets and the full-screen menu — _verified by:_ the `mobile` suite (menu, touch
      targets) and the menu tests of `home`, `stacking` and `i18n`.
- [ ] Hero centred, larger portrait, type tokens — _verified by:_ the `mobile` suite (centred, hero
      type) and the 320 px tests of `stacking` and `skin`.
- [ ] Sections, carousels and cards centred; controls below the track — _verified by:_ the `mobile`
      suite (centred, first card) and the `carousel` suite in the mobile projects.
- [ ] "Sobre", "Contato" and the footer centred, with 44 px targets — _verified by:_ the `mobile` suite.
- [ ] Back to top shown while scrolling up — _verified by:_ the `mobile` suite and the "reached
      un-obscured" test of `stacking`.
- [ ] Desktop untouched — _verified by:_ the pixel comparison with the baseline: zero differing pixels.
- [ ] Loading measured — _verified by:_ `npm run audit` on `/` and `/en`, numbers in `findings.md`.
- [ ] Documentation: `CLAUDE.md`, `findings.md`, `.specs/memory/` — _verified by:_ the gate.

## Rollout

- [ ] The requester reviews the screenshots (type scale, centred card text) — _verified by:_ their
      answer in the conversation.
- [ ] Push and pull request — _verified by:_ their go-ahead; nothing is pushed without it.

## Blocked

| Item | Blocked by | Who unblocks it |
| ---- | ---------- | --------------- |

## Dropped
