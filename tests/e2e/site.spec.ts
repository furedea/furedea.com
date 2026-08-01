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

test("root redirects to Japanese top page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/ja\/$/);
});

test("blog card is clickable as a whole", async ({ page }) => {
  await page.goto("/ja/");

  await page.locator(".blog-card", { hasText: "はじめまして" }).click();
  await expect(page).toHaveURL(/\/ja\/blog\/hello_world\/$/);
  await expect(page.getByRole("heading", { name: "はじめまして", level: 1 })).toBeVisible();
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
