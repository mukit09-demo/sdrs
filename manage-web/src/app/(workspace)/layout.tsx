import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireUser } from "@/lib/auth/dal";

/**
 * Guards every page in the workspace and wraps it in the signed-in chrome.
 *
 * `(workspace)` is a route group, so it adds nothing to any URL — the dashboard
 * is `/`, a collection is `/markets`. Its only job is to hold this guard and the
 * shell, which is why `/login` sits outside it.
 *
 * The guard is repeated in each page and each server action rather than trusted
 * from here: a layout does not control whether its children render, and partial
 * rendering means it is not re-run on every navigation.
 */
export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const session = await requireUser();

  return (
    <AdminShell username={session.username} role={session.role}>
      {children}
    </AdminShell>
  );
}
