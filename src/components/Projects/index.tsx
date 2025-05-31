import type { RefObject } from "react";

import { IoLogoGithub } from "react-icons/io";
import { projects } from "./project.data";
import { LuLink } from "react-icons/lu";

type ProjectsProps = {
  elementRef: RefObject<HTMLElement>
}

const Projects = ({elementRef}: ProjectsProps) => {
  return (
    <section ref={elementRef} className="flex flex-col items-center">
      <h2 className="text-green text-3xl md:text-4xl font-bold mb-8">
        Meus projetos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mx-7">
        {projects.map((project) => (
          <div className="p-5 bg-tertiary rounded-xl">
            <div className="flex flex-col justify-between h-full bg-white text-primary p-4 rounded-lg shadow duration-150 hover:shadow-md">
              <img
                src={project.cover}
                alt={project.title}
                className="rounded mb-4 drop-shadow-sm"
              />

              <div>
                <h3 className="font-bold md:text-lg">
                  {project.title}
                </h3>

                <p className="text-justify mt-2 mb-4 text-sm md:text-base">{project.description}</p>

                <div className="flex gap-4 justify-end">
                {project.websiteLink && (
                    <a
                      href={project.websiteLink}
                      target="_blank"
                      rel="noopner noreferrer"
                    >
                      <LuLink size={22} />
                    </a>
                  )}

                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopner noreferrer"
                  >
                    <IoLogoGithub size={22} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="p-5 bg-tertiary rounded-xl flex justify-center items-center">
          <a
            href="https://github.com/MatheusKerscher"
            target="_blank"
            rel="noopner noreferrer"
            className="flex flex-wrap justify-center text-center gap-2 items-center font-medium bg-white text-primary md:text-lg p-3 rounded-xl shadow duration-150 hover:shadow-lg"
          >
            Visualizar todos os meus projetos
            <IoLogoGithub size={26} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Projects;
