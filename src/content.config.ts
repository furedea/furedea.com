import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const articleSchema = z.object({
  title: z.string().min(1),
  emoji: z.string().min(1),
  type: z.enum(["tech", "idea"]),
  topics: z.array(z.string().min(1)).max(5).default([]),
  published: z.boolean().default(false),
  published_at: z.coerce.date(),
});

const articleJa = defineCollection({
  loader: glob({ base: "./articles", pattern: "*.md" }),
  schema: articleSchema,
});

export const collections = { articleJa };
