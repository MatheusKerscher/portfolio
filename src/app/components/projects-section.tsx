import { getDictionary } from "../data/dictionaries/server";
import { projects } from "../data/projects";
import { headingId } from "../data/site";
import { Carousel, CarouselItem } from "./carousel";
import MotionSection from "./motion-section";
import ProjectCard from "./project-card";

export default async function ProjectsSection() {
  const copy = (await getDictionary()).projects;

  return (
    <section
      data-stack-panel
      aria-labelledby={headingId("projects")}
      className="stack-panel flex flex-col justify-center px-6 py-(--panel-pad) lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <MotionSection>
          <p className="section-label">{copy.label}</p>
        </MotionSection>

        <MotionSection delay={0.1}>
          <Carousel
            id="carousel-projects"
            label={copy.carousel}
            header={
              <>
                <h2 id={headingId("projects")} className="section-heading">
                  {copy.heading}
                </h2>
                <p className="mt-3 text-sm text-ink-muted">
                  {copy.count(projects.length)}
                </p>
              </>
            }
          >
            {projects.map((project, index) => (
              <CarouselItem key={project.id} className="w-[min(85vw,26rem)]">
                <ProjectCard project={project} index={index} />
              </CarouselItem>
            ))}
          </Carousel>
        </MotionSection>
      </div>
    </section>
  );
}
