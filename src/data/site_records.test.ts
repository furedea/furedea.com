import { expect, test } from "vitest";

import type { PublicationRecord } from "./site_record_schema";
import { formatActivityPeriod, toActivities, toPublications } from "./site_records";

test("uses Japanese publication metadata on Japanese pages", () => {
  const items = toPublications(
    [
      publication({
        title: { ja: "日本語題目", en: "English title" },
        authors: [
          { ja: "第一 著者", en: "First Author" },
          { ja: "第二 著者", en: "Second Author" },
        ],
        venue: { ja: "日本語掲載誌", en: "English venue" },
      }),
    ],
    "ja",
  );

  expect(items[0]).toMatchObject({
    title: "日本語題目",
    authors: "第一 著者，第二 著者",
    venue: "日本語掲載誌",
  });
});

test("projects a publication announcement into activities with the publication URL", () => {
  const items = toActivities([
    publication({
      url: "https://example.com/publication",
      activity: {
        date: "2026-07-24",
        title: {
          ja: "研究発表を行いました．",
          en: "Presented our work.",
        },
        type: "talk",
      },
    }),
  ]);

  expect(items).toEqual([
    {
      date: "2026-07-24",
      title: {
        ja: "研究発表を行いました．",
        en: "Presented our work.",
      },
      type: "talk",
      url: "https://example.com/publication",
    },
  ]);
});

test("links a publication announcement to its own event page when given", () => {
  const items = toActivities([
    publication({
      url: "https://example.com/publication",
      activity: {
        date: "2026-07-24",
        title: { ja: "研究発表を行いました．", en: "Presented our work." },
        url: "https://example.com/event",
        type: "talk",
      },
    }),
  ]);

  expect(items[0]?.url).toBe("https://example.com/event");
});

test("orders projected and standalone activities from newest to oldest", () => {
  const items = toActivities([
    publication({
      activity: {
        date: "2026-03-15",
        title: { ja: "新しい発表", en: "Newer announcement" },
        type: "paper",
      },
    }),
    {
      date: "2025-08-01",
      title: { ja: "古いニュース", en: "Older news" },
      type: "general",
    },
  ]);

  expect(items.map(({ date }) => date)).toEqual(["2026-03-15", "2025-08-01"]);
});

test("shows a single-day activity as its month", () => {
  expect(formatActivityPeriod({ date: "2026-07-24" })).toBe("2026.07");
});

test("shows an activity period from its start month to its end month", () => {
  expect(formatActivityPeriod({ date: "2023-11-01", endDate: "2024-01-31" })).toBe(
    "2023.11–2024.01",
  );
});

test("formats a publication author list for display", () => {
  const items = toPublications(
    [
      publication({
        authors: [
          { ja: "第一 著者", en: "First Author" },
          { ja: "第二 著者", en: "Second Author" },
        ],
      }),
    ],
    "en",
  );

  expect(items[0]?.authors).toBe("First Author, Second Author");
});

test("orders publications from newest to oldest", () => {
  const items = toPublications(
    [
      publication({
        title: { ja: "古い論文", en: "Older publication" },
        year: 2025,
      }),
      publication({
        title: { ja: "新しい論文", en: "Newer publication" },
        year: 2026,
      }),
    ],
    "en",
  );

  expect(items.map(({ title }) => title)).toEqual(["Newer publication", "Older publication"]);
});

function publication(overrides: Partial<PublicationRecord> = {}): PublicationRecord {
  return {
    title: { ja: "発表", en: "A publication" },
    authors: [{ ja: "著者", en: "An Author" }],
    venue: { ja: "掲載誌", en: "A venue" },
    year: 2026,
    type: "journal",
    peerReviewed: true,
    ...overrides,
  };
}
