import { getCollection } from "astro:content";

import { toPublications } from "./site_records";
import type { Publication } from "./site_records";

export type { Publication } from "./site_records";

export async function getPublications(): Promise<Publication[]> {
  const entries = await getCollection("siteRecords");
  return toPublications(entries.map(({ data }) => data));
}
