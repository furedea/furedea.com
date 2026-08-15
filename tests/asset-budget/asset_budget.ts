export const ASSET_KINDS = ["total", "script", "image", "font"] as const;

export type AssetKind = (typeof ASSET_KINDS)[number];

export type AssetUsage = Record<AssetKind, { count: number; size: number }>;

export type AssetBudget = AssetUsage;

type AssetBudgetViolation = {
  actual: number;
  kind: AssetKind;
  limit: number;
  metric: "count" | "size";
};

export type NetworkAsset = {
  size: number;
  type: string;
};

export function summarizeAssets(assets: Iterable<NetworkAsset>): AssetUsage {
  const usage = emptyAssetUsage();

  for (const asset of assets) {
    addAsset(usage.total, asset.size);
    const kind = trackedKind(asset.type);
    if (kind !== null) addAsset(usage[kind], asset.size);
  }

  return usage;
}

export function findAssetBudgetViolations(
  usage: AssetUsage,
  budget: AssetBudget,
): AssetBudgetViolation[] {
  return ASSET_KINDS.flatMap((kind) =>
    (["size", "count"] as const).flatMap((metric) =>
      usage[kind][metric] > budget[kind][metric]
        ? [{ actual: usage[kind][metric], kind, limit: budget[kind][metric], metric }]
        : [],
    ),
  );
}

function emptyAssetUsage(): AssetUsage {
  return {
    total: { size: 0, count: 0 },
    script: { size: 0, count: 0 },
    image: { size: 0, count: 0 },
    font: { size: 0, count: 0 },
  };
}

function addAsset(usage: { count: number; size: number }, size: number): void {
  usage.count += 1;
  usage.size += size;
}

function trackedKind(type: string): Exclude<AssetKind, "total"> | null {
  const kind = type.toLowerCase();
  return kind === "script" || kind === "image" || kind === "font" ? kind : null;
}
