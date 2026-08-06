import { resolve } from "node:path";

import { expect, test } from "vitest";

import { resolveArticleImagePath } from "./article_images";

test("resolves supported image requests inside the article image directory", () => {
  const imageRoot = "/workspace/images";

  expect(resolveArticleImagePath(imageRoot, "/example/diagram.png")).toBe(
    resolve(imageRoot, "example/diagram.png"),
  );
});

test("rejects article image paths that escape the image directory", () => {
  expect(resolveArticleImagePath("/workspace/images", "/../secret.png")).toBeUndefined();
});
