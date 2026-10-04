/**
 * Typed access to the environment variables the content layer needs.
 *
 * Both apps read content, so this lives in the shared package rather than in
 * either one. Anything app-specific — `manage-web`'s admin credentials,
 * `core-web`'s site chrome — stays in that app's own `lib/config/env.ts`, and
 * `process.env` is still read in exactly those places and nowhere else.
 */

export type ContentSource = "mock" | "api";

function readContentSource(): ContentSource {
  const raw = process.env.NEXT_PUBLIC_CONTENT_SOURCE?.trim().toLowerCase();
  if (raw === "api") return "api";
  if (raw === "mock" || raw === undefined || raw === "") return "mock";

  throw new Error(
    `Invalid NEXT_PUBLIC_CONTENT_SOURCE: "${raw}". Expected "mock" or "api".`,
  );
}

export const env = {
  /**
   * Where editorial content comes from. `mock` uses the bundled dummy data;
   * `api` calls the Spring Boot backend. This is the only switch that needs to
   * flip when the backend goes live — in both apps.
   */
  contentSource: readContentSource(),

  /**
   * Base URL for the Spring Boot API. Relative values are resolved against
   * `siteUrl` on the server, where `fetch` requires an absolute URL.
   */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "/api",

  /** The origin the app reading this is served on. Each app sets its own. */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002").replace(
    /\/$/,
    "",
  ),

  /** Seconds before cached API responses are revalidated. */
  defaultRevalidateSeconds: Number(process.env.CONTENT_REVALIDATE_SECONDS ?? 300),
} as const;

export const isUsingMockContent = env.contentSource === "mock";

/**
 * Where the mock repository keeps edits made in `manage-web`.
 *
 * Both apps resolve this against their own working directory, so in this repo
 * both point at `../.data/content.json` — one file at the repo root, written by
 * `manage-web` and read by `core-web`. Relative paths are deliberate: a deployed
 * environment can point it at a mounted volume instead.
 */
export function contentStorePath(): string {
  return process.env.CONTENT_STORE_PATH?.trim() || ".data/content.json";
}
