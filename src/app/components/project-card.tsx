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
      className="group -mx-6 flex items-start gap-6 border-b border-border px-6 py-8 hover:bg-black/5 md:mx-0 md:gap-12 md:px-0 dark:hover:bg-white/5"
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
        className="w-5 shrink-0 pt-1 text-xs tracking-widest text-gray tabular-nums group-hover:text-[#16a34a] dark:text-neutral-400"
        style={{
          fontFamily: "var(--font-catamaran), sans-serif",
          transition: "color 0.3s var(--ease-cubic)",
        }}
      >
        {number}
      </span>

      {/* conteúdo */}
      <div className="min-w-0 flex-1 space-y-2">
        <h3
          className="text-lg leading-tight font-bold text-black group-hover:text-[#16a34a] md:text-xl dark:text-white"
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            transition: "color 0.3s var(--ease-cubic)",
          }}
        >
          {title}
        </h3>

        <p className="max-w-xl text-sm leading-relaxed text-gray dark:text-neutral-400">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="rounded-full border border-[#e5e5e5] px-2.5 py-0.5 text-xs tracking-wide text-gray group-hover:border-[#16a34a]/40 group-hover:text-[#16a34a] dark:border-[#333] dark:text-neutral-400"
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
        className="mt-1 shrink-0 text-gray group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#16a34a] dark:text-neutral-400"
        style={{
          transition:
            "color 0.3s var(--ease-cubic), transform 0.4s var(--ease-expo)",
        }}
      />
    </motion.a>
  );
}
