import type { Metadata } from "next";
import { CtaBand } from "@/components/sections/CtaBand";
import { FilterableGrid } from "@/components/sections/FilterableGrid";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { routes } from "@/lib/config/routes";
import { content } from "@/lib/content";
import { marketToCard } from "@/lib/content/mappers";

export const metadata: Metadata = {
  title: "Markets",
  description:
    "The sectors SDRS works across — transport, energy, water, property, cities, health, education and more.",
};

export default async function MarketsPage() {
  const markets = await content.listMarkets();

  return (
    <>
      <PageHero
        title="Markets"
        eyebrow="Where we work"
        intro="Our teams work across the sectors that keep places running. Each market brings its own constraints, regulation and pace of change — and its own combination of our specialists."
        crumbs={[{ label: "Home", href: routes.home }, { label: "Markets" }]}
      />

      <Section>
        <FilterableGrid
          items={markets.map(marketToCard)}
          searchPlaceholder="Search markets"
          itemNoun={{ singular: "market", plural: "markets" }}
          columns={3}
        />
      </Section>

      <CtaBand
        title="Not sure which market your challenge sits in?"
        description="Most of the interesting work crosses several. Describe the problem and we will bring the right mix of people."
        primaryAction={{ label: "Contact us", href: routes.contact }}
      />
    </>
  );
}
