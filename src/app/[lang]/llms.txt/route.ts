import {
  education,
  experience,
  formatPeriod,
  yearsOfExperience,
  type TimelineItem,
} from "../../data/curriculum";
import { dictionaryFor } from "../../data/dictionaries";
import {
  hasLocale,
  localeCodes,
  localeParams,
  localePath,
  locales,
} from "../../data/locales";
import { projects } from "../../data/projects";
import { site, socials, stackSummary } from "../../data/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export const generateStaticParams = localeParams;

const absolute = (path: string) => `${site.url}${path === "/" ? "" : path}`;

/** llms.txt (https://llmstxt.org), built from the same data as the page so it cannot drift. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/[lang]/llms.txt">,
) {
  const { lang } = await params;
  if (!hasLocale(lang)) return new Response(null, { status: 404 });
  const dict = dictionaryFor(lang);
  const { meta, llms, curriculum } = dict;

  const timelineEntry = (item: TimelineItem) => [
    `- ${curriculum.items[item.id].title} — ${item.organization} (${formatPeriod(item, curriculum)})`,
    `  ${curriculum.items[item.id].description}`,
  ];

  const lines = [
    `# ${site.name}`,
    "",
    `> ${meta.description}`,
    `> ${meta.availability}`,
    "",
    `## ${llms.about}`,
    "",
    meta.summary(yearsOfExperience),
    "",
    `## ${llms.stack}`,
    "",
    ...stackSummary.map(
      (group) => `- ${llms.layers[group.layer]}: ${group.items.join(", ")}`,
    ),
    "",
    `## ${llms.experience}`,
    "",
    ...experience.flatMap(timelineEntry),
    "",
    `## ${llms.education}`,
    "",
    ...education.flatMap(timelineEntry),
    "",
    `## ${llms.projects}`,
    "",
    ...projects.flatMap((project) => [
      `- [${project.title}](${project.websiteUrl ?? project.repositoryUrl}): ${dict.projects.descriptions[project.id]}`,
      `  Stack: ${project.tags.join(", ")}`,
    ]),
    "",
    `## ${llms.pages}`,
    "",
    `- [${meta.title}](${absolute(localePath(lang))}): ${meta.description}`,
    "",
    `## ${llms.contact}`,
    "",
    ...socials.map(
      (link) =>
        `- ${link.name}: ${link.id === "email" ? site.email : link.href}`,
    ),
    `- Site: ${site.url}`,
    "",
    `## ${llms.language}`,
    "",
    llms.languageName,
    "",
    // The same file in the other languages, when there are any.
    ...(localeCodes.length > 1
      ? [
          `## ${llms.otherLanguages}`,
          "",
          ...localeCodes
            .filter((code) => code !== lang)
            .map(
              (code) =>
                `- [${dictionaryFor(code).llms.languageName}](${site.url}${localePath(code, "/llms.txt")})`,
            ),
          "",
        ]
      : []),
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Language": locales[lang].htmlLang,
    },
  });
}
