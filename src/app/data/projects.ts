export type Project = {
  title: string;
  description: string;
  tags: string[];
  websiteUrl?: string;
  repositoryUrl?: string;
};

export const projects: Project[] = [
  {
    title: "To-do List",
    description:
      "Aplicação de to-do list para organização das tarefas do dia a dia com foco em produtividade. Exigindo autenticação para acesso e uso das funções, além de formulário de contato para disparo de e-mail",
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
    websiteUrl: "https://coopers-front.kerscher.dev.br/",
  },
  {
    title: "Web Carros",
    description:
      "Plataforma de compra e venda de veículos com listagem, filtros avançados e autenticação de usuários.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
    websiteUrl: "https://web-carros-pi.vercel.app/",
  },
  {
    title: "Dev Controle",
    description:
      "Sistema de controle de chamados e gerenciamento de clientes para desenvolvedores freelancers.",
    tags: ["Next.js", "PostgreSQL", "TypeScript", "Tailwind"],
    websiteUrl: "https://dev-controle-topaz.vercel.app/",
  },
  {
    title: "MyMock",
    description:
      "Ferramenta online para criação e gerenciamento de mock APIs para acelerar o desenvolvimento e testes.",
    tags: ["Next.js", "React", "Node.js", "TypeScript"],
    websiteUrl: "https://my-mock-ecru.vercel.app/",
  },
  {
    title: "Cripto Currency",
    description: "Dashboard de acompanhamento de criptomoedas em tempo real.",
    tags: ["React", "API REST", "Tailwind"],
    websiteUrl: "https://cripto-currency-orcin.vercel.app/",
  },
];
