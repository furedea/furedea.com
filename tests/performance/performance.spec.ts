import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { chromium, expect, test, type CDPSession, type Page } from "@playwright/test";

import {
  type PerformanceBudget as Budget,
  type PerformanceMeasurement,
  type PerformanceMetrics as Metrics,
  type ResourceKind,
} from "./performance_report";
import { PERFORMANCE_RESULT_ATTACHMENT } from "./performance_reporter";

const DIST_DIRECTORY = join(import.meta.dirname, "..", "..", "dist");
const BASE_URL = "http://127.0.0.1:4321";
const RUNS_PER_PAGE = 3;
const NETWORK_LATENCY_MS = 150;
const NETWORK_THROUGHPUT_BYTES_PER_SECOND = (1_600 * 1_024) / 8;
const CPU_SLOWDOWN_RATE = 4;

type ObservedMetrics = {
  blockingTime: number;
  cumulativeLayoutShift: number;
  largestContentfulPaint: number;
};

type NetworkResource = {
  size: number;
  type: string;
};

const PAGE_BUDGET: Budget = {
  firstContentfulPaint: 2_800,
  largestContentfulPaint: 2_800,
  cumulativeLayoutShift: 0.1,
  blockingTime: 300,
  resources: {
    total: { size: 850_000, count: 40 },
    script: { size: 0, count: 0 },
    image: { size: 40_000, count: 2 },
    font: { size: 700_000, count: 35 },
  },
};

const ARTICLE_BUDGET: Budget = {
  firstContentfulPaint: 3_500,
  largestContentfulPaint: 4_500,
  cumulativeLayoutShift: 0.1,
  blockingTime: 1_500,
  resources: {
    total: { size: 1_900_000, count: 90 },
    script: { size: 260_000, count: 40 },
    image: { size: 650_000, count: 3 },
    font: { size: 850_000, count: 45 },
  },
};

const routes = discoverRoutes(DIST_DIRECTORY);

for (const route of routes) {
  test(`${route} remains within its performance budget`, async () => {
    const samples = await collectSamples(route);
    const metrics = medianMetrics(samples);
    const budget = budgetFor(route);

    const measurement = { budget, metrics, route } satisfies PerformanceMeasurement;
    await test.info().attach(PERFORMANCE_RESULT_ATTACHMENT, {
      body: Buffer.from(JSON.stringify(measurement)),
      contentType: "application/json",
    });

    printMetrics(route, metrics);
    expectMetricsWithinBudget(metrics, budget);
  });
}

async function collectSamples(route: string): Promise<Metrics[]> {
  const samples: Metrics[] = [];

  for (let run = 0; run < RUNS_PER_PAGE; run += 1) {
    samples.push(await measurePage(route));
  }

  return samples;
}

async function measurePage(route: string): Promise<Metrics> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      serviceWorkers: "block",
      viewport: { width: 1_280, height: 720 },
    });
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    const resources = observeNetworkResources(session);

    await session.send("Network.enable");
    await session.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: NETWORK_LATENCY_MS,
      downloadThroughput: NETWORK_THROUGHPUT_BYTES_PER_SECOND,
      uploadThroughput: NETWORK_THROUGHPUT_BYTES_PER_SECOND,
    });
    await session.send("Emulation.setCPUThrottlingRate", { rate: CPU_SLOWDOWN_RATE });
    await installPerformanceObservers(page);
    await page.goto(new URL(route, BASE_URL).href, { waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);

    return await readMetrics(page, resources);
  } finally {
    await browser.close();
  }
}

function observeNetworkResources(session: CDPSession): Map<string, NetworkResource> {
  const resources = new Map<string, NetworkResource>();
  session.on("Network.requestWillBeSent", ({ requestId, type }) => {
    resources.set(requestId, { size: 0, type: type ?? "Other" });
  });
  session.on("Network.loadingFinished", ({ requestId, encodedDataLength }) => {
    const resource = resources.get(requestId);
    if (resource) resource.size = encodedDataLength;
  });
  session.on("Network.loadingFailed", ({ requestId }) => resources.delete(requestId));
  return resources;
}

async function installPerformanceObservers(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const metrics: ObservedMetrics = {
      blockingTime: 0,
      cumulativeLayoutShift: 0,
      largestContentfulPaint: 0,
    };
    Object.defineProperty(window, "__performanceBudgetMetrics", { value: metrics });

    observe("largest-contentful-paint", (entry) => {
      metrics.largestContentfulPaint = entry.startTime;
    });
    observe("layout-shift", (entry) => {
      const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
      if (!shift.hadRecentInput) metrics.cumulativeLayoutShift += shift.value;
    });
    observe("longtask", (entry) => {
      metrics.blockingTime += Math.max(0, entry.duration - 50);
    });

    function observe(type: string, record: (entry: PerformanceEntry) => void): void {
      try {
        new PerformanceObserver((list) => list.getEntries().forEach(record)).observe({
          buffered: true,
          type,
        });
      } catch {
        // The assertion catches unsupported metrics as zero values below.
      }
    }
  });
}

async function readMetrics(page: Page, resources: Map<string, NetworkResource>): Promise<Metrics> {
  const snapshot = await page.evaluate(() => {
    const observed = (window as typeof window & { __performanceBudgetMetrics: ObservedMetrics })
      .__performanceBudgetMetrics;
    const paint = performance.getEntriesByName("first-contentful-paint")[0];

    return {
      observed,
      firstContentfulPaint: paint?.startTime ?? 0,
    };
  });

  return {
    firstContentfulPaint: snapshot.firstContentfulPaint,
    largestContentfulPaint: snapshot.observed.largestContentfulPaint,
    cumulativeLayoutShift: snapshot.observed.cumulativeLayoutShift,
    blockingTime: snapshot.observed.blockingTime,
    resources: summarizeResources(resources.values()),
  };
}

function summarizeResources(entries: Iterable<NetworkResource>): Metrics["resources"] {
  const summary = emptyResourceSummary();

  for (const entry of entries) {
    addResource(summary.total, entry.size);
    const kind = resourceKind(entry.type);
    if (kind) addResource(summary[kind], entry.size);
  }

  return summary;
}

function emptyResourceSummary(): Metrics["resources"] {
  return {
    total: { size: 0, count: 0 },
    script: { size: 0, count: 0 },
    image: { size: 0, count: 0 },
    font: { size: 0, count: 0 },
  };
}

function addResource(summary: { count: number; size: number }, size: number): void {
  summary.count += 1;
  summary.size += size;
}

function resourceKind(resourceType: string | undefined): Exclude<ResourceKind, "total"> | null {
  const kind = resourceType?.toLowerCase();
  if (kind === "font" || kind === "image" || kind === "script") {
    return kind;
  }
  return null;
}

function medianMetrics(samples: Metrics[]): Metrics {
  return {
    firstContentfulPaint: median(samples.map((sample) => sample.firstContentfulPaint)),
    largestContentfulPaint: median(samples.map((sample) => sample.largestContentfulPaint)),
    cumulativeLayoutShift: median(samples.map((sample) => sample.cumulativeLayoutShift)),
    blockingTime: median(samples.map((sample) => sample.blockingTime)),
    resources: Object.fromEntries(
      (["total", "script", "image", "font"] satisfies ResourceKind[]).map((kind) => [
        kind,
        {
          size: median(samples.map((sample) => sample.resources[kind].size)),
          count: median(samples.map((sample) => sample.resources[kind].count)),
        },
      ]),
    ) as Metrics["resources"],
  };
}

function median(values: number[]): number {
  const sorted = values.toSorted((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function expectMetricsWithinBudget(metrics: Metrics, budget: Budget): void {
  expect(metrics.firstContentfulPaint, "first contentful paint (ms)").toBeGreaterThan(0);
  expect(metrics.firstContentfulPaint, "first contentful paint (ms)").toBeLessThanOrEqual(
    budget.firstContentfulPaint,
  );
  expect(metrics.largestContentfulPaint, "largest contentful paint (ms)").toBeGreaterThan(0);
  expect(metrics.largestContentfulPaint, "largest contentful paint (ms)").toBeLessThanOrEqual(
    budget.largestContentfulPaint,
  );
  expect(metrics.cumulativeLayoutShift, "cumulative layout shift").toBeLessThanOrEqual(
    budget.cumulativeLayoutShift,
  );
  expect(metrics.blockingTime, "blocking time (ms)").toBeLessThanOrEqual(budget.blockingTime);

  for (const kind of ["total", "script", "image", "font"] as const) {
    expect(metrics.resources[kind].size, `${kind} transfer size (bytes)`).toBeLessThanOrEqual(
      budget.resources[kind].size,
    );
    expect(metrics.resources[kind].count, `${kind} request count`).toBeLessThanOrEqual(
      budget.resources[kind].count,
    );
  }
}

function budgetFor(route: string): Budget {
  return /^\/(?:ja|en)\/blog\/.+\/$/.test(route) ? ARTICLE_BUDGET : PAGE_BUDGET;
}

function discoverRoutes(directory: string): string[] {
  return listHtmlFiles(directory)
    .map((file) => relative(directory, file).split(sep).join("/"))
    .filter((file) => /^(?:ja|en)\/.+\.html$/.test(file))
    .map((file) => `/${file.replace(/index\.html$/, "")}`)
    .toSorted();
}

function listHtmlFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(path);
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  });
}

function printMetrics(route: string, metrics: Metrics): void {
  console.table({
    route,
    fcpMs: Math.round(metrics.firstContentfulPaint),
    lcpMs: Math.round(metrics.largestContentfulPaint),
    cls: metrics.cumulativeLayoutShift.toFixed(3),
    blockingMs: Math.round(metrics.blockingTime),
    transferKb: Math.round(metrics.resources.total.size / 1_024),
    requests: metrics.resources.total.count,
    scriptKb: Math.round(metrics.resources.script.size / 1_024),
    imageKb: Math.round(metrics.resources.image.size / 1_024),
    fontKb: Math.round(metrics.resources.font.size / 1_024),
  });
}
