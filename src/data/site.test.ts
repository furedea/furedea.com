import { pickLocale } from "@i18n/utils";
import { describe, expect, test } from "vitest";

import { education } from "./education";
import { profile } from "./profile";
import { research } from "./research";
import { getHomeTitle, getPageTitle, site } from "./site";

describe("getHomeTitle", () => {
  test("builds Japanese home title", () => {
    expect(getHomeTitle("ja")).toBe("執行 凱斗 | POSL研究室");
  });

  test("builds English home title", () => {
    expect(getHomeTitle("en")).toBe("Kaito Shigyo | POSL Lab");
  });
});

describe("getPageTitle", () => {
  test("prepends subject before Japanese owner name", () => {
    expect(getPageTitle("Blog", "ja")).toBe("Blog | 執行 凱斗");
  });

  test("prepends subject before English owner name", () => {
    expect(getPageTitle("Blog", "en")).toBe("Blog | Kaito Shigyo");
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
