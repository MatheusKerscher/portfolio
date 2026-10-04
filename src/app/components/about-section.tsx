import Image from "next/image";
import { getDictionary } from "../data/dictionaries/server";
import { headingId, socials, stats, technologies } from "../data/site";
import AnimatedText from "./animated-text";
import { Carousel, CarouselItem } from "./carousel";
import CountUp from "./count-up";
import MotionSection from "./motion-section";
import { SocialIcon } from "./social-icons";

export default async function AboutSection() {
  const dict = await getDictionary();
  const { about } = dict;

  return (
    <section
      data-stack-panel
      aria-labelledby={headingId("about")}
      className="stack-panel flex flex-col justify-center px-6 py-(--panel-pad) lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <MotionSection>
          <p className="section-label">{about.label}</p>
        </MotionSection>

        <div className="mt-2 space-y-(--panel-gap)">
          <AnimatedText
            as="h2"
            id={headingId("about")}
            delay={0.1}
            stagger={0.04}
            className="section-heading"
          >
            {about.heading}
          </AnimatedText>

          <MotionSection
            delay={0.2}
            className="grid gap-8 border-y border-line py-(--panel-gap-md) lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16"
          >
            <dl className="flex gap-10 max-lg:justify-center max-lg:gap-12">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="flex flex-col-reverse gap-1 max-lg:items-center"
                >
                  <dt className="text-xs tracking-widest text-ink-muted uppercase">
                    {about.stats[stat.id]}
                  </dt>
                  <dd
                    className="leading-none font-bold text-ink"
                    style={{
                      fontFamily: "var(--font-display)",
                      // The minimum is reached below `lg` only.
                      fontSize: "clamp(2.5rem, 4vw, 3rem)",
                    }}
                  >
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </dd>
                </div>
              ))}
            </dl>

            <div className="space-y-(--panel-gap-sm)">
              <p className="text-lg leading-relaxed text-ink-muted max-lg:mx-auto max-lg:max-w-prose max-lg:text-center max-lg:text-pretty max-sm:text-phone-copy">
                {about.bio}
              </p>

              <ul
                aria-label={about.socials}
                className="nav-links-group flex flex-wrap gap-x-6 gap-y-3 max-lg:justify-center max-sm:gap-x-2"
              >
                {socials.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      // On a phone the handles would wrap into uneven rows: the icon is the link,
                      // a 44 px target, and the handle stays its accessible name.
                      className="flex min-h-6 items-center gap-2 text-ink-muted hover:text-brand max-lg:min-h-11 max-sm:min-w-11 max-sm:justify-center max-sm:[&>svg]:size-6"
                      style={{
                        transition:
                          "color 0.3s var(--ease-cubic), opacity 0.3s var(--ease-cubic)",
                      }}
                      title={link.name}
                    >
                      <SocialIcon id={link.id} />
                      <span className="text-sm max-sm:sr-only">
                        {link.handle}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </MotionSection>

          <MotionSection delay={0.3}>
            <Carousel
              id="carousel-stacks"
              label={about.technologies}
              itemWidth="13rem"
              header={
                <h3 className="text-xs font-semibold tracking-widest text-ink-muted uppercase max-lg:text-center">
                  {about.technologies}
                </h3>
              }
            >
              {technologies.map((technology) => (
                <CarouselItem key={technology.id}>
                  <div className="slide-card gap-3 p-5 max-lg:items-center max-lg:text-center">
                    <span className="flex h-11 w-11 items-center justify-center border border-line bg-paper">
                      <Image
                        src={technology.icon}
                        alt=""
                        width={24}
                        height={24}
                      />
                    </span>
                    <p
                      className="font-bold text-ink"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {technology.name}
                    </p>
                    <p className="text-sm leading-relaxed text-ink-muted max-lg:text-phone-card max-lg:text-balance">
                      {dict.technologies[technology.id]}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </Carousel>
          </MotionSection>
        </div>
      </div>
    </section>
  );
}
