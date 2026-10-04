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
visual, also check `/` on `npm run dev`, in light and dark.

A change that can affect loading is also measured with `npm run audit`: Lighthouse, median of 5, at
least 95 in every category. It serves the build through a 40 ms latency proxy on purpose; a score read
on the raw localhost is not evidence (`.specs/memory/lighthouse-on-localhost.md`).

## Layout

- `src/app/components/` — page sections and site-specific components.
- `src/app/data/` — site content. `site.ts` is the single source of facts and interface copy, read by
  the sections, the metadata, the JSON-LD, `/llms.txt` and the sitemap; `projects.ts` and
  `curriculum.ts` hold the lists. Edit content here, keeping components free of copy, and bump
  `site.contentUpdatedAt` when the visible content changes.
- `src/components/ui/` — shadcn/ui components, added through `components.json`.
- `src/lib/` — shared code: the colour contract, the metadata helper, the skin store.
- `e2e/` — Playwright suites; what they share is in `e2e/helpers.ts`.
- `scripts/` — `lighthouse.mjs` (`npm run audit`), `pixel-assets.mjs` (`npm run assets:pixel`) and
  `capture-thumbnail.mjs`.
- `@/*` resolves to `src/*`.

## Conventions

- **Language:** code, comments, commits and documentation are in English. The site's visible copy and
  metadata are in Brazilian Portuguese.
- **Commits:** Conventional Commits, enforced by a `commit-msg` hook. Body lines are capped at 100
  characters.
- **Colours:** only the tokens of `src/app/globals.css` (`paper`, `surface`, `ink`, `ink-muted`,
  `brand`, `line-strong`, …): no literals and no `dark:` colour pairs. A new pair of foreground and
  background goes into `src/lib/palette-contract.ts`, which `e2e/palette.spec.ts` checks in both
  themes.
- **Client Components:** one that is rendered on every page does not import `cn`, which would ship
  tailwind-merge to the browser. Join its classes by hand.
- **Stacked sections:** a `.stack-panel` carries no Tailwind position utility (`relative`,
  `absolute`, …); it would override the sticky positioning of the stylesheet. The stack is laid out
  below the navbar through `--nav-h`, and a panel has to fit in that space on a laptop screen: its
  vertical spacing uses the `--panel-*` tokens, which tighten on a short, wide viewport. The "on a
  laptop screen" tests of `e2e/stacking.spec.ts` fail when a panel outgrows it.
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
