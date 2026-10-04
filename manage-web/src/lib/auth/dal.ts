import "server-only";

import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { routes } from "@/lib/config/routes";
import { readSession } from "./session";
import type { AdminSession } from "./token";

/**
 * The CMS's data access layer.
 *
 * Every page, layout and server action calls one of these before doing anything.
 * `src/proxy.ts` verifies the same token first, but that is not enough on its
 * own: the proxy does not run on server actions, and a layout that hides its
 * children does not stop them rendering.
 *
 * `cache` memoises per render pass, so a layout and the page inside it do not
 * each re-verify.
 */

/** Any signed-in account. The gate for every content page and action. */
export const requireUser = cache(async (): Promise<AdminSession> => {
  const session = await readSession();
  if (!session) redirect(routes.login);
  return session;
});

/**
 * An `admin` account. The gate for everything under `/users`.
 *
 * `notFound()` rather than a redirect: to an editor, the accounts section does
 * not exist — the nav never shows it, and someone who typed the URL or kept a
 * bookmark after being demoted learns nothing from a 404 that they did not
 * already know. (Next's `forbidden()` would say it more precisely, but it is
 * still experimental and needs `experimental.authInterrupts`, which is too much
 * to take on for one gate.)
 */
export const requireAdmin = cache(async (): Promise<AdminSession> => {
  const session = await requireUser();
  if (session.role !== "admin") notFound();
  return session;
});

/**
 * Whether the current session may manage accounts.
 *
 * For deciding what to render — the nav, the dashboard tiles. Never the only
 * check: `requireAdmin()` is what actually guards the pages and the actions.
 */
export async function canManageUsers(): Promise<boolean> {
  return (await requireUser()).role === "admin";
}
