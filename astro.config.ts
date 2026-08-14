import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import articleImageAttributes from "./src/integrations/article_image_attributes";
import articleImages from "./src/integrations/article_images";
import zennMarkdown from "./src/integrations/zenn_markdown";

export default defineConfig({
  site: "https://furedea.com",
  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [articleImages(), sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [zennMarkdown],
      rehypePlugins: [articleImageAttributes],
    }),
  },
  devToolbar: {
    enabled: false,
  },
});
