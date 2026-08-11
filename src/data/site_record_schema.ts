import { z } from "astro/zod";

const localizedTextSchema = z
  .object({
    ja: z.string().min(1),
    en: z.string().min(1),
  })
  .strict();

export const newsSchema = z
  .object({
    date: z.iso.date(),
    title: localizedTextSchema,
    url: z.url().optional(),
    type: z.enum(["paper", "talk", "award", "general"]),
  })
  .strict();

const publicationNewsSchema = newsSchema.omit({ url: true }).strict();

export const publicationSchema = z
  .object({
    title: z.string().min(1),
    authors: z.array(z.string().min(1)).min(1),
    venue: z.string().min(1),
    venueShort: z.string().min(1).optional(),
    year: z.number().int().positive(),
    type: z.enum(["journal", "conference", "workshop", "preprint", "thesis"]),
    url: z.url().optional(),
    pdfUrl: z.url().optional(),
    slidesUrl: z.url().optional(),
    bibtex: z.string().min(1).optional(),
    news: publicationNewsSchema.optional(),
  })
  .strict();

export type NewsRecord = z.infer<typeof newsSchema>;
export type PublicationRecord = z.infer<typeof publicationSchema>;

export const siteRecordSchema = z.union([publicationSchema, newsSchema]);
export type SiteRecord = z.infer<typeof siteRecordSchema>;
