export const languages = {
  ja: "JA",
  en: "EN",
} as const;
export type Lang = keyof typeof languages;

export interface LocalizedText {
  ja: string;
  en: string;
}

export const ui = {
  ja: {
    "nav.home": "ホーム",
    "nav.about": "概要",
    "nav.research": "研究",
    "nav.publications": "業績",
    "nav.news": "ニュース",
    "nav.blog": "ブログ",
    "nav.contact": "連絡先",
    "section.about": "About",
    "section.research": "Research",
    "section.publications": "Publications",
    "section.news": "News",
    "section.blog": "Blog",
    "section.contact": "Contact",
    "about.education": "学歴",
    "blog.readMore": "続きを読む",
    "blog.allPosts": "すべての記事を見る",
    "blog.backToList": "記事一覧に戻る",
    "blog.publishedOn": "公開日",
    "blog.empty": "記事はまだありません",
    "common.menu": "Menu",
    "common.skipToContent": "Skip to content",
    "contact.email": "Email",
    "footer.copyright": "All rights reserved.",
    "news.empty": "ニュースはまだありません",
    "publications.empty": "準備中",
  },
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.research": "Research",
    "nav.publications": "Publications",
    "nav.news": "News",
    "nav.blog": "Blog",
    "nav.contact": "Contact",
    "section.about": "About",
    "section.research": "Research",
    "section.publications": "Publications",
    "section.news": "News",
    "section.blog": "Blog",
    "section.contact": "Contact",
    "about.education": "Education",
    "blog.readMore": "Read more",
    "blog.allPosts": "View all posts",
    "blog.backToList": "Back to posts",
    "blog.publishedOn": "Published on",
    "blog.empty": "No posts yet",
    "common.menu": "Menu",
    "common.skipToContent": "Skip to content",
    "contact.email": "Email",
    "footer.copyright": "All rights reserved.",
    "news.empty": "No news yet",
    "publications.empty": "Coming soon",
  },
} as const;
