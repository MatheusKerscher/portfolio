import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "../data/projects";
import { projectsCopy } from "../data/site";

type ProjectCardProps = Project & { index: number };

export default function ProjectCard({
  title,
  description,
  tags,
  thumbnail,
  repositoryUrl,
  websiteUrl,
  index,
}: ProjectCardProps) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <article className="slide-card group">
      <div className="aspect-5/3 overflow-hidden border-b border-line bg-paper">
        <Image
          src={thumbnail.src}
          alt={projectsCopy.thumbnailAlt(title)}
          width={thumbnail.width}
          height={thumbnail.height}
          sizes="(min-width: 640px) 416px, 85vw"
          className="h-full w-full object-cover object-top"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between text-ink-muted">
          <span
            aria-hidden="true"
            className="text-xs tracking-widest tabular-nums"
          >
            {number}
          </span>
          <ArrowUpRight
            size={18}
            aria-hidden="true"
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
            style={{
              transition:
                "color 0.3s var(--ease-cubic), transform 0.4s var(--ease-expo)",
            }}
          />
        </div>

        <h3
          className="text-lg leading-tight font-bold text-ink md:text-xl"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          {/* The link covers the whole card; the card shows the focus ring. */}
          <a
            href={websiteUrl || repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group-hover:text-brand after:absolute after:inset-0"
            style={{ transition: "color 0.3s var(--ease-cubic)" }}
          >
            {title}
            <span className="sr-only"> {projectsCopy.newTab}</span>
          </a>
        </h3>

        <p className="text-sm leading-relaxed text-ink-muted">{description}</p>

        <ul className="mt-auto flex flex-wrap gap-2 pt-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="border border-line px-2.5 py-0.5 text-xs tracking-wide text-ink-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
