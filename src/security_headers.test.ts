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

test("allows the automatically injected Cloudflare Web Analytics beacon", async () => {
  const headers = await readFile(new URL("../public/_headers", import.meta.url), "utf8");

  expect(headers).toContain(
    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  );
  expect(headers).toContain("connect-src 'self'");
});
