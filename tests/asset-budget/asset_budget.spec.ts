import { join } from "node:path";

import { expect, test, type Browser, type CDPSession } from "@playwright/test";

import { discoverLocalizedRoutes } from "../site_routes";
import {
  findAssetBudgetViolations,
  summarizeAssets,
  type AssetBudget,
  type AssetUsage,
  type NetworkAsset,
} from "./asset_budget";

const DIST_DIRECTORY = join(import.meta.dirname, "..", "..", "dist");
const BASE_URL = "http://127.0.0.1:4321";

const PAGE_BUDGET: AssetBudget = {
  total: { size: 850_000, count: 40 },
  script: { size: 0, count: 0 },
  image: { size: 40_000, count: 2 },
  font: { size: 700_000, count: 35 },
};

const ARTICLE_BUDGET: AssetBudget = {
  total: { size: 3_000_000, count: 90 },
  script: { size: 260_000, count: 40 },
  image: { size: 2_000_000, count: 4 },
  font: { size: 850_000, count: 45 },
};

for (const route of discoverLocalizedRoutes(DIST_DIRECTORY)) {
  test(`${route} remains within its asset budget`, async ({ browser }) => {
    const usage = await measureAssets(browser, route);
    const violations = findAssetBudgetViolations(usage, budgetFor(route));

    printUsage(route, usage);
    expect(violations, "asset budget violations").toEqual([]);
  });
}

async function measureAssets(browser: Browser, route: string): Promise<AssetUsage> {
  const context = await browser.newContext({ serviceWorkers: "block" });
  try {
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    const assets = observeNetworkAssets(session);

    await session.send("Network.enable");
    await page.goto(new URL(route, BASE_URL).href, { waitUntil: "networkidle" });

    return summarizeAssets(assets.values());
  } finally {
    await context.close();
  }
}

function observeNetworkAssets(session: CDPSession): Map<string, NetworkAsset> {
  const assets = new Map<string, NetworkAsset>();
  session.on("Network.requestWillBeSent", ({ requestId, type }) => {
    assets.set(requestId, { size: 0, type: type ?? "Other" });
  });
  session.on("Network.loadingFinished", ({ requestId, encodedDataLength }) => {
    const asset = assets.get(requestId);
    if (asset !== undefined) asset.size = encodedDataLength;
  });
  session.on("Network.loadingFailed", ({ requestId }) => assets.delete(requestId));
  return assets;
}

function budgetFor(route: string): AssetBudget {
  return /^\/(?:ja|en)\/blog\/.+\/$/.test(route) ? ARTICLE_BUDGET : PAGE_BUDGET;
}

function printUsage(route: string, usage: AssetUsage): void {
  console.table({
    route,
    transferKb: Math.round(usage.total.size / 1_024),
    requests: usage.total.count,
    scriptKb: Math.round(usage.script.size / 1_024),
    imageKb: Math.round(usage.image.size / 1_024),
    fontKb: Math.round(usage.font.size / 1_024),
  });
}
