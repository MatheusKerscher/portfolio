# Lighthouse on the raw localhost is not a measurement

Verified on 2026-10-03 with Lighthouse 13.5.0, Playwright's Chromium (build 1243), Next.js 16.3.8, on
macOS, against `next build && next start`. From the work in
the `findings.md` of the `2026-10-03_layout-redesign` spec.

## The mobile score flips between two values

With no added latency, identical runs of one build fall into two groups about 500 ms of simulated LCP
apart.

- **Evidence:** five consecutive runs of one build gave 2409, 2406, 2983, 2983 and 2982 ms. Two runs of
  another build loaded the same 24 requests (331.6 KB); the run whose first paint came at 35 ms scored 96
  (simulated LCP 2706 ms) and the run whose first paint came at 55 ms scored 93 (3212 ms).
- **Cause:** Lighthouse's simulation treats what ran before the observed first paint as render-blocking.
  On localhost every script arrives within about 20 ms, so whether the first frame is produced before or
  after hydration is decided by a few milliseconds of scheduling.
- **Consequence:** the median of five raw runs moves by three or four points between two runs of the
  same build, and a conclusion drawn from it is not reliable.

## The audit adds latency

`npm run audit` serves the build through a proxy that delays every response, 40 ms by default
(`--latency`).

- **Evidence:** with it, five runs of one build differ by at most 4 ms of simulated LCP (1584 to
  1588 ms), and the mobile score is the same in all five.

## `experimental.inlineCss` makes this site slower

- **Evidence:** the same build, with and without it. At 15 ms of latency: 97, 97, 97 with it and 100,
  100, 100 without. At 40 ms: 97 in five runs with it (simulated LCP 2633 to 2635 ms) and 100 in five
  runs without (1584 to 1588 ms). At 100 ms: 99, 96, 96 with it and 100, 100, 100 without. The document
  grows to 43.8 KB gzipped, because the stylesheet is inlined in a `<style>` and again in the RSC payload.
- It had been turned on after a raw-localhost median went from 93 to 96. Both builds had the same two
  modes; the median had only landed on the other one.
- **Not verified:** the reason. A likely one is that Chrome holds back low-priority script requests while
  a stylesheet request is in flight, so with a separate stylesheet the scripts are evaluated after the
  first paint.

## What the other optimisations were worth

Measured on the raw localhost, in its slow mode, and not applied, since the site scores 100 without them.

- `LazyMotion` with `m` components: 14 KB less script transferred (203.1 to 189.2 KB) and about 150 ms
  less simulated LCP (3210 to 3061 ms).
- Lenis loaded by a dynamic import when idle: no measurable change (3061 to 3060 ms).
- `content-visibility: auto` on the carousels: 5 fewer image requests during the load (30 to 25) and about
  100 ms (3287 to 3210 ms).
