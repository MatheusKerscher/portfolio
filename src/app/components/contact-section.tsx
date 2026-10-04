import { ArrowRight } from "lucide-react";
import { getDictionary } from "../data/dictionaries/server";
import { headingId, site, socials } from "../data/site";
import MotionSection from "./motion-section";
import { SocialIcon } from "./social-icons";

export default async function ContactSection() {
  const dict = await getDictionary();
  const { contact } = dict;

  return (
    <section
      data-stack-panel
      aria-labelledby={headingId("contact")}
      className="stack-panel flex flex-col justify-center px-6 py-(--panel-pad) lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <MotionSection>
          <p className="section-label">{contact.label}</p>
        </MotionSection>

        <div className="max-w-2xl max-lg:mx-auto max-lg:text-center">
          <MotionSection delay={0.1}>
            <h2
              id={headingId("contact")}
              className="mb-8 leading-tight font-bold text-ink max-lg:text-balance"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 4rem)",
                letterSpacing: "-0.02em",
              }}
            >
              {contact.heading}
            </h2>
          </MotionSection>

          <MotionSection delay={0.2}>
            <p className="mb-10 text-lg leading-relaxed text-ink-muted max-lg:text-pretty max-sm:text-phone-copy">
              {contact.text}
            </p>
          </MotionSection>

          <MotionSection delay={0.3}>
            <a
              href={`mailto:${site.email}`}
              className="group mb-12 flex w-fit items-center gap-3 max-lg:mx-auto max-lg:min-h-11"
            >
              {/* Underlined below `lg`: a touch screen has no hover to reveal the arrow. */}
              <span
                className="font-bold break-all text-ink group-hover:text-brand max-lg:underline max-lg:decoration-brand max-lg:decoration-2 max-lg:underline-offset-4"
                style={{
                  fontFamily: "var(--font-display)",
                  // One line down to a 320 px wide screen; from `lg` up it is 2.5vw, capped.
                  fontSize:
                    "clamp(0.875rem, max(2.5vw, min(4.6vw, 1.125rem)), 1.4rem)",
                  transition: "color 0.3s var(--ease-cubic)",
                }}
              >
                {site.email}
              </span>
              <ArrowRight
                size={20}
                aria-hidden="true"
                className="-translate-x-2 text-brand opacity-0 group-hover:translate-x-0 group-hover:opacity-100 max-lg:hidden"
                style={{
                  transition:
                    "opacity 0.3s var(--ease-cubic), transform 0.4s var(--ease-expo)",
                }}
              />
            </a>
          </MotionSection>

          <MotionSection delay={0.4} className="border-t border-line pt-8">
            {/* The narrower gap keeps the three of them on one row at 320 px. */}
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 max-lg:justify-center max-sm:gap-x-4">
              {socials
                .filter((link) => link.id !== "email")
                .map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-6 items-center gap-2 text-ink-muted hover:text-brand max-lg:min-h-11"
                      style={{ transition: "color 0.3s var(--ease-cubic)" }}
                      aria-label={dict.layout.profileOf(link.name)}
                    >
                      <SocialIcon id={link.id} size={20} />
                      <span className="text-sm font-medium">{link.name}</span>
                    </a>
                  </li>
                ))}
            </ul>
          </MotionSection>
        </div>
      </div>
    </section>
  );
}
