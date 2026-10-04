# Design — Dots for the carousels of a phone, and the technologies as a marquee band

## Approach

**Dots.** `CarouselControls` is already the one Client Component of a carousel: it reads the scrollable
region by its id and renders the buttons and the position bar. It gains the dots, rendered at every
width; the stylesheet shows the dots below `md` and the buttons from `md` up, so the breakpoint lives in
one place. The arithmetic of the reference goes into `src/lib/carousel-dots.ts` as pure functions, used
by the component and tested directly.

**Band.** A new Server Component, `Marquee`, renders a label, a pause control and a region that holds
two copies of the list side by side; a CSS animation moves the pair by half of its width, which is one
copy, and loops. It ships no JavaScript: the pause control is a checkbox that the stylesheet reads with
`:has()`. `AboutSection` uses it instead of the carousel of cards.

## Files affected

| File                                                                                         | Role                                                            |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `src/lib/carousel-dots.ts` (new)                                                             | The window of the dots: pure functions and their constants      |
| `src/app/components/carousel-controls.tsx`                                                   | Renders the dots; counts the items; measures the progress       |
| `src/app/components/marquee.tsx` (new)                                                       | The band: label, pause control, looping strip                   |
| `src/app/components/about-section.tsx`                                                       | Uses the band for the technologies                              |
| `src/app/globals.css`                                                                        | The dots, the animation of the band and its reduced-motion form |
| `src/app/data/dictionaries/pt.ts`, `en.ts`                                                   | The label of the pause control in; the descriptions out         |
| `e2e/carousel.spec.ts`, `e2e/marquee.spec.ts` (new), `e2e/mobile.spec.ts`, `e2e/ssr.spec.ts` | The criteria of the spec                                        |

Reuse: the measuring effect of `CarouselControls` (scroll listener, `ResizeObserver`, one
`requestAnimationFrame` per frame); the `.pixel-dots` rhythm of 6 px squares and 4 px gaps; the bordered
icon square of the technology cards; `lucide-react` for the pause and play icons; the `[data-js-only]`
rule of the root layout.

## Technical decisions

### The logic of the dots is the reference's, kept as it is

**Choice:** one dot per item; `progress = scrollLeft / maxScroll × (items − 1)`; the active dot is the
rounded progress; above five items a fixed-width viewport clips a track that renders every dot and is
moved by `translateX(−windowStart(progress) × step)`; the dot at an end of the window is scaled down
when there are items beyond it.
**Why:** the requester asked for the same logic, and the reference records why each part is the way it
is: counting screens instead of items gave a wrong number of dots; dividing by the viewport width left
the last dot unreachable; slicing the list remounted the dots and made the strip flicker; a transition
on the track lagged behind the scroll.
**Rejected alternative:** an `IntersectionObserver` per item. It answers "which item is in view", which
the fraction already answers without an observer per item, and it cannot move the window continuously.

### The count of items is read from the region

**Choice:** `CarouselControls` counts the `.carousel-item` elements of the region and observes the track
with a `ResizeObserver`.
**Why:** the items are the children of a Server Component; the controls only know the id of the region.
The reference had the same need for a different reason, items that arrive after the first render.

### A checkbox pauses the band

**Choice:** the pause control is a visually hidden checkbox inside a label drawn as a square button;
`.marquee:has(input:checked)` pauses the animation.
**Why:** it works before hydration and with JavaScript off, and it adds nothing to the script of the
page. Moving content that starts on its own needs a way to stop it (WCAG 2.2.2); a control that depends
on a script is not there for everyone.
**Rejected alternative:** the button with React state of the reference. It is a Client Component on
every page for one boolean.

### Under reduced motion the band is a wrapped list

**Choice:** with `prefers-reduced-motion: reduce` the animation is off, the second copy and the pause
control are not displayed, the edge fade is removed, and the list wraps on centred rows.
**Why:** a strip that does not move and does not scroll would cut off whatever is beyond the edge. The
reference accepted that for a decorative list of countries; here the list is content.

### The second copy is in the HTML

**Choice:** both copies are rendered by the server; the second has `aria-hidden` and its images have an
empty `alt`.
**Why:** the loop is CSS only. The cost is nine names repeated in the HTML.

## Known risks

| Risk                                       | How it shows up                                    | Mitigation                                                        |
| ------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------------------- |
| The active dot is off by one in the middle | A dot lights for the neighbour of the item in view | A test scrolls to every item and reads the active dot             |
| A continuous animation costs performance   | Lighthouse performance below 95                    | `npm run audit`; the animation is a transform                     |
| `:has()` is not supported                  | The checkbox does not pause                        | Hover, focus and touch still pause; reduced motion still stops it |
| "Sobre" changes height                     | A panel no longer fits, or pins differently        | The "on a laptop screen" tests; the new heights in `findings.md`  |
| The other panels move                      | A regression on the desktop                        | Pixel comparison per panel                                        |

## Failing safely

Nothing destructive. Without JavaScript the dots and buttons are not displayed and the carousels scroll
natively; the band keeps moving and can still be paused.
