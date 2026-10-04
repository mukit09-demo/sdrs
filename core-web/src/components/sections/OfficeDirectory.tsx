"use client";

import { useMemo, useState } from "react";
import { FilterChips } from "@/components/ui/FilterChips";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { groupBy } from "@sdrs/shared/utils/array";
import type { FilterGroup, Office, OfficeRegion } from "@sdrs/shared/types/content";

export interface OfficeDirectoryProps {
  offices: Office[];
}

/** Display order for regions, independent of the order the data arrives in. */
const REGION_ORDER: readonly OfficeRegion[] = [
  "Europe",
  "Americas",
  "East Asia",
  "Australasia",
  "Middle East and Africa",
];

/** Office list grouped by region, with region chips to jump straight to one. */
export function OfficeDirectory({ offices }: OfficeDirectoryProps) {
  const [region, setRegion] = useState<OfficeRegion>();

  const regionsPresent = useMemo(
    () => REGION_ORDER.filter((value) => offices.some((o) => o.region === value)),
    [offices],
  );

  const group = useMemo<FilterGroup>(
    () => ({
      id: "region",
      label: "Region",
      options: regionsPresent.map((value) => ({ value, label: value })),
    }),
    [regionsPresent],
  );

  const grouped = useMemo(() => {
    const visible = region ? offices.filter((o) => o.region === region) : offices;
    const byRegion = groupBy(visible, (office) => office.region);
    return regionsPresent
      .map((value) => ({ region: value, offices: byRegion.get(value) ?? [] }))
      .filter((entry) => entry.offices.length > 0);
  }, [offices, region, regionsPresent]);

  return (
    <div>
      <FilterChips
        group={group}
        activeValue={region}
        onSelect={(value) =>
          setRegion((current) =>
            current === value ? undefined : (value as OfficeRegion),
          )
        }
      />

      <div className="mt-12 flex flex-col gap-16">
        {grouped.map((entry) => (
          <section key={entry.region}>
            <h3 className="font-display border-b border-ink-200 pb-4 text-xl font-medium text-ink-900">
              {entry.region}
            </h3>
            <ul className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {entry.offices.map((office) => (
                <li key={office.id}>
                  <OfficeCard office={office} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function OfficeCard({ office }: { office: Office }) {
  return (
    <article className="flex h-full flex-col border-t-2 border-ink-900 pt-5">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-display text-lg font-medium text-ink-900">
          {office.city}
        </h4>
        {office.isHeadquarters && <Tag tone="brand">Head office</Tag>}
      </div>
      <p className="mt-1 text-sm text-ink-500">{office.country}</p>

      <address className="mt-4 flex flex-col gap-3 text-sm text-ink-600 not-italic">
        <span className="flex gap-2.5">
          <PinIcon className="mt-0.5 size-4 shrink-0 text-ink-400" />
          <span>
            {office.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </span>
        </span>
        <a
          href={`tel:${office.phone.replace(/[^+\d]/g, "")}`}
          className="flex items-center gap-2.5 underline-offset-4 transition-colors hover:text-brand-600 hover:underline"
        >
          <PhoneIcon className="size-4 shrink-0 text-ink-400" />
          {office.phone}
        </a>
        <a
          href={`mailto:${office.email}`}
          className="flex items-center gap-2.5 break-all underline-offset-4 transition-colors hover:text-brand-600 hover:underline"
        >
          <MailIcon className="size-4 shrink-0 text-ink-400" />
          {office.email}
        </a>
      </address>
    </article>
  );
}
