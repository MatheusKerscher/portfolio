import { heroCopy } from "../data/site";

/**
 * Static on purpose: the `h1` is the Largest Contentful Paint element, and an entrance animation
 * that starts hidden would delay it until the client bundle has run.
 */
export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-center overflow-hidden px-6 pt-16 lg:px-8"
    >
      <div className="max-w-4xl">
        <div aria-hidden="true" className="mb-8 h-0.5 w-16 bg-brand" />

        <p className="mb-6 text-sm font-semibold tracking-widest text-brand uppercase">
          {heroCopy.eyebrow}
        </p>

        <h1
          id="hero-heading"
          className="mb-6 leading-none font-bold text-ink"
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: "clamp(3rem, 9vw, 7.5rem)",
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

      <div
        aria-hidden="true"
        className="absolute right-6 bottom-10 flex flex-col items-center gap-2 text-ink-muted lg:left-8"
      >
        <span className="mb-2 origin-left translate-x-6 rotate-90 text-xs tracking-widest uppercase">
          {heroCopy.scrollCue}
        </span>
        <div className="scroll-cue-line mt-8 h-10 w-px bg-ink-muted" />
      </div>
    </section>
  );
}
