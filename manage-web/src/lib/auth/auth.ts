import type { FieldErrors, TextRule } from "@sdrs/shared/utils/validate";

/**
 * Shape shared by the login form and its server action — the same split as
 * core-web's `lib/content/enquiry.ts`, so the form can keep what was typed when a
 * submission is rejected.
 */

export const LOGIN_FIELDS = ["username", "password"] as const;

export type LoginField = (typeof LOGIN_FIELDS)[number];

export const loginRules: Record<LoginField, TextRule> = {
  username: { label: "Username", required: true, maxLength: 254 },
  password: { label: "Password", required: true, maxLength: 512 },
};

export interface LoginFormState {
  status: "idle" | "error";
  errors: FieldErrors<LoginField>;
  /** Only the username is replayed — a rejected password is never echoed back. */
  username?: string;
  /** Shown above the form when the credentials simply did not match. */
  message?: string;
}

export const INITIAL_LOGIN_STATE: LoginFormState = { status: "idle", errors: {} };

/**
 * One message for every failure, whichever field was wrong: naming the field
 * tells an attacker which half to keep.
 */
export const CREDENTIALS_REJECTED = "Those details did not match. Please try again.";
