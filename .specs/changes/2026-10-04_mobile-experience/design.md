# Design — The page on a phone: centred layout, type scale and touch

## Approach

One breakpoint separates the two layouts: **`lg`, 1024 px**. It is where the hero already becomes two
columns and where `--squeeze` starts to act, so "below `lg`" is exactly the layout that was never tuned.
Every change is written mobile first and undone at `lg` (`text-center lg:text-left`), or lives in a
`@media (max-width: 1023.98px)` block of `globals.css` for the component classes. Nothing above `lg`
changes, and that is checked by comparing screenshots pixel by pixel, not by reading the diff.

The menu keeps its own breakpoint, `md`: it only exists below 768 px today and stays that way.

## Files affected

| File                                                                                                                           | Role                                                              |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `src/app/globals.css`                                                                                                          | Type tokens, centred labels and headings, the carousel below `lg` |
| `src/app/components/navbar.tsx`                                                                                                | 44 px targets, the full-screen menu                               |
| `theme-toggle.tsx`, `skin-toggle.tsx`, `inspector/inspector-toggle.tsx`, `language-switch.tsx`                                 | 44 px targets below `lg`                                          |
| `src/app/[lang]/layout.tsx`, `profile-links.tsx` (new)                                                                         | The icon links to the profiles, shared by the menu and the footer |
| `hero-section.tsx`, `portrait.tsx`                                                                                             | Centred hero, larger portrait                                     |
| `carousel.tsx`, `carousel-controls.tsx`                                                                                        | Controls below the track, centred snap                            |
| `about-section.tsx`, `projects-section.tsx`, `project-card.tsx`, `curriculum-section.tsx`, `contact-section.tsx`, `footer.tsx` | Centred content                                                   |
| `back-to-top.tsx`                                                                                                              | Shown while scrolling up, below `lg`                              |
| `e2e/mobile.spec.ts` (new), `e2e/home.spec.ts`                                                                                 | The criteria of the spec                                          |

Reuse: `useLenis()` of `lenis-context.ts` to stop the smooth scroll; `LanguageSwitch` as it is;
`SocialIcon` and `socials` of `site.ts`; the helpers of `e2e/helpers.ts` (`LOCALES`, `homeOf`, `copyOf`,
`storeSkin`, `waitForStack`).

## Technical decisions

### One breakpoint, and a pixel comparison for what is above it

**Choice:** everything changes below 1024 px and nothing from there up; screenshots of the build before
the work are compared with the build after it.
**Why:** the desktop layout fits a laptop screen by a few pixels (see the `--panel-*` tokens). A
regression there is invisible in a diff of class names.
**Rejected alternative:** improving the touch targets at every width. It moves the navbar by a few
pixels on desktop and makes the comparison useless.

### The carousel controls are one element, moved by `order`

**Choice:** the header, the controls and the scrollable region stay in that order in the HTML. Below
`lg` the row that holds the header and the controls becomes `display: contents`, the carousel a flex
column, and the controls are ordered last.
**Why:** rendering the controls twice doubles a Client Component and its listeners, and changing the
order in the HTML changes the tab order of the desktop. `contents` leaves the desktop structure as it
was, which a grid for every width would not.
**Rejected alternative:** hiding the buttons on a phone. A swipe is the main gesture, but the buttons are
the visible sign that there is more, and the way in for assistive technology.

### The width of a carousel item is a custom property, and the centred snap is for a phone

**Choice:** `Carousel` takes the width of its items and sets `--item-w`. Below `sm` an item snaps to the
centre and the track pads its first and last item to the centre, in container units (`cqi`). From `sm`
up the items start at the left edge, as before.
**Why:** a centred snap needs the first item to be able to reach the centre, which needs half of the
free space as padding. Container units do not include a scrollbar, viewport units do. On a tablet
several items fit, and a centred first one leaves half of the row empty: seen on the 768 px screenshot
of the first version, which centred below `lg`.

### The menu locks the page with Lenis stopped, in an effect

**Choice:** an effect that runs while the menu is open calls `lenis.stop()`, sets `overflow: hidden` on
the root and `inert` on `main` and the footer; its cleanup undoes the three. A link of the menu only
closes the menu.
**Why:** one place owns the lock, and the cleanup also covers Escape, a viewport that grows past `md`
and an unmount. The first version unlocked a second time in the click handler of the link, on the
assumption that Lenis, which ignores `scrollTo` while stopped, would read the click before the cleanup
ran. It does not: see `findings.md`.
**Rejected alternative:** a `role="dialog"`. The bar with the close button stays operable above the
panel, so it is a disclosure whose content happens to fill the screen; `inert` on the rest of the page
gives the same containment.

### The back-to-top button reads the direction of the scroll

**Choice:** below `lg` it is shown past 300 px and only after the page has moved up by a few pixels; it
hides again when the page moves down.
**Why:** it is a fixed element over a column of content; shown all the time it covers the controls of
the carousels and the text of the cards.

## Known risks

| Risk                                         | How it shows up                                               | Mitigation                                                        |
| -------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| The desktop moves                            | A panel no longer fits a laptop screen                        | Pixel comparison; the "on a laptop screen" tests                  |
| A menu link does not scroll                  | The menu closes and the page stays                            | Measured (`findings.md`); the menu tests of `home` and `stacking` |
| The name overflows at 320 px                 | Sideways scroll, in the pixel font above all                  | The 320 px tests, in both skins                                   |
| The larger portrait slows the LCP of a phone | Lighthouse performance below 95                               | `npm run audit`, mobile                                           |
| The back-to-top button covers a control      | A target of a panel is obscured                               | The "reached un-obscured" test of `stacking`                      |
| Focus order of a carousel                    | The buttons are focused before the cards they follow visually | Accepted: keyboard in a narrow window only                        |
| Long centred text in a card                  | Harder to read; a matter of taste                             | Reviewed by the requester on screenshots                          |

## Failing safely

No destructive operation. The menu removes its lock in the cleanup of its effect, so a crash or an
unmount cannot leave the page unable to scroll; it also closes when the viewport reaches `md`.
