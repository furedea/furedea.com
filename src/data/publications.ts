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

export const publications: Publication[] = [
  {
    title: "Evaluating Coding Agents for Refactoring Under Project-Specific Conventions",
    authors: "Kaito Shigyo, Masanari Kondo, Yasutaka Kamei",
    venue: "IEICE Technical Report, vol. 126, no. 125, SS2026-27, pp. 157–162",
    year: 2026,
    type: "workshop",
    url: "https://ken.ieice.org/ken/paper/202607247cwN/",
  },
];
