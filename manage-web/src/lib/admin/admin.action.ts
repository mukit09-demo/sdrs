"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { routes } from "@/lib/config/routes";
import { hasErrors, readField } from "@sdrs/shared/utils/validate";
import type { EntityFormState } from "./admin";
import { SaveRejected, findCollection } from "./collections";
import { parseFields, validateFieldSpecs } from "./fields";

/**
 * Saves one entity.
 *
 * `requireAdmin()` runs first because a server action is a public endpoint: the
 * proxy redirect and the admin layout's guard both stop a *page* rendering, and
 * neither stops this being POSTed to directly.
 *
 * The collection name and the id being edited travel as hidden inputs rather
 * than closure arguments, so the form stays a plain `<form action={…}>` that
 * works the same whether or not JavaScript has loaded.
 */
export async function saveEntityAction(
  _previousState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  await requireUser();

  const collection = findCollection(readField(formData, "collection"));
  if (!collection) {
    return {
      status: "error",
      errors: {},
      message: "That collection no longer exists.",
    };
  }

  const values = parseFields(formData, collection.fields);
  const errors = validateFieldSpecs(values, collection.fields);

  if (hasErrors(errors)) {
    return { status: "error", errors, values };
  }

  // Accounts are admin-only. The descriptor checks this too; doing it here as
  // well means an editor POSTing straight at the action never reaches the
  // collection at all.
  if (collection.adminOnly) await requireAdmin();

  const previousId = readField(formData, "id") || undefined;

  let savedId: string;
  try {
    savedId = await collection.save(values, previousId);
  } catch (error) {
    // A refusal the operator should read — "that username is taken", "this is
    // the only admin account" — is surfaced as written. Anything else is a bug,
    // so it is logged and reported generically.
    if (error instanceof SaveRejected) {
      return { status: "error", errors: {}, values, message: error.message };
    }

    console.error(`Saving a ${collection.singular} failed`, error);
    return {
      status: "error",
      errors: {},
      values,
      message: `We could not save this ${collection.singular}. Please try again.`,
    };
  }

  revalidatePublicSite();

  // `redirect` throws, so it has to sit outside the try above.
  redirect(routes.edit(collection.name, savedId));
}

export async function deleteEntityAction(formData: FormData): Promise<void> {
  await requireUser();

  const collection = findCollection(readField(formData, "collection"));
  const id = readField(formData, "id");
  if (!collection || !id) return;

  if (collection.adminOnly) await requireAdmin();

  try {
    await collection.remove(id);
  } catch (error) {
    if (error instanceof SaveRejected) {
      // A delete is a bare form with nowhere to render a message, so the refusal
      // travels back as a query parameter and the list page shows it.
      redirect(
        `${routes.collection(collection.name)}?error=${encodeURIComponent(error.message)}`,
      );
    }
    throw error;
  }

  revalidatePublicSite();
  redirect(routes.collection(collection.name));
}

/**
 * Refreshes every public page rather than just the one that changed.
 *
 * Content here is cross-referenced: a market appears on the home page, on
 * `/markets`, on its own page and as a filter option on `/projects`, and a
 * service is listed by every market page that relates to it. Working out that
 * graph per edit would be more code than it is worth for an action that runs
 * when someone presses Save, so this invalidates everything under the root
 * layout and lets the next request re-render what it needs.
 */
function revalidatePublicSite(): void {
  revalidatePath("/", "layout");
}
