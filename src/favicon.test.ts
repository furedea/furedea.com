import { fileURLToPath } from "node:url";

import sharp from "sharp";
import { expect, test } from "vitest";

test("provides square search and device icons at recommended sizes", async () => {
  const faviconPath = fileURLToPath(new URL("../public/favicon.png", import.meta.url));
  const appleTouchIconPath = fileURLToPath(
    new URL("../public/apple_touch_icon.png", import.meta.url),
  );

  await expect(sharp(faviconPath).metadata()).resolves.toMatchObject({
    format: "png",
    width: 512,
    height: 512,
  });
  await expect(sharp(appleTouchIconPath).metadata()).resolves.toMatchObject({
    format: "png",
    width: 180,
    height: 180,
  });
});
