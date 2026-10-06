import { apiRequest, apiRequestOrNull } from "../api/http";
import { aboutContent } from "../data/about";
import { careersContent } from "../data/careers";
import { contactContent } from "../data/contact";
import { homeContent } from "../data/home";
import { researchContent } from "../data/research";
import { digitalTools } from "../data/services";
import type {
  Article,
  CareersContent,
  JobOpening,
  Market,
  Project,
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
 * **Not everything goes over HTTP.** The backend persists only what the CMS
 * manages — markets, services, projects, news and vacancies — plus the enquiry
 * inbox. The page bundles (home, about, careers, research, contact) and the
 * digital tools list are editorial prose with no screen in `manage-web` and no
 * table in the database, so they are served from `../data` here exactly as the
 * mock repository serves them. Editing them is a code change and a deploy,
 * which is what they were already.
 *
 * That keeps this file the single source either way: a caller still asks the
 * repository and does not know or care which half answered.
 *
 * Endpoints this implementation calls:
 *
 *   GET  /api/markets                 → Market[]
 *   GET  /api/markets/{slug}          → Market
 *   GET  /api/services                → Service[]
 *   GET  /api/services/{slug}         → Service
 *   GET  /api/projects?market=&service=&slugs=&limit=
 *                                     → Project[]
 *   GET  /api/projects/{slug}         → Project
 *   GET  /api/articles?tag=&limit=&exclude=
 *                                     → Article[]
 *   GET  /api/articles/{slug}         → Article
 *   GET  /api/jobs                    → JobOpening[]  (candidate-facing:
 *                                       status Open, deadline not passed)
 *   POST /api/enquiries               → EnquiryResult
 *
 * Served from `../data`, no endpoint: `/pages/*` and `/digital-tools`.
 *
 * Writes, called only from the admin area. `{collection}` is one of `markets`,
 * `services`, `projects`, `articles` or `jobs`:
 *
 * The admin *reads* sit under `/api/admin/` because every other GET is public:
 * the candidate-facing `/api/jobs` shows openings only, and a draft vacancy
 * should not be readable just because `GET /api/**` is `permitAll`. Writes need
 * no prefix — they already require the admin role.
 *
 *   GET    /api/admin/jobs            → JobOpening[]  (every status)
 *   GET    /api/admin/jobs/{id}       → JobOpening
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

  async listDigitalTools() {
    return [...digitalTools];
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

  // Every job, whatever its status — the CMS listing, hence the admin path.
  listJobOpenings() {
    return apiRequest<JobOpening[]>("/admin/jobs");
  },

  getJobOpening(id) {
    return apiRequestOrNull<JobOpening>(`/admin/jobs/${encodeURIComponent(id)}`);
  },

  // --- Page bundles: code-edited, not stored ------------------------------
  //
  // Identical to `mock.repository.ts` on purpose. These have no CMS screen and
  // no table, so there is nothing for the backend to serve; going through the
  // repository anyway is what keeps the switch invisible to the UI.

  async getHomeContent() {
    return homeContent;
  },

  async getAboutContent() {
    return aboutContent;
  },

  /**
   * The one hybrid. Everything but the vacancies is code-edited; the vacancies
   * are the part the CMS manages, so they come from the backend and are spliced
   * in here — the same shape `mock.repository.ts` assembles from its store.
   */
  async getCareersContent(): Promise<CareersContent> {
    return {
      ...careersContent,
      // `/jobs` is the candidate-facing list: the backend applies the opening
      // rule, so nothing needs filtering here.
      openings: await apiRequest<JobOpening[]>("/jobs"),
    };
  },

  async getResearchContent() {
    return researchContent;
  },

  async getContactContent() {
    return contactContent;
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

  saveJobOpening(opening) {
    // Probed against the admin path, not the public one: a draft job is absent
    // from `/jobs`, so probing there would read "does not exist", POST, and
    // collide with the row that is already in the table.
    return upsert("jobs", opening.id, opening, "admin/jobs");
  },

  deleteJobOpening(id) {
    return remove("jobs", id);
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
  /**
   * Where to look the entity up, when that is not where it is written. Only
   * jobs need it: their public read is filtered, so existence has to be checked
   * against the unfiltered admin path.
   */
  readCollection: string = collection,
): Promise<void> {
  const existing = await apiRequestOrNull<unknown>(
    `/${readCollection}/${encodeURIComponent(id)}`,
    { revalidate: 0 },
  );

  await apiRequest<void>(
    existing ? `/${collection}/${encodeURIComponent(id)}` : `/${collection}`,
    { method: existing ? "PUT" : "POST", body, revalidate: 0 },
  );
}

function remove(collection: string, id: string): Promise<void> {
  return apiRequest<void>(`/${collection}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    revalidate: 0,
  });
}
