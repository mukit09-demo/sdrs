import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardGrid } from "@/components/sections/CardGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { DetailList } from "@/components/sections/DetailList";
import { FilmBand } from "@/components/sections/FilmBand";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { StatList } from "@/components/ui/StatList";
import { routes } from "@/lib/config/routes";
import { content } from "@/lib/content";
import { projectToCard, serviceToCard } from "@/lib/content/mappers";

interface MarketPageProps {
  params: Promise<{ slug: string }>;
}

/** Pre-renders every market at build time. */
export async function generateStaticParams() {
  const markets = await content.listMarkets();
  return markets.map((market) => ({ slug: market.slug }));
}

export async function generateMetadata({
  params,
}: MarketPageProps): Promise<Metadata> {
  const { slug } = await params;
  const market = await content.getMarket(slug);
  if (!market) return { title: "Market not found" };

  return { title: market.name, description: market.tagline };
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { slug } = await params;
  const market = await content.getMarket(slug);
  if (!market) notFound();

  const [featuredProjects, services] = await Promise.all([
    content.listProjects({ slugs: market.featuredProjectSlugs, limit: 6 }),
    content.listServices(),
  ]);

  const relatedServices = services.filter((service) =>
    service.relatedMarketSlugs.includes(market.slug),
  );

  return (
    <>
      <PageHero
        title={market.name}
        eyebrow="Market"
        intro={market.tagline}
        image={market.image}
        size="compact"
        crumbs={[
          { label: "Home", href: routes.home },
          { label: "Markets", href: routes.markets },
          { label: market.name },
        ]}
      />

      {market.film && (
        <FilmBand video={market.film.video} caption={market.film.caption} />
      )}

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-2xl font-medium text-ink-900 md:text-3xl">
              What we do in {market.name.toLowerCase()}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-600">
              {market.description}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-medium tracking-widest text-ink-500 uppercase">
              Capabilities
            </h3>
            <DetailList items={market.capabilities} className="mt-6" />
          </div>
        </div>
      </Section>

      {market.stats.length > 0 && (
        <Section tone="muted" spacing="sm">
          <StatList stats={market.stats} columns={market.stats.length === 3 ? 3 : 4} />
        </Section>
      )}

      {featuredProjects.length > 0 && (
        <Section>
          <SectionHeader
            eyebrow="Selected work"
            title={`Projects in ${market.name.toLowerCase()}`}
            action={{ label: "All projects", href: routes.projects }}
          />
          <div className="mt-14">
            <CardGrid items={featuredProjects.map(projectToCard)} columns={3} />
          </div>
        </Section>
      )}

      {relatedServices.length > 0 && (
        <Section tone="muted">
          <SectionHeader
            eyebrow="Services"
            title="How we help"
            action={{ label: "All services", href: routes.services }}
          />
          <div className="mt-14">
            <CardGrid
              items={relatedServices.map(serviceToCard)}
              columns={3}
              variant="minimal"
            />
          </div>
        </Section>
      )}

      <CtaBand
        title={`Planning something in ${market.name.toLowerCase()}?`}
        description="Start with a conversation. We will tell you what we would want to know before committing to an approach."
        primaryAction={{ label: "Contact us", href: routes.contact }}
      />
    </>
  );
}
