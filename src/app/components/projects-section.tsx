import { projects } from "../data/projects";
import { projectsCopy } from "../data/site";
import { Carousel, CarouselItem } from "./carousel";
import MotionSection from "./motion-section";
import ProjectCard from "./project-card";

export default function ProjectsSection() {
  return (
    <section
      data-stack-panel
      aria-labelledby="projetos-heading"
      className="stack-panel flex flex-col justify-center px-6 py-16 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <MotionSection>
          <p className="section-label">{projectsCopy.label}</p>
        </MotionSection>

        <MotionSection delay={0.1}>
          <Carousel
            id="carrossel-projetos"
            label={projectsCopy.carousel}
            header={
              <>
                <h2 id="projetos-heading" className="section-heading">
                  {projectsCopy.heading}
                </h2>
                <p className="mt-3 text-sm text-ink-muted">
                  {projectsCopy.count(projects.length)}
                </p>
              </>
            }
          >
            {projects.map((project, index) => (
              <CarouselItem key={project.title} className="w-[min(85vw,26rem)]">
                <ProjectCard {...project} index={index} />
              </CarouselItem>
            ))}
          </Carousel>
        </MotionSection>
      </div>
    </section>
  );
}
