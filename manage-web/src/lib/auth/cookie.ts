/**
 * The session cookie's name, on its own so that `src/proxy.ts` can read it
 * without importing `session.ts` — that module is `server-only` and pulls in
 * `next/headers`, neither of which belongs in the proxy bundle.
 */
export const SESSION_COOKIE = "sdrs_admin";
