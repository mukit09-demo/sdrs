"use client";

import { Button } from "@/components/ui/Button";
import { deleteEntityAction } from "@/lib/admin/admin.action";

/**
 * Deletion is a form rather than a link, so it cannot be triggered by a prefetch
 * or a crawler. The confirmation is a `confirm()` on submit: enough to stop a
 * misclick, and it degrades to deleting without a prompt if scripting is off
 * rather than to not working.
 */
export function DeleteButton({
  collection,
  id,
  label,
}: {
  collection: string;
  id: string;
  /** What is being deleted, named in the prompt. */
  label: string;
}) {
  return (
    <form
      action={deleteEntityAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="collection" value={collection} />
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="link" className="text-sm hover:text-accent-600">
        Delete
      </Button>
    </form>
  );
}
