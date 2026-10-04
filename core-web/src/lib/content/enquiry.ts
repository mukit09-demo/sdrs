import { emailRule, type FieldErrors, type TextRule } from "@sdrs/shared/utils/validate";

/**
 * Shape and rules for the contact enquiry form.
 *
 * Kept out of `enquiry.action.ts` because a `"use server"` module may only
 * export async functions — the form imports its types and initial state from
 * here, and the action from there.
 */

/** Field names, shared by the form markup and the validator. */
export const ENQUIRY_FIELDS = [
  "name",
  "email",
  "organisation",
  "topic",
  "message",
] as const;

export type EnquiryField = (typeof ENQUIRY_FIELDS)[number];

export type EnquiryFormState =
  | { status: "idle" }
  | {
      status: "error";
      errors: FieldErrors<EnquiryField>;
      /** Echoed back so a rejected submission keeps what was typed. */
      values: Record<EnquiryField, string>;
      /** Set when the failure was not a field-level one. */
      message?: string;
    }
  | { status: "success"; reference: string };

export const initialEnquiryState: EnquiryFormState = { status: "idle" };

export const enquiryRules: Record<EnquiryField, TextRule> = {
  name: { label: "Name", required: true, minLength: 2, maxLength: 80 },
  email: emailRule("Email"),
  organisation: { label: "Organisation", maxLength: 120 },
  topic: { label: "Topic", required: true },
  message: { label: "Message", required: true, minLength: 20, maxLength: 2000 },
};
