import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const DIST_DIR = "dist";
const SITE_ORIGIN = "https://furedea.com";
const REFERENCE_SELECTOR = [
  "a[href]",
  "area[href]",
  "img[src]",
  "img[srcset]",
  "input[src]",
  "link[href]",
  "script[src]",
  "source[src]",
  "source[srcset]",
  "video[poster]",
  'meta[property="og:image"][content]',
  'meta[name="twitter:image"][content]',
].join(",");

interface InternalReference {
  sourcePath: string;
  rawTarget: string;
  targetPath: string;
  fragment?: string;
}

test("Every generated internal reference resolves successfully", async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "One browser is sufficient for link validation.");

  const pagePaths = await getGeneratedPagePaths();
  const references = await collectInternalReferences(page, pagePaths);
  const reachablePaths = await findReachablePaths(request, references);
  const failures = [
    ...findUnreachableReferences(references, reachablePaths),
    ...(await findMissingFragments(page, references, reachablePaths)),
  ];

  expect(failures, failures.join("\n")).toEqual([]);
});

async function getGeneratedPagePaths(): Promise<string[]> {
  const htmlFiles = await findHtmlFiles(DIST_DIR);
  return (
    htmlFiles
      // The root uses an immediate meta refresh and has a dedicated redirect test.
      .filter((file) => file !== "index.html")
      .map(toPagePath)
      .sort((left, right) => left.localeCompare(right))
  );
}

async function findHtmlFiles(directory: string, relativeDirectory = ""): Promise<string[]> {
  const entries = await readdir(join(directory, relativeDirectory), { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        return findHtmlFiles(directory, relativePath);
      }
      return relativePath.endsWith(".html") ? [relativePath] : [];
    }),
  );
  return files.flat();
}

function toPagePath(htmlFile: string): string {
  if (htmlFile.endsWith("/index.html")) {
    return `/${htmlFile.slice(0, -"index.html".length)}`;
  }
  return `/${htmlFile}`;
}

async function collectInternalReferences(
  page: Page,
  pagePaths: string[],
): Promise<InternalReference[]> {
  const references: InternalReference[] = [];
  for (const sourcePath of pagePaths) {
    const response = await page.goto(sourcePath);
    expect(response?.ok(), `${sourcePath} did not load successfully`).toBe(true);
    const rawTargets = await collectRawTargets(page);
    references.push(
      ...rawTargets.flatMap((rawTarget) => {
        const reference = toInternalReference(sourcePath, rawTarget);
        return reference === undefined ? [] : [reference];
      }),
    );
  }
  return references;
}

async function collectRawTargets(page: Page): Promise<string[]> {
  return page.locator(REFERENCE_SELECTOR).evaluateAll((elements) =>
    elements.flatMap((element) => {
      const attributes = ["href", "src", "poster", "content"];
      const targets = attributes
        .map((attribute) => element.getAttribute(attribute))
        .filter((value): value is string => value !== null && value.trim() !== "");
      const srcset = element.getAttribute("srcset");
      if (srcset !== null) {
        targets.push(
          ...srcset
            .split(",")
            .map((candidate) => candidate.trim().split(/\s+/, 1)[0])
            .filter((value) => value !== ""),
        );
      }
      return targets;
    }),
  );
}

function toInternalReference(sourcePath: string, rawTarget: string): InternalReference | undefined {
  const target = new URL(rawTarget, new URL(sourcePath, SITE_ORIGIN));
  if (target.origin !== SITE_ORIGIN) {
    return undefined;
  }
  return {
    sourcePath,
    rawTarget,
    targetPath: `${target.pathname}${target.search}`,
    fragment: decodeFragment(target.hash),
  };
}

function decodeFragment(hash: string): string | undefined {
  if (hash.length <= 1 || hash.startsWith("#:~:text=")) {
    return undefined;
  }
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

async function findReachablePaths(
  request: APIRequestContext,
  references: InternalReference[],
): Promise<Map<string, boolean>> {
  const targetPaths = [...new Set(references.map(({ targetPath }) => targetPath))];
  const results = await Promise.all(
    targetPaths.map(async (targetPath) => {
      try {
        const response = await request.get(targetPath);
        return [targetPath, response.ok()] as const;
      } catch {
        return [targetPath, false] as const;
      }
    }),
  );
  return new Map(results);
}

function findUnreachableReferences(
  references: InternalReference[],
  reachablePaths: Map<string, boolean>,
): string[] {
  return references
    .filter(({ targetPath }) => reachablePaths.get(targetPath) !== true)
    .map(formatFailure);
}

async function findMissingFragments(
  page: Page,
  references: InternalReference[],
  reachablePaths: Map<string, boolean>,
): Promise<string[]> {
  const fragmentReferences = uniqueFragmentReferences(references).filter(
    ({ targetPath }) => reachablePaths.get(targetPath) === true,
  );
  const failures: string[] = [];
  for (const reference of fragmentReferences) {
    await page.goto(reference.targetPath);
    const exists = await page.evaluate((fragment) => {
      return (
        document.getElementById(fragment) !== null ||
        document.getElementsByName(fragment).length > 0
      );
    }, reference.fragment!);
    if (!exists) {
      failures.push(formatFailure(reference));
    }
  }
  return failures;
}

function uniqueFragmentReferences(references: InternalReference[]): InternalReference[] {
  const seen = new Set<string>();
  return references.filter((reference) => {
    if (reference.fragment === undefined) {
      return false;
    }
    const key = `${reference.targetPath}#${reference.fragment}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function formatFailure({ sourcePath, rawTarget }: InternalReference): string {
  return `${sourcePath} -> ${rawTarget}`;
}
