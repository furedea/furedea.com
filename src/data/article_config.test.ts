import { readFile } from "node:fs/promises";

import { expect, test } from "vitest";

import { parseArticleConfig } from "./article_config";

test("parses project-owned esa publishing settings", async () => {
  const source = await readFile(new URL("../../article_config.json", import.meta.url), "utf8");

  expect(parseArticleConfig(source)).toEqual({
    esa: {
      team: "posl",
      category: "blog",
    },
  });
});
