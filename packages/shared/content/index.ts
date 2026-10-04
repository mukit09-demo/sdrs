import { isUsingMockContent } from "../config/content-env";
import { httpRepository } from "./http.repository";
import { mockRepository } from "./mock.repository";
import type { ContentAdminRepository, ContentRepository } from "./repository";

/**
 * The content API for both apps. Import this — never the data modules or either
 * concrete repository.
 *
 *   const markets = await content.listMarkets();
 *
 * Switching to the Spring Boot backend is `NEXT_PUBLIC_CONTENT_SOURCE=api`.
 *
 * Exported twice over the same object, which is the point: `core-web` imports
 * `content` and gets reads only, `manage-web` imports `adminContent` and gets
 * writes as well. The public app has no write method to call.
 */
const repository: ContentAdminRepository = isUsingMockContent
  ? mockRepository
  : httpRepository;

export const content: ContentRepository = repository;

export const adminContent: ContentAdminRepository = repository;

export type {
  ArticleQuery,
  ContentAdminRepository,
  ContentRepository,
  EnquiryInput,
  EnquiryResult,
  ProjectQuery,
} from "./repository";
