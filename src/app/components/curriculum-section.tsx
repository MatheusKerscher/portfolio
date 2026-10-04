import { formatPeriod, timeline } from "../data/curriculum";
import { getDictionary } from "../data/dictionaries/server";
import { headingId } from "../data/site";
import { Carousel, CarouselItem } from "./carousel";
import MotionSection from "./motion-section";

export default async function CurriculumSection() {
  const copy = (await getDictionary()).curriculum;

  return (
    <section
      data-stack-panel
      aria-labelledby={headingId("experience")}
      className="stack-panel flex flex-col justify-center px-6 py-(--panel-pad) lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <MotionSection>
          <p className="section-label">{copy.label}</p>
        </MotionSection>

        <MotionSection delay={0.1}>
          <Carousel
            id="carousel-experience"
            label={copy.carousel}
            itemWidth="min(80vw, 24rem)"
            header={
              <h2 id={headingId("experience")} className="section-heading">
                {copy.heading}
              </h2>
            }
          >
            {timeline.map((item) => (
              <CarouselItem key={item.id}>
                <article className="slide-card gap-3 p-6 max-lg:items-center max-lg:text-center">
                  <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs max-lg:justify-center">
                    <span className="bg-ink px-2 py-0.5 font-semibold tracking-widest text-paper uppercase">
                      {copy.kinds[item.kind]}
                    </span>
                    <time
                      dateTime={
                        item.endDate
                          ? `${item.startDate}/${item.endDate}`
                          : item.startDate
                      }
                      className="font-medium text-ink-muted"
                    >
                      {formatPeriod(item, copy)}
                    </time>
                  </p>
                  <h3
                    className="text-lg leading-tight font-bold text-ink"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {copy.items[item.id].title}
                  </h3>
                  <p className="text-sm font-semibold text-brand">
                    {item.organization}
                  </p>
                  <p className="text-sm leading-relaxed text-ink-muted max-lg:text-phone-card max-lg:text-pretty">
                    {copy.items[item.id].description}
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
