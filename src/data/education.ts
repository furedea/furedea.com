import type { LocalizedText } from "@i18n/ui";

interface EducationEntry {
  year: string;
  institution: LocalizedText;
  detail: LocalizedText;
}

export const education: EducationEntry[] = [
  {
    year: "2026-",
    institution: {
      ja: "九州大学大学院 システム情報科学府",
      en: "Graduate School of Information Science and Electrical Engineering, Kyushu University",
    },
    detail: {
      ja: "情報理工学専攻",
      en: "Department of Information Science and Technology",
    },
  },
  {
    year: "2022-2026",
    institution: {
      ja: "九州大学 工学部",
      en: "Faculty of Engineering, Kyushu University",
    },
    detail: {
      ja: "電気情報工学科",
      en: "Department of Electrical Engineering and Computer Science",
    },
  },
];
