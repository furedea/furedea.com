import { describe, expect, test } from "vitest";

import type { PerformanceBudget, PerformanceMetrics } from "./performance_report";
import { collectAdaptiveMetrics } from "./performance_sampler";

describe("adaptive performance sampling", () => {
  test("uses three samples when the initial median is within the variable budgets", async () => {
    const samples = [metrics(1_000), metrics(1_200), metrics(1_100)];

    const measurement = await collectAdaptiveMetrics(sequence(samples), budget());

    expect(measurement).toMatchObject({
      metrics: { firstContentfulPaint: 1_100 },
      samples,
      wasExtended: false,
    });
  });

  test("adds two samples when the initial median exceeds a variable budget", async () => {
    const samples = [
      metrics(3_000),
      metrics(6_000),
      metrics(6_100),
      metrics(1_000),
      metrics(1_200),
    ];

    const measurement = await collectAdaptiveMetrics(sequence(samples), budget());

    expect(measurement).toMatchObject({
      metrics: { firstContentfulPaint: 3_000 },
      samples,
      wasExtended: true,
    });
  });
});

function sequence(samples: PerformanceMetrics[]): () => Promise<PerformanceMetrics> {
  let index = 0;
  return async () => samples[index++];
}

function metrics(duration: number): PerformanceMetrics {
  return {
    blockingTime: duration / 10,
    cumulativeLayoutShift: 0.01,
    firstContentfulPaint: duration,
    largestContentfulPaint: duration,
  };
}

function budget(): PerformanceBudget {
  return metrics(3_500);
}
