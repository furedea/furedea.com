import { expect, test } from "vitest";

import { newsSchema, publicationSchema } from "./site_record_schema";

test("rejects unknown publication fields", () => {
  const result = publicationSchema.safeParse({
    title: "A publication",
    authors: ["An Author"],
    venue: "A venue",
    year: 2026,
    type: "journal",
    unexpected: "value",
  });

  expect(result.success).toBe(false);
});

test("rejects news dates outside the ISO date format", () => {
  const result = newsSchema.safeParse({
    date: "August 12, 2026",
    title: { ja: "ニュース", en: "News" },
    type: "general",
  });

  expect(result.success).toBe(false);
});
