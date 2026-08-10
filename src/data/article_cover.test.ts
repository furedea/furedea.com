import sharp from "sharp";
import { expect, test } from "vitest";

import { createArticleCover } from "./article_cover";
import { renderArticleSocialPreview } from "./article_social_preview";

test("builds an article cover from canonical article metadata", () => {
  expect(
    createArticleCover("modern-terminal-environment", {
      title: "ぼくのかんがえたさいきょうのターミナル環境 2026",
      emoji: "📝",
      type: "tech",
      tags: ["terminal", "CLI", "TUI", "Zsh"],
    }),
  ).toMatchObject({
    title: "ぼくのかんがえたさいきょうのターミナル環境 2026",
    emoji: "📝",
    label: "TECH",
    topics: ["terminal", "CLI", "TUI"],
    theme: {
      backgroundStart: "#071528",
      backgroundEnd: "#173a69",
      glow: "#315fa3",
      accent: "#4af2c8",
    },
    socialPreview: {
      path: "/og/articles/modern-terminal-environment.png",
      width: 1200,
      height: 630,
    },
  });
});

test("renders an article cover as a standard large PNG", async () => {
  const cover = createArticleCover("modern-terminal-environment", {
    title: "ぼくのかんがえたさいきょうのターミナル環境 2026",
    emoji: "📝",
    type: "tech",
    tags: ["terminal", "CLI", "TUI"],
  });

  await expect(sharp(await renderArticleSocialPreview(cover)).metadata()).resolves.toMatchObject({
    format: "png",
    width: 1200,
    height: 630,
  });
});

test("renders a visible illustration in the article social preview", async () => {
  const cover = createArticleCover("modern-terminal-environment", {
    title: "ぼくのかんがえたさいきょうのターミナル環境 2026",
    emoji: "📝",
    type: "tech",
    tags: ["terminal", "CLI", "TUI"],
  });
  const image = sharp(await renderArticleSocialPreview(cover)).extract({
    left: 850,
    top: 170,
    width: 250,
    height: 330,
  });
  const { channels } = await image.stats();
  const meanBrightness = channels.slice(0, 3).reduce((sum, channel) => sum + channel.mean, 0) / 3;

  expect(meanBrightness).toBeGreaterThan(60);
});
