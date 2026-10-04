# Findings — Experience from LinkedIn, and the site in Brazilian Portuguese and English

Measured on 2026-10-04 on macOS, Node 22.21.0, Next 16.3.8, against the production build
(`next build && next start -p 3100`).

## The route check (phase 2)

The home page, the Open Graph image and `llms.txt` were moved under `app/[lang]` with Portuguese as the
only language, and `next.config.ts` got the rewrites and redirects of `design.md`.

Build output:

```
├   /[lang]
│ └ ● /pt
├   /[lang]/llms.txt
│ └ ● /pt/llms.txt
├   /[lang]/opengraph-image
│ └ ● /pt/opengraph-image
```

| Request               | Status | Notes                                                        |
| --------------------- | ------ | ------------------------------------------------------------ |
| `/`                   | 200    | `x-nextjs-prerender: 1`, `x-nextjs-cache: HIT`, `lang=pt-BR` |
| `/llms.txt`           | 200    | `x-nextjs-cache: HIT`                                        |
| `/pt`                 | 308    | `Location: /`                                                |
| `/pt/llms.txt`        | 308    | `Location: /llms.txt`                                        |
| `/email-signature`    | 308    | `Location: /`                                                |
| `/pt/opengraph-image` | 200    | the URL the page puts in `og:image`                          |
| `/de`, `/pt/nothing`  | 404    | the default 404 page of Next                                 |

- **The rewrite keeps the page static.** `/` is answered from the prerendered `/pt`. The fallback of
  `design.md`, two root layouts in route groups, was not needed.
- **`next/root-params` works without a flag.** `lang()` in the root layout returns the segment, and the
  build still lists the page as SSG.
- **A metadata image under a dynamic segment is dynamic unless it lists its own params.** With
  `generateStaticParams` only in the layout, the build listed `ƒ /[lang]/opengraph-image`. The same
  export in `opengraph-image.tsx` made it `● /pt/opengraph-image`. The route handler of `llms.txt` needs
  it too.
- **The canonical is unchanged** (`https://kerscher.dev.br`) and `og:image` points at
  `/pt/opengraph-image`, the real route of the file.
- **`next start` logs `Error: Internal: NoFallbackError`** once for a request to an unknown first
  segment (`/de`). The answer is still a 404; it is the server reporting that `dynamicParams = false`
  left no fallback. Deeper unknown paths do not log it.

## Phases 0 and 1

- After the email signature page was removed: 234 passed, 91 skipped. `npm ls` reports no `invalid`
  without `zod`.
- After the experience update: 238 passed, 107 skipped. The "Currículo" panel needs 489 px at 1512×749,
  the same as before: the new Coopers Digital card is as long as the CWB Tecnologia one.

## Dictionaries and anchors (phase 3)

- **The copy left the browser bundle.** Before, `site.ts` was imported by the navbar and the toggles,
  so its copy, the Inspector copy included, was in the scripts of the page. Searching the chunks the
  prerendered page names for "Navegação principal", "Main navigation", "Apaixonado por criar",
  "Passionate about", `knowsAbout` and "Universidade Federal" finds nothing. "Inspetor do site" and
  "Site inspector" are found in one chunk, the Inspector's, which is fetched when the panel is opened.
- **`next/root-params` cannot be imported by the test runner.** `dictionaries/index.ts` holds
  `dictionaryFor`, which the suites and the route handlers import, and `dictionaries/server.ts` holds
  `getDictionary`, the only importer of `next/root-params`.
- **`satisfies` is the guard.** With `backToTop` removed from `en.ts`, `tsc` reports
  `TS2741: Property 'backToTop' is missing`. TypeScript narrows `localeCodes.filter((code) => code !== locale)`
  to `never[]` while there is one language, which is why `pageMetadata` annotates that list.
- The suite after the phase, with Portuguese only: 241 passed, 119 skipped.

## English and the language switch (phases 4 and 5)

- **The leftover test finds a leftover.** With the hero rendered from the Portuguese dictionary on
  purpose, "nothing on the page is left in the source language" failed and listed `hero.tagline`,
  `hero.primaryCta` and `hero.secondaryCta`. It compares without regard to case, because `innerText`
  returns a label in capitals as CSS renders it, and it did not see `hero.eyebrow` before that.
- **It is checked in one direction only.** The other way round, English strings on the Portuguese page,
  reported `meta.role` ("Full-Stack Software Engineer", a job title on a card) and the word "on" inside
  the token name `on-brand`. Job titles and technical terms are English in both languages.
- **Lenis leaves the switch alone.** It handles a link with a fragment only when the pathname is the
  current one (`onClick` in `node_modules/lenis/dist/lenis.mjs`), so a link to `/en` navigates.
- **A reload keeps its place by itself.** The first version of the test expected a reload after the
  switch to start at the top; the browsers restored 2230 px, their own scroll restoration. What the test
  asserts now is that the remembered position is gone from `sessionStorage`.
- **Both languages fit.** At 1512×749 and 1366×641, in both skins, no panel of `/en` is taller than the
  space below the navbar, and at 320 px neither page scrolls sideways, in the five projects.
- The suite with both languages: 379 passed, 186 skipped, in 1.7 minutes.

## The script of the page (phase 6)

Decoded bytes of the chunks the prerendered page names:

| Build                                                     | Bytes   | Gesture features of framer-motion |
| --------------------------------------------------------- | ------- | --------------------------------- |
| `53aa10d`, before the language segment                    | 759,358 | absent                            |
| `ff91b57`, theme toggle rendered by the layout            | 771,140 | present                           |
| experiment: theme toggle imported by the navbar           | 757,128 | absent                            |
| `89ba184`, theme toggle imported by the navbar, with copy | 757,145 | absent                            |

- The first audit with both languages reported 201.7 KB of script transferred, against 197.9 KB. One
  chunk had grown from 121,861 to 135,819 bytes, and the names that appeared in it were framer-motion's:
  `DragGesture`, `PanGesture`, `HTMLProjectionNode`, `createDomVisualElement`.
- The cause was where the theme toggle was rendered from. Passed by the layout to the navbar as an
  element, it was a Client Component of its own; imported by the navbar, as before, the features are not
  shipped. `BackToTop`, also rendered by the layout and also using `motion`, does not cause it.
- The comparison build was made in a separate worktree. Turbopack failed with a symlinked
  `node_modules` (`TurbopackInternalError`); a copy made with `cp -cR` worked. Building an old commit in
  the main tree failed for another reason: `.next/dev/types/validator.ts`, left by a development server,
  still referred to `src/app/[lang]`.

## Final measurement, with 40 ms of latency

Lighthouse 13.5.0, median of 5, on `89ba184`:

| Page  | Preset  | Performance | Accessibility | Best Practices | SEO | Simulated FCP | Simulated LCP | Observed LCP | TBT  | CLS | Script transferred |
| ----- | ------- | ----------- | ------------- | -------------- | --- | ------------- | ------------- | ------------ | ---- | --- | ------------------ |
| `/`   | mobile  | 100         | 100           | 100            | 100 | 986 ms        | 1586 ms       | 117 ms       | 4 ms | 0   | 196.5 KB           |
| `/`   | desktop | 100         | 100           | 100            | 100 | 325 ms        | 445 ms        | 118 ms       | 0 ms | 0   | 196.5 KB           |
| `/en` | mobile  | 100         | 100           | 100            | 100 | 985 ms        | 1585 ms       | 117 ms       | 3 ms | 0   | 196.5 KB           |
| `/en` | desktop | 100         | 100           | 100            | 100 | 325 ms        | 445 ms        | 117 ms       | 0 ms | 0   | 196.5 KB           |

The previous build of the branch (`ecefe2f`) transferred 197.9 KB with the same scores and timings. The
LCP element is the `h1` on both pages. `src/app/data/audit.json` holds the row of `/`.
