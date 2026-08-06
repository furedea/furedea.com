import { writeFile } from "node:fs/promises";

import { createZennArticleTemplate, isZennSlug } from "../src/data/article.ts";

async function main(): Promise<void> {
  const slug = getSlug(process.argv.slice(2));
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

function getSlug(arguments_: string[]): string {
  const slug = arguments_[0];
  if (arguments_.length !== 1 || slug === undefined || !isZennSlug(slug)) {
    throw new Error("Usage: pnpm article:new -- <12-50 character Zenn slug>");
  }
  return slug;
}

await main();
