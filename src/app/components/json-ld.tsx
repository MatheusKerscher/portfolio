import type { Graph, ItemList, Person, ProfilePage, WebSite } from "schema-dts";
import { yearsOfExperience } from "../data/curriculum";
import { dictionaryFor } from "../data/dictionaries";
import { getLocale } from "../data/dictionaries/server";
import { localeCodes, localePath, locales, type Locale } from "../data/locales";
import { projects } from "../data/projects";
import { site, socials } from "../data/site";

/** Ids of the site and the person do not change with the language: both pages describe one entity. */
const id = (fragment: string) => `${site.url}/#${fragment}`;

export function buildJsonLd(locale: Locale): Graph {
  const dict = dictionaryFor(locale);
  const { meta } = dict;
  const language = locales[locale].htmlLang;
  const path = localePath(locale);
  const pageUrl = `${site.url}${path === "/" ? "" : path}`;

  const website: WebSite = {
    "@type": "WebSite",
    "@id": id("website"),
    url: site.url,
    name: site.name,
    description: meta.description,
    inLanguage: localeCodes.map((code) => locales[code].htmlLang),
    publisher: { "@id": id("person") },
  };

  const profilePage: ProfilePage = {
    "@type": "ProfilePage",
    "@id": `${pageUrl}/#profilepage`,
    url: pageUrl,
    name: meta.title,
    description: meta.description,
    inLanguage: language,
    dateModified: site.contentUpdatedAt,
    isPartOf: { "@id": id("website") },
    about: { "@id": id("person") },
    mainEntity: { "@id": id("person") },
  };

  const person: Person = {
    "@type": "Person",
    "@id": id("person"),
    name: site.name,
    url: site.url,
    email: site.email,
    image: `${site.url}${site.portrait.src}`,
    jobTitle: meta.role,
    description: meta.summary(yearsOfExperience),
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressRegion: site.region,
      addressCountry: site.country,
    },
    sameAs: socials
      .filter((link) => link.id !== "email")
      .map((link) => link.href),
    knowsAbout: site.knowsAbout,
    worksFor: {
      "@type": "Organization",
      name: site.employer.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: site.employer.city,
        addressRegion: site.employer.region,
        addressCountry: site.country,
      },
    },
    alumniOf: {
      "@type": "EducationalOrganization",
      name: site.almaMater,
    },
  };

  const portfolio: ItemList = {
    "@type": "ItemList",
    "@id": `${pageUrl}/#projects`,
    name: dict.structuredData.projectsName,
    description: dict.structuredData.projectsDescription,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        name: project.title,
        url: project.websiteUrl ?? project.repositoryUrl,
        description: dict.projects.descriptions[project.id],
        author: { "@id": id("person") },
        applicationCategory: "WebApplication",
      },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [website, profilePage, person, portfolio],
  };
}

/** JSON-LD script, escaped as the bundled Next guide recommends (01-app/02-guides/json-ld.md). */
export default async function JsonLd() {
  const graph = buildJsonLd(await getLocale());

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
