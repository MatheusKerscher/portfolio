import { experience, education, TimelineItem } from "../data/curriculum";
import MotionSection from "./motion-section";

function TimelineEntry({ item, index }: { item: TimelineItem; index: number }) {
  return (
    <MotionSection delay={index * 0.1}>
      <div className="grid grid-cols-1 gap-2 border-b border-border py-8 last:border-0 md:grid-cols-4 md:gap-8">
        <div className="md:col-span-1">
          <time
            dateTime={
              item.endDate
                ? `${item.startDate}/${item.endDate}`
                : item.startDate
            }
            className="text-sm font-medium text-gray dark:text-neutral-400"
          >
            {item.period}
          </time>
        </div>
        <div className="space-y-1 md:col-span-3">
          <h3
            className="text-lg leading-tight font-bold text-black dark:text-white"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            {item.title}
          </h3>
          <p className="text-sm font-semibold text-[#16a34a]">
            {item.organization}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray dark:text-neutral-400">
            {item.description}
          </p>
        </div>
      </div>
    </MotionSection>
  );
}

export default function CurriculumSection() {
  return (
    <section
      id="curriculo"
      className="border-t border-border px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <MotionSection>
          <p className="section-label">03 — Currículo</p>
        </MotionSection>

        <MotionSection delay={0.1}>
          <h2 className="section-heading mb-16">Experiência & Formação.</h2>
        </MotionSection>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <MotionSection delay={0.15}>
              <h3 className="mb-2 text-xs font-semibold tracking-widest text-gray uppercase dark:text-neutral-400">
                Experiência
              </h3>
              <div className="mb-6 h-0.5 w-8 bg-[#16a34a]" />
            </MotionSection>

            <div>
              {experience.length > 0 ? (
                experience.map((item, i) => (
                  <TimelineEntry key={i} item={item} index={i} />
                ))
              ) : (
                <MotionSection delay={0.2}>
                  <p className="border-b border-border py-8 text-sm text-gray dark:text-neutral-400">
                    Em breve...
                  </p>
                </MotionSection>
              )}
            </div>
          </div>

          <div>
            <MotionSection delay={0.15}>
              <h3 className="mb-2 text-xs font-semibold tracking-widest text-gray uppercase dark:text-neutral-400">
                Formação
              </h3>
              <div className="mb-6 h-0.5 w-8 bg-[#16a34a]" />
            </MotionSection>

            <div>
              {education.length > 0 ? (
                education.map((item, i) => (
                  <TimelineEntry key={i} item={item} index={i} />
                ))
              ) : (
                <MotionSection delay={0.2}>
                  <p className="border-b border-border py-8 text-sm text-gray dark:text-neutral-400">
                    Em breve...
                  </p>
                </MotionSection>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
