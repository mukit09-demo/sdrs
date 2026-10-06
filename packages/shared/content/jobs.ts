import type { JobOpening } from "../types/content";

/**
 * What makes a job an *opening*.
 *
 * One definition, used by both repository implementations, because "which jobs
 * does a candidate see" must not differ between the mock and the API. The
 * backend expresses the same predicate in SQL
 * (`status = 'OPEN' and (deadline is null or deadline >= current_date)`), and
 * `Job.isPubliclyVisibleOn` in `backend/` is its third copy — three because
 * each layer filters where it is cheapest, not because the rule is ambiguous.
 */

/** Today in UTC, as `YYYY-MM-DD`. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Advertised, and still accepting applications.
 *
 * Dates are compared as strings. That is not a shortcut: ISO-8601 dates sort
 * lexicographically, so this avoids parsing into `Date` and the time-zone
 * mistakes that come with it — `new Date("2026-11-05")` is midnight UTC, which
 * is the previous day in half the world.
 *
 * No deadline means "open until filled", so an absent deadline never closes a
 * role.
 *
 * Note for `core-web`: `/careers` is prerendered, so this is evaluated at build
 * time there. A deadline passing does not hide a role until the next build —
 * the same limitation the README describes for CMS edits reaching a production
 * build, and the same fix (a revalidation webhook).
 */
export function isOpening(job: JobOpening, on: string = todayIso()): boolean {
  return job.status === "Open" && (job.deadline === undefined || job.deadline >= on);
}
