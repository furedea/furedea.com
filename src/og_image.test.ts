import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import { expect, test } from "vitest";

test("provides a 1200 by 630 pixel social preview image", async () => {
  const imageUrl = new URL("../public/og_image.png", import.meta.url);
  const imagePath = fileURLToPath(imageUrl);

  await expect(access(imageUrl)).resolves.toBeUndefined();
  await expect(sharp(imagePath).metadata()).resolves.toMatchObject({
    format: "png",
    width: 1200,
    height: 630,
  });
});
