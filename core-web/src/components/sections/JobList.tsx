"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FilterChips } from "@/components/ui/FilterChips";
import { Tag } from "@/components/ui/Tag";
import { uniqueSorted } from "@sdrs/shared/utils/array";
import { formatShortDate, sortByDateDesc } from "@sdrs/shared/utils/format";
import type { FilterGroup, JobOpening } from "@sdrs/shared/types/content";

export interface JobListProps {
  openings: JobOpening[];
  /** Where the apply button points. Defaults to the enquiry form. */
  applyHref?: string;
}

/**
 * Vacancy list with level and discipline chips.
 *
 * Filter options are derived from the openings themselves, so a new discipline
 * in the data appears as a chip without any change here.
 */
export function JobList({ openings, applyHref = "#apply" }: JobListProps) {
  const [level, setLevel] = useState<string>();
  const [discipline, setDiscipline] = useState<string>();

  const groups = useMemo<FilterGroup[]>(
    () => [
      {
        id: "level",
        label: "Experience level",
        options: uniqueSorted(openings.map((opening) => opening.level)).map(toOption),
      },
      {
        id: "discipline",
        label: "Discipline",
        options: uniqueSorted(openings.map((opening) => opening.discipline)).map(
          toOption,
        ),
      },
    ],
    [openings],
  );

  const visible = useMemo(() => {
    const matching = openings.filter(
      (opening) =>
        (!level || opening.level === level) &&
        (!discipline || opening.discipline === discipline),
    );
    return sortByDateDesc(matching, (opening) => opening.postedAt);
  }, [openings, level, discipline]);

  return (
    <div>
      <div className="flex flex-col gap-8 border-b border-ink-200 pb-8">
        <FilterChips
          group={groups[0]}
          activeValue={level}
          onSelect={(value) => setLevel((current) => toggle(current, value))}
        />
        <FilterChips
          group={groups[1]}
          activeValue={discipline}
          onSelect={(value) => setDiscipline((current) => toggle(current, value))}
        />
      </div>

      <p className="py-6 text-sm text-ink-600" aria-live="polite">
        {visible.length} {visible.length === 1 ? "opening" : "openings"}
      </p>

      {visible.length === 0 ? (
        <p className="border border-dashed border-ink-200 px-6 py-12 text-center text-ink-500">
          No openings match this combination. Clear a filter or register your interest.
        </p>
      ) : (
        <ul className="divide-y divide-ink-200 border-y border-ink-200">
          {visible.map((opening) => (
            <li
              key={opening.id}
              className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="font-display text-lg font-medium text-ink-900">
                  {opening.title}
                </h3>
                <p className="mt-1 text-sm text-ink-600">
                  {opening.location} &middot; {opening.employmentType} &middot; Posted{" "}
                  {formatShortDate(opening.postedAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Tag tone="outline">{opening.discipline}</Tag>
                  <Tag tone="brand">{opening.level}</Tag>
                </div>
              </div>
              <Button
                href={applyHref}
                variant="secondary"
                icon="arrow"
                className="shrink-0"
              >
                <span className="sr-only">Apply for </span>
                {opening.title}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function toggle(current: string | undefined, value: string): string | undefined {
  return current === value ? undefined : value;
}

function toOption(value: string) {
  return { value, label: value };
}
