# Portfolio

Personal portfolio site: Next.js App Router, React, Tailwind CSS, TypeScript. Versions are in
`package.json`; Node is pinned in `.nvmrc`.

## The gate

A change is verified by all four passing:

```sh
npm run lint:eslint:check && npm run lint:prettier:check && npm run build && npm run test:e2e
```

`npm run build` is the type check. `npm run test:e2e` builds the site, serves it on port 3100 and runs
Playwright in five projects; `npm run test:e2e:install` downloads the browsers once. For anything
visual, also check `/` and `/en` on `npm run dev`, in light and dark, on a wide window and at the width
of a phone.

A change that can affect loading is also measured with `npm run audit`: Lighthouse, median of 5, at
least 95 in every category. It serves the build through a 40 ms latency proxy on purpose; a score read
on the raw localhost is not evidence (`.specs/memory/lighthouse-on-localhost.md`). `--path=/en` measures
the English page; compare the script bytes it prints with the previous run.

## Layout

- `src/app/[lang]/` — the root layout, the home page, the Open Graph image and `llms.txt`. The language
  is a root parameter; `pt` is served at `/` through the rewrites of `next.config.ts`, `en` at `/en`.
- `src/app/components/` — page sections and site-specific components.
- `src/app/data/` — site content. `site.ts`, `projects.ts` and `curriculum.ts` hold the facts that do
  not depend on the language; `locales.ts` is the table of languages; `dictionaries/` holds the copy,
  one file per language, and `dictionaries/inspector/` the copy of the Inspector. They are read by the
  sections, the metadata, the JSON-LD, `/llms.txt` and the sitemap. Edit content here, keeping
  components free of copy, and bump `site.contentUpdatedAt` when the visible content changes.
- `src/components/ui/` — shadcn/ui components, added through `components.json`.
- `src/lib/` — shared code: the colour contract, the metadata helper, the skin store.
- `e2e/` — Playwright suites; what they share is in `e2e/helpers.ts`.
- `scripts/` — `lighthouse.mjs` (`npm run audit`), `pixel-assets.mjs` (`npm run assets:pixel`) and
  `capture-thumbnail.mjs`.
- `@/*` resolves to `src/*`.

## Conventions

- **Language:** code, comments, commits and documentation are in English. The site's visible copy and
  metadata exist in Brazilian Portuguese and in English, and only in `src/app/data/dictionaries/`: a
  text added to `pt.ts` is added to `en.ts`, or the build fails. Section anchors (`#projects`) are
  identifiers in English, the same in both languages.
- **Copy in components:** a Server Component calls `getDictionary()`. A Client Component never imports
  a dictionary; its Server Component parent passes the strings as props. The Inspector panel, a lazy
  chunk, is the one exception.
- **Commits:** Conventional Commits, enforced by a `commit-msg` hook. Body lines are capped at 100
  characters.
- **Colours:** only the tokens of `src/app/globals.css` (`paper`, `surface`, `ink`, `ink-muted`,
  `brand`, `line-strong`, …): no literals and no `dark:` colour pairs. A new pair of foreground and
  background goes into `src/lib/palette-contract.ts`, which `e2e/palette.spec.ts` checks in both
  themes.
- **Client Components:** one that is rendered on every page does not import `cn`, which would ship
  tailwind-merge to the browser. Join its classes by hand. A change to how they are composed is checked
  against the script bytes of `npm run audit` (`.specs/memory/styling-and-build-pitfalls.md`).
- **Stacked sections:** a `.stack-panel` carries no Tailwind position utility (`relative`,
  `absolute`, …); it would override the sticky positioning of the stylesheet. The stack is laid out
  below the navbar through `--nav-h`, and a panel has to fit in that space on a laptop screen: its
  vertical spacing uses the `--panel-*` tokens, which tighten on a short, wide viewport. The "on a
  laptop screen" tests of `e2e/stacking.spec.ts` fail when a panel outgrows it.
- **Two layouts, split at `lg`:** from 1024 px up it is the desktop layout; below it the page is one
  centred column with its own type sizes, where every link and button is a 44 px touch target. A change
  for the column is a `max-lg:` utility (or `max-md:`, `max-sm:`) or a rule inside a
  `@media (width < 64rem)` block, never a change to a base class: the desktop fits a laptop screen by
  a few pixels and must not move. `e2e/mobile.spec.ts` checks the centring, the targets and the type.
- **8-bit mode is an Easter egg:** nothing in the normal skin announces it. The ways in are in
  `src/app/components/skin-easter-egg.tsx`, and the Inspector exists only inside that skin. Tests enter
  it with `storeSkin` from `e2e/helpers.ts`.
- **Generated files:** `public/avatar/`, `public/thumbnails/8bit/`, `src/app/favicon.ico`,
  `src/app/icon.png` and `src/app/apple-icon.png` come from `npm run assets:pixel`, and
  `src/app/data/audit.json` from `npm run audit -- --write`. They are regenerated, not edited.
- **Dependencies:** keep each entry's existing form in `package.json` — exact pins stay exact, ranges
  stay ranges. Install explicit versions; `npm run update-dependencies` is interactive. A peer
  dependency conflict means the package stays on its current version: record it in
  `.specs/BACKLOG.md` with the observed error.
- **Blocked upgrades:** read `.specs/BACKLOG.md` before upgrading `eslint` or `typescript`.

## Spec-driven workflow

A piece of work starts as a spec under `.specs/changes/`, approved before any code is written. Follow
`.specs/README.md` for the folder naming, the templates and the lifecycle. Verified facts about the
system and its tools are in `.specs/memory/`.
