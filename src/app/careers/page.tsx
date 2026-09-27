import type { Metadata } from "next";
import { CtaBand } from "@/components/sections/CtaBand";
import { JobList } from "@/components/sections/JobList";
import { PageHero } from "@/components/sections/PageHero";
import { PersonGrid } from "@/components/sections/PersonGrid";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { Section } from "@/components/sections/Section";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { StatList } from "@/components/ui/StatList";
import { routes } from "@/lib/config/routes";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Every day, a new challenge. Graduate and experienced roles across engineering, advisory, planning and digital at SDRS.",
};

export default async function CareersPage() {
  const careers = await content.getCareersContent();

  return (
    <>
      <PageHero
        title="Every day, a new challenge"
        eyebrow="Careers"
        intro={careers.intro}
        image={{ alt: "Colleagues on a site visit", seed: "careers-hero" }}
        actions={[
          { label: "See open roles", href: "#openings" },
          { label: "How we hire", href: "#process" },
        ]}
        crumbs={[{ label: "Home", href: routes.home }, { label: "Careers" }]}
      />

      <Section tone="muted" spacing="sm">
        <StatList stats={careers.stats} columns={4} />
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Life here"
          title="What you get from being a member"
          description="Everyone who works at SDRS shares in its ownership — and in the decisions and profits that come with it."
        />
        <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {careers.benefits.map((benefit, index) => (
            <li key={benefit.title}>
              <Reveal delay={Math.min(index, 3) * 80}>
                <h3 className="border-t-2 border-ink-900 pt-5 text-lg font-medium text-ink-900">
                  {benefit.title}
                </h3>
                <p className="mt-4 leading-relaxed text-ink-600">
                  {benefit.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="openings" tone="muted">
        <SectionHeader
          eyebrow="Open roles"
          title="Current vacancies"
          description="Filter by experience level or discipline. If nothing fits, register your interest and we will keep you posted."
        />
        <div className="mt-14">
          <JobList openings={careers.openings} applyHref={routes.contact} />
        </div>
      </Section>

      <Section id="process">
        <SectionHeader
          eyebrow="How we hire"
          title="What the process looks like"
          description="Five steps, and we tell you where you stand at each one."
        />
        <div className="mt-14">
          <ProcessSteps steps={careers.applicationProcess} />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeader
          eyebrow="Our people"
          title="Colleagues on their work"
          description="What our members actually spend their time on, in their own words."
        />
        <div className="mt-14">
          <PersonGrid people={careers.profiles} columns={3} />
        </div>
      </Section>

      <CtaBand
        title="Can't see the right role yet?"
        description="Send us your details and tell us what you want to work on. Our recruitment team reviews every enquiry."
        primaryAction={{ label: "Register your interest", href: routes.contact }}
        image={{ alt: "Engineers at a workshop table", seed: "careers-cta" }}
      />
    </>
  );
}
