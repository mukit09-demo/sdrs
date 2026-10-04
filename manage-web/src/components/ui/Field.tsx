import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The CMS's form controls.
 *
 * Props match core-web's `Field.tsx` exactly, so `FieldRenderer` works against
 * either — but these are sized for a dense editing form rather than a contact
 * form: smaller labels, tighter padding, rounded controls, a monospaced option
 * for identifiers.
 *
 * The label / hint / error structure and the `aria-describedby` chain are copied
 * deliberately rather than reinvented. That wiring is the reason a validation
 * message is announced against the control that produced it, and it should not
 * differ between the two apps.
 */
const controlClasses =
  "w-full rounded-control border border-ink-300 bg-white px-3 py-2 text-sm text-ink-900 " +
  "placeholder:text-ink-400 transition-colors " +
  "hover:border-ink-400 focus:border-accent-500 focus:outline-none " +
  "aria-[invalid=true]:border-danger-500 aria-[invalid=true]:bg-danger-50";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-xs font-medium text-ink-700">
        {label}
        {required && (
          <span className="ml-1 text-danger-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-ink-500">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** Builds the `aria-describedby` value from whichever helpers are present. */
function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /** Set for slugs and references, where character-level accuracy matters. */
  mono?: boolean;
}

export function TextField({
  id,
  label,
  hint,
  error,
  required,
  mono,
  ...inputProps
}: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <input
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClasses, mono && "font-mono")}
        {...inputProps}
      />
    </FieldShell>
  );
}

export interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className"> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  required,
  rows = 5,
  ...textareaProps
}: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        name={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClasses, "resize-y leading-relaxed")}
        {...textareaProps}
      />
    </FieldShell>
  );
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "className"> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({
  id,
  label,
  hint,
  error,
  required,
  options,
  placeholder,
  ...selectProps
}: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <select
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClasses, "pr-8")}
        {...selectProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
