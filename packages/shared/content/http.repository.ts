import { apiRequest, apiRequestOrNull } from "../api/http";
import type {
  AboutContent,
  Article,
  CareersContent,
  ContactContent,
  DigitalTool,
  HomeContent,
  Issue,
  JobOpening,
  Market,
  Project,
  ResearchContent,
  Service,
} from "../types/content";
import type {
  ArticleQuery,
  ContentAdminRepository,
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
 *   GET  /api/issues/{slug}           → Issue
 *   GET  /api/pages/home              → HomeContent
 *   GET  /api/pages/about             → AboutContent
 *   GET  /api/pages/careers           → CareersContent
 *   GET  /api/pages/research          → ResearchContent
 *   GET  /api/pages/contact           → ContactContent
 *   POST /api/enquiries               → EnquiryResult
 *
 * Writes, called only from the admin area. `{collection}` is one of `markets`,
 * `services`, `projects`, `articles`, `issues` or `job-openings`:
 *
 *   GET    /api/job-openings          → JobOpening[]
 *   GET    /api/job-openings/{id}     → JobOpening
 *   POST   /api/{collection}          → 200/201, body is the entity
 *   PUT    /api/{collection}/{id}     → 200/204, body is the entity
 *   DELETE /api/{collection}/{id}     → 200/204
 *
 * `save` upserts: PUT when the entity already exists, POST when it is new, which
 * `upsert` below decides by asking the backend for it first. Writes will need an
 * admin bearer token once Spring Boot enforces one — that belongs in
 * `../api/http.ts`, which is the single place outbound headers are set.
 */
export const httpRepository: ContentAdminRepository = {
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

  getIssue(slug) {
    return apiRequestOrNull<Issue>(`/issues/${encodeURIComponent(slug)}`);
  },

  listJobOpenings() {
    return apiRequest<JobOpening[]>("/job-openings");
  },

  getJobOpening(id) {
    return apiRequestOrNull<JobOpening>(`/job-openings/${encodeURIComponent(id)}`);
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

  // --- Writes ------------------------------------------------------------

  saveMarket(market) {
    return upsert("markets", market.slug, market);
  },

  deleteMarket(slug) {
    return remove("markets", slug);
  },

  saveService(service) {
    return upsert("services", service.slug, service);
  },

  deleteService(slug) {
    return remove("services", slug);
  },

  saveProject(project) {
    return upsert("projects", project.slug, project);
  },

  deleteProject(slug) {
    return remove("projects", slug);
  },

  saveArticle(article) {
    return upsert("articles", article.slug, article);
  },

  deleteArticle(slug) {
    return remove("articles", slug);
  },

  saveIssue(issue) {
    return upsert("issues", issue.slug, issue);
  },

  deleteIssue(slug) {
    return remove("issues", slug);
  },

  saveJobOpening(opening) {
    return upsert("job-openings", opening.id, opening);
  },

  deleteJobOpening(id) {
    return remove("job-openings", id);
  },
};

/**
 * POST to create, PUT to replace. Which one is decided by asking the backend
 * whether the id is taken, because the admin's edit form submits the same shape
 * either way and a slug can be changed while editing.
 */
async function upsert(
  collection: string,
  id: string,
  body: unknown,
): Promise<void> {
  const path = `/${collection}/${encodeURIComponent(id)}`;
  const existing = await apiRequestOrNull<unknown>(path, { revalidate: 0 });

  await apiRequest<void>(existing ? path : `/${collection}`, {
    method: existing ? "PUT" : "POST",
    body,
    revalidate: 0,
  });
}

function remove(collection: string, id: string): Promise<void> {
  return apiRequest<void>(`/${collection}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    revalidate: 0,
  });
}
