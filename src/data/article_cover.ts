import type { WebsiteArticleMetadata } from "./article";
import type { SocialPreview } from "./site";

export const ARTICLE_SOCIAL_PREVIEW_SIZE = {
  width: 1200,
  height: 630,
} as const;

export interface ArticleCover {
  title: string;
  emoji: string;
  label: string;
  topics: string[];
  theme: ArticleCoverTheme;
  socialPreview: SocialPreview;
}

export interface ArticleCoverTheme {
  backgroundStart: string;
  backgroundEnd: string;
  glow: string;
  accent: string;
}

type ArticleCoverMetadata = Pick<WebsiteArticleMetadata, "title" | "emoji" | "type" | "tags">;

const COVER_THEMES: readonly ArticleCoverTheme[] = [
  {
    backgroundStart: "#071528",
    backgroundEnd: "#173a69",
    glow: "#315fa3",
    accent: "#4af2c8",
  },
  {
    backgroundStart: "#10172a",
    backgroundEnd: "#25365b",
    glow: "#405f94",
    accent: "#4af2c8",
  },
  {
    backgroundStart: "#0b1b1d",
    backgroundEnd: "#204746",
    glow: "#3f7b73",
    accent: "#4af2c8",
  },
  {
    backgroundStart: "#1b1525",
    backgroundEnd: "#48345b",
    glow: "#705580",
    accent: "#4af2c8",
  },
];

export function createArticleCover(slug: string, article: ArticleCoverMetadata): ArticleCover {
  return {
    title: article.title,
    emoji: article.emoji,
    label: article.type.toUpperCase(),
    topics: article.tags.slice(0, 3),
    theme: getArticleCoverTheme(slug),
    socialPreview: {
      path: `/og/articles/${slug}.png`,
      ...ARTICLE_SOCIAL_PREVIEW_SIZE,
    },
  };
}

function getArticleCoverTheme(slug: string): ArticleCoverTheme {
  const index = [...slug].reduce((sum, character) => sum + character.codePointAt(0)!, 0);
  return COVER_THEMES[index % COVER_THEMES.length]!;
}
