import { env } from "../config/content-env";

/** Thrown for any non-2xx response, so callers can branch on `status`. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** A missing resource is a routing concern, not an error to surface. */
  get isNotFound(): boolean {
    return this.status === 404;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Serialised as JSON. Omit for GET requests. */
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  /**
   * Seconds to cache the response for. `0` opts out of caching entirely —
   * use it for anything user-specific or mutating.
   */
  revalidate?: number;
  signal?: AbortSignal;
}

/**
 * `fetch` needs an absolute URL during server rendering, but a same-origin
 * relative path is preferable in the browser (it goes through the Next rewrite
 * and avoids CORS). Resolve accordingly.
 */
function resolveUrl(path: string, query?: RequestOptions["query"]): string {
  const base = env.apiBaseUrl.startsWith("http")
    ? env.apiBaseUrl
    : `${typeof window === "undefined" ? env.siteUrl : ""}${env.apiBaseUrl}`;

  const url = new URL(
    `${base}${path.startsWith("/") ? path : `/${path}`}`,
    // Only used when `base` is relative, i.e. in the browser.
    typeof window === "undefined" ? undefined : window.location.origin,
  );

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  return url.toString();
}

/**
 * The single outbound HTTP path to the Spring Boot backend. Everything in
 * `../content/http.repository.ts` goes through here, so retries, auth
 * headers and tracing only need adding in one place.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    headers,
    query,
    revalidate = env.defaultRevalidateSeconds,
    signal,
  } = options;

  const url = resolveUrl(path, query);

  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
    ...(method === "GET" && revalidate > 0
      ? { next: { revalidate } }
      : { cache: "no-store" as const }),
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      url,
      `${method} ${path} failed with ${response.status} ${response.statusText}`,
      await safeParse(response),
    );
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

async function safeParse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

/** Resolves to `null` on 404 instead of throwing — for detail-page lookups. */
export async function apiRequestOrNull<T>(
  path: string,
  options?: RequestOptions,
): Promise<T | null> {
  try {
    return await apiRequest<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) return null;
    throw error;
  }
}
