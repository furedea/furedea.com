import sharp from "sharp";
import { expect, test } from "vitest";

import { createArticleCover } from "./article_cover";
import {
  createArticleSocialPreviewSvg,
  renderArticleSocialPreview,
} from "./article_social_preview";

const ARTICLE_METADATA = {
  title: "A durable test fixture",
  emoji: "🧪",
  type: "tech" as const,
  tags: ["testing", "specification", "automation", "ignored"],
};

test("builds an article cover from article metadata", () => {
  expect(createArticleCover("fixture-article", ARTICLE_METADATA)).toMatchObject({
    title: ARTICLE_METADATA.title,
    emoji: ARTICLE_METADATA.emoji,
    label: "TECH",
    topics: ARTICLE_METADATA.tags.slice(0, 3),
    theme: {
      backgroundStart: "#071528",
      backgroundEnd: "#173a69",
      glow: "#315fa3",
      accent: "#4af2c8",
    },
    socialPreview: {
      path: "/og/articles/fixture-article.png",
      width: 1200,
      height: 630,
    },
  });
});

test("renders an article cover as a standard large PNG", async () => {
  const cover = createArticleCover("fixture-article", ARTICLE_METADATA);

  await expect(sharp(await renderArticleSocialPreview(cover)).metadata()).resolves.toMatchObject({
    format: "png",
    width: 1200,
    height: 630,
  });
});

test("includes a semantic illustration in the article social preview", () => {
  const cover = createArticleCover("fixture-article", ARTICLE_METADATA);
  const svg = createArticleSocialPreviewSvg(cover);

  expect(svg).toContain('role="img"');
  expect(svg).toContain(`aria-label="${ARTICLE_METADATA.emoji}"`);
});
