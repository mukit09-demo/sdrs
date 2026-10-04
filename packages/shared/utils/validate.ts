/**
 * Minimal form validation.
 *
 * Deliberately hand-rolled instead of pulling in a schema library: the site has
 * exactly one form, and the rules below are the whole surface. If validation
 * grows past this file, that is the point to reach for zod — and the shape
 * returned here (`FieldErrors`) is what a resolver would produce anyway.
 */

/** `fieldName → message`. Empty object means valid. */
export type FieldErrors<TField extends string = string> = Partial<
  Record<TField, string>
>;

export interface TextRule {
  label: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  /** Validate the trimmed value; return a message to reject it. */
  refine?: (value: string) => string | undefined;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Reads a single trimmed string from `FormData`, tolerating missing keys. */
export function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Reads every named field into a plain object, so a failed submit can be replayed. */
export function readFields<TField extends string>(
  formData: FormData,
  names: readonly TField[],
): Record<TField, string> {
  return Object.fromEntries(
    names.map((name) => [name, readField(formData, name)]),
  ) as Record<TField, string>;
}

/** Returns the first failing message for one value, or `undefined` when valid. */
export function validateText(value: string, rule: TextRule): string | undefined {
  if (!value) {
    return rule.required ? `${rule.label} is required.` : undefined;
  }
  if (rule.minLength && value.length < rule.minLength) {
    return `${rule.label} must be at least ${rule.minLength} characters.`;
  }
  if (rule.maxLength && value.length > rule.maxLength) {
    return `${rule.label} must be ${rule.maxLength} characters or fewer.`;
  }
  return rule.refine?.(value);
}

/** Rule fragment for email fields: `{ ...emailRule("Email") }`. */
export function emailRule(label: string): TextRule {
  return {
    label,
    required: true,
    maxLength: 254,
    refine: (value) =>
      EMAIL_PATTERN.test(value) ? undefined : "Enter a valid email address.",
  };
}

/** Applies a rule per field and collects the failures. */
export function validateFields<TField extends string>(
  values: Record<TField, string>,
  rules: Record<TField, TextRule>,
): FieldErrors<TField> {
  const errors: FieldErrors<TField> = {};
  for (const field of Object.keys(rules) as TField[]) {
    const message = validateText(values[field], rules[field]);
    if (message) errors[field] = message;
  }
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
