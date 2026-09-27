"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { CardGrid, type CardGridProps } from "@/components/sections/CardGrid";
import { FilterChips } from "@/components/ui/FilterChips";
import { CloseIcon, SearchIcon } from "@/components/ui/Icon";
import type { CardItem, FilterGroup } from "@/types/content";

export interface FilterableGridProps
  extends Pick<CardGridProps, "columns" | "variant" | "ratio" | "emptyMessage"> {
  items: CardItem[];
  /** One row of chips per group. Pass nothing for search only. */
  filterGroups?: FilterGroup[];
  searchPlaceholder?: string;
  /** Hides the free-text search, leaving only the chips. */
  showSearch?: boolean;
  /** Noun used in the result count, e.g. "3 projects". */
  itemNoun?: { singular: string; plural: string };
  /**
   * A control for the grid itself, placed opposite the search box. Used for the
   * film pause toggle on `/markets`; anything governing the whole set fits.
   */
  toolbarAction?: ReactNode;
}

/** `groupId → selected option value`. One selection per group. */
type Selection = Record<string, string | undefined>;

/**
 * Client-side search and filtering over any `CardItem[]`.
 *
 * Shared by markets, services, projects and news — the only difference between
 * those pages is which mapper produced the items and which filter groups are
 * passed in. Filtering runs in the browser because the collections are small;
 * move it into `ProjectQuery`/`ArticleQuery` if they ever grow past a page or two.
 */
export function FilterableGrid({
  items,
  filterGroups = [],
  searchPlaceholder = "Search",
  showSearch = true,
  itemNoun = { singular: "result", plural: "results" },
  toolbarAction,
  columns,
  variant,
  ratio,
  emptyMessage,
}: FilterableGridProps) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<Selection>({});

  const normalisedQuery = query.trim().toLowerCase();

  const visibleItems = useMemo(() => {
    const activeValues = Object.values(selection).filter(
      (value): value is string => Boolean(value),
    );

    return items.filter((item) => {
      const matchesFilters = activeValues.every((value) => item.tags?.includes(value));
      if (!matchesFilters) return false;

      if (!normalisedQuery) return true;
      return buildHaystack(item).includes(normalisedQuery);
    });
  }, [items, selection, normalisedQuery]);

  const activeCount =
    Object.values(selection).filter(Boolean).length + (normalisedQuery ? 1 : 0);

  function toggleOption(groupId: string, value: string) {
    setSelection((current) => ({
      ...current,
      // Clicking the active option clears it — chips behave as toggles.
      [groupId]: current[groupId] === value ? undefined : value,
    }));
  }

  function clearAll() {
    setSelection({});
    setQuery("");
  }

  return (
    <div>
      {(showSearch || filterGroups.length > 0 || toolbarAction) && (
        <div className="flex flex-col gap-8 border-b border-ink-200 pb-8">
          {(showSearch || toolbarAction) && (
            // Search and the grid's own control share a row: both act on the
            // set below, so they belong on the same line rather than stacked.
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              {showSearch && (
                <div className="relative w-full max-w-md">
                  <label htmlFor={searchId} className="sr-only">
                    {searchPlaceholder}
                  </label>
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-400" />
                  <input
                    id={searchId}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full border border-ink-300 bg-white py-3 pr-4 pl-12 text-ink-900 transition-colors placeholder:text-ink-400 hover:border-ink-400 focus:border-ink-900 focus:outline-none"
                  />
                </div>
              )}

              {toolbarAction && (
                <div className="shrink-0 self-start sm:self-auto">
                  {toolbarAction}
                </div>
              )}
            </div>
          )}

          {filterGroups.map((group) => (
            <FilterChips
              key={group.id}
              group={group}
              activeValue={selection[group.id]}
              onSelect={(value) => toggleOption(group.id, value)}
            />
          ))}
        </div>
      )}

      <div
        className="flex flex-wrap items-center justify-between gap-4 py-6"
        aria-live="polite"
      >
        <p className="text-sm text-ink-600">
          {visibleItems.length}{" "}
          {visibleItems.length === 1 ? itemNoun.singular : itemNoun.plural}
        </p>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-sm text-ink-600 underline-offset-4 transition-colors hover:text-brand-600 hover:underline"
          >
            <CloseIcon className="size-4" />
            Clear {activeCount === 1 ? "filter" : "filters"}
          </button>
        )}
      </div>

      <CardGrid
        items={visibleItems}
        columns={columns}
        variant={variant}
        ratio={ratio}
        emptyMessage={emptyMessage ?? "No results. Try clearing a filter."}
      />
    </div>
  );
}

function buildHaystack(item: CardItem): string {
  return [item.title, item.eyebrow, item.summary, ...(item.meta ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
