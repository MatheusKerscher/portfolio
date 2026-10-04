# Tasks — The page on a phone: centred layout, type scale and touch

States: `[ ]` open · `[~]` in progress · `[x]` done and verified · `[!]` blocked · `[-]` dropped

"The gate" below means:
`npm run lint:eslint:check && npm run lint:prettier:check && npm run build && npm run test:e2e`, all
exiting 0.

## Prerequisites

- [x] Plan approved by the requester — _verified by:_ approved in the conversation on 2026-10-04, after
      four questions (how far to centre, fonts, back to top, menu). Its approval is the approval of
      this scope.
- [x] Baseline captured before any change — _verified by:_ 48 screenshots of the build of `b20063d` at
      1440×900 and 1024×768, `/` and `/en`, both themes and both skins; two captures of it are
      identical.

## Implementation

- [x] Navbar: 44 px targets and the full-screen menu — _verified by:_ the `mobile` suite (menu, touch
      targets) and the menu tests of `home`, `stacking` and `i18n`, in both mobile projects.
- [x] Hero centred, larger portrait, type sizes — _verified by:_ the `mobile` suite (centred, hero
      type, minimum sizes) and the 320 px tests of `stacking` and `skin`.
- [x] Sections, carousels and cards centred; controls below the items — _verified by:_ the `mobile`
      suite (centred, first card) and the `carousel` suite in the mobile projects.
- [x] "Sobre", "Contato" and the footer centred, with 44 px targets — _verified by:_ the `mobile` suite.
- [x] Back to top shown while scrolling up — _verified by:_ the `mobile` suite and the "reached
      un-obscured" test of `stacking`.
- [x] The new checks can fail — _verified by:_ a build with the hero left aligned and a 32 px toggle
      failed the centring and the target tests (`findings.md`).
- [x] Desktop untouched — _verified by:_ the pixel comparison of the build of `889d222` with the
      baseline: 48 screenshots, zero differing pixels.
- [x] Loading measured — _verified by:_ `npm run audit` on `/` and `/en`: 100 in every category,
      196.9 KB of script against 196.5 KB.
- [x] The gate — _verified by:_ 413 passed, 237 skipped on `889d222`.
- [x] Documentation: `CLAUDE.md`, `README.md`, `findings.md`, `.specs/memory/` — _verified by:_
      `npm run lint:prettier:check`.

## Rollout

- [x] The requester reviews `phone-before-after.jpg` and the site on a phone (type sizes, centred text
      of the cards) — _verified by:_ their answer in the conversation on 2026-10-04, with two
      adjustments, which are the spec `2026-10-04_carousel-dots-and-stack-marquee`: dots instead of
      arrows on a phone, and the technologies as a marquee band.
- [x] Push and pull request — _verified by:_ the requester pushed the branch and asked for the pull
      request, #44, merged on 2026-10-04.

## Blocked

| Item | Blocked by | Who unblocks it |
| ---- | ---------- | --------------- |

## Dropped

- **The unlock of the page in the click handler of a menu link.** It was in the first version and in the
  design; the measurement in `findings.md` showed the effect already does it.
