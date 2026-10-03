import { aboutCopy, socials, stats, technologies } from "../data/site";
import AnimatedText from "./animated-text";
import CountUp from "./count-up";
import MotionSection from "./motion-section";
import { SocialIcon } from "./social-icons";
import TechnologyIcons from "./technology-icons";

export default function AboutSection() {
  return (
    <section
      id="sobre"
      aria-labelledby="sobre-heading"
      className="border-t border-line px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <MotionSection>
          <p className="section-label">{aboutCopy.label}</p>
        </MotionSection>

        <div className="mt-2 space-y-8">
          <AnimatedText
            as="h2"
            delay={0.1}
            stagger={0.04}
            className="section-heading"
            id="sobre-heading"
          >
            {aboutCopy.heading}
          </AnimatedText>

          <MotionSection delay={0.2}>
            <dl className="flex gap-10 border-y border-line py-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col-reverse gap-1 text-center lg:text-left"
                >
                  <dt className="text-xs tracking-widest text-ink-muted uppercase">
                    {stat.label}
                  </dt>
                  <dd
                    className="leading-none font-bold text-ink"
                    style={{
                      fontFamily: "var(--font-syne), sans-serif",
                      fontSize: "clamp(2rem, 4vw, 3rem)",
                    }}
                  >
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          </MotionSection>

          <MotionSection delay={0.3}>
            <p className="text-lg leading-relaxed text-ink-muted">
              {aboutCopy.bio}
            </p>
          </MotionSection>

          <MotionSection delay={0.4}>
            <ul className="nav-links-group flex flex-col gap-2">
              {socials.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-fit items-center gap-3 text-ink-muted hover:text-brand"
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
          </MotionSection>

          <MotionSection delay={0.5}>
            <p className="mb-4 text-xs font-semibold tracking-widest text-ink-muted uppercase">
              {aboutCopy.technologies}
            </p>
            <TechnologyIcons items={technologies} />
          </MotionSection>
        </div>
      </div>
    </section>
  );
}
