export type TimelineItem = {
  period: string;
  startDate: string;
  endDate?: string;
  title: string;
  organization: string;
  description: string;
};

export const experience: TimelineItem[] = [
  {
    period: "Mai 2024 — Presente",
    startDate: "2024-05",
    title: "FullStack Developer",
    organization: "CWB Tecnologia · Curitiba, PR",
    description:
      "Liderança técnica do time de desenvolvimento com atuação ativa em dois produtos: Up Agenda (arquitetura, decisões técnicas, frontend e backend) e Programa Salão — sistema de gestão para salões de beleza, onde reduzi em 30% os custos de hospedagem, otimizei o banco PostgreSQL, criei novas funcionalidades, elaborei documentação e treinei novos colaboradores.",
  },
  {
    period: "Jan 2023 — Presente",
    startDate: "2023-01",
    title: "FullStack Developer Freelancer",
    organization: "Autônomo",
    description:
      "Desenvolvimento de landing pages, portfólios, páginas web e softwares sob demanda. Trabalho em parceria com outros desenvolvedores em projetos de maior complexidade.",
  },
  {
    period: "Fev 2022 — Out 2022",
    startDate: "2022-02",
    endDate: "2022-10",
    title: "Angular Developer",
    organization: "Vetor Sistemas · Curitiba, PR",
    description:
      "Atuação em empresa de automação comercial: automatização de tarefas manuais, manutenção de código-fonte e reestruturação de layout e código dos softwares para modernização e ganho de eficiência.",
  },
];

export const education: TimelineItem[] = [
  {
    period: "Set 2021 — Dez 2023",
    startDate: "2021-09",
    endDate: "2023-12",
    title: "Tecnologia em Análise e Desenvolvimento de Sistemas",
    organization: "Universidade Federal do Paraná (UFPR)",
    description:
      "Curso Superior de Tecnologia (CST) com foco em desenvolvimento de software, estruturas de dados, banco de dados e engenharia de sistemas.",
  },
];
