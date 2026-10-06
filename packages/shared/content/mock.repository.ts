import { aboutContent } from "../data/about";
import { careersContent } from "../data/careers";
import { contactContent } from "../data/contact";
import { homeContent } from "../data/home";
import { researchContent } from "../data/research";
import { digitalTools } from "../data/services";
import { sortByDateDesc } from "../utils/format";
import { isOpening } from "./jobs";
import type { CareersContent } from "../types/content";
import type {
  ArticleQuery,
  ContentAdminRepository,
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

    return limit ? result.slice(0, limit) : result;
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
    // Stands in for the POST the backend will handle. Logged so the form can be
    // exercised end to end in development.
    console.info("[mock] Enquiry received", {
      topic: input.topic,
      email: input.email,
    });

    return {
      reference: `ENQ-${Date.now().toString(36).toUpperCase()}`,
      receivedAt: new Date().toISOString(),
    };
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

  saveJobOpening(opening) {
    return upsert("openings", opening, (o) => o.id);
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
  idOf: (entity: ContentStore[K][number]) => string,
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
  id: string,
  idOf: (entity: ContentStore[K][number]) => string,
): Promise<void> {
  return writeStore((store) => {
    const entities = store[collection] as ContentStore[K][number][];
    const index = entities.findIndex((existing) => idOf(existing) === id);

    if (index !== -1) entities.splice(index, 1);
  });
}
