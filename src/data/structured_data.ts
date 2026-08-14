import type { Lang } from "@i18n/ui";
import { getLocalizedPath, pickLocale } from "@i18n/utils";

import type { WebsiteArticleMetadata } from "./article";
import { profile } from "./profile";

export type JsonLd = Record<string, unknown>;

interface BlogPostingJsonLdOptions {
  article: WebsiteArticleMetadata;
  lang: Lang;
  pageUrl: string;
  imageUrl: string;
}

export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

export function createWebSiteJsonLd(pageUrl: string): JsonLd {
  const url = new URL(pageUrl);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": new URL("/#website", url).href,
    url: url.href,
    name: profile.name.en,
    alternateName: [profile.name.ja, url.hostname],
  };
}

export function createProfilePageJsonLd(lang: Lang, pageUrl: string): JsonLd {
  const origin = new URL(pageUrl).origin;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: pageUrl,
    inLanguage: toLanguageTag(lang),
    mainEntity: createPersonJsonLd(lang, origin),
  };
}

export function createBlogPostingJsonLd(options: BlogPostingJsonLdOptions): JsonLd {
  const { article, lang, pageUrl, imageUrl } = options;
  const origin = new URL(pageUrl).origin;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${pageUrl}#article`,
    url: pageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    headline: article.title,
    description: article.description,
    image: imageUrl,
    datePublished: article.date.toISOString(),
    inLanguage: "ja-JP",
    articleSection: article.type,
    keywords: article.tags,
    author: createPersonJsonLd(lang, origin),
  };
}

function createPersonJsonLd(lang: Lang, origin: string): JsonLd {
  const alternateLang = lang === "ja" ? "en" : "ja";
  return {
    "@id": `${origin}/#person`,
    "@type": "Person",
    name: pickLocale(profile.name, lang),
    alternateName: pickLocale(profile.name, alternateLang),
    url: new URL(getLocalizedPath("/", lang), origin).href,
    jobTitle: pickLocale(profile.title, lang),
    affiliation: {
      "@type": "Organization",
      name: pickLocale(profile.affiliation, lang),
      parentOrganization: {
        "@type": "CollegeOrUniversity",
        name: pickLocale(profile.university, lang),
      },
    },
    knowsAbout: pickLocale(profile.researchArea, lang),
    sameAs: profile.socialLinks.map(({ url }) => url),
  };
}

function toLanguageTag(lang: Lang): string {
  return lang === "ja" ? "ja-JP" : "en";
}
