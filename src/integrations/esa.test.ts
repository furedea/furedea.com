import { expect, test } from "vitest";

import type { EsaPostPayload } from "../data/article";
import { findEsaPost, publishEsaPost, upsertEsaPost } from "./esa";

const ACCESS_TOKEN = ["test", "value"].join("-");
const PAYLOAD: EsaPostPayload = {
  post: {
    name: "One source article",
    body_md: "Article body.",
    tags: ["zenn"],
    category: "blog",
    wip: true,
    message: "Sync from furedea.com.",
  },
};

test("finds an existing esa copy by its canonical website URL", async () => {
  const canonicalUrl = "https://furedea.com/ja/blog/article-publishing/";
  const requests: Array<{ url: string; options: RequestInit | undefined }> = [];
  const fetcher: typeof fetch = async (input, options) => {
    requests.push({
      url: input instanceof Request ? input.url : input.toString(),
      options,
    });
    return Response.json({
      posts: [
        {
          number: 42,
          url: "https://example-team.esa.io/posts/42",
          name: PAYLOAD.post.name,
          body_md: `Article body.\n\nOriginally published at ${canonicalUrl}`,
          tags: PAYLOAD.post.tags,
          category: PAYLOAD.post.category,
          wip: PAYLOAD.post.wip,
        },
      ],
    });
  };

  await expect(
    findEsaPost({
      team: "example-team",
      accessToken: ACCESS_TOKEN,
      canonicalUrl,
      fetcher,
    }),
  ).resolves.toEqual({ number: 42, url: "https://example-team.esa.io/posts/42" });
  expect(requests).toEqual([
    {
      url: "https://api.esa.io/v1/teams/example-team/posts?q=body%3A%22https%3A%2F%2Ffuredea.com%2Fja%2Fblog%2Farticle-publishing%2F%22&per_page=100",
      options: {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      },
    },
  ]);
});

test("updates the esa copy found by its canonical website URL", async () => {
  const canonicalUrl = "https://furedea.com/ja/blog/article-publishing/";
  const requests: Array<{ url: string; options: RequestInit | undefined }> = [];
  const fetcher: typeof fetch = async (input, options) => {
    const url = input instanceof Request ? input.url : input.toString();
    requests.push({ url, options });
    if (options?.method === undefined) {
      return Response.json({
        posts: [
          {
            number: 42,
            url: "https://example-team.esa.io/posts/42",
            name: "Old title",
            body_md: `Originally published at ${canonicalUrl}`,
            tags: PAYLOAD.post.tags,
            category: PAYLOAD.post.category,
            wip: PAYLOAD.post.wip,
          },
        ],
      });
    }
    return Response.json({ number: 42, url: "https://example-team.esa.io/posts/42" });
  };

  await expect(
    upsertEsaPost({
      team: "example-team",
      accessToken: ACCESS_TOKEN,
      canonicalUrl,
      payload: PAYLOAD,
      fetcher,
    }),
  ).resolves.toEqual({ number: 42, url: "https://example-team.esa.io/posts/42" });
  expect(requests[1]).toMatchObject({
    url: "https://api.esa.io/v1/teams/example-team/posts/42",
    options: { method: "PATCH" },
  });
});

test("does not create a new esa revision when the copy already matches", async () => {
  const canonicalUrl = "https://furedea.com/ja/blog/article-publishing/";
  const payload: EsaPostPayload = {
    post: {
      ...PAYLOAD.post,
      body_md: `Article body.\n\nOriginally published at ${canonicalUrl}`,
    },
  };
  const requests: Array<{ url: string; options: RequestInit | undefined }> = [];
  const fetcher: typeof fetch = async (input, options) => {
    requests.push({
      url: input instanceof Request ? input.url : input.toString(),
      options,
    });
    return Response.json({
      posts: [
        {
          number: 42,
          url: "https://example-team.esa.io/posts/42",
          name: payload.post.name,
          body_md: payload.post.body_md,
          tags: payload.post.tags,
          category: payload.post.category,
          wip: payload.post.wip,
        },
      ],
    });
  };

  await expect(
    upsertEsaPost({
      team: "example-team",
      accessToken: ACCESS_TOKEN,
      canonicalUrl,
      payload,
      fetcher,
    }),
  ).resolves.toEqual({ number: 42, url: "https://example-team.esa.io/posts/42" });
  expect(requests).toHaveLength(1);
});

test("creates an esa copy when no post references the canonical URL", async () => {
  const requests: Array<{ url: string; options: RequestInit | undefined }> = [];
  const fetcher: typeof fetch = async (input, options) => {
    requests.push({
      url: input instanceof Request ? input.url : input.toString(),
      options,
    });
    return options?.method === undefined
      ? Response.json({ posts: [] })
      : Response.json({ number: 42, url: "https://example-team.esa.io/posts/42" });
  };

  await expect(
    upsertEsaPost({
      team: "example-team",
      accessToken: ACCESS_TOKEN,
      canonicalUrl: "https://furedea.com/ja/blog/article-publishing/",
      payload: PAYLOAD,
      fetcher,
    }),
  ).resolves.toEqual({ number: 42, url: "https://example-team.esa.io/posts/42" });
  expect(requests.map((request) => request.options?.method)).toEqual([undefined, "POST"]);
});

test("creates the first esa copy with bearer authentication", async () => {
  const requests: Array<{ url: string; options: RequestInit | undefined }> = [];
  const fetcher = createFetchStub(requests);

  await expect(
    publishEsaPost({
      team: "example-team",
      accessToken: ACCESS_TOKEN,
      payload: PAYLOAD,
      fetcher,
    }),
  ).resolves.toEqual({ number: 42, url: "https://example-team.esa.io/posts/42" });
  expect(requests).toEqual([
    {
      url: "https://api.esa.io/v1/teams/example-team/posts",
      options: {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(PAYLOAD),
      },
    },
  ]);
});

test("updates the known esa copy instead of creating a duplicate", async () => {
  const requests: Array<{ url: string; options: RequestInit | undefined }> = [];

  await publishEsaPost({
    team: "example-team",
    accessToken: ACCESS_TOKEN,
    postNumber: 42,
    payload: PAYLOAD,
    fetcher: createFetchStub(requests),
  });

  expect(requests[0]).toMatchObject({
    url: "https://api.esa.io/v1/teams/example-team/posts/42",
    options: { method: "PATCH" },
  });
});

test("reports esa API failures without exposing the access token", async () => {
  const fetcher: typeof fetch = async () => new Response('{"error":"forbidden"}', { status: 403 });

  await expect(
    publishEsaPost({
      team: "example-team",
      accessToken: ACCESS_TOKEN,
      payload: PAYLOAD,
      fetcher,
    }),
  ).rejects.toThrow("esa API request failed with 403");
});

function createFetchStub(
  requests: Array<{ url: string; options: RequestInit | undefined }>,
): typeof fetch {
  return async (input, options) => {
    requests.push({
      url: input instanceof Request ? input.url : input.toString(),
      options,
    });
    return new Response(
      JSON.stringify({ number: 42, url: "https://example-team.esa.io/posts/42" }),
      { status: 201 },
    );
  };
}
