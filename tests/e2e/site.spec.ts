import { expect, test } from "@playwright/test";

import { profile } from "../../src/data/profile";

const linkByLabel = Object.fromEntries(
  profile.socialLinks.map((link) => [link.platform, link.url]),
);

test.describe("localized top pages", () => {
  test("renders Japanese top page with profile links", async ({ page }) => {
    await page.goto("/ja/");

    await expect(page).toHaveTitle("執行 凱斗 | POSL研究室");
    await expect(page.getByRole("heading", { name: "執行 凱斗", level: 1 })).toBeVisible();
    await expect(page.getByText("ソフトウェア工学")).toBeVisible();
    await expect(page.getByText("POSL研究室, 九州大学")).toBeVisible();
    await expect(page.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      linkByLabel.GitHub,
    );
    await expect(page.getByRole("link", { name: "X" })).toHaveAttribute("href", linkByLabel.X);
    await expect(page.getByRole("link", { name: "Zenn" })).toHaveAttribute(
      "href",
      linkByLabel.Zenn,
    );
  });

  test("renders English top page and links back to Japanese", async ({ page }) => {
    test.skip(page.viewportSize()?.width !== 1280, "Language links are inside mobile menu.");

    await page.goto("/en/");

    await expect(page).toHaveTitle("Kaito Shigyo | POSL Lab");
    await expect(page.getByRole("heading", { name: "Kaito Shigyo", level: 1 })).toBeVisible();
    await expect(page.getByText("Software Engineering").first()).toBeVisible();
    await expect(page.getByText("POSL Lab, Kyushu University")).toBeVisible();
    await expect(page.getByRole("link", { name: "JA" })).toHaveAttribute("href", "/ja/");
  });
});

test("does not publish an unavailable email address", async ({ page }) => {
  await page.goto("/ja/");

  await expect(page.getByText("shigyo@posl.ait.kyushu-u.ac.jp", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "連絡先" })).toHaveCount(0);
});

test("renders news collection records", async ({ page }) => {
  await page.goto("/ja/");

  const entry = page.locator(".news-entry").first();
  await expect(entry).toBeVisible();
  await expect(entry.locator("time")).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}$/);
  await expect(entry.locator(".badge")).toHaveText(/^(paper|talk|award|general)$/);
});

test("renders publication collection metadata", async ({ page }) => {
  await page.goto("/en/");

  const publication = page.locator(".pub-entry").first();
  await expect(publication).toBeVisible();
  await expect(publication.locator(".pub-title")).toContainText(/\S/);
  await expect(publication.locator(".pub-authors")).toContainText(/\S/);
  await expect(publication.locator(".pub-venue")).toContainText(/, \d{4}$/);
});

test("labels non-peer-reviewed publications on Japanese pages", async ({ page }) => {
  await page.goto("/ja/");

  await expect(page.locator(".pub-review-status").first()).toHaveText("査読なし");
});

test("keeps the existing circular profile portrait", async ({ page }) => {
  await page.goto("/ja/");

  const portrait = page.locator(".hero-photo");
  await expect(portrait.locator("img")).toHaveAttribute("alt", "執行 凱斗");
  await expect(portrait).toHaveCSS("border-radius", "50%");
});

test("root redirects to Japanese top page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/ja\/$/);
});

test("publishes social preview metadata on the Japanese top page", async ({ page }) => {
  await page.goto("/ja/");

  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://furedea.com/og_image.png",
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});

test("publishes generated social preview metadata on an article page", async ({ page }) => {
  await page.goto("/ja/blog/modern-terminal-environment/");

  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://furedea.com/og/articles/modern-terminal-environment.png",
  );
});

test("unknown paths return the custom not-found page", async ({ page }) => {
  const response = await page.goto("/missing-page/");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "ページが見つかりません" })).toBeVisible();
  await expect(page.getByRole("link", { name: "日本語トップへ" })).toHaveAttribute("href", "/ja/");
  await expect(page.getByRole("link", { name: "English home" })).toHaveAttribute("href", "/en/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
});

test("blog card is clickable as a whole", async ({ page }) => {
  await page.goto("/ja/");

  await page.locator(".blog-card", { hasText: "ぼくのかんがえたさいきょう" }).click();
  await expect(page).toHaveURL(/\/ja\/blog\/modern-terminal-environment\/$/);
  await expect(
    page.getByRole("heading", {
      name: "ぼくのかんがえたさいきょうのターミナル環境 2026",
      level: 1,
    }),
  ).toBeVisible();
});

test("falls back to Japanese articles on the English site", async ({ page }) => {
  await page.goto("/en/");

  await expect(
    page.getByRole("heading", {
      name: "ぼくのかんがえたさいきょうのターミナル環境 2026",
      level: 3,
    }),
  ).toBeVisible();

  await page.locator(".blog-card", { hasText: "ぼくのかんがえたさいきょう" }).click();
  await expect(page).toHaveURL(/\/en\/blog\/modern-terminal-environment\/$/);
  await expect(
    page.getByRole("heading", {
      name: "ぼくのかんがえたさいきょうのターミナル環境 2026",
      level: 1,
    }),
  ).toBeVisible();
});

test("keeps the existing blog card presentation", async ({ page }) => {
  await page.goto("/ja/");

  const card = page.locator(".blog-card", { hasText: "ぼくのかんがえたさいきょう" });
  await expect(card.locator(".article-cover")).toHaveCount(0);
  await expect(card.locator(".read-more")).toContainText("続きを読む");
  await expect(card.locator(".tag-list")).toHaveCount(0);
});

test("skip link moves focus to main content", async ({ page }) => {
  await page.goto("/ja/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.locator("#main")).toBeFocused();
});

test("mobile menu opens navigation links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ja/");

  const menuButton = page.locator(".menu-toggle");
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "研究" }),
  ).toBeVisible();
});

test("renders Zenn Mermaid blocks as diagrams", async ({ page }) => {
  await page.goto("/ja/blog/modern-terminal-environment/");

  await expect(page.locator(".article-mermaid svg")).toBeVisible();
});

test("renders article images with lazy-loading metadata", async ({ page }) => {
  await page.goto("/ja/blog/modern-terminal-environment/");

  const image = page.locator(".article-body img").first();
  await expect(image).toHaveAttribute("loading", "lazy");
  await expect(image).toHaveAttribute("decoding", "async");
  await expect(image).toHaveAttribute("width", /^\d+$/u);
  await expect(image).toHaveAttribute("height", /^\d+$/u);
});

test("uses primary text color for article prose", async ({ page }) => {
  await page.goto("/ja/blog/modern-terminal-environment/");

  await expect(page.locator(".article-body p").first()).toHaveCSS("color", "rgb(228, 228, 231)");
});

test("centers the article header and body in the viewport", async ({ page }) => {
  await page.goto("/ja/blog/modern-terminal-environment/");

  const viewportWidth = page.viewportSize()?.width;
  const header = await page.locator(".article-header").boundingBox();
  const body = await page.locator(".article-body").boundingBox();

  expect(viewportWidth).toBeDefined();
  expect(header).not.toBeNull();
  expect(body).not.toBeNull();
  expect(header!.x + header!.width / 2).toBeCloseTo(viewportWidth! / 2, 0);
  expect(body!.x + body!.width / 2).toBeCloseTo(viewportWidth! / 2, 0);
});
