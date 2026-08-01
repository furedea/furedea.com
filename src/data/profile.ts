import type { LocalizedText } from "@i18n/ui";

export type SocialIcon = "github" | "x" | "zenn";

interface SocialLink {
  platform: string;
  url: string;
  icon: SocialIcon;
}

interface Profile {
  name: LocalizedText;
  title: LocalizedText;
  researchArea: LocalizedText;
  affiliation: LocalizedText;
  department: LocalizedText;
  university: LocalizedText;
  email: string;
  socialLinks: SocialLink[];
}

export const profile: Profile = {
  name: { ja: "執行 凱斗", en: "Kaito Shigyo" },
  title: { ja: "修士課程学生", en: "Master's Student" },
  researchArea: { ja: "ソフトウェア工学", en: "Software Engineering" },
  affiliation: { ja: "POSL研究室", en: "POSL Lab" },
  department: {
    ja: "大学院システム情報科学府",
    en: "Graduate School of Information Science and Electrical Engineering",
  },
  university: { ja: "九州大学", en: "Kyushu University" },
  email: "shigyo@posl.ait.kyushu-u.ac.jp",
  socialLinks: [
    { platform: "GitHub", url: "https://github.com/furedea", icon: "github" },
    { platform: "X", url: "https://x.com/furedea596", icon: "x" },
    { platform: "Zenn", url: "https://zenn.dev/furedea", icon: "zenn" },
  ],
};
