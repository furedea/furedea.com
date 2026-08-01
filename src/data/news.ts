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
    date: "2026-04-01",
    title: {
      ja: "個人ページを公開しました",
      en: "Launched my personal website",
    },
    type: "general",
  },
];
