/**
 * Facts about the site and its owner that do not depend on the language. The copy is in
 * `dictionaries/`. Sections, metadata, JSON-LD, llms.txt, the sitemap and the Open Graph image
 * read both.
 */
import { yearsOfExperience } from "./curriculum";

export const site = {
  url: "https://kerscher.dev.br",
  name: "Matheus Kerscher",
  /** The `h1` of the page and the name on the Open Graph image. */
  heading: "MATHEUS KERSCHER",
  initials: "MK",
  email: "matheuskerscher@outlook.com",
  city: "Curitiba",
  region: "Paraná",
  country: "BR",
  repository: "https://github.com/MatheusKerscher/portfolio",
  /** Bump when the visible content changes: it is the `lastmod` of the sitemap. */
  contentUpdatedAt: "2026-10-04",
  /** The first four are printed on the Open Graph image. */
  knowsAbout: [
    "React",
    "Next.js",
    "Node.js",
    "TypeScript",
    "JavaScript",
    "React Native",
    "NestJS",
    "Vue.js",
    "Nuxt",
    "PHP",
    "WordPress",
    "PostgreSQL",
    "Tailwind CSS",
    "CI/CD",
    "Git",
  ],
  employer: { name: "Coopers Digital", city: "Curitiba", region: "PR" },
  almaMater: "Universidade Federal do Paraná (UFPR)",
  portrait: { src: "/images/matheus-kerscher.jpg", width: 886, height: 886 },
  /** The `--paper` token of each theme, for the browser chrome. Checked by e2e/seo.spec.ts. */
  themeColor: { light: "#f8f7f3", dark: "#111111" },
};

/**
 * Ids of the stacked sections, in the order of the page. They are the anchors of the page and
 * are the same in every language.
 */
export const sections = {
  hero: "hero",
  about: "about",
  projects: "projects",
  experience: "experience",
  contact: "contact",
} as const;

export type SectionKey = keyof typeof sections;

export const headingId = (key: SectionKey) => `${sections[key]}-heading`;

export type SocialId = "email" | "linkedin" | "github" | "instagram";

export type Social = {
  id: SocialId;
  name: string;
  handle: string;
  href: string;
};

export const socials: Social[] = [
  {
    id: "email",
    name: "Email",
    handle: site.email,
    href: `mailto:${site.email}`,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "in/matheus-kerscher",
    href: "https://www.linkedin.com/in/matheus-kerscher/",
  },
  {
    id: "github",
    name: "GitHub",
    handle: "/MatheusKerscher",
    href: "https://github.com/MatheusKerscher",
  },
  {
    id: "instagram",
    name: "Instagram",
    handle: "@MatheusKerscher",
    href: "https://www.instagram.com/matheuskerscher/",
  },
];

export const social = (id: SocialId) =>
  socials.find((item) => item.id === id) as Social;

export type TechnologyId =
  | "nextjs"
  | "react"
  | "typescript"
  | "nodejs"
  | "tailwindcss"
  | "git"
  | "javascript"
  | "html"
  | "css";

export type Technology = { id: TechnologyId; name: string; icon: string };

export const technologies: Technology[] = [
  { id: "nextjs", name: "Next.js", icon: "/nextjs.svg" },
  { id: "react", name: "React", icon: "/react.svg" },
  { id: "typescript", name: "TypeScript", icon: "/typescript.svg" },
  { id: "nodejs", name: "Node.js", icon: "/nodejs.svg" },
  { id: "tailwindcss", name: "Tailwind CSS", icon: "/tailwindcss.svg" },
  { id: "git", name: "Git", icon: "/git.svg" },
  { id: "javascript", name: "JavaScript", icon: "/javascript.svg" },
  { id: "html", name: "HTML5", icon: "/html.svg" },
  { id: "css", name: "CSS3", icon: "/css.svg" },
];

export type StackLayer = "frontend" | "mobile" | "backend" | "cms" | "tools";

/** The stack as llms.txt lists it, grouped by layer. */
export const stackSummary: { layer: StackLayer; items: string[] }[] = [
  {
    layer: "frontend",
    items: [
      "React",
      "Next.js",
      "Vue.js",
      "Nuxt",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "HTML5",
      "CSS3",
    ],
  },
  { layer: "mobile", items: ["React Native"] },
  { layer: "backend", items: ["Node.js", "NestJS", "PHP", "PostgreSQL"] },
  { layer: "cms", items: ["WordPress", "Hygraph"] },
  { layer: "tools", items: ["Git", "CI/CD"] },
];

export type StatId = "years" | "clients";

export type Stat = { id: StatId; value: number; suffix: string };

export const stats: Stat[] = [
  { id: "years", value: yearsOfExperience, suffix: "+" },
  { id: "clients", value: 8, suffix: "+" },
];
