import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

const blogJa = defineCollection({
  loader: glob({ base: "./src/content/blog/ja", pattern: "**/*.md" }),
  schema: blogSchema,
});

const blogEn = defineCollection({
  loader: glob({ base: "./src/content/blog/en", pattern: "**/*.md" }),
  schema: blogSchema,
});

export const collections = { blogJa, blogEn };
