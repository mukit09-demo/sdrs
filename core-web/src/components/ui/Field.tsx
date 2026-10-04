import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils/cn";

const controlClasses =
  "w-full border border-ink-300 bg-white px-4 py-3 text-ink-900 " +
  "placeholder:text-ink-400 transition-colors " +
  "hover:border-ink-400 focus:border-ink-900 focus:outline-none " +
  "aria-[invalid=true]:border-brand-500";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Wires up the label, hint and error message for a control, including the
 * `aria-describedby` chain. Every form control on the site uses this shell so
 * validation messaging behaves the same way everywhere.
 */
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
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink-800">
        {label}
        {required && (
          <span className="ml-1 text-brand-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-ink-500">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-brand-600">
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
}

export function TextField({
  id,
  label,
  hint,
  error,
  required,
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
        className={controlClasses}
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
  rows = 6,
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
        className={cn(controlClasses, "resize-y")}
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
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClasses, "appearance-none pr-10")}
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
