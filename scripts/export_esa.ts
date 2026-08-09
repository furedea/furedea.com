import { readFile } from "node:fs/promises";

import { isZennSlug, parseZennArticleSource, toEsaPostPayload } from "../src/data/article.ts";
import { parseArticleConfig } from "../src/data/article_config.ts";

const ARTICLE_CONFIG_URL = new URL("../article_config.json", import.meta.url);

async function main(): Promise<void> {
  const slug = getSlug(process.argv.slice(2));
  const [source, configSource] = await Promise.all([
    readFile(new URL(`../articles/${slug}.md`, import.meta.url), "utf8"),
    readFile(ARTICLE_CONFIG_URL, "utf8"),
  ]);
  const article = parseZennArticleSource(source);
  const config = parseArticleConfig(configSource);
  const canonicalUrl = new URL(`/ja/blog/${slug}/`, "https://furedea.com").href;
  const payload = toEsaPostPayload(article.metadata, article.markdown, {
    canonicalUrl,
    category: config.esa.category,
  });
  console.log(JSON.stringify(payload, null, 2));
}

function getSlug(arguments_: string[]): string {
  const slug = arguments_[0];
  if (arguments_.length !== 1 || slug === undefined || !isZennSlug(slug)) {
    throw new Error("Usage: pnpm article:export:esa -- <12-50 character Zenn slug>");
  }
  return slug;
}

await main();
