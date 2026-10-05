# Spec — 8-bit skin: settings across languages, the Konami code, a locked Inspector

## Problem

Three things the requester reported on 2026-10-04, after using the skin of
`2026-10-04_pixel-art-and-juice`.

**1. The music stops when the language changes.** A change of language is a full page load, and the
music is kept in memory only: the previous spec made it "off whenever the page loads". Measured on the
production build, with the three switches of the PAUSE menu changed and then the language link pressed:

| Switch  | Before the change | After it |
| ------- | ----------------- | -------- |
| Sound   | off               | off      |
| Music   | on                | **off**  |
| Effects | off               | off      |

Sound and effects are kept, in `localStorage`. The music is the one setting that is lost.

**2. The Konami code "stopped working".** Root cause analysis:

- **Not reproduced** in any of these, on the production build and on `npm run dev`, in Chromium, Firefox
  and WebKit: a fresh visit; a visit with the skin stored; after leaving the skin with the navbar
  button; after a change of language with the music on; typed with and without a pause between keys;
  three times in a row. Nor with the focus on each focusable element of the page in turn: 35 in the
  normal skin and 39 inside the 8-bit one, in Chromium and WebKit. The code switched the skin every
  time.
- **Reproduced** in one case: after a press on the pause control of the band of technologies. In
  Chromium and Firefox the focus stays on its checkbox, and the listener ignores every key whose target
  is inside an `input` (`skin-easter-egg.tsx`). The code then does nothing until the focus moves
  somewhere else. In WebKit on macOS a click does not focus a checkbox, and the code works.
- The guard exists so that text typed in a form field is not read as the code. A checkbox takes no
  text. It is older than the previous spec, but that spec made it easy to hit: inside the skin every
  control now answers with a sound, which invites pressing each one, and the pause of the band is one of
  them.
- **Closed on 2026-10-04:** after this work the requester confirmed that the code works. Whether the
  focus on that checkbox was the case they had hit was not asked.

**3. The window with the technical data opens too easily.** The Inspector is one press on the magnifier
of the navbar, as soon as the skin is entered.

## Expected outcome

The music keeps playing through a change of language, the Konami code works wherever the focus is except
in a field that takes text, and the Inspector is a reward the visitor unlocks by going through the page.

## Scope

1. **The music is kept for the session of the tab.** A change of language and a reload keep it; a new
   visit starts without it; leaving the skin turns it off.
2. **The Konami code ignores only keys typed where text is entered.**
3. **The Inspector starts locked.** In its place the navbar shows a lock. Pressing it says how to unlock
   it: by visiting the five sections, which is the "Explorer" achievement. From then on the magnifier
   is there, on every visit.
4. **A correction to `.specs/memory/playwright-and-axe.md`.** Gathering the evidence above showed that
   the three engines of Playwright start an `AudioContext` on a page nobody has pressed. The note that
   says they "run a context that a click creates" is true and proves less than it reads: the suites
   cannot tell whether the gesture matters.

## Out of scope

- **Music that survives a visit.** It stays off by default: a tune that starts by itself days later is
  what "off whenever the page loads" was protecting from.
- **The PAUSE menu or the Inspector staying open** through a change of language. They are not settings.
- **Another code, or another way in.** The sequence and the pixel of the footer stay as they are.
- **What the Inspector shows.**

## Acceptance criteria

The gate, green in the five Playwright projects:
`npm run lint:eslint:check && npm run lint:prettier:check && npm run build && npm run test:e2e`

- [x] **Music:** turned on, then the language link pressed: at the other language the Music switch is
      on and sounds keep starting, with nothing pressed there. A reload keeps it too. A new tab, which
      is a new session, starts with it off. Leaving the skin turns it off, and entering again starts
      with it off.
- [x] **Sound and effects:** both off, then the language changed: both are still off.
- [x] **Konami code:** with the focus on the checkbox of the band, the code switches the skin, in the
      three engines. With the focus on a text field it still does not.
- [x] **Inspector, locked:** in a skin with no achievement, the magnifier is not displayed and a button
      whose name says the Inspector is locked is. Pressing it opens nothing and puts the way to unlock
      it in the `role="status"` region. It is an ordinary button, not one marked `aria-disabled`: see
      "The lock is a button that answers" in `design.md`.
- [x] **Inspector, unlocked:** after the five sections have been visited, the toast of the achievement
      names the reward, the lock is gone, the magnifier is displayed and opens the panel. If the lock
      had the focus, the magnifier has it. After a reload it is still unlocked.
- [x] **No jump in the navbar:** the other controls of the bar are at the same place, within 1 px, with
      the Inspector locked and unlocked.
- [x] **The normal skin is untouched:** the twelve screenshots are identical to those of `f835431`.
- [x] **Loading:** the script of the first load is at most 0.2 KB above the 198.6 KB of the previous
      spec. `npm run audit` and `npm run audit -- --path=/en` report at least 95 in every category.
- [x] **Accessibility and languages:** no axe violation with the lock in the navbar, in both themes;
      nothing of the new copy is left in the source language at `/en`; the lock is a 44 px target
      below `lg`.

## Requester decisions

| Decision                           | Choice                                                                                                                                                                                   | When       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| The music and a change of language | The settings of the skin are kept through it. It replaces "a reload turns it off" of `2026-10-04_pixel-art-and-juice`                                                                    | 2026-10-04 |
| How long the music is kept         | The session of the tab, approved with the spec as proposed. Offered and not chosen: only the navigation of a change of language; for ever, like the mute                                 | 2026-10-04 |
| The Konami code                    | It has to work again                                                                                                                                                                     | 2026-10-04 |
| The Inspector                      | A little harder to open                                                                                                                                                                  | 2026-10-04 |
| How the Inspector is unlocked      | By visiting the five sections, stated by the requester. Offered and not chosen: a number of achievements, whichever they are; a second code typed on the keyboard; holding the magnifier | 2026-10-04 |
| The spec                           | Approved                                                                                                                                                                                 | 2026-10-04 |

## Dependencies and blockers

None outside the repository.
