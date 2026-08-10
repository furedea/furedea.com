import { writeFile } from "node:fs/promises";

import { createZennArticleTemplate, parseArticleSlug } from "../src/data/article.ts";

async function main(): Promise<void> {
  const slug = parseArticleSlug(
    process.argv.slice(2),
    "Usage: pnpm article:new -- <12-50 character Zenn slug>",
  );
  const articleUrl = new URL(`../articles/${slug}.md`, import.meta.url);

  try {
    await writeFile(articleUrl, createZennArticleTemplate(new Date()), {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EEXIST") {
      throw new Error(`Article already exists: articles/${slug}.md`, { cause: error });
    }
    throw error;
  }

  console.log(`Created articles/${slug}.md`);
}

await main();
