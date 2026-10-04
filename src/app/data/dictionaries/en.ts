import { site } from "../site";
import type { Dictionary } from "./index";

/** The copy of the site in English. It has to have every key of the Portuguese dictionary. */
const en = {
  meta: {
    role: "Full-Stack Software Engineer",
    title: "Matheus Kerscher — Full-Stack Software Engineer",
    description:
      "Portfolio of Matheus Kerscher, a full-stack software engineer specialized in React, Next.js and Node.js. Based in Curitiba, Brazil.",
    summary: (years: number) =>
      `Matheus Kerscher is a full-stack software engineer with more than ${years} years of experience in web and mobile applications, specialized in React, Next.js, Node.js and TypeScript. He works as a Full-Stack Software Engineer at Coopers Digital, in Curitiba, Brazil, and also as a freelancer.`,
    availability: "Available for work, freelance projects and collaborations.",
    keywords: [
      "Matheus Kerscher",
      "Full-Stack Software Engineer",
      "Full-Stack Developer",
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "React Native",
      "Curitiba",
      "Brazil",
      "freelancer",
      "web development",
    ],
  },

  layout: {
    skipLink: "Skip to main content",
    profileOf: (network: string) => `${site.name} on ${network}`,
  },

  nav: {
    label: "Main navigation",
    links: {
      projects: "Projects",
      experience: "Experience",
      contact: "Contact",
    },
    openMenu: "Open menu",
    closeMenu: "Close menu",
    lightTheme: "Switch to light theme",
    darkTheme: "Switch to dark theme",
    backToTop: "Back to top",
    language: "Language",
  },

  skin: { toggle: "8-bit mode" },

  carousel: {
    previous: (list: string) => `Previous in ${list}`,
    next: (list: string) => `Next in ${list}`,
  },

  hero: {
    eyebrow: "Full-Stack Software Engineer · Curitiba, Brazil",
    tagline:
      "I build web applications with a focus on user experience, performance and clean code.",
    primaryCta: "View Projects",
    secondaryCta: "Get in Touch",
    scrollCue: "Scroll",
    portraitAlt: `Portrait of ${site.name}`,
  },

  about: {
    label: "01 — About",
    heading: "Passionate about building digital experiences that make sense.",
    bio: "I'm a full-stack developer focused on React and Node.js, based in Curitiba, Brazil. I enjoy turning complex ideas into simple, functional interfaces, always with attention to detail and to the quality of the code.",
    technologies: "Core Stack",
    socials: "Profiles and contact",
    stats: {
      years: "years of exp.",
      clients: "clients",
    },
  },

  technologies: {
    nextjs: "React framework with SSR and static generation",
    react: "Library for declarative, reactive interfaces",
    typescript: "JavaScript with static typing and more predictability",
    nodejs: "JavaScript runtime for servers and APIs",
    tailwindcss: "Utility-first CSS framework for fast styling",
    git: "Distributed version control for collaboration",
    javascript: "The dynamic language at the base of the modern web",
    html: "Markup language for the structure of pages",
    css: "Style language for design and animations",
  },

  projects: {
    label: "02 — Projects",
    heading: "Selected work.",
    count: (total: number) => `${total} projects`,
    carousel: "Projects",
    newTab: "(opens in a new tab)",
    thumbnailAlt: (title: string) => `Screenshot of the ${title} project`,
    descriptions: {
      "to-do-list":
        "A to-do list app for organizing everyday tasks, with a focus on productivity. It requires authentication to access and use its features, and has a contact form that sends email.",
      "web-carros":
        "A platform for buying and selling vehicles, with listings, advanced filters and user authentication.",
      "dev-controle":
        "A ticket tracking and client management system for freelance developers.",
      "my-mock":
        "An online tool for creating and managing mock APIs, to speed up development and testing.",
      "cripto-currency":
        "A dashboard for tracking cryptocurrencies in real time.",
    },
  },

  curriculum: {
    label: "03 — Experience",
    heading: "Experience & Education.",
    carousel: "Experience and education",
    kinds: { experience: "Experience", education: "Education" },
    months: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    present: "Present",
    items: {
      "coopers-digital": {
        title: "Full-Stack Software Engineer",
        description:
          "Building and maintaining web and mobile applications with Next.js, React, React Native, Nuxt, Vue, Node.js/Nest, PHP and WordPress, integrated with headless CMS platforms like Hygraph. I also design relational and non-relational databases, support cloud infrastructure and CI/CD pipelines, and work directly with clients to turn business needs into technical solutions.",
      },
      freelance: {
        title: "Freelance Full-Stack Developer",
        description:
          "Building landing pages, portfolios, websites and custom software. Partnering with other developers on more complex projects.",
      },
      "cwb-tecnologia": {
        title: "Full-Stack Software Engineer",
        description:
          "Technical lead of the development team, hands-on in two products: Up Agenda (architecture, technical decisions, frontend and backend) and Programa Salão — a management system for beauty salons, where I cut hosting costs by 30%, optimized the PostgreSQL database, built new features, wrote documentation and trained new team members.",
      },
      "vetor-sistemas": {
        title: "Angular Software Engineer",
        description:
          "At a commercial automation company: automated manual tasks, maintained the source code, and restructured the code and layout of the software to make it more modern and efficient.",
      },
      ufpr: {
        title: "Technology in Systems Analysis and Development",
        description:
          "A higher education technology degree focused on software development, data structures, databases and systems engineering.",
      },
    },
  },

  contact: {
    label: "04 — Contact",
    heading: "Shall we build something together?",
    text: "I'm open to job opportunities, freelance work and collaborations. If you have a project in mind, I'd love to talk.",
  },

  structuredData: {
    projectsName: `Projects by ${site.name}`,
    projectsDescription: `Selected projects built by ${site.name}`,
  },

  llms: {
    about: "About",
    stack: "Main stack",
    layers: {
      frontend: "Frontend",
      mobile: "Mobile",
      backend: "Backend",
      cms: "CMS",
      tools: "Tools",
    },
    experience: "Work experience",
    education: "Education",
    projects: "Selected projects",
    pages: "Pages",
    contact: "Contact",
    language: "Language",
    languageName: "English (en)",
    otherLanguages: "Other languages",
  },
} satisfies Dictionary;

export default en;
