"use client";

import { motion } from "framer-motion";
import ProjectCard from "./project-card";
import MotionSection from "./motion-section";
import { projects } from "../data/projects";

export default function ProjectsSection() {
  return (
    <section
      id="projetos"
      className="py-24 px-6 lg:px-8 border-t border-border"
    >
      <div className="max-w-6xl mx-auto">
        <MotionSection>
          <p className="section-label">02 — Projetos</p>
        </MotionSection>

        <div className="flex items-end justify-between mb-12 gap-8">
          <motion.h2
            className="section-heading"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.1,
              ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
            }}
            viewport={{ once: true, amount: 0 }}
          >
            Trabalhos selecionados.
          </motion.h2>

          <motion.span
            className="text-sm text-gray shrink-0 mb-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true, amount: 0 }}
          >
            {projects.length} projetos
          </motion.span>
        </div>

        <div className="border-t border-border">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} {...project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
