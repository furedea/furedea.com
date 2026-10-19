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
  {
    title: { ja: "agent-harness", en: "agent-harness" },
    description: {
      ja: "Claude Code や Codex の hooks，skills，権限ルールを1つの Nix 設定で管理するエージェントハーネス．",
      en: "One Nix configuration for the hooks, skills, and permission rules of Claude Code, Codex, and other coding agents.",
    },
    url: "https://github.com/furedea/agent-harness",
    tags: ["Rust", "Nix"],
  },
  {
    title: { ja: "apple-mail-cli", en: "apple-mail-cli" },
    description: {
      ja: "macOS の Apple Mail を安全に自動操作する JSON CLI．",
      en: "A safe JSON CLI for Apple Mail automation on macOS.",
    },
    url: "https://github.com/furedea/apple-mail-cli",
    tags: ["Rust", "CLI"],
  },
  {
    title: { ja: "reflex-state", en: "reflex-state" },
    description: {
      ja: "Pi coding agent の変更・検証・ブロッカーといった実行状態を，メインの LLM の外で追跡する．",
      en: "Tracks execution state for Pi coding agents, such as changes, checks, and blockers, outside the main LLM.",
    },
    url: "https://github.com/furedea/reflex-state",
    tags: ["TypeScript"],
  },
  {
    title: { ja: "book-agent", en: "book-agent" },
    description: {
      ja: "技術書のメモを Sub Agent 定義に変換する Claude Code コマンド．",
      en: "A Claude Code command that turns notes from technical books into sub-agent definitions.",
    },
    url: "https://github.com/furedea/book-agent",
    tags: ["Claude Code"],
  },
  {
    title: { ja: "LLM-chatbot", en: "LLM-chatbot" },
    description: {
      ja: "LINE の対話からスマートフォンを推薦し，PDF カタログを生成するサービス．福岡未踏でチーム開発し，商品データの整備・統合，検索と推薦文の生成，実行環境の整備，発表の約半分を担当．",
      en: "A LINE service that recommends smartphones through conversation and generates PDF catalogs. Built as a team in Fukuoka Mitou; I handled product data integration, search and recommendation text generation, the runtime environment, and about half of the presentation.",
    },
    url: "https://mitou-fukuoka.org/works/genius_catalog.html",
    tags: ["Team", "Python", "LLM", "LINE"],
  },
];
