import { expect, test } from "vitest";

import { toNewsItems, toPublications } from "./site_records";

test("projects a publication announcement into news with the publication URL", () => {
  const items = toNewsItems([
    {
      title: "A publication",
      authors: ["First Author", "Second Author"],
      venue: "A venue",
      year: 2026,
      type: "workshop",
      url: "https://example.com/publication",
      news: {
        date: "2026-07-24",
        title: {
          ja: "研究発表を行いました．",
          en: "Presented our work.",
        },
        type: "talk",
      },
    },
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

test("orders projected and standalone news from newest to oldest", () => {
  const items = toNewsItems([
    {
      title: "A newer publication",
      authors: ["An Author"],
      venue: "A venue",
      year: 2026,
      type: "conference",
      news: {
        date: "2026-03-15",
        title: { ja: "新しい発表", en: "Newer announcement" },
        type: "paper",
      },
    },
    {
      date: "2025-08-01",
      title: { ja: "古いニュース", en: "Older news" },
      type: "general",
    },
  ]);

  expect(items.map(({ date }) => date)).toEqual(["2026-03-15", "2025-08-01"]);
});

test("formats a publication author list for display", () => {
  const items = toPublications([
    {
      title: "A publication",
      authors: ["First Author", "Second Author"],
      venue: "A venue",
      year: 2026,
      type: "journal",
    },
  ]);

  expect(items[0]?.authors).toBe("First Author, Second Author");
});

test("orders publications from newest to oldest", () => {
  const items = toPublications([
    {
      title: "Older publication",
      authors: ["An Author"],
      venue: "A venue",
      year: 2025,
      type: "conference",
    },
    {
      title: "Newer publication",
      authors: ["An Author"],
      venue: "A venue",
      year: 2026,
      type: "journal",
    },
  ]);

  expect(items.map(({ title }) => title)).toEqual(["Newer publication", "Older publication"]);
});
