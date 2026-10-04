import type { ProjectLocation } from "../types/content";

/**
 * Fixed locale and UTC time zone so server and client render identical strings
 * — a mismatch here is a classic React hydration error.
 */
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** `"2026-04-18"` → `"18 April 2026"`. */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

/** `"2026-04-18"` → `"Apr 2026"`. */
export function formatShortDate(isoDate: string): string {
  return shortDateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

/** `{ city: "Sydney", country: "Australia" }` → `"Sydney, Australia"`. */
export function formatLocation(location: ProjectLocation): string {
  return [location.city, location.country].filter(Boolean).join(", ");
}

/** Sorts newest-first by an ISO date field, without mutating the input. */
export function sortByDateDesc<T>(items: T[], getDate: (item: T) => string): T[] {
  return [...items].sort((a, b) => getDate(b).localeCompare(getDate(a)));
}

/** Zero-pads a 1-based index for editorial numbering: `1` → `"01"`. */
export function formatOrdinal(index: number): string {
  return String(index).padStart(2, "0");
}
