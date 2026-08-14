import { resolve } from "node:path";

import type { Reporter, TestCase, TestResult } from "@playwright/test/reporter";

import { type PerformanceReportEntry, writePerformanceReports } from "./performance_report";

export const PERFORMANCE_RESULT_ATTACHMENT = "performance-result";

export default class PerformanceReporter implements Reporter {
  private readonly entries: PerformanceReportEntry[] = [];

  onTestEnd(_test: TestCase, result: TestResult): void {
    const attachment = result.attachments.find(
      ({ name }) => name === PERFORMANCE_RESULT_ATTACHMENT,
    );

    if (attachment?.body === undefined) return;
    this.entries.push(parsePerformanceResult(attachment.body, result.status));
  }

  onEnd(): void {
    writePerformanceReports(
      this.entries,
      resolve("performance-results"),
      process.env.GITHUB_STEP_SUMMARY,
    );
  }
}

export function parsePerformanceResult(
  body: Buffer,
  status: PerformanceReportEntry["status"],
): PerformanceReportEntry {
  const measurement = JSON.parse(body.toString()) as Omit<PerformanceReportEntry, "status">;
  return { ...measurement, status };
}
