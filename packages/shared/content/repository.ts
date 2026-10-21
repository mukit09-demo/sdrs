import type {
  AboutContent,
  Article,
  ArticleSummary,
  CareersContent,
  ContactContent,
  DigitalTool,
  HomeContent,
  JobOpening,
  JobOpeningDraft,
  Market,
  Project,
  ResearchContent,
  Service,
  Slug,
} from "../types/content";

export interface ProjectQuery {
  /** Only projects tagged with this market. */
  marketSlug?: Slug;
  /** Only projects tagged with this service. */
  serviceSlug?: Slug;
  /** Explicit slugs, returned in the order given. */
  slugs?: Slug[];
  limit?: number;
}

export interface ArticleQuery {
  tag?: string;
  limit?: number;
  /** Omit this slug — used to build "related articles" lists. */
  excludeSlug?: Slug;
}

export interface EnquiryInput {
  name: string;
  email: string;
  organisation?: string;
  topic: string;
  message: string;
}

export interface EnquiryResult {
  reference: string;
  /**
   * ISO-8601 *instant* with an offset (`2026-10-09T16:04:21Z`) — not the
   * `YYYY-MM-DD` the content dates use. Render it with `formatLocalDateTime`,
   * which converts to the reader's own zone; the bare-date formatters in
   * `utils/format.ts` pin UTC and would silently drop the time.
   */
  receivedAt: string;
}

/**
 * One enquiry as the CMS inbox reads it — `EnquiryInput` plus what the server
 * assigned. The inbox is read-only, so there is no draft counterpart.
 *
 * Deliberately not in `types/content.ts`: that file is the *content* model, and
 * an enquiry is not content. It is never rendered by the public site, has no
 * slug, and `core-web` has no method that returns one.
 */
export interface Enquiry extends EnquiryInput {
  reference: string;
  /** ISO-8601 instant, as on `EnquiryResult`. */
  receivedAt: string;
}

/**
 * Everything the public site reads.
 *
 * `core-web` imports `content` typed as this, so it has no `save` or `delete`
 * method to call even by accident — the write surface is a separate interface
 * below, and only `manage-web` names it.
 *
 * Two implementations exist — `mock.repository.ts` (bundled dummy data) and
 * `http.repository.ts` (Spring Boot). Pages and components depend only on these
 * interfaces, which is what makes the backend swap a configuration change rather
 * than a refactor.
 */
export interface ContentRepository {
  listMarkets(): Promise<Market[]>;
  getMarket(slug: Slug): Promise<Market | null>;

  listServices(): Promise<Service[]>;
  getService(slug: Slug): Promise<Service | null>;
  listDigitalTools(): Promise<DigitalTool[]>;

  listProjects(query?: ProjectQuery): Promise<Project[]>;
  getProject(slug: Slug): Promise<Project | null>;

  /** Summaries — no `body`. Fetch one article with `getArticle` for that. */
  listArticles(query?: ArticleQuery): Promise<ArticleSummary[]>;
  getArticle(slug: Slug): Promise<Article | null>;

  getHomeContent(): Promise<HomeContent>;
  getAboutContent(): Promise<AboutContent>;
  getCareersContent(): Promise<CareersContent>;
  getResearchContent(): Promise<ResearchContent>;
  getContactContent(): Promise<ContactContent>;

  submitEnquiry(input: EnquiryInput): Promise<EnquiryResult>;
}

/**
 * Reads plus writes. Imported only by `manage-web`.
 *
 * One `save` per entity rather than a generic `save(collection, entity)`: the
 * CMS's collection registry (`manage-web/src/lib/admin/collections.ts`) is the
 * one caller and it keeps each entity's type, so there is nothing to gain from
 * erasing it here. `save` upserts — it creates when the id is new and replaces
 * when it is not, which is what an edit form submits either way.
 */
export interface ContentAdminRepository extends ContentRepository {
  saveMarket(market: Market): Promise<void>;
  deleteMarket(slug: Slug): Promise<void>;

  saveService(service: Service): Promise<void>;
  deleteService(slug: Slug): Promise<void>;

  saveProject(project: Project): Promise<void>;
  deleteProject(slug: Slug): Promise<void>;

  saveArticle(article: Article): Promise<void>;
  deleteArticle(slug: Slug): Promise<void>;

  /**
   * Vacancies. These are also reachable as `CareersContent.openings`, which is
   * how `/careers` reads them; these methods exist so the admin can edit one
   * without loading and rewriting the whole careers page bundle.
   */
  listJobOpenings(): Promise<JobOpening[]>;
  getJobOpening(id: number): Promise<JobOpening | null>;
  /**
   * The one `save` that returns something. Jobs are the only entity whose id
   * the backend assigns, so they are the only one where the caller cannot know
   * the id up front — the saved entity carries it back.
   */
  saveJobOpening(opening: JobOpeningDraft): Promise<JobOpening>;
  deleteJobOpening(id: number): Promise<void>;

  /**
   * The enquiry inbox, newest first.
   *
   * Read-only, and the one admin method with no `save` or `delete` beside it:
   * an enquiry is submitted by a visitor and then only ever read. It sits on
   * this interface rather than `ContentRepository` because the payload is
   * personal data — names, addresses and message bodies — and `core-web`
   * should have no method that returns it even by accident.
   */
  listEnquiries(): Promise<Enquiry[]>;
}
