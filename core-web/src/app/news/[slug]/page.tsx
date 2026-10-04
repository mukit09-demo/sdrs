import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/sections/ArticleBody";
import { CardGrid } from "@/components/sections/CardGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Tag } from "@/components/ui/Tag";
import { routes } from "@/lib/config/routes";
import { content } from "@/lib/content";
import { articleToCard } from "@/lib/content/mappers";
import { formatDate } from "@sdrs/shared/utils/format";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await content.listArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await content.getArticle(slug);
  if (!article) return { title: "Article not found" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await content.getArticle(slug);
  if (!article) notFound();

  const related = await content.listArticles({
    tag: article.tags[0],
    excludeSlug: article.slug,
    limit: 3,
  });

  return (
    <>
      <PageHero
        title={article.title}
        eyebrow={article.category}
        intro={article.excerpt}
        image={article.image}
        size="compact"
        crumbs={[
          { label: "Home", href: routes.home },
          { label: "News", href: routes.news },
          { label: article.title },
        ]}
      />

      <Section width="narrow">
        <article>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-ink-200 pb-6 text-sm text-ink-600">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span>{article.readingMinutes} min read</span>
            <span>
              {article.author.name}
              <span className="text-ink-400"> — {article.author.role}</span>
            </span>
          </div>

          <ArticleBody paragraphs={article.body} className="mt-10" />

          {article.tags.length > 0 && (
            <footer className="mt-12 flex flex-wrap items-center gap-2 border-t border-ink-200 pt-8">
              <span className="mr-2 text-xs font-medium tracking-widest text-ink-500 uppercase">
                Topics
              </span>
              {article.tags.map((tag) => (
                <Tag key={tag} tone="outline">
                  {tag}
                </Tag>
              ))}
            </footer>
          )}
        </article>
      </Section>

      {related.length > 0 && (
        <Section tone="muted">
          <SectionHeader
            eyebrow="Keep reading"
            title="Related stories"
            action={{ label: "All news", href: routes.news }}
          />
          <div className="mt-14">
            <CardGrid items={related.map(articleToCard)} columns={3} />
          </div>
        </Section>
      )}

      <CtaBand
        title="Media enquiries"
        description="Our communications team can arrange interviews and provide supporting material."
        primaryAction={{ label: "Contact us", href: routes.contact }}
      />
    </>
  );
}
