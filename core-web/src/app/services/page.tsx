import type { Metadata } from "next";
import { CtaBand } from "@/components/sections/CtaBand";
import { FilterableGrid } from "@/components/sections/FilterableGrid";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { routes } from "@/lib/config/routes";
import { content } from "@/lib/content";
import { serviceCategoryFilterGroup } from "@/lib/content/filters";
import { serviceToCard } from "@/lib/content/mappers";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Advisory, design and engineering, digital, planning and sustainability, and research and innovation services from SDRS.",
};

export default async function ServicesPage() {
  // The in-house software (`content.listDigitalTools()`) used to run as a band
  // below the grid. It is still in the content layer, but it is not a service,
  // and on this page it read as four more of them.
  const services = await content.listServices();

  return (
    <>
      <PageHero
        layout="wide"
        title={"Integrated expertise.\nOne purpose: better solutions."}
        eyebrow="What we do"
        intro={`SDRS brings together engineering, design, technology, research and specialist consultancy to solve complex challenges across the built environment.

From early ideas and feasibility through detailed design, construction and the life of an asset, we combine technical knowledge across disciplines to deliver solutions that are safe, efficient, resilient and sustainable.

We design for today — and engineer with tomorrow in mind.`}
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

      <CtaBand
        title="Need a combination rather than a single service?"
        description="That is the normal case. Tell us the outcome you are after and we will assemble the team around it."
        primaryAction={{ label: "Contact us", href: routes.contact }}
      />
    </>
  );
}
