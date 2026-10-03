import { ArrowRight } from "lucide-react";
import { contactCopy, layoutCopy, site, socials } from "../data/site";
import MotionSection from "./motion-section";
import { SocialIcon } from "./social-icons";

export default function ContactSection() {
  return (
    <section
      id="contato"
      aria-labelledby="contato-heading"
      className="border-t border-line px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <MotionSection>
          <p className="section-label">{contactCopy.label}</p>
        </MotionSection>

        <div className="max-w-2xl">
          <MotionSection delay={0.1}>
            <h2
              id="contato-heading"
              className="mb-8 leading-tight font-bold text-ink"
              style={{
                fontFamily: "var(--font-syne), sans-serif",
                fontSize: "clamp(2rem, 5vw, 4rem)",
                letterSpacing: "-0.02em",
              }}
            >
              {contactCopy.heading}
            </h2>
          </MotionSection>

          <MotionSection delay={0.2}>
            <p className="mb-10 text-lg leading-relaxed text-ink-muted">
              {contactCopy.text}
            </p>
          </MotionSection>

          <MotionSection delay={0.3}>
            <a
              href={`mailto:${site.email}`}
              className="group mb-12 flex w-fit items-center gap-3"
            >
              <span
                className="font-bold text-ink group-hover:text-brand"
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
                  transition: "color 0.3s var(--ease-cubic)",
                }}
              >
                {site.email}
              </span>
              <ArrowRight
                size={20}
                aria-hidden="true"
                className="-translate-x-2 text-brand opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                style={{
                  transition:
                    "opacity 0.3s var(--ease-cubic), transform 0.4s var(--ease-expo)",
                }}
              />
            </a>
          </MotionSection>

          <MotionSection delay={0.4} className="border-t border-line pt-8">
            <div className="flex items-center gap-6">
              {socials
                .filter((link) => link.id !== "email")
                .map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ink-muted hover:text-brand"
                    style={{ transition: "color 0.3s var(--ease-cubic)" }}
                    aria-label={layoutCopy.profileOf(link.name)}
                  >
                    <SocialIcon id={link.id} size={20} />
                    <span className="text-sm font-medium">{link.name}</span>
                  </a>
                ))}
            </div>
          </MotionSection>
        </div>
      </div>
    </section>
  );
}
