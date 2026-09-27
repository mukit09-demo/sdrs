import type { Metadata } from "next";
import { CtaBand } from "@/components/sections/CtaBand";
import { FilterableGrid } from "@/components/sections/FilterableGrid";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { routes } from "@/lib/config/routes";
import { content } from "@/lib/content";
import { projectMarketFilterGroup } from "@/lib/content/filters";
import { projectToCard } from "@/lib/content/mappers";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected SDRS projects across transport, energy, water, property, cities and culture.",
};

export default async function ProjectsPage() {
  const [projects, markets] = await Promise.all([
    content.listProjects(),
    content.listMarkets(),
  ]);

  return (
    <>
      <PageHero
        title="Projects"
        eyebrow="Selected work"
        intro="A cross-section of what our teams have delivered with clients — the constraints, the numbers and what changed as a result."
        crumbs={[{ label: "Home", href: routes.home }, { label: "Projects" }]}
      />

      <Section>
        <FilterableGrid
          items={projects.map(projectToCard)}
          filterGroups={[projectMarketFilterGroup(projects, markets)]}
          searchPlaceholder="Search projects, cities, clients"
          itemNoun={{ singular: "project", plural: "projects" }}
          columns={3}
        />
      </Section>

      <CtaBand
        title="Every project here started as a question."
        description="Bring us yours — including the ones without an obvious answer."
        primaryAction={{ label: "Contact us", href: routes.contact }}
      />
    </>
  );
}
