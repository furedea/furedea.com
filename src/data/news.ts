import { getCollection } from "astro:content";

import { toNewsItems } from "./site_records";
import type { NewsItem } from "./site_records";

export type { NewsItem } from "./site_records";

export async function getNews(): Promise<NewsItem[]> {
  const entries = await getCollection("siteRecords");
  return toNewsItems(entries.map(({ data }) => data));
}
