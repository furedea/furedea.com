import { expect, test } from "@playwright/test";

test("publishes one discoverable RSS feed with Japanese article URLs", async ({
  page,
  request,
}) => {
  await page.goto("/ja/blog/");

  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute(
    "href",
    "/rss.xml",
  );

  const response = await request.get("/rss.xml");
  const xml = await response.text();

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toMatch(/^(?:application|text)\/xml\b/u);
  expect(xml).toContain("https://furedea.com/ja/blog/");
  expect(xml).not.toContain("https://furedea.com/en/blog/");
});
