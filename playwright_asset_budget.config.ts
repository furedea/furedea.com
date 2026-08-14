import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/asset-budget",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
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
