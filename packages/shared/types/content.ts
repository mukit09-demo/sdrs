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
 * A video reference, and the counterpart to `MediaImage`: both asset fields are
 * optional, so a band can reserve its space and render the poster before any
 * footage exists.
 */
export interface MediaVideo {
  /** Direct file URL (MP4/WebM), self-hosted or from the backend's CDN. */
  url?: string;
  /** Player URL for a platform embed (YouTube/Vimeo). Used when `url` is absent. */
  embedUrl?: string;
  /** Always required — describes the film to assistive technology. */
  alt: string;
  /** Still frame, shown before playback and in place of missing footage. */
  poster: MediaImage;
  /** WebVTT captions track. Expected for anything with speech. */
  captionsUrl?: string;
}

/**
 * A film and the line that says what it shows. Used by the home page and by any
 * market with footage of its own.
 */
export interface Film {
  video: MediaVideo;
  /** One line placed under the film, saying what it shows. */
  caption?: string;
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
  image: MediaImage;
  /** The market's own film, shown under the hero. Omit and the band is skipped. */
  film?: Film;
  /** What the practice actually does in this market. */
  capabilities: string[];
  stats: Stat[];
  featuredProjectSlugs: Slug[];
}

export type ServiceCategory =
  | "Design and engineering"
  | "Advisory"
  | "Digital"
  | "Planning";

export interface Service {
  slug: Slug;
  name: string;
  category: ServiceCategory;
  tagline: string;
  description: string;
  image: MediaImage;
  /** Concrete outputs a client receives. */
  deliverables: string[];
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
  author: Author;
  image: MediaImage;
  tags: string[];
}

/** A "big question" teaser — SDRS calls these Issues. */
export interface Issue {
  slug: Slug;
  question: string;
  summary: string;
  image: MediaImage;
}

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
  film: Film;
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

export interface JobOpening {
  id: string;
  title: string;
  discipline: string;
  location: string;
  employmentType: EmploymentType;
  level: CareerLevel;
  /** ISO-8601 date (`YYYY-MM-DD`). */
  postedAt: string;
}

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
  /** Reuses `Author` — a name and a role is all a research lead needs here. */
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
