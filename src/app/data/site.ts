/**
 * Facts about the site and its owner, and the copy of the interface. Sections, metadata, JSON-LD,
 * llms.txt, the sitemap and the Open Graph image all read from here.
 */

export const site = {
  url: "https://kerscher.dev.br",
  name: "Matheus Kerscher",
  initials: "MK",
  role: "Desenvolvedor FullStack",
  title: "Matheus Kerscher — Desenvolvedor FullStack",
  description:
    "Portfólio de Matheus Kerscher, desenvolvedor FullStack especializado em React, Next.js e Node.js. Baseado no Paraná, Brasil.",
  summary:
    "Matheus Kerscher é desenvolvedor FullStack com mais de 3 anos de experiência, especializado em React, Next.js, Node.js e TypeScript. Atua com liderança técnica na CWB Tecnologia em Curitiba, PR, e também como freelancer.",
  availability: "Disponível para trabalho, freelas e colaborações.",
  email: "matheuskerscher@outlook.com",
  language: "pt-BR",
  locale: "pt_BR",
  region: "Paraná",
  country: "BR",
  repository: "https://github.com/MatheusKerscher/portfolio",
  /** Bump when the visible content changes: it is the `lastmod` of the sitemap. */
  contentUpdatedAt: "2026-10-03",
  keywords: [
    "Matheus Kerscher",
    "Desenvolvedor FullStack",
    "React",
    "Next.js",
    "Node.js",
    "TypeScript",
    "Paraná",
    "Brasil",
    "freelancer",
    "desenvolvimento web",
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
  employer: { name: "CWB Tecnologia", city: "Curitiba", region: "PR" },
  almaMater: "Universidade Federal do Paraná (UFPR)",
  portrait: { src: "/images/matheus-kerscher.jpg", width: 886, height: 886 },
  /** The `--paper` token of each theme, for the browser chrome. Checked by e2e/seo.spec.ts. */
  themeColor: { light: "#f8f7f3", dark: "#111111" },
};

/** The email signature tool: its route, and how metadata, the sitemap and llms.txt describe it. */
export const signaturePage = {
  path: "/email-signature",
  title: "Gerador de assinatura de email",
  description:
    "Preencha seus dados, veja o preview em tempo real e copie uma assinatura de email pronta para colar no Gmail, no Outlook ou em outro cliente de email.",
};

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

export type Technology = { name: string; icon: string; description: string };

export const technologies: Technology[] = [
  {
    name: "Next.js",
    icon: "/nextjs.svg",
    description: "Framework React com SSR e geração estática",
  },
  {
    name: "React",
    icon: "/react.svg",
    description: "Biblioteca para interfaces declarativas e reativas",
  },
  {
    name: "TypeScript",
    icon: "/typescript.svg",
    description: "JavaScript com tipagem estática e maior previsibilidade",
  },
  {
    name: "Node.js",
    icon: "/nodejs.svg",
    description: "Runtime JavaScript para servidores e APIs",
  },
  {
    name: "Tailwind CSS",
    icon: "/tailwindcss.svg",
    description: "Framework CSS utilitário para estilização rápida",
  },
  {
    name: "Git",
    icon: "/git.svg",
    description: "Controle de versão distribuído para colaboração",
  },
  {
    name: "JavaScript",
    icon: "/javascript.svg",
    description: "Linguagem dinâmica base da web moderna",
  },
  {
    name: "HTML5",
    icon: "/html.svg",
    description: "Linguagem de marcação para estrutura de páginas",
  },
  {
    name: "CSS3",
    icon: "/css.svg",
    description: "Linguagem de estilo para design e animações",
  },
];

/** The stack as llms.txt lists it, grouped by layer. */
export const stackSummary = [
  {
    layer: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS3"],
  },
  { layer: "Backend", items: ["Node.js", "PostgreSQL"] },
  { layer: "Ferramentas", items: ["Git", "JavaScript"] },
];

export type Stat = { value: number; suffix: string; label: string };

export const stats: Stat[] = [
  { value: 3, suffix: "+", label: "anos de exp." },
  { value: 8, suffix: "+", label: "clientes" },
];

export const layoutCopy = {
  skipLink: "Pular para o conteúdo principal",
  copyright: (year: number) => `© ${year} ${site.name}`,
  profileOf: (network: string) => `${network} de ${site.name}`,
};

export const navCopy = {
  label: "Navegação principal",
  links: [
    { label: "Projetos", href: "#projetos" },
    { label: "Currículo", href: "#curriculo" },
    { label: "Contato", href: "#contato" },
  ],
  openMenu: "Abrir menu",
  closeMenu: "Fechar menu",
  lightTheme: "Ativar tema claro",
  darkTheme: "Ativar tema escuro",
  backToTop: "Voltar ao topo",
};

export const carouselCopy = {
  previous: (list: string) => `Anterior em ${list}`,
  next: (list: string) => `Próximo em ${list}`,
};

export const heroCopy = {
  eyebrow: "Desenvolvedor FullStack · PR, Brasil",
  heading: "MATHEUS KERSCHER",
  tagline:
    "Construo aplicações web com foco em experiência de usuário, performance e código limpo.",
  primaryCta: { label: "Ver Projetos", href: "#projetos" },
  secondaryCta: { label: "Entre em Contato", href: "#contato" },
  scrollCue: "Scroll",
  portraitAlt: `Retrato de ${site.name}`,
};

export const aboutCopy = {
  label: "01 — Sobre",
  heading: "Apaixonado por criar experiências digitais que fazem sentido.",
  bio: "Sou desenvolvedor FullStack com foco em React e Node.js, baseado no Paraná, Brasil. Gosto de transformar ideias complexas em interfaces simples e funcionais, sempre com atenção aos detalhes e à qualidade do código.",
  technologies: "Principais Stacks",
  socials: "Redes e contato",
};

export const projectsCopy = {
  label: "02 — Projetos",
  heading: "Trabalhos selecionados.",
  count: (total: number) => `${total} projetos`,
  carousel: "Projetos",
  newTab: "(abre em nova aba)",
  thumbnailAlt: (title: string) => `Tela do projeto ${title}`,
};

export const curriculumCopy = {
  label: "03 — Currículo",
  heading: "Experiência & Formação.",
  carousel: "Experiência e formação",
  kinds: { experience: "Experiência", education: "Formação" },
};

export const contactCopy = {
  label: "04 — Contato",
  heading: "Vamos construir algo juntos?",
  text: "Estou aberto a oportunidades de trabalho, freelas e colaborações. Se tiver um projeto em mente, adoraria conversar.",
};
