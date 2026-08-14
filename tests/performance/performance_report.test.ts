import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import {
  renderPerformanceSummary,
  writePerformanceReports,
  type PerformanceReportEntry,
} from "./performance_report";

describe("performance report", () => {
  test("renders each measured page in a readable Markdown table", () => {
    const summary = renderPerformanceSummary([reportEntry()]);

    expect(summary).toBe(`## Performance budgets

| Status | Page | FCP | LCP | CLS | Blocking | Transfer | Requests | Samples |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ✅ | \`/ja/\` | 1.23 s | 1.45 s | 0.012 | 88 ms | 512 KB | 20 | 1 |
`);
  });

  test("writes a portable performance report bundle", () => {
    const directory = mkdtempSync(join(tmpdir(), "performance-report-"));
    const entry = reportEntry();

    try {
      writePerformanceReports([entry], directory);

      expect(readFileSync(join(directory, "summary.md"), "utf8")).toBe(
        renderPerformanceSummary([entry]),
      );
      expect(JSON.parse(readFileSync(join(directory, "results.json"), "utf8"))).toEqual({
        results: [entry],
      });
    } finally {
      rmSync(directory, { recursive: true });
    }
  });

  test("appends the Markdown report to the GitHub job summary", () => {
    const directory = mkdtempSync(join(tmpdir(), "performance-summary-"));
    const jobSummary = join(directory, "job-summary.md");
    writeFileSync(jobSummary, "# Existing summary\n\n");

    try {
      writePerformanceReports([reportEntry()], join(directory, "reports"), jobSummary);

      expect(readFileSync(jobSummary, "utf8")).toBe(
        `# Existing summary\n\n${renderPerformanceSummary([reportEntry()])}`,
      );
    } finally {
      rmSync(directory, { recursive: true });
    }
  });

  test("marks a recovered measurement as unstable", () => {
    const entry = {
      ...reportEntry(),
      samples: Array.from({ length: 5 }, () => reportEntry().metrics),
      wasExtended: true,
    };

    expect(renderPerformanceSummary([entry])).toContain("| ⚠️ unstable | `/ja/` |");
  });

  test("shows the sample count and timing range", () => {
    const entry = reportEntry();
    entry.samples = [
      { ...entry.metrics, firstContentfulPaint: 1_000 },
      entry.metrics,
      { ...entry.metrics, firstContentfulPaint: 1_500 },
    ];

    const summary = renderPerformanceSummary([entry]);

    expect(summary).toContain("1.23 s (1.00–1.50)");
    expect(summary).toContain("| 3 |");
  });
});

function reportEntry(): PerformanceReportEntry {
  const entry = {
    route: "/ja/",
    status: "passed",
    metrics: {
      firstContentfulPaint: 1_234,
      largestContentfulPaint: 1_450,
      cumulativeLayoutShift: 0.0123,
      blockingTime: 88,
      resources: {
        total: { size: 512 * 1_024, count: 20 },
        script: { size: 0, count: 0 },
        image: { size: 20 * 1_024, count: 1 },
        font: { size: 337 * 1_024, count: 16 },
      },
    },
    budget: {
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
    },
  } satisfies Omit<PerformanceReportEntry, "samples" | "wasExtended">;

  return { ...entry, samples: [entry.metrics], wasExtended: false };
}
