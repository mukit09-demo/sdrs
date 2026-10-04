import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { collectionsForRole } from "@/lib/admin/collections";
import { logoutAction } from "@/lib/auth/auth.action";
import { appConfig } from "@/lib/config/app";
import { routes } from "@/lib/config/routes";
import { ROLE_LABELS, type UserRole } from "@/types/user";

/**
 * Chrome for the CMS: one compact header row, the collection list, and nothing
 * else. No footer, no marketing copy, no strapline — a tool, not a page.
 *
 * The collection nav is generated from `adminCollections`, so adding a seventh
 * collection adds a seventh link with nothing here to keep in step. That is the
 * same bargain the list and form pages make.
 */
export function AdminShell({
  username,
  role,
  children,
}: {
  username: string;
  role: UserRole;
  children: ReactNode;
}) {
  // Editors never see the Accounts link. The pages and actions behind it guard
  // themselves as well — hiding a link is not access control.
  const collections = collectionsForRole(role);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-3">
          <Link
            href={routes.dashboard}
            className="text-sm font-semibold tracking-tight text-ink-900"
          >
            {appConfig.title}
          </Link>

          <nav aria-label="Collections" className="order-3 w-full lg:order-none lg:w-auto">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
              {collections.map((collection) => (
                <li key={collection.name}>
                  <Link
                    href={routes.collection(collection.name)}
                    className="text-sm text-ink-600 underline-offset-4 hover:text-accent-600 hover:underline"
                  >
                    {collection.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-ink-500 sm:inline">
              {username} · {ROLE_LABELS[role]}
            </span>
            {/* A different origin from this app, so a plain anchor rather than
                a `<Link>` — there is no client-side route to prefetch. */}
            <a
              href={appConfig.publicSiteUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm text-ink-600 underline-offset-4 hover:text-accent-600 hover:underline"
            >
              View site
            </a>
            <form action={logoutAction}>
              <Button type="submit" variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
