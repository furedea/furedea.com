import { expect, test } from "vitest";

import { transformZennMessages } from "./zenn_markdown";

test("renders Zenn messages as website callouts", () => {
  const tree = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: ":::message\nPreview every destination.\n:::" }],
      },
    ],
  };

  transformZennMessages(tree);

  expect(tree.children[0]).toMatchObject({
    type: "blockquote",
    data: {
      hName: "aside",
      hProperties: { className: ["article-message"] },
    },
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Preview every destination." }],
      },
    ],
  });
});
