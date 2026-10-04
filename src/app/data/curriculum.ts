export type TimelineKind = "experience" | "education";

export type TimelineId =
  | "coopers-digital"
  | "freelance"
  | "cwb-tecnologia"
  | "vetor-sistemas"
  | "ufpr";

/** The title and the description of an entry are copy: they are in the dictionaries, by id. */
export type TimelineItem = {
  id: TimelineId;
  kind: TimelineKind;
  /** `yyyy-MM`. An entry without `endDate` is ongoing. */
  startDate: string;
  endDate?: string;
  organization: string;
};

/** As on the LinkedIn profile, in its order: ongoing jobs first. */
export const experience: TimelineItem[] = [
  {
    id: "coopers-digital",
    kind: "experience",
    startDate: "2026-06",
    organization: "Coopers Digital · Curitiba, PR",
  },
  {
    id: "freelance",
    kind: "experience",
    startDate: "2023-01",
    organization: "Freelance · Curitiba, PR",
  },
  {
    id: "cwb-tecnologia",
    kind: "experience",
    startDate: "2024-05",
    endDate: "2026-06",
    organization: "CWB Tecnologia · Curitiba, PR",
  },
  {
    id: "vetor-sistemas",
    kind: "experience",
    startDate: "2022-02",
    endDate: "2022-10",
    organization: "Vetor Sistemas · Curitiba, PR",
  },
];

export const education: TimelineItem[] = [
  {
    id: "ufpr",
    kind: "education",
    startDate: "2021-09",
    endDate: "2023-12",
    organization: "Universidade Federal do Paraná (UFPR)",
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
