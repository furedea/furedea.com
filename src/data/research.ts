import type { LocalizedText } from "@i18n/ui";

interface ResearchTopic {
  title: LocalizedText;
  description: LocalizedText;
  tags: string[];
}

export const research: ResearchTopic[] = [
  {
    title: {
      ja: "AI Coding Agent の開発支援",
      en: "AI Coding Agents for Software Development",
    },
    description: {
      ja: "AI Coding Agent に与える開発プロセス，タスク，コンテキストが性能に与える影響を定量評価しています．",
      en: "Quantitatively evaluating how development processes, tasks, and context affect the performance of AI coding agents.",
    },
    tags: ["Software Engineering", "AI Coding Agent"],
  },
];
