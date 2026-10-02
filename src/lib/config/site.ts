/**
 * Single source of truth for site-wide chrome: navigation, footer links and
 * metadata defaults. Adding a page means adding one entry here.
 */

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

/** Full legal name — used where the initials alone would be ambiguous. */
const legalName = "Shawkat Design and Research Studio";

/**
 * The strapline from the verb onwards. Held separately because the footer opens
 * the sentence with the wordmark in place of the name and then carries on in
 * words — `tagline` puts the name back for everywhere it has to be spelled out.
 */
const taglinePredicate =
  "is an engineering design, research and sustainability practice, working " +
  "across every stage of the built environment.";

export const siteConfig = {
  name: "SDRS",
  legalName,
  taglinePredicate,
  /** The whole strapline — the metadata description fallback. */
  tagline: `${legalName} ${taglinePredicate}`,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Placeholder, inherited with the sample history in `src/data/about.ts`. */
  foundedYear: 1946,
} as const;

/** Main sections — rendered prominently in the header. */
export const primaryNav: readonly NavLink[] = [
  {
    label: "Markets",
    href: "/markets",
    description: "The sectors our teams work across",
  },
  {
    label: "Services",
    href: "/services",
    description: "Design, engineering, advisory and digital",
  },
  {
    label: "Projects",
    href: "/projects",
    description: "Work delivered with our clients",
  },
  {
    label: "Research and training",
    href: "/research-and-training",
    description: "Programmes we fund and courses we teach",
  },
] as const;

/** Supporting sections — a lighter row in the header. */
export const secondaryNav: readonly NavLink[] = [
  { label: "About us", href: "/about-us" },
  { label: "Careers", href: "/careers" },
  { label: "News", href: "/news" },
  { label: "Contact us", href: "/contact-us" },
] as const;

export const allNav: readonly NavLink[] = [...primaryNav, ...secondaryNav];

export const legalNav: readonly NavLink[] = [
  { label: "Modern Slavery Statement", href: "/contact-us" },
  { label: "Legal", href: "/contact-us" },
  { label: "Policies", href: "/about-us" },
  { label: "Privacy", href: "/contact-us" },
  { label: "Speak Up", href: "/contact-us" },
  { label: "Suppliers", href: "/contact-us" },
] as const;

export interface SocialLink {
  label: string;
  href: string;
  /** Key into the `socialIcons` map in `<SiteFooter>`. */
  icon: "linkedin" | "instagram" | "facebook" | "youtube";
}

export const socialLinks: readonly SocialLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: "linkedin" },
  { label: "Instagram", href: "https://www.instagram.com", icon: "instagram" },
  { label: "Facebook", href: "https://www.facebook.com", icon: "facebook" },
  { label: "YouTube", href: "https://www.youtube.com", icon: "youtube" },
] as const;
