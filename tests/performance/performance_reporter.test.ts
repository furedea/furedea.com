import { Buffer } from "node:buffer";

import { describe, expect, test } from "vitest";

import type { PerformanceReportEntry } from "./performance_report";
import { parsePerformanceResult } from "./performance_reporter";

describe("performance reporter", () => {
  test("combines an attached measurement with the final Playwright status", () => {
    const measuredMetrics = metrics(1_200);
    const measurement: Omit<PerformanceReportEntry, "status"> = {
      budget: metrics(2_800),
      metrics: measuredMetrics,
      route: "/ja/",
      samples: [measuredMetrics],
      wasExtended: false,
    };

    expect(parsePerformanceResult(Buffer.from(JSON.stringify(measurement)), "failed")).toEqual({
      ...measurement,
      status: "failed",
    });
  });
});

function metrics(duration: number): PerformanceReportEntry["metrics"] {
  return {
    blockingTime: duration,
    cumulativeLayoutShift: 0.01,
    firstContentfulPaint: duration,
    largestContentfulPaint: duration,
  };
}
