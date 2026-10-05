# Design — 8-bit mode: everything in pixel art, and juice

## Approach

The work is split by **when** a rule or a piece of code has to exist.

**First paint** — `globals.css` and the markup. Only what changes shape and layout: the font of the
body, the pixel icons, the corners, the normal scroll. A returning visitor has the skin applied by the
inline script of `<head>`, so these have to be in the stylesheet that blocks rendering, or the page
would jump after hydration.

**The 8-bit runtime** — one lazy chunk, `next/dynamic` with `ssr: false`, the way `InspectorPanel` is
loaded. Sound, particles, the scenery, the HUD, the achievements, the music, the dialogue and their
stylesheet. `PixelRuntimeGate`, a few lines in the first load, renders it while `useSkin()` is `8bit`.
The new controls reach the navbar through portals into empty slots (`<span data-px-slot>`), so no new
component is added to the first load.

The runtime reaches the page through selectors and a handful of `data-px` attributes, by delegation on
`document`. No existing component learns about sound or particles.

```
toggleSkin(by)                first load
  ├─ unlockAudio()            creates the AudioContext inside the gesture
  └─ data-skin="8bit"  ──►  PixelRuntimeGate ──► import("./pixel-runtime")   lazy
                                                   ├─ pixel.css
                                                   ├─ sound: effects by delegation, music
                                                   ├─ scenery, particles, HUD, toasts
                                                   └─ portals: mute button, PAUSE menu
```

## Files affected

| File                                                                                                                                                                                              | Role                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/globals.css`                                                                                                                                                                             | First-paint rules of the skin, the `--scenery` token, the wipe of the skin                                                              |
| `src/lib/pixel-grid.ts` (new)                                                                                                                                                                     | A grid of characters to runs and to an SVG path; `MiniSprite` uses it too                                                               |
| `src/app/components/pixel-icon.tsx`, `pixel-icons.ts` (new)                                                                                                                                       | The pixel icon and its 16×16 grids, one named export each                                                                               |
| `social-icons.tsx`, `project-card.tsx`, `contact-section.tsx`, `marquee.tsx`, `carousel-controls.tsx`, `theme-toggle.tsx`, `back-to-top.tsx`, `hero-section.tsx`, `inspector/inspector-panel.tsx` | Both drawings of each icon in the markup                                                                                                |
| `about-section.tsx`, `src/app/data/site.ts`                                                                                                                                                       | The pixel logo next to the vector one; `pixelLogo()`                                                                                    |
| `portrait.tsx`, `hero-section.tsx`, `project-card.tsx`, `skin-toggle.tsx`, `skin-easter-egg.tsx`, `inspector/inspector-toggle.tsx`, `navbar.tsx`, `src/app/[lang]/layout.tsx`                     | `data-px` hooks, the slots, the gate                                                                                                    |
| `src/lib/skin.ts`, `src/lib/audio-context.ts` (new)                                                                                                                                               | How the skin was entered; the `AudioContext`, created inside the gesture; the easing of a reveal                                        |
| `motion-section.tsx`, `animated-text.tsx`                                                                                                                                                         | A stepped easing inside the skin                                                                                                        |
| `src/app/components/pixel/pixel-runtime-gate.tsx` (new)                                                                                                                                           | The few lines of the first load that mount the runtime                                                                                  |
| `src/app/components/pixel/pixel-runtime.tsx`, `pixel.css` (new)                                                                                                                                   | The root of the runtime and its stylesheet                                                                                              |
| `pixel/sound-effects.ts`, `effects.tsx`, `scenery.tsx`, `hud.tsx`, `notices.ts`, `achievements.ts`, `dialogue.ts` (new)                                                                           | Sound by delegation; particles and one-shot animations; the background; the XP bar and the notices; the achievements; the typed tagline |
| `pixel/sound-toggle.tsx`, `pause-menu.tsx`, `slot.tsx` (new)                                                                                                                                      | The controls, and the portal that puts them in the navbar                                                                               |
| `src/lib/store.ts`, `pixel-prefs.ts`, `pixel-audio.ts`, `pixel-music.ts` (new)                                                                                                                    | A store outside React; preferences and achievements; the sound effects; the sequencer                                                   |
| `src/app/data/dictionaries/pixel/*` (new)                                                                                                                                                         | The copy of the runtime, in both languages                                                                                              |
| `scripts/assets/pixel-art.mjs` (new), `scripts/pixel-assets.mjs`                                                                                                                                  | The grids of the logos and the cursors, their export, and the contact sheet (`--icons`)                                                 |
| `public/tech/8bit/*`, `public/pixel/*` (new, generated)                                                                                                                                           | Logos and cursors                                                                                                                       |
| `src/lib/palette-contract.ts`                                                                                                                                                                     | The pairs of `--scenery`                                                                                                                |
| `e2e/juice.spec.ts` (new), `e2e/stacking.spec.ts`, `skin.spec.ts`, `i18n.spec.ts`, `a11y.spec.ts`, `helpers.ts`                                                                                   | The criteria of the spec                                                                                                                |
| `CLAUDE.md`, `README.md`, `.specs/memory/`                                                                                                                                                        | The conventions that changed, and what was verified                                                                                     |

Reuse: `useSkin()`, `toggleSkin()` and the store shape of `src/lib/skin.ts`; the run-length conversion
of `mini-sprite.tsx`; the `pixel` variant and the "both in the markup, CSS shows one" pattern of
`portrait.tsx` and `project-card.tsx`; `pixelThumbnail()` as the model for `pixelLogo()`; the lazy
dictionary of the Inspector as the model for the one of the runtime; the non-modal dialog of
`inspector-panel.tsx` as the model for the PAUSE menu; `MiniSprite`; `yearsOfExperience`; the helpers
of `e2e/helpers.ts`.

## Technical decisions

### The skin does not stack

**Choice:** two unlayered rules undo the spacer and the negative margin of the slots. A panel keeps its
minimum height, so each section is still a screen, and it keeps `position: sticky`: in a slot of its own
height it has nowhere to stick. A third rule that reset the position changed nothing and was removed
(`findings.md`).
**Why:** it is the state `prefers-reduced-motion` already produces, and the suites already check it. The
slots do not move, so anchors and the scroll position are the same in both skins.
**Rejected alternative:** leaving `StackController` out of the skin. It only writes `--panel-h` and
reveals a focused element that is covered; with nothing pinned it does nothing.

### Both drawings of an icon are in the markup

**Choice:** every icon is two sibling `<svg>` elements, the vector one with `pixel:hidden` and the pixel
one with `hidden pixel:block`. The pixel one is a single path built from a 16×16 grid of characters, in
`currentColor`, with `shape-rendering: crispEdges`.
**Why:** the skin is only known in the browser, and this is how the portrait and the thumbnails already
work. An inline SVG is not a request, takes the colour and the size of the text around it, and adds no
wrapper: the normal skin lays out exactly as before.
**Rejected alternatives:** a CSS mask from a sprite file — one more request inside the skin, a moment
without icons while it loads, and an index to keep in step with the file. An external `<use>` — whether
a hidden one is fetched differs between engines, and the normal skin must request nothing. An icon font
— no.

### The grids are named exports

**Choice:** `pixel-icons.ts` exports each grid on its own, and `PixelIcon` takes the grid as a prop.
**Why:** five icons are used by Client Components of the first load. An object of all the grids would
ship every one of them to the browser.

### The logos and the cursors are generated images; the icons are not

**Choice:** multi-colour 16×16 grids in `scripts/assets/pixel-art.mjs`, written as palette PNG files
by `npm run assets:pixel`, shown enlarged with `image-rendering: pixelated`.
**Why:** a logo has its own colours and is repeated eighteen times by the band; as inline SVG that is
tens of kilobytes of markup. A hidden lazy image costs one tag and no request
(`.specs/memory/styling-and-build-pitfalls.md`). An icon needs `currentColor`, which an image cannot
give.
**Rejected alternative:** downscaling the vector logos by script. At 16×16 the letters of "JS", "TS",
"5" and "3" become blots; a logo is drawn.

### Every sound is synthesised

**Choice:** Web Audio oscillators and a noise buffer, a table of effects in `pixel-audio.ts` and a
step sequencer in `pixel-music.ts`.
**Why:** it is how an 8-bit console made sound, it weighs a few kilobytes of code inside the lazy chunk,
and there is nothing to license.
**Rejected alternative:** audio files — requests, formats and licences, for a worse result.

### The `AudioContext` is created by `toggleSkin()`

**Choice:** `src/lib/audio-context.ts`, a few lines in the first load, creates the context when the skin
is entered and the sound is not muted. The lazy engine uses that same module.
**Why:** the runtime arrives after the gesture has ended, and WebKit only starts a context inside one.
For a returning visitor there is no gesture yet: the runtime creates the context on the first
`pointerdown` or `keydown`.

### One switch for everything that moves on its own

**Choice:** `data-fx="off"` on `<html>`, set by the PAUSE menu and kept in `localStorage`. The ambient
animations are declared under `:not([data-fx="off"])` inside
`@media (prefers-reduced-motion: no-preference)`; the particles, the shake and the typing check the same
two conditions in JavaScript.
**Why:** content that moves for more than five seconds needs a way to stop it (WCAG 2.2.2), and the
project already took the strict reading of it for the band of technologies. The skin needs JavaScript to
exist, so its control can.

### The scenery is a fixed layer in a token of its own

**Choice:** one `aria-hidden` layer, fixed behind the content (`z-index: -1`), with the panels made
transparent inside the skin. Its shapes are painted in `--scenery`, a token a step away from `--paper`,
and `ink`, `ink-muted` and `brand` on it are pairs of the palette contract. Vivid accents in `brand`
exist only where there is no text: around the portrait and on the edge between two sections.
**Why:** content that scrolls over a fixed layer passes every shape behind every text. The text has to
stay readable over the shape, which bounds how dark the shape can be; in the light theme `brand` on
`--paper` is 5.1:1, so the room is small. A layer of its own is one portal into `body`, where a layer
per panel would add nodes to trees React rendered.

### The controls are a mute button and a PAUSE menu

**Choice:** a mute button in the navbar from `sm` up, and a PAUSE button at every width that opens a
non-modal dialog with the three switches, the level and the achievements. The way out of the skin and
the Inspector toggle stay as they are.
**Why:** at 320 px the bar holds five 44 px targets and the brand, with no gap between them; a sixth
does not fit. On a phone there is no hover, so the sounds are the ones of a tap, and two taps to mute is
acceptable.
**Rejected alternatives:** a second row under the navbar — 108 px of fixed chrome on a phone. Turning
the mini sprite into the menu — the way out of the skin would take two clicks, against the decision of
2026-10-03.

### The dialogue types into a copy

**Choice:** while the tagline is typed, the paragraph holds the whole text for assistive technology
(`sr-only`) and an `aria-hidden` copy split in two: what has been typed, and the rest with
`visibility: hidden`. When it ends, or when the skin is left, the paragraph is one text node again.
**Why:** the hidden rest keeps the box at its final size, so nothing moves while it types. The hero stays
a Server Component with no script of its own.

### The runtime listens on the capture phase

**Choice:** the listeners of the runtime are on `document`, in the capture phase.
**Why:** the sound of a toggle depends on the state it is leaving ("on" or "off", "open" or "close"),
and an achievement on what was pressed. On the capture phase the listener runs before the handler of the
component, whatever React does with the event, so it reads the state the press is about to change.
**Rejected alternative:** props or callbacks from each component — every one of them would import
something of the runtime, which would then be part of the first load.

### State outside React, in two small stores

**Choice:** `src/lib/store.ts`, a value with listeners read through `useSyncExternalStore`, holds the
preferences (`pixel-prefs.ts`) and the notices on screen (`notices.ts`).
**Why:** what changes them is not a component: a press caught by delegation, a timer, an observer. A
store can be written from there, and a component only renders it. It is the shape `skin.ts` already has.

### The copy of the runtime has its own dictionary

**Choice:** `dictionaries/pixel/`, imported by the lazy chunk, which is given the language as a prop.
**Why:** it is the exception the Inspector already has, for the same reason: a lazy client chunk has no
Server Component parent to pass it strings.

## Known risks

| Risk                                                         | How it shows up                                            | Mitigation                                                                                                               |
| ------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Next puts the stylesheet of the lazy chunk in the first load | The stylesheet of the normal skin grows past the budget    | Measured as soon as the runtime exists; the number goes to `findings.md`, and the budget decides where the rules live    |
| The pixel font is wider than the body font                   | Overflow at 320 px; the role of the hero takes three lines | The `skin` and `mobile` suites run those checks inside the skin; spacing is adjusted inside the skin only                |
| The runtime changes nodes React rendered                     | The tagline is lost or doubled                             | Only nodes React never renders again; the original text is restored on the way out; a test enters and leaves             |
| A toast or the HUD is on top of a control                    | Playwright retries a click and scrolls the page            | `pointer-events: none` on every notice                                                                                   |
| axe reads a colour in the middle of a fade                   | `color-contrast` on a toast                                | Notices appear in steps of position, never of opacity                                                                    |
| The autoplay policy                                          | No sound in Safari                                         | The context is created inside the gesture; for a returning visitor, on the first interaction                             |
| The drawings and the music are a matter of taste             | Rework                                                     | The requester approves the contact sheet and the music; the music can leave the scope without touching anything else     |
| Ambient animation costs frames                               | A slow scroll inside the skin                              | Only `transform` and `opacity` are animated; a burst is eight nodes, removed when it ends; at most four bursts at a time |

## Failing safely

- **No `AudioContext`, or it throws:** the site is silent and nothing else changes.
- **`localStorage` unavailable:** the preferences apply to the page view; nothing is remembered.
- **The runtime fails to load:** the skin is the first-paint one — pixel font, icons, corners — with no
  sound and no effects. Nothing of the page depends on the runtime.
- **A selector of the runtime matches nothing** (a component was renamed): that effect does not happen.
  The suites of the spec fail, not the page.
- **The asset script** writes only to `public/avatar/`, `public/thumbnails/8bit/`, `public/tech/8bit/`,
  `public/pixel/` and the icon files of `src/app/`.
