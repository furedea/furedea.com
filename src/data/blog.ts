import type { Lang } from "@i18n/ui";
import { getCollection, type CollectionEntry } from "astro:content";

export type BlogEntry = CollectionEntry<"blogJa"> | CollectionEntry<"blogEn">;

export async function getLocalizedPosts(lang: Lang, limit?: number): Promise<BlogEntry[]> {
  const posts: BlogEntry[] =
    lang === "ja"
      ? await getCollection("blogJa", (entry) => !entry.data.draft)
      : await getCollection("blogEn", (entry) => !entry.data.draft);
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return typeof limit === "number" ? posts.slice(0, limit) : posts;
}
