import type { BrowserContext } from "@playwright/test";

import { WEB_ANALYTICS_TOKEN } from "../src/data/site";

export const BEACON_ORIGIN = "https://static.cloudflareinsights.com";
export const BEACON_URL = `${BEACON_ORIGIN}/beacon.min.js`;
export const BEACON_ATTRIBUTE = JSON.stringify({ token: WEB_ANALYTICS_TOKEN });

// Budgets measure the site's own assets, and a third-party request would make them depend on the network.
export async function blockWebAnalytics(context: BrowserContext): Promise<void> {
  await context.route(`${BEACON_ORIGIN}/**`, (route) => route.abort());
}
