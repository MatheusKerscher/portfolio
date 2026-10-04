import type { TimelineId } from "../curriculum";
import type { ProjectId } from "../projects";
import { site, type StackLayer, type StatId } from "../site";

/**
 * The copy of the site in Brazilian Portuguese. Its shape is the contract of every dictionary:
 * `en.ts` has to satisfy `typeof pt`, so a key missing in one language does not build.
 */
const pt = {
  meta: {
    role: "Desenvolvedor FullStack",
    title: "Matheus Kerscher — Desenvolvedor FullStack",
    description:
      "Portfólio de Matheus Kerscher, desenvolvedor FullStack especializado em React, Next.js e Node.js. Baseado em Curitiba, Paraná.",
    summary: (years: number) =>
      `Matheus Kerscher é desenvolvedor FullStack com mais de ${years} anos de experiência em aplicações web e mobile, especializado em React, Next.js, Node.js e TypeScript. Atua como Full-Stack Software Engineer na Coopers Digital, em Curitiba, PR, e também como freelancer.`,
    availability: "Disponível para trabalho, freelas e colaborações.",
    keywords: [
      "Matheus Kerscher",
      "Desenvolvedor FullStack",
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "React Native",
      "Curitiba",
      "Paraná",
      "Brasil",
      "freelancer",
      "desenvolvimento web",
    ],
  },

  layout: {
    skipLink: "Pular para o conteúdo principal",
    profileOf: (network: string) => `${network} de ${site.name}`,
  },

  nav: {
    label: "Navegação principal",
    links: {
      projects: "Projetos",
      experience: "Currículo",
      contact: "Contato",
    },
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    lightTheme: "Ativar tema claro",
    darkTheme: "Ativar tema escuro",
    backToTop: "Voltar ao topo",
    language: "Idioma",
  },

  skin: { toggle: "Modo 8-bit" },

  carousel: {
    previous: (list: string) => `Anterior em ${list}`,
    next: (list: string) => `Próximo em ${list}`,
  },

  marquee: { pause: "Pausar animação" },

  hero: {
    eyebrow: "Desenvolvedor FullStack · Curitiba, PR",
    tagline:
      "Construo aplicações web com foco em experiência de usuário, performance e código limpo.",
    primaryCta: "Ver Projetos",
    secondaryCta: "Entre em Contato",
    scrollCue: "Scroll",
    portraitAlt: `Retrato de ${site.name}`,
  },

  about: {
    label: "01 — Sobre",
    heading: "Apaixonado por criar experiências digitais que fazem sentido.",
    bio: "Sou desenvolvedor FullStack com foco em React e Node.js, baseado em Curitiba, Paraná. Gosto de transformar ideias complexas em interfaces simples e funcionais, sempre com atenção aos detalhes e à qualidade do código.",
    technologies: "Principais Stacks",
    socials: "Redes e contato",
    stats: {
      years: "anos de exp.",
      clients: "clientes",
    } satisfies Record<StatId, string>,
  },

  projects: {
    label: "02 — Projetos",
    heading: "Trabalhos selecionados.",
    count: (total: number) => `${total} projetos`,
    carousel: "Projetos",
    newTab: "(abre em nova aba)",
    thumbnailAlt: (title: string) => `Tela do projeto ${title}`,
    descriptions: {
      "to-do-list":
        "Aplicação de to-do list para organização das tarefas do dia a dia com foco em produtividade. Exigindo autenticação para acesso e uso das funções, além de formulário de contato para disparo de e-mail",
      "web-carros":
        "Plataforma de compra e venda de veículos com listagem, filtros avançados e autenticação de usuários.",
      "dev-controle":
        "Sistema de controle de chamados e gerenciamento de clientes para desenvolvedores freelancers.",
      "my-mock":
        "Ferramenta online para criação e gerenciamento de mock APIs para acelerar o desenvolvimento e testes.",
      "cripto-currency":
        "Dashboard de acompanhamento de criptomoedas em tempo real.",
    } satisfies Record<ProjectId, string>,
  },

  curriculum: {
    label: "03 — Currículo",
    heading: "Experiência & Formação.",
    carousel: "Experiência e formação",
    kinds: { experience: "Experiência", education: "Formação" },
    months: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    present: "Presente",
    // Job titles are the ones of the LinkedIn profile, in English in every language.
    items: {
      "coopers-digital": {
        title: "Full-Stack Software Engineer",
        description:
          "Desenvolvimento de aplicações web e mobile com Next.js, React, React Native, Nuxt, Vue, Node.js/Nest, PHP e WordPress, integradas a CMS headless como o Hygraph. Atuo também na modelagem de bancos relacionais e não relacionais, em infraestrutura em nuvem e CI/CD, e no contato direto com clientes para traduzir necessidades de negócio em soluções técnicas.",
      },
      freelance: {
        title: "Freelance Full-Stack Developer",
        description:
          "Desenvolvimento de landing pages, portfólios, sites e softwares sob demanda. Parcerias com outros desenvolvedores em projetos de maior complexidade.",
      },
      "cwb-tecnologia": {
        title: "Full-Stack Software Engineer",
        description:
          "Liderança técnica do time de desenvolvimento com atuação ativa em dois produtos: Up Agenda (arquitetura, decisões técnicas, frontend e backend) e Programa Salão — sistema de gestão para salões de beleza, onde reduzi em 30% os custos de hospedagem, otimizei o banco PostgreSQL, criei novas funcionalidades, elaborei documentação e treinei novos colaboradores.",
      },
      "vetor-sistemas": {
        title: "Angular Software Engineer",
        description:
          "Atuação em empresa de automação comercial: automatização de tarefas manuais, manutenção de código-fonte e reestruturação de layout e código dos softwares para modernização e ganho de eficiência.",
      },
      ufpr: {
        title: "Tecnologia em Análise e Desenvolvimento de Sistemas",
        description:
          "Curso Superior de Tecnologia (CST) com foco em desenvolvimento de software, estruturas de dados, banco de dados e engenharia de sistemas.",
      },
    } satisfies Record<TimelineId, { title: string; description: string }>,
  },

  contact: {
    label: "04 — Contato",
    heading: "Vamos construir algo juntos?",
    text: "Estou aberto a oportunidades de trabalho, freelas e colaborações. Se tiver um projeto em mente, adoraria conversar.",
  },

  structuredData: {
    projectsName: `Projetos de ${site.name}`,
    projectsDescription: `Projetos selecionados desenvolvidos por ${site.name}`,
  },

  llms: {
    about: "Sobre",
    stack: "Stack principal",
    layers: {
      frontend: "Frontend",
      mobile: "Mobile",
      backend: "Backend",
      cms: "CMS",
      tools: "Ferramentas",
    } satisfies Record<StackLayer, string>,
    experience: "Experiência profissional",
    education: "Formação",
    projects: "Projetos selecionados",
    pages: "Páginas",
    contact: "Contato",
    language: "Idioma",
    languageName: "Português (pt-BR)",
    otherLanguages: "Outros idiomas",
  },
};

export default pt;
