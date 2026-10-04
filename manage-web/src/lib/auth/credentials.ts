import "server-only";

import { users } from "@/lib/users/repository";
import { type SafeUser, toSafeUser } from "@/types/user";
import { burnPasswordWork, verifyPassword } from "./password";

/**
 * Checks a submitted username and password against the account store.
 *
 * An unknown username still pays for a scrypt derivation (`burnPasswordWork`),
 * so sign-in takes the same time whether the account exists or not — otherwise
 * response time would let someone enumerate accounts. The caller surfaces one
 * generic message for the same reason.
 *
 * Returns the account without its password hash, or `null`.
 */
export async function authenticate(
  username: string,
  password: string,
): Promise<SafeUser | null> {
  const user = await users.findByUsername(username);

  if (!user) {
    await burnPasswordWork(password);
    return null;
  }

  const matches = await verifyPassword(password, user.passwordHash);
  return matches ? toSafeUser(user) : null;
}
