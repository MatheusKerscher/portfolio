# Spec backlog

Work that has been **identified and recorded** but not yet specified. Each entry
becomes its own folder under [`changes/`](./changes/) when it is picked up —
copy [`template/`](./template/) and fill in `spec.md`, `design.md`, `tasks.md`.

This file exists so a finding made mid-refactor has a home other than someone's
memory. Items here are deliberately **not** folded into the active spec.

Ordered by severity. Ids are allocation order, not priority.

---

## B-001 — ESLint 10 is blocked by `eslint-config-next`

**Found:** 2026-10-03, during `2026-10-03_update-deps-and-docs`. **Severity:** low.

`npm install -D eslint@10` (10.12.0) installs only by overriding peer ranges. The plugins bundled by
`eslint-config-next@16.3.8` cap at ESLint 9: `eslint-plugin-import` (`^9`), `eslint-plugin-jsx-a11y`
(`^9`), `eslint-plugin-react` (`^9.7`). `npm ls eslint` reports `invalid`, and `npm run lint:eslint:check`
crashes:

```
TypeError: scopeManager.addGlobals is not a function
    at addDeclaredGlobals (node_modules/eslint/lib/languages/js/source-code/source-code.js:261:15)
```

Reverted to `eslint@9.39.5`. Retry when `eslint-config-next` declares ESLint 10 in its peer range.

## B-002 — TypeScript 7 is blocked by `typescript-eslint`

**Found:** 2026-10-03, during `2026-10-03_update-deps-and-docs`. **Severity:** low.

With `typescript@7.0.2`, `npm run build` passes on Next 16.3.8, but the `typescript-eslint` bundled by
`eslint-config-next@16.3.8` requires `typescript >=4.8.4 <6.1.0`. npm overrides the peer range, the
tree is reshuffled, and lint fails:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@typescript-eslint/eslint-plugin'
imported from eslint.config.mjs
```

Reverted to `typescript@6.0.3`. Retry when `typescript-eslint` supports TypeScript 7. The deprecated
`baseUrl` was already removed from `tsconfig.json`, so no config change is expected then.

## B-003 — `eslint.config.mjs` imports an undeclared dependency

**Found:** 2026-10-03, while investigating B-002. **Severity:** medium.

`eslint.config.mjs` imports `@typescript-eslint/eslint-plugin`, which is not in `package.json`. It
resolves only because npm hoists it from `eslint-config-next`; any change to the tree shape can remove
it from the top level, as the TypeScript 7 attempt showed. Declare it as a devDependency, or take the
plugin from `eslint-config-next`'s own exports.
