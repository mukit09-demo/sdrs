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

/**
 * Locale for instants rendered in the reader's own zone.
 *
 * Pinned, while the *zone* is deliberately not. The ask these exist for is
 * "show me when this happened in my time", not "in my date dialect": letting
 * the locale float too would reorder day and month per operator for no gain,
 * and the CMS is one team reading one inbox.
 */
export const LOCAL_DATETIME_LOCALE = "en-GB";

/**
 * Options for an instant rendered in the reader's own zone — note the absence
 * of `timeZone`, which is the entire mechanism: omitting it is what makes
 * `Intl` resolve the host's zone, where the two formatters above pin UTC so
 * that server and client agree.
 *
 * Exported as data, not hidden inside the function below, because the only
 * safe way to render one of these in Next is to format it twice — once on the
 * server and once in an inline script that corrects the DOM before first paint
 * (see `manage-web/src/components/ui/LocalTime.tsx`). That script is built by
 * `JSON.stringify`-ing this object, so both paths have to read the same one or
 * they drift.
 */
export const LOCAL_DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

/**
 * `"2026-10-10T14:32:05Z"` → `"10 October 2026, 15:32"` in *the reader's* zone.
 *
 * **Zone-dependent, so the output differs between server and client.** Rendering
 * this in a server component bakes in the container's zone; rendering it in a
 * client component without correcting the server's HTML is a hydration
 * mismatch. Use `LocalTime`, which handles both. This function is the shared
 * formatting rule those paths call, not a drop-in for a server component.
 *
 * Takes an instant (ISO-8601 with an offset), not a calendar date. Passing a
 * `YYYY-MM-DD` here would invent a midnight and shift the day for anyone west
 * of UTC.
 */
export function formatLocalDateTime(
  isoInstant: string,
  locale: string = LOCAL_DATETIME_LOCALE,
): string {
  return new Intl.DateTimeFormat(locale, LOCAL_DATETIME_OPTIONS).format(
    new Date(isoInstant),
  );
}
