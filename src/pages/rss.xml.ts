import rss from "@astrojs/rss";
import { getLocalizedPosts } from "@data/blog";
import { profile } from "@data/profile";
import { site } from "@data/site";
import { pickLocale } from "@i18n/utils";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  if (context.site === undefined) {
    throw new Error("RSS generation requires the configured site URL.");
  }
  const posts = await getLocalizedPosts("ja");
  return rss({
    title: `${profile.name.en} — Blog`,
    description: pickLocale(site.blogDescription, "ja"),
    site: new URL("/ja/blog/", context.site),
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      pubDate: post.date,
      link: `/ja/blog/${post.id}/`,
      categories: post.tags,
    })),
    customData: "<language>ja</language>",
  });
}
