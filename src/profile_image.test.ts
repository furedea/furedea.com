import { access } from "node:fs/promises";

import { expect, test } from "vitest";

test("does not retain the former face portrait", async () => {
  const portrait = new URL("./assets/profile.jpg", import.meta.url);

  await expect(access(portrait)).rejects.toMatchObject({ code: "ENOENT" });
});
