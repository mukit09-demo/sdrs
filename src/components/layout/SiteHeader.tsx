"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CloseIcon, MenuIcon } from "@/components/ui/Icon";
import { routes } from "@/lib/config/routes";
import { primaryNav, secondaryNav, type NavLink } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

/**
 * Sticky site header with a mobile drawer.
 *
 * A client component only because it needs the current pathname for active
 * state and local state for the drawer — the nav itself comes from
 * `src/lib/config/site.ts`, so adding a section never touches this file.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // The bar is opaque on purpose: a translucent one picks up the colour of
  // whatever band scrolls under it — grey over the dark hero, green over the
  // market cards — which reads as a bug rather than as glass.
  return (
    <header className="sticky top-0 z-50 border-b border-ink-200 bg-white">
      <Container className="flex h-20 items-center justify-between gap-4 navbar:h-26">
        <Logo />

        {/* The inline row appears at the `navbar` breakpoint rather than `lg`:
            the primary sections are set in caps, so seven labels need far more
            than `lg` has and would otherwise overflow the container. The gaps
            are uniform for the same reason — widening them at `xl` pushed the
            row past 1280px. Labels must not wrap. */}
        <nav aria-label="Main" className="hidden items-center gap-4 navbar:flex">
          {primaryNav.map((link) => (
            <NavItem key={link.href} link={link} pathname={pathname} emphasis />
          ))}
          <span aria-hidden="true" className="h-6 w-px bg-ink-200" />
          {secondaryNav
            .filter((link) => link.href !== routes.contact)
            .map((link) => (
              <NavItem key={link.href} link={link} pathname={pathname} />
            ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            href={routes.contact}
            size="sm"
            className="hidden whitespace-nowrap sm:inline-flex"
          >
            Contact us
          </Button>
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="grid size-10 place-items-center border border-ink-300 text-ink-900 transition-colors hover:border-ink-900 navbar:hidden"
          >
            {isMenuOpen ? (
              <CloseIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
            <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </Container>

      <div
        id="mobile-menu"
        hidden={!isMenuOpen}
        className="border-t border-ink-200 bg-white navbar:hidden"
      >
        <Container className="py-6">
          <nav aria-label="Mobile" className="flex flex-col">
            {[...primaryNav, ...secondaryNav].map((link) => {
              const isActive = isActiveHref(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  // Navigating away closes the drawer.
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "border-b border-ink-100 py-4 last:border-0",
                    isActive ? "text-brand-600" : "text-ink-900",
                  )}
                >
                  <span className="font-display text-xl font-medium">{link.label}</span>
                  {link.description && (
                    <span className="mt-1 block text-sm text-ink-500">
                      {link.description}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </Container>
      </div>
    </header>
  );
}

function NavItem({
  link,
  pathname,
  emphasis = false,
}: {
  link: NavLink;
  pathname: string;
  emphasis?: boolean;
}) {
  const isActive = isActiveHref(pathname, link.href);

  return (
    <Link
      href={link.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative py-1 whitespace-nowrap transition-colors",
        // Primary sections read a step larger than the supporting row, and are
        // set in caps so the two rows are told apart by more than size alone.
        emphasis ? "text-lg font-medium uppercase" : "text-base",
        isActive ? "text-brand-600" : "text-ink-700 hover:text-ink-950",
      )}
    >
      {link.label}
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-brand-500"
        />
      )}
    </Link>
  );
}

/** Active for the section itself and for anything nested beneath it. */
function isActiveHref(pathname: string, href: string): boolean {
  if (href === routes.home) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
