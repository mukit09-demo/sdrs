"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { INITIAL_ENTITY_STATE } from "@/lib/admin/admin";
import { saveEntityAction } from "@/lib/admin/admin.action";
import type { FieldValues, FieldView } from "@/lib/admin/fields";
import { FieldRenderer } from "./FieldRenderer";

/**
 * The create and edit form for every collection.
 *
 * Driven entirely by `views`, so there is one of these rather than six. The
 * collection name and the id being edited travel as hidden inputs, which keeps
 * the action a plain form action.
 */
export function EntityForm({
  collection,
  singular,
  views,
  values,
  id,
}: {
  collection: string;
  singular: string;
  views: FieldView[];
  /** Loaded values when editing; empty when creating. */
  values: FieldValues;
  /** Absent when creating. */
  id?: string;
}) {
  const [state, action, pending] = useActionState(
    saveEntityAction,
    INITIAL_ENTITY_STATE,
  );

  // A rejected submission replays what was sent; otherwise show what was loaded.
  const current = state.values ?? values;

  return (
    <form action={action} className="flex flex-col gap-7">
      <input type="hidden" name="collection" value={collection} />
      {id !== undefined && <input type="hidden" name="id" value={id} />}

      {state.message && (
        <p role="alert" className="border border-danger-500 bg-danger-50 p-4 text-sm text-danger-700">
          {state.message}
        </p>
      )}

      {views.map((view) => (
        <FieldRenderer
          key={view.name}
          field={view}
          values={current}
          errors={state.errors}
        />
      ))}

      <div className="flex items-center gap-4 border-t border-ink-200 pt-7">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : `Save ${singular}`}
        </Button>
        <p className="text-sm text-ink-500">
          Changes go live on the public site as soon as they are saved.
        </p>
      </div>
    </form>
  );
}
