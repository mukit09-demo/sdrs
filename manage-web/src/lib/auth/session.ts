import "server-only";

import { cookies } from "next/headers";
import { adminAuthConfig, isProduction } from "@/lib/config/env";
import type { SafeUser } from "@/types/user";
import { SESSION_COOKIE } from "./cookie";
import { type AdminSession, signSession, verifySession } from "./token";

/**
 * The admin session, as a signed cookie — no database.
 *
 * Hand-rolled with `node:crypto` for the same reason `cn()` and the form
 * validator are local: there is one admin user and this is the whole surface. If
 * this ever needs refresh tokens or several users, `./token.ts` is the file to
 * swap for `jose`.
 */

export { SESSION_COOKIE };
export type { AdminSession };

export async function createSession(user: SafeUser): Promise<void> {
  const { sessionMaxAgeSeconds } = adminAuthConfig();
  const expiresAt = Date.now() + sessionMaxAgeSeconds * 1000;
  const cookieStore = await cookies();

  const token = signSession({
    userId: user.id,
    username: user.username,
    role: user.role,
    expiresAt,
  });

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // Allowed to be http on localhost; required to be https anywhere real.
    secure: isProduction,
    sameSite: "lax",
    expires: new Date(expiresAt),
    path: "/",
  });
}

/** The current session, or `null` when there is none, it is forged, or it has lapsed. */
export async function readSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
