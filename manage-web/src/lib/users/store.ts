import "server-only";

import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { adminAuthConfig, isValidHashFormat, userStorePath } from "@/lib/config/env";
import type { AdminUser } from "@/types/user";

/**
 * Where CMS accounts live while there is no backend.
 *
 * A separate file from the content store, and deliberately so: the content store
 * sits at the repo root and core-web reads it, so putting password hashes in it
 * would hand the public app a file full of credentials. This one defaults to
 * `manage-web/.data/users.json` and nothing outside this app ever opens it.
 *
 * Same caveats as the content store: needs a writable disk, and assumes one
 * server process. `NEXT_PUBLIC_CONTENT_SOURCE=api` moves accounts to Spring Boot.
 */

interface UserStore {
  users: AdminUser[];
}

/**
 * Seeds the store the first time it is read.
 *
 * `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` are the bootstrap account: without
 * them a fresh install would have no way to sign in and therefore no way to
 * create the first account. Once the store exists they are ignored — changing
 * the env does not change a stored account, and deleting the store brings the
 * bootstrap account back.
 */
function seed(): UserStore {
  const { username, passwordHash } = adminAuthConfig();

  if (!isValidHashFormat(passwordHash)) {
    throw new Error(
      "ADMIN_PASSWORD_HASH is not in the expected `scrypt:<saltHex>:<keyHex>` " +
        "form. Regenerate it with `node scripts/hash-admin-password.mjs '<password>'`.",
    );
  }

  return {
    users: [
      {
        id: "user-bootstrap",
        username,
        name: "Bootstrap admin",
        role: "admin",
        passwordHash,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

let cached: { mtimeMs: number; store: Promise<UserStore> } | null = null;

export async function readUsers(): Promise<AdminUser[]> {
  const mtimeMs = await modifiedAt();
  if (mtimeMs === null) return seed().users;

  if (cached?.mtimeMs !== mtimeMs) {
    cached = { mtimeMs, store: load() };
  }

  return (await cached.store).users;
}

/**
 * Applies `mutate` to the accounts and persists the result.
 *
 * Written to a temp file and renamed into place, which is atomic on the same
 * filesystem — a crash mid-write cannot leave a half-written account list and
 * lock everyone out.
 */
export async function writeUsers(
  mutate: (users: AdminUser[]) => void,
): Promise<void> {
  const next = structuredClone(await readUsers());
  mutate(next);

  const path = storeFile();
  const temporary = `${path}.${process.pid}.tmp`;

  await mkdir(dirname(path), { recursive: true });
  await writeFile(temporary, `${JSON.stringify({ users: next }, null, 2)}\n`, {
    encoding: "utf8",
    // Credentials: readable and writable by the owner only, never group or world.
    mode: 0o600,
  });
  await rename(temporary, path);

  const mtimeMs = await modifiedAt();
  cached =
    mtimeMs === null ? null : { mtimeMs, store: Promise.resolve({ users: next }) };
}

async function load(): Promise<UserStore> {
  try {
    const parsed = JSON.parse(await readFile(storeFile(), "utf8")) as UserStore;
    // An empty or corrupt list would mean nobody can sign in, so fall back to
    // the bootstrap account rather than locking the CMS.
    return Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed : seed();
  } catch (error) {
    if (!isMissingFile(error)) throw error;
    return seed();
  }
}

async function modifiedAt(): Promise<number | null> {
  try {
    return (await stat(storeFile())).mtimeMs;
  } catch (error) {
    if (!isMissingFile(error)) throw error;
    return null;
  }
}

function storeFile(): string {
  // `turbopackIgnore` because the path is only known at runtime; without it the
  // build traces the whole project into the server bundle.
  return resolve(/* turbopackIgnore: true */ process.cwd(), userStorePath());
}

function isMissingFile(error: unknown): boolean {
  return (error as NodeJS.ErrnoException | null)?.code === "ENOENT";
}
