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

const blogJa = defineCollection({
  loader: glob({ base: "./src/content/blog/ja", pattern: "**/*.md" }),
  schema: blogSchema,
});

const blogEn = defineCollection({
  loader: glob({ base: "./src/content/blog/en", pattern: "**/*.md" }),
  schema: blogSchema,
});

export const collections = { articleJa, blogJa, blogEn };
