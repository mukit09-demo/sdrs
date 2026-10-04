import { createHmac, timingSafeEqual } from "node:crypto";
import { adminAuthConfig } from "@/lib/config/env";
import { isUserRole, type UserRole } from "@/types/user";

/**
 * Signing and verification for the admin session token, with no dependency on
 * `next/headers`.
 *
 * Kept separate from `session.ts` so that `src/proxy.ts` can verify a token too.
 * Next's auth guide describes the proxy check as necessarily optimistic, because
 * it runs on every request including prefetches — but that caution is about
 * database round trips. An HMAC comparison is microseconds, and Next 16 runs the
 * proxy on the Node.js runtime, so doing it properly there costs nothing and
 * avoids the alternative's real bug: trusting mere cookie *presence* sends a
 * visitor whose session has expired into a redirect loop between `/login` and
 * `/admin`.
 *
 * `dal.ts` still verifies independently. The proxy does not run everywhere, and
 * a server action can be POSTed to directly.
 */

export interface AdminSession {
  /** The account's stable id, so a username change does not orphan a session. */
  userId: string;
  username: string;
  role: UserRole;
  /** Epoch milliseconds. */
  expiresAt: number;
}

export function signSession(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${signature(payload)}`;
}

/** The session carried by `token`, or `null` if it is absent, forged or lapsed. */
export function verifySession(token: string | undefined): AdminSession | null {
  if (!token) return null;

  const [payload, provided] = token.split(".");
  if (!payload || !provided) return null;

  let expected: string;
  try {
    expected = signature(payload);
  } catch {
    // No SESSION_SECRET configured. Fail closed rather than letting anyone in.
    return null;
  }

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  ) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSession;

    if (typeof session.userId !== "string" || !session.userId) return null;
    if (typeof session.username !== "string") return null;
    // The role is an authorisation decision carried in the cookie, so it is
    // checked as strictly as the signature: an unrecognised value is a rejection,
    // never a default.
    if (typeof session.role !== "string" || !isUserRole(session.role)) return null;
    if (typeof session.expiresAt !== "number") return null;
    if (session.expiresAt <= Date.now()) return null;

    return session;
  } catch {
    return null;
  }
}

function signature(payload: string): string {
  return createHmac("sha256", adminAuthConfig().sessionSecret)
    .update(payload)
    .digest("base64url");
}
