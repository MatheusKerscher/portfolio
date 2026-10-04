import {
  education,
  experience,
  formatPeriod,
  type TimelineItem,
} from "../data/curriculum";
import { projects } from "../data/projects";
import { curriculumCopy, site, socials, stackSummary } from "../data/site";

export const dynamic = "force-static";

const timelineEntry = (item: TimelineItem) => [
  `- ${item.title} — ${item.organization} (${formatPeriod(item, curriculumCopy)})`,
  `  ${item.description}`,
];

/** llms.txt (https://llmstxt.org), built from the same data as the page so it cannot drift. */
export function GET() {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    `> ${site.availability}`,
    "",
    "## Sobre",
    "",
    site.summary,
    "",
    "## Stack principal",
    "",
    ...stackSummary.map(
      (group) => `- ${group.layer}: ${group.items.join(", ")}`,
    ),
    "",
    "## Experiência profissional",
    "",
    ...experience.flatMap(timelineEntry),
    "",
    "## Formação",
    "",
    ...education.flatMap(timelineEntry),
    "",
    "## Projetos selecionados",
    "",
    ...projects.flatMap((project) => [
      `- [${project.title}](${project.websiteUrl ?? project.repositoryUrl}): ${project.description}`,
      `  Stack: ${project.tags.join(", ")}`,
    ]),
    "",
    "## Páginas",
    "",
    `- [${site.title}](${site.url}): ${site.description}`,
    "",
    "## Contato",
    "",
    ...socials.map(
      (link) =>
        `- ${link.name}: ${link.id === "email" ? site.email : link.href}`,
    ),
    `- Site: ${site.url}`,
    "",
    "## Idioma",
    "",
    `Português (${site.language})`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
