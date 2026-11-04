import { expect, test } from "@playwright/test";

import { BEACON_ATTRIBUTE, BEACON_URL } from "../web_analytics";

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
  await expect(beacons).toHaveAttribute("data-cf-beacon", BEACON_ATTRIBUTE);
  await expect.poll(() => page.evaluate(() => "__beaconLoaded" in window)).toBe(true);
  expect(violations).toEqual([]);
});
