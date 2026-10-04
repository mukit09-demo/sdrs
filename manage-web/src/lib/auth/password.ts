import "server-only";

import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing and verification, in the format
 * `scrypt:<saltHex>:<keyHex>` that `scripts/hash-admin-password.mjs` also
 * produces — so a hash pasted into `.env.local` and a hash created by the
 * account form are interchangeable.
 *
 * Hashing lives here rather than only in the script because the CMS now creates
 * accounts itself: a password typed into the new-account form has to be hashed
 * before it is stored, and it must never be written anywhere in plain text.
 */

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/** Minimum we will accept. Enforced in the form's validation rules too. */
export const MIN_PASSWORD_LENGTH = 10;

/**
 * Per-process key used only to compare two values of possibly different lengths
 * in constant time: HMAC both sides, then compare the fixed-width digests.
 * `timingSafeEqual` throws outright on a length mismatch, and branching on the
 * length first would leak it.
 */
const comparisonKey = randomBytes(32);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await scryptAsync(normalise(password), salt, KEY_LENGTH);

  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

/**
 * Whether `password` matches `hash`.
 *
 * Returns `false` rather than throwing on a malformed hash, but still performs a
 * derivation first, so a corrupt stored hash costs the same time as a wrong
 * password and cannot be distinguished from one.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const parsed = parseHash(hash);
  const salt = parsed?.salt ?? randomBytes(SALT_LENGTH);

  const derived = await scryptAsync(normalise(password), salt, KEY_LENGTH);
  if (!parsed) return false;

  return constantTimeEquals(derived, parsed.key);
}

/**
 * Burns one derivation without comparing anything.
 *
 * Called when a username does not exist, so that signing in with an unknown
 * username takes the same time as signing in with a wrong password. Without
 * this, response time would enumerate accounts.
 */
export async function burnPasswordWork(password: string): Promise<void> {
  await scryptAsync(normalise(password), randomBytes(SALT_LENGTH), KEY_LENGTH);
}

export function isValidHash(hash: string): boolean {
  return parseHash(hash) !== null;
}

function parseHash(hash: string): { salt: Buffer; key: Buffer } | null {
  const [scheme, saltHex, keyHex] = hash.split(":");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return null;

  const key = Buffer.from(keyHex, "hex");
  if (key.length !== KEY_LENGTH) return null;

  return { salt: Buffer.from(saltHex, "hex"), key };
}

/** So the same password typed on different platforms hashes the same way. */
function normalise(password: string): string {
  return password.normalize("NFKC");
}

/** Length-independent constant-time equality. */
function constantTimeEquals(a: string | Buffer, b: string | Buffer): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

function digest(value: string | Buffer): Buffer {
  return createHmac("sha256", comparisonKey).update(value).digest();
}

/** Constant-time string comparison, for usernames. */
export function usernamesMatch(a: string, b: string): boolean {
  return constantTimeEquals(a, b);
}
