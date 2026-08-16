import { describe, expect, test } from "vitest";

import { education } from "./education";
import { profile } from "./profile";
import { getHomeTitle, getPageTitle, site } from "./site";

describe("site titles", () => {
  test("derives titles from the English profile name", () => {
    expect(getHomeTitle()).toBe(profile.name.en);
    expect(getPageTitle("Blog")).toBe(`Blog — ${profile.name.en}`);
  });
});

test("uses the standard large social preview image", () => {
  expect(site.socialPreview).toEqual({
    path: "/og_image.png",
    width: 1200,
    height: 630,
  });
});

test("provides complete localized not-found guidance", () => {
  for (const language of ["ja", "en"] as const) {
    expect(Object.values(site.notFound[language]).every((value) => value.trim().length > 0)).toBe(
      true,
    );
  }
});

describe("profile data", () => {
  test("uses https urls for all social links", () => {
    expect(profile.socialLinks.every((link) => link.url.startsWith("https://"))).toBe(true);
  });
});

describe("education data", () => {
  test("uses valid year formats", () => {
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
