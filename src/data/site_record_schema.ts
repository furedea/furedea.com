import { z } from "astro/zod";

const localizedTextSchema = z
  .object({
    ja: z.string().min(1),
    en: z.string().min(1),
  })
  .strict();

export const activitySchema = z
  .object({
    date: z.iso.date(),
    endDate: z.iso.date().optional(),
    title: localizedTextSchema,
    url: z.url().optional(),
    type: z.enum(["paper", "talk", "award", "program", "study-abroad", "general"]),
  })
  .strict()
  .refine(({ date, endDate }) => endDate === undefined || date <= endDate, {
    message: "endDate must not precede date",
    path: ["endDate"],
  });

export const publicationSchema = z
  .object({
    title: localizedTextSchema,
    authors: z.array(localizedTextSchema).min(1),
    venue: localizedTextSchema,
    venueShort: localizedTextSchema.optional(),
    year: z.number().int().positive(),
    type: z.enum(["journal", "conference", "workshop", "technical-report", "preprint", "thesis"]),
    peerReviewed: z.boolean(),
    url: z.url().optional(),
    pdfUrl: z.url().optional(),
    slidesUrl: z.url().optional(),
    bibtex: z.string().min(1).optional(),
    activity: activitySchema.optional(),
  })
  .strict();

export type ActivityRecord = z.infer<typeof activitySchema>;
export type PublicationRecord = z.infer<typeof publicationSchema>;

export const siteRecordSchema = z.union([publicationSchema, activitySchema]);
export type SiteRecord = z.infer<typeof siteRecordSchema>;
