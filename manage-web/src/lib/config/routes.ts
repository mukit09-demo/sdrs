/**
 * Every internal URL in the CMS is built here, the same convention core-web
 * follows.
 *
 * There is no `/admin` prefix: this app *is* the admin, so a collection sits at
 * `/markets`, not `/admin/markets`. Deployed on its own host (`admin.…`) that
 * reads naturally, and it keeps the paths short while editing.
 */
export const routes = {
  dashboard: "/",
  login: "/login",

  collection: (collection: string) => `/${collection}`,
  create: (collection: string) => `/${collection}/new`,
  edit: (collection: string, id: string) =>
    `/${collection}/${encodeURIComponent(id)}`,
} as const;

/**
 * Paths that do not require a session. Used by `src/proxy.ts` and by the
 * post-login redirect, which refuses to send anyone outside this app.
 */
export const PUBLIC_PATHS: readonly string[] = [routes.login];
