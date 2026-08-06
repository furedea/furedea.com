import { expect, test } from "vitest";

import { publishArticlesToEsa, selectArticleSlugs } from "./article_publication";

const ACCESS_TOKEN = ["test", "value"].join("-");

test("selects root-level Zenn article files for reconciliation", () => {
  expect(
    selectArticleSlugs(["second-article.md", ".gitkeep", "first-article.md", "nested/article.md"]),
  ).toEqual(["first-article", "second-article"]);
});

test("publishes selected articles with their canonical website URLs", async () => {
  const publications: unknown[] = [];
  const source = `---
title: "First article"
emoji: "📝"
type: "tech"
topics: ["astro"]
published: true
published_at: 2026-08-06
---

Article body.
`;

  await expect(
    publishArticlesToEsa(["first-article"], {
      team: "example-team",
      category: "blog",
      accessToken: ACCESS_TOKEN,
      reader: async () => source,
      publisher: async (options) => {
        publications.push(options);
        return { number: 42, url: "https://example-team.esa.io/posts/42" };
      },
    }),
  ).resolves.toEqual([
    {
      slug: "first-article",
      number: 42,
      url: "https://example-team.esa.io/posts/42",
    },
  ]);
  expect(publications).toEqual([
    {
      team: "example-team",
      accessToken: ACCESS_TOKEN,
      canonicalUrl: "https://furedea.com/ja/blog/first-article/",
      payload: {
        post: {
          name: "First article",
          body_md:
            "Article body.\n\n---\n\nOriginally published at https://furedea.com/ja/blog/first-article/",
          tags: ["astro"],
          category: "blog",
          wip: false,
          message: "Sync from furedea.com.",
        },
      },
    },
  ]);
});
