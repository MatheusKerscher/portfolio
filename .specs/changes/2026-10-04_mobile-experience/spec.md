# Spec — The page on a phone: centred layout, type scale and touch

## Problem

Measured on the production build of `b20063d`, at 320, 360, 390 and 768 px of width, in both languages
(390×844 unless stated):

- **The hero is a desktop column squeezed to the left.** The portrait is 138 px wide and sits at the
  left edge with the right half of the screen empty. The two buttons stack with different widths (156
  and 172 px). 112 px at the bottom are reserved for the "Scroll" cue, which is hidden below 768 px. The
  role line wraps and leaves "PR" alone on its second line at 360 px, and takes two lines in English.
- **A section heading shares its line with the carousel buttons.** "Experiência & Formação." takes three
  lines at 360 px, and "selecionados." touches the previous button.
- **The back-to-top button covers content.** Fixed in the bottom right corner, it sits on the "next"
  button of a carousel and on the text of the cards.
- **Touch targets are small.** Menu button 32×26, theme toggle 32×32, brand 37×28, the social links of
  "Sobre" and "Contato" and the email 24 px tall, language links 32×32, footer icons 18×18.
- **The menu is a strip.** Its links are 24 px tall and left aligned, Escape does not close it, and the
  page scrolls behind it.
- **The type scale is the desktop one.** The name is 45 px, section headings a fixed 32 px, paragraphs
  18 px, card text 14 px.

The requester asked for a better experience on a phone: more things centred, the fonts adjusted.

## Expected outcome

Below 1024 px the page is one centred column with a type scale and touch targets made for a phone, a
full-screen menu and a back-to-top button that stays out of the way; from 1024 px up nothing changes.

## Scope

1. **Centred layout below 1024 px**: the hero, the section labels and headings, the stats, the social
   links, the contact block, the footer, and the content of the cards.
2. **Carousels**: the active card is centred with a part of each neighbour visible, and the buttons and
   the position indicator move below the cards.
3. **Type scale below 1024 px**: sizes are proposed by the implementation, measured, and reviewed by the
   requester on screenshots.
4. **Touch targets of at least 44×44 px** for every control.
5. **A full-screen menu** below 768 px, with the language switch and the social links, which closes with
   Escape and keeps the page from scrolling behind it.
6. **The back-to-top button**, below 1024 px, is shown only while the visitor scrolls up.

## Out of scope

- **Anything from 1024 px up.** The desktop layout was tuned to fit below the navbar on a laptop screen
  and is not touched; a pixel comparison proves it.
- **The copy.** No dictionary changes.
- **The Inspector panel** of the 8-bit skin. It is an Easter egg inside an Easter egg; its layout on a
  phone is a separate piece of work.
- **Replacing a carousel by a grid.** The three carousels stay carousels.
- **The Easter-egg pixel of the footer.** It is 24×24 px on purpose and stays an exception to the
  44 px rule.

## Acceptance criteria

At 320, 360 and 390 px of width, in both languages, unless stated.

- [ ] `npm run lint:eslint:check`, `npm run lint:prettier:check`, `npm run build` and `npm run test:e2e`
      exit 0.
- [ ] **Centred:** the portrait, the name, the buttons of the hero, every section label and heading, the
      stats, the email of the contact section, the rows of the footer and the first card of each
      carousel have their centre within 1 px of the centre of the viewport.
- [ ] **Touch targets:** every visible link and button measures at least 44×44 px, in both skins, except
      the Easter-egg pixel of the footer.
- [ ] **Hero type:** the name takes exactly two lines and the role line at most two, in both skins.
- [ ] **Minimum sizes:** paragraphs are at least 16 px, card text at least 15 px, and no text is smaller
      than 12 px.
- [ ] **Menu:** it covers the viewport from the bottom edge of the navbar to the bottom; the page does
      not scroll while it is open; Escape closes it and returns the focus to its button; a link closes
      it and lands on its section; axe reports no violation with it open.
- [ ] **Back to top:** below 1024 px it is hidden while scrolling down, shown after scrolling up, and
      returns to the top.
- [ ] **No sideways scroll** at 320 px in both skins (the existing tests).
- [ ] **Every heading, link and button of a panel can be reached un-obscured** at 390×667 (the existing
      test).
- [ ] **Desktop untouched:** screenshots of `/` and `/en` at 1440×900 and 1024×768, in both themes and
      both skins, are identical pixel by pixel before and after.
- [ ] **Loading:** `npm run audit` scores at least 95 in every category on `/` and on `/en`, and the
      script bytes it prints are recorded next to the 196.5 KB of the previous run.

## Requester decisions

| Decision             | Choice                                                                                                                                 | When       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| How far to centre    | Everything, the text inside the cards included                                                                                         | 2026-10-04 |
| Fonts                | The implementation proposes the scale; the requester reviews screenshots                                                               | 2026-10-04 |
| Back to top          | On a small screen, shown only while scrolling up                                                                                       | 2026-10-04 |
| Menu                 | Full screen, large centred links, language and social links at the bottom                                                              | 2026-10-04 |
| Defaults of the plan | Approved without comments: "phone" means below 1024 px, the same branch, 44 px targets, icon-only social links in "Sobre" below 640 px | 2026-10-04 |

## Dependencies and blockers

None outside the repository. The requester reviews the final screenshots, the type scale and the centred
text of the cards in particular.
