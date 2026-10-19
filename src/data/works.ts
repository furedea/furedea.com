import type { LocalizedText } from "@i18n/ui";

interface Work {
  title: LocalizedText;
  description: LocalizedText;
  url: string;
  tags: string[];
}

export const works: Work[] = [
  {
    title: { ja: "努力か，運か", en: "Effort or Luck" },
    description: {
      ja: "同じ選択，違う運．100人のあなたが就活の1年を生きるブラウザゲーム．",
      en: "Same choice, different luck: 100 versions of you live one job-hunting year. A browser game.",
    },
    url: "https://furedea.com/effort-or-luck/",
    tags: ["Astro", "React", "TypeScript"],
  },
];
