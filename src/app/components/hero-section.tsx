import { heroCopy } from "../data/site";
import Portrait from "./portrait";

/**
 * Static on purpose: the `h1` and the portrait are the candidates for Largest Contentful Paint,
 * and an entrance animation that starts hidden would delay them until the client bundle has run.
 */
export default function HeroSection() {
  return (
    <section
      data-stack-panel
      aria-labelledby="hero-heading"
      className="stack-panel flex flex-col justify-center overflow-hidden px-6 pt-8 pb-28 lg:px-8"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        <div className="order-2 lg:order-1">
          <div aria-hidden="true" className="pixel-dots mb-8" />

          <p className="mb-6 text-sm font-semibold tracking-widest text-brand uppercase">
            {heroCopy.eyebrow}
          </p>

          <h1
            id="hero-heading"
            className="mb-6 leading-none font-bold text-ink"
            style={{
              fontFamily: "var(--font-display)",
              // The longest word has to fit a 320 px wide screen and the column next to the portrait.
              // It also gives way on a short, wide viewport: see `--squeeze` in globals.css.
              fontSize:
                "clamp(2.5rem, min(7.5vw + 1rem, 6.5rem - var(--squeeze) * 0.07), 6.5rem)",
              letterSpacing: "-0.03em",
            }}
          >
            {heroCopy.heading}
          </h1>

          <p className="mb-10 max-w-xl text-lg leading-relaxed text-ink-muted md:text-xl">
            {heroCopy.tagline}
          </p>

          <div className="flex flex-wrap gap-4">
            <a href={heroCopy.primaryCta.href} className="btn-accent">
              {heroCopy.primaryCta.label} <span aria-hidden="true">→</span>
            </a>
            <a href={heroCopy.secondaryCta.href} className="btn-outline">
              {heroCopy.secondaryCta.label}
            </a>
          </div>
        </div>

        <Portrait className="order-1 lg:order-2" />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-6 hidden flex-col items-center gap-3 text-ink-muted md:flex"
      >
        <span className="text-xs tracking-widest uppercase">
          {heroCopy.scrollCue}
        </span>
        <div className="h-8">
          <div className="scroll-cue" />
        </div>
      </div>
    </section>
  );
}
