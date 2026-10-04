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

- [ ] Route, form, template and `ui/card.tsx` deleted; `zod` uninstalled; `signaturePage` removed from
      the data, the sitemap and `llms.txt` — _verified by:_ `grep -rn "signature" src e2e` returns
      nothing; `npm ls` reports no `invalid`.
- [ ] `/email-signature` redirects to `/` — _verified by:_ a test asserts 308 and the `Location`.
- [ ] Tests of the page removed, and the Konami test creates its own field — _verified by:_ the gate.

### Phase 1 — experience from the profile

- [ ] `curriculum.ts` holds the four jobs and the degree of the profile — _verified by:_ a test of the
      timeline order and of the current employer; the table of `design.md`.
- [ ] Derived facts updated: employer, summary, technologies in `knowsAbout` and `stackSummary`,
      location — _verified by:_ the `seo` suite (JSON-LD `worksFor`, `llms.txt`).
- [ ] Periods formatted from the dates, and years of experience computed — _verified by:_ the `ssr`
      suite finds the computed value in the raw HTML; no hand-written period is left in the data.
- [ ] The "Currículo" panel still fits below the navbar — _verified by:_ the "on a laptop screen" tests.

### Phase 2 — the route check

- [ ] Home page, Open Graph image and `llms.txt` under `app/[lang]`, Portuguese only, with the rewrites
      and redirects — _verified by:_ the build lists the routes as prerendered; `curl -sI` shows 200 for
      `/` and `/llms.txt`, 308 for `/pt` and `/email-signature`, 404 for an unknown path; the results
      are in `findings.md`.

### Phase 3 — dictionaries and anchors

- [ ] `locales.ts`, `dictionaries/pt.ts`, `getDictionary`; `site.ts`, `projects.ts` and
      `curriculum.ts` hold only neutral facts — _verified by:_ the gate; the accented-letter `grep` of
      the spec matches only the Portuguese dictionaries.
- [ ] Client Components take copy as props — _verified by:_ no file with `"use client"` imports
      `dictionaries/` except the Inspector panel; script bytes in the audit.
- [ ] Anchors renamed — _verified by:_ `grep -rnE "#(sobre|projetos|curriculo|contato)" src e2e`
      returns nothing; the `stacking` and `home` suites.

### Phase 4 — English

- [ ] `dictionaries/en.ts` and the Inspector dictionary in English — _verified by:_ `npm run build`;
      a removed key fails the build (tried once, recorded in `findings.md`).
- [ ] `/en` and the language switch — _verified by:_ `i18n.spec.ts`.
- [ ] Nothing left in Portuguese at `/en` — _verified by:_ the leftover test of `i18n.spec.ts`.

### Phase 5 — SEO and GEO per language

- [ ] Canonical, `hreflang`, `og:locale`, sitemap alternates, JSON-LD and `llms.txt` per language —
      _verified by:_ the `seo` suite in both languages.

### Phase 6 — hardening and documentation

- [ ] Suites that depend on copy or layout run in both languages — _verified by:_ the gate.
- [ ] Performance of `/` and `/en` — _verified by:_ `npm run audit` and `npm run audit -- --path=/en`;
      medians and script bytes in `findings.md`.
- [ ] Screenshots of `/en` in the four modes, desktop and Pixel 7 — _verified by:_ looked at.
- [ ] `README.md` and `CLAUDE.md` updated; verified facts in `.specs/memory/` — _verified by:_ every
      path and command they name exists.

## Rollout

- [ ] Requester reviewed the copy in both languages and the timeline — _verified by:_ his confirmation,
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
