# Design — 8-bit skin: settings across languages, the Konami code, a locked Inspector

## Approach

Each of the three is a small change where the behaviour already lives. Two of them are inside the lazy
runtime of the skin, so the first load gains only what the Konami listener needs.

**Music.** `pixel-prefs.ts` reads its first value from `sessionStorage` and `setMusic()` writes it there.
The runtime already turns the music off when the skin is left, which now clears the stored value too.
On a page that loads with the music on there is no gesture yet. The runtime creates the `AudioContext`
all the same: the music is back at once where the browser lets the context run, and on the first press
otherwise, which the runtime already listens for.

**Konami code.** The guard of `skin-easter-egg.tsx` keeps ignoring `textarea`, `select`,
`[contenteditable]` and every `input` except a checkbox.

**Inspector.** The lock is the runtime's. `InspectorToggle` stays as it is, except that the stylesheet of
the runtime, not a utility, displays its button, and only while `<html>` carries
`data-px-inspector="unlocked"`. The runtime sets that attribute from the achievements. While it is locked,
the runtime renders its own button, a lock, through a slot next to the toggle. Both sit in one box that
the root layout reserves from the first paint, so nothing in the navbar moves when one replaces the
other.

```
html[data-px-inspector]   set by the runtime, from "explorer" in the achievements
  locked    ──►  the lock (runtime, in the slot)      press: a thud, and the hint in the status region
  unlocked  ──►  the magnifier (InspectorToggle)      press: opens the panel, as today
```

## Files affected

| File                                                                                                   | Role                                                                            |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `src/lib/pixel-prefs.ts`                                                                               | The music read from and written to `sessionStorage`                             |
| `src/lib/pixel-music.ts`, `pixel/pixel-runtime.tsx`                                                    | The sequencer waits for a context that is running                               |
| `src/app/components/skin-easter-egg.tsx`                                                               | The guard of the Konami code                                                    |
| `src/app/[lang]/layout.tsx`                                                                            | The box of the Inspector in the navbar, with the slot of the lock               |
| `src/app/components/inspector/inspector-toggle.tsx`                                                    | Its button is displayed by the stylesheet of the runtime                        |
| `pixel/inspector-lock.tsx` (new), `pixel/pixel.css`                                                    | The lock, and the rule that displays the magnifier                              |
| `pixel/achievements.ts`, `sound-effects.ts`, `notices.ts`, `hud.tsx`                                   | The attribute, the sound of a locked press, the hint and the reward in a notice |
| `src/app/data/dictionaries/pixel/*`                                                                    | The name of the lock, the hint, the reward                                      |
| `e2e/juice.spec.ts`, `skin.spec.ts`, `inspector.spec.ts`, `i18n.spec.ts`, `a11y.spec.ts`, `helpers.ts` | The criteria; `unlockInspector()` for the suites that open the panel            |
| `CLAUDE.md`, `.specs/memory/playwright-and-axe.md`                                                     | The convention of the Inspector; the correction about audio                     |

Reuse: `Slot` and the reserved slots of the navbar; `unlock()` and the `explorer` achievement;
`announceAchievement()` and the status region of `hud.tsx`; `animate()` and the `px-bump` class; the
`bump` effect; `PixelIcon` and the `lock` grid; `storeSkin` as the model for `unlockInspector`.

## Technical decisions

### The music is kept in `sessionStorage`

**Choice:** one key, written by `setMusic()` and read once, when the store is first used.
**Why:** it is the storage whose lifetime is the request: it survives a navigation and a reload of the
tab, and a new visit starts without it. No code has to tell a change of language from another load.
**Rejected alternatives:** a flag that the language link sets for the next load, as the scroll position
does — a reload would turn the music off, and the requester asked for the settings to be kept.
`localStorage` — the music would start by itself on a later visit.

### The sequencer is started on a context that may be suspended

**Choice:** with the music on, the runtime creates the context and starts the loop at once, whatever the
state of the context. `pixel-music.ts` does not change.
**Why:** a page that loads with the music on has had no press. Where a browser lets the context run, the
music is back without one. Where it does not, the clock of the context stands still, and the sequencer
only schedules what is due in the next 120 ms of that clock: it stops after one step and goes on when
the first press resumes the context.
**Changed during the implementation:** the first version of this decision followed `statechange` before
starting the loop, to keep notes from piling up on a clock that is not moving. Reading the sequencer
showed that its look-ahead already prevents that, so the extra state was not written.
**The first press, for a finger:** the runtime resumes the context on `pointerdown` and `keydown`. The
HTML Standard counts the end of a touch, not its start, as the gesture, so `pointerup` is listened to as
well.
**Not verified, and it cannot be here:** which browsers let it run. The engines of Playwright start a
context on a page nobody has pressed, so the suites pass either way (`findings.md`).

### The Konami code lets a checkbox through

**Choice:** `input:not([type="checkbox"]), textarea, select, [contenteditable]`.
**Why:** the guard is for keys that mean something to the field. A checkbox takes neither letters nor
arrows. A `select` and a radio group take arrows, and a range input too, so they stay.
**Rejected alternative:** listening only when the focus is on `body` — the code would stop working after
any press on a link or a button, which is most of what a visitor does.

### The lock is rendered by the runtime, in a box the layout reserves

**Choice:** the root layout wraps `InspectorToggle` and a slot in one box of the size of a control. The
runtime shows one of the two.
**Why:** whether the Inspector is unlocked is in `localStorage`, which the first paint does not know.
With the box reserved, the navbar is laid out once; what appears in it, a moment after hydration, is an
icon. The first load gains no script: the lock, its copy and its rule are in the lazy chunk.
**Rejected alternatives:** `InspectorToggle` reading the achievements — the store of the runtime would
join the first load. The inline script of `<head>` setting the attribute — it would know about
achievements, for the sake of one icon.

### The lock is a button that answers

**Choice:** an ordinary `button`, named "Inspector locked". It is not marked `aria-disabled`.
**Why:** a press on it does something: it puts the way to unlock the Inspector in the status region.
`aria-disabled` says that a control cannot be operated, and whoever hears "unavailable" does not press
it, so would never be told what to do.
**Changed during the implementation:** the spec first asked for `aria-disabled="true"`. Playwright
refused to press such a button without being forced to, which is the same reading of the attribute.

### The attribute is `data-px-inspector`

**Why:** the Inspector marks its own panel and overlays with `data-inspector`, and leaves out of its
measurements whatever is inside an element that carries it. On `<html>`, that was the whole page: the
overlays of landmarks drew nothing, and the `inspector` suite caught it.

### The Inspector is unlocked by an achievement that exists

**Choice:** `explorer`, the five sections visited.
**Why:** it is the one achievement that asks the visitor to go through the page, which is what the
Inspector then measures; it can be done by keyboard and by touch; and whoever has it already keeps the
Inspector. The toast of the achievement names the reward, and the lock, when pressed, names the way.

## Known risks

| Risk                                                    | How it shows up                                      | Mitigation                                                                                              |
| ------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| The requester's Konami failure is another one           | The code still fails for them                        | The criteria cover the case that was reproduced; the spec records that their steps are needed otherwise |
| A browser warns about a context created without a press | A console warning inside the skin, with the music on | Accepted: it is the price of the music coming back without a press where that is allowed                |
| The suites that open the Inspector find it locked       | `inspector`, `i18n` and `skin` fail                  | `unlockInspector()` stores the achievement before the page loads, as `storeSkin` stores the skin        |
| The lock and the magnifier are both shown, or neither   | Two controls, or a hole in the navbar                | One attribute with two values decides both; the suite checks each state                                 |

## Failing safely

- **The runtime does not load:** the box of the Inspector stays empty. Locked is the default; the
  Inspector is the only thing of the page that needs the runtime.
- **`sessionStorage` unavailable:** the music is kept for the page view, as before.
- **A stored achievement list that is not one:** it is read as empty, and the Inspector is locked.
