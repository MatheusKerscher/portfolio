# Design — Experience from LinkedIn, and the site in Brazilian Portuguese and English

## Approach

The work runs in the order that keeps the site publishable after every step: remove the email signature
page, update the experience in Portuguese, move the home page under `app/[lang]` with Portuguese only,
split facts from copy into dictionaries, add English, then the metadata per language.

The language is a root parameter. `app/[lang]/layout.tsx` is the root layout and sets `<html lang>`;
`generateStaticParams` returns `pt` and `en`, and `dynamicParams = false` turns any other first segment
into a 404. Server Components read the language with `lang()` from `next/root-params` through
`getDictionary()`, so no section takes a locale prop. Portuguese keeps its URLs through two static
rewrites in `next.config.ts` (`/` → `/pt`, `/llms.txt` → `/pt/llms.txt`), and `/pt` redirects to `/`.

A dictionary is a TypeScript module. `pt.ts` defines the shape and `en.ts` must satisfy it, so a missing
or extra key is a build error. Language-neutral facts (URLs, the email, dates, icons, section ids) stay
in `site.ts`, `projects.ts` and `curriculum.ts`. A Client Component never imports a dictionary: its
Server Component parent passes the resolved strings as props.

## Files affected

| File                                               | Role                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/app/email-signature/`, `ui/card.tsx`          | deleted                                                                       |
| `package.json`                                     | `zod` removed                                                                 |
| `next.config.ts`                                   | rewrites for the default language; redirects for `/pt` and `/email-signature` |
| `src/app/[lang]/layout.tsx`                        | root layout, moved from `src/app/layout.tsx`                                  |
| `src/app/[lang]/page.tsx`                          | home page, moved                                                              |
| `src/app/[lang]/opengraph-image.tsx`               | Open Graph image per language, moved                                          |
| `src/app/[lang]/llms.txt/route.ts`                 | `llms.txt` per language, moved                                                |
| `src/app/data/locales.ts`                          | new: the locale table, `hasLocale`, `localePath`                              |
| `src/app/data/site.ts`                             | language-neutral facts only, plus the section ids                             |
| `src/app/data/projects.ts`, `curriculum.ts`        | neutral fields; the timeline of the LinkedIn profile                          |
| `src/app/data/dictionaries/{pt,en,index}.ts`       | new: the copy and `getDictionary`                                             |
| `src/app/data/dictionaries/inspector/{pt,en}.ts`   | new: the Inspector copy, imported only by the lazy panel                      |
| `src/app/components/*`                             | sections read the dictionary; Client Components take copy as props            |
| `src/app/components/language-switch.tsx`           | new                                                                           |
| `src/lib/metadata.ts`, `sitemap.ts`, `json-ld.tsx` | canonical, `hreflang`, `og:locale`, alternates, `inLanguage`                  |
| `scripts/lighthouse.mjs`                           | `--path`, to measure `/en`                                                    |
| `e2e/*`                                            | suites read the dictionaries; `i18n.spec.ts` is new                           |
| `README.md`, `CLAUDE.md`                           | the language convention and the new layout                                    |

Reuse: `pageMetadata` (`src/lib/metadata.ts`) stays the one place that builds page metadata.
`CarouselControls` already takes its labels as props, which is the pattern every other Client Component
moves to. The `timeline` export of `curriculum.ts` and `buildJsonLd` keep their callers. `storeSkin`,
`waitForStack` and `panelBox` of the test helpers are reused by the per-language tests.

## The experience, as exported from LinkedIn on 2026-10-04

| Period              | Title                          | Organization                   | On the site before         |
| ------------------- | ------------------------------ | ------------------------------ | -------------------------- |
| Jun 2026 — present  | Full-Stack Software Engineer   | Coopers Digital · Curitiba, PR | missing                    |
| Jan 2023 — present  | Freelance Full-Stack Developer | Freelance                      | same                       |
| May 2024 — Jun 2026 | Full-Stack Software Engineer   | CWB Tecnologia · Curitiba, PR  | shown as the current job   |
| Feb 2022 — Oct 2022 | Angular Software Engineer      | Vetor Sistemas · Curitiba, PR  | titled "Angular Developer" |

Education is unchanged: Universidade Federal do Paraná, Technology in Systems Analysis and Development,
September 2021 to December 2023. The profile is written in English, so the English descriptions are
condensed from it and the Portuguese ones are translated from those. Every claim on a card is in the
profile, including the 30% reduction of hosting costs at CWB Tecnologia.

## Technical decisions

### No i18n library

**Choice:** typed TypeScript dictionaries and the routing of the framework.

**Why:** the site has about 150 strings in two languages, and they were already in TypeScript modules
with functions for the few that interpolate. `satisfies Dictionary` gives a compile-time guarantee that
both languages have the same keys and the same function signatures, which a JSON catalogue does not.
Nothing is added to the client bundle and no dependency is added.

**Rejected alternative:** `next-intl` 4.14.9, whose peer range accepts Next 16 and React 19 (checked with
`npm view`). Its message formatting solves plurals and dates this site does not have, its client provider
ships a runtime to the browser, and its prefix-less default locale runs a proxy on every request.

### The language is a root parameter, and the default language is rewritten

**Choice:** `app/[lang]` with `generateStaticParams`, `dynamicParams = false`, `next/root-params`, and
rewrites in `next.config.ts` for the Portuguese URLs.

**Why:** it is the structure of the internationalization guide bundled with the installed Next
(`node_modules/next/dist/docs/01-app/02-guides/internationalization.md`), and `next/root-params` has
been stable since 16.3.0. The canonical Portuguese URL stays `https://kerscher.dev.br/`, which is what is
indexed. A rewrite in the configuration is resolved by the router, not by code that runs per request,
and an array of rewrites is applied before dynamic routes (`rewrites.md` of the same docs). The redirect
from `/pt` keeps one URL per page.

**Rejected alternative:** a proxy that negotiates `Accept-Language` — a function on every request and a
redirect on the home page. Two root layouts in route groups, `(pt)` and `(en)` — no rewrite and no
dynamic segment, but every page and metadata file exists twice, and the locale has to be passed down by
hand. It stays the fallback if the rewrites or the root parameter do not behave as documented; the
route check in `tasks.md` decides.

### Client Components take copy as props

**Choice:** a Client Component does not import a dictionary. The Inspector panel is the exception: it
imports both Inspector dictionaries and picks by a `locale` prop.

**Why:** a dictionary imported by a Client Component is bundled for the browser, in both languages. The
strings a Client Component shows are a handful of labels, which serialize as props. The Inspector copy
has about 60 strings and one function, and the panel is already a lazy chunk fetched only when it is
opened, so both languages cost nothing on load.

**Rejected alternative:** a React context with the dictionary — the whole dictionary would be
serialized into the page for the sake of five labels. A locale-keyed dynamic import of the Inspector
copy — two more chunks and a loading state to save about 2 KB of an on-demand chunk.

### Anchors are identifiers, in English, and do not change with the language

**Choice:** `hero`, `about`, `projects`, `experience`, `contact`, defined once in `site.ts`.

**Why:** asked by the requester. One set of ids means the language switch can keep the fragment, the
stacking code and the tests have one list, and a link to a section works in either language.

**Rejected alternative:** translated ids — `/en#projects` and `/#projetos` would need a mapping in the
switch and in every test. Keeping the Portuguese ids — offered in the plan and changed by the requester.

### Periods and years of experience are derived

**Choice:** a period is formatted from `startDate` and `endDate` with the month names of the dictionary,
and the years of experience are the whole years since the first job started, computed at build time.

**Why:** the hand-written "Mai 2024 — Presente" is what went stale. A derived period cannot disagree
with the date used in `<time datetime>`, and it does not need a translation. The site is rebuilt on every
deploy, so the number of years is at most one deploy old.

**Rejected alternative:** `Intl.DateTimeFormat` — in `pt-BR` the short month is "mai. de 2024", not the
"Mai 2024" of the design, and its output depends on the ICU data of the build machine.

### The language switch is two plain links

**Choice:** `PT · EN` as `<a>` elements with `hreflang` and `lang`, the current one with
`aria-current="true"`; in the navbar from `md` up and inside the mobile menu below it.

**Why:** a change of language is a change of root parameter, which is a full page load in any case, so
a link is the honest control and works without JavaScript. The theme and the skin are in `localStorage`
and survive it. A small script adds the current fragment to the link.

**Rejected alternative:** a dropdown — two options do not need one. A single link showing only the other
language — it does not say which language is current.

### `/email-signature` redirects instead of answering 404

**Choice:** a permanent redirect to `/`.

**Why:** the URL was in the sitemap and in `llms.txt`. A redirect retires it without a crawl error.

## Known risks

| Risk                                                               | How it shows up                                               | Mitigation                                                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| The rewrite or the root parameter makes the home page dynamic      | the build lists `/[lang]` as dynamic; TTFB and the score drop | the route check runs before any other i18n work, with the route groups as fallback; `npm run audit` on both  |
| English copy is longer and a panel no longer fits below the navbar | the "on a laptop screen" tests fail at `/en`                  | those tests run in both languages; the copy is shortened, not the layout                                     |
| A string is left in Portuguese on the English page                 | mixed languages                                               | the test that searches `/en` for Portuguese dictionary strings, and the `grep` for accented letters in `src` |
| A dictionary reaches the client bundle                             | script bytes grow                                             | the audit compares the script bytes with `1379c8b`                                                           |
| The longer timeline card overflows the carousel item or the panel  | the "Currículo" panel grows                                   | descriptions are condensed to the length of the current longest card; the fit tests cover it                 |
| Old anchors in external links                                      | `/#projetos` opens the top of the page                        | accepted by the requester; recorded in the spec as out of scope                                              |

## Failing safely

- `getDictionary()` calls `notFound()` for a language it does not know, and `dynamicParams = false`
  stops such a path before it renders. An unknown language is a 404, never a page in a default language
  under the wrong URL.
- The PDF of the profile holds a phone number. Only what is listed in the table above is copied, and
  the test "only one email address is published" also asserts that no phone number is in the pages.
- Nothing is pushed and no pull request is opened without the requester asking.
