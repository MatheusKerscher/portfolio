# Spec — Dots for the carousels of a phone, and the technologies as a marquee band

## Problem

The requester reviewed the phone layout of `2026-10-04_mobile-experience` and asked for two changes.

- **A carousel of a phone has buttons it does not need.** Below its items there is a previous and a next
  button around a position bar. On a touch screen the gesture is to drag; a button spends space doing
  what the finger already does. What the visitor needs there is the answer to "how much more is there".
- **The technologies are one more carousel of cards.** "Sobre" ends with nine cards, each an icon, a
  name and a line of description, in the same format as the two carousels that follow it. The
  requester wants the band they built for another site, "Onde já atuei": a labelled strip that moves on
  its own.

The two references are the requester's own code, on the same machine:

- Dots: `nuvemshop-academy/frontend/src/ui/layout/CourseCarousel.tsx` and the `.ne-carousel-dot*` rules
  of its `src/main.css`.
- Band: `my-clients/rafael-goncalves/components/brand/marquee.tsx`, used by
  `components/sections/career.tsx`.

## Expected outcome

Below 768 px the carousels of "Projetos" and "Currículo" show square dots that follow the scroll, with
the logic of the reference, instead of buttons; and at every width the technologies are a band of icons
and names that moves on its own, can be paused, and stands still for a visitor who asked for less
motion.

## Scope

1. **Dots below 768 px**, with the logic of the reference: one dot per item, a position computed from
   the fraction of the scrollable distance, at most five dots on screen in a window that slides, smaller
   dots at the ends of the window when there is more, hidden from assistive technology, not clickable.
   The dots are squares, the pixel accent of the site; their measures, the look of the current dot and
   the transitions are those of the reference (the requester, on 2026-10-04, while the work was in
   progress: "aplique o mesmo estilo e lógica de transição e dot atual usado no da nuvemshop").
2. **The buttons and the position bar stay from 768 px up.**
3. **A marquee band for the technologies**, at every width: a label, a pause control, and a strip of
   icon and name that loops.
4. **The descriptions of the technologies leave the page**, and the dictionaries.

## Out of scope

- **Clickable dots.** The reference has none; the region scrolls by touch, trackpad and keyboard.
- **A marquee for the other carousels.** Their cards hold text that has to be read at rest.
- **New technologies.** The band shows the nine of `site.ts`.
- **Anything else from 768 px up**: the other four panels do not change.

## Acceptance criteria

- [ ] `npm run lint:eslint:check`, `npm run lint:prettier:check`, `npm run build` and `npm run test:e2e`
      exit 0.
- [ ] **Dots:** below 768 px each carousel shows one dot per item and no button; the active dot is the
      item in view, from the first to the last; the dots are hidden from assistive technology.
- [ ] **Window:** with more than five items, five dots are on screen, the window follows the scroll,
      and a dot at an end of the window is smaller when there are items beyond it.
- [ ] **From 768 px up** the buttons and the position bar are shown and the dots are not.
- [ ] **Band:** the nine technologies are announced once to assistive technology; the strip moves on
      its own; the pause control stops and resumes it, with JavaScript off as well; hovering it stops
      it.
- [ ] **Reduced motion:** the strip does not move, the nine technologies are all visible, and the pause
      control is not shown.
- [ ] **Touch target:** the pause control measures at least 44×44 px below 1024 px.
- [ ] **No copy is left behind:** the descriptions of the technologies are in neither dictionary and in
      no page.
- [ ] **The other panels did not move:** screenshots of the hero, "Projetos", "Currículo" and "Contato"
      panels at 1440×900 and 1024×768, `/` and `/en`, both themes and both skins, are identical pixel
      by pixel before and after.
- [ ] **"Sobre" still fits a laptop screen:** the "on a laptop screen" tests pass, and its new height
      is recorded.
- [ ] **Loading:** `npm run audit` scores at least 95 in every category on `/` and on `/en`, and the
      script bytes are recorded next to the 196.9 KB of the previous run.

## Requester decisions

| Decision                           | Choice                                                                                                                                                     | When       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Sprite of the 8-bit skin           | Approved                                                                                                                                                   | 2026-10-04 |
| Copy in both languages             | Correct as it is                                                                                                                                           | 2026-10-04 |
| What an item of the band shows     | Icon and name; the descriptions leave the page                                                                                                             | 2026-10-04 |
| Where the dots replace the buttons | Below 768 px                                                                                                                                               | 2026-10-04 |
| Look of the dots                   | The measures, the transitions and the current dot of the reference, as squares (sent while the work was in progress)                                       | 2026-10-04 |
| Defaults of the plan               | Approved without comments: the band at every width, a pause control that needs no JavaScript, a static wrapped list under reduced motion, 6 px square dots | 2026-10-04 |

## Dependencies and blockers

None outside the repository. The two references are read, not imported.
