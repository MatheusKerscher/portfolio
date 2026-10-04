export type TimelineKind = "experience" | "education";

export type TimelineItem = {
  id: string;
  kind: TimelineKind;
  /** `yyyy-MM`. An entry without `endDate` is ongoing. */
  startDate: string;
  endDate?: string;
  title: string;
  organization: string;
  description: string;
};

/** As on the LinkedIn profile, in its order: ongoing jobs first. */
export const experience: TimelineItem[] = [
  {
    id: "coopers-digital",
    kind: "experience",
    startDate: "2026-06",
    title: "Full-Stack Software Engineer",
    organization: "Coopers Digital · Curitiba, PR",
    description:
      "Desenvolvimento de aplicações web e mobile com Next.js, React, React Native, Nuxt, Vue, Node.js/Nest, PHP e WordPress, integradas a CMS headless como o Hygraph. Atuo também na modelagem de bancos relacionais e não relacionais, em infraestrutura em nuvem e CI/CD, e no contato direto com clientes para traduzir necessidades de negócio em soluções técnicas.",
  },
  {
    id: "freelance",
    kind: "experience",
    startDate: "2023-01",
    title: "Freelance Full-Stack Developer",
    organization: "Freelance · Curitiba, PR",
    description:
      "Desenvolvimento de landing pages, portfólios, sites e softwares sob demanda. Parcerias com outros desenvolvedores em projetos de maior complexidade.",
  },
  {
    id: "cwb-tecnologia",
    kind: "experience",
    startDate: "2024-05",
    endDate: "2026-06",
    title: "Full-Stack Software Engineer",
    organization: "CWB Tecnologia · Curitiba, PR",
    description:
      "Liderança técnica do time de desenvolvimento com atuação ativa em dois produtos: Up Agenda (arquitetura, decisões técnicas, frontend e backend) e Programa Salão — sistema de gestão para salões de beleza, onde reduzi em 30% os custos de hospedagem, otimizei o banco PostgreSQL, criei novas funcionalidades, elaborei documentação e treinei novos colaboradores.",
  },
  {
    id: "vetor-sistemas",
    kind: "experience",
    startDate: "2022-02",
    endDate: "2022-10",
    title: "Angular Software Engineer",
    organization: "Vetor Sistemas · Curitiba, PR",
    description:
      "Atuação em empresa de automação comercial: automatização de tarefas manuais, manutenção de código-fonte e reestruturação de layout e código dos softwares para modernização e ganho de eficiência.",
  },
];

export const education: TimelineItem[] = [
  {
    id: "ufpr",
    kind: "education",
    startDate: "2021-09",
    endDate: "2023-12",
    title: "Tecnologia em Análise e Desenvolvimento de Sistemas",
    organization: "Universidade Federal do Paraná (UFPR)",
    description:
      "Curso Superior de Tecnologia (CST) com foco em desenvolvimento de software, estruturas de dados, banco de dados e engenharia de sistemas.",
  },
];

/** Both lists in the order the page shows them. */
export const timeline: TimelineItem[] = [...experience, ...education];

/** Whole years between a `yyyy-MM` date and `now`. */
export function yearsSince(date: string, now = new Date()) {
  const [year, month] = date.split("-").map(Number);
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  return Math.floor(months / 12);
}

/** Counted from the first job, at build time: the site is rebuilt on every deploy. */
export const yearsOfExperience = yearsSince(
  experience.map((item) => item.startDate).sort()[0],
);

type PeriodCopy = { months: readonly string[]; present: string };

/** "Mai 2024 — Jun 2026", from the same dates `<time datetime>` uses. */
export function formatPeriod(
  item: Pick<TimelineItem, "startDate" | "endDate">,
  copy: PeriodCopy,
) {
  const format = (date: string) => {
    const [year, month] = date.split("-").map(Number);
    return `${copy.months[month - 1]} ${year}`;
  };
  return `${format(item.startDate)} — ${item.endDate ? format(item.endDate) : copy.present}`;
}
