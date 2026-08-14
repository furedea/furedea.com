import { expect, test } from "@playwright/test";

test("renders article images with lazy-loading metadata", async ({ page }) => {
  await page.goto("/ja/blog/modern-terminal-environment/");

  const image = page.locator(".article-body img").first();
  await expect(image).toHaveAttribute("loading", "lazy");
  await expect(image).toHaveAttribute("decoding", "async");
  await expect(image).toHaveAttribute("width", /^\d+$/u);
  await expect(image).toHaveAttribute("height", /^\d+$/u);
});
