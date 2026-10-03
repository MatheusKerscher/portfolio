# Spec — Update dependencies, refresh README, add CLAUDE.md

## Problem

Observed on 2026-10-03, on `main` at `4a0bf4f`:

- **Dependencies are behind.** `npm outdated` lists 21 packages. Seventeen have updates inside their
  current major; four have a new major available (`eslint` 9 → 10, `framer-motion` 12 → 14,
  `typescript` 6 → 7, `@types/node` 25 → 26).
- **The README is stale.** It is written in Portuguese while `.specs/README.md` states that everything in
  the repository is in English. Its thumbnail points to `/public/images/thumbnail.png`, which does not
  exist (the file is `public/thumbnails/thumbnail.png`). It documents only `npm i` and `npm run dev`: the
  stack, the Node version, the remaining scripts, the project structure and the commit convention are
  not mentioned.
- **There is no `CLAUDE.md`.** Every agent session has to rediscover the stack, the commands, the
  layout and the spec-driven workflow from scratch.

## Expected outcome

Dependencies are current, and `README.md` and `CLAUDE.md` accurately describe the project as it is after
the update.

## Scope

1. **Minor/patch updates** for every outdated package, inside its current major:

   | Package                                              | From   | To     |
   | ---------------------------------------------------- | ------ | ------ |
   | `next`                                               | 16.2.7 | 16.3.8 |
   | `eslint-config-next`                                 | 16.2.7 | 16.3.8 |
   | `react`, `react-dom`                                 | 19.2.7 | 19.3.0 |
   | `@types/react`, `@types/react-dom`                   | 19.2.2 | 19.3.0 |
   | `tailwindcss`, `@tailwindcss/postcss`                | 4.1.16 | 4.3.3  |
   | `zod`                                                | 4.4.3  | 4.6.5  |
   | `lucide-react`                                       | 1.17.0 | 1.51.0 |
   | `@radix-ui/react-tabs`                               | 1.1.13 | 1.1.21 |
   | `lenis`                                              | 1.3.23 | 1.3.26 |
   | `tailwind-merge`                                     | 3.6.0  | 3.7.0  |
   | `prettier`                                           | 3.8.3  | 3.9.9  |
   | `@commitlint/cli`, `@commitlint/config-conventional` | 21.0.2 | 21.2.3 |
   | `commitizen`                                         | 4.3.1  | 4.3.2  |
   | `eslint` (within 9)                                  | 9.39.4 | 9.39.5 |
   | `@types/node` (within 25)                            | 25.9.1 | 25.9.9 |

2. **Major attempts**, one package at a time: `eslint` 10, `framer-motion` 14, `typescript` 7,
   `@types/node` 26. A major that cannot be adopted with a trivial fix (see `design.md`) is reverted and
   recorded in `.specs/BACKLOG.md` with the observed error.
3. **`README.md` rewritten in English**: description, working thumbnail, stack, prerequisites (Node
   `lts/jod` from `.nvmrc`), install and run, scripts table, project structure, commit convention,
   license.
4. **`CLAUDE.md` created at the repository root**: commands, architecture, conventions, and a pointer to
   the spec-driven workflow in `.specs/README.md`.

## Out of scope

- Feature or visual changes to the site — this work must not change what a visitor sees.
- Adding a test suite — the project has none; introducing one is its own piece of work.
- Replacing `framer-motion` with the `motion` package — a migration, not an update.
- Changing the Node version (`.nvmrc` stays `lts/jod`) or the CI workflow.
- Committing the untracked `.github/PULL_REQUEST_TEMPLATE.md` — unrelated to this work.

## Acceptance criteria

All commands are run from the repository root and must exit 0.

- [ ] `npm ci` succeeds without `--force` or `--legacy-peer-deps`.
- [ ] `npm run lint:eslint:check` passes.
- [ ] `npm run lint:prettier:check` passes.
- [ ] `npm run build` passes.
- [ ] `npm outdated` lists only packages recorded as deferred in `.specs/BACKLOG.md` (empty output if
      no major was deferred).
- [ ] `package.json` keeps its existing pinning style: exact pins stay exact, ranges stay ranges.
- [ ] Manual check on `npm run dev`: `/` and `/email-signature` render; theme toggle, smooth scroll,
      section animations and the signature copy button work; the browser console shows no errors.
- [ ] Every relative link and image in `README.md` resolves to a file that exists in the repository.
- [ ] Every command named in `CLAUDE.md` exists in `package.json` `scripts`, and every path it names
      exists in the tree.
- [ ] `README.md` and `CLAUDE.md` state the versions actually installed after the update.

## Requester decisions

| Decision                  | Choice                                                                 | When       |
| ------------------------- | ---------------------------------------------------------------------- | ---------- |
| Handling of major updates | Try each in isolation; revert and record in the backlog if not trivial | 2026-10-03 |
| Spec structure            | One spec covering dependencies, README and CLAUDE.md                   | 2026-10-03 |
| README language           | English, following the repository rule; CLAUDE.md also in English      | 2026-10-03 |

Decided by Matheus Kerscher.

## Dependencies and blockers

Nothing outside this repository is required.

Open — to be closed by the attempt itself, not by assumption:

- Whether `eslint-config-next` 16.3.8 accepts ESLint 10 in its peer range.
- Whether Next 16.3.8 and the `@typescript-eslint` plugin used in `eslint.config.mjs` support
  TypeScript 7.
