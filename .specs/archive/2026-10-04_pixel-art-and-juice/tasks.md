# Tasks — 8-bit mode: everything in pixel art, and juice

States: `[ ]` open · `[~]` in progress · `[x]` done and verified · `[!]` blocked · `[-]` dropped

"The gate" below means:
`npm run lint:eslint:check && npm run lint:prettier:check && npm run build && npm run test:e2e`, all
exiting 0.

## Prerequisites

- [x] Plan approved by the requester — _verified by:_ approved in the conversation on 2026-10-04, after
      four questions (where the juice lives, sound, text, extras) and one note of theirs (normal scroll
      inside the skin). Its approval is the approval of this spec.
- [x] Baseline taken before any change — _verified by:_ `findings.md` holds the script, document and
      stylesheet bytes of `/` and `/en`, both audits and the screenshots of the build of `f835431`.

## Implementation

### Phase 1 — everything in pixel art (first paint)

- [x] Normal scroll inside the skin — _verified by:_ the `stacking` suite: the panels do not pin in the
      8-bit skin, and every test of the normal skin passes unchanged.
- [x] Body copy in the pixel font — _verified by:_ the `skin` suite (computed font of the body, a
      paragraph, a card, the footer; nothing below 12 px) and the 320 px, line-count and touch-target
      tests inside the skin.
- [x] Pixel icons — _verified by:_ the `skin` suite: every vector drawing is followed by its pixel one (22
      pairs in the prerendered page), and each skin shows one of each.
- [x] Pixel logos and cursors, generated — _verified by:_ the `skin` suite (source and rendering of the
      logos); a second run of `npm run assets:pixel` writes the same bytes (`findings.md`).
- [x] Shape: frames, scrollbar, scanlines, selector, dialogue box — _verified by:_ screenshots of the
      skin in both themes at 1440 and 390 px; the axe matrix.
- [x] `--scenery` and its pairs — _verified by:_ the `palette` suite in both themes.

### Phase 2 — the runtime, sound and controls

- [x] The gate, the lazy runtime and its stylesheet — _verified by:_ the `juice` suite: the normal skin
      never creates an `AudioContext`; the stylesheet of the chunk is fetched with it (`findings.md`).
- [x] Preferences and sound effects — _verified by:_ the `juice` suite: sounds start on entry and on a
      press, none when muted, and the mute survives a reload.
- [x] The mute button and the PAUSE menu — _verified by:_ the `juice` suite (switches, Escape, focus
      back to the button), the axe scan with the menu open, the touch-target test of `mobile`.

### Phase 3 — visual juice

- [x] Particles, shake and the wipe of the skin — _verified by:_ the `juice` suite: a press adds one
      burst and removes it; none with the effects off or under reduced motion.
- [x] Scenery, shapes, parallax, idle sprite — _verified by:_ the `juice` suite: running animations
      with the effects on, none off or under reduced motion.
- [x] Stepped reveals — _verified by:_ the `home` and `a11y` suites pass in both skins; screenshots.

### Phase 4 — extras

- [x] HUD: XP bar and stage notice — _verified by:_ the `juice` suite.
- [x] Achievements — _verified by:_ the `juice` suite: toast in a status region, persistence, the count
      of the PAUSE menu, the Konami one.
- [x] Music — _verified by:_ the `juice` suite: off on load, sounds keep being scheduled when on, off
      again after a reload.
- [x] RPG dialogue — _verified by:_ the `juice` suite: the accessible text of the tagline during and
      after the typing, and after leaving the skin.

### Closing

- [x] The normal skin did not move — _verified by:_ the pixel comparison of 12 screenshots with the
      baseline: zero differing pixels.
- [x] Loading measured — _verified by:_ `npm run audit` on `/` and `/en`, and the three budgets of the
      spec, in `findings.md`.
- [x] The new checks can fail — _verified by:_ two builds broken on purpose (`findings.md`).
- [x] Documentation: `CLAUDE.md`, `README.md`, `findings.md`, `.specs/memory/` — _verified by:_
      `npm run lint:prettier:check`.
- [x] The gate — _verified by:_ 532 passed, 263 skipped on the working tree (`findings.md`).

## Rollout

- [x] Contact sheet of the icons, logos and cursors (`icon-sheet.png`, next to this file) approved by
      the requester — _verified by:_ their answer in the conversation on 2026-10-04.
- [x] Music and sound approved by ear — _verified by:_ their answer in the conversation on 2026-10-04.
- [x] The reading of "normal scroll" confirmed: inside the 8-bit skin only — _verified by:_ their answer
      in the conversation on 2026-10-04.

## Blocked

| Item | Blocked by | Who unblocks it |
| ---- | ---------- | --------------- |

## Dropped

- **The reset of the sticky position inside the skin.** It was the third of the rules that undo the
  stack, and removing it changed nothing: see `findings.md`.
- **A probe for the stylesheet of the lazy chunk before the runtime existed.** It was measured on the
  runtime itself, as soon as it built.
