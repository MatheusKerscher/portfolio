import { ArrowUpRight } from "lucide-react";
import type { Project } from "../data/projects";
import { projectsCopy } from "../data/site";
import MotionSection from "./motion-section";

type ProjectCardProps = Project & { index?: number };

export default function ProjectCard({
  title,
  description,
  tags,
  repositoryUrl,
  websiteUrl,
  index = 0,
}: ProjectCardProps) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <MotionSection delay={index * 0.08}>
      <a
        href={websiteUrl || repositoryUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={projectsCopy.open(title)}
        className="group -mx-6 flex items-start gap-6 border-b border-line px-6 py-8 hover:bg-ink/5 md:mx-0 md:gap-12 md:px-0"
        style={{ transition: "background-color 0.3s var(--ease-cubic)" }}
      >
        <span
          className="w-5 shrink-0 pt-1 text-xs tracking-widest text-ink-muted tabular-nums group-hover:text-brand"
          style={{
            fontFamily: "var(--font-catamaran), sans-serif",
            transition: "color 0.3s var(--ease-cubic)",
          }}
        >
          {number}
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <h3
            className="text-lg leading-tight font-bold text-ink group-hover:text-brand md:text-xl"
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              transition: "color 0.3s var(--ease-cubic)",
            }}
          >
            {title}
          </h3>

          <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
            {description}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-2.5 py-0.5 text-xs tracking-wide text-ink-muted group-hover:border-brand/40 group-hover:text-brand"
                style={{
                  fontFamily: "var(--font-catamaran), sans-serif",
                  transition:
                    "color 0.3s var(--ease-cubic), border-color 0.3s var(--ease-cubic)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <ArrowUpRight
          size={18}
          aria-hidden="true"
          className="mt-1 shrink-0 text-ink-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
          style={{
            transition:
              "color 0.3s var(--ease-cubic), transform 0.4s var(--ease-expo)",
          }}
        />
      </a>
    </MotionSection>
  );
}
