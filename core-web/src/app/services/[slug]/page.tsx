import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardGrid } from "@/components/sections/CardGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { DetailList } from "@/components/sections/DetailList";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { routes } from "@/lib/config/routes";
import { content } from "@/lib/content";
import { marketToCard, projectToCard } from "@/lib/content/mappers";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = await content.listServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await content.getService(slug);
  if (!service) return { title: "Service not found" };

  return { title: service.name, description: service.tagline };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await content.getService(slug);
  if (!service) notFound();

  const [projects, markets] = await Promise.all([
    content.listProjects({ serviceSlug: service.slug, limit: 3 }),
    content.listMarkets(),
  ]);

  const relatedMarkets = markets.filter((market) =>
    service.relatedMarketSlugs.includes(market.slug),
  );

  return (
    <>
      <PageHero
        title={service.name}
        eyebrow={service.category}
        intro={service.tagline}
        image={service.image}
        size="compact"
        crumbs={[
          { label: "Home", href: routes.home },
          { label: "Services", href: routes.services },
          { label: service.name },
        ]}
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-2xl font-medium text-ink-900 md:text-3xl">
              How we approach it
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-600">
              {service.description}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-medium tracking-widest text-ink-500 uppercase">
              What you receive
            </h3>
            <DetailList items={service.deliverables} className="mt-6" />
          </div>
        </div>
      </Section>

      {projects.length > 0 && (
        <Section tone="muted">
          <SectionHeader
            eyebrow="In practice"
            title="Projects using this service"
            action={{ label: "All projects", href: routes.projects }}
          />
          <div className="mt-14">
            <CardGrid items={projects.map(projectToCard)} columns={3} />
          </div>
        </Section>
      )}

      {relatedMarkets.length > 0 && (
        <Section>
          <SectionHeader eyebrow="Markets" title="Where we apply it" />
          <div className="mt-14">
            <CardGrid
              items={relatedMarkets.map(marketToCard)}
              columns={3}
              variant="minimal"
            />
          </div>
        </Section>
      )}

      <CtaBand
        title={`Talk to our ${service.name.toLowerCase()} team`}
        description="We are happy to review an early concept, a stalled design or a business case that needs testing."
        primaryAction={{ label: "Contact us", href: routes.contact }}
      />
    </>
  );
}
