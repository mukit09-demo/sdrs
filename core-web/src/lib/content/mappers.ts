import { routes } from "@/lib/config/routes";
import { formatLocation, formatShortDate } from "@sdrs/shared/utils/format";
import type {
  ArticleSummary,
  CardItem,
  DigitalTool,
  Market,
  MediaImage,
  MediaVideo,
  Project,
  ResearchProgramme,
  Service,
  TrainingCourse,
} from "@sdrs/shared/types/content";

/**
 * Entity → `CardItem` adapters.
 *
 * These exist so that one `<ContentCard>` and one `<FilterableGrid>` can render
 * every collection on the site. A new entity type needs a mapper here, not a
 * new card component.
 */

/**
 * Markets store no image, so every one shares this backdrop: the hero behind
 * its title, and the poster shown before its film plays. The seed is chosen
 * for its gradient — the neutral graphite ramp, which sits under any film.
 */
export function marketBackdrop(market: Market): MediaImage {
  return { alt: market.name, seed: "market-hero-band" };
}

/**
 * A market stores only its film's URL; the poster is the shared backdrop and
 * the description is generated from its name.
 */
export function marketFilm(market: Market): MediaVideo {
  return {
    url: market.filmUrl,
    alt: `Film showing ${market.name}`,
    poster: marketBackdrop(market),
  };
}

export function marketToCard(market: Market): CardItem {
  return {
    id: market.slug,
    href: routes.market(market.slug),
    title: market.name,
    summary: market.tagline,
    image: marketBackdrop(market),
    // Every market carries a film, so the index moves rather than sitting still.
    video: marketFilm(market),
    tags: [market.slug],
  };
}

export function serviceToCard(service: Service): CardItem {
  return {
    id: service.slug,
    href: routes.service(service.slug),
    title: service.name,
    eyebrow: service.category,
    summary: service.tagline,
    image: service.image,
    tags: [service.category, ...service.relatedMarketSlugs],
  };
}

export function projectToCard(project: Project): CardItem {
  return {
    id: project.slug,
    href: routes.project(project.slug),
    title: project.title,
    eyebrow: formatLocation(project.location),
    summary: project.summary,
    image: project.image,
    meta: [String(project.year)],
    tags: [...project.marketSlugs, ...project.serviceSlugs],
  };
}

/**
 * An article stores only its image's URL; the description is its title and the
 * placeholder is seeded from its slug.
 */
export function articleImage(article: ArticleSummary): MediaImage {
  return {
    alt: article.title,
    seed: article.slug,
    ...(article.imageUrl ? { url: article.imageUrl } : {}),
  };
}

export function articleToCard(article: ArticleSummary): CardItem {
  return {
    id: article.slug,
    href: routes.article(article.slug),
    title: article.title,
    eyebrow: article.category,
    summary: article.excerpt,
    image: articleImage(article),
    meta: [formatShortDate(article.publishedAt), `${article.readingMinutes} min read`],
    tags: [article.category, ...article.tags],
  };
}

/**
 * Programmes have no detail route in this build, so the card links back to its
 * own index. Point `href` at a programme page once one exists.
 */
export function researchProgrammeToCard(programme: ResearchProgramme): CardItem {
  return {
    id: programme.slug,
    href: routes.research,
    title: programme.title,
    eyebrow: programme.status,
    summary: programme.summary,
    image: programme.image,
    meta: [programme.theme, `Since ${programme.startedYear}`],
    tags: [programme.theme, programme.status],
  };
}

/** Courses link to the enquiry form — registering interest is the next step. */
export function trainingCourseToCard(course: TrainingCourse): CardItem {
  return {
    id: course.slug,
    href: routes.contact,
    title: course.title,
    eyebrow: course.discipline,
    summary: course.summary,
    image: course.image,
    meta: [
      course.format,
      course.duration,
      `Next: ${formatShortDate(course.nextStartsAt)}`,
    ],
    tags: [course.format, course.level, course.discipline],
  };
}

export function digitalToolToCard(tool: DigitalTool): CardItem {
  return {
    id: tool.slug,
    href: routes.services,
    title: tool.name,
    eyebrow: "Digital tool",
    summary: tool.summary,
    image: tool.image,
  };
}
