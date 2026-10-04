# Design — Layout redesign: stacked sections, carousels, pixel art, 8-bit and Inspector modes

## Approach

**Content has one source.** `src/app/data/site.ts` holds the facts (name, role, location, email, socials,
technologies, stats), the copy of the interface and the date the content last changed. `projects.ts` and
`curriculum.ts` keep the two lists. The sections, the `metadata` exports, JSON-LD, `/llms.txt`, the
sitemap, the manifest and the Open Graph image all read from there, so a fact is edited once.

**The server renders everything; the client adds behaviour.** The sections become Server Components and
the hero ships no client code. The client islands are small and named: `StackController`,
`CarouselControls`, the theme, skin and Inspector toggles, the mobile menu, the reveal wrappers
(`MotionSection`, `AnimatedText`, `CountUp`), the Lenis provider and `BackToTop`. The Inspector panel is a
separate chunk, fetched when it is first opened.

**The page is a stack of slots.** `page.tsx` renders one `.stack-slot` per section. The slot carries the
`id`; the section inside it is the `.stack-panel`. CSS pins the panel, and `StackController` measures the
panel heights and keeps a focused element visible.

**Theme and skin are two independent attributes on `<html>`:** `class="dark"` (next-themes, unchanged) and
`data-skin="8bit"`. The colour tokens depend only on the theme. The skin changes type, shape and imagery,
never a colour pair.

**Verification is automated.** Playwright runs against the production build in five browser projects. A
Lighthouse script measures both presets, fails below the threshold, and writes the lab scores that the
Inspector shows.

## Files affected

| File                                                                                        | Role                                                                                                        |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/app/page.tsx`                                                                          | renders the slots and `StackController`; home metadata with its canonical                                   |
| `src/app/layout.tsx`                                                                        | Pixelify Sans, skin script in `<head>`, `MotionProvider`, `<noscript>` reveal rule, metadata from `site.ts` |
| `src/app/globals.css`                                                                       | colour tokens, shadcn mapping, `pixel` variant, stack, carousel and 8-bit rules; drops `tw-animate-css`     |
| `src/app/data/site.ts`                                                                      | new — facts, socials, technologies, stats, interface copy, `contentUpdatedAt`                               |
| `src/app/data/projects.ts`, `curriculum.ts`                                                 | a thumbnail per project; a `kind` per timeline entry                                                        |
| `src/app/data/audit.json`                                                                   | new — lab scores written by `npm run audit -- --write`                                                      |
| `src/app/components/hero-section.tsx`                                                       | static Server Component with the portrait                                                                   |
| `src/app/components/{about,projects,curriculum,contact}-section.tsx`, `project-card.tsx`    | Server Components on tokens; lists replaced by carousels                                                    |
| `src/app/components/carousel.tsx`                                                           | new — the track (server) and `CarouselControls` (client)                                                    |
| `src/app/components/stack-controller.tsx`                                                   | new — panel heights and focus reveal                                                                        |
| `src/app/components/count-up.tsx`, `motion-provider.tsx`                                    | new — ported from `rafael-goncalves`                                                                        |
| `src/app/components/motion-section.tsx`, `animated-text.tsx`                                | gain `data-reveal`; become the only reveal primitives                                                       |
| `src/app/components/portrait.tsx`, `skin-toggle.tsx`, `skin-easter-egg.tsx`                 | new — photo and sprite; the way out of the 8-bit skin and the hidden way in                                 |
| `src/app/components/inspector/*`                                                            | new — toggle, lazy panel, four tabs, overlays                                                               |
| `src/app/components/navbar.tsx`, `footer.tsx`, `back-to-top.tsx`, `theme-toggle.tsx`        | tokens; the two new toggles; anchors handled by Lenis                                                       |
| `src/app/components/smooth-scroll-provider.tsx`                                             | Lenis options `autoRaf`, `anchors`, `allowNestedScroll`                                                     |
| `src/app/components/json-ld.tsx`                                                            | one typed `@graph`                                                                                          |
| `src/lib/contrast.ts`, `palette-contract.ts`, `skin.ts`                                     | new — ratio maths; the pairs and their minimums; the skin store                                             |
| `src/app/llms.txt/route.ts`, `manifest.ts`, `icon.png`, `apple-icon.png`                    | new metadata routes                                                                                         |
| `src/app/favicon.ico`, `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`                     | sprite favicon; AI crawlers; both routes; new palette and sprite                                            |
| `src/app/email-signature/page.tsx`, `signature-form.tsx`, `signature-template.tsx`          | server page with metadata; the form moves to a client file; accessible colours in the signature             |
| `public/images/matheus-kerscher.jpg`                                                        | the new portrait, renamed                                                                                   |
| `public/avatar/*`, `public/thumbnails/8bit/*`, `public/thumbnails/thumbnail-to-do-list.png` | new — generated or captured                                                                                 |
| `public/thumbnails/thumbnail.png`                                                           | recaptured from the new home page, for the README                                                           |
| `public/llms.txt`, `public/profile-photo.jpg`, `public/thumbnails/about-me-cartoon.png`     | deleted                                                                                                     |
| `playwright.config.ts`, `e2e/*`                                                             | new — configuration, helpers and nine suites                                                                |
| `scripts/lighthouse.mjs`, `pixel-assets.mjs`, `capture-thumbnail.mjs`                       | new — measurement and asset generation                                                                      |
| `.github/workflows/e2e.yaml`                                                                | new — Playwright and Lighthouse on pull requests                                                            |
| `package.json`, `package-lock.json`, `.prettierrc`, `.gitignore`, `eslint.config.mjs`       | dependencies and scripts; class sorting; report folders ignored                                             |
| `next.config.ts`                                                                            | `images.formats` with AVIF and WebP                                                                         |
| `README.md`, `CLAUDE.md`                                                                    | stack, scripts, structure, the new gate                                                                     |
| `.specs/memory/*`                                                                           | verified facts, written at closing                                                                          |

Reuse, in this repository: `cn` (`src/lib/utils.ts`); `Card` and `Tabs` (`src/components/ui/`) — `Tabs`
is installed and unused today, and becomes the tab list of the Inspector; `MotionSection` and
`AnimatedText`, which stay the reveal primitives; `LenisContext` and `useLenis`
(`src/app/components/lenis-context.ts`); the `useSyncExternalStore` mount pattern of `theme-toggle.tsx`,
for the skin toggle; `social-icons.tsx`; `projects.ts`, `curriculum.ts` and the `TimelineItem` type; the
four project screenshots already in `public/thumbnails/`.

Reuse, ported from `rafael-goncalves`: `components/brand/count-up.tsx` (the final value is in the server
HTML); `components/brand/motion-provider.tsx`; the `data-reveal` attribute with its `<noscript>` rule;
`app/llms.txt/route.ts`; the AI crawler list of `app/robots.ts`; `app/manifest.ts`; the graph and the `<`
escape of `components/seo/json-ld.tsx`; `playwright.config.ts`; the helpers `revealAll` and `readJsonLd`
and the structure of the `a11y`, `seo`, `ssr` and `home` suites.

Next.js behaviour is taken from the documentation bundled in `node_modules/next/dist/docs/`, not from
memory: `image.md`, `json-ld.md`, `preventing-flash-before-hydration.md`, `lazy-loading.md`,
`opengraph-image.md`, `robots.md`, `app-icons.md` and `testing/playwright.md`.

## Technical decisions

### Pinning with `position: sticky` inside overlapping slots, below the navbar

**Choice:**

```css
:root {
  --nav-h: 4rem;
}
.stack {
  padding-top: var(--nav-h);
}
.stack-slot {
  position: relative;
  scroll-margin-top: var(--nav-h);
}
.stack-panel {
  min-height: calc(100svh - var(--nav-h));
  background: var(--paper);
}
@media (prefers-reduced-motion: no-preference) {
  .stack-slot:not(:last-child)::after {
    content: "";
    display: block;
    height: calc(100svh - var(--nav-h));
  }
  .stack-slot + .stack-slot {
    margin-top: calc(var(--nav-h) - 100svh);
  }
  .stack-slot:not(:last-child) > .stack-panel {
    position: sticky;
    top: min(var(--nav-h), calc(100svh - var(--panel-h, 100000px)));
  }
}
```

`StackController` sets `--panel-h` on each panel from a `ResizeObserver`. A panel pins when its bottom
reaches the bottom of the small viewport, stays pinned while the next slot moves over it, and is
released once it is fully covered. The last panel (`contato`) never pins, and the footer stays outside
the stack.

The navbar is fixed, `--nav-h` tall and opaque, and the stack is laid out in what is left of the
viewport: the first panel starts under the navbar, a panel is at least that space tall, and it pins with
its top at the bottom edge of the navbar. The next panel therefore travels from the bottom of the
viewport to the navbar and stops there. Only a panel taller than that space goes behind the navbar, by
scrolling, as on any page with a fixed header; the opaque background hides it. The next section keeps
that case to phones and very short windows. The slot has a `scroll-margin-top` of the same height, which
both the browser's fragment navigation and Lenis apply.

**Why:** sticky positioning is done by the browser, with no script on the scroll path. The spacer and the
negative margin cancel out, so the layout positions and the document height are those of the unstyled
page. Without a measured height the fallback `top` can never be reached, so without JavaScript the page
scrolls normally and nothing is hidden. Releasing a panel once it is covered keeps at most two pinned
panels near the viewport instead of four stacked ones. The slot is not sticky, so the browser's own
fragment navigation, and Lenis reading the slot's rectangle, land on the natural position in both
directions. `svh` keeps the pinning point inside the viewport whatever the state of the mobile browser
toolbar.

The first version pinned at the top of the viewport, under a navbar that was transparent over the hero
and translucent with a blur after it. The top of every panel then slid behind the navbar and showed
through it, which the requester asked to change. A translucent navbar cannot be kept: whatever passes
behind it is content.

**Rejected alternative:** every panel as a sticky sibling with `top: 0` — one rule and no script, but a
panel taller than the viewport is cut, which happens on phones and at 200% zoom. CSS scroll-driven
animations that translate the leaving panel — no script either, but the three engines do not support
them equally, and they need the same focus handling. `framer-motion` `useScroll` transforms — work on
the main thread for every frame. Keeping the pinning at the top and adding top padding to every panel —
offered to the requester and declined: the content would clear the navbar, but the edge of the panel
would still slide behind it.

### A panel fits below the navbar on a wide screen

**Choice:**

```css
:root {
  --squeeze: 0px;
  --panel-pad: calc(4rem - var(--squeeze) * 0.14);
  --panel-gap: calc(2.5rem - var(--squeeze) * 0.08);
  --panel-gap-md: calc(var(--panel-gap) * 0.8);
  --panel-gap-sm: calc(var(--panel-gap) * 0.6);
  --thumbnail-h: calc(15.6rem - var(--squeeze) * 0.3);
}
@media (min-width: 1024px) {
  :root {
    --squeeze: clamp(0px, 960px - 100svh, 320px);
  }
}
```

`--squeeze` is how far a wide viewport falls short of 960 px in height. The padding of a panel, the gaps
between its blocks, the section headings, the hero heading and the height of a project thumbnail each
give up a share of it. At 960 px and above nothing changes; from there down to 640 px the content of the
tallest panel loses about 0.8 px for each pixel the viewport loses, starting from a panel that needed 835
px. The sections use the tokens through Tailwind (`py-(--panel-pad)`, `space-y-(--panel-gap)`,
`max-h-(--thumbnail-h)`).

**Why:** a panel that does not fit pins by its bottom edge, and its top then rests behind the navbar for
as long as the next panel covers it. On the requester's screen (1512×749, 685 px below the navbar)
"Sobre" needed 835 px and "Projetos" 797 px, so both rested with their heading cut by the navbar. No
positioning rule fixes that: content taller than the space has to pass the navbar to be read. The
content has to fit. Below 1024 px wide the value is zero on purpose: there a panel is taller than the
viewport whatever its spacing, and the looser rhythm reads better.

**Rejected alternative:** breakpoints on `max-height` — the fit would hold at the heights tested and jump
between them. Scaling the panel with `zoom` or `transform` by a ratio computed in script — it shrinks
the body text with everything else and adds script to the layout. Not pinning a panel that does not fit
— nothing would rest behind the navbar, but the stacking would be lost on every phone, where it works
well because the panel has already been read. Scrolling the overflow inside a pinned panel — the content
is clipped at the same edge, so it looks the same and adds a second scroll container.

### A covered focus target is scrolled to its natural position

**Choice:** on `focusin`, `StackController` hit-tests the centre of the focused element. If another
element is on top, it scrolls to
`clamp(naturalY − navbar height − 16, slotTop − navbar height, slotTop + panelHeight − innerHeight)`, where `naturalY` is
the top of the slot plus the offset of the element inside its panel. That range is the part of the scroll
in which the panel is in normal flow and not yet covered.

**Why:** while a panel is pinned its rectangle is inside the viewport, so the browser sees a focused
element in it as already visible and does not scroll, even when the next panel covers it. That fails
WCAG 2.4.11 (Focus Not Obscured). The geometry is the same for any stacking technique, so it needs an
explicit correction.

**Rejected alternative:** `inert` or `visibility: hidden` on covered panels — it removes them from the
tab order and from the accessibility tree, so going backward with the keyboard would skip whole sections.

Known limitation, not fixed here: find-in-page does not fire an event a page can act on, so a match
inside a covered panel may stay hidden.

### Carousels on native scroll snap

**Choice:** a horizontally scrollable `<ul>` with `scroll-snap-type: x mandatory`, rendered on the server.
A small client island adds the previous and next buttons (`scrollBy`), their disabled state and the
"2 / 5" indicator. The track is focusable, so the arrow keys scroll it.

**Why:** it works before hydration and without JavaScript, with touch, trackpad and keyboard, and
scrolling stays off the main thread. Every slide is in the DOM, readable and focusable. It adds no
dependency. Because `framer-motion` and Lenis stay, the JavaScript budget for everything else is tight.

**Rejected alternative:** `embla-carousel-react`, used in `rafael-goncalves`. It moves the track with
transforms inside an `overflow: hidden` viewport, so without JavaScript only the first slides can be
reached, and its published ESM build is 11.7 KB gzipped before minification. It gives mouse dragging,
looping and autoplay, none of which is in scope. It is the fallback if the cross-browser carousel tests
cannot be made to pass on native scrolling.

Lenis prevents the default of wheel events it handles, which can swallow a horizontal trackpad gesture.
`allowNestedScroll: true` is set for that, and the carousel suite asserts both directions.

### Static hero, portrait fetched with high priority

**Choice:** the hero is a Server Component with no entrance animation. The portrait is
`<Image fetchPriority="high" loading="eager">` with `sizes` matching its rendered sizes, and
`images.formats` is `["image/avif", "image/webp"]`. The scroll cue animates with CSS.

**Why:** an entrance that starts hidden delays LCP whether it is driven by JavaScript or by CSS. The
bundled `image.md` deprecates `priority` and says that in most cases `fetchPriority="high"` or
`loading="eager"` should be used instead of `preload`.

**Rejected alternative:** a CSS-only entrance — close in score, but every frame of it delays visual
completeness. `preload` — added only if Lighthouse reports that the LCP image is discovered late.

### `framer-motion` and Lenis stay

**Choice:** both libraries are kept. `MotionProvider` wraps the tree in
`MotionConfig reducedMotion="user"`. Every hidden initial state goes through `MotionSection` or
`AnimatedText`, which carry `data-reveal`, and the layout has
`<noscript><style>[data-reveal]{opacity:1!important;transform:none!important}</style></noscript>`. Lenis
gets `autoRaf`, `anchors` and `allowNestedScroll` — all three exist in the installed 1.3.26
(`node_modules/lenis/dist/lenis.d.ts`), and `respectReducedMotion` is on by default. The CSS
`scroll-behavior: smooth` is removed because it competes with Lenis. The navbar drops its own
`pendingHref` scrolling.

**Why:** the requester's decision. `rafael-goncalves` reached 97 on mobile and 100 on desktop with the
same animation library once its hero was static.

**Rejected alternative:** CSS-only reveals and native scrolling — offered and declined. If the mobile
measurement falls short, `LazyMotion` with `m` components and `domAnimation` loaded asynchronously is
applied, with a before and after in `findings.md`; it was tried and saves 14 KB of script. If that is not
enough, the decision goes back to the requester. Two other steps were on this list and are off it, on
the measurements in `findings.md`: `experimental.inlineCss` costs about a second of simulated LCP, and
loading Lenis when the browser is idle changed nothing.

### The 8-bit skin is an attribute and CSS

**Choice:** `data-skin="8bit"` on `<html>`, stored in `localStorage`. An inline script in `<head>` sets it
before the first paint, as `preventing-flash-before-hydration.md` shows for themes. `src/lib/skin.ts`
exposes the value through `useSyncExternalStore`. The rules use a Tailwind variant,
`@custom-variant pixel (&:is([data-skin="8bit"] *))`. Pixelify Sans is loaded through `next/font/google`
with `preload: false` and is referenced only by skin rules. The photo and the sprite, and the two
versions of each thumbnail, are both in the markup and CSS shows one; the hidden one is `loading="lazy"`.

**Why:** an attribute set before paint has no flash and causes no hydration mismatch, since React does not
render it. Keeping the skin out of the colour tokens means the contrast contract is proved once per
theme instead of once per theme and skin. A font that no rendered rule references is not downloaded, so
the normal skin pays nothing for it.

**Rejected alternative:** a third and fourth theme in next-themes — it has one dimension, and the skin
must combine with light and dark. Rendering the two image versions from React state — the skin is known
only on the client, so the server HTML would be wrong for returning 8-bit visitors.

### The 8-bit skin is entered through an Easter egg

**Choice:** nothing in the normal skin names the mode. `SkinEasterEgg`, in the footer of both routes,
is a 24×24 button that shows one 6 px square, with the accessible name of the mode and `aria-pressed`;
it also listens for the Konami code on `keydown`, ignoring keys typed in a form field. Both call
`toggleSkin()` of `src/lib/skin.ts`. `SkinToggle` and `InspectorToggle` are always in the navbar markup
and are displayed by the `pixel` variant, so inside the skin there is an obvious way out and the
Inspector next to it.

**Why:** the requester wants the mode to be found, not offered, and the Inspector to be the reward for
finding it. Two triggers because neither covers everyone: the code needs a keyboard, and the pixel is the
only one a touch screen or a screen reader can use. The pixel is a real button with a name, so being
hidden from a glance does not make it unreachable. Showing the navbar toggles with CSS, from the
attribute the inline script sets before paint, has no flash for a returning visitor and needs no state.

**Rejected alternative:** a pixel that blinks to call attention — blinking that never stops needs a way
to pause it (WCAG 2.2.2), and it makes the mode announced again. Only the Konami code — no way in on a
phone. Five taps on the portrait in place of the pixel — no new element on the page, but no way in for
a screen reader. The last two were offered to the requester and declined.

### The Inspector shows only what it measured

**Choice:** `InspectorToggle` is in the navbar, shown by the `pixel` variant only: the Inspector belongs
to the 8-bit skin, and its state is reset when the skin is left. The panel is `next/dynamic` with `ssr: false`, rendered
through a portal to `body`, non-modal, with `Tabs` from `src/components/ui/tabs.tsx`. Live metrics come
from `web-vitals` (`onLCP`, `onCLS`, `onINP`, `onFCP`, `onTTFB`), imported inside the panel chunk. Weight
and request count come from Resource Timing. Lab scores come from `src/app/data/audit.json`, shown with
their date and commit. The contrast table computes each pair of `palette-contract.ts` from the live CSS
variables with `contrast.ts`.

**Why:** the feature is a claim about engineering quality, so every number must be one the visitor's
browser, or a recorded Lighthouse run, actually produced. Loading it on demand keeps it out of the
measured page load.

**Rejected alternative:** hand-written observers — INP in particular is easy to compute wrongly, and
`web-vitals` is the reference implementation. A modal dialog — the overlays point at the page, which must
stay readable and scrollable behind the panel.

### Colour tokens with a tested contract

**Choice:** the tokens of the table in `spec.md` are CSS variables in `globals.css`, exposed to Tailwind
as `paper`, `surface`, `ink`, `ink-muted`, `brand`, `brand-hover`, `on-brand`, `line`, `line-strong`
and `danger`. The shadcn variables point at them. `palette-contract.ts` lists
each pair with its minimum, and both the `palette` suite and the Inspector read that list.

**Why:** one name per role removes the 32 literals and the 59 `dark:` pairs, and a contract that is
computed from the rendered variables cannot drift from the stylesheet.

**Rejected alternative:** keeping `#16a34a` and darkening it only where it fails — two greens with no
rule for choosing between them. Declaring the palette in TypeScript and generating the CSS — a build step
for nine values.

### The sprite is the supplied art snapped to its grid, shipped as an indexed PNG

**Choice:** the source is `scripts/assets/portrait-art.jpeg`, the pixel art the requester supplied: a
1024×1024 generated image whose "pixels" are uneven JPEG blocks. `scripts/pixel-assets.mjs` takes one
colour per cell of a 92×92 grid (the median of the middle half of the cell), removes the flat
background by a flood fill from the corners, makes the sticker outline pure white and reduces the rest
to at most 30 colours. `sharp` then writes `public/avatar/avatar.png`, the favicon, `icon.png`,
`apple-icon.png`, the manifest icons, a 5× render for the Open Graph image and the quantised 8-bit
thumbnails. The site shows the sprite with `unoptimized` and `image-rendering: pixelated` at 138, 276 and
368 CSS px, on a tile of the `brand` colour; the icons and the Open Graph image, which have no theme,
use the light value, `#137a3a`. The mini sprite on the toggle is inline SVG in the colours of the sprite. The requester
approves a contact sheet (photo, art, sprite at 1×, 4× and 8× on both themes) before the branch is
merged.

**Why:** every derived file comes from one source through one script, so new art replaces them all in
one run and a second run is byte-identical. A 92×92 indexed PNG is about 1 KB, while the image optimiser
would re-encode it to a lossy format and blur the pixel edges. The palette is reduced in the script
because `sharp` cannot cap one at 32 colours (see `findings.md`), and by merging colours within a
distance of the most frequent ones because a split by population spends the palette on the JPEG noise
of the large flat areas.

**Rejected alternative:** the whole sprite as inline SVG — thousands of rectangles in the HTML. An
algorithmic pixelation of the photo — offered and declined. A portrait drawn by the script from shapes
on the grid — it was the first draft (commit `dab9e0e`, removed with the arrival of the art): the
requester answered it with art of his own, and keeping a drawing that can no longer run would be dead
code.

### One source for content and metadata

**Choice:** `site.ts` feeds the sections and every metadata output. JSON-LD is one
`<script type="application/ld+json">` with a `Graph` typed by `schema-dts` and `<` escaped as
`json-ld.md` recommends. `/llms.txt` is a static route handler. The root layout no longer sets a
canonical; each page sets its own. `/email-signature` becomes a server `page.tsx` with metadata that
renders the client `SignatureForm`.

**Why:** the email mismatch and the stale `llms.txt` both come from facts written in more than one place.
A canonical on the root layout is inherited by every route, which is how `/email-signature` came to point
at the home page.

**Rejected alternative:** keeping `public/llms.txt` and adding a test that compares it with the data — it
detects the drift instead of removing its cause.

### Tests run against the production build

**Choice:** `webServer` runs `npm run build && npx next start -p 3100`. The projects are `chromium`,
`firefox`, `webkit`, `mobile-chrome` (Pixel 7) and `mobile-safari` (iPhone 15). The `stacking`,
`carousel`, `home` and `skin` suites run in all five; the theme and skin matrix of axe runs in Chromium,
the default mode in the others. Screenshots are attached as artifacts, not compared.

**Why:** the bundled Playwright guide recommends testing production code, and the defects in `spec.md`
(hidden hero, wrong stats, missing metadata) only exist in the built HTML. Stacking depends on engine
behaviour, so one engine is not evidence.

**Rejected alternative:** the dev server — faster, but different HTML. Chromium only — WebKit on a phone
is where sticky positioning and the dynamic toolbar are most likely to differ.

### Lighthouse through a script

**Choice:** `scripts/lighthouse.mjs` runs the `lighthouse` 13.5.0 command against `next start`, with
Playwright's Chromium as `CHROME_PATH`, five runs per preset, and reports the median. The build is served
through a proxy that delays every response by 40 ms (`--latency`). It exits non-zero below 95, or below
the value of `--min`. With `--write` it stores the medians, the date and the commit in `audit.json`,
formatted with Prettier. The workflow uses `--min=90`.

**Why:** `@lhci/cli` 0.15.1 bundles Lighthouse 12.6.1; the direct package is the current version. The
same script feeds the Inspector. Shared CI runners vary by a few points, so the workflow guards against
regressions and the acceptance is the local run plus PageSpeed Insights.

The latency is there because the raw localhost cannot be trusted: with no round trip the scripts arrive
before the first frame, the first paint lands before or after hydration by chance, and the simulated
mobile LCP flips between two values 500 ms apart. That already led to one wrong decision, recorded in
`findings.md`. With 40 ms, five runs agree to within 4 ms.

**Rejected alternative:** the PageSpeed Insights API as the gate — its anonymous quota was exhausted on
the day this spec was written. Lighthouse's own applied throttling (`--throttling-method=devtools`) — it
removes the flip too, but it is not the method PageSpeed Insights scores with.

### Dependencies taken from `rafael-goncalves`, and the ones left out

| Package                                           | Decision    | Why                                                                                    |
| ------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `@playwright/test` 1.63.0                         | adopt, dev  | the requested test runner                                                              |
| `@axe-core/playwright` 4.13.0                     | adopt, dev  | WCAG checks inside the same suite                                                      |
| `schema-dts` 2.1.0                                | adopt, dev  | types for JSON-LD; named by the bundled `json-ld.md`                                   |
| `prettier-plugin-tailwindcss` 0.8.1               | adopt, dev  | deterministic class order; applied in a formatting-only commit                         |
| `embla-carousel-react`, `embla-carousel-autoplay` | not adopted | see "Carousels on native scroll snap"                                                  |
| `motion` 14.0.0                                   | not adopted | published in lockstep with `framer-motion` 14.0.0, which is installed; a rename only   |
| `@next/third-parties`                             | not adopted | used there for Google Tag Manager; this site has no third-party script                 |
| `radix-ui`, `shadcn`                              | not adopted | only `Card` and `Tabs` are used, and `@radix-ui/react-tabs` is already installed       |
| `server-only`                                     | not adopted | it guards modules that must not reach the client; the data files are shared on purpose |

Added and not in that project: `web-vitals` 6.2.2 (Inspector), `lighthouse` 13.5.0 (measurement) and
`sharp` 0.35.5, which Next already installs and the asset script imports directly, so it is declared.
Removed: `tw-animate-css`. Every new entry is an exact pin, installed with an explicit version.

## Known risks

| Risk                                                                                          | How it shows up                                                        | Mitigation                                                                                                              |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Performance ≥ 95 on mobile is not reached with `framer-motion` and Lenis                      | `npm run audit` reports a mobile median below 95                       | measured at the end of every phase; the ordered steps under "`framer-motion` and Lenis stay"; then a requester decision |
| The stack hides content or focus                                                              | the `stacking` suite fails; a focused element is covered               | measured `top`; no pinning without a height; the focus correction; hit-tests in three engines                           |
| iOS Safari treats sticky or the toolbar differently from Playwright's WebKit                  | a panel jumps or is cut on a real iPhone                               | `svh` units; the `mobile-safari` project; a check on the requester's device before merge                                |
| Lenis swallows horizontal gestures over a carousel                                            | the wheel test of the `carousel` suite fails                           | `allowNestedScroll`; if it is not enough, embla                                                                         |
| Lenis `anchors` and the browser's fragment jump both act on a click                           | a visible jump before the smooth scroll                                | the `home` suite and a manual check; otherwise `preventDefault`, `lenis.scrollTo` and `history.pushState`               |
| The sprite is not a convincing likeness                                                       | the requester rejects the contact sheet                                | approval before it is wired in; art supplied by the requester through the same export                                   |
| The 8-bit skin doubles the interface surface                                                  | a contrast or layout failure in one mode only                          | the same colour tokens; axe and the palette suite in the four modes                                                     |
| Pixelify Sans lacks a pt-BR glyph                                                             | a fallback glyph in an 8-bit heading                                   | a screenshot of `ÁÉÍÓÚÂÊÔÃÕÇ áéíóúâêôãõç` in phase 5; otherwise another pixel font from `next/font/google`              |
| An engine fetches a lazy image inside `display: none`                                         | the normal skin requests the sprite or the 8-bit thumbnails            | the `skin` suite asserts the requests; otherwise the hidden version is rendered after hydration                         |
| `backdrop-filter` on the navbar repositions a `fixed` descendant (seen in `rafael-goncalves`) | the Inspector panel is placed relative to the navbar                   | the panel and the overlays are rendered through a portal to `body`                                                      |
| `tailwind-merge` drops custom font-size tokens (seen in `rafael-goncalves`)                   | a heading renders at body size                                         | no custom `--text-*` token is added; if one is, it is registered in `cn`                                                |
| Lighthouse varies between runs                                                                | the workflow fails on an unchanged commit, or a median hides two modes | 40 ms of latency per response; median of five runs; every run is printed; a workflow threshold of 90                    |
| The branch lives long                                                                         | conflicts, or a large review                                           | every phase ends with a green gate and a publishable site, so it can be merged phase by phase                           |

## Failing safely

- **Stack.** Without a measured height the `top` fallback never sticks, so the page scrolls normally.
  Under `prefers-reduced-motion: reduce` no sticky rule applies at all.
- **Inspector.** It never shows a number it did not measure. A metric the browser does not report is
  labelled "não suportado neste navegador". The lab scores are hidden when `audit.json` has no data, and
  are always shown with their date and commit.
- **Skin.** If `localStorage` is unavailable the site stays in the normal skin, and the toggle works for
  the current page view.
- **Asset script.** It writes only to `public/avatar/`, `public/thumbnails/8bit/` and the icon files in
  `src/app/`, and it deletes nothing.
- **Deletions** are limited to the three files named in "Files affected". `thumbnail-pet-na-porta.png`
  is left alone.
- **Lighthouse script.** Without `--write` it only reports. It never lowers its own threshold.
- **Dependencies.** A peer conflict is never resolved with `--force` or `--legacy-peer-deps`; the package
  is not adopted and the error goes to `.specs/BACKLOG.md`, as `CLAUDE.md` requires.
