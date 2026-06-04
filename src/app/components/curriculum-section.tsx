import { experience, education, TimelineItem } from "../data/curriculum";
import MotionSection from "./motion-section";

function TimelineEntry({ item, index }: { item: TimelineItem; index: number }) {
  return (
    <MotionSection delay={index * 0.1}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-8 py-8 border-b border-border last:border-0">
        <div className="md:col-span-1">
          <time
            dateTime={
              item.endDate
                ? `${item.startDate}/${item.endDate}`
                : item.startDate
            }
            className="text-sm text-gray dark:text-neutral-400 font-medium"
          >
            {item.period}
          </time>
        </div>
        <div className="md:col-span-3 space-y-1">
          <h3
            className="font-bold text-lg text-black dark:text-white leading-tight"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            {item.title}
          </h3>
          <p className="text-[#16a34a] text-sm font-semibold">
            {item.organization}
          </p>
          <p className="text-gray dark:text-neutral-400 text-sm leading-relaxed mt-2">
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
      className="py-24 px-6 lg:px-8 border-t border-border"
    >
      <div className="max-w-6xl mx-auto">
        <MotionSection>
          <p className="section-label">03 — Currículo</p>
        </MotionSection>

        <MotionSection delay={0.1}>
          <h2 className="section-heading mb-16">Experiência & Formação.</h2>
        </MotionSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <MotionSection delay={0.15}>
              <h3 className="text-xs font-semibold tracking-widest uppercase text-gray dark:text-neutral-400 mb-2">
                Experiência
              </h3>
              <div className="w-8 h-0.5 bg-[#16a34a] mb-6" />
            </MotionSection>

            <div>
              {experience.length > 0 ? (
                experience.map((item, i) => (
                  <TimelineEntry key={i} item={item} index={i} />
                ))
              ) : (
                <MotionSection delay={0.2}>
                  <p className="text-gray dark:text-neutral-400 text-sm py-8 border-b border-border">
                    Em breve...
                  </p>
                </MotionSection>
              )}
            </div>
          </div>

          <div>
            <MotionSection delay={0.15}>
              <h3 className="text-xs font-semibold tracking-widest uppercase text-gray dark:text-neutral-400 mb-2">
                Formação
              </h3>
              <div className="w-8 h-0.5 bg-[#16a34a] mb-6" />
            </MotionSection>

            <div>
              {education.length > 0 ? (
                education.map((item, i) => (
                  <TimelineEntry key={i} item={item} index={i} />
                ))
              ) : (
                <MotionSection delay={0.2}>
                  <p className="text-gray dark:text-neutral-400 text-sm py-8 border-b border-border">
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
