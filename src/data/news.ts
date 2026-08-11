import type { LocalizedText } from "@i18n/ui";

export type NewsType = "paper" | "talk" | "award" | "general";

export interface NewsItem {
  date: string;
  title: LocalizedText;
  url?: string;
  type: NewsType;
}

export const news: NewsItem[] = [
  {
    date: "2026-07-24",
    title: {
      ja: "SIGSS 2026年7月研究会で研究発表を行いました．",
      en: "Presented our work at the July 2026 SIGSS meeting.",
    },
    url: "https://ken.ieice.org/ken/paper/202607247cwN/",
    type: "talk",
  },
];
