/**
 * Domain model for every piece of editorial content on the site.
 *
 * These types are the contract between the UI and the content layer
 * (`src/lib/content`). When the Spring Boot API replaces the mock repository,
 * the DTOs it returns must map onto exactly these shapes — nothing in
 * `src/components` or `src/app` needs to change.
 */

/** URL-safe identifier, also used as the route segment. */
export type Slug = string;

/**
 * An image reference. `url` is optional so the UI can render a deterministic
 * gradient placeholder until the backend supplies real asset URLs.
 */
export interface MediaImage {
  /** Absolute or root-relative URL. Omit to use the gradient placeholder. */
  url?: string;
  /** Always required — placeholders still need an accessible description. */
  alt: string;
  /** Stable string used to derive the placeholder gradient. Defaults to `alt`. */
  seed?: string;
}

/**
 * A video reference, and the counterpart to `MediaImage`: `url` is optional, so
 * a band can reserve its space and render the poster before any footage exists.
 */
export interface MediaVideo {
  /** Direct file URL (MP4/WebM), self-hosted or from the backend's CDN. */
  url?: string;
  /** Always required — describes the film to assistive technology. */
  alt: string;
  /** Still frame, shown before playback and in place of missing footage. */
  poster: MediaImage;
}

/** A headline figure, e.g. `{ value: "714", unit: "MW", label: "…" }`. */
export interface Stat {
  value: string;
  unit?: string;
  label: string;
}

export interface Market {
  slug: Slug;
  name: string;
  tagline: string;
  description: string;
  /**
   * The market's film, shown under the hero and on every market listing. Every
   * market has one, and it is the market's only visual: there is no image, so
   * the UI supplies the poster and the description.
   */
  filmUrl: string;
  /** What the practice actually does in this market. */
  capabilities: string[];
  stats: Stat[];
}

export type ServiceCategory =
  | "Advisory"
  | "Design & Engineering"
  | "Digital"
  | "Planning & Sustainability"
  | "Research & Innovation";

export interface Service {
  slug: Slug;
  name: string;
  category: ServiceCategory;
  tagline: string;
  description: string;
  image: MediaImage;
  /** What the service actually covers — the specialisms inside it. */
  capabilities: string[];
  relatedMarketSlugs: Slug[];
}

export interface DigitalTool {
  slug: Slug;
  name: string;
  summary: string;
  image: MediaImage;
}

export interface ProjectLocation {
  city?: string;
  country: string;
}

export interface Project {
  slug: Slug;
  title: string;
  location: ProjectLocation;
  /** Completion or delivery year. */
  year: number;
  client: string;
  marketSlugs: Slug[];
  serviceSlugs: Slug[];
  summary: string;
  description: string;
  image: MediaImage;
  stats: Stat[];
  highlights: string[];
}

export type ArticleCategory =
  | "Press release"
  | "Insight"
  | "Award"
  | "Report"
  | "Event";

export interface Author {
  name: string;
  role: string;
}

export interface Article {
  slug: Slug;
  title: string;
  excerpt: string;
  /** Paragraphs of body copy, in order. */
  body: string[];
  category: ArticleCategory;
  /** ISO-8601 date (`YYYY-MM-DD`). */
  publishedAt: string;
  readingMinutes: number;
  /**
   * The article's image on S3. Its only visual field: the UI derives the alt
   * text from the title and the placeholder seed from the slug, and renders
   * the gradient placeholder while this is absent.
   */
  imageUrl?: string;
  tags: string[];
  /**
   * When the record was first stored, as an ISO-8601 *instant* with an offset
   * (`2026-10-10T14:32:05Z`) — unlike `publishedAt`, which is a calendar date.
   * The CMS renders these in the operator's own zone with
   * `formatLocalDateTime`; `publishedAt` must keep using the UTC-pinned
   * formatters, because an editorial date should read the same everywhere.
   *
   * Optional because only the API source supplies them: the mock repository
   * reads bundled files that were never written through a database and have no
   * audit trail to report. A consumer must handle their absence rather than
   * assume the backend is behind it.
   */
  createdAt?: string;
  /** Last write, as an ISO-8601 instant. See `createdAt`. */
  updatedAt?: string;
}

/**
 * An article as a list returns it — everything but `body`. Lists render cards,
 * which show the excerpt, so the paragraphs are only fetched for one article at
 * a time, by `getArticle`. Typed apart rather than leaving `body` optional on
 * `Article`, so the page that renders the body can rely on it being there.
 */
export type ArticleSummary = Omit<Article, "body">;

export interface Person {
  id: string;
  name: string;
  role: string;
  location: string;
  quote: string;
  image: MediaImage;
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
}

export interface Initiative {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
}

export interface ValueItem {
  title: string;
  description: string;
}

export interface HomeContent {
  /** The film that opens the home page, directly under the hero statement. */
  film: MediaVideo;
}

export interface AboutContent {
  intro: string;
  stats: Stat[];
  milestones: Milestone[];
  leadership: Person[];
  initiatives: Initiative[];
  values: ValueItem[];
  founderQuote: {
    quote: string;
    attribution: string;
  };
}

export type EmploymentType = "Full time" | "Part time" | "Contract";
export type CareerLevel = "Graduate" | "Experienced" | "Senior" | "Leadership";

/**
 * Where a job is in its lifecycle. Only `"Open"` is ever advertised — and even
 * then only until its `deadline` passes.
 */
export type JobStatus = "Draft" | "Open" | "Closed";

/**
 * A job.
 *
 * Named for the opening rather than the record because that is what the site
 * renders, but the collection holds every job: `status` and `deadline` decide
 * which of them is an opening today. `CareersContent.openings` is already
 * filtered to those; `ContentAdminRepository.listJobOpenings` is not, because
 * an editor has to see a draft in order to publish it.
 */
export interface JobOpening {
  /**
   * Assigned by the backend, not typed by an editor.
   *
   * It used to be a string reference (`"job-1001"`) that the CMS minted from a
   * timestamp. Two jobs created in the same millisecond got the same one, and
   * because saving is an upsert keyed on the id, the second silently replaced
   * the first. A server-assigned key cannot collide.
   */
  id: number;
  title: string;
  discipline: string;
  location: string;
  employmentType: EmploymentType;
  level: CareerLevel;
  status: JobStatus;
  /** ISO-8601 date (`YYYY-MM-DD`). */
  postedAt: string;
  /**
   * Last day applications are accepted, inclusive. ISO-8601 (`YYYY-MM-DD`).
   *
   * Omit for "open until filled" — that is a real case, not missing data, so an
   * absent deadline never closes a role. A job past its deadline stops being an
   * opening without anything having to edit it.
   */
  deadline?: string;
}

/**
 * What a caller submits when saving a job.
 *
 * The id is optional because a create does not have one yet — the backend
 * assigns it. Readers keep `JobOpening`, where `id` is required, so nothing
 * rendering a vacancy has to handle an absent id.
 */
export type JobOpeningDraft = Omit<JobOpening, "id"> & { id?: number };

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface Benefit {
  title: string;
  description: string;
}

export interface CareersContent {
  intro: string;
  stats: Stat[];
  openings: JobOpening[];
  benefits: Benefit[];
  applicationProcess: ProcessStep[];
  profiles: Person[];
}

export type ResearchTheme =
  | "Climate and carbon"
  | "Materials"
  | "Resilience"
  | "Mobility"
  | "Digital and data";

/** Where a programme has got to — rendered as the card's eyebrow. */
export type ResearchStatus = "Active" | "Field trial" | "Published";

export interface ResearchProgramme {
  slug: Slug;
  title: string;
  theme: ResearchTheme;
  status: ResearchStatus;
  summary: string;
  /** Year the programme was funded. */
  startedYear: number;
  /** `Author` is a name and a role, which is all a research lead needs here. */
  lead: Author;
  /** Universities, institutes and clients working on it with us. */
  partners: string[];
  /** What the programme has produced so far. */
  outputs: string[];
  image: MediaImage;
}

export type TrainingFormat = "In person" | "Online" | "Hybrid";
export type TrainingLevel = "Introductory" | "Intermediate" | "Advanced";

export interface TrainingCourse {
  slug: Slug;
  title: string;
  discipline: string;
  format: TrainingFormat;
  level: TrainingLevel;
  /** Human-readable length, e.g. `"2 days"` or `"6 weeks, part time"`. */
  duration: string;
  summary: string;
  /** What a participant can do by the end of it. */
  outcomes: string[];
  /** ISO-8601 date (`YYYY-MM-DD`) the next cohort starts. */
  nextStartsAt: string;
  image: MediaImage;
}

export interface Publication {
  title: string;
  /** Journal, conference or series it appeared in. */
  venue: string;
  year: number;
  /** Where to read it. External URLs are fine. */
  href: string;
}

export interface ResearchContent {
  intro: string;
  stats: Stat[];
  programmes: ResearchProgramme[];
  courses: TrainingCourse[];
  /** How a question becomes funded research here. */
  researchProcess: ProcessStep[];
  publications: Publication[];
  /** Institutions we publish and teach with. */
  partners: string[];
  directorQuote: {
    quote: string;
    attribution: string;
    detail?: string;
  };
}

export type OfficeRegion =
  | "Americas"
  | "Europe"
  | "Middle East and Africa"
  | "East Asia"
  | "Australasia";

export interface Office {
  id: string;
  city: string;
  country: string;
  region: OfficeRegion;
  addressLines: string[];
  phone: string;
  email: string;
  /** Marked as the region's primary contact point. */
  isHeadquarters?: boolean;
}

export interface EnquiryTopic {
  value: string;
  label: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContactContent {
  intro: string;
  offices: Office[];
  enquiryTopics: EnquiryTopic[];
  faqs: FaqItem[];
}

/**
 * Normalised shape every card in the UI renders from. Entities are mapped to
 * this by `core-web/src/lib/content/mappers.ts`, so one `<ContentCard>` and one
 * `<FilterableGrid>` serve markets, services, projects and news alike.
 */
export interface CardItem {
  id: string;
  href: string;
  title: string;
  /** Small label above the title (category, market, date…). */
  eyebrow?: string;
  summary?: string;
  image: MediaImage;
  /**
   * A film to play in the card's frame instead of the still. `image` stays
   * required and remains the poster, so a card renders either way.
   */
  video?: MediaVideo;
  /** Short facts rendered as a dot-separated row under the summary. */
  meta?: string[];
  /** Values matched against the active filter selection. */
  tags?: string[];
}

/** One group of filter options in `<FilterableGrid>`. */
export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface FilterOption {
  /** Must match a value in `CardItem.tags`. */
  value: string;
  label: string;
}
