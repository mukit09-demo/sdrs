import { cn } from "@/lib/utils/cn";
import type { FilterGroup } from "@sdrs/shared/types/content";

export interface FilterChipsProps {
  group: FilterGroup;
  /** Currently selected option value, or `undefined` for "all". */
  activeValue?: string;
  /** Called with the clicked value — clearing is the caller's decision. */
  onSelect: (value: string) => void;
  /** Hide the group label when the surrounding layout already explains it. */
  hideLabel?: boolean;
  className?: string;
}

/**
 * One row of toggle chips for a filter group. Stateless on purpose: the owning
 * client component keeps the selection, so the same chips drive the card grid,
 * the job list and the office directory.
 */
export function FilterChips({
  group,
  activeValue,
  onSelect,
  hideLabel = false,
  className,
}: FilterChipsProps) {
  return (
    <fieldset className={className}>
      <legend
        className={cn(
          "text-xs font-medium tracking-widest text-ink-500 uppercase",
          hideLabel && "sr-only",
        )}
      >
        {group.label}
      </legend>
      <div className={cn("flex flex-wrap gap-2", !hideLabel && "mt-3")}>
        {group.options.map((option) => {
          const isActive = activeValue === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(option.value)}
              className={cn(
                "border px-4 py-2 text-sm transition-colors",
                isActive
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-900",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
