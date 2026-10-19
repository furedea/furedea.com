import { expect, test } from "vitest";

import { activitySchema, publicationSchema } from "./site_record_schema";

test("rejects unknown publication fields", () => {
  const result = publicationSchema.safeParse({
    title: { ja: "発表", en: "A publication" },
    authors: [{ ja: "著者", en: "An Author" }],
    venue: { ja: "掲載誌", en: "A venue" },
    year: 2026,
    type: "journal",
    peerReviewed: true,
    unexpected: "value",
  });

  expect(result.success).toBe(false);
  expect(result.error?.issues).toContainEqual(
    expect.objectContaining({ code: "unrecognized_keys", keys: ["unexpected"] }),
  );
});

test("rejects activity dates outside the ISO date format", () => {
  const result = activitySchema.safeParse({
    date: "August 12, 2026",
    title: { ja: "ニュース", en: "News" },
    type: "general",
  });

  expect(result.success).toBe(false);
});

test("accepts a study-abroad activity with an end date", () => {
  const result = activitySchema.safeParse({
    date: "2024-08-16",
    endDate: "2024-09-23",
    title: { ja: "短期留学", en: "Study abroad" },
    type: "study-abroad",
  });

  expect(result.success).toBe(true);
});

test("rejects an activity that ends before it starts", () => {
  const result = activitySchema.safeParse({
    date: "2024-01-31",
    endDate: "2023-11-01",
    title: { ja: "採択", en: "Selection" },
    type: "selection",
  });

  expect(result.success).toBe(false);
});
