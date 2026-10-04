import type { Metadata } from "next";
import { CardGrid } from "@/components/sections/CardGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { FilterableGrid } from "@/components/sections/FilterableGrid";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { routes } from "@/lib/config/routes";
import { content } from "@/lib/content";
import { articleCategoryFilterGroup } from "@/lib/content/filters";
import { articleToCard, issueToCard } from "@/lib/content/mappers";

export const metadata: Metadata = {
  title: "News",
  description:
    "Press releases, insight, awards and reports from across the SDRS practice.",
};

export default async function NewsPage() {
  const [articles, issues] = await Promise.all([
    content.listArticles(),
    content.listIssues(),
  ]);

  const [lead, ...rest] = articles;

  return (
    <>
      <PageHero
        title="News"
        eyebrow="Newsroom"
        intro="Announcements, research and points of view from our teams around the world."
        crumbs={[{ label: "Home", href: routes.home }, { label: "News" }]}
      />

      {lead && (
        <Section spacing="sm">
          <CardGrid
            items={[articleToCard(lead)]}
            columns={1}
            ratio="panorama"
            priorityCount={1}
          />
        </Section>
      )}

      <Section spacing="sm">
        <FilterableGrid
          items={rest.map(articleToCard)}
          filterGroups={[articleCategoryFilterGroup(articles)]}
          searchPlaceholder="Search news and insight"
          itemNoun={{ singular: "story", plural: "stories" }}
          columns={3}
        />
      </Section>

      <Section tone="muted">
        <SectionHeader
          eyebrow="Issues"
          title="Questions we keep returning to"
          description="Longer-running themes behind much of our research and advisory work."
        />
        <div className="mt-14">
          <CardGrid items={issues.map(issueToCard)} columns={3} variant="overlay" />
        </div>
      </Section>

      <CtaBand
        title="Talk to our press team"
        description="For interviews, data requests or comment on a story, our communications team can help."
        primaryAction={{ label: "Contact us", href: routes.contact }}
      />
    </>
  );
}
