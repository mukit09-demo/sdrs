import { CheckIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";

export interface DetailListProps {
  items: string[];
  /** `check` for capability lists, `number` for ordered highlights. */
  marker?: "check" | "number" | "rule";
  columns?: 1 | 2;
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Bulleted list of short strings — capabilities, deliverables, highlights.
 * Three markers cover every list on the site.
 */
export function DetailList({
  items,
  marker = "check",
  columns = 1,
  tone = "light",
  className,
}: DetailListProps) {
  if (!items.length) return null;

  const isDark = tone === "dark";

  return (
    <ul
      className={cn(
        columns === 2 ? "grid gap-x-10 gap-y-4 sm:grid-cols-2" : "flex flex-col",
        marker === "rule" ? "gap-0" : "gap-4",
        className,
      )}
    >
      {items.map((item, index) => (
        <li
          key={item}
          className={cn(
            "flex gap-3 text-base",
            marker === "rule" && "border-t border-ink-200 py-4",
            isDark ? "text-white/80" : "text-ink-700",
          )}
        >
          {marker === "check" && (
            <CheckIcon className="mt-0.5 size-5 shrink-0 text-brand-500" />
          )}
          {marker === "number" && (
            <span
              aria-hidden="true"
              className={cn(
                "font-display mt-0.5 w-6 shrink-0 text-sm tabular-nums",
                isDark ? "text-white/40" : "text-ink-400",
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
