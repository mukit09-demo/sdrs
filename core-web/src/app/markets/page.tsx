import type { Metadata } from "next";
import { CtaBand } from "@/components/sections/CtaBand";
import { FilterableGrid } from "@/components/sections/FilterableGrid";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import {
  FilmPlaybackProvider,
  FilmPlaybackToggle,
} from "@/components/ui/FilmPlayback";
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
        layout="wide"
        title={"Engineering across sectors.\nThinking beyond disciplines."}
        eyebrow="Where we work"
        intro={`SDRS brings together engineering, design, research and technology to address the complex challenges shaping our built and natural environments.

From buildings and infrastructure to mobility, energy, water, healthcare and sustainable communities, we work across disciplines to develop solutions that are safe, resilient, efficient and environmentally responsible.

Our ambition is simple: combine technical excellence with research and innovation to create lasting value for people, communities and the planet.`}
        crumbs={[{ label: "Home", href: routes.home }, { label: "Markets" }]}
      />

      <Section>
        {/* Every market card plays its own film, so one toggle sits on the
            search row and governs all fourteen. `panorama` because the films
            are 21:9 — the default 4:3 crop would throw away the drawing. */}
        <FilmPlaybackProvider>
          <FilterableGrid
            items={markets.map(marketToCard)}
            searchPlaceholder="Search markets"
            itemNoun={{ singular: "market", plural: "markets" }}
            columns={3}
            ratio="panorama"
            toolbarAction={<FilmPlaybackToggle />}
          />
        </FilmPlaybackProvider>
      </Section>

      <CtaBand
        title="Not sure which market your challenge sits in?"
        description="Most of the interesting work crosses several. Describe the problem and we will bring the right mix of people."
        primaryAction={{ label: "Contact us", href: routes.contact }}
      />
    </>
  );
}
