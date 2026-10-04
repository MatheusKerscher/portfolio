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
