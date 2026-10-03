# Findings — Update dependencies, refresh README, add CLAUDE.md

Measured on 2026-10-03, Node 22.21.0, npm 10.9.4.

- **The baseline was not green.** Before any change, `npm run lint:prettier:check` failed on
  `.specs/BACKLOG.md` (missing final newline). The file is untracked, so CI never saw it. Fixed by
  formatting it.
- **Next 16.3.8 rejects `baseUrl` under TypeScript 6.** `next build` on 16.2.7 passed; on 16.3.8 the type
  check fails with `TS5101: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0`.
  Removing `baseUrl` from `tsconfig.json` fixes it; `paths` resolves relative to the config file, so
  `@/*` is unaffected.
- **Prettier 3.9.9 formats a comment-only object on one line.** `next.config.ts` had to be reformatted;
  nothing else in the repository changed.
- **`framer-motion` 12 → 14 needed no source change.** All 11 importing files build unchanged.
- **`@types/node` 26 needed no source change**, with the runtime still on Node 22.
- **`eslint` 10 and `typescript` 7 are blocked** by `eslint-config-next@16.3.8`'s bundled plugins; errors
  are in `.specs/BACKLOG.md` (B-001, B-002).
- **npm does not fail on these peer conflicts.** It prints `ERESOLVE overriding peer dependency` and
  installs anyway, so a clean `npm install` exit is not evidence of compatibility. `npm ls <pkg>`
  reporting `invalid` is.
- **`npm audit` reports 14 vulnerabilities (2 moderate, 12 high)** after the update. Not investigated;
  out of scope.
