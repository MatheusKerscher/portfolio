import { projects } from "../data/projects";

const BASE_URL = "https://kerscher.dev.br";

export default function JsonLd() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BASE_URL}/#person`,
    name: "Matheus Kerscher",
    url: BASE_URL,
    email: "matheus@programasalao.com.br",
    image: `${BASE_URL}/profile-photo.jpg`,
    jobTitle: "Desenvolvedor FullStack",
    description:
      "Desenvolvedor FullStack especializado em React, Next.js e Node.js, baseado no Paraná, Brasil.",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Paraná",
      addressCountry: "BR",
    },
    sameAs: [
      "https://github.com/MatheusKerscher",
      "https://www.linkedin.com/in/matheus-kerscher/",
      "https://www.instagram.com/matheuskerscher/",
    ],
    knowsAbout: [
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "JavaScript",
      "PostgreSQL",
      "Tailwind CSS",
      "Git",
    ],
    worksFor: {
      "@type": "Organization",
      name: "CWB Tecnologia",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Curitiba",
        addressRegion: "PR",
        addressCountry: "BR",
      },
    },
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "Universidade Federal do Paraná (UFPR)",
    },
  };

  const profilePage = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${BASE_URL}/#profilepage`,
    url: BASE_URL,
    name: "Matheus Kerscher — Desenvolvedor FullStack",
    description:
      "Portfólio profissional de Matheus Kerscher, desenvolvedor FullStack especializado em React, Next.js e Node.js.",
    inLanguage: "pt-BR",
    about: { "@id": `${BASE_URL}/#person` },
    mainEntity: { "@id": `${BASE_URL}/#person` },
  };

  const portfolio = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${BASE_URL}/#projects`,
    name: "Projetos de Matheus Kerscher",
    description: "Projetos selecionados desenvolvidos por Matheus Kerscher",
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: p.title,
        url: p.websiteUrl ?? p.repositoryUrl,
        description: p.description,
        author: { "@id": `${BASE_URL}/#person` },
        applicationCategory: "WebApplication",
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolio) }}
      />
    </>
  );
}
