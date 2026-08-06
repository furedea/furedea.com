import { readdir, readFile, stat } from "node:fs/promises";
import { extname } from "node:path";

import { expect, test } from "vitest";

import { parseZennArticleSource, ZENN_SLUG_PATTERN } from "./data/article";

const ARTICLES_DIR = new URL("../articles/", import.meta.url);
const IMAGES_DIR = new URL("../images/", import.meta.url);
const ZENN_IMAGE_EXTENSIONS = new Set([".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const ZENN_IMAGE_MAX_BYTES = 3 * 1024 * 1024;

test("stores every Zenn article under a valid immutable slug", async () => {
  const fileNames = (await readdir(ARTICLES_DIR)).filter((name) => name.endsWith(".md"));

  for (const fileName of fileNames) {
    const source = await readFile(new URL(fileName, ARTICLES_DIR), "utf8");
    expect(fileName.replace(/\.md$/u, "")).toMatch(ZENN_SLUG_PATTERN);
    expect(() => parseZennArticleSource(source)).not.toThrow();
  }
});

test("keeps every article image within Zenn format and size limits", async () => {
  const paths = await readdir(IMAGES_DIR, { recursive: true });

  for (const path of paths.filter((candidate) => !candidate.endsWith(".gitkeep"))) {
    const imageUrl = new URL(path, IMAGES_DIR);
    const imageStat = await stat(imageUrl);
    if (!imageStat.isFile()) {
      continue;
    }
    expect(ZENN_IMAGE_EXTENSIONS).toContain(extname(path).toLowerCase());
    expect(imageStat.size).toBeLessThanOrEqual(ZENN_IMAGE_MAX_BYTES);
  }
});
