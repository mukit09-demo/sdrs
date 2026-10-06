import { adminContent as content } from "@sdrs/shared/content";
import type {
  Article,
  ArticleCategory,
  CareerLevel,
  EmploymentType,
  Film,
  JobOpening,
  JobStatus,
  Market,
  Project,
  Service,
  ServiceCategory,
} from "@sdrs/shared/types/content";
import {
  type FieldSpec,
  type FieldValues,
  STAT_COLUMNS,
  group,
  image,
  imageToValues,
  list,
  num,
  type ScalarSpec,
  stats,
  statsToValues,
  str,
} from "./fields";
import { usersCollection } from "./users.collection";
import type { UserRole } from "@/types/user";

/**
 * The registry the whole admin is built from.
 *
 * Each entry says what an entity's form looks like, how to list it, how to load
 * it into that form and how to save it. The admin's list and form pages are
 * generic over this, so a seventh collection is one descriptor here — the same
 * bargain `mappers.ts` strikes for cards.
 *
 * Domain types stay inside these descriptors on purpose: the pages deal only in
 * `AdminRow` and `FieldValues`, so nothing in `src/app` has to know what
 * a `Market` is.
 */

/**
 * A refusal the operator should read, as opposed to a bug.
 *
 * `admin.action.ts` surfaces the message verbatim; anything else that throws is
 * logged and reported as a generic failure. That split matters for accounts,
 * where "this is the only admin account" is the whole point of the error and a
 * generic "could not save" would be useless.
 */
export class SaveRejected extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SaveRejected";
  }
}

/** One line in a collection's list table. */
export interface AdminRow {
  id: string;
  title: string;
  /** Secondary facts, rendered as a dot-separated row. */
  meta: string[];
}

export interface AdminCollection {
  /** URL segment and store key. */
  name: string;
  label: string;
  singular: string;
  /** One line explaining what the collection is, shown above its table. */
  description: string;
  /**
   * Restricted to `admin` accounts. Hides the collection from an editor's nav
   * and dashboard — but the methods below still call `requireAdmin()` themselves,
   * because hiding a link is not access control.
   */
  adminOnly?: boolean;
  fields: FieldSpec[];

  list(): Promise<AdminRow[]>;
  /** Form defaults for an existing entity, or `null` when there is no such id. */
  values(id: string): Promise<FieldValues | null>;
  /**
   * Upserts, returning the saved id. `previousId` is passed when editing, so
   * changing a slug moves the entity rather than leaving the old one behind.
   */
  save(values: FieldValues, previousId?: string): Promise<string>;
  remove(id: string): Promise<void>;
}

// --- Shared field fragments ------------------------------------------------

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** The slug is the URL segment, so it is also the entity's id. */
function slugField(hint: string): ScalarSpec {
  return {
    name: "slug",
    label: "Slug",
    kind: "text",
    required: true,
    maxLength: 80,
    hint,
    refine: (value) =>
      SLUG_PATTERN.test(value)
        ? undefined
        : "Use lowercase letters, numbers and single hyphens, e.g. offshore-wind.",
  };
}

function dateField(
  name: string,
  label: string,
  { required = true, hint }: { required?: boolean; hint?: string } = {},
): ScalarSpec {
  return {
    name,
    label,
    kind: "text",
    required,
    hint: hint ?? "YYYY-MM-DD",
    // An optional date has to accept blank, or clearing it is impossible.
    refine: (value) =>
      (!required && value.trim() === "") ||
      (DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(value)))
        ? undefined
        : "Enter a date as YYYY-MM-DD.",
  };
}

function selectField(
  name: string,
  label: string,
  options: readonly string[],
): ScalarSpec {
  return { name, label, kind: "select", required: true, options };
}

function imageField(label = "Image"): FieldSpec {
  return { kind: "image", name: "image", label };
}

function statsField(): FieldSpec {
  return {
    kind: "rows",
    name: "stats",
    label: "Statistics",
    hint: "Headline figures. Value and label are required; unit is optional.",
    columns: STAT_COLUMNS,
  };
}

function linesField(
  name: string,
  label: string,
  hint: string,
  required = false,
): FieldSpec {
  return { kind: "lines", name, label, hint, required };
}

// These mirror the unions in `@sdrs/shared/types/content`. TypeScript checks they stay
// in step: each list is declared as the union's members, so adding a case to the
// type without adding it here fails to compile.
const SERVICE_CATEGORIES: readonly ServiceCategory[] = [
  "Advisory",
  "Design & Engineering",
  "Digital",
  "Planning & Sustainability",
  "Research & Innovation",
];

const ARTICLE_CATEGORIES: readonly ArticleCategory[] = [
  "Press release",
  "Insight",
  "Award",
  "Report",
  "Event",
];

const EMPLOYMENT_TYPES: readonly EmploymentType[] = [
  "Full time",
  "Part time",
  "Contract",
];

const CAREER_LEVELS: readonly CareerLevel[] = [
  "Graduate",
  "Experienced",
  "Senior",
  "Leadership",
];

/**
 * Order matters twice over: it is what a new vacancy's select defaults to, and
 * `asOption` falls back to the first entry for an unrecognised value. "Draft"
 * leads so that neither a fresh form nor a bad submission can publish a role by
 * accident — going live has to be a deliberate choice.
 */
const JOB_STATUSES: readonly JobStatus[] = ["Draft", "Open", "Closed"];

/** Narrows a submitted select value back to its union, falling back to the first option. */
function asOption<T extends string>(value: string, options: readonly T[]): T {
  return options.includes(value as T) ? (value as T) : options[0];
}

// --- Markets ---------------------------------------------------------------

const FILM_MEMBERS: ScalarSpec[] = [
  { name: "caption", label: "Caption", kind: "textarea", maxLength: 300 },
  {
    name: "url",
    label: "Film URL",
    kind: "text",
    maxLength: 500,
    hint: "A self-hosted MP4 or WebM, e.g. /video/markets/energy.webm.",
  },
  {
    name: "embedUrl",
    label: "Embed URL",
    kind: "text",
    maxLength: 500,
    hint: "A YouTube or Vimeo player URL. Used only when the film URL is blank.",
  },
  { name: "alt", label: "Film description", kind: "text", maxLength: 200 },
];

/**
 * Builds `Market.film` from the flattened group, or returns `undefined` so the
 * band is skipped. The poster is the market's own image, which is what keeps
 * hero, poster and film one continuous picture.
 */
function toFilm(values: FieldValues, name: string): Film | undefined {
  const film = group(values, "film");
  if (!film.url && !film.embedUrl) return undefined;

  return {
    ...(film.caption ? { caption: film.caption } : {}),
    video: {
      ...(film.url ? { url: film.url } : {}),
      ...(!film.url && film.embedUrl ? { embedUrl: film.embedUrl } : {}),
      alt: film.alt || `Film showing ${name}`,
      poster: image(values, "image"),
    },
  };
}

const markets: AdminCollection = {
  name: "markets",
  label: "Markets",
  singular: "market",
  description: "The sectors the practice works across, at /markets.",
  fields: [
    slugField("Becomes the URL: /markets/<slug>."),
    { name: "name", label: "Name", kind: "text", required: true, maxLength: 80 },
    {
      name: "tagline",
      label: "Tagline",
      kind: "text",
      required: true,
      maxLength: 200,
      hint: "One line, used on cards and under the hero.",
    },
    {
      name: "description",
      label: "Description",
      kind: "textarea",
      required: true,
      minLength: 40,
    },
    imageField(),
    {
      kind: "group",
      name: "film",
      label: "Film",
      hint: "Optional. Leave both URLs blank and the market page skips the film band.",
      fields: FILM_MEMBERS,
    },
    linesField(
      "capabilities",
      "Capabilities",
      "What the practice actually does in this market — one per line.",
      true,
    ),
    statsField(),
    linesField(
      "featuredProjectSlugs",
      "Featured project slugs",
      "One project slug per line, in the order they should appear.",
    ),
  ],

  async list() {
    const entities = await content.listMarkets();
    return entities.map((market) => ({
      id: market.slug,
      title: market.name,
      meta: [
        market.tagline,
        `${market.capabilities.length} capabilities`,
        market.film ? "Has film" : "No film",
      ],
    }));
  },

  async values(id) {
    const market = await content.getMarket(id);
    if (!market) return null;

    return {
      slug: market.slug,
      name: market.name,
      tagline: market.tagline,
      description: market.description,
      image: imageToValues(market.image),
      film: {
        caption: market.film?.caption ?? "",
        url: market.film?.video.url ?? "",
        embedUrl: market.film?.video.embedUrl ?? "",
        alt: market.film?.video.alt ?? "",
      },
      capabilities: market.capabilities,
      stats: statsToValues(market.stats),
      featuredProjectSlugs: market.featuredProjectSlugs,
    };
  },

  async save(values, previousId) {
    const name = str(values, "name");
    const film = toFilm(values, name);
    const market: Market = {
      slug: str(values, "slug"),
      name,
      tagline: str(values, "tagline"),
      description: str(values, "description"),
      image: image(values, "image"),
      ...(film ? { film } : {}),
      capabilities: list(values, "capabilities"),
      stats: stats(values, "stats"),
      featuredProjectSlugs: list(values, "featuredProjectSlugs"),
    };

    await content.saveMarket(market);
    await removeRenamed(previousId, market.slug, content.deleteMarket);
    return market.slug;
  },

  remove(id) {
    return content.deleteMarket(id);
  },
};

// --- Services --------------------------------------------------------------

const services: AdminCollection = {
  name: "services",
  label: "Services",
  singular: "service",
  description: "What the practice offers clients, at /services.",
  fields: [
    slugField("Becomes the URL: /services/<slug>."),
    { name: "name", label: "Name", kind: "text", required: true, maxLength: 80 },
    selectField("category", "Category", SERVICE_CATEGORIES),
    {
      name: "tagline",
      label: "Tagline",
      kind: "text",
      required: true,
      maxLength: 200,
    },
    {
      name: "description",
      label: "Description",
      kind: "textarea",
      required: true,
      minLength: 40,
    },
    imageField(),
    linesField(
      "capabilities",
      "Capabilities",
      "The specialisms this service covers — one per line.",
      true,
    ),
    linesField(
      "relatedMarketSlugs",
      "Related market slugs",
      "One market slug per line. Decides which market pages list this service.",
    ),
  ],

  async list() {
    const entities = await content.listServices();
    return entities.map((service) => ({
      id: service.slug,
      title: service.name,
      meta: [service.category, `${service.capabilities.length} capabilities`],
    }));
  },

  async values(id) {
    const service = await content.getService(id);
    if (!service) return null;

    return {
      slug: service.slug,
      name: service.name,
      category: service.category,
      tagline: service.tagline,
      description: service.description,
      image: imageToValues(service.image),
      capabilities: service.capabilities,
      relatedMarketSlugs: service.relatedMarketSlugs,
    };
  },

  async save(values, previousId) {
    const service: Service = {
      slug: str(values, "slug"),
      name: str(values, "name"),
      category: asOption(str(values, "category"), SERVICE_CATEGORIES),
      tagline: str(values, "tagline"),
      description: str(values, "description"),
      image: image(values, "image"),
      capabilities: list(values, "capabilities"),
      relatedMarketSlugs: list(values, "relatedMarketSlugs"),
    };

    await content.saveService(service);
    await removeRenamed(previousId, service.slug, content.deleteService);
    return service.slug;
  },

  remove(id) {
    return content.deleteService(id);
  },
};

// --- Projects --------------------------------------------------------------

const projects: AdminCollection = {
  name: "projects",
  label: "Projects",
  singular: "project",
  description: "Work delivered with clients, at /projects.",
  fields: [
    slugField("Becomes the URL: /projects/<slug>."),
    { name: "title", label: "Title", kind: "text", required: true, maxLength: 160 },
    {
      kind: "group",
      name: "location",
      label: "Location",
      fields: [
        { name: "city", label: "City", kind: "text", maxLength: 80 },
        {
          name: "country",
          label: "Country",
          kind: "text",
          required: true,
          maxLength: 80,
        },
      ],
    },
    {
      name: "year",
      label: "Year",
      kind: "number",
      required: true,
      hint: "Completion or delivery year. Also sorts the index.",
    },
    { name: "client", label: "Client", kind: "text", required: true, maxLength: 160 },
    linesField(
      "marketSlugs",
      "Market slugs",
      "One per line. Drives the market filter on /projects.",
      true,
    ),
    linesField("serviceSlugs", "Service slugs", "One per line."),
    {
      name: "summary",
      label: "Summary",
      kind: "textarea",
      required: true,
      maxLength: 400,
      hint: "Shown on cards.",
    },
    {
      name: "description",
      label: "Description",
      kind: "textarea",
      required: true,
      minLength: 40,
    },
    imageField(),
    statsField(),
    linesField("highlights", "Highlights", "One per line."),
  ],

  async list() {
    const entities = await content.listProjects();
    return entities.map((project) => ({
      id: project.slug,
      title: project.title,
      meta: [
        [project.location.city, project.location.country].filter(Boolean).join(", "),
        String(project.year),
        project.client,
      ],
    }));
  },

  async values(id) {
    const project = await content.getProject(id);
    if (!project) return null;

    return {
      slug: project.slug,
      title: project.title,
      location: {
        city: project.location.city ?? "",
        country: project.location.country,
      },
      year: project.year,
      client: project.client,
      marketSlugs: project.marketSlugs,
      serviceSlugs: project.serviceSlugs,
      summary: project.summary,
      description: project.description,
      image: imageToValues(project.image),
      stats: statsToValues(project.stats),
      highlights: project.highlights,
    };
  },

  async save(values, previousId) {
    const location = group(values, "location");
    const project: Project = {
      slug: str(values, "slug"),
      title: str(values, "title"),
      location: {
        ...(location.city ? { city: location.city } : {}),
        country: location.country ?? "",
      },
      year: num(values, "year"),
      client: str(values, "client"),
      marketSlugs: list(values, "marketSlugs"),
      serviceSlugs: list(values, "serviceSlugs"),
      summary: str(values, "summary"),
      description: str(values, "description"),
      image: image(values, "image"),
      stats: stats(values, "stats"),
      highlights: list(values, "highlights"),
    };

    await content.saveProject(project);
    await removeRenamed(previousId, project.slug, content.deleteProject);
    return project.slug;
  },

  remove(id) {
    return content.deleteProject(id);
  },
};

// --- Articles --------------------------------------------------------------

const articles: AdminCollection = {
  name: "articles",
  label: "News",
  singular: "article",
  description: "Articles at /news, newest first.",
  fields: [
    slugField("Becomes the URL: /news/<slug>."),
    { name: "title", label: "Title", kind: "text", required: true, maxLength: 200 },
    selectField("category", "Category", ARTICLE_CATEGORIES),
    dateField("publishedAt", "Published"),
    {
      name: "readingMinutes",
      label: "Reading time (minutes)",
      kind: "number",
      required: true,
    },
    {
      name: "excerpt",
      label: "Excerpt",
      kind: "textarea",
      required: true,
      maxLength: 400,
      hint: "Shown on cards and in the lead story.",
    },
    linesField(
      "body",
      "Body",
      "One paragraph per line. Blank lines are ignored.",
      true,
    ),
    {
      kind: "group",
      name: "author",
      label: "Author",
      fields: [
        { name: "name", label: "Name", kind: "text", required: true, maxLength: 120 },
        { name: "role", label: "Role", kind: "text", required: true, maxLength: 160 },
      ],
    },
    imageField(),
    linesField("tags", "Tags", "One per line. Drives related reading and filters."),
  ],

  async list() {
    const entities = await content.listArticles();
    return entities.map((article) => ({
      id: article.slug,
      title: article.title,
      meta: [article.category, article.publishedAt, article.author.name],
    }));
  },

  async values(id) {
    const article = await content.getArticle(id);
    if (!article) return null;

    return {
      slug: article.slug,
      title: article.title,
      category: article.category,
      publishedAt: article.publishedAt,
      readingMinutes: article.readingMinutes,
      excerpt: article.excerpt,
      body: article.body,
      author: { name: article.author.name, role: article.author.role },
      image: imageToValues(article.image),
      tags: article.tags,
    };
  },

  async save(values, previousId) {
    const author = group(values, "author");
    const article: Article = {
      slug: str(values, "slug"),
      title: str(values, "title"),
      excerpt: str(values, "excerpt"),
      body: list(values, "body"),
      category: asOption(str(values, "category"), ARTICLE_CATEGORIES),
      publishedAt: str(values, "publishedAt"),
      readingMinutes: num(values, "readingMinutes"),
      author: { name: author.name ?? "", role: author.role ?? "" },
      image: image(values, "image"),
      tags: list(values, "tags"),
    };

    await content.saveArticle(article);
    await removeRenamed(previousId, article.slug, content.deleteArticle);
    return article.slug;
  },

  remove(id) {
    return content.deleteArticle(id);
  },
};

// --- Vacancies -------------------------------------------------------------

const openings: AdminCollection = {
  name: "job-openings",
  label: "Vacancies",
  singular: "vacancy",
  description:
    'Roles on /careers. Only "Open" ones whose deadline has not passed are ' +
    "shown there — this list shows every job, including drafts.",
  fields: [
    {
      name: "id",
      label: "Reference",
      kind: "text",
      maxLength: 40,
      hint: "Leave blank to generate one.",
    },
    { name: "title", label: "Title", kind: "text", required: true, maxLength: 200 },
    {
      name: "discipline",
      label: "Discipline",
      kind: "text",
      required: true,
      maxLength: 120,
      hint: "Drives the discipline filter, so reuse an existing spelling where one fits.",
    },
    {
      name: "location",
      label: "Location",
      kind: "text",
      required: true,
      maxLength: 120,
      hint: 'City and country, e.g. "Manchester, United Kingdom".',
    },
    selectField("employmentType", "Employment type", EMPLOYMENT_TYPES),
    selectField("level", "Level", CAREER_LEVELS),
    selectField("status", "Status", JOB_STATUSES),
    dateField("postedAt", "Posted"),
    dateField("deadline", "Deadline", {
      required: false,
      hint: 'YYYY-MM-DD. Leave blank for "open until filled" — a role with no '
        + "deadline stays advertised until you close it.",
    }),
  ],

  async list() {
    const entities = await content.listJobOpenings();
    return entities.map((opening) => ({
      id: opening.id,
      title: opening.title,
      // Status first: it is the one field that decides whether /careers shows
      // the role at all, so it is what an editor scans this list for.
      meta: [
        opening.status,
        opening.discipline,
        opening.location,
        opening.level,
        opening.deadline ? `closes ${opening.deadline}` : "open until filled",
      ],
    }));
  },

  async values(id) {
    const opening = await content.getJobOpening(id);
    if (!opening) return null;

    return {
      id: opening.id,
      title: opening.title,
      discipline: opening.discipline,
      location: opening.location,
      employmentType: opening.employmentType,
      level: opening.level,
      status: opening.status,
      postedAt: opening.postedAt,
      deadline: opening.deadline ?? "",
    };
  },

  async save(values, previousId) {
    const opening: JobOpening = {
      // Vacancies are the one collection without a slug, so a new one needs a
      // reference generating rather than typing.
      id: str(values, "id") || `job-${Date.now().toString(36)}`,
      title: str(values, "title"),
      discipline: str(values, "discipline"),
      location: str(values, "location"),
      employmentType: asOption(str(values, "employmentType"), EMPLOYMENT_TYPES),
      level: asOption(str(values, "level"), CAREER_LEVELS),
      status: asOption(str(values, "status"), JOB_STATUSES),
      postedAt: str(values, "postedAt"),
      // Blank means no deadline, which is a value rather than an omission —
      // `deadline?: string` so undefined, not "".
      deadline: str(values, "deadline") || undefined,
    };

    await content.saveJobOpening(opening);
    await removeRenamed(previousId, opening.id, content.deleteJobOpening);
    return opening.id;
  },

  remove(id) {
    return content.deleteJobOpening(id);
  },
};

/**
 * Deletes the old entry when an edit changed the id, so renaming a slug moves
 * the entity instead of cloning it.
 */
async function removeRenamed(
  previousId: string | undefined,
  nextId: string,
  remove: (id: string) => Promise<void>,
): Promise<void> {
  if (previousId && previousId !== nextId) await remove(previousId);
}

/**
 * Registry order is the order the dashboard and the nav show.
 *
 * Accounts come last and live in their own module, because they are not content:
 * they are stored separately, guarded separately, and never visible to core-web.
 */
export const adminCollections: readonly AdminCollection[] = [
  markets,
  services,
  projects,
  articles,
  openings,
  usersCollection,
] as const;

/** The collections a given role may see. */
export function collectionsForRole(role: UserRole): readonly AdminCollection[] {
  if (role === "admin") return adminCollections;
  return adminCollections.filter((collection) => !collection.adminOnly);
}

export function findCollection(name: string): AdminCollection | undefined {
  return adminCollections.find((collection) => collection.name === name);
}
