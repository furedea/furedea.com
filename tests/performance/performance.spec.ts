import { join } from "node:path";

import { expect, test, type Browser, type Page } from "@playwright/test";

import { discoverLocalizedRoutes } from "../site_routes";
import {
  type PerformanceBudget as Budget,
  type PerformanceMeasurement,
  type PerformanceMetrics as Metrics,
} from "./performance_report";
import { PERFORMANCE_RESULT_ATTACHMENT } from "./performance_reporter";
import { collectAdaptiveMetrics } from "./performance_sampler";

const DIST_DIRECTORY = join(import.meta.dirname, "..", "..", "dist");
const BASE_URL = "http://127.0.0.1:4321";
const NETWORK_LATENCY_MS = 150;
const NETWORK_THROUGHPUT_BYTES_PER_SECOND = (1_600 * 1_024) / 8;
const CPU_SLOWDOWN_RATE = 4;

type ObservedMetrics = {
  blockingTime: number;
  cumulativeLayoutShift: number;
  largestContentfulPaint: number;
};

const PAGE_BUDGET: Budget = {
  firstContentfulPaint: 2_800,
  largestContentfulPaint: 2_800,
  cumulativeLayoutShift: 0.1,
  blockingTime: 300,
};

const ARTICLE_BUDGET: Budget = {
  firstContentfulPaint: 3_500,
  largestContentfulPaint: 4_500,
  cumulativeLayoutShift: 0.1,
  blockingTime: 1_500,
};

const routes = discoverLocalizedRoutes(DIST_DIRECTORY);

for (const route of routes) {
  test(`${route} remains within its performance budget`, async ({ browser }) => {
    const budget = budgetFor(route);
    const { metrics, samples, wasExtended } = await collectAdaptiveMetrics(
      () => measurePage(browser, route),
      budget,
    );

    const measurement = {
      budget,
      metrics,
      route,
      samples,
      wasExtended,
    } satisfies PerformanceMeasurement;
    await test.info().attach(PERFORMANCE_RESULT_ATTACHMENT, {
      body: Buffer.from(JSON.stringify(measurement)),
      contentType: "application/json",
    });

    printMetrics(route, metrics, samples.length);
    expectMetricsWithinBudget(metrics, budget);
  });
}

async function measurePage(browser: Browser, route: string): Promise<Metrics> {
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { width: 1_280, height: 720 },
  });
  try {
    const page = await context.newPage();
    const session = await context.newCDPSession(page);

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

    return await readMetrics(page);
  } finally {
    await context.close();
  }
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

async function readMetrics(page: Page): Promise<Metrics> {
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
  };
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
}

function budgetFor(route: string): Budget {
  return /^\/(?:ja|en)\/blog\/.+\/$/.test(route) ? ARTICLE_BUDGET : PAGE_BUDGET;
}

function printMetrics(route: string, metrics: Metrics, sampleCount: number): void {
  console.table({
    route,
    samples: sampleCount,
    fcpMs: Math.round(metrics.firstContentfulPaint),
    lcpMs: Math.round(metrics.largestContentfulPaint),
    cls: metrics.cumulativeLayoutShift.toFixed(3),
    blockingMs: Math.round(metrics.blockingTime),
  });
}
