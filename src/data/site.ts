import type { Lang, LocalizedText } from "@i18n/ui";
import { pickLocale } from "@i18n/utils";

interface SiteMeta {
  ownerName: LocalizedText;
  labName: LocalizedText;
  homeDescription: LocalizedText;
  blogDescription: LocalizedText;
  socialPreview: {
    path: string;
    width: number;
    height: number;
  };
  notFound: Record<Lang, NotFoundText>;
}

interface NotFoundText {
  heading: string;
  description: string;
  homeLabel: string;
}

export const site: SiteMeta = {
  ownerName: {
    ja: "執行 凱斗",
    en: "Kaito Shigyo",
  },
  labName: {
    ja: "POSL研究室",
    en: "POSL Lab",
  },
  homeDescription: {
    ja: "九州大学 POSL研究室 執行凱斗の個人ページ",
    en: "Personal website of Kaito Shigyo, POSL Lab, Kyushu University",
  },
  blogDescription: {
    ja: "執行凱斗のブログ記事一覧",
    en: "Blog posts by Kaito Shigyo",
  },
  socialPreview: {
    path: "/og_image.png",
    width: 1200,
    height: 630,
  },
  notFound: {
    ja: {
      heading: "ページが見つかりません",
      description: "URLが変更されたか，ページが移動または削除された可能性があります．",
      homeLabel: "日本語トップへ",
    },
    en: {
      heading: "Page not found",
      description: "The page may have moved, been removed, or never existed.",
      homeLabel: "English home",
    },
  },
};

export function getHomeTitle(lang: Lang): string {
  return `${pickLocale(site.ownerName, lang)} | ${pickLocale(site.labName, lang)}`;
}

export function getPageTitle(subject: string, lang: Lang): string {
  return `${subject} | ${pickLocale(site.ownerName, lang)}`;
}
