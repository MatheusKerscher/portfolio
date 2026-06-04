"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type ProjectCardProps = {
  title: string;
  description: string;
  tags: string[];
  repositoryUrl?: string;
  websiteUrl?: string;
  index?: number;
};

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
    <motion.a
      href={websiteUrl || repositoryUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ver projeto ${title} (abre em nova aba)`}
      className="group flex items-start gap-6 md:gap-12 py-8 border-b border-border hover:bg-black/5 dark:hover:bg-white/5 -mx-6 px-6 md:mx-0 md:px-0"
      style={{ transition: "background-color 0.3s var(--ease-cubic)" }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.19, 1, 0.22, 1],
      }}
      viewport={{ once: true, amount: 0 }}
    >
      {/* número */}
      <span
        className="text-xs tracking-widest text-gray dark:text-neutral-400 group-hover:text-[#16a34a] tabular-nums shrink-0 pt-1 w-5"
        style={{
          fontFamily: "var(--font-catamaran), sans-serif",
          transition: "color 0.3s var(--ease-cubic)",
        }}
      >
        {number}
      </span>

      {/* conteúdo */}
      <div className="flex-1 min-w-0 space-y-2">
        <h3
          className="font-bold text-black dark:text-white group-hover:text-[#16a34a] text-lg md:text-xl leading-tight"
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            transition: "color 0.3s var(--ease-cubic)",
          }}
        >
          {title}
        </h3>

        <p className="text-gray dark:text-neutral-400 text-sm leading-relaxed max-w-xl">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs text-gray dark:text-neutral-400 group-hover:text-[#16a34a] border border-[#e5e5e5] dark:border-[#333] group-hover:border-[#16a34a]/40 rounded-full px-2.5 py-0.5 tracking-wide"
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

      {/* seta */}
      <ArrowUpRight
        size={18}
        className="text-gray dark:text-neutral-400 group-hover:text-[#16a34a] shrink-0 mt-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        style={{
          transition:
            "color 0.3s var(--ease-cubic), transform 0.4s var(--ease-expo)",
        }}
      />
    </motion.a>
  );
}
