import "server-only";

import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { careersContent } from "../data/careers";
import { markets as seedMarkets } from "../data/markets";
import { articles as seedArticles, issues as seedIssues } from "../data/news";
import { projects as seedProjects } from "../data/projects";
import { services as seedServices } from "../data/services";
import { contentStorePath } from "../config/content-env";
import type {
  Article,
  Issue,
  JobOpening,
  Market,
  Project,
  Service,
} from "../types/content";

/**
 * The mock repository's writable "database".
 *
 * Content the admin can edit lives in a single JSON file (`.data/content.json`
 * by default, gitignored), seeded from `../data` the first time it is read — so
 * a fresh clone renders exactly what it renders today, and an edit survives a
 * restart. Everything the admin does not manage (the home film, About, Research
 * and Contact bundles, digital tools) keeps coming straight from `../data`.
 *
 * This needs a writable disk, which `npm run dev` and `npm run start` on a
 * normal Node host have and a read-only serverless filesystem does not. That is
 * the case `NEXT_PUBLIC_CONTENT_SOURCE=api` exists for.
 */

export interface ContentStore {
  markets: Market[];
  services: Service[];
  projects: Project[];
  articles: Article[];
  issues: Issue[];
  /** `CareersContent.openings`, promoted to a collection of its own so it can be edited. */
  openings: JobOpening[];
}

/** The collections the admin manages — the keys of `ContentStore`. */
export type StoreCollection = keyof ContentStore;

function seed(): ContentStore {
  return {
    markets: structuredClone(seedMarkets),
    services: structuredClone(seedServices),
    projects: structuredClone(seedProjects),
    articles: structuredClone(seedArticles),
    issues: structuredClone(seedIssues),
    openings: structuredClone(careersContent.openings),
  };
}

/**
 * Cached so that a page rendering six collections does not read the file six
 * times — but keyed on the file's modification time, not held for the life of
 * the process.
 *
 * That matters because two apps share this store: `manage-web` writes it and
 * `core-web` reads it. A process-lifetime cache would mean `core-web` never saw
 * an edit until it restarted. One `stat` per read is cheap, and comparing mtime
 * means a write by *another* process invalidates this one's copy.
 */
let cached: { mtimeMs: number; store: Promise<ContentStore> } | null = null;

export async function readStore(): Promise<ContentStore> {
  const mtimeMs = await modifiedAt();

  // No file yet: nothing to invalidate against, so serve the seed.
  if (mtimeMs === null) return seed();

  if (cached?.mtimeMs !== mtimeMs) {
    cached = { mtimeMs, store: load() };
  }

  return cached.store;
}

/** The store file's mtime, or `null` when it does not exist yet. */
async function modifiedAt(): Promise<number | null> {
  try {
    return (await stat(storeFile())).mtimeMs;
  } catch (error) {
    if (!isMissingFile(error)) throw error;
    return null;
  }
}

async function load(): Promise<ContentStore> {
  const path = storeFile();

  try {
    const parsed = JSON.parse(await readFile(path, "utf8")) as Partial<ContentStore>;
    // Merged over the seed so a store written before a collection existed still
    // loads, with that collection falling back to the bundled data.
    return { ...seed(), ...parsed };
  } catch (error) {
    if (!isMissingFile(error)) throw error;
    return seed();
  }
}

/**
 * Applies `mutate` to the store and persists the result.
 *
 * Written to a sibling temp file and renamed into place, which is atomic on the
 * same filesystem: a crash mid-write leaves the previous content intact rather
 * than a half-written file.
 */
export async function writeStore(
  mutate: (store: ContentStore) => void,
): Promise<void> {
  const current = await readStore();
  const next = structuredClone(current);
  mutate(next);

  const path = storeFile();
  const temporary = `${path}.${process.pid}.tmp`;

  await mkdir(dirname(path), { recursive: true });
  await writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  await rename(temporary, path);

  // Re-key on the mtime the rename produced, so this process does not re-read
  // the file it just wrote.
  const mtimeMs = await modifiedAt();
  cached = mtimeMs === null ? null : { mtimeMs, store: Promise.resolve(next) };
}

function storeFile(): string {
  // `turbopackIgnore` because the path is only known at runtime, and without it
  // the build traces the entire project into the server bundle — `public/`
  // included, which here means every placeholder film. Nothing needs tracing:
  // this file is written at runtime and never exists at build time.
  return resolve(/* turbopackIgnore: true */ process.cwd(), contentStorePath());
}

function isMissingFile(error: unknown): boolean {
  return (error as NodeJS.ErrnoException | null)?.code === "ENOENT";
}
