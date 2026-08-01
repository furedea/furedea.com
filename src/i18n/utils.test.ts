import { describe, test, expect } from "vitest";

import {
  useTranslations,
  getLocalizedPath,
  pickLocale,
  getDateLocale,
  getOgLocale,
  getLocalePrefix,
  stripLocaleAndBase,
} from "./utils";

describe("useTranslations", () => {
  test("returns Japanese translation for ja", () => {
    const t = useTranslations("ja");
    expect(t("nav.home")).toBe("ホーム");
  });

  test("returns English translation for en", () => {
    const t = useTranslations("en");
    expect(t("nav.home")).toBe("Home");
  });
});

describe("pickLocale", () => {
  test("returns Japanese field for ja", () => {
    expect(pickLocale({ ja: "日本語", en: "English" }, "ja")).toBe("日本語");
  });

  test("returns English field for en", () => {
    expect(pickLocale({ ja: "日本語", en: "English" }, "en")).toBe("English");
  });
});

describe("getDateLocale", () => {
  test("returns ja-JP for ja", () => {
    expect(getDateLocale("ja")).toBe("ja-JP");
  });

  test("returns en-US for en", () => {
    expect(getDateLocale("en")).toBe("en-US");
  });
});

describe("getOgLocale", () => {
  test("returns ja_JP for ja", () => {
    expect(getOgLocale("ja")).toBe("ja_JP");
  });

  test("returns en_US for en", () => {
    expect(getOgLocale("en")).toBe("en_US");
  });
});

describe("getLocalePrefix", () => {
  test("returns /ja for ja", () => {
    expect(getLocalePrefix("ja")).toBe("/ja");
  });

  test("returns /en for en", () => {
    expect(getLocalePrefix("en")).toBe("/en");
  });
});

describe("getLocalizedPath", () => {
  test("returns /ja/ path for ja root", () => {
    expect(getLocalizedPath("/", "ja")).toBe("/ja/");
  });

  test("returns /en/ path for en root", () => {
    expect(getLocalizedPath("/", "en")).toBe("/en/");
  });

  test("appends subpath for ja", () => {
    expect(getLocalizedPath("/blog/", "ja")).toBe("/ja/blog/");
  });

  test("appends subpath for en", () => {
    expect(getLocalizedPath("/blog/", "en")).toBe("/en/blog/");
  });

  test("strips existing /en/ prefix when switching to ja", () => {
    expect(getLocalizedPath("/en/blog/", "ja")).toBe("/ja/blog/");
  });

  test("strips existing /ja/ prefix when switching to en", () => {
    expect(getLocalizedPath("/ja/blog/", "en")).toBe("/en/blog/");
  });

  test("handles blog post slug path", () => {
    expect(getLocalizedPath("/blog/hello_world/", "ja")).toBe("/ja/blog/hello_world/");
  });
});

describe("stripLocaleAndBase", () => {
  test("returns / for root pathname", () => {
    expect(stripLocaleAndBase("/")).toBe("/");
  });

  test("strips ja locale", () => {
    expect(stripLocaleAndBase("/ja/")).toBe("/");
  });

  test("strips en locale", () => {
    expect(stripLocaleAndBase("/en/")).toBe("/");
  });

  test("strips locale preserving subpath", () => {
    expect(stripLocaleAndBase("/ja/blog/")).toBe("/blog/");
  });

  test("strips locale preserving nested slug", () => {
    expect(stripLocaleAndBase("/en/blog/hello_world/")).toBe("/blog/hello_world/");
  });
});
