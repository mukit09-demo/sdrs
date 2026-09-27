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
  Slug,
} from "@/types/content";

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
 * The full content contract for the site.
 *
 * Two implementations exist — `mock.repository.ts` (bundled dummy data) and
 * `http.repository.ts` (Spring Boot). Pages and components depend only on this
 * interface, which is what makes the backend swap a configuration change rather
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
