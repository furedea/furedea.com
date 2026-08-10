import type { Lang } from "@i18n/ui";
import { getCollection, type CollectionEntry } from "astro:content";

import { isVisibleArticle, toWebsiteArticleMetadata, type WebsiteArticleMetadata } from "./article";

export type BlogEntry = CollectionEntry<"articleJa">;

export interface BlogPost extends WebsiteArticleMetadata {
  id: string;
  entry: BlogEntry;
}

export async function getLocalizedPosts(lang: Lang, limit?: number): Promise<BlogPost[]> {
  const posts = lang === "ja" ? await getJapanesePosts() : [];
  posts.sort((a, b) => b.date.getTime() - a.date.getTime());
  return typeof limit === "number" ? posts.slice(0, limit) : posts;
}

async function getJapanesePosts(): Promise<BlogPost[]> {
  const articles = await getCollection("articleJa", (entry) =>
    isVisibleArticle(entry.data.published, import.meta.env.DEV),
  );
  return articles.map((entry) => ({
    id: entry.id,
    entry,
    ...toWebsiteArticleMetadata(entry.data, entry.body ?? ""),
  }));
}
