import sharp from "sharp";

import type { ArticleCover } from "./article_cover";
import { ARTICLE_SOCIAL_PREVIEW_SIZE } from "./article_cover";

const TITLE_LINE_WIDTH = 14;
const TITLE_LINE_LIMIT = 3;

export async function renderArticleSocialPreview(cover: ArticleCover): Promise<Buffer> {
  const svg = createArticleSocialPreviewSvg(cover);
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function createArticleSocialPreviewSvg(cover: ArticleCover): string {
  const { width, height } = ARTICLE_SOCIAL_PREVIEW_SIZE;
  const titleLines = wrapTitle(cover.title)
    .map((line, index) => `<tspan x="72" y="${142 + index * 78}">${escapeXml(line)}</tspan>`)
    .join("");
  const topics = escapeXml(cover.topics.join(" · "));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${cover.theme.backgroundStart}" />
      <stop offset="1" stop-color="${cover.theme.backgroundEnd}" />
    </linearGradient>
    <radialGradient id="glow">
      <stop offset="0" stop-color="${cover.theme.glow}" stop-opacity="0.92" />
      <stop offset="1" stop-color="${cover.theme.glow}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#background)" />
  <circle cx="960" cy="290" r="300" fill="url(#glow)" opacity="0.72" />
  <text fill="#f4f4f5" font-family="Noto Sans JP, Hiragino Sans, Yu Gothic, sans-serif" font-size="52" font-weight="700">${titleLines}</text>
  <rect x="72" y="395" width="50" height="7" rx="3.5" fill="${cover.theme.accent}" />
  <text x="144" y="410" fill="#f4f4f5" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="2">${escapeXml(cover.label)}</text>
  <text x="72" y="470" fill="#d4d4d8" font-family="Inter, Arial, sans-serif" font-size="28">${topics}</text>
  <text x="72" y="558" fill="${cover.theme.accent}" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600">furedea.com</text>
  ${createArticleIllustrationSvg(cover.emoji)}
</svg>`;
}

function createArticleIllustrationSvg(emoji: string): string {
  return `<g role="img" aria-label="${escapeXml(emoji)}" transform="translate(862 142)">
    <rect x="24" y="55" width="224" height="276" rx="28" fill="#63b3ed" opacity="0.42" />
    <rect x="12" y="42" width="224" height="276" rx="28" fill="#f4f4f5" />
    <g fill="#64748b">
      <rect x="42" y="20" width="18" height="58" rx="9" />
      <rect x="86" y="20" width="18" height="58" rx="9" />
      <rect x="130" y="20" width="18" height="58" rx="9" />
      <rect x="174" y="20" width="18" height="58" rx="9" />
    </g>
    <g fill="#d4d4d8">
      <rect x="48" y="112" width="152" height="10" rx="5" />
      <rect x="48" y="154" width="152" height="10" rx="5" />
      <rect x="48" y="196" width="112" height="10" rx="5" />
      <rect x="48" y="238" width="132" height="10" rx="5" />
    </g>
    <g transform="rotate(38 190 190)">
      <rect x="174" y="72" width="38" height="190" rx="12" fill="#fbbf24" />
      <rect x="174" y="72" width="38" height="34" rx="10" fill="#fb7185" />
      <rect x="174" y="100" width="38" height="14" fill="#a1a1aa" />
      <path d="M174 250h38l-19 42z" fill="#e7c59a" />
      <path d="M186 277h14l-7 15z" fill="#27272a" />
    </g>
  </g>`;
}

function wrapTitle(title: string): string[] {
  const segments = [...new Intl.Segmenter("ja", { granularity: "word" }).segment(title)].map(
    ({ segment }) => segment,
  );
  const lines = segments.reduce<string[]>(
    (result, segment) => {
      const current = result.at(-1) ?? "";
      if (current.length === 0 || visualWidth(current + segment) <= TITLE_LINE_WIDTH) {
        result[result.length - 1] = current + segment;
        return result;
      }
      result.push(segment.trimStart());
      return result;
    },
    [""],
  );
  return limitLines(lines);
}

function limitLines(lines: string[]): string[] {
  if (lines.length <= TITLE_LINE_LIMIT) {
    return lines;
  }
  const visible = lines.slice(0, TITLE_LINE_LIMIT);
  visible[TITLE_LINE_LIMIT - 1] = truncate(`${visible.at(-1)}${lines.slice(3).join("")}`);
  return visible;
}

function truncate(value: string): string {
  const characters = [...value];
  while (visualWidth(`${characters.join("")}…`) > TITLE_LINE_WIDTH) {
    characters.pop();
  }
  return `${characters.join("").trimEnd()}…`;
}

function visualWidth(value: string): number {
  return [...value].reduce((width, character) => {
    if (/\s/u.test(character)) {
      return width + 0.3;
    }
    return width + (character.codePointAt(0)! <= 0xff ? 0.55 : 1);
  }, 0);
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/gu, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character]!;
  });
}
