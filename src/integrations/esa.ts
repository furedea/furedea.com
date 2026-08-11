import type { EsaPostPayload } from "../data/article.ts";

export interface EsaPostResult {
  number: number;
  url: string;
}

interface EsaPublisherOptions {
  team: string;
  accessToken: string;
  postNumber?: number;
  payload: EsaPostPayload;
  fetcher?: typeof fetch;
}

interface EsaFinderOptions {
  team: string;
  accessToken: string;
  canonicalUrl: string;
  fetcher?: typeof fetch;
}

export interface EsaUpserterOptions extends EsaFinderOptions {
  payload: EsaPostPayload;
}

interface EsaPostSummary extends EsaPostResult {
  name: string;
  body_md: string;
  tags: string[];
  category: string | null;
  wip: boolean;
}

export async function findEsaPost(options: EsaFinderOptions): Promise<EsaPostResult | undefined> {
  const match = await findEsaPostSummary(options);
  return match === undefined ? undefined : toEsaPostResult(match);
}

export async function upsertEsaPost(options: EsaUpserterOptions): Promise<EsaPostResult> {
  const existingPost = await findEsaPostSummary(options);
  if (existingPost !== undefined && hasSameContent(existingPost, options.payload)) {
    return toEsaPostResult(existingPost);
  }
  return publishEsaPost({
    team: options.team,
    accessToken: options.accessToken,
    postNumber: existingPost?.number,
    payload: shouldSkipNotices(existingPost, options.payload)
      ? skipNotices(options.payload)
      : options.payload,
    fetcher: options.fetcher,
  });
}

function shouldSkipNotices(
  existingPost: EsaPostSummary | undefined,
  payload: EsaPostPayload,
): boolean {
  return existingPost?.wip === false && payload.post.wip === false;
}

function skipNotices(payload: EsaPostPayload): EsaPostPayload {
  return {
    post: {
      ...payload.post,
      message: `${payload.post.message} [skip notice]`,
    },
  };
}

async function findEsaPostSummary(options: EsaFinderOptions): Promise<EsaPostSummary | undefined> {
  const endpoint = new URL(getEndpoint(options.team, undefined));
  endpoint.searchParams.set("q", `body:"${options.canonicalUrl}"`);
  endpoint.searchParams.set("per_page", "100");
  const response = await (options.fetcher ?? fetch)(endpoint, {
    headers: { Authorization: `Bearer ${options.accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`esa API request failed with ${response.status}.`);
  }

  const result: unknown = await response.json();
  if (!isEsaPostSearchResult(result)) {
    throw new Error("esa API returned an invalid post search response.");
  }

  const marker = `Originally published at ${options.canonicalUrl}`;
  const matches = result.posts.filter((post) => post.body_md.includes(marker));
  if (matches.length > 1) {
    throw new Error(`Multiple esa posts reference ${options.canonicalUrl}.`);
  }
  const match = matches[0];
  return match;
}

export async function publishEsaPost(options: EsaPublisherOptions): Promise<EsaPostResult> {
  const endpoint = getEndpoint(options.team, options.postNumber);
  const response = await (options.fetcher ?? fetch)(endpoint, {
    method: options.postNumber === undefined ? "POST" : "PATCH",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options.payload),
  });

  if (!response.ok) {
    throw new Error(`esa API request failed with ${response.status}.`);
  }

  const result: unknown = await response.json();
  if (!isEsaPostResult(result)) {
    throw new Error("esa API returned an invalid post response.");
  }
  return result;
}

function getEndpoint(team: string, postNumber: number | undefined): string {
  const postsUrl = `https://api.esa.io/v1/teams/${encodeURIComponent(team)}/posts`;
  return postNumber === undefined ? postsUrl : `${postsUrl}/${postNumber}`;
}

function isEsaPostResult(value: unknown): value is EsaPostResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "number" in value &&
    Number.isInteger(value.number) &&
    "url" in value &&
    typeof value.url === "string"
  );
}

function isEsaPostSearchResult(value: unknown): value is { posts: EsaPostSummary[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    "posts" in value &&
    Array.isArray(value.posts) &&
    value.posts.every(isEsaPostSummary)
  );
}

function isEsaPostSummary(value: unknown): value is EsaPostSummary {
  return (
    isEsaPostResult(value) &&
    "name" in value &&
    typeof value.name === "string" &&
    "body_md" in value &&
    typeof value.body_md === "string" &&
    "tags" in value &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === "string") &&
    "category" in value &&
    (typeof value.category === "string" || value.category === null) &&
    "wip" in value &&
    typeof value.wip === "boolean"
  );
}

function hasSameContent(post: EsaPostSummary, payload: EsaPostPayload): boolean {
  return (
    post.name === payload.post.name &&
    post.body_md === payload.post.body_md &&
    post.category === payload.post.category &&
    post.wip === payload.post.wip &&
    [...post.tags].sort().join("\n") === [...payload.post.tags].sort().join("\n")
  );
}

function toEsaPostResult(post: EsaPostSummary): EsaPostResult {
  return { number: post.number, url: post.url };
}
