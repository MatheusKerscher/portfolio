# Tasks — Layout redesign: stacked sections, carousels, pixel art, 8-bit and Inspector modes

States: `[ ]` open · `[~]` in progress · `[x]` done and verified · `[!]` blocked · `[-]` dropped

"The gate" below means:
`npm run lint:eslint:check && npm run lint:prettier:check && npm run build && npm run test:e2e`, all
exiting 0. Until phase 0 adds `test:e2e`, it is the first three commands. Every phase ends with the gate
and with a site that can be published.

## Prerequisites

- [x] Spec approved by the requester — _verified by:_ explicit approval in the conversation
      ("spec aprovado", 2026-10-03).
- [x] Feature branch `feat/layout-redesign` created off `main` — _verified by:_
      `git branch --show-current`.
- [x] The gate is green on the untouched branch — _verified by:_ the three current commands exit 0.

## Implementation

### Phase 0 — tooling and baseline

- [x] `prettier-plugin-tailwindcss@0.8.1` and `.prettierrc` — _verified by:_ one commit that only
      reorders classes (`96880d8`); `npm run lint:prettier:check` passes.
- [x] `@playwright/test@1.63.0`, `@axe-core/playwright@4.13.0` and `lighthouse@13.5.0` installed as
      exact dev dependencies — _verified by:_ `npm ls` reports no `invalid`.
- [x] `playwright.config.ts`, `e2e/helpers.ts`, the scripts `test:e2e`, `test:e2e:ui`,
      `test:e2e:install` and `typecheck`, and the report folders in `.gitignore` and the ESLint ignores —
      _verified by:_ a smoke test passes in the five projects (10 passed).
- [x] `scripts/lighthouse.mjs` and the `audit` script — _verified by:_ it prints every run and the
      median for both presets.
- [x] Baseline of the current site in `findings.md`: Lighthouse mobile and desktop (median of 5), the
      LCP element, LCP, TBT, CLS and the script bytes transferred — _verified by:_ the numbers are in
      `findings.md`.
- [x] PageSpeed Insights baseline of production — _verified by:_ `findings.md` states why it could not
      be measured (API quota, 429).
- [~] `.github/workflows/e2e.yaml` — _verified by:_ the workflow is green on the pull request. The file
  exists; it runs for the first time when the pull request is opened.

### Phase 1 — foundations, with no change to the layout

- [x] `src/app/data/site.ts` holds the facts, socials, technologies, stats and interface copy, and the
      components read from it — _verified by:_ the `ssr` suite finds those strings in the raw HTML.
- [x] Colour tokens and shadcn mapping; literals, `dark:` colour pairs, `tw-animate-css` and unused
      variables removed — _verified by:_ `grep -rn "#16a34a" src` is empty; the `palette` suite passes in
      light and dark. The `dark:` variants inside `src/components/ui/tabs.tsx` stay until phase 6, where
      the component is first used and restyled.
- [x] Hero as a static Server Component — _verified by:_ the `ssr` suite: no `opacity:0` and no
      `translateY(` inside `#hero`; `h1` at opacity 1 at load.
- [x] `MotionProvider`, `data-reveal` with the `<noscript>` rule, and `MotionSection` and `AnimatedText`
      as the only reveal primitives — _verified by:_ the reduced-motion test of the `a11y` suite and the
      no-JavaScript test of the `ssr` suite.
- [x] `CountUp` renders the final values on the server — _verified by:_ the `ssr` suite finds `3+` and
      `8+` in the raw HTML.
- [x] Lenis with `autoRaf`, `anchors` and `allowNestedScroll`; CSS smooth scrolling removed; `BackToTop`
      through Lenis — _verified by:_ the navigation tests of the `home` suite.
- [x] Measurement after the phase — _verified by:_ the `npm run audit` medians are in `findings.md` next
      to the baseline.

### Phase 2 — SEO and GEO

- [x] `schema-dts@2.1.0`; one typed JSON-LD `@graph` — _verified by:_ the `seo` suite. The script moved
      from the root layout to the home page, since the graph describes that page.
- [x] `/llms.txt` as a generated route; `public/llms.txt` deleted — _verified by:_ the `seo` suite.
- [x] `robots.ts` with the AI crawlers, a sitemap with both routes, `manifest.ts`, a canonical per page —
      _verified by:_ the `seo` suite. The manifest lists the current favicon until phase 4 adds the
      sprite icons.
- [x] `/email-signature` as a server page with its own metadata, the form in a client file, and the
      accessible colours in the generated signature — _verified by:_ the `seo` suite; a Chromium test
      that the copy button puts the signature on the clipboard.

### Phase 3 — layout

- [x] Slots, panels and `StackController` — _verified by:_ the `stacking` suite in the five projects.
- [x] `Carousel` and the three carousels — _verified by:_ the `carousel` suite in the five projects.
- [x] A thumbnail per project, with the To-do List screenshot captured by
      `scripts/capture-thumbnail.mjs` — _verified by:_ the thumbnail test of the `carousel` suite: five
      images, each with its `alt`, each one loading.
- [x] Portrait in the hero; the photo renamed; `profile-photo.jpg` and `about-me-cartoon.png` deleted —
      _verified by:_ the portrait test of the `home` suite; Lighthouse names the `h1` as the LCP element.
- [x] Navbar on tokens, with anchors handled by Lenis — _verified by:_ the in-page link tests of the
      `home` and `stacking` suites.
- [x] Measurement after the phase — _verified by:_ the medians are in `findings.md`. Mobile fell to 93,
      so the first contingency step (`experimental.inlineCss`) was applied: 96.

### Phase 4 — pixel art

- [x] `sharp@0.35.5` declared; `scripts/pixel-assets.mjs` and the `assets:pixel` script — _verified by:_
      a second run produces byte-identical files (compared with `shasum`).
- [x] Contact sheet of the sprite sent to the requester — _verified by:_ `sprite-contact-sheet.png` in
      this folder shows the photo and the sprite at 1×, 4× and 8× on both themes. The copy shown in the
      conversation also has the style reference, which is not ours to commit.
- [!] Sprite approved — _verified by:_ explicit approval in the conversation, recorded here with its
  date. Waiting for the requester. The sprite on the branch is draft v1.
- [x] Favicon, `icon.png`, `apple-icon.png`, manifest icons and the Open Graph image from the sprite —
      _verified by:_ the metadata routes test of the `seo` suite; a look at `/opengraph-image`.
- [x] Pixel accents of the normal skin — _verified by:_ screenshots taken during the phase (square-dot
      divider and section markers, stepped scroll cue, hard offset shadows); axe passes. The mini sprite
      on the toggle arrives with the toggle, in phase 5.

### Phase 5 — 8-bit mode

- [ ] Skin store, the script in `<head>` and `SkinToggle` in the navbar and on the portrait —
      _verified by:_ the `skin` suite: attribute, `aria-pressed`, persistence at `DOMContentLoaded`.
- [ ] The `pixel` variant, the skin rules and Pixelify Sans with `preload: false` — _verified by:_ the
      `skin` suite: headings compute to the pixel font; the font is not requested in the normal skin.
- [ ] Sprite portrait and 8-bit thumbnails — _verified by:_ the `skin` suite: `image-rendering`, and no
      request for them in the normal skin.
- [ ] Glyph coverage of the pixel font — _verified by:_ a screenshot of `ÁÉÍÓÚÂÊÔÃÕÇ áéíóúâêôãõç` in an
      8-bit heading shows no fallback glyph.
- [ ] Both routes in the four modes — _verified by:_ the `a11y` and `palette` suites.

### Phase 6 — Inspector mode

- [ ] `web-vitals@6.2.2`; the toggle, the lazy panel and the four tabs — _verified by:_ the `inspector`
      suite.
- [ ] Overlays for landmarks, headings and focus order — _verified by:_ the `inspector` suite counts one
      box per landmark of the page.
- [ ] `npm run audit -- --write` and the lab scores in the Performance tab — _verified by:_ the panel
      shows the values of `audit.json`.
- [ ] The panel is accessible — _verified by:_ axe with the Inspector open; `Escape` returns focus to
      the toggle.

### Phase 7 — hardening and documentation

- [ ] The whole suite in the five projects — _verified by:_ `npm run test:e2e` exits 0.
- [ ] Local performance — _verified by:_ `npm run audit` reports medians ≥ 95 in both presets. Each
      contingency step from `design.md`, if used, has its before and after in `findings.md`.
- [ ] `README.md` and `CLAUDE.md` updated; README thumbnail recaptured — _verified by:_ every command
      they name is in `package.json` `scripts` and every path exists.
- [ ] Repeatable procedures (regenerating the pixel assets, refreshing `audit.json`) documented —
      _verified by:_ a section in `README.md` or a file in `docs/runbooks/`.
- [ ] Verified facts moved to `.specs/memory/` — _verified by:_ each entry states the evidence that
      proved it.

## Rollout

- [ ] Commits follow the conventional format — _verified by:_ the `commit-msg` hook accepts each one.
- [ ] Pull request opened and CI green — _verified by:_ the `Linting` and `E2E` workflows pass.
- [ ] Manual check on the Vercel preview: both routes in the four modes, and the stacking on an iPhone
      and an Android phone — _verified by:_ the requester's confirmation, recorded here.
- [ ] PageSpeed Insights on the preview, mobile and desktop, median of 3 — _verified by:_ the numbers are
      in `findings.md`.
- [ ] Vercel primary domain switched to the apex — _verified by:_ `curl -sI https://kerscher.dev.br/`
      answers 200 and `https://www.kerscher.dev.br/` answers a redirect to the apex.
- [ ] PageSpeed Insights on `https://kerscher.dev.br/` after the merge: Performance ≥ 95 on mobile and
      desktop — _verified by:_ the numbers are in `findings.md`.
- [ ] JSON-LD accepted by validator.schema.org — _verified by:_ no error reported for the production
      URL.
- [ ] `findings.md` complete — _verified by:_ it holds the baseline, the per-phase measurements and
      anything that behaved differently from `design.md`.
- [ ] Folder moved to `.specs/archive/2026-10-03_layout-redesign/` — _verified by:_ `.specs/changes/`
      holds only `.gitkeep`.

## Blocked

| Item                                        | Blocked by                                    | Who unblocks it                                |
| ------------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| Merging the branch with the draft sprite    | the requester's approval of the contact sheet | Matheus Kerscher                               |
| PageSpeed Insights on the production URL    | the Vercel primary domain is still `www`      | Matheus Kerscher                               |
| PageSpeed Insights baseline through the API | the anonymous quota, exhausted on 2026-10-03  | the quota reset, or a manual run or an API key |

## Dropped

Nothing yet.
