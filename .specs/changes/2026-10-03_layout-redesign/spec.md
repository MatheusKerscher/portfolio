# Spec — Layout redesign: stacked sections, carousels, pixel art, 8-bit and Inspector modes

## Problem

Observed on 2026-10-03, on `main` at `89f4fcc`, in the repository and on the live site
(`https://www.kerscher.dev.br/`).

- **The hero is invisible until the client bundle hydrates.** The served HTML renders the `h1` words with
  `transform:translateY(110%)` (23 occurrences on the page) and carries 29 inline `opacity:0`
  (`animated-text.tsx`, `motion-section.tsx`, `hero-section.tsx`). The Largest Contentful Paint element
  waits for hydration, a delay and an animation. The same defect was measured in the requester's
  `rafael-goncalves` project: the `h1` painted about 820 ms after first contentful paint, and making the
  hero static took PageSpeed desktop from below 90 to 100.
- **Crawlers and visitors without JavaScript read wrong numbers.** The served HTML says `0+` years of
  experience and `0+` clients, because `AnimatedStat` renders its initial state on the server.
- **The palette fails WCAG 2.2 AA.** The computed ratios are in the table below.
- **Motion preferences are ignored.** No framer-motion animation honours `prefers-reduced-motion`: 11
  files import the library and there is no `MotionConfig`. Lenis 1.3.26 honours it by default.
- **The canonical URL redirects.** `https://kerscher.dev.br/` answers 308 to `https://www.kerscher.dev.br/`,
  while the canonical link, `og:url`, the sitemap, `robots.txt` and JSON-LD all name the apex.
- **`/email-signature` looks like the home page to a search engine.** It is served with the home page's
  title and with `<link rel="canonical" href="https://kerscher.dev.br">`. The page is a Client Component,
  so it cannot export metadata, and it inherits the canonical of the root layout.
- **Two contact emails are published.** The page shows `matheuskerscher@outlook.com`; JSON-LD and
  `public/llms.txt` publish `matheus@programasalao.com.br`. `llms.txt` is a hand-maintained copy of the
  site content, so it drifts.
- **Metadata routes are incomplete.** `/manifest.webmanifest` returns 404. The sitemap lists only `/`, with
  `lastmod` set to the build time.
- **Content is laid out as vertical lists.** Projects, experience, education and social links are stacked
  rows. The description of each technology exists only in a hover tooltip that is hidden below the `md`
  breakpoint, so it cannot be reached on a phone.
- **There is no portrait.** `public/profile-photo.jpg` is referenced only by JSON-LD. A new portrait sits
  untracked in `public/images/`.
- **Nothing is tested.** The gate is lint plus build. Behaviour, accessibility and metadata have no
  automated check.
- **Colours are hard-coded.** `globals.css` declares `--color-accent: #16a34a` and then overrides it with
  the shadcn mapping, so `bg-accent` is not the brand green. Components work around it with 32 literal
  `#16a34a` in 13 files and 59 `dark:` colour utilities. The navbar border is a literal `#e5e5e5` in both
  themes.
- **Dead weight.** `tw-animate-css` is imported and none of its utilities is used.
  `public/thumbnails/about-me-cartoon.png` (2 MB) is not referenced. `src/components/ui/tabs.tsx` and
  `@radix-ui/react-tabs` are never imported. The `chart-*` and `sidebar-*` variables are unused.
- **The PageSpeed baseline is unknown.** The public PageSpeed Insights API answered 429 (daily quota) on
  2026-10-03. Measuring the baseline is the first task.

Contrast of the current palette (WCAG relative luminance):

| Pair                                                           | Ratio  | Required |
| -------------------------------------------------------------- | ------ | -------- |
| Brand green `#16a34a` as text on the page background `#f8f7f3` | 3.07:1 | 4.5:1    |
| White text on `#16a34a` (buttons, skip link)                   | 3.30:1 | 4.5:1    |
| Muted text `#737373` on `#f8f7f3`                              | 4.42:1 | 4.5:1    |
| Muted text `#737373` on the dark background (project count)    | 3.98:1 | 4.5:1    |
| Focus ring `rgba(22, 163, 74, 0.25)` on `#f8f7f3`              | 1.31:1 | 3:1      |
| Input border `#e5e5e5` on `#f8f7f3`                            | 1.18:1 | 3:1      |

## Expected outcome

A visitor scrolls through sections that slide over one another, browses the content in carousels, can
switch the site into an 8-bit skin and inspect its live performance, accessibility and structured data —
on a site that scores at least 95 on PageSpeed and has no WCAG 2.2 AA failure, with a Playwright suite
proving both.

## Scope

1. **Stacked sections.** The five home sections (`hero`, `sobre`, `projetos`, `curriculo`, `contato`)
   become panels. A panel pins when its end reaches the bottom of the viewport, and the next panel slides
   over it. A panel taller than the viewport scrolls in full before it pins. There is no pinning under
   `prefers-reduced-motion: reduce` or without JavaScript. Keyboard focus never rests on a covered
   element, and in-page links land on the right panel in both directions.
2. **Carousels instead of vertical lists.** Technologies (9), projects (5) and the timeline (experience
   and education, 4) become horizontal carousels with previous and next controls and a position
   indicator. Technology cards always show the name and the description. Project cards gain a thumbnail.
   Social links become one row. "Avoid lists" is read as a layout rule: the markup keeps list semantics
   for assistive technology.
3. **Portrait.** The new photo is shown in the hero. A 92×92 pixel-art version, made by a script from
   the pixel art the requester supplied, is used in 8-bit mode, the favicon, the app icons, the manifest
   and the Open Graph image.
4. **A little pixel art in the normal skin.** A mini sprite on the 8-bit toggle, square-dot dividers in
   place of the green accent bars, a stepped scroll cue, a hard-edged offset shadow on hover and focus,
   and the frame of the Inspector.
5. **8-bit mode.** A toggle in the navbar and a chip on the portrait switch the whole site, including
   `/email-signature`, to a retro skin: pixel font for headings, labels and buttons (body text keeps
   Catamaran), square corners, hard shadows, a stepped edge on the panels, the sprite as portrait and
   pixelated project thumbnails. The choice persists across visits and is applied before the first paint.
   The skin uses the same colour tokens as the normal skin.
6. **Inspector mode.** A toggle in the navbar opens a non-modal panel with four tabs. _Performance_: the
   Core Web Vitals of the current visit, the page weight and request count, and the last lab scores.
   _Acessibilidade_: overlays for landmarks, headings and focus order, and the contrast of every palette
   pair read from the live CSS variables. _SEO & GEO_: title, description, canonical, the JSON-LD graph
   and links to `llms.txt`, the sitemap and `robots.txt`. _Código_: the stack, the repository and this
   spec. Its code is fetched only when it is first opened.
7. **Palette.** Semantic tokens replace the literals. Every text pair reaches 4.5:1 and every control
   boundary 3:1, in both themes:

   | Token                         | Light                  | Ratio on `paper` / `surface` | Dark                   | Ratio on `paper` / `surface` | Minimum |
   | ----------------------------- | ---------------------- | ---------------------------- | ---------------------- | ---------------------------- | ------- |
   | `paper` / `surface`           | `#f8f7f3` / `#ffffff`  | —                            | `#111111` / `#1a1a1a`  | —                            | —       |
   | `ink`                         | `#111111`              | 17.62 / 18.88                | `#fafafa`              | 18.09 / 16.67                | 4.5     |
   | `ink-muted`                   | `#5f5f5f`              | 5.96 / 6.39                  | `#a3a3a3`              | 7.49 / 6.90                  | 4.5     |
   | `brand`                       | `#137a3a`              | 5.06 / 5.42                  | `#4ade80`              | 10.84 / 9.99                 | 4.5     |
   | `on-brand` on `brand`         | `#ffffff`              | 5.42                         | `#111111`              | 10.84                        | 4.5     |
   | `on-brand` on `brand-hover`   | `#ffffff` on `#116d36` | 6.43                         | `#111111` on `#86efac` | 13.45                        | 4.5     |
   | `line-strong`                 | `#8a8a8a`              | 3.22 / 3.45                  | `#737373`              | 3.98 / 3.67                  | 3.0     |
   | `on-yellow` on `pixel-yellow` | `#111111` on `#f0da50` | 13.35                        | `#111111` on `#f0da50` | 13.35                        | 4.5     |
   | `danger`                      | `#c10007`              | 5.99 / 6.42                  | `#ff6467`              | 6.54 / 6.03                  | 4.5     |

   `line` (`#e5e5e5` light, `#2e2e2e` dark) is decorative only. `pixel-yellow` is a fill, never a text
   colour. The focus indicator is a 2 px `brand` outline with an offset. The link colour in the generated
   email signature changes to `#137a3a`.

8. **Performance.** The hero becomes a static Server Component. The portrait is fetched with high
   priority in a modern format. `npm run audit` measures both Lighthouse presets and fails below the
   threshold.
9. **SEO and GEO.** One content source feeds the sections, the metadata, a single typed JSON-LD graph,
   `/llms.txt` (generated), the sitemap (both routes), the manifest and the Open Graph image.
   `robots.txt` names the AI crawlers. Each route has its own canonical on the apex, and
   `/email-signature` has its own title and description. The stats are correct in the server HTML. One
   contact email everywhere.
10. **Accessibility.** Reduced motion is honoured by the animations and by the stacking. Content is
    visible without JavaScript. Interactive targets are at least 24×24 CSS px. axe runs in every theme and
    skin combination.
11. **Playwright.** `@playwright/test` and `@axe-core/playwright`, run against the production build in
    five browser projects, with a workflow on pull requests.
12. **Developer experience.** Scripts `test:e2e`, `test:e2e:ui`, `test:e2e:install`, `typecheck`, `audit`
    and `assets:pixel`. Tailwind class sorting through Prettier. Dead code and assets removed. `README.md`
    and `CLAUDE.md` describe the new stack, scripts and gate.
13. **Dependencies.** Added, as exact pins: `@playwright/test` 1.63.0, `@axe-core/playwright` 4.13.0,
    `schema-dts` 2.1.0, `prettier-plugin-tailwindcss` 0.8.1, `lighthouse` 13.5.0, `sharp` 0.35.5 (all
    dev) and `web-vitals` 6.2.2. Removed: `tw-animate-css`. The analysis of the `rafael-goncalves`
    dependencies, including the ones not adopted, is in `design.md`.

## Out of scope

- An English version of the site — a separate piece of work.
- A contact form, analytics or any third-party script — contact stays a `mailto:` link.
- Dragging the carousels with the mouse, and autoplay — buttons, touch, trackpad and keyboard cover the
  use; both can be added later without changing the markup.
- Screenshot baselines (visual regression) — they differ between the local and the CI font rendering.
- Replacing `framer-motion` with the `motion` package — the same code under a new name; no measurable
  gain.
- Backlog items B-001, B-002 and B-003 — unrelated to this work.
- Sound.
- The instruction list on `/email-signature` — it stays a list; steps that must be read together are
  worse as a carousel.
- `public/thumbnails/thumbnail-pet-na-porta.png` — not referenced by any project, but it is not deleted
  without the requester saying so.
- Making find-in-page reveal text inside a panel that is already covered — recorded as a known
  limitation in `design.md`.

## Acceptance criteria

All commands are run from the repository root. The Playwright projects are `chromium`, `firefox`,
`webkit`, `mobile-chrome` and `mobile-safari`.

- [ ] `npm ci` succeeds without `--force` or `--legacy-peer-deps`, and `npm ls` reports no `invalid`.
- [ ] `npm run lint:eslint:check`, `npm run lint:prettier:check`, `npm run build` and `npm run test:e2e`
      exit 0.
- [ ] **Stacking**, in the five projects: for each of the first four panels, once the page is scrolled
      past the end of the panel, its bottom edge stays within 1 px of the bottom of the viewport while the
      top edge of the next panel moves up, and a hit-test inside the overlap returns an element of the
      next panel.
- [ ] **No pinning when it is not wanted:** with `prefers-reduced-motion: reduce`, and separately with
      JavaScript disabled, the top edge of every panel moves by the scrolled distance.
- [ ] **Nothing is cut:** at a 390×667 viewport, every heading, link and button of every panel can be
      scrolled to a position where a hit-test at its centre returns the element or one of its
      descendants.
- [ ] **Focus is never obscured:** tabbing forward through the whole page and then backward, the focused
      element always passes the same hit-test.
- [ ] **In-page links:** from the last panel, the navbar link to `#projetos` ends with the "Projetos"
      heading inside the viewport and passing the hit-test. The same holds for a direct load of
      `/#curriculo`.
- [ ] **Carousels:** the three carousels hold 9, 5 and 4 items, all present in the raw server HTML. The
      items of each carousel share the same `top` coordinate. "Next" moves the track and enables
      "previous"; "previous" is disabled at the start and "next" at the end. A horizontal wheel gesture
      over a track scrolls the track, and a vertical one scrolls the page.
- [ ] **Hero:** the raw server HTML of `#hero` contains neither `opacity:0` nor `translateY(`. The `h1`
      has computed opacity 1 at load. Lighthouse reports the `h1` or the portrait as the LCP element.
- [ ] **8-bit mode:** each toggle sets `data-skin="8bit"` on `<html>` and `aria-pressed="true"` on both
      toggles. After a reload the attribute is already set when `DOMContentLoaded` fires. The portrait is
      the sprite, with computed `image-rendering: pixelated`, and headings compute to the pixel font. In
      the normal skin there is no request for the pixel font file, `/avatar/avatar.png` or
      `/thumbnails/8bit/`.
- [ ] **Inspector:** before it is opened its panel is not in the DOM, and opening it is what triggers
      the first request for its script. It shows a dialog with four tabs. In Chromium the Performance tab
      shows a numeric LCP. A metric the browser does not support is labelled as unsupported. The contrast
      table lists every pair of the palette contract. `Escape` closes it and returns focus to the toggle.
- [ ] **Palette:** in light and in dark, every pair in `src/lib/palette-contract.ts`, computed from the
      live CSS variables, meets its minimum, with the values of the table in Scope.
      `grep -rn "#16a34a" src` returns nothing.
- [ ] **axe:** zero violations for the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa` on
      `/` and `/email-signature`, in light and dark, normal and 8-bit, and on `/` with the Inspector
      open.
- [ ] **Reflow:** at a 320 px wide viewport, `document.documentElement.scrollWidth` does not exceed the
      viewport width on both routes.
- [ ] **Server HTML:** the raw HTML of `/` contains the `h1` text, every project title, every timeline
      title and the stats `3+` and `8+`. With JavaScript disabled all of them are visible. The text
      content of every heading keeps the spaces between its words (`MATHEUS KERSCHER`, not
      `MATHEUSKERSCHER` — see `findings.md`).
- [ ] **SEO and GEO:** `/` has exactly one `h1`. The canonical of `/` is `https://kerscher.dev.br` and
      the canonical of `/email-signature` is `https://kerscher.dev.br/email-signature`, which also has
      its own title and description. One JSON-LD script holds a `@graph` with `WebSite`, `ProfilePage`,
      `Person` and `ItemList`. `matheuskerscher@outlook.com` is the only email address in the HTML, the
      JSON-LD and `/llms.txt`. `/llms.txt` contains every project title and URL. `robots.txt` names
      `GPTBot`, `ClaudeBot` and the sitemap. The sitemap lists both routes. `/manifest.webmanifest`,
      `/icon.png`, `/apple-icon.png`, `/favicon.ico` and `/opengraph-image` return 200.
- [ ] **Sprite:** `public/avatar/avatar.png` is 92×92, has at most 32 colours and weighs at most 4 KB.
      Running `npm run assets:pixel` again leaves `git status` clean. The requester's approval of the
      render is recorded in `tasks.md`.
- [ ] **Performance, local:** `npm run audit` — Lighthouse 13.5.0 against the production build served
      with 40 ms of latency per response, mobile and desktop presets, median of 5 runs — reports
      Performance ≥ 95, and Accessibility, Best Practices and SEO ≥ 95. The latency was added during the
      work: without it the mobile result flips between two values (`findings.md`).
- [ ] **Performance, deployed:** PageSpeed Insights on `https://kerscher.dev.br/` reports Performance
      ≥ 95 on mobile and on desktop, median of 3 runs each.
- [ ] **Initial JavaScript:** the script bytes transferred on the first load of `/` are recorded in
      `findings.md` for the baseline and for the final build, and the final value is at most the baseline
      plus 15 KB.
- [ ] **Documentation:** every command named in `README.md` and `CLAUDE.md` exists in `package.json`
      `scripts`, every path they name exists, and the README thumbnail shows the new home page.
- [ ] Manual check on `npm run dev`: `/` and `/email-signature` in light and dark, normal and 8-bit. The
      theme toggle, smooth scroll, carousels, both mode toggles and the signature copy button work, and
      the browser console shows no errors.

## Requester decisions

| Decision                       | Choice                                                                                                                                             | When       |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Structure of the work          | One spec for the whole redesign, executed in phases                                                                                                | 2026-10-03 |
| PageSpeed target               | Performance ≥ 95                                                                                                                                   | 2026-10-03 |
| Interactive feature            | Inspector mode and 8-bit mode. "Entrevista 8-bit" and "Quest log" were proposed and not chosen                                                     | 2026-10-03 |
| Pixel-art portrait             | Drawn by script; the requester approves the render before it is used; fallback is art he supplies                                                  | 2026-10-03 |
| Pixel-art portrait, revised    | After seeing the drawn draft the requester added a generated pixel-art portrait to the branch. It replaces the drawn sprite, as the fallback above | 2026-10-03 |
| Animation and scroll libraries | Keep `framer-motion` and Lenis; only the hero becomes static. A CSS-only replacement was declined                                                  | 2026-10-03 |
| Portrait photo                 | The new photo in `public/images/`; `profile-photo.jpg` is removed                                                                                  | 2026-10-03 |
| Canonical host                 | The apex, `https://kerscher.dev.br`; the requester switches the primary domain on Vercel                                                           | 2026-10-03 |
| Contact email                  | `matheuskerscher@outlook.com` everywhere                                                                                                           | 2026-10-03 |

Decided by Matheus Kerscher.

## Dependencies and blockers

- **Vercel primary domain** (requester, outside this repository): the apex must be primary and `www` must
  redirect to it. Until then PageSpeed Insights on the apex measures a redirect. This blocks only the
  deployed performance criterion.
- **PageSpeed Insights:** the public API was out of quota on 2026-10-03. If it stays so, the requester
  runs pagespeed.web.dev or supplies an API key.
- **Approval of the sprite** by the requester, before it is wired into the site.
- **Vercel preview** of the branch, for PageSpeed Insights and for the check on real devices. Pull
  requests already get one (observed on pull request #43).
- **Real devices:** the stacking is checked on iOS Safari and Android Chrome by the requester.
- **Thumbnail of the To-do List project:** captured from `https://coopers-front.kerscher.dev.br/`. If the
  site is unreachable, the requester supplies the image.
- **Playwright browsers:** `npx playwright install` downloads Chromium, Firefox and WebKit.
- **Node:** `lighthouse` 13.5.0 requires Node ≥ 22.19. `.nvmrc` (`lts/jod`) resolves to 22.21.0 locally.

Open — to be closed by measurement, not by assumption:

- The PageSpeed Insights baseline of the current site. The Lighthouse baseline is in `findings.md`.
- Whether PageSpeed Insights agrees with the local measurement, which is 100 on mobile and on desktop
  with `framer-motion` and Lenis in place and no contingency step.
