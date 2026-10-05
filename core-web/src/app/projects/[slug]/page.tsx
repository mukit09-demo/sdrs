import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandText } from "@/components/layout/Logo";
import { CardGrid } from "@/components/sections/CardGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { DetailList } from "@/components/sections/DetailList";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { StatList } from "@/components/ui/StatList";
import { routes } from "@/lib/config/routes";
import { content } from "@/lib/content";
import { projectToCard } from "@/lib/content/mappers";
import { formatLocation } from "@sdrs/shared/utils/format";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await content.listProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await content.getProject(slug);
  if (!project) return { title: "Project not found" };

  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await content.getProject(slug);
  if (!project) notFound();

  const [markets, services, related] = await Promise.all([
    content.listMarkets(),
    content.listServices(),
    content.listProjects({ marketSlug: project.marketSlugs[0], limit: 4 }),
  ]);

  const marketNames = markets
    .filter((market) => project.marketSlugs.includes(market.slug))
    .map((market) => market.name);
  const serviceNames = services
    .filter((service) => project.serviceSlugs.includes(service.slug))
    .map((service) => service.name);

  const relatedProjects = related
    .filter((item) => item.slug !== project.slug)
    .slice(0, 3);

  return (
    <>
      <PageHero
        title={project.title}
        eyebrow={formatLocation(project.location)}
        intro={project.summary}
        image={project.image}
        tags={marketNames}
        size="compact"
        crumbs={[
          { label: "Home", href: routes.home },
          { label: "Projects", href: routes.projects },
          { label: project.title },
        ]}
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-2xl font-medium text-ink-900 md:text-3xl">
              The project
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-600">
              <BrandText>{project.description}</BrandText>
            </p>

            {project.highlights.length > 0 && (
              <>
                <h3 className="mt-14 text-xs font-medium tracking-widest text-ink-500 uppercase">
                  What our teams did
                </h3>
                <DetailList
                  items={project.highlights}
                  marker="number"
                  className="mt-6"
                />
              </>
            )}
          </div>

          <aside>
            <h2 className="text-xs font-medium tracking-widest text-ink-500 uppercase">
              Project details
            </h2>
            <dl className="mt-6 divide-y divide-ink-200 border-y border-ink-200 text-sm">
              <DetailRow label="Client" value={project.client} />
              <DetailRow label="Location" value={formatLocation(project.location)} />
              <DetailRow label="Completed" value={String(project.year)} />
              {marketNames.length > 0 && (
                <DetailRow label="Markets" value={marketNames.join(", ")} />
              )}
              {serviceNames.length > 0 && (
                <DetailRow label="Services" value={serviceNames.join(", ")} />
              )}
            </dl>
          </aside>
        </div>
      </Section>

      {project.stats.length > 0 && (
        <Section tone="dark" spacing="sm">
          <StatList
            stats={project.stats}
            tone="dark"
            columns={project.stats.length === 3 ? 3 : 4}
          />
        </Section>
      )}

      {relatedProjects.length > 0 && (
        <Section tone="muted">
          <SectionHeader
            eyebrow="More work"
            title="Related projects"
            action={{ label: "All projects", href: routes.projects }}
          />
          <div className="mt-14">
            <CardGrid items={relatedProjects.map(projectToCard)} columns={3} />
          </div>
        </Section>
      )}

      <CtaBand
        title="Working on something comparable?"
        description="We can share what we learned here — including the parts that did not go to plan."
        primaryAction={{ label: "Contact us", href: routes.contact }}
      />
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}
