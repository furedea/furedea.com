export type PublicationType = "journal" | "conference" | "workshop" | "preprint" | "thesis";

export interface Publication {
  title: string;
  authors: string;
  venue: string;
  venueShort?: string;
  year: number;
  type: PublicationType;
  url?: string;
  pdfUrl?: string;
  slidesUrl?: string;
  bibtex?: string;
}

export const publications: Publication[] = [];
