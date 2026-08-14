import type { PerformanceBudget, PerformanceMetrics } from "./performance_report";

const INITIAL_SAMPLE_COUNT = 3;
const CONFIRMATION_SAMPLE_COUNT = 2;

type AdaptiveMeasurement = {
  metrics: PerformanceMetrics;
  samples: PerformanceMetrics[];
  wasExtended: boolean;
};

export async function collectAdaptiveMetrics(
  measure: () => Promise<PerformanceMetrics>,
  budget: PerformanceBudget,
): Promise<AdaptiveMeasurement> {
  const samples = await collectSamples(measure, INITIAL_SAMPLE_COUNT);
  const initialMetrics = medianMetrics(samples);
  if (variableMetricsWithinBudget(initialMetrics, budget)) {
    return { metrics: initialMetrics, samples, wasExtended: false };
  }

  samples.push(...(await collectSamples(measure, CONFIRMATION_SAMPLE_COUNT)));
  return { metrics: medianMetrics(samples), samples, wasExtended: true };
}

async function collectSamples(
  measure: () => Promise<PerformanceMetrics>,
  count: number,
): Promise<PerformanceMetrics[]> {
  const samples: PerformanceMetrics[] = [];
  for (let index = 0; index < count; index += 1) {
    samples.push(await measure());
  }
  return samples;
}

function medianMetrics(samples: PerformanceMetrics[]): PerformanceMetrics {
  return {
    firstContentfulPaint: median(samples.map((sample) => sample.firstContentfulPaint)),
    largestContentfulPaint: median(samples.map((sample) => sample.largestContentfulPaint)),
    cumulativeLayoutShift: median(samples.map((sample) => sample.cumulativeLayoutShift)),
    blockingTime: median(samples.map((sample) => sample.blockingTime)),
  };
}

function median(values: number[]): number {
  const sorted = values.toSorted((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function variableMetricsWithinBudget(
  metrics: PerformanceMetrics,
  budget: PerformanceBudget,
): boolean {
  return (
    metrics.firstContentfulPaint <= budget.firstContentfulPaint &&
    metrics.largestContentfulPaint <= budget.largestContentfulPaint &&
    metrics.cumulativeLayoutShift <= budget.cumulativeLayoutShift &&
    metrics.blockingTime <= budget.blockingTime
  );
}
