import type { MediaImage, Stat } from "@sdrs/shared/types/content";
import {
  type FieldErrors,
  type TextRule,
  validateText,
} from "@sdrs/shared/utils/validate";

/**
 * Declarative description of one editable field.
 *
 * A `FieldSpec[]` is the whole definition of an entity's form: it renders the
 * controls, validates the submission and parses it back into the domain type.
 * That is why the admin needs one form page rather than six — the same reason
 * `mappers.ts` means one card component serves every collection.
 *
 * Composite values are flattened into dotted input names (`image.alt`,
 * `location.country`, `stats.0.value`), so everything travels as ordinary
 * `FormData` and no client-side state is needed except for adding and removing
 * rows.
 */

export type ScalarKind =
  | "text"
  | "textarea"
  | "number"
  | "select"
  /**
   * A password. Rendered as `type="password"` and never pre-filled, so a stored
   * hash cannot leak into the page. Blank on an edit means "leave it unchanged" —
   * which is why `required` is interpreted by the descriptor rather than here.
   */
  | "password";

export interface ScalarSpec {
  name: string;
  label: string;
  kind: ScalarKind;
  hint?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  /** Options for `kind: "select"`. The stored value is the option itself. */
  options?: readonly string[];
  /** Extra check on the trimmed value; return a message to reject it. */
  refine?: (value: string) => string | undefined;
}

export type FieldSpec =
  | ScalarSpec
  /** A `string[]`, edited as a textarea with one entry per line. */
  | {
      kind: "lines";
      name: string;
      label: string;
      hint?: string;
      required?: boolean;
    }
  /** A `MediaImage`. Leave the URL blank and the gradient placeholder renders. */
  | { kind: "image"; name: string; label: string; hint?: string }
  /** A repeatable list of objects — `Stat[]`. */
  | {
      kind: "rows";
      name: string;
      label: string;
      hint?: string;
      columns: ScalarSpec[];
    }
  /** A fixed nested object — a location, an author, a film. */
  | {
      kind: "group";
      name: string;
      label: string;
      hint?: string;
      fields: ScalarSpec[];
    };

/** Every value a parsed form can hold. */
export type FieldValue =
  | string
  | number
  | string[]
  | Record<string, string>
  | Record<string, string>[];

export type FieldValues = Record<string, FieldValue>;

/** `stats.0.value` — the input name for one cell of a `rows` field. */
export function rowInputName(field: string, index: number, column: string): string {
  return `${field}.${index}.${column}`;
}

/** `image.alt` — the input name for one member of a group or image field. */
export function memberInputName(field: string, member: string): string {
  return `${field}.${member}`;
}

export function isScalar(field: FieldSpec): field is ScalarSpec {
  return (
    field.kind === "text" ||
    field.kind === "textarea" ||
    field.kind === "number" ||
    field.kind === "select" ||
    field.kind === "password"
  );
}

/** The sub-inputs a `kind: "image"` field renders. */
export const IMAGE_MEMBERS: ScalarSpec[] = [
  {
    name: "alt",
    label: "Alt text",
    kind: "text",
    required: true,
    maxLength: 200,
    hint: "Always required — the gradient placeholder needs a description too.",
  },
  {
    name: "url",
    label: "Image URL",
    kind: "text",
    maxLength: 500,
    hint: "Leave blank to use the generated gradient placeholder.",
  },
  {
    name: "seed",
    label: "Placeholder seed",
    kind: "text",
    maxLength: 100,
    hint: "Stable string the placeholder gradient is derived from. Defaults to the alt text.",
  },
];

// --- Views -----------------------------------------------------------------

/**
 * A `FieldSpec` with the functions taken out, so it can be handed to a client
 * component. `refine` and the length bounds exist for validation, which happens
 * in the server action against the real specs — the form only needs to know what
 * to draw.
 */
export interface FieldView {
  kind: FieldSpec["kind"];
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  maxLength?: number;
  options?: readonly string[];
  /** Sub-inputs for `image`, `group` and `rows`. */
  members?: FieldView[];
}

export function toFieldViews(fields: FieldSpec[]): FieldView[] {
  return fields.map((field) => {
    if (isScalar(field)) {
      return {
        kind: field.kind,
        name: field.name,
        label: field.label,
        hint: field.hint,
        required: field.required,
        maxLength: field.maxLength,
        options: field.options,
      };
    }

    const members =
      field.kind === "image"
        ? IMAGE_MEMBERS
        : field.kind === "group"
          ? field.fields
          : field.kind === "rows"
            ? field.columns
            : undefined;

    return {
      kind: field.kind,
      name: field.name,
      label: field.label,
      hint: field.hint,
      required: field.kind === "lines" ? field.required : undefined,
      ...(members ? { members: toFieldViews(members) } : {}),
    };
  });
}

// --- Parsing ---------------------------------------------------------------

/** Reads one trimmed string from `FormData`, tolerating missing keys. */
function readOne(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Turns a submitted form into values keyed by field name, with composites
 * rebuilt into objects and arrays.
 */
export function parseFields(formData: FormData, fields: FieldSpec[]): FieldValues {
  const values: FieldValues = {};

  for (const field of fields) {
    if (isScalar(field)) {
      const raw = readOne(formData, field.name);
      values[field.name] = field.kind === "number" ? toNumber(raw) : raw;
      continue;
    }

    switch (field.kind) {
      case "lines":
        values[field.name] = splitLines(readOne(formData, field.name));
        break;

      case "image":
        values[field.name] = readMembers(formData, field.name, IMAGE_MEMBERS);
        break;

      case "group":
        values[field.name] = readMembers(formData, field.name, field.fields);
        break;

      case "rows":
        values[field.name] = readRows(formData, field.name, field.columns);
        break;
    }
  }

  return values;
}

function readMembers(
  formData: FormData,
  field: string,
  members: ScalarSpec[],
): Record<string, string> {
  return Object.fromEntries(
    members.map((member) => [
      member.name,
      readOne(formData, memberInputName(field, member.name)),
    ]),
  );
}

/**
 * Collects `name.0.col`, `name.1.col`, … Rows are read by index rather than by
 * counting, because removing a row in the browser leaves a gap in the sequence;
 * entirely blank rows are dropped.
 */
function readRows(
  formData: FormData,
  field: string,
  columns: ScalarSpec[],
): Record<string, string>[] {
  const indices = new Set<number>();

  for (const key of formData.keys()) {
    const match = key.match(new RegExp(`^${escapeRegExp(field)}\\.(\\d+)\\.`));
    if (match) indices.add(Number(match[1]));
  }

  return [...indices]
    .sort((a, b) => a - b)
    .map((index) =>
      Object.fromEntries(
        columns.map((column) => [
          column.name,
          readOne(formData, rowInputName(field, index, column.name)),
        ]),
      ),
    )
    .filter((row) => Object.values(row).some(Boolean));
}

/** One entry per non-blank line. */
function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// --- Validation ------------------------------------------------------------

function toRule(spec: ScalarSpec): TextRule {
  return {
    label: spec.label,
    required: spec.required,
    minLength: spec.minLength,
    maxLength: spec.maxLength,
    refine: spec.refine,
  };
}

/**
 * Validates parsed values with the shared `validateText`, returning errors keyed
 * by input name so they land on the control that produced them.
 */
export function validateFieldSpecs(
  values: FieldValues,
  fields: FieldSpec[],
): FieldErrors {
  const errors: FieldErrors = {};

  const check = (name: string, value: string, spec: ScalarSpec) => {
    const message = validateText(value, toRule(spec));
    if (message) errors[name] = message;
  };

  for (const field of fields) {
    if (isScalar(field)) {
      check(field.name, String(values[field.name] ?? ""), field);
      continue;
    }

    if (field.kind === "lines") {
      const lines = (values[field.name] ?? []) as string[];
      if (field.required && lines.length === 0) {
        errors[field.name] = `${field.label} needs at least one entry.`;
      }
      continue;
    }

    if (field.kind === "image" || field.kind === "group") {
      const members = field.kind === "image" ? IMAGE_MEMBERS : field.fields;
      const value = (values[field.name] ?? {}) as Record<string, string>;
      for (const member of members) {
        check(memberInputName(field.name, member.name), value[member.name] ?? "", member);
      }
      continue;
    }

    const rows = (values[field.name] ?? []) as Record<string, string>[];
    rows.forEach((row, index) => {
      for (const column of field.columns) {
        check(rowInputName(field.name, index, column.name), row[column.name] ?? "", column);
      }
    });
  }

  return errors;
}

// --- Readers, for assembling a domain object out of parsed values ----------

export function str(values: FieldValues, name: string): string {
  const value = values[name];
  return typeof value === "string" ? value : "";
}

export function num(values: FieldValues, name: string): number {
  const value = values[name];
  return typeof value === "number" ? value : 0;
}

export function list(values: FieldValues, name: string): string[] {
  const value = values[name];
  return Array.isArray(value) ? (value as string[]).map(String) : [];
}

export function group(values: FieldValues, name: string): Record<string, string> {
  const value = values[name];
  return value && !Array.isArray(value) && typeof value === "object"
    ? (value as Record<string, string>)
    : {};
}

/** Drops the optional members when blank, matching `MediaImage`'s contract. */
export function image(values: FieldValues, name: string): MediaImage {
  const members = group(values, name);
  return {
    alt: members.alt ?? "",
    ...(members.url ? { url: members.url } : {}),
    ...(members.seed ? { seed: members.seed } : {}),
  };
}

export function imageToValues(media: MediaImage): Record<string, string> {
  return { alt: media.alt, url: media.url ?? "", seed: media.seed ?? "" };
}

export function stats(values: FieldValues, name: string): Stat[] {
  const rows = values[name];
  if (!Array.isArray(rows)) return [];

  return (rows as Record<string, string>[]).map((row) => ({
    value: row.value ?? "",
    ...(row.unit ? { unit: row.unit } : {}),
    label: row.label ?? "",
  }));
}

export function statsToValues(entries: Stat[]): Record<string, string>[] {
  return entries.map((entry) => ({
    value: entry.value,
    unit: entry.unit ?? "",
    label: entry.label,
  }));
}

/** The `rows` columns every `Stat[]` field uses. */
export const STAT_COLUMNS: ScalarSpec[] = [
  { name: "value", label: "Value", kind: "text", required: true, maxLength: 20 },
  { name: "unit", label: "Unit", kind: "text", maxLength: 20 },
  { name: "label", label: "Label", kind: "text", required: true, maxLength: 120 },
];
