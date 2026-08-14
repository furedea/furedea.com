import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/performance",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  outputDir: "test-results/performance",
  reporter: [["list"], ["./tests/performance/performance_reporter.ts"]],
  webServer: {
    command: "pnpm preview --host 127.0.0.1",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://127.0.0.1:4321/ja/",
  },
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium" }],
});
