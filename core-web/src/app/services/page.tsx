import type { Metadata } from "next";
import { CardGrid } from "@/components/sections/CardGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { FilterableGrid } from "@/components/sections/FilterableGrid";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { routes } from "@/lib/config/routes";
import { content } from "@/lib/content";
import { serviceCategoryFilterGroup } from "@/lib/content/filters";
import { digitalToolToCard, serviceToCard } from "@/lib/content/mappers";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Design and engineering, advisory, planning and digital services from SDRS.",
};

export default async function ServicesPage() {
  const [services, digitalTools] = await Promise.all([
    content.listServices(),
    content.listDigitalTools(),
  ]);

  return (
    <>
      <PageHero
        title="Services"
        eyebrow="What we do"
        intro="More than 90 disciplines under one roof. Most of our work draws on several at once, which is why our advice tends to change the brief as well as answer it."
        crumbs={[{ label: "Home", href: routes.home }, { label: "Services" }]}
      />

      <Section>
        <FilterableGrid
          items={services.map(serviceToCard)}
          filterGroups={[serviceCategoryFilterGroup(services)]}
          searchPlaceholder="Search services"
          itemNoun={{ singular: "service", plural: "services" }}
          columns={3}
        />
      </Section>

      <Section tone="muted">
        <SectionHeader
          eyebrow="Digital"
          title="Tools built by our own teams"
          description="Software we developed to answer questions our projects kept asking — now used by clients directly."
        />
        <div className="mt-14">
          <CardGrid items={digitalTools.map(digitalToolToCard)} columns={4} />
        </div>
      </Section>

      <CtaBand
        title="Need a combination rather than a single service?"
        description="That is the normal case. Tell us the outcome you are after and we will assemble the team around it."
        primaryAction={{ label: "Contact us", href: routes.contact }}
      />
    </>
  );
}
