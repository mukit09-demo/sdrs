/**
 * The public site's view of the content layer.
 *
 * A re-export rather than an implementation: the repository lives in
 * `@sdrs/shared` because `manage-web` needs the same one. What this file adds is
 * the narrowing — `content` is typed as `ContentRepository`, the read-only half
 * of the contract, so nothing in this app can call `saveProject` or
 * `deleteMarket`. The write half (`adminContent`) is deliberately not re-exported.
 *
 *   const markets = await content.listMarkets();
 */
export { content } from "@sdrs/shared/content";

export type {
  ArticleQuery,
  ContentRepository,
  EnquiryInput,
  EnquiryResult,
  ProjectQuery,
} from "@sdrs/shared/content";
