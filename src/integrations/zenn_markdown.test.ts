import { expect, test } from "vitest";

import { transformZennExtensions } from "./zenn_markdown";

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

  transformZennExtensions(tree);

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

test("renders multi-paragraph Zenn messages as website callouts", () => {
  const tree = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: ":::message" }],
      },
      {
        type: "paragraph",
        children: [{ type: "text", value: "First paragraph." }],
      },
      {
        type: "paragraph",
        children: [{ type: "text", value: "Second paragraph." }],
      },
      {
        type: "paragraph",
        children: [{ type: "text", value: ":::" }],
      },
    ],
  };

  transformZennExtensions(tree);

  expect(tree.children).toMatchObject([
    {
      type: "container",
      data: {
        hName: "aside",
        hProperties: { className: ["article-message"] },
      },
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "First paragraph." }],
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "Second paragraph." }],
        },
      ],
    },
  ]);
});

test("renders Zenn details as website disclosure widgets", () => {
  const tree = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: ":::details Configuration" }],
      },
      {
        type: "paragraph",
        children: [{ type: "text", value: "Hidden content." }],
      },
      {
        type: "paragraph",
        children: [{ type: "text", value: ":::" }],
      },
    ],
  };

  transformZennExtensions(tree);

  expect(tree.children).toMatchObject([
    {
      type: "container",
      data: {
        hName: "details",
        hProperties: { className: ["article-details"] },
      },
      children: [
        {
          type: "paragraph",
          data: { hName: "summary", hProperties: {} },
          children: [{ type: "text", value: "Configuration" }],
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "Hidden content." }],
        },
      ],
    },
  ]);
});

test("renders Zenn details when the closing marker follows content directly", () => {
  const tree = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: ":::details Configuration" }],
      },
      {
        type: "paragraph",
        children: [{ type: "text", value: "Hidden content.\n:::" }],
      },
    ],
  };

  transformZennExtensions(tree);

  expect(tree.children).toMatchObject([
    {
      type: "container",
      data: { hName: "details" },
      children: [
        { data: { hName: "summary" } },
        {
          type: "paragraph",
          children: [{ type: "text", value: "Hidden content." }],
        },
      ],
    },
  ]);
});

test("renders emphasized text after an image as a website caption", () => {
  const tree = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "image", url: "/images/example.gif", alt: "Example" },
          { type: "text", value: "\n" },
          {
            type: "emphasis",
            children: [{ type: "text", value: "Animated example." }],
          },
        ],
      },
    ],
  };

  transformZennExtensions(tree);

  expect(tree.children).toMatchObject([
    {
      type: "container",
      data: {
        hName: "figure",
        hProperties: { className: ["article-figure"] },
      },
      children: [
        {
          type: "paragraph",
          children: [{ type: "image", url: "/images/example.gif", alt: "Example" }],
        },
        {
          type: "paragraph",
          data: {
            hName: "figcaption",
            hProperties: { className: ["article-figure-caption"] },
          },
          children: [
            {
              type: "emphasis",
              children: [{ type: "text", value: "Animated example." }],
            },
          ],
        },
      ],
    },
  ]);
});
