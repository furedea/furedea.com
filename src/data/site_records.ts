import type { Lang } from "@i18n/ui";
import { pickLocale } from "@i18n/utils";

import type { ActivityRecord, PublicationRecord, SiteRecord } from "./site_record_schema";

export type Activity = ActivityRecord;
export type Publication = Omit<
  PublicationRecord,
  "title" | "authors" | "venue" | "venueShort" | "activity"
> & {
  title: string;
  authors: string;
  venue: string;
  venueShort?: string;
};

export function toActivities(records: readonly SiteRecord[]): Activity[] {
  const publications = records.filter(isPublicationRecord);
  const standaloneItems = records.filter(isActivityRecord);
  const publicationItems = publications.flatMap(({ activity, url }) =>
    activity ? [{ ...(url ? { url } : {}), ...activity }] : [],
  );

  return [...standaloneItems, ...publicationItems].sort((left, right) =>
    right.date.localeCompare(left.date),
  );
}

export function formatActivityPeriod({
  date,
  endDate,
}: Pick<Activity, "date" | "endDate">): string {
  const start = toYearMonth(date);
  return endDate ? `${start}–${toYearMonth(endDate)}` : start;
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

function toYearMonth(isoDate: string): string {
  return isoDate.slice(0, 7).replace("-", ".");
}

function authorSeparator(lang: Lang): string {
  return lang === "ja" ? "，" : ", ";
}

function isPublicationRecord(record: SiteRecord): record is PublicationRecord {
  return "authors" in record;
}

function isActivityRecord(record: SiteRecord): record is ActivityRecord {
  return !isPublicationRecord(record);
}
