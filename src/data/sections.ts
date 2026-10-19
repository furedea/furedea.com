export const HOME_SECTIONS = [
  "about",
  "works",
  "research",
  "publications",
  "activities",
  "blog",
  "contact",
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number];
