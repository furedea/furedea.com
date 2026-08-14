import { pickLocale } from "@i18n/utils";
import { describe, expect, test } from "vitest";

import { education } from "./education";
import { profile } from "./profile";
import { research } from "./research";
import { getHomeTitle, getPageTitle, site } from "./site";

describe("site titles", () => {
  test("uses the brand while localizing the home topic", () => {
    expect(getHomeTitle("ja")).toBe("furedea | ソフトウェア工学");
    expect(getHomeTitle("en")).toBe("furedea | Software Engineering");
    expect(getPageTitle("Blog")).toBe("Blog | furedea");
  });
});

describe("site.homeDescription", () => {
  test("mentions Kyushu University in Japanese", () => {
    expect(pickLocale(site.homeDescription, "ja")).toContain("九州大学");
  });

  test("mentions Kyushu University in English", () => {
    expect(pickLocale(site.homeDescription, "en")).toContain("Kyushu University");
  });
});

test("uses the standard large social preview image", () => {
  expect(site.socialPreview).toEqual({
    path: "/og_image.png",
    width: 1200,
    height: 630,
  });
});

test("provides localized not-found guidance", () => {
  expect(site.notFound.ja).toMatchObject({
    heading: "ページが見つかりません",
    homeLabel: "日本語トップへ",
  });
  expect(site.notFound.en).toMatchObject({
    heading: "Page not found",
    homeLabel: "English home",
  });
});

describe("profile data", () => {
  test("exposes required social link icons in order", () => {
    expect(profile.socialLinks.map((link) => link.icon)).toEqual(["github", "x", "zenn"]);
  });

  test("uses https urls for all social links", () => {
    expect(profile.socialLinks.every((link) => link.url.startsWith("https://"))).toBe(true);
  });
});

describe("education data", () => {
  test("contains two entries with valid year formats", () => {
    expect(education).toHaveLength(2);
    for (const entry of education) {
      expect(entry.year).toMatch(/^\d{4}(-\d{4}|-)$/);
    }
  });

  test("provides both locales for each entry", () => {
    for (const entry of education) {
      expect(entry.institution.ja).not.toHaveLength(0);
      expect(entry.institution.en).not.toHaveLength(0);
      expect(entry.detail.ja).not.toHaveLength(0);
      expect(entry.detail.en).not.toHaveLength(0);
    }
  });
});

describe("research data", () => {
  test("describes AI coding agent research in Japanese", () => {
    expect(research[0]?.description.ja).toContain("AI Coding Agent");
  });

  test("describes AI coding agent research in English", () => {
    expect(research[0]?.description.en).toContain("AI coding agents");
  });
});
