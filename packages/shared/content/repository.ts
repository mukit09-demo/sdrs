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

  listArticles(query?: ArticleQuery): Promise<Article[]>;
  getArticle(slug: Slug): Promise<Article | null>;

  listIssues(limit?: number): Promise<Issue[]>;

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

  getIssue(slug: Slug): Promise<Issue | null>;
  saveIssue(issue: Issue): Promise<void>;
  deleteIssue(slug: Slug): Promise<void>;

  /**
   * Vacancies. These are also reachable as `CareersContent.openings`, which is
   * how `/careers` reads them; these methods exist so the admin can edit one
   * without loading and rewriting the whole careers page bundle.
   */
  listJobOpenings(): Promise<JobOpening[]>;
  getJobOpening(id: string): Promise<JobOpening | null>;
  saveJobOpening(opening: JobOpening): Promise<void>;
  deleteJobOpening(id: string): Promise<void>;
}
