# Portfolio

Personal portfolio site: Next.js App Router, React, Tailwind CSS, TypeScript. Versions are in
`package.json`; Node is pinned in `.nvmrc`.

## The gate

There is no test suite. A change is verified by all three passing:

```sh
npm run lint:eslint:check && npm run lint:prettier:check && npm run build
```

`npm run build` is the type check. For anything visual, also check `/` and `/email-signature` on
`npm run dev`.

## Layout

- `src/app/components/` — page sections and site-specific components.
- `src/app/data/` — site content (projects, curriculum). Edit content here, keeping components free of
  copy.
- `src/components/ui/` — shadcn/ui components, added through `components.json`.
- `@/*` resolves to `src/*`.

## Conventions

- **Language:** code, comments, commits and documentation are in English. The site's visible copy and
  metadata are in Brazilian Portuguese.
- **Commits:** Conventional Commits, enforced by a `commit-msg` hook. Body lines are capped at 100
  characters.
- **Dependencies:** keep each entry's existing form in `package.json` — exact pins stay exact, ranges
  stay ranges. Install explicit versions; `npm run update-dependencies` is interactive. A peer
  dependency conflict means the package stays on its current version: record it in
  `.specs/BACKLOG.md` with the observed error.
- **Blocked upgrades:** read `.specs/BACKLOG.md` before upgrading `eslint` or `typescript`.

## Spec-driven workflow

A piece of work starts as a spec under `.specs/changes/`, approved before any code is written. Follow
`.specs/README.md` for the folder naming, the templates and the lifecycle.
