import { readFile } from "node:fs/promises";

import { expect, test } from "vitest";

test("applies the recommended security headers to every static response", async () => {
  const headers = await readFile(new URL("../public/_headers", import.meta.url), "utf8");

  expect(headers).toContain("X-Content-Type-Options: nosniff");
  expect(headers).toContain("X-Frame-Options: DENY");
  expect(headers).toContain("Referrer-Policy: strict-origin-when-cross-origin");
  expect(headers).toContain("Permissions-Policy:");
  expect(headers).toContain("Strict-Transport-Security: max-age=31536000");
  expect(headers).toContain("Content-Security-Policy:");
});
