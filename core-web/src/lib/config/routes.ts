import type { Slug } from "@sdrs/shared/types/content";

/**
 * Every internal URL in the app is built here. Renaming a route segment is a
 * one-line change, and no template literals are scattered through components.
 */
export const routes = {
  home: "/",

  markets: "/markets",
  market: (slug: Slug) => `/markets/${slug}`,

  services: "/services",
  service: (slug: Slug) => `/services/${slug}`,

  projects: "/projects",
  project: (slug: Slug) => `/projects/${slug}`,

  about: "/about-us",
  careers: "/careers",
  research: "/research-and-training",

  news: "/news",
  article: (slug: Slug) => `/news/${slug}`,

  contact: "/contact-us",

} as const;
