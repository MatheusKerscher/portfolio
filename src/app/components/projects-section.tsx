import { projects } from "../data/projects";
import { projectsCopy } from "../data/site";
import MotionSection from "./motion-section";
import ProjectCard from "./project-card";

export default function ProjectsSection() {
  return (
    <section
      id="projetos"
      aria-labelledby="projetos-heading"
      className="border-t border-line px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <MotionSection>
          <p className="section-label">{projectsCopy.label}</p>
        </MotionSection>

        <MotionSection
          delay={0.1}
          className="mb-12 flex items-end justify-between gap-8"
        >
          <h2 id="projetos-heading" className="section-heading">
            {projectsCopy.heading}
          </h2>
          <span className="mb-1 shrink-0 text-sm text-ink-muted">
            {projectsCopy.count(projects.length)}
          </span>
        </MotionSection>

        <div className="border-t border-line">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} {...project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
