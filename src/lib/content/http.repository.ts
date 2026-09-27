import { apiRequest, apiRequestOrNull } from "@/lib/api/http";
import type {
  AboutContent,
  Article,
  CareersContent,
  ContactContent,
  DigitalTool,
  HomeContent,
  Issue,
  Market,
  Project,
  ResearchContent,
  Service,
} from "@/types/content";
import type {
  ArticleQuery,
  ContentRepository,
  EnquiryInput,
  EnquiryResult,
  ProjectQuery,
} from "./repository";

/**
 * Talks to the Spring Boot backend. Activated by
 * `NEXT_PUBLIC_CONTENT_SOURCE=api`.
 *
 * Endpoints assumed here — adjust to match the controllers once they exist:
 *
 *   GET  /api/markets                 → Market[]
 *   GET  /api/markets/{slug}          → Market
 *   GET  /api/services                → Service[]
 *   GET  /api/services/{slug}         → Service
 *   GET  /api/digital-tools           → DigitalTool[]
 *   GET  /api/projects?market=&service=&slugs=&limit=
 *                                     → Project[]
 *   GET  /api/projects/{slug}         → Project
 *   GET  /api/articles?tag=&limit=&exclude=
 *                                     → Article[]
 *   GET  /api/articles/{slug}         → Article
 *   GET  /api/issues?limit=           → Issue[]
 *   GET  /api/pages/home              → HomeContent
 *   GET  /api/pages/about             → AboutContent
 *   GET  /api/pages/careers           → CareersContent
 *   GET  /api/pages/research          → ResearchContent
 *   GET  /api/pages/contact           → ContactContent
 *   POST /api/enquiries               → EnquiryResult
 */
export const httpRepository: ContentRepository = {
  listMarkets() {
    return apiRequest<Market[]>("/markets");
  },

  getMarket(slug) {
    return apiRequestOrNull<Market>(`/markets/${encodeURIComponent(slug)}`);
  },

  listServices() {
    return apiRequest<Service[]>("/services");
  },

  getService(slug) {
    return apiRequestOrNull<Service>(`/services/${encodeURIComponent(slug)}`);
  },

  listDigitalTools() {
    return apiRequest<DigitalTool[]>("/digital-tools");
  },

  listProjects(query: ProjectQuery = {}) {
    return apiRequest<Project[]>("/projects", {
      query: {
        market: query.marketSlug,
        service: query.serviceSlug,
        slugs: query.slugs?.join(","),
        limit: query.limit,
      },
    });
  },

  getProject(slug) {
    return apiRequestOrNull<Project>(`/projects/${encodeURIComponent(slug)}`);
  },

  listArticles(query: ArticleQuery = {}) {
    return apiRequest<Article[]>("/articles", {
      query: {
        tag: query.tag,
        limit: query.limit,
        exclude: query.excludeSlug,
      },
    });
  },

  getArticle(slug) {
    return apiRequestOrNull<Article>(`/articles/${encodeURIComponent(slug)}`);
  },

  listIssues(limit) {
    return apiRequest<Issue[]>("/issues", { query: { limit } });
  },

  getHomeContent() {
    return apiRequest<HomeContent>("/pages/home");
  },

  getAboutContent() {
    return apiRequest<AboutContent>("/pages/about");
  },

  getCareersContent() {
    return apiRequest<CareersContent>("/pages/careers");
  },

  getResearchContent() {
    return apiRequest<ResearchContent>("/pages/research");
  },

  getContactContent() {
    return apiRequest<ContactContent>("/pages/contact");
  },

  submitEnquiry(input: EnquiryInput) {
    return apiRequest<EnquiryResult>("/enquiries", {
      method: "POST",
      body: input,
      revalidate: 0,
    });
  },
};
