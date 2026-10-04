/**
 * Environment access for `manage-web`. Nothing else in this app should read
 * `process.env` directly.
 *
 * The content-layer variables (`NEXT_PUBLIC_CONTENT_SOURCE`, the API base URL,
 * the store path) live in `@sdrs/shared/config/content-env` because `core-web`
 * reads them too. What is here is what only the CMS needs: the credentials and
 * the session signing key.
 */

function requireVar(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(
      `Missing ${name}. The CMS needs ADMIN_USERNAME, ADMIN_PASSWORD_HASH and ` +
        `SESSION_SECRET — see .env.example, and generate the hash with ` +
        `\`node scripts/hash-admin-password.mjs '<password>'\`.`,
    );
  }
  return trimmed;
}

export interface AdminAuthConfig {
  username: string;
  /** `scrypt:<saltHex>:<keyHex>`, as produced by `scripts/hash-admin-password.mjs`. */
  passwordHash: string;
  /** Signing key for the session cookie. */
  sessionSecret: string;
  sessionMaxAgeSeconds: number;
}

/**
 * Read through a function rather than captured into a module-level constant,
 * because this module is imported by code that also runs in the browser: a
 * module-scope `process.env.SESSION_SECRET` would be inlined as `undefined`
 * there and read as "missing" rather than "server-only". Calling this from a
 * `server-only` module keeps the distinction honest.
 */
export function adminAuthConfig(): AdminAuthConfig {
  const hours = Number(process.env.ADMIN_SESSION_HOURS ?? 12);

  return {
    username: requireVar("ADMIN_USERNAME", process.env.ADMIN_USERNAME),
    passwordHash: requireVar("ADMIN_PASSWORD_HASH", process.env.ADMIN_PASSWORD_HASH),
    sessionSecret: requireVar("SESSION_SECRET", process.env.SESSION_SECRET),
    sessionMaxAgeSeconds: (Number.isFinite(hours) && hours > 0 ? hours : 12) * 3600,
  };
}

/**
 * Where CMS accounts are stored while `NEXT_PUBLIC_CONTENT_SOURCE=mock`.
 *
 * Inside this app's own directory by default, not at the repo root like the
 * content store — core-web has no business reading a file of password hashes.
 */
export function userStorePath(): string {
  return process.env.USER_STORE_PATH?.trim() || ".data/users.json";
}

/**
 * Whether a stored password hash is in the form this app can verify. Lives here
 * beside the variable it validates, so a misconfigured `ADMIN_PASSWORD_HASH` is
 * caught where it is read.
 */
export function isValidHashFormat(hash: string): boolean {
  const [scheme, salt, key] = hash.split(":");
  return scheme === "scrypt" && Boolean(salt) && key?.length === 128;
}

/**
 * The public site's origin, for the one outbound link in the CMS header. These
 * are two separate services, so it cannot be derived from this app's own URL.
 */
export const publicSiteUrl = (
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "http://localhost:3002"
).replace(/\/$/, "");

/**
 * Whether this is a production build. Decides whether the session cookie is
 * marked `Secure`, which would stop it working over plain http on localhost.
 */
export const isProduction = process.env.NODE_ENV === "production";
