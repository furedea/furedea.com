import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { resolveArticleImagePath } from "./article_images";

const ARTICLE_IMAGES_DIR = fileURLToPath(new URL("../../images/", import.meta.url));

interface HtmlNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HtmlNode[];
}

interface ImageDimensions {
  width: number;
  height: number;
}

type ReadImageDimensions = (source: string) => Promise<ImageDimensions | undefined>;

export default function articleImageAttributes() {
  return async (value: unknown): Promise<void> => {
    await addArticleImageAttributes(value, readArticleImageDimensions);
  };
}

async function addArticleImageAttributes(
  value: unknown,
  readDimensions: ReadImageDimensions,
): Promise<void> {
  if (!isHtmlNode(value)) {
    return;
  }
  if (value.tagName === "img" && value.properties !== undefined) {
    await addImageAttributes(value.properties, readDimensions);
  }
  await Promise.all(
    value.children?.map((child) => addArticleImageAttributes(child, readDimensions)) ?? [],
  );
}

async function addImageAttributes(
  properties: Record<string, unknown>,
  readDimensions: ReadImageDimensions,
): Promise<void> {
  properties.loading = "lazy";
  properties.decoding = "async";

  const source = properties.src;
  if (typeof source !== "string") {
    return;
  }
  const dimensions = await readDimensions(source);
  if (dimensions === undefined) {
    return;
  }
  properties.width = dimensions.width;
  properties.height = dimensions.height;
}

async function readArticleImageDimensions(source: string): Promise<ImageDimensions | undefined> {
  if (!source.startsWith("/images/")) {
    return undefined;
  }
  const imagePath = resolveArticleImagePath(ARTICLE_IMAGES_DIR, source.slice("/images".length));
  if (imagePath === undefined) {
    return undefined;
  }
  const { width, height } = await sharp(imagePath).metadata();
  return width === undefined || height === undefined ? undefined : { width, height };
}

function isHtmlNode(value: unknown): value is HtmlNode {
  return (
    typeof value === "object" && value !== null && "type" in value && typeof value.type === "string"
  );
}
