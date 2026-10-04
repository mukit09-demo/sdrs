/**
 * CMS accounts.
 *
 * Deliberately not in `@sdrs/shared`: core-web must never be able to import a
 * user, a role or a password hash. Accounts are the one thing in this repo that
 * exists only on the admin side.
 */

/**
 * `admin` can do everything an `editor` can, plus manage accounts. That is the
 * only difference between them — both have full create, edit and delete on every
 * content collection.
 */
export type UserRole = "admin" | "editor";

export const USER_ROLES: readonly UserRole[] = ["admin", "editor"];

/** Short form, for the header and the account list. */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  editor: "Editor",
};

/** What the role can actually do, for hints and list rows. */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Content and accounts",
  editor: "Content only",
};

export interface AdminUser {
  /** Stable id. Survives a username change, which is why the username is not it. */
  id: string;
  username: string;
  /** Display name, shown in the account list. Optional. */
  name?: string;
  role: UserRole;
  /** `scrypt:<saltHex>:<keyHex>`. Never leaves the server. */
  passwordHash: string;
  /** ISO-8601 timestamp. */
  createdAt: string;
}

/**
 * An account without its hash — what a page or a session is allowed to hold.
 *
 * The distinction is the point: `AdminUser` only ever exists inside
 * `src/lib/users`, and everything above that layer deals in this.
 */
export type SafeUser = Omit<AdminUser, "passwordHash">;

export function toSafeUser(user: AdminUser): SafeUser {
  const { passwordHash: _hash, ...safe } = user;
  return safe;
}

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}
