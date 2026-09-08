import { parseFrontmatter } from "@astrojs/markdown-remark";

import { articleSchema, type ZennArticleMetadata } from "./article_schema.ts";

export function getArticleDescription(markdown: string): string {
  return (
    markdown
      .trim()
      .split(/\n\s*\n/u)
      .map((block) => block.trim())
      .find(isProseParagraph) ?? ""
  );
}

export interface WebsiteArticleMetadata {
  title: string;
  description: string;
  date: Date;
  emoji: string;
  type: "tech" | "idea";
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

  return {
    metadata: articleSchema.parse(parseFrontmatter(source).frontmatter),
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
    emoji: metadata.emoji,
    type: metadata.type,
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
  const body = transformOutsideFences(markdown, (prose) =>
    convertDetails(convertMessages(convertCaptions(replaceImageUrls(prose, origin)))),
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
      const closing = /^ {0,3}(`{3,}|~{3,})[ \t]*\r?$/u.exec(line)?.[1];
      if (closing?.[0] === fence.character && closing.length >= fence.length) {
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
  return markdown.replace(/(!\[[^\]]*\]\()\/images\//gu, `$1${origin}/images/`);
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
