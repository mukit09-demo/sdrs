import { cn } from "@/lib/utils/cn";
import type { Stat } from "@sdrs/shared/types/content";

export interface StatListProps {
  stats: Stat[];
  tone?: "light" | "dark";
  /** Number of columns at the largest breakpoint. */
  columns?: 2 | 3 | 4;
  className?: string;
}

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/**
 * Headline figures as a definition list — the value is the term, the caption is
 * its description, which is what a screen reader should read them as.
 */
export function StatList({
  stats,
  tone = "light",
  columns = 4,
  className,
}: StatListProps) {
  if (!stats.length) return null;

  const isDark = tone === "dark";

  return (
    <dl className={cn("grid grid-cols-1 gap-px", columnClasses[columns], className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "px-1 py-6 sm:px-6",
            isDark ? "sm:bg-white/5" : "sm:bg-ink-50",
          )}
        >
          <dt
            className={cn(
              "font-display text-4xl leading-none font-medium tracking-tight md:text-5xl",
              isDark ? "text-white" : "text-ink-900",
            )}
          >
            {stat.value}
            {stat.unit && (
              <span className="text-brand-500">{stat.unit}</span>
            )}
          </dt>
          <dd
            className={cn(
              "mt-3 text-sm leading-snug",
              isDark ? "text-white/70" : "text-ink-600",
            )}
          >
            {stat.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}
