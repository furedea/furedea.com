import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

import { articleSchema } from "./data/article_schema";
import { siteRecordSchema } from "./data/site_record_schema";

const articleJa = defineCollection({
  loader: glob({ base: "./articles", pattern: "*.md" }),
  schema: articleSchema,
});

const siteRecords = defineCollection({
  loader: glob({ base: "./content", pattern: "**/*.yaml" }),
  schema: siteRecordSchema,
});

export const collections = { articleJa, siteRecords };
