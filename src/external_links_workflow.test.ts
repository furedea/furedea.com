import { readFileSync } from "node:fs";

import { expect, test } from "vitest";

const workflow = readFileSync(
  new URL("../.github/workflows/external_links.yml", import.meta.url),
  "utf8",
);

test("runs external link checks outside pull request merge checks", () => {
  expect(workflow).toMatch(/\n  schedule:\n/u);
  expect(workflow).toMatch(/\n  workflow_dispatch:\n/u);
  expect(workflow).not.toMatch(/\n  pull_request:\n/u);
  expect(workflow).not.toMatch(/\n  push:\n/u);
});

test("uses the pinned Lychee release", () => {
  expect(workflow).toContain(
    "uses: lycheeverse/lychee-action@e7477775783ea5526144ba13e8db5eec57747ce8 # v2.9.0",
  );
});

test("checks external links in authored site content", () => {
  expect(workflow).toContain("--scheme http");
  expect(workflow).toContain("--scheme https");
  expect(workflow).toContain("--exclude '^https://furedea\\.com(?:/|$)'");
  expect(workflow).toContain("'./articles/**/*.md'");
  expect(workflow).toContain("'./content/**/*.yaml'");
  expect(workflow).toContain("'./src/data/profile.ts'");
  expect(workflow).toContain("'./src/data/research.ts'");
  expect(workflow).toContain("'./src/data/education.ts'");
});

test("treats bot-blocking HTTP 403 responses as reachable", () => {
  expect(workflow).toContain("--accept '200..=299,403'");
});

test("preserves the external link report for later investigation", () => {
  expect(workflow).toContain(
    "uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1",
  );
  expect(workflow).toContain("if: ${{ always() }}");
  expect(workflow).toContain("name: external-link-results");
  expect(workflow).toContain("path: lychee/results.md");
  expect(workflow).toContain("retention-days: 14");
});
