import { expect, test } from "@playwright/test";

import { WEB_ANALYTICS_TOKEN } from "../../src/data/site";

const BEACON_URL = "https://static.cloudflareinsights.com/beacon.min.js";

test("loads the single Web Analytics beacon without CSP violations", async ({ page }) => {
  const violations: string[] = [];
  await page.exposeFunction("reportViolation", (directive: string) => violations.push(directive));
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      (window as unknown as { reportViolation: (d: string) => void }).reportViolation(
        event.violatedDirective,
      );
    });
  });
  await page.route(BEACON_URL, (route) =>
    route.fulfill({ contentType: "text/javascript", body: "window.__beaconLoaded = true;" }),
  );

  await page.goto("/ja/");

  const beacons = page.locator(`script[src="${BEACON_URL}"]`);
  await expect(beacons).toHaveCount(1);
  await expect(beacons).toHaveAttribute(
    "data-cf-beacon",
    JSON.stringify({ token: WEB_ANALYTICS_TOKEN }),
  );
  await expect.poll(() => page.evaluate(() => "__beaconLoaded" in window)).toBe(true);
  expect(violations).toEqual([]);
});
