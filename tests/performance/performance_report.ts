import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type ResourceKind = "font" | "image" | "script" | "total";

export type PerformanceMetrics = {
  blockingTime: number;
  cumulativeLayoutShift: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  resources: Record<ResourceKind, { count: number; size: number }>;
};

export type PerformanceBudget = PerformanceMetrics;

export type PerformanceReportEntry = {
  budget: PerformanceBudget;
  metrics: PerformanceMetrics;
  route: string;
  status: "failed" | "interrupted" | "passed" | "skipped" | "timedOut";
};

export type PerformanceMeasurement = Omit<PerformanceReportEntry, "status">;

export function renderPerformanceSummary(entries: PerformanceReportEntry[]): string {
  const rows = entries.toSorted(byRoute).map(renderRow);
  return [
    "## Performance budgets",
    "",
    "| Status | Page | FCP | LCP | CLS | Blocking | Transfer | Requests |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...rows,
    "",
  ].join("\n");
}

export function writePerformanceReports(
  entries: PerformanceReportEntry[],
  outputDirectory: string,
  jobSummaryPath?: string,
): void {
  const sortedEntries = entries.toSorted(byRoute);
  const summary = renderPerformanceSummary(sortedEntries);

  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(join(outputDirectory, "results.json"), jsonReport(sortedEntries));
  writeFileSync(join(outputDirectory, "summary.md"), summary);

  if (jobSummaryPath !== undefined) {
    appendFileSync(jobSummaryPath, summary);
  }
}

function renderRow(entry: PerformanceReportEntry): string {
  const { metrics } = entry;
  return [
    `| ${statusSymbol(entry.status)} | \`${entry.route}\``,
    `${seconds(metrics.firstContentfulPaint)} s`,
    `${seconds(metrics.largestContentfulPaint)} s`,
    metrics.cumulativeLayoutShift.toFixed(3),
    `${Math.round(metrics.blockingTime)} ms`,
    `${Math.round(metrics.resources.total.size / 1_024)} KB`,
    `${metrics.resources.total.count} |`,
  ].join(" | ");
}

function statusSymbol(status: PerformanceReportEntry["status"]): string {
  if (status === "passed") return "✅";
  if (status === "skipped") return "➖";
  return "❌";
}

function seconds(milliseconds: number): string {
  return (milliseconds / 1_000).toFixed(2);
}

function byRoute(left: PerformanceReportEntry, right: PerformanceReportEntry): number {
  return left.route.localeCompare(right.route);
}

function jsonReport(entries: PerformanceReportEntry[]): string {
  return `${JSON.stringify({ results: entries }, null, 2)}\n`;
}
