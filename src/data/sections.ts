export const HOME_SECTIONS = [
  "about",
  "works",
  "research",
  "publications",
  "blog",
  "contact",
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number];
