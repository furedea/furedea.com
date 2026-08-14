import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@i18n": resolve(import.meta.dirname, "src/i18n"),
      "@data": resolve(import.meta.dirname, "src/data"),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "tests/performance/**/*.test.ts"],
  },
});
