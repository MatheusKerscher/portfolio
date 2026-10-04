# Next.js: a language as a route segment

Verified on 2026-10-04 during the `2026-10-04_i18n-and-experience` spec, with Next.js 16.3.8 (Turbopack),
against the production build (`next build && next start`).

## A rewrite to a prerendered dynamic route stays static

- **Evidence:** `next.config.ts` rewrites `/` to `/pt`, and `app/[lang]` lists `pt` and `en` in
  `generateStaticParams`. The build reports `● /pt` and `● /en` (SSG), and `curl -sI /` answers 200 with
  `x-nextjs-prerender: 1` and `x-nextjs-cache: HIT`. Lighthouse on `/` kept its timings (simulated LCP
  1586 ms on mobile before and after).
- **Rule:** the default language can keep URLs without a prefix through a rewrite. No proxy is needed.

## `next/root-params` works without a flag

- **Evidence:** `import { lang } from "next/root-params"` in a Server Component under `app/[lang]`
  returns the segment, and the page is still listed as SSG. It was introduced in 16.3.0 (version history
  of `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-root-params.md`).
- **Limit:** it cannot be imported by a Client Component, a route handler or anything the test runner
  imports. `dictionaries/server.ts` is the only module that imports it; `dictionaries/index.ts` is free
  of it so tests and route handlers can read the copy.

## A route handler or metadata image under a dynamic segment needs its own `generateStaticParams`

- **Evidence:** with `generateStaticParams` only in `app/[lang]/layout.tsx`, the build listed
  `ƒ /[lang]/opengraph-image` (dynamic). With the same export in `opengraph-image.tsx` it became
  `● /pt/opengraph-image`. `llms.txt/route.ts` exports it too.

## `dynamicParams = false` answers 404 and logs an internal error

- **Evidence:** a request to `/de` answers 404, and `next start` writes
  `Error: Internal: NoFallbackError` to its log once. Deeper unknown paths (`/pt/nothing`) answer 404
  without the log line. It is noise, not a failure.

## A redirect and a rewrite of the same path do not loop

- **Evidence:** `/pt` redirects to `/` (308) and `/` is rewritten to `/pt`. `curl -sI /pt` answers 308
  with `Location: /`, and `/` answers 200: a rewrite is applied after the redirects and is not passed
  through them again.
