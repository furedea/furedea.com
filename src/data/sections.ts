import { profile } from "./profile";

export const HOME_SECTIONS = [
  "about",
  "research",
  "publications",
  "news",
  "blog",
  "contact",
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number];

export function getVisibleHomeSections(): HomeSectionId[] {
  return HOME_SECTIONS.filter((id) => id !== "contact" || profile.email !== undefined);
}
