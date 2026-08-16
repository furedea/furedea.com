import { expect, test } from "@playwright/test";

import { profile } from "../../src/data/profile";
import { site } from "../../src/data/site";

const linkByLabel = Object.fromEntries(
  profile.socialLinks.map((link) => [link.platform, link.url]),
);

test.describe("localized top pages", () => {
  test("renders Japanese top page with profile links", async ({ page }) => {
    await page.goto("/ja/");

    await expect(page).toHaveTitle(profile.name.en);
    const homeLink = page.getByRole("link", { name: "ホーム" });
    await expect(homeLink.locator("img")).toHaveAttribute("src", "/favicon.svg");
    await expect(page.locator(".site-footer")).toContainText(/© \d{4}/);
    await expect(page.locator(".site-footer")).toContainText(profile.name.en);
    await expect(page.getByRole("heading", { name: profile.name.ja, level: 1 })).toBeVisible();
    await expect(page.getByText(profile.researchArea.ja, { exact: true })).toBeVisible();
    await expect(
      page.getByText(`${profile.affiliation.ja}, ${profile.university.ja}`, { exact: true }),
    ).toBeVisible();
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

    await expect(page).toHaveTitle(profile.name.en);
    await expect(page.getByRole("heading", { name: profile.name.en, level: 1 })).toBeVisible();
    await expect(page.getByText(profile.researchArea.en, { exact: true }).first()).toBeVisible();
    await expect(
      page.getByText(`${profile.affiliation.en}, ${profile.university.en}`, { exact: true }),
    ).toBeVisible();
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

test("uses localized alternative text for the profile portrait", async ({ page }) => {
  await page.goto("/ja/");

  const portrait = page.locator(".hero-photo");
  await expect(portrait.locator("img")).toHaveAttribute("alt", profile.name.ja);
});

test("root redirects to Japanese top page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/ja\/$/);
});

test("publishes social preview metadata on the Japanese top page", async ({ page }) => {
  await page.goto("/ja/");

  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    "content",
    profile.name.en,
  );
  await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute(
    "title",
    `${profile.name.en} RSS`,
  );
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

  await expect(page).toHaveTitle("ぼくのかんがえたさいきょうのターミナル環境 2026 — Kaito Shigyo");
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://furedea.com/og/articles/modern-terminal-environment.png",
  );
});

test("uses the profile name in the RSS channel title", async ({ request }) => {
  const response = await request.get("/rss.xml");

  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain(`<title>${profile.name.en} — Blog</title>`);
});

test("loads critical article resources only from the site origin", async ({ page }) => {
  const externalOrigins = new Set<string>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    const isCriticalResource = ["font", "script", "stylesheet"].includes(request.resourceType());
    if (
      isCriticalResource &&
      url.protocol.startsWith("http") &&
      url.origin !== "http://127.0.0.1:4321"
    ) {
      externalOrigins.add(url.origin);
    }
  });

  await page.goto("/en/blog/modern-terminal-environment/", { waitUntil: "networkidle" });

  expect([...externalOrigins]).toEqual([]);
});

test("unknown paths return the custom not-found page", async ({ page }) => {
  const response = await page.goto("/missing-page/");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: site.notFound.ja.heading })).toBeVisible();
  await expect(page.getByRole("link", { name: site.notFound.ja.homeLabel })).toHaveAttribute(
    "href",
    "/ja/",
  );
  await expect(page.getByRole("link", { name: site.notFound.en.homeLabel })).toHaveAttribute(
    "href",
    "/en/",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
});

test("blog card is clickable as a whole", async ({ page }) => {
  await page.goto("/ja/");

  const card = page.locator(".blog-card").first();
  const title = await card.getByRole("heading", { level: 3 }).innerText();
  const href = await card.getAttribute("href");

  expect(href).toMatch(/^\/ja\/blog\/.+\/$/);
  await card.click();
  expect(new URL(page.url()).pathname).toBe(href);
  await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
});

test("falls back to Japanese articles on the English site", async ({ page }) => {
  await page.goto("/ja/");
  const japaneseCard = page.locator(".blog-card").first();
  const japaneseTitle = await japaneseCard.getByRole("heading", { level: 3 }).innerText();
  const japaneseHref = await japaneseCard.getAttribute("href");

  await page.goto("/en/");
  const englishCard = page.locator(".blog-card").first();
  const englishHref = await englishCard.getAttribute("href");

  await expect(englishCard.getByRole("heading", { level: 3 })).toHaveText(japaneseTitle);
  expect(englishHref).toBe(japaneseHref?.replace("/ja/", "/en/"));
  await englishCard.click();
  expect(new URL(page.url()).pathname).toBe(englishHref);
  await expect(page.getByRole("heading", { name: japaneseTitle, level: 1 })).toBeVisible();
});

test("does not render social preview covers in blog cards", async ({ page }) => {
  await page.goto("/ja/");

  const cards = page.locator(".blog-card");
  await expect(cards.first()).toBeVisible();
  await expect(cards.locator("img")).toHaveCount(0);
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
