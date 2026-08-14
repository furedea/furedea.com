import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { expect, test } from "vitest";

import { discoverLocalizedRoutes } from "../site_routes";

test("discovers localized routes from generated HTML pages", () => {
  const directory = mkdtempSync(join(tmpdir(), "site-routes-"));

  try {
    writePage(directory, "ja/index.html");
    writePage(directory, "en/blog/example/index.html");
    writePage(directory, "404.html");

    expect(discoverLocalizedRoutes(directory)).toEqual(["/en/blog/example/", "/ja/"]);
  } finally {
    rmSync(directory, { recursive: true });
  }
});

function writePage(directory: string, relativePath: string): void {
  const path = join(directory, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, "<!doctype html>");
}
