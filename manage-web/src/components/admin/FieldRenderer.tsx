"use client";

import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import {
  type FieldValue,
  type FieldValues,
  type FieldView,
  memberInputName,
} from "@/lib/admin/fields";
import type { FieldErrors } from "@sdrs/shared/utils/validate";
import { RowsField } from "./RowsField";

/**
 * Renders one `FieldView` with the site's existing form primitives, so admin
 * controls get the same labelling, hint and error wiring — including the
 * `aria-describedby` chain — as the public enquiry form.
 *
 * Inputs are uncontrolled (`defaultValue`): a rejected submission re-renders
 * this tree but keeps the same DOM nodes, so whatever was typed is still there
 * without any of it being held in React state.
 */
export function FieldRenderer({
  field,
  values,
  errors,
}: {
  field: FieldView;
  values: FieldValues;
  errors: FieldErrors;
}) {
  const value = values[field.name];

  switch (field.kind) {
    case "textarea":
      return (
        <TextAreaField
          id={field.name}
          label={field.label}
          hint={field.hint}
          error={errors[field.name]}
          required={field.required}
          maxLength={field.maxLength}
          rows={5}
          defaultValue={asString(value)}
        />
      );

    case "select":
      return (
        <SelectField
          id={field.name}
          label={field.label}
          hint={field.hint}
          error={errors[field.name]}
          required={field.required}
          options={(field.options ?? []).map((option) => ({
            value: option,
            label: option,
          }))}
          defaultValue={asString(value)}
        />
      );

    case "password":
      return (
        <TextField
          id={field.name}
          label={field.label}
          hint={field.hint}
          error={errors[field.name]}
          required={field.required}
          type="password"
          autoComplete="new-password"
          // Never pre-filled: there is nothing to pre-fill it with (the stored
          // value is a hash) and an empty box on an edit means "leave unchanged".
          defaultValue=""
        />
      );

    case "number":
      return (
        <TextField
          id={field.name}
          label={field.label}
          hint={field.hint}
          error={errors[field.name]}
          required={field.required}
          type="number"
          defaultValue={asString(value)}
        />
      );

    case "lines":
      return (
        <TextAreaField
          id={field.name}
          label={field.label}
          hint={field.hint}
          error={errors[field.name]}
          required={field.required}
          rows={6}
          defaultValue={asLines(value)}
        />
      );

    case "image":
    case "group":
      return (
        <MemberGroup field={field} value={value} errors={errors} />
      );

    case "rows":
      return (
        <RowsField
          field={field}
          rows={Array.isArray(value) ? (value as Record<string, string>[]) : []}
          errors={errors}
        />
      );

    default:
      return (
        <TextField
          id={field.name}
          label={field.label}
          hint={field.hint}
          error={errors[field.name]}
          required={field.required}
          maxLength={field.maxLength}
          defaultValue={asString(value)}
        />
      );
  }
}

/** A nested object — an image, a location, an author, a film — as a fieldset. */
function MemberGroup({
  field,
  value,
  errors,
}: {
  field: FieldView;
  value: FieldValue | undefined;
  errors: FieldErrors;
}) {
  const members = value && !Array.isArray(value) ? (value as Record<string, string>) : {};

  return (
    <fieldset className="border border-ink-200 bg-ink-50/60 p-5">
      <legend className="px-2 text-sm font-medium text-ink-800">{field.label}</legend>
      {field.hint && <p className="mb-4 text-xs text-ink-500">{field.hint}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        {(field.members ?? []).map((member) => {
          const name = memberInputName(field.name, member.name);
          const shared = {
            id: name,
            label: member.label,
            hint: member.hint,
            error: errors[name],
            required: member.required,
            maxLength: member.maxLength,
            defaultValue: members[member.name] ?? "",
          };

          // The field primitives do not take a `className`, so the column span
          // goes on a wrapper.
          return (
            <div
              key={name}
              className={member.kind === "textarea" ? "sm:col-span-2" : undefined}
            >
              {member.kind === "textarea" ? (
                <TextAreaField {...shared} rows={3} />
              ) : (
                <TextField {...shared} />
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function asString(value: FieldValue | undefined): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

/** `string[]` is edited as one entry per line. */
function asLines(value: FieldValue | undefined): string {
  return Array.isArray(value) ? (value as string[]).join("\n") : "";
}
