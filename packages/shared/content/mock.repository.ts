import { aboutContent } from "../data/about";
import { careersContent } from "../data/careers";
import { contactContent } from "../data/contact";
import { homeContent } from "../data/home";
import { researchContent } from "../data/research";
import { digitalTools } from "../data/services";
import { sortByDateDesc } from "../utils/format";
import { isOpening } from "./jobs";
import type {
  Article,
  ArticleSummary,
  CareersContent,
  JobOpening,
} from "../types/content";
import type {
  ArticleQuery,
  ContentAdminRepository,
  Enquiry,
  EnquiryInput,
  EnquiryResult,
  ProjectQuery,
} from "./repository";
import { type ContentStore, readStore, writeStore } from "./store";

/**
 * Serves content the admin can edit from the JSON store (`./store.ts`), and the
 * rest — the home film, About, Research and Contact bundles, digital tools —
 * straight from `../data`.
 *
 * Reads return copies rather than the stored arrays, so a caller sorting or
 * splicing a result cannot corrupt the "database" for every subsequent request
 * in the same server process.
 */
export const mockRepository: ContentAdminRepository = {
  async listMarkets() {
    return [...(await readStore()).markets];
  },

  async getMarket(slug) {
    return (await readStore()).markets.find((market) => market.slug === slug) ?? null;
  },

  async listServices() {
    return [...(await readStore()).services];
  },

  async getService(slug) {
    return (await readStore()).services.find((service) => service.slug === slug) ?? null;
  },

  async listDigitalTools() {
    return [...digitalTools];
  },

  async listProjects(query: ProjectQuery = {}) {
    const { marketSlug, serviceSlug, slugs, limit } = query;
    const { projects } = await readStore();

    // Explicit slugs win, and preserve the caller's ordering.
    if (slugs) {
      const bySlug = new Map(projects.map((project) => [project.slug, project]));
      const ordered = slugs
        .map((slug) => bySlug.get(slug))
        .filter((project): project is NonNullable<typeof project> => Boolean(project));
      return limit ? ordered.slice(0, limit) : ordered;
    }

    let result = [...projects];
    if (marketSlug) {
      result = result.filter((project) => project.marketSlugs.includes(marketSlug));
    }
    if (serviceSlug) {
      result = result.filter((project) => project.serviceSlugs.includes(serviceSlug));
    }

    result.sort((a, b) => b.year - a.year);
    return limit ? result.slice(0, limit) : result;
  },

  async getProject(slug) {
    return (await readStore()).projects.find((project) => project.slug === slug) ?? null;
  },

  async listArticles(query: ArticleQuery = {}) {
    const { tag, limit, excludeSlug } = query;

    let result = sortByDateDesc(
      (await readStore()).articles,
      (article) => article.publishedAt,
    );
    if (tag) result = result.filter((article) => article.tags.includes(tag));
    if (excludeSlug) result = result.filter((article) => article.slug !== excludeSlug);

    return (limit ? result.slice(0, limit) : result).map(toArticleSummary);
  },

  async getArticle(slug) {
    return (await readStore()).articles.find((article) => article.slug === slug) ?? null;
  },

  async getHomeContent() {
    return homeContent;
  },

  async getAboutContent() {
    return aboutContent;
  },

  async getCareersContent(): Promise<CareersContent> {
    // Everything but the vacancies is still code-edited; those come from the
    // store so the admin can add one without touching this file.
    //
    // Filtered to actual openings — a draft or an expired role is in the store
    // but is not advertised. `listJobOpenings` below deliberately is not, so
    // the CMS can see a draft in order to publish it.
    const openings = (await readStore()).openings.filter((job) => isOpening(job));
    return { ...careersContent, openings };
  },

  async getResearchContent() {
    return researchContent;
  },

  async getContactContent() {
    return contactContent;
  },

  async submitEnquiry(input: EnquiryInput): Promise<EnquiryResult> {
    // Stands in for the POST the backend handles. Persisted rather than only
    // logged, so the CMS inbox has something to show and the submit-then-read
    // path can be exercised before switching to the API.
    const enquiry: Enquiry = {
      ...input,
      reference: `ENQ-${Date.now().toString(36).toUpperCase()}`,
      // An instant, matching what the backend sends. `toISOString` is always
      // UTC with a `Z`, which is what the inbox needs to convert to the
      // operator's zone.
      receivedAt: new Date().toISOString(),
    };

    await writeStore((store) => {
      store.enquiries.push(enquiry);
    });

    console.info("[mock] Enquiry received", {
      reference: enquiry.reference,
      topic: enquiry.topic,
    });

    return { reference: enquiry.reference, receivedAt: enquiry.receivedAt };
  },

  /**
   * Newest first, to match the backend's ordering. Sorted on read rather than
   * inserted in order because the store is append-only and a plain string
   * compare on ISO-8601 instants is a chronological compare.
   */
  async listEnquiries(): Promise<Enquiry[]> {
    const { enquiries } = await readStore();
    return [...enquiries].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  },

  // --- Writes ------------------------------------------------------------

  saveMarket(market) {
    return upsert("markets", market, (m) => m.slug);
  },

  deleteMarket(slug) {
    return remove("markets", slug, (m) => m.slug);
  },

  saveService(service) {
    return upsert("services", service, (s) => s.slug);
  },

  deleteService(slug) {
    return remove("services", slug, (s) => s.slug);
  },

  saveProject(project) {
    return upsert("projects", project, (p) => p.slug);
  },

  deleteProject(slug) {
    return remove("projects", slug, (p) => p.slug);
  },

  saveArticle(article) {
    return upsert("articles", article, (a) => a.slug);
  },

  deleteArticle(slug) {
    return remove("articles", slug, (a) => a.slug);
  },

  /** Every job, whatever its status — this is the CMS listing. */
  async listJobOpenings() {
    return [...(await readStore()).openings];
  },

  async getJobOpening(id) {
    return (await readStore()).openings.find((opening) => opening.id === id) ?? null;
  },

  /**
   * Stands in for the database sequence: a draft with no id gets the next one.
   * Returns the saved entity, because that id is the only way the caller learns
   * what was created.
   */
  async saveJobOpening(draft) {
    const existing = (await readStore()).openings;
    const saved: JobOpening = {
      ...draft,
      id: draft.id ?? Math.max(0, ...existing.map((o) => o.id)) + 1,
    };

    await upsert("openings", saved, (o) => o.id);
    return saved;
  },

  deleteJobOpening(id) {
    return remove("openings", id, (o) => o.id);
  },
};

/**
 * Replaces the entry with the same id, or appends when there is none — so one
 * code path serves both the create and the edit form.
 */
function upsert<K extends keyof ContentStore>(
  collection: K,
  entity: ContentStore[K][number],
  // `string | number` because jobs are keyed on a numeric sequence and
  // everything else on a slug.
  idOf: (entity: ContentStore[K][number]) => string | number,
): Promise<void> {
  return writeStore((store) => {
    const entities = store[collection] as ContentStore[K][number][];
    const index = entities.findIndex((existing) => idOf(existing) === idOf(entity));

    if (index === -1) entities.push(entity);
    else entities[index] = entity;
  });
}

function remove<K extends keyof ContentStore>(
  collection: K,
  id: string | number,
  idOf: (entity: ContentStore[K][number]) => string | number,
): Promise<void> {
  return writeStore((store) => {
    const entities = store[collection] as ContentStore[K][number][];
    const index = entities.findIndex((existing) => idOf(existing) === id);

    if (index !== -1) entities.splice(index, 1);
  });
}

/**
 * What `GET /api/articles` sends: the article without its body. The mock drops
 * it too, so a page that wrongly reads `body` off a list item fails on the mock
 * source as well, rather than only once the backend is switched on.
 */
function toArticleSummary({ body: _body, ...summary }: Article): ArticleSummary {
  return summary;
}
