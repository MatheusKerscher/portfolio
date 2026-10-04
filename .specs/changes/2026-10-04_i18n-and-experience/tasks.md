# Tasks — Experience from LinkedIn, and the site in Brazilian Portuguese and English

States: `[ ]` open · `[~]` in progress · `[x]` done and verified · `[!]` blocked · `[-]` dropped

"The gate" below means:
`npm run lint:eslint:check && npm run lint:prettier:check && npm run build && npm run test:e2e`, all
exiting 0. Every phase ends with the gate and with a site that can be published.

## Prerequisites

- [x] Plan approved by the requester — _verified by:_ the plan was approved in the conversation on
      2026-10-04, after one round of comments (same branch, delete the signature page, anchors in
      English). Its approval is the approval of this scope.
- [x] The LinkedIn profile is readable — _verified by:_ `~/Downloads/Profile.pdf` (3 pages) was read
      with PDFKit; LinkedIn itself answered HTTP 999.
- [x] The gate is green before the work — _verified by:_ 248 passed, 107 skipped on `1379c8b`.

## Implementation

### Phase 0 — remove the email signature page

- [x] Route, form, template and `ui/card.tsx` deleted; `zod` uninstalled; `signaturePage` removed from
      the data, the sitemap and `llms.txt` — _verified by:_ `grep -rn "signature" src` returns nothing
      and the tests only assert its absence; `npm ci` exits 0 and `npm ls` reports no `invalid`.
- [x] `/email-signature` redirects to `/` — _verified by:_ the `seo` suite asserts 308 and the
      `Location`.
- [x] Tests of the page removed, and the Konami test creates its own field — _verified by:_ the gate
      (`53aa10d`: 234 passed, 91 skipped).

### Phase 1 — experience from the profile

- [x] `curriculum.ts` holds the four jobs and the degree of the profile — _verified by:_ the
      `curriculum` suite: the order of the cards, Coopers Digital ongoing since 2026-06, CWB Tecnologia
      from 2024-05 to 2026-06.
- [x] Derived facts updated: employer, summary, technologies in `knowsAbout` and `stackSummary`,
      location — _verified by:_ the `curriculum` and `seo` suites (JSON-LD `worksFor` is Coopers
      Digital; `llms.txt` holds the summary with the computed years).
- [x] Periods formatted from the dates, and years of experience computed — _verified by:_ the
      `curriculum` suite tests `formatPeriod` and `yearsSince`; the `ssr` suite finds `>4+<` in the raw
      HTML; the data files hold no period string.
- [x] The "Currículo" panel still fits below the navbar — _verified by:_ the "on a laptop screen" tests;
      it needs 489 px at 1512×749, as before.

### Phase 2 — the route check

- [x] Home page, Open Graph image and `llms.txt` under `app/[lang]`, Portuguese only, with the rewrites
      and redirects — _verified by:_ the build lists `● /pt`, `● /pt/llms.txt` and
      `● /pt/opengraph-image`; `curl -sI` shows 200 for `/` and `/llms.txt`, 308 for `/pt` and
      `/email-signature`, 404 for an unknown path; the table is in `findings.md`. The fallback with route
      groups was not needed.

### Phase 3 — dictionaries and anchors

- [x] `locales.ts`, `dictionaries/pt.ts`, `getDictionary`; `site.ts`, `projects.ts` and
      `curriculum.ts` hold only neutral facts — _verified by:_ the gate (`56d0a9e`: 241 passed, 119
      skipped); the accented-letter `grep` matches only the Portuguese dictionaries and proper names
      ("Paraná", "Português", "Programa Salão").
- [x] Client Components take copy as props — _verified by:_ no file with `"use client"` imports
      `dictionaries/`; the Inspector context, part of the lazy chunk, is the only client code that does;
      the page chunks hold none of the dictionary strings searched for (`findings.md`).
- [x] Anchors renamed — _verified by:_
      `grep -rnE "#(sobre|projetos|curriculo|contato)|carrossel" src e2e scripts` returns nothing; the
      `stacking` and `home` suites.

### Phase 4 — English

- [x] `dictionaries/en.ts` and the Inspector dictionary in English — _verified by:_ `npm run build`;
      with `backToTop` removed from `en.ts`, `tsc` failed with `TS2741: Property 'backToTop' is missing`.
- [x] `/en` and the language switch — _verified by:_ `i18n.spec.ts` in the five projects, with and
      without JavaScript.
- [x] Nothing left in Portuguese at `/en` — _verified by:_ the leftover tests of `i18n.spec.ts`; with
      the hero deliberately rendered from the Portuguese dictionary the test failed and listed
      `hero.tagline` and the two buttons.
- [x] The other language opens where the page was being read, asked by the requester during the work —
      _verified by:_ `i18n.spec.ts`: from 40% into the experience section, the other language opens on
      the same section within 5% of that share, in the five projects, and `sessionStorage` is empty
      afterwards.

### Phase 5 — SEO and GEO per language

- [x] Canonical, `hreflang`, `og:locale`, sitemap alternates, JSON-LD and `llms.txt` per language —
      _verified by:_ the `seo` suite in both languages.

### Phase 6 — hardening and documentation

- [x] Suites that depend on copy or layout run in both languages — _verified by:_ the gate (`89ba184`:
      379 passed, 186 skipped).
- [x] Performance of `/` and `/en` — _verified by:_ `npm run audit -- --write` and
      `npm run audit -- --path=/en` on `89ba184`: 100 in every category, mobile and desktop, on both
      pages; 196.5 KB of script against 197.9 KB before. The medians are in `findings.md`.
- [x] The page does not ship more script than before — _verified by:_ the chunks named by the
      prerendered page: 759,358 bytes at `53aa10d`, 757,145 at `89ba184`, after the theme toggle went
      back into the navbar.
- [x] Screenshots of `/en`: hero, about, experience, contact in the 8-bit skin and the dark theme, and
      the hero on a Pixel 7 — _verified by:_ looked at.
- [x] `README.md` and `CLAUDE.md` updated; verified facts in `.specs/memory/` — _verified by:_
      `next-language-routing.md` is new and `styling-and-build-pitfalls.md` gained the framer-motion
      entry, each claim with its measurement.

## Rollout

- [ ] Requester reviewed the copy in both languages and the timeline — _verified by:_ their confirmation,
      recorded here.
- [ ] The rollout of `2026-10-03_layout-redesign` covers the push, the pull request and the deploy: this
      work is on the same branch.
- [ ] After the deploy: `hreflang` and both `llms.txt` answer on the production host — _verified by:_
      `curl` against `https://kerscher.dev.br`.
- [ ] Folder moved to `.specs/archive/2026-10-04_i18n-and-experience/`.

## Blocked

| Item | Blocked by | Who unblocks it |
| ---- | ---------- | --------------- |

## Dropped

Nothing yet.
