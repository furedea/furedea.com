export function getArticleDescription(markdown: string): string {
  return (
    markdown
      .trim()
      .split(/\n\s*\n/u)
      .map((block) => block.trim())
      .find(isProseParagraph) ?? ""
  );
}

interface ZennArticleMetadata {
  title: string;
  emoji: string;
  type: "tech" | "idea";
  topics: string[];
  published: boolean;
  published_at: Date;
}

export interface WebsiteArticleMetadata {
  title: string;
  description: string;
  date: Date;
  tags: string[];
}

interface ZennArticleSource {
  metadata: ZennArticleMetadata;
  markdown: string;
}

class ArticleSourceError extends Error {}

export const ZENN_SLUG_PATTERN = /^[a-z0-9_-]{12,50}$/u;

export function isZennSlug(value: string): boolean {
  return ZENN_SLUG_PATTERN.test(value);
}

export function parseArticleSlug(arguments_: string[], usage: string): string {
  const normalizedArguments = arguments_[0] === "--" ? arguments_.slice(1) : arguments_;
  const slug = normalizedArguments[0];
  if (normalizedArguments.length !== 1 || slug === undefined || !isZennSlug(slug)) {
    throw new Error(usage);
  }
  return slug;
}

export function createZennArticleTemplate(now: Date): string {
  return `---
title: ""
emoji: "📝"
type: "tech"
topics: []
published: false
published_at: ${toJapaneseDate(now)}
---

Write the article here.
`;
}

export function isVisibleArticle(isPublished: boolean, includesDrafts: boolean): boolean {
  return isPublished || includesDrafts;
}

export function parseZennArticleSource(source: string): ZennArticleSource {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/u.exec(source);
  if (match === null) {
    throw new ArticleSourceError("Article must start with YAML frontmatter.");
  }

  const values = new Map(
    match[1]
      .split(/\r?\n/u)
      .filter((line) => line.trim().length > 0)
      .map(parseFrontmatterLine),
  );
  return {
    metadata: {
      title: parseString(values, "title"),
      emoji: parseString(values, "emoji"),
      type: parseArticleType(values),
      topics: parseTopics(values),
      published: parseBoolean(values, "published"),
      published_at: parsePublishedAt(values),
    },
    markdown: match[2],
  };
}

export function toWebsiteArticleMetadata(
  metadata: ZennArticleMetadata,
  markdown: string,
): WebsiteArticleMetadata {
  return {
    title: metadata.title,
    description: getArticleDescription(markdown),
    date: metadata.published_at,
    tags: metadata.topics,
  };
}

interface EsaMarkdownOptions {
  canonicalUrl: string;
}

interface EsaPostOptions extends EsaMarkdownOptions {
  category: string;
}

export interface EsaPostPayload {
  post: {
    name: string;
    body_md: string;
    tags: string[];
    category: string;
    wip: boolean;
    message: string;
  };
}

export function toEsaPostPayload(
  metadata: ZennArticleMetadata,
  markdown: string,
  options: EsaPostOptions,
): EsaPostPayload {
  return {
    post: {
      name: metadata.title,
      body_md: toEsaMarkdown(markdown, options),
      tags: [...metadata.topics],
      category: options.category,
      wip: !metadata.published,
      message: "Sync from furedea.com.",
    },
  };
}

export function toEsaMarkdown(markdown: string, options: EsaMarkdownOptions): string {
  const origin = new URL(options.canonicalUrl).origin;
  const images = replaceImageUrls(markdown, origin);
  const body = transformOutsideFences(images, (prose) =>
    convertDetails(convertMessages(convertCaptions(prose))),
  );
  return `${body.trim()}\n\n---\n\nOriginally published at ${options.canonicalUrl}`;
}

function transformOutsideFences(markdown: string, transform: (prose: string) => string): string {
  const fencedBlocks: string[] = [];
  const protectedMarkdown = protectFencedBlocks(markdown, fencedBlocks);
  return restoreFencedBlocks(transform(protectedMarkdown), fencedBlocks);
}

function protectFencedBlocks(markdown: string, fencedBlocks: string[]): string {
  const lines = markdown.split("\n");
  const protectedLines: string[] = [];
  let fence: { character: string; length: number; lines: string[] } | undefined;

  for (const line of lines) {
    const marker = /^(?:\s*)(`{3,}|~{3,})/u.exec(line)?.[1];
    if (fence === undefined && marker !== undefined) {
      fence = { character: marker[0], length: marker.length, lines: [line] };
      continue;
    }
    if (fence !== undefined) {
      fence.lines.push(line);
      if (marker?.[0] === fence.character && marker.length >= fence.length) {
        protectedLines.push(storeFencedBlock(fence.lines, fencedBlocks));
        fence = undefined;
      }
      continue;
    }
    protectedLines.push(line);
  }

  if (fence !== undefined) {
    protectedLines.push(storeFencedBlock(fence.lines, fencedBlocks));
  }
  return protectedLines.join("\n");
}

function storeFencedBlock(lines: string[], fencedBlocks: string[]): string {
  const index = fencedBlocks.push(lines.join("\n")) - 1;
  return `@@FUREDEA_FENCED_BLOCK_${index}@@`;
}

function restoreFencedBlocks(markdown: string, fencedBlocks: string[]): string {
  return markdown.replace(/@@FUREDEA_FENCED_BLOCK_(\d+)@@/gu, (_match, index: string) => {
    return fencedBlocks[Number(index)];
  });
}

function convertCaptions(markdown: string): string {
  return markdown.replace(
    /^!\[([^\]]*)\]\(([^)\s]+)\)\n([_*])(.+)\3$/gmu,
    (_match, alt: string, url: string, _delimiter: string, caption: string) => {
      return [
        "<figure>",
        `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}">`,
        `<figcaption style="text-align: center;"><em>${escapeHtml(caption)}</em></figcaption>`,
        "</figure>",
      ].join("\n");
    },
  );
}

function replaceImageUrls(markdown: string, origin: string): string {
  let fence: string | undefined;
  return markdown
    .split("\n")
    .map((line) => {
      const marker = /^(?:\s*)(`{3,}|~{3,})/u.exec(line)?.[1];
      if (marker !== undefined && (fence === undefined || marker[0] === fence[0])) {
        fence = fence === undefined ? marker : undefined;
        return line;
      }
      return fence === undefined
        ? line.replace(/(!\[[^\]]*\]\()\/images\//gu, `$1${origin}/images/`)
        : line;
    })
    .join("\n");
}

function convertMessages(markdown: string): string {
  return markdown.replace(/^:::message\n([\s\S]*?)\n:::$/gmu, (_match, content: string) => {
    const quotedContent = content
      .split("\n")
      .map((line) => `> ${line}`.trimEnd())
      .join("\n");
    return `> **Note**\n>\n${quotedContent}`;
  });
}

function convertDetails(markdown: string): string {
  return markdown.replace(
    /^:::details\s+(.+)\n([\s\S]*?)\n:::$/gmu,
    (_match, title: string, content: string) => {
      return `<details>\n<summary>${escapeHtml(title)}</summary>\n\n${content.trim()}\n\n</details>`;
    },
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseFrontmatterLine(line: string): [string, string] {
  const match = /^([a-z_]+):\s*(.+)$/u.exec(line);
  if (match === null) {
    throw new ArticleSourceError(`Unsupported frontmatter line: ${line}`);
  }
  return [match[1], stripYamlComment(match[2]).trim()];
}

function stripYamlComment(value: string): string {
  let isQuoted = false;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '"' && value[index - 1] !== "\\") {
      isQuoted = !isQuoted;
    }
    if (!isQuoted && value[index] === "#" && value[index - 1] === " ") {
      return value.slice(0, index).trimEnd();
    }
  }
  return value;
}

function parseString(values: Map<string, string>, key: string): string {
  const value = requireValue(values, key);
  if (!value.startsWith('"')) {
    return value;
  }
  const parsed: unknown = JSON.parse(value);
  if (typeof parsed !== "string" || parsed.length === 0) {
    throw new ArticleSourceError(`${key} must be a non-empty string.`);
  }
  return parsed;
}

function parseArticleType(values: Map<string, string>): "tech" | "idea" {
  const value = parseString(values, "type");
  if (value !== "tech" && value !== "idea") {
    throw new ArticleSourceError("type must be tech or idea.");
  }
  return value;
}

function parseTopics(values: Map<string, string>): string[] {
  const parsed: unknown = JSON.parse(requireValue(values, "topics"));
  if (
    !Array.isArray(parsed) ||
    parsed.length > 5 ||
    !parsed.every((topic) => typeof topic === "string" && topic.length > 0)
  ) {
    throw new ArticleSourceError("topics must contain at most five non-empty strings.");
  }
  return parsed;
}

function parseBoolean(values: Map<string, string>, key: string): boolean {
  const value = requireValue(values, key);
  if (value !== "true" && value !== "false") {
    throw new ArticleSourceError(`${key} must be true or false.`);
  }
  return value === "true";
}

function parsePublishedAt(values: Map<string, string>): Date {
  const value = requireValue(values, "published_at");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ArticleSourceError("published_at must be a valid date.");
  }
  return date;
}

function requireValue(values: Map<string, string>, key: string): string {
  const value = values.get(key);
  if (value === undefined) {
    throw new ArticleSourceError(`Missing ${key} frontmatter.`);
  }
  return value;
}

function isProseParagraph(block: string): boolean {
  return block.length > 0 && !/^(?:#|!\[|```|:::|>|[-*+] |\d+\. )/u.test(block);
}

function toJapaneseDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}
