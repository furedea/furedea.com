import type { LocalizedText } from "@i18n/ui";

interface Work {
  title: LocalizedText;
  description: LocalizedText;
  url: string;
  tags: string[];
}

export const works: Work[] = [
  {
    title: { ja: "agent-harness", en: "agent-harness" },
    description: {
      ja: "Claude Code や Codex の hooks，skills，権限ルールを1つの Nix 設定で管理するエージェントハーネス．",
      en: "One Nix configuration for the hooks, skills, and permission rules of Claude Code, Codex, and other coding agents.",
    },
    url: "https://github.com/furedea/agent-harness",
    tags: ["Rust", "Nix", "CLI"],
  },
  {
    title: { ja: "agent-config", en: "agent-config" },
    description: {
      ja: "agent-harness の元になる，毎日使っている指示，skills，hooks，権限ルールの設定．",
      en: "The source of agent-harness: the instructions, skills, hooks, and permission rules I run every day.",
    },
    url: "https://github.com/furedea/agent-config",
    tags: ["Python", "Claude Code", "Codex"],
  },
  {
    title: { ja: "dotfiles", en: "dotfiles" },
    description: {
      ja: "nix-darwin で構成する macOS 環境．agent-harness を毎日動かしている．",
      en: "My macOS setup on nix-darwin, running agent-harness daily.",
    },
    url: "https://github.com/furedea/dotfiles",
    tags: ["Nix", "nix-darwin", "Home Manager"],
  },
  {
    title: { ja: "努力か，運か", en: "Effort or Luck" },
    description: {
      ja: "同じ選択，違う運．100人のあなたが就活の1年を生きるブラウザゲーム．",
      en: "Same choice, different luck: 100 versions of you live one job-hunting year. A browser game.",
    },
    url: "https://furedea.com/effort-or-luck/",
    tags: ["TypeScript", "React", "Astro"],
  },
  {
    title: { ja: "rater", en: "rater" },
    description: {
      ja: "ラベル付け，一致度の測定，不一致の調停を行い，SSH 経由でも使えるターミナル用アノテーションツール．",
      en: "A terminal annotation tool: label, measure agreement, adjudicate, and serve over SSH.",
    },
    url: "https://github.com/furedea/rater",
    tags: ["Go", "TUI", "SSH"],
  },
  {
    title: { ja: "LLM-chatbot", en: "LLM-chatbot" },
    description: {
      ja: "LINE の対話からスマートフォンを推薦し，PDF カタログを生成するサービス．福岡未踏でチーム開発し，商品データの整備・統合，検索と推薦文の生成，実行環境の整備，発表の約半分を担当．",
      en: "A LINE service that recommends smartphones through conversation and generates PDF catalogs. Built as a team in Fukuoka Mitou; I handled product data integration, search and recommendation text generation, the runtime environment, and about half of the presentation.",
    },
    url: "https://mitou-fukuoka.org/works/genius_catalog.html",
    tags: ["Python", "LangChain", "LINE"],
  },
];
