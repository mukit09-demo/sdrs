import Link from "next/link";
import type { AdminRow } from "@/lib/admin/collections";
import { routes } from "@/lib/config/routes";
import { DeleteButton } from "./DeleteButton";

/**
 * One collection's entries. A list rather than a `<table>`: the only tabular
 * thing here is the id, and this has to stay readable on a phone.
 */
export function EntityTable({
  collection,
  singular,
  rows,
}: {
  collection: string;
  singular: string;
  rows: AdminRow[];
}) {
  if (rows.length === 0) {
    return (
      <p className="border border-dashed border-ink-300 p-8 text-center text-ink-500">
        No {singular} entries yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-ink-200 border-y border-ink-200">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
        >
          <div className="min-w-0">
            <Link
              href={routes.edit(collection, row.id)}
              className="font-medium text-ink-900 underline-offset-4 hover:text-accent-600 hover:underline"
            >
              {row.title}
            </Link>
            <p className="mt-1 font-mono text-xs text-ink-400">{row.id}</p>
            {row.meta.length > 0 && (
              <p className="mt-2 text-sm text-ink-600">
                {row.meta.filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <Link
              href={routes.edit(collection, row.id)}
              className="text-sm text-ink-700 underline-offset-4 hover:text-accent-600 hover:underline"
            >
              Edit
            </Link>
            <DeleteButton collection={collection} id={row.id} label={row.title} />
          </div>
        </li>
      ))}
    </ul>
  );
}
