import { isZennSlug, parseZennArticleSource, toEsaPostPayload } from "../data/article.ts";
import { upsertEsaPost, type EsaPostResult, type EsaUpserterOptions } from "./esa.ts";

type ArticleReader = (slug: string) => Promise<string>;
type EsaPublisher = (options: EsaUpserterOptions) => Promise<EsaPostResult>;

interface ArticlePublisherOptions {
  team: string;
  category: string;
  accessToken: string;
  reader: ArticleReader;
  publisher?: EsaPublisher;
}

interface ArticlePublicationResult extends EsaPostResult {
  slug: string;
}

export function selectArticleSlugs(fileNames: string[]): string[] {
  const slugs = fileNames
    .filter((fileName) => !fileName.includes("/") && fileName.endsWith(".md"))
    .map(toArticleSlug);
  return [...new Set(slugs)].sort();
}

export async function publishArticlesToEsa(
  slugs: string[],
  options: ArticlePublisherOptions,
): Promise<ArticlePublicationResult[]> {
  const results: ArticlePublicationResult[] = [];
  for (const slug of slugs) {
    const article = parseZennArticleSource(await options.reader(slug));
    const canonicalUrl = new URL(`/ja/blog/${slug}/`, "https://furedea.com").href;
    const payload = toEsaPostPayload(article.metadata, article.markdown, {
      canonicalUrl,
      category: options.category,
    });
    const result = await (options.publisher ?? upsertEsaPost)({
      team: options.team,
      accessToken: options.accessToken,
      canonicalUrl,
      payload,
    });
    results.push({ slug, ...result });
  }
  return results;
}

function toArticleSlug(fileName: string): string {
  const slug = /^([^/]+)\.md$/u.exec(fileName)?.[1];
  if (slug === undefined || !isZennSlug(slug)) {
    throw new Error(`Invalid Zenn article file: ${fileName}`);
  }
  return slug;
}
