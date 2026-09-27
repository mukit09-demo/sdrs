import { uniqueSorted } from "@/lib/utils/array";
import type {
  Article,
  FilterGroup,
  Market,
  Project,
  ResearchProgramme,
  Service,
  TrainingCourse,
} from "@/types/content";

/**
 * Filter groups for `<FilterableGrid>`. Options are derived from the content
 * itself, so a new market or category never needs a matching UI change.
 */

export function marketFilterGroup(
  markets: Market[],
  label = "Market",
): FilterGroup {
  return {
    id: "market",
    label,
    options: markets.map((market) => ({ value: market.slug, label: market.name })),
  };
}

export function serviceCategoryFilterGroup(services: Service[]): FilterGroup {
  return {
    id: "category",
    label: "Type of service",
    options: uniqueSorted(services.map((service) => service.category)).map(
      (category) => ({ value: category, label: category }),
    ),
  };
}

/** Markets that actually have projects attached — avoids dead filter options. */
export function projectMarketFilterGroup(
  projects: Project[],
  markets: Market[],
): FilterGroup {
  const used = new Set(projects.flatMap((project) => project.marketSlugs));
  return marketFilterGroup(
    markets.filter((market) => used.has(market.slug)),
    "Market",
  );
}

export function researchThemeFilterGroup(
  programmes: ResearchProgramme[],
): FilterGroup {
  return {
    id: "theme",
    label: "Research theme",
    options: uniqueSorted(programmes.map((programme) => programme.theme)).map(
      (theme) => ({ value: theme, label: theme }),
    ),
  };
}

export function trainingFormatFilterGroup(courses: TrainingCourse[]): FilterGroup {
  return {
    id: "format",
    label: "How it is taught",
    options: uniqueSorted(courses.map((course) => course.format)).map((format) => ({
      value: format,
      label: format,
    })),
  };
}

export function trainingLevelFilterGroup(courses: TrainingCourse[]): FilterGroup {
  return {
    id: "level",
    label: "Level",
    options: uniqueSorted(courses.map((course) => course.level)).map((level) => ({
      value: level,
      label: level,
    })),
  };
}

export function articleCategoryFilterGroup(articles: Article[]): FilterGroup {
  return {
    id: "category",
    label: "Category",
    options: uniqueSorted(articles.map((article) => article.category)).map(
      (category) => ({ value: category, label: category }),
    ),
  };
}
