import type { ArticleCover } from "@data/article_cover";
import { createArticleCover } from "@data/article_cover";
import { renderArticleSocialPreview } from "@data/article_social_preview";
import { getLocalizedPosts } from "@data/blog";
import type { APIContext } from "astro";

interface StaticPathProps {
  cover: ArticleCover;
}

export async function getStaticPaths() {
  const posts = await getLocalizedPosts("ja");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { cover: createArticleCover(post.id, post) } satisfies StaticPathProps,
  }));
}

export async function GET({ props }: APIContext): Promise<Response> {
  const { cover } = props as StaticPathProps;
  const image = await renderArticleSocialPreview(cover);
  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
