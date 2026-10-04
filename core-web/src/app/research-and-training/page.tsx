import type { Metadata } from "next";
import { CtaBand } from "@/components/sections/CtaBand";
import { FilterableGrid } from "@/components/sections/FilterableGrid";
import { PageHero } from "@/components/sections/PageHero";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { QuoteBlock } from "@/components/sections/QuoteBlock";
import { Section } from "@/components/sections/Section";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { StatList } from "@/components/ui/StatList";
import { routes } from "@/lib/config/routes";
import { content } from "@/lib/content";
import {
  researchThemeFilterGroup,
  trainingFormatFilterGroup,
  trainingLevelFilterGroup,
} from "@/lib/content/filters";
import {
  researchProgrammeToCard,
  trainingCourseToCard,
} from "@/lib/content/mappers";

export const metadata: Metadata = {
  title: "Research and training",
  description:
    "The research programmes SDRS funds, the findings we publish, and the courses we teach to our own teams and to our clients.",
};

export default async function ResearchAndTrainingPage() {
  const research = await content.getResearchContent();

  return (
    <>
      <PageHero
        title="Questions worth being paid to answer"
        eyebrow="Research and training"
        intro={research.intro}
        image={{ alt: "Researchers testing a material sample", seed: "research-hero" }}
        actions={[
          { label: "See our programmes", href: "#programmes" },
          { label: "Browse courses", href: "#training" },
        ]}
        crumbs={[
          { label: "Home", href: routes.home },
          { label: "Research and training" },
        ]}
      />

      <Section tone="muted" spacing="sm">
        <StatList stats={research.stats} columns={4} />
      </Section>

      <Section id="programmes">
        <SectionHeader
          eyebrow="Research"
          title="Programmes we are funding now"
          description="Filter by theme or by how far along a programme is. Data and findings are published whichever way the result goes."
        />
        <div className="mt-14">
          <FilterableGrid
            items={research.programmes.map(researchProgrammeToCard)}
            filterGroups={[researchThemeFilterGroup(research.programmes)]}
            searchPlaceholder="Search programmes"
            itemNoun={{ singular: "programme", plural: "programmes" }}
            columns={3}
          />
        </div>
      </Section>

      <Section tone="dark">
        <QuoteBlock
          quote={research.directorQuote.quote}
          attribution={research.directorQuote.attribution}
          detail={research.directorQuote.detail}
          tone="dark"
        />
      </Section>

      <Section>
        <SectionHeader
          eyebrow="How it works"
          title="From a site question to a published paper"
          description="Five stages, and a panel of practising engineers decides at the second one."
        />
        <div className="mt-14">
          <ProcessSteps steps={research.researchProcess} />
        </div>
      </Section>

      <Section id="training" tone="muted">
        <SectionHeader
          eyebrow="Training"
          title="Courses open to clients and colleagues"
          description="Taught by the engineers doing the work, using data from our own projects. Filter by level or by how the course runs."
        />
        <div className="mt-14">
          <FilterableGrid
            items={research.courses.map(trainingCourseToCard)}
            filterGroups={[
              trainingLevelFilterGroup(research.courses),
              trainingFormatFilterGroup(research.courses),
            ]}
            searchPlaceholder="Search courses"
            itemNoun={{ singular: "course", plural: "courses" }}
            columns={3}
          />
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Publications"
          title="Recent papers"
          description="Everything listed here is published with the dataset behind it."
        />
        <ul className="mt-14 divide-y divide-ink-200 border-y border-ink-200">
          {research.publications.map((publication, index) => (
            <li key={publication.title}>
              <Reveal delay={Math.min(index, 3) * 80}>
                <div className="flex flex-col gap-2 py-6 md:flex-row md:items-center md:justify-between md:gap-10">
                  <div>
                    <h3 className="text-lg font-medium text-ink-900">
                      {publication.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink-600">
                      {publication.venue} &middot; {publication.year}
                    </p>
                  </div>
                  <Button
                    href={publication.href}
                    variant="link"
                    icon="arrow"
                    className="shrink-0 text-sm"
                  >
                    Read the paper
                  </Button>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="muted">
        <SectionHeader
          eyebrow="Partners"
          title="Who we work with"
          description="Programmes are run alongside universities and institutes so the method is scrutinised by people outside the firm."
        />
        <ul className="mt-14 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {research.partners.map((partner, index) => (
            <li key={partner}>
              <Reveal delay={Math.min(index, 3) * 80}>
                <p className="border-t-2 border-ink-900 pt-4 leading-snug text-ink-700">
                  {partner}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        title="Want a course run for your team?"
        description="Most of our courses can be taught in house, and several started as a client asking for exactly that. Tell us what your team needs to be able to do."
        primaryAction={{ label: "Contact us", href: routes.contact }}
        image={{ alt: "Training session in a studio", seed: "research-cta" }}
      />
    </>
  );
}
