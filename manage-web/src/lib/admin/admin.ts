import type { FieldErrors } from "@sdrs/shared/utils/validate";
import type { FieldValues } from "./fields";

/** State the entity form and its action pass back and forth. */
export interface EntityFormState {
  status: "idle" | "error";
  errors: FieldErrors;
  /** The submission, replayed so a rejected save keeps what was typed. */
  values?: FieldValues;
  /** Shown above the form when the save failed for a reason no field owns. */
  message?: string;
}

export const INITIAL_ENTITY_STATE: EntityFormState = { status: "idle", errors: {} };
