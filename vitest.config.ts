import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@i18n": resolve(__dirname, "src/i18n"),
      "@data": resolve(__dirname, "src/data"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
