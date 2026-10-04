# Findings — The page on a phone: centred layout, type scale and touch

Measured on 2026-10-04 on macOS, Node 22.21.0, Next 16.3.8, against the production build
(`next build && next start -p 3100`). "Before" is `b20063d`; "after" is `889d222`.

## The desktop did not move

48 screenshots were taken of the build before the work: `/` and `/en`, at 1440×900 and 1024×768, in both
themes and both skins, each as the whole page in normal flow (reduced motion), as the top of the page
with the stack active, and with a panel pinned.

- **The method is deterministic.** Two captures of the same build are identical, pixel by pixel.
- **Zero differing pixels** between the baseline and three builds of the work: the first complete
  version, the one with the contact fix, and the final one (`889d222`).

`phone-before-after.jpg`, next to this file, shows the phone at 390×844 before and after.

## Type, at the width of a phone

| Element                      | Before (390 px) | After at 320 px | After at 360 px | After at 390 px |
| ---------------------------- | --------------- | --------------- | --------------- | --------------- |
| Name (`h1`)                  | 45.25 px        | 41.6 px         | 46.8 px         | 50.7 px         |
| Role line                    | 14 px           | 12 px           | 12 px           | 12 px           |
| Section heading              | 32 px           | 26 px           | 26 px           | 27.3 px         |
| Paragraphs (hero, bio, text) | 18 px           | 17 px           | 17 px           | 17 px           |
| Card text                    | 14 px           | 15 px           | 15 px           | 15 px           |
| Stats                        | 32 px           | 40 px           | 40 px           | 40 px           |
| Email of the contact section | 16 px           | 14.7 px         | 16.6 px         | 17.9 px         |
| Labels, dates, tags          | 12 px           | 12 px           | 12 px           | 12 px           |

- **The name takes two lines at every width**, and its widest line leaves room: 260 of 272 px at 320,
  292 of 312 at 360, 316 of 342 at 390. In the pixel font it is narrower: 199 and 243 px.
- **The role line** takes one line in Portuguese from 360 px and two balanced lines at 320 px and in
  English. Before, it wrapped at 360 px and left "PR" alone.
- **The heading of "Sobre"** takes three lines at 360 and 390 px in Portuguese, where it took four; four
  at 320 px and in English.
- **The email takes one line down to 320 px.** Before, it broke in two there.
- **`text-wrap: pretty` did not remove every short last line.** In Chromium the description of the first
  project still ends with "e-mail" alone on its line.

## Touch targets, at 390 px

| Control                         | Before | After  |
| ------------------------------- | ------ | ------ |
| Menu button                     | 32×26  | 44×44  |
| Theme toggle                    | 32×32  | 44×44  |
| Brand                           | 37×28  | 44×44  |
| Social links of "Sobre"         | 24 px  | 44×44  |
| Email of the contact section    | 315×24 | 317×44 |
| Social links of "Contato"       | 24 px  | 44 px  |
| Language links                  | 32×32  | 44×44  |
| Social icons of the footer      | 18×18  | 44×44  |
| Buttons of the hero             | 48 px  | 320×48 |
| Links of the menu               | 24 px  | 56 px  |
| Carousel buttons (already fine) | 44×44  | 44×44  |

The Easter-egg pixel of the footer stays 24×24, on purpose.

## Layout

- **Panels at 390×844**, hero to contact: 780 / 1096 / 780 / 780 / 780 px before, 780 / 1026 / 872 /
  780 / 780 px after. "Projetos" grew because its controls moved below the card; it scrolls, as "Sobre"
  already did.
- **The portrait** is 184 px below `sm`, 138 px before. The LCP element is still the `h1`.
- **The centred snap is for a phone only.** The first version centred the first item of a carousel below
  `lg`. At 768 px that left the left half of the row empty, 256 px before the first technology card. From
  `sm` up the items start at the left edge again.
- **The contact profiles** wrapped to two rows at 320 px with the centred layout; a narrower gap below
  `sm` keeps the three on one row.

## The menu and Lenis

The menu stops Lenis and sets `overflow: hidden` on the root in an effect. The design expected a link of
the menu to need a second unlock in its click handler. Measured without it, after a click on the link to
`#contact` with the menu open, `scrollY` sampled at 0, 50, 200, 500, 1100 and 2600 ms:

| Engine   | With the unlock in the handler         | Without it                              |
| -------- | -------------------------------------- | --------------------------------------- |
| Chromium | 3413 → 859 → 2440 → 3244 → 3411 → 3413 | 3413 → 1096 → 2440 → 3244 → 3411 → 3413 |
| WebKit   | 301 → 1072 → 2408 → 3206 → 3372 → 3373 | 457 → 1276 → 2493 → 3221 → 3372 → 3373  |

Both animate, so Lenis was running when it read the click, and the second unlock was removed
(`889d222`). The first sample of Chromium is the jump of the browser to the fragment, which Lenis does
not prevent. The facts are in `.specs/memory/lenis-smooth-scroll.md`.

## Tests

- The gate on `889d222`: 413 passed, 237 skipped. Before the work: 379 passed, 186 skipped.
- `e2e/mobile.spec.ts` adds 34 tests, in the two mobile projects.
- **The new checks fail when they should.** With the hero left aligned and the theme toggle back at
  32 px, the suite reported `portrait: -44.0`, the lines of the role, the tagline and the name, and
  `Ativar tema escuro: 32×32`.
- Three pitfalls of the test code are in `.specs/memory/playwright-and-axe.md`: axe during a fade-in,
  the rectangle of screen-reader-only text, and `img.decode()` on a hidden lazy image.

## Loading

`npm run audit`, median of 5, 40 ms of latency, on `889d222`:

| Page  | Preset  | Performance | Accessibility | Best practices | SEO | FCP    | LCP     | TBT  | CLS | Script   |
| ----- | ------- | ----------- | ------------- | -------------- | --- | ------ | ------- | ---- | --- | -------- |
| `/`   | mobile  | 100         | 100           | 100            | 100 | 986 ms | 1586 ms | 3 ms | 0   | 196.9 KB |
| `/`   | desktop | 100         | 100           | 100            | 100 | 325 ms | 445 ms  | 0 ms | 0   | 196.9 KB |
| `/en` | mobile  | 100         | 100           | 100            | 100 | 985 ms | 1585 ms | 3 ms | 0   | 196.9 KB |
| `/en` | desktop | 100         | 100           | 100            | 100 | 325 ms | 445 ms  | 0 ms | 0   | 196.9 KB |

The previous build transferred 196.5 KB of script with the same scores and timings: the menu and the
back-to-top button cost 0.4 KB.
