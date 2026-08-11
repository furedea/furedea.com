import { expect, test } from "vitest";

import { newsSchema, publicationSchema } from "./site_record_schema";

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

test("rejects news dates outside the ISO date format", () => {
  const result = newsSchema.safeParse({
    date: "August 12, 2026",
    title: { ja: "ニュース", en: "News" },
    type: "general",
  });

  expect(result.success).toBe(false);
});
