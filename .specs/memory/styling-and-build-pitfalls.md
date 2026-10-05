# Styling and build pitfalls

Each one was hit and fixed during the `2026-10-03_layout-redesign` spec, on 2026-10-03, with
Next.js 16.3.8, Tailwind CSS 4, sharp 0.35.5 and Lenis 1.3.26.

## A Tailwind utility beats a rule of the `components` layer

- **Evidence:** the hero section had the `relative` class. Its panel alone did not pin, while the other
  four did: the utility overrode `position: sticky` from `.stack-panel`, which is declared in
  `@layer components`. Removing the class fixed it.
- **Rule:** an element whose position, or any other property, is set by a component class does not carry
  a utility for that property. Rules that must win over utilities, like those of the 8-bit skin, are
  written outside any layer.
- **Hit again on 2026-10-04**, the other way round: the pause control of the band has the `flex` utility,
  and a `display: none` for it in a media query of the `components` layer did nothing. The `marquee`
  suite caught it: the control was still shown under reduced motion. It is hidden with the
  `motion-reduce:hidden` utility.

## A custom property that uses a font variable must be declared where the variable exists

- **Evidence:** the `next/font` variable classes were on `<body>` and `--font-display` was declared on
  `:root` as `var(--font-syne), sans-serif`. It resolved to nothing and every heading fell back to the
  body font. With the classes on `<html>` the headings compute to the display font.

## `cn` in a Client Component ships tailwind-merge to the browser

- **Evidence:** one toggle in the navbar that imported `cn` took the script transferred on the first load
  from 203.1 to 211.3 KB. Joining its classes by hand brought it back.

## Next refuses an ICO that holds an indexed PNG

- **Evidence:** with a palette PNG inside `src/app/favicon.ico`, `next build` failed with
  `Format error decoding Ico: The PNG is not in RGBA format!` The favicon is written as a 32-bit RGBA
  PNG; the other icons stay indexed.

## sharp does not cap a PNG palette at the number given in `colours`

- **Evidence:** on a 150×90 resize of a project screenshot, `colours` 8 and 16 both wrote 16 colours, and
  17, 24, 32, 64 and 128 all wrote 254. `palette: true` changed nothing. The option selects the bit
  depth only.
- **Rule:** an image that must have at most N colours is reduced before it reaches sharp, as
  `scripts/pixel-assets.mjs` does for the sprite.

## A lazy image inside `display: none` is not requested

- **Evidence:** the `skin` suite records every request of a full scroll through the home page in
  Chromium, Firefox and WebKit: in the normal skin there is none for `/avatar/avatar.png` or
  `/thumbnails/8bit/`, whose `<img loading="lazy">` elements are in the markup and hidden. The pixel
  font, referenced only by rules of the hidden skin, stays `unloaded`.

## Lenis applies `scroll-margin-top` to its anchor scroll

- **Evidence:** the slots of the stack have `scroll-margin-top: var(--nav-h)`. In the `stacking` suite a
  click on an in-page link, which Lenis handles (`anchors: true`), ends with the top of the panel within
  1 px of the bottom edge of the navbar in the five Playwright projects.

## Where a Client Component is rendered from can change what framer-motion ships

- **Evidence:** on 2026-10-04, with Next.js 16.3.8 (Turbopack) and framer-motion 14.0.0, the theme toggle
  was moved from an import inside the navbar to an element the root layout, a Server Component, passed
  to the navbar. The chunks named by the prerendered page went from 759,358 to 771,140 bytes, and the
  drag, pan and layout projection features of framer-motion (`DragGesture`, `PanGesture`,
  `HTMLProjectionNode`) appeared in them; no component uses them. Imported by the navbar again, the
  page names 757,145 bytes and those features are gone. `BackToTop`, which also uses `motion` and is
  rendered by the layout, does not cause it.
- **Rule:** the composition of Client Components is not free of cost. After changing which component
  renders another, compare the script bytes `npm run audit` prints with the previous run.

## A stylesheet imported by a lazy Client Component is a chunk of its own

- **Evidence:** on 2026-10-04, with Next.js 16.3.8 (Turbopack), `pixel.css` is imported by
  `pixel-runtime.tsx`, which is loaded with `next/dynamic` and `ssr: false`. The stylesheet the page
  links (`/_next/static/chunks/1ta7km19yz7s0.css`, 50,234 bytes) has no rule of it: `px-scenery` occurs
  0 times. When the skin is entered the browser requests one script and one stylesheet
  (`/_next/static/chunks/242wb5spsah__.css`, 6,265 bytes), in that order, and nothing else of `_next`.
- **Consequence:** rules that only matter after a lazy component has mounted can live with it and cost
  the first load nothing. Rules that shape the first paint cannot: the chunk arrives after hydration.

## A root-relative `url()` in a stylesheet is left as it is

- **Evidence:** `cursor: url("/pixel/cursor.png")` in `pixel.css` builds, and the browser requests
  `/pixel/cursor.png`, the file in `public/`, when the rule first applies. In the normal skin, where no
  rule of that stylesheet is even fetched, the `skin` suite records no request under `/pixel/`.

## A sticky element in a container of its own height has nowhere to stick

- **Evidence:** the 8-bit skin removes the spacer and the negative margin of the stacked slots and
  leaves `position: sticky` on the panels. The `stacking` suite finds every panel ending where the next
  one starts, within 1 px. A build that also reset the position passed the same test: the rule was
  redundant and was removed.
