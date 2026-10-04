import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export interface Crumb {
  label: string;
  /** Omit on the current page — it is rendered as plain text. */
  href?: string;
}

export interface BreadcrumbsProps {
  crumbs: Crumb[];
  tone?: "light" | "dark";
  className?: string;
}

/** Ordered list with `aria-current` on the final crumb. */
export function Breadcrumbs({ crumbs, tone = "light", className }: BreadcrumbsProps) {
  const isDark = tone === "dark";

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm",
          isDark ? "text-white/60" : "text-ink-500",
        )}
      >
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className={cn(
                    "transition-colors",
                    isDark ? "hover:text-white" : "hover:text-ink-900",
                  )}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isDark ? "text-white" : "text-ink-900"}
                >
                  {crumb.label}
                </span>
              )}
              {!isLast && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
