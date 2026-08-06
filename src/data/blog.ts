import type { Lang } from "@i18n/ui";
import { getCollection, type CollectionEntry } from "astro:content";

import { isVisibleArticle, toWebsiteArticleMetadata, type WebsiteArticleMetadata } from "./article";

export type BlogEntry =
  | CollectionEntry<"articleJa">
  | CollectionEntry<"blogJa">
  | CollectionEntry<"blogEn">;

export interface BlogPost extends WebsiteArticleMetadata {
  id: string;
  entry: BlogEntry;
}

export async function getLocalizedPosts(lang: Lang, limit?: number): Promise<BlogPost[]> {
  const posts = lang === "ja" ? await getJapanesePosts() : await getEnglishPosts();
  posts.sort((a, b) => b.date.getTime() - a.date.getTime());
  return typeof limit === "number" ? posts.slice(0, limit) : posts;
}

async function getJapanesePosts(): Promise<BlogPost[]> {
  const [articles, legacyPosts] = await Promise.all([
    getCollection("articleJa", (entry) =>
      isVisibleArticle(entry.data.published, import.meta.env.DEV),
    ),
    getCollection("blogJa", (entry) => !entry.data.draft),
  ]);
  return [
    ...articles.map((entry) => ({
      id: entry.id,
      entry,
      ...toWebsiteArticleMetadata(entry.data, entry.body ?? ""),
    })),
    ...legacyPosts.map(toLegacyPost),
  ];
}

async function getEnglishPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blogEn", (entry) => !entry.data.draft);
  return posts.map(toLegacyPost);
}

function toLegacyPost(entry: CollectionEntry<"blogJa"> | CollectionEntry<"blogEn">): BlogPost {
  return {
    id: entry.id,
    entry,
    title: entry.data.title,
    description: entry.data.description,
    date: entry.data.date,
    tags: entry.data.tags,
  };
}
