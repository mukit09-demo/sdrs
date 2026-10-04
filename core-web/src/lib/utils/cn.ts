type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

/**
 * Minimal conditional class joiner.
 *
 * Deliberately not `tailwind-merge`: components in this codebase expose
 * explicit `variant` props rather than inviting callers to override arbitrary
 * utilities, so conflict resolution is unnecessary weight.
 */
export function cn(...values: ClassValue[]): string {
  const classes: string[] = [];

  for (const value of values) {
    if (!value) continue;

    if (typeof value === "string" || typeof value === "number") {
      classes.push(String(value));
    } else if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) classes.push(nested);
    } else {
      for (const [key, enabled] of Object.entries(value)) {
        if (enabled) classes.push(key);
      }
    }
  }

  return classes.join(" ");
}
