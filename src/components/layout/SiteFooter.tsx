import Link from "next/link";
import type { ComponentType } from "react";
import { Container } from "@/components/ui/Container";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon,
} from "@/components/ui/Icon";
import {
  legalNav,
  siteConfig,
  socialLinks,
  type SocialLink,
} from "@/lib/config/site";

/** Icon components keyed by `SocialLink.icon`. */
const socialIcons: Record<
  SocialLink["icon"],
  ComponentType<{ className?: string }>
> = {
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
};

// Brand red band. Text sits at 85% white or higher: the red is light enough
// that the 45–55% tints a dark surface allows drop under 4.5:1 contrast on it.
export function SiteFooter() {
  return (
    <footer className="bg-brand-600 text-white">
      {/* One band: the tagline, legal links and socials share a single row on
          desktop so the footer stays half the height of a stacked layout. */}
      <Container className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between md:gap-8">
        <p className="min-w-0 text-xs leading-snug text-white/85 md:flex-1">
          {siteConfig.tagline}
        </p>

        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          {legalNav.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-xs text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="flex gap-2">
          {socialLinks.map((social) => {
            const SocialIcon = socialIcons[social.icon];

            return (
              <li key={social.icon}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="grid size-8 place-items-center border border-white/45 text-white/85 transition-colors hover:border-white hover:text-white"
                >
                  <SocialIcon className="size-3.5" />
                  <span className="sr-only">{social.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </Container>
    </footer>
  );
}
