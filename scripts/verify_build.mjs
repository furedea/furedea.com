import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const distDir = new URL("../dist/", import.meta.url).pathname;

const requiredPaths = [
  "index.html",
  "404.html",
  "ja/index.html",
  "en/index.html",
  "ja/blog/index.html",
  "en/blog/index.html",
  "en/blog/modern-terminal-environment/index.html",
  "images",
  "_astro",
  "favicon.svg",
  "favicon.png",
  "apple_touch_icon.png",
  "rss.xml",
  "og_image.png",
  "og/articles/modern-terminal-environment.png",
  "_headers",
  "robots.txt",
  "sitemap-index.xml",
];

const requiredHtml = {
  "index.html": [
    "/ja/",
    "href=\"/favicon.png\"",
    "href=\"/favicon.svg\"",
    "href=\"/apple_touch_icon.png\"",
  ],
  "404.html": [
    "ページが見つかりません",
    "Page not found",
    "href=\"/ja/\"",
    "href=\"/en/\"",
    "content=\"noindex, nofollow\"",
  ],
  "ja/index.html": [
    "執行 凱斗",
    "ソフトウェア工学",
    "https://furedea.com/ja/",
    "/en/",
    "https://github.com/",
    "https://x.com/",
    "https://zenn.dev/",
    "href=\"/favicon.png\"",
    "href=\"/apple_touch_icon.png\"",
    "https://furedea.com/og_image.png",
    "summary_large_image",
  ],
  "en/index.html": [
    "Kaito Shigyo",
    "Software Engineering",
    "https://furedea.com/en/",
    "/ja/",
    "https://github.com/",
    "https://x.com/",
    "https://zenn.dev/",
  ],
  "ja/blog/index.html": ["Blog", "/ja/blog/modern-terminal-environment/"],
  "en/blog/index.html": ["Blog", "/en/blog/modern-terminal-environment/"],
};

async function checkExists(relativePath) {
  try {
    await access(join(distDir, relativePath));
    return undefined;
  } catch {
    return `Missing ${relativePath}`;
  }
}

async function checkContents(relativePath, expectedContents) {
  let html;
  try {
    html = await readFile(join(distDir, relativePath), "utf8");
  } catch {
    return [];
  }
  return expectedContents
    .filter((expected) => !html.includes(expected))
    .map((expected) => `${relativePath} does not include ${expected}`);
}

const [existenceResults, contentResults] = await Promise.all([
  Promise.all(requiredPaths.map(checkExists)),
  Promise.all(
    Object.entries(requiredHtml).map(([path, expected]) => checkContents(path, expected)),
  ),
]);

const failures = [
  ...existenceResults.filter((value) => value !== undefined),
  ...contentResults.flat(),
];

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Build output verified.");
