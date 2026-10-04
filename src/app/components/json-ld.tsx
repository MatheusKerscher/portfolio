import type { Graph, ItemList, Person, ProfilePage, WebSite } from "schema-dts";
import { projects } from "../data/projects";
import { site, socials } from "../data/site";

const id = (fragment: string) => `${site.url}/#${fragment}`;

export function buildJsonLd(): Graph {
  const website: WebSite = {
    "@type": "WebSite",
    "@id": id("website"),
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: site.language,
    publisher: { "@id": id("person") },
  };

  const profilePage: ProfilePage = {
    "@type": "ProfilePage",
    "@id": id("profilepage"),
    url: site.url,
    name: site.title,
    description: site.description,
    inLanguage: site.language,
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
    jobTitle: site.role,
    description: site.summary,
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
    "@id": id("projects"),
    name: `Projetos de ${site.name}`,
    description: `Projetos selecionados desenvolvidos por ${site.name}`,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        name: project.title,
        url: project.websiteUrl ?? project.repositoryUrl,
        description: project.description,
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
export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(buildJsonLd()).replace(/</g, "\\u003c"),
      }}
    />
  );
}
