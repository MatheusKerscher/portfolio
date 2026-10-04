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
            <dl className="flex gap-10">
              {stats.map((stat) => (
                <div key={stat.id} className="flex flex-col-reverse gap-1">
                  <dt className="text-xs tracking-widest text-ink-muted uppercase">
                    {about.stats[stat.id]}
                  </dt>
                  <dd
                    className="leading-none font-bold text-ink"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(2rem, 4vw, 3rem)",
                    }}
                  >
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </dd>
                </div>
              ))}
            </dl>

            <div className="space-y-(--panel-gap-sm)">
              <p className="text-lg leading-relaxed text-ink-muted">
                {about.bio}
              </p>

              <ul
                aria-label={about.socials}
                className="nav-links-group flex flex-wrap gap-x-6 gap-y-3"
              >
                {socials.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-6 items-center gap-2 text-ink-muted hover:text-brand"
                      style={{
                        transition:
                          "color 0.3s var(--ease-cubic), opacity 0.3s var(--ease-cubic)",
                      }}
                    >
                      <SocialIcon id={link.id} />
                      <span className="text-sm">{link.handle}</span>
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
              header={
                <h3 className="text-xs font-semibold tracking-widest text-ink-muted uppercase">
                  {about.technologies}
                </h3>
              }
            >
              {technologies.map((technology) => (
                <CarouselItem key={technology.id} className="w-52">
                  <div className="slide-card gap-3 p-5">
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
                    <p className="text-sm leading-relaxed text-ink-muted">
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
