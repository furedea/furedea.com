import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test("Japanese homepage has no automatically detectable WCAG A or AA violations", async ({
  page,
}) => {
  await page.goto("/ja/");
  await expectNoWcagViolations(page);
});

test("English homepage has no automatically detectable WCAG A or AA violations", async ({
  page,
}) => {
  await page.goto("/en/");
  await expectNoWcagViolations(page);
});

test("Article page has no automatically detectable WCAG A or AA violations", async ({ page }) => {
  await page.goto("/ja/blog/modern-terminal-environment/");
  await expectNoWcagViolations(page);
});

test("Open mobile navigation has no automatically detectable WCAG A or AA violations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ja/");
  await page.getByRole("button", { name: "Menu" }).click();
  await expectNoWcagViolations(page);
});

async function expectNoWcagViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();
  expect(results.violations).toEqual([]);
}
