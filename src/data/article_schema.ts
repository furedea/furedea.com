import { z } from "astro/zod";

export const articleSchema = z.object({
  title: z.string().min(1),
  emoji: z.string().min(1),
  type: z.enum(["tech", "idea"]),
  topics: z.array(z.string().min(1)).max(5).default([]),
  published: z.boolean().default(false),
  published_at: z.union([z.string(), z.date()]).pipe(z.coerce.date()),
});

export type ZennArticleMetadata = z.infer<typeof articleSchema>;
