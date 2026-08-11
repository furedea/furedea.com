import type { NewsRecord, PublicationRecord, SiteRecord } from "./site_record_schema";

export type NewsItem = NewsRecord;
export type Publication = Omit<PublicationRecord, "authors" | "news"> & { authors: string };

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

export function toPublications(records: readonly SiteRecord[]): Publication[] {
  return records
    .filter(isPublicationRecord)
    .sort((left, right) => right.year - left.year)
    .map((record) => ({
      title: record.title,
      authors: record.authors.join(", "),
      venue: record.venue,
      venueShort: record.venueShort,
      year: record.year,
      type: record.type,
      url: record.url,
      pdfUrl: record.pdfUrl,
      slidesUrl: record.slidesUrl,
      bibtex: record.bibtex,
    }));
}

function isPublicationRecord(record: SiteRecord): record is PublicationRecord {
  return "authors" in record;
}

function isNewsRecord(record: SiteRecord): record is NewsRecord {
  return !isPublicationRecord(record);
}
