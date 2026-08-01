import { BASE_PATH } from "../consts";
import { ui, languages, type Lang, type LocalizedText } from "./ui";

const defaultLang: Lang = "ja";

const LOCALE_PATTERN = Object.keys(languages).join("|");
const escapedBasePath = BASE_PATH.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const BASE_RE = BASE_PATH ? new RegExp(`^${escapedBasePath}/?`) : undefined;
const LANG_RE = new RegExp(`^/(?:${LOCALE_PATTERN})(?=/|$)`);

function stripBasePath(path: string): string {
  return BASE_RE ? path.replace(BASE_RE, "/") : path;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

export function pickLocale(text: LocalizedText, lang: Lang): string {
  return text[lang];
}

export function getDateLocale(lang: Lang): string {
  return lang === "ja" ? "ja-JP" : "en-US";
}

export function getOgLocale(lang: Lang): string {
  return lang === "ja" ? "ja_JP" : "en_US";
}

export function getLocalePrefix(lang: Lang): string {
  return `${BASE_PATH}/${lang}`;
}

export function getLocalizedPath(path: string, lang: Lang): string {
  const stripped = stripBasePath(path).replace(LANG_RE, "") || "/";
  const suffix = stripped.startsWith("/") ? stripped : `/${stripped}`;
  return `${BASE_PATH}/${lang}${suffix}`;
}

export function stripLocaleAndBase(pathname: string): string {
  const stripped = stripBasePath(pathname).replace(LANG_RE, "");
  return stripped || "/";
}
