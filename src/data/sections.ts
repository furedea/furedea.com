export const HOME_SECTIONS = [
  "about",
  "research",
  "publications",
  "news",
  "blog",
  "contact",
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number];
