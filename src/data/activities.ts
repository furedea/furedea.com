import { getCollection } from "astro:content";

import { toActivities } from "./site_records";
import type { Activity } from "./site_records";

export { formatActivityPeriod } from "./site_records";
export type { Activity } from "./site_records";

export async function getActivities(): Promise<Activity[]> {
  const entries = await getCollection("siteRecords");
  return toActivities(entries.map(({ data }) => data));
}
