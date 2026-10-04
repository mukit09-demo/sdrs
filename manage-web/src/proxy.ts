import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/cookie";
import { routes } from "@/lib/config/routes";
import { verifySession } from "@/lib/auth/token";

/**
 * Requires a session for every page except `/login`.
 *
 * Simpler than it was when the CMS lived inside the public site: the whole app is
 * the admin now, so the rule is "signed in or sign in" rather than a path prefix.
 *
 * The token's signature is verified here, not merely its presence. Next's auth
 * guide warns against expensive work in the proxy because it runs on every
 * request including prefetches, but that warning is about database round trips —
 * an HMAC comparison is microseconds, and Next 16 runs the proxy on the Node.js
 * runtime, so `node:crypto` is available. Trusting presence alone has a concrete
 * bug: a visitor whose session had expired would be sent to the dashboard from
 * here and straight back to `/login` by the page guard, forever.
 *
 * `requireAdmin()` in `src/lib/auth/dal.ts` still checks independently — server
 * actions do not pass through here at all.
 *
 * (Next 16 renamed Middleware to Proxy; this file is the former `middleware.ts`.)
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySession(token);

  if (pathname === routes.login) {
    if (!session) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = routes.dashboard;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (session) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = routes.login;
  url.search = "";
  // Remembered so signing in lands back where the visitor was headed.
  url.searchParams.set("next", `${pathname}${search}`);

  const response = NextResponse.redirect(url);
  // A cookie that no longer verifies is only going to be sent again. Drop it so
  // the browser stops offering it and `/login` renders cleanly.
  if (token) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  /**
   * Everything except Next's own assets and the favicon. Unlike core-web's
   * matcher there is no allowlist of app paths, because every app path here is
   * protected — a new page is guarded the moment it exists.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
