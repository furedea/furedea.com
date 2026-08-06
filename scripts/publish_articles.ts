import { readFile, readdir } from "node:fs/promises";

import { parseArticleConfig } from "../src/data/article_config.ts";
import {
  publishArticlesToEsa,
  selectArticleSlugs,
} from "../src/integrations/article_publication.ts";

const ARTICLE_CONFIG_URL = new URL("../article_config.json", import.meta.url);
const ARTICLES_URL = new URL("../articles/", import.meta.url);

async function main(): Promise<void> {
  const accessToken = requireEnvironment("ESA_ACCESS_TOKEN");
  const config = parseArticleConfig(await readFile(ARTICLE_CONFIG_URL, "utf8"));
  const slugs = selectArticleSlugs(await readdir(ARTICLES_URL));
  const results = await publishArticlesToEsa(slugs, {
    team: config.esa.team,
    category: config.esa.category,
    accessToken,
    reader: readArticle,
  });

  if (results.length === 0) {
    console.log("No articles to reconcile.");
    return;
  }
  for (const result of results) {
    console.log(`Reconciled ${result.slug} with esa: ${result.url}`);
  }
}

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.length === 0) {
    throw new Error(`${name} must be set by the publishing workflow.`);
  }
  return value;
}

async function readArticle(slug: string): Promise<string> {
  return readFile(new URL(`../articles/${slug}.md`, import.meta.url), "utf8");
}

await main();
