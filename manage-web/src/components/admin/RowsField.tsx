"use client";

import { useState } from "react";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { type FieldView, rowInputName } from "@/lib/admin/fields";
import type { FieldErrors } from "@sdrs/shared/utils/validate";

/**
 * A repeatable list of objects — statistics, today.
 *
 * The only part of the admin form that needs client state, and it holds as
 * little as possible: a list of row keys. The inputs stay uncontrolled, named
 * `stats.0.value`, `stats.1.value`, … and the parser in `lib/admin/fields.ts`
 * collects whatever indices arrive, so removing a row mid-list is fine — it just
 * leaves a gap in the sequence, and blank rows are dropped on save.
 */
export function RowsField({
  field,
  rows,
  errors,
}: {
  field: FieldView;
  rows: Record<string, string>[];
  errors: FieldErrors;
}) {
  // Keys are the input-name indices. Stored rather than derived from length so
  // removing row 1 of 3 does not renumber (and so retype) the rows after it.
  const [keys, setKeys] = useState(() => rows.map((_, index) => index));
  const [nextKey, setNextKey] = useState(rows.length);

  const columns = field.members ?? [];

  return (
    <fieldset className="border border-ink-200 bg-ink-50/60 p-5">
      <legend className="px-2 text-sm font-medium text-ink-800">{field.label}</legend>
      {field.hint && <p className="mb-4 text-xs text-ink-500">{field.hint}</p>}

      <ul className="flex flex-col gap-5">
        {keys.map((key, position) => (
          <li
            key={key}
            className="flex flex-col gap-4 border-t border-ink-200 pt-5 first:border-t-0 first:pt-0 sm:flex-row sm:items-start"
          >
            {columns.map((column) => {
              const name = rowInputName(field.name, key, column.name);
              return (
                // `key` is the row's input-name index, which is also its index in
                // the loaded values — a newly added row has no loaded value, so
                // this reads blank for it.
                <div key={name} className="flex-1">
                  <TextField
                    id={name}
                    label={column.label}
                    error={errors[name]}
                    maxLength={column.maxLength}
                    defaultValue={rows[key]?.[column.name] ?? ""}
                  />
                </div>
              );
            })}
            <Button
              variant="secondary"
              size="sm"
              className="sm:mt-8"
              onClick={() => setKeys(keys.filter((candidate) => candidate !== key))}
              aria-label={`Remove ${field.label.toLowerCase()} row ${position + 1}`}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setKeys([...keys, nextKey]);
            setNextKey(nextKey + 1);
          }}
        >
          Add {field.label.toLowerCase().replace(/s$/, "")}
        </Button>
      </div>
    </fieldset>
  );
}
