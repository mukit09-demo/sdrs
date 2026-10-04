import { publicSiteUrl } from "./env";

/**
 * Chrome for the CMS — the counterpart to core-web's `config/site.ts`, and
 * deliberately much smaller.
 *
 * There is no navigation list here because the CMS's navigation *is* the
 * collection registry (`lib/admin/collections.ts`): adding a collection adds a
 * nav item, with nothing to keep in step. And there is no strapline, tagline or
 * legal-links list, because none of the marketing copy belongs in a tool.
 */
export const appConfig = {
  name: "SDRS",
  /** Shown in the header and the browser tab. */
  title: "SDRS Content",

  /** The public site, for the one outbound link in the header. */
  publicSiteUrl,
} as const;
