import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type PerformanceMetrics = {
  blockingTime: number;
  cumulativeLayoutShift: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
};

export type PerformanceBudget = PerformanceMetrics;

export type PerformanceReportEntry = {
  budget: PerformanceBudget;
  metrics: PerformanceMetrics;
  route: string;
  samples: PerformanceMetrics[];
  status: "failed" | "interrupted" | "passed" | "skipped" | "timedOut";
  wasExtended: boolean;
};

export type PerformanceMeasurement = Omit<PerformanceReportEntry, "status">;

export function renderPerformanceSummary(entries: PerformanceReportEntry[]): string {
  const rows = entries.toSorted(byRoute).map(renderRow);
  return [
    "## Performance budgets",
    "",
    "| Status | Page | FCP | LCP | CLS | Blocking | Samples |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: |",
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
  const { metrics, samples } = entry;
  return [
    `| ${statusSymbol(entry)} | \`${entry.route}\``,
    secondsWithRange(
      metrics.firstContentfulPaint,
      samples.map(({ firstContentfulPaint }) => firstContentfulPaint),
    ),
    secondsWithRange(
      metrics.largestContentfulPaint,
      samples.map(({ largestContentfulPaint }) => largestContentfulPaint),
    ),
    valueWithRange(
      metrics.cumulativeLayoutShift,
      samples.map(({ cumulativeLayoutShift }) => cumulativeLayoutShift),
      (value) => value.toFixed(3),
    ),
    unitWithRange(
      metrics.blockingTime,
      samples.map(({ blockingTime }) => blockingTime),
      "ms",
      Math.round,
    ),
    `${samples.length} |`,
  ].join(" | ");
}

function statusSymbol(entry: PerformanceReportEntry): string {
  if (entry.status === "passed" && entry.wasExtended) return "⚠️ unstable";
  if (entry.status === "passed") return "✅";
  if (entry.status === "skipped") return "➖";
  return "❌";
}

function seconds(milliseconds: number): string {
  return (milliseconds / 1_000).toFixed(2);
}

function secondsWithRange(median: number, samples: number[]): string {
  return unitWithRange(median, samples, "s", seconds);
}

function unitWithRange(
  median: number,
  samples: number[],
  unit: string,
  format: (value: number) => string | number,
): string {
  const minimum = Math.min(...samples);
  const maximum = Math.max(...samples);
  const formattedMedian = format(median);
  if (minimum === maximum) return `${formattedMedian} ${unit}`;
  return `${formattedMedian} ${unit} (${format(minimum)}–${format(maximum)})`;
}

function valueWithRange(
  median: number,
  samples: number[],
  format: (value: number) => string | number,
): string {
  const minimum = Math.min(...samples);
  const maximum = Math.max(...samples);
  const formattedMedian = format(median);
  if (minimum === maximum) return String(formattedMedian);
  return `${formattedMedian} (${format(minimum)}–${format(maximum)})`;
}

function byRoute(left: PerformanceReportEntry, right: PerformanceReportEntry): number {
  return left.route.localeCompare(right.route);
}

function jsonReport(entries: PerformanceReportEntry[]): string {
  return `${JSON.stringify({ results: entries }, null, 2)}\n`;
}
