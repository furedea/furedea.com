import type { Lang } from "@i18n/ui";
import { pickLocale } from "@i18n/utils";

import type { NewsRecord, PublicationRecord, SiteRecord } from "./site_record_schema";

export type NewsItem = NewsRecord;
export type Publication = Omit<
  PublicationRecord,
  "title" | "authors" | "venue" | "venueShort" | "news"
> & {
  title: string;
  authors: string;
  venue: string;
  venueShort?: string;
};

export function toNewsItems(records: readonly SiteRecord[]): NewsItem[] {
  const publications = records.filter(isPublicationRecord);
  const standaloneItems = records.filter(isNewsRecord);
  const publicationItems = publications.flatMap(({ news, url }) =>
    news ? [{ ...news, ...(url ? { url } : {}) }] : [],
  );

  return [...standaloneItems, ...publicationItems].sort((left, right) =>
    right.date.localeCompare(left.date),
  );
}

export function toPublications(records: readonly SiteRecord[], lang: Lang): Publication[] {
  return records
    .filter(isPublicationRecord)
    .sort((left, right) => right.year - left.year)
    .map((record) => ({
      title: pickLocale(record.title, lang),
      authors: record.authors.map((author) => pickLocale(author, lang)).join(authorSeparator(lang)),
      venue: pickLocale(record.venue, lang),
      venueShort: record.venueShort && pickLocale(record.venueShort, lang),
      year: record.year,
      type: record.type,
      peerReviewed: record.peerReviewed,
      url: record.url,
      pdfUrl: record.pdfUrl,
      slidesUrl: record.slidesUrl,
      bibtex: record.bibtex,
    }));
}

function authorSeparator(lang: Lang): string {
  return lang === "ja" ? "，" : ", ";
}

function isPublicationRecord(record: SiteRecord): record is PublicationRecord {
  return "authors" in record;
}

function isNewsRecord(record: SiteRecord): record is NewsRecord {
  return !isPublicationRecord(record);
}
