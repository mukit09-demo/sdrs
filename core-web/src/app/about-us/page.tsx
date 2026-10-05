import type { Metadata } from "next";
import { BrandText } from "@/components/layout/Logo";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { PersonGrid } from "@/components/sections/PersonGrid";
import { QuoteBlock } from "@/components/sections/QuoteBlock";
import { Section } from "@/components/sections/Section";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Timeline } from "@/components/sections/Timeline";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { StatList } from "@/components/ui/StatList";
import { routes } from "@/lib/config/routes";
import { siteConfig } from "@/lib/config/site";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "About us",
  description:
    "SDRS is owned in trust on behalf of its members. Our history, values, leadership and the commitments that shape our work.",
};

export default async function AboutPage() {
  const about = await content.getAboutContent();

  return (
    <>
      <PageHero
        title="Owned in trust, on behalf of our people"
        eyebrow="About us"
        intro={about.intro}
        image={{ alt: "Members of the firm in a design review", seed: "about-hero" }}
        crumbs={[{ label: "Home", href: routes.home }, { label: "About us" }]}
      />

      <Section tone="muted" spacing="sm">
        <StatList stats={about.stats} columns={4} />
      </Section>

      <Section tone="dark">
        <QuoteBlock
          quote={about.founderQuote.quote}
          attribution={about.founderQuote.attribution}
          tone="dark"
        />
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Values"
          title="What we hold ourselves to"
          description="Four commitments that decide how we take on work, and occasionally how we turn it down."
        />
        <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2">
          {about.values.map((value, index) => (
            <li key={value.title}>
              <Reveal delay={Math.min(index, 3) * 80}>
                <h3 className="border-t-2 border-ink-900 pt-5 text-xl font-medium text-ink-900">
                  {value.title}
                </h3>
                <p className="mt-4 leading-relaxed text-ink-600">
                  {value.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="muted">
        <SectionHeader
          eyebrow="History"
          title={`From ${siteConfig.foundedYear} to today`}
          description="A few of the moments that shaped the firm we are now."
        />
        <div className="mt-14">
          <Timeline milestones={about.milestones} />
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Leadership"
          title="The people accountable for the firm"
        />
        <div className="mt-14">
          <PersonGrid people={about.leadership} columns={3} />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeader
          eyebrow="Commitments"
          title="Where we are pushing hardest"
          description="Programmes we fund and report on publicly, because they only work if they are measured."
        />
        <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {about.initiatives.map((initiative, index) => (
            <li key={initiative.title} className="flex">
              <Reveal delay={Math.min(index, 3) * 80} className="flex w-full">
                <article className="flex w-full flex-col border-t-2 border-brand-500 bg-white p-6">
                  <h3 className="text-lg font-medium text-ink-900">
                    <BrandText>{initiative.title}</BrandText>
                  </h3>
                  <p className="mt-3 flex-1 leading-relaxed text-ink-600">
                    <BrandText>{initiative.description}</BrandText>
                  </p>
                  <Button
                    href={initiative.href}
                    variant="link"
                    icon="arrow"
                    className="mt-6 self-start"
                  >
                    <BrandText>{initiative.ctaLabel}</BrandText>
                  </Button>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        title="Join a firm that answers to its own people."
        description="Ownership in trust means our members decide what we take on, and what we do with the proceeds."
        primaryAction={{ label: "Contact us", href: routes.contact }}
      />
    </>
  );
}
