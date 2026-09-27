import { aboutContent } from "@/data/about";
import { careersContent } from "@/data/careers";
import { contactContent } from "@/data/contact";
import { homeContent } from "@/data/home";
import { markets } from "@/data/markets";
import { articles, issues } from "@/data/news";
import { projects } from "@/data/projects";
import { researchContent } from "@/data/research";
import { digitalTools, services } from "@/data/services";
import { sortByDateDesc } from "@/lib/utils/format";
import type {
  ArticleQuery,
  ContentRepository,
  EnquiryInput,
  EnquiryResult,
  ProjectQuery,
} from "./repository";

/**
 * Serves the bundled dummy data. Returns copies rather than the module-level
 * arrays so that a caller sorting or splicing a result cannot corrupt the
 * "database" for every subsequent request in the same server process.
 */
export const mockRepository: ContentRepository = {
  async listMarkets() {
    return [...markets];
  },

  async getMarket(slug) {
    return markets.find((market) => market.slug === slug) ?? null;
  },

  async listServices() {
    return [...services];
  },

  async getService(slug) {
    return services.find((service) => service.slug === slug) ?? null;
  },

  async listDigitalTools() {
    return [...digitalTools];
  },

  async listProjects(query: ProjectQuery = {}) {
    const { marketSlug, serviceSlug, slugs, limit } = query;

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
    return projects.find((project) => project.slug === slug) ?? null;
  },

  async listArticles(query: ArticleQuery = {}) {
    const { tag, limit, excludeSlug } = query;

    let result = sortByDateDesc(articles, (article) => article.publishedAt);
    if (tag) result = result.filter((article) => article.tags.includes(tag));
    if (excludeSlug) result = result.filter((article) => article.slug !== excludeSlug);

    return limit ? result.slice(0, limit) : result;
  },

  async getArticle(slug) {
    return articles.find((article) => article.slug === slug) ?? null;
  },

  async listIssues(limit) {
    return limit ? issues.slice(0, limit) : [...issues];
  },

  async getHomeContent() {
    return homeContent;
  },

  async getAboutContent() {
    return aboutContent;
  },

  async getCareersContent() {
    return careersContent;
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
};
