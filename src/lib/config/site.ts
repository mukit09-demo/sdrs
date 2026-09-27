/**
 * Single source of truth for site-wide chrome: navigation, footer links and
 * metadata defaults. Adding a page means adding one entry here.
 */

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export const siteConfig = {
  name: "SDRS",
  /** Full legal name — used where the initials alone would be ambiguous. */
  legalName: "Shawkat Design and Research Studio",
  /** Used by the footer strapline and as the metadata description fallback. */
  tagline:
    "Shawkat Design and Research Studio is an engineering design, research and " +
    "sustainability practice, working across every stage of the built environment.",
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
