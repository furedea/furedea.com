import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

export function discoverLocalizedRoutes(directory: string): string[] {
  return listHtmlFiles(directory)
    .map((file) => relative(directory, file).split(sep).join("/"))
    .filter((file) => /^(?:ja|en)\/.+\.html$/.test(file))
    .map((file) => `/${file.replace(/index\.html$/, "")}`)
    .toSorted();
}

function listHtmlFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(path);
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  });
}
