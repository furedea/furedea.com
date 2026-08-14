import { expect, test } from "@playwright/test";

import { profile } from "../../src/data/profile";

test("describes the homepage as a profile page", async ({ page }) => {
  await page.goto("/ja/");

  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  const source = await jsonLd.textContent();
  expect(JSON.parse(source ?? "")).toMatchObject({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@id": "https://furedea.com/#person",
      "@type": "Person",
      name: profile.name.ja,
      affiliation: {
        "@type": "Organization",
        name: profile.affiliation.ja,
      },
      sameAs: profile.socialLinks.map(({ url }) => url),
    },
  });
});

test("describes an article as a blog posting by the profile owner", async ({ page }) => {
  await page.goto("/ja/blog/modern-terminal-environment/");

  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  const headline = await page.getByRole("heading", { level: 1 }).textContent();
  const image = await page.locator('meta[property="og:image"]').getAttribute("content");
  const source = await jsonLd.textContent();

  expect(JSON.parse(source ?? "")).toMatchObject({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    image,
    inLanguage: "ja-JP",
    author: {
      "@id": "https://furedea.com/#person",
      "@type": "Person",
      name: profile.name.ja,
    },
  });
});
