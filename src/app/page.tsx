import { CardGrid } from "@/components/sections/CardGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { FilmBand } from "@/components/sections/FilmBand";
import { Section } from "@/components/sections/Section";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { PageHero } from "@/components/sections/PageHero";
import { StatList } from "@/components/ui/StatList";
import { content } from "@/lib/content";
import {
  articleToCard,
  issueToCard,
  marketToCard,
  projectToCard,
} from "@/lib/content/mappers";
import { routes } from "@/lib/config/routes";

/**
 * Home page. Everything comes from the content repository, so this renders the
 * same whether the data is bundled dummy content or the Spring Boot API.
 */
export default async function HomePage() {
  const [home, markets, projects, articles, issues, about] = await Promise.all([
    content.getHomeContent(),
    content.listMarkets(),
    content.listProjects({ limit: 6 }),
    content.listArticles({ limit: 3 }),
    content.listIssues(3),
    content.getAboutContent(),
  ]);

  return (
    <>
      <PageHero
        title="We shape a better world"
        eyebrow="Designers, engineers and consultants"
        intro="SDRS is an independent studio of designers, engineers, architects, planners, consultants and technical specialists, working across every aspect of today's built environment."
        image={{
          alt: "Long-span bridge deck at dusk",
          seed: "home-hero",
        }}
        actions={[
          { label: "Explore our projects", href: routes.projects },
          { label: "What we do", href: routes.services },
        ]}
      />

      <FilmBand video={home.film.video} caption={home.film.caption} />

      <Section tone="muted" spacing="sm">
        <StatList stats={about.stats} columns={4} />
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Markets"
          title="The sectors we work across"
          description="From transport networks to data centres, our teams bring together every discipline a place needs."
          action={{ label: "All markets", href: routes.markets }}
        />
        <div className="mt-14">
          <CardGrid
            items={markets.slice(0, 6).map(marketToCard)}
            columns={3}
            priorityCount={3}
          />
        </div>
      </Section>

      <Section tone="dark">
        <SectionHeader
          eyebrow="Projects"
          title="Work delivered with our clients"
          description="A selection of the places, systems and structures our teams have helped bring into being."
          action={{ label: "All projects", href: routes.projects }}
          tone="dark"
        />
        <div className="mt-14">
          <CardGrid
            items={projects.map(projectToCard)}
            columns={3}
            variant="overlay"
            leadFeature
          />
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Big questions"
          title="The issues shaping our work"
          description="Open problems we are investigating with clients, universities and city authorities."
        />
        <div className="mt-14">
          <CardGrid items={issues.map(issueToCard)} columns={3} />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeader
          eyebrow="News and insight"
          title="Latest from the firm"
          action={{ label: "All news", href: routes.news }}
        />
        <div className="mt-14">
          <CardGrid items={articles.map(articleToCard)} columns={3} />
        </div>
      </Section>

      <CtaBand
        title="Tell us what you are trying to change."
        description="Whether it is a single building or a national programme, our teams will help you frame the problem before designing the answer."
        primaryAction={{ label: "Contact us", href: routes.contact }}
        image={{ alt: "Engineers reviewing drawings on site", seed: "home-cta" }}
      />
    </>
  );
}
