import { cp, readFile } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";

const ARTICLE_IMAGES_DIR = fileURLToPath(new URL("../../images/", import.meta.url));
const CONTENT_TYPES: Readonly<Record<string, string>> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export default function articleImages(): AstroIntegration {
  return {
    name: "article-images",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use("/images", async (request, response, next) => {
          const requestPath = decodeURIComponent(
            new URL(request.url ?? "/", "http://local").pathname,
          );
          const imagePath = resolveArticleImagePath(ARTICLE_IMAGES_DIR, requestPath);
          if (imagePath === undefined) {
            next();
            return;
          }

          try {
            response.setHeader("Content-Type", CONTENT_TYPES[extname(imagePath)] ?? "");
            response.end(await readFile(imagePath));
          } catch (error) {
            if (isMissingFile(error)) {
              next();
              return;
            }
            next(error);
          }
        });
      },
      "astro:build:done": async ({ dir }) => {
        await cp(ARTICLE_IMAGES_DIR, fileURLToPath(new URL("images/", dir)), {
          recursive: true,
        });
      },
    },
  };
}

export function resolveArticleImagePath(
  imageRoot: string,
  requestPath: string,
): string | undefined {
  const imagePath = resolve(imageRoot, `.${requestPath}`);
  const relativePath = relative(imageRoot, imagePath);
  if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
    return undefined;
  }
  return CONTENT_TYPES[extname(imagePath)] === undefined ? undefined : imagePath;
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
