import { getDictionary } from "../data/dictionaries/server";
import { headingId, sections, site } from "../data/site";
import Portrait from "./portrait";

/**
 * Static on purpose: the `h1` and the portrait are the candidates for Largest Contentful Paint,
 * and an entrance animation that starts hidden would delay them until the client bundle has run.
 */
export default async function HeroSection() {
  const { hero } = await getDictionary();

  return (
    <section
      data-stack-panel
      aria-labelledby={headingId("hero")}
      // The bottom padding is the room of the scroll cue, which is shown from `md` up.
      className="stack-panel flex flex-col justify-center overflow-hidden px-6 pt-8 pb-28 max-md:pb-8 lg:px-8"
    >
      {/* Below `lg` it is one centred column, the portrait first. */}
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 max-lg:justify-items-center max-lg:text-center lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        <div className="order-2 lg:order-1">
          <div aria-hidden="true" className="pixel-dots mb-8 max-lg:mx-auto" />

          <p className="mb-6 text-sm font-semibold tracking-widest text-brand uppercase max-lg:text-balance max-sm:text-xs">
            {hero.eyebrow}
          </p>

          <h1
            id={headingId("hero")}
            className="hero-title mb-6 leading-none font-bold text-ink"
          >
            {site.heading}
          </h1>

          <p className="mb-10 max-w-xl text-lg leading-relaxed text-ink-muted max-lg:mx-auto max-lg:text-balance max-sm:text-phone-copy md:text-xl">
            {hero.tagline}
          </p>

          {/* On a phone the two buttons are stacked and share one width. */}
          <div className="flex flex-wrap gap-4 max-lg:justify-center max-sm:mx-auto max-sm:max-w-xs max-sm:flex-col">
            <a
              href={`#${sections.projects}`}
              className="btn-accent max-sm:justify-center"
            >
              {hero.primaryCta} <span aria-hidden="true">→</span>
            </a>
            <a
              href={`#${sections.contact}`}
              className="btn-outline max-sm:justify-center"
            >
              {hero.secondaryCta}
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
          {hero.scrollCue}
        </span>
        <div className="h-8">
          <div className="scroll-cue" />
        </div>
      </div>
    </section>
  );
}
