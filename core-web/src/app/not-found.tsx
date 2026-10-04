import type { Metadata } from "next";
import { Section } from "@/components/sections/Section";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/config/routes";
import { allNav } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <Section spacing="lg" width="narrow">
      <p className="text-xs font-medium tracking-widest text-brand-600 uppercase">
        Error 404
      </p>
      <h1 className="mt-4 text-4xl font-medium tracking-tight text-ink-900 md:text-6xl">
        We cannot find that page
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-600">
        The link may be out of date, or the page may have moved. Try one of the
        sections below, or get in touch and we will point you to the right place.
      </p>

      <nav aria-label="Site sections" className="mt-12">
        <ul className="divide-y divide-ink-200 border-y border-ink-200">
          {allNav.map((link) => (
            <li key={link.href}>
              <Button href={link.href} variant="link" icon="arrow" className="py-4">
                {link.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-12">
        <Button href={routes.home} icon="arrow">
          Back to home
        </Button>
      </div>
    </Section>
  );
}
