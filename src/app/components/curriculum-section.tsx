import { timeline } from "../data/curriculum";
import { curriculumCopy } from "../data/site";
import { Carousel, CarouselItem } from "./carousel";
import MotionSection from "./motion-section";

export default function CurriculumSection() {
  return (
    <section
      data-stack-panel
      aria-labelledby="curriculo-heading"
      className="stack-panel flex flex-col justify-center px-6 py-16 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <MotionSection>
          <p className="section-label">{curriculumCopy.label}</p>
        </MotionSection>

        <MotionSection delay={0.1}>
          <Carousel
            id="carrossel-curriculo"
            label={curriculumCopy.carousel}
            header={
              <h2 id="curriculo-heading" className="section-heading">
                {curriculumCopy.heading}
              </h2>
            }
          >
            {timeline.map((item) => (
              <CarouselItem key={item.title} className="w-[min(85vw,24rem)]">
                <article className="slide-card gap-3 p-6">
                  <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs">
                    <span className="bg-ink px-2 py-0.5 font-semibold tracking-widest text-paper uppercase">
                      {curriculumCopy.kinds[item.kind]}
                    </span>
                    <time
                      dateTime={
                        item.endDate
                          ? `${item.startDate}/${item.endDate}`
                          : item.startDate
                      }
                      className="font-medium text-ink-muted"
                    >
                      {item.period}
                    </time>
                  </p>
                  <h3
                    className="text-lg leading-tight font-bold text-ink"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm font-semibold text-brand">
                    {item.organization}
                  </p>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    {item.description}
                  </p>
                </article>
              </CarouselItem>
            ))}
          </Carousel>
        </MotionSection>
      </div>
    </section>
  );
}
