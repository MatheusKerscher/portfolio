# Tasks — Update dependencies, refresh README, add CLAUDE.md

States: `[ ]` open · `[~]` in progress · `[x]` done and verified · `[!]` blocked · `[-]` dropped

"The gate" below means: `npm run lint:eslint:check && npm run lint:prettier:check && npm run build`,
all exiting 0.

## Prerequisites

- [x] Spec approved by the requester — _verified by:_ explicit approval in the conversation.
- [x] Feature branch created off `main` — _verified by:_ `git branch --show-current` is not `main`.
- [x] Baseline measured before any change — _verified by:_ the gate run on the untouched branch. ESLint
      and build passed; Prettier failed on the untracked `.specs/BACKLOG.md` (see `findings.md`).

## Implementation

### Phase 1 — minor/patch

- [x] Install every in-major update listed in `spec.md` — _verified by:_ the gate passes; `npm outdated`
      lists only the four majors.
- [x] Pinning style unchanged — _verified by:_ `git diff package.json` shows version numbers changing,
      not `^` being added or removed.

### Phase 2 — majors (one commit each)

- [-] `eslint` 10 — _verified by:_ `npm install` without ERESOLVE and the gate passes; otherwise
  reverted and recorded in the backlog.
- [~] `framer-motion` 14 — _verified by:_ the gate passes and animations work on `/` and
  `/email-signature`; otherwise reverted and recorded in the backlog.
- [-] `typescript` 7 — _verified by:_ the gate passes; otherwise reverted and recorded in the backlog.
- [x] `@types/node` 26 — _verified by:_ the gate passes with zero source changes; otherwise reverted
      and recorded in the backlog.
- [x] Backlog entry for each deferred major, with the exact error observed — _verified by:_
      every package still listed by `npm outdated` has an entry in `.specs/BACKLOG.md`.

### Phase 3 — documentation

- [x] `README.md` rewritten in English with the sections listed in `spec.md` — _verified by:_ every
      relative link and image path exists on disk; `npm run lint:prettier:check` passes.
- [x] `CLAUDE.md` created — _verified by:_ every command it names is in `package.json` `scripts`, every
      path it names exists; `npm run lint:prettier:check` passes.
- [x] Versions stated in both files match what is installed — _verified by:_ comparison against
      `package.json`.

## Rollout

- [x] Full acceptance run — _verified by:_ `npm ci` followed by the gate, from a clean `node_modules`.
- [~] Manual QA on `npm run dev` — _verified by:_ `/` and `/email-signature` render; theme toggle,
  smooth scroll, section animations and the signature copy button work; no console errors.
- [x] Commits follow the conventional format — _verified by:_ the `commit-msg` hook (commitlint)
      accepts each one.
- [ ] Pull request opened and CI green — _verified by:_ the `Linting` workflow passes.
- [x] Findings recorded if anything was measured or surprising — _verified by:_ `findings.md` exists in
      this folder, or nothing worth recording happened.
- [ ] Folder moved to `.specs/archive/2026-10-03_update-deps-and-docs/` — _verified by:_
      `.specs/changes/` is empty.

## Blocked

| Item | Blocked by | Who unblocks it |
| ---- | ---------- | --------------- |

## Dropped

- `eslint` 10 — peer range of `eslint-config-next@16.3.8` caps at ESLint 9 and lint crashes. Reverted;
  recorded as B-001 in `.specs/BACKLOG.md`.
- `typescript` 7 — `typescript-eslint` requires `<6.1.0` and lint fails to load its plugin. Reverted;
  recorded as B-002.

Manual QA and `framer-motion` 14 are `[~]`: the gate passes, every route returns 200 from the production build and the server-rendered HTML
carries the animation initial states, but theme toggle, smooth scroll, animations and the copy button
have not been exercised in a browser.
