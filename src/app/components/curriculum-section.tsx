import { education, experience, type TimelineItem } from "../data/curriculum";
import { curriculumCopy } from "../data/site";
import MotionSection from "./motion-section";

function TimelineEntry({ item, index }: { item: TimelineItem; index: number }) {
  return (
    <MotionSection delay={index * 0.1}>
      <div className="grid grid-cols-1 gap-2 border-b border-line py-8 last:border-0 md:grid-cols-4 md:gap-8">
        <div className="md:col-span-1">
          <time
            dateTime={
              item.endDate
                ? `${item.startDate}/${item.endDate}`
                : item.startDate
            }
            className="text-sm font-medium text-ink-muted"
          >
            {item.period}
          </time>
        </div>
        <div className="space-y-1 md:col-span-3">
          <h4
            className="text-lg leading-tight font-bold text-ink"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            {item.title}
          </h4>
          <p className="text-sm font-semibold text-brand">
            {item.organization}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {item.description}
          </p>
        </div>
      </div>
    </MotionSection>
  );
}

function Timeline({ title, items }: { title: string; items: TimelineItem[] }) {
  return (
    <div>
      <MotionSection delay={0.15}>
        <h3 className="mb-2 text-xs font-semibold tracking-widest text-ink-muted uppercase">
          {title}
        </h3>
        <div aria-hidden="true" className="mb-6 h-0.5 w-8 bg-brand" />
      </MotionSection>

      <div>
        {items.length > 0 ? (
          items.map((item, i) => (
            <TimelineEntry key={item.title} item={item} index={i} />
          ))
        ) : (
          <MotionSection delay={0.2}>
            <p className="border-b border-line py-8 text-sm text-ink-muted">
              {curriculumCopy.empty}
            </p>
          </MotionSection>
        )}
      </div>
    </div>
  );
}

export default function CurriculumSection() {
  return (
    <section
      id="curriculo"
      aria-labelledby="curriculo-heading"
      className="border-t border-line px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <MotionSection>
          <p className="section-label">{curriculumCopy.label}</p>
        </MotionSection>

        <MotionSection delay={0.1}>
          <h2 id="curriculo-heading" className="section-heading mb-16">
            {curriculumCopy.heading}
          </h2>
        </MotionSection>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <Timeline title={curriculumCopy.experience} items={experience} />
          <Timeline title={curriculumCopy.education} items={education} />
        </div>
      </div>
    </section>
  );
}
