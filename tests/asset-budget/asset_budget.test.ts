import { expect, test } from "vitest";

import { findAssetBudgetViolations, summarizeAssets, type AssetUsage } from "./asset_budget";

test("summarizes tracked network assets for budget evaluation", () => {
  const summary = summarizeAssets([
    { size: 100, type: "Script" },
    { size: 200, type: "Image" },
    { size: 300, type: "Font" },
    { size: 400, type: "Stylesheet" },
  ]);

  expect(summary).toEqual({
    total: { size: 1_000, count: 4 },
    script: { size: 100, count: 1 },
    image: { size: 200, count: 1 },
    font: { size: 300, count: 1 },
  });
});

test("reports an asset transfer size above its budget", () => {
  const usage = assetUsage();
  usage.script.size = 101;

  expect(findAssetBudgetViolations(usage, assetUsage())).toEqual([
    { actual: 101, kind: "script", limit: 100, metric: "size" },
  ]);
});

test("reports an asset request count above its budget", () => {
  const usage = assetUsage();
  usage.font.count = 2;

  expect(findAssetBudgetViolations(usage, assetUsage())).toEqual([
    { actual: 2, kind: "font", limit: 1, metric: "count" },
  ]);
});

function assetUsage(): AssetUsage {
  return {
    total: { size: 100, count: 1 },
    script: { size: 100, count: 1 },
    image: { size: 100, count: 1 },
    font: { size: 100, count: 1 },
  };
}
