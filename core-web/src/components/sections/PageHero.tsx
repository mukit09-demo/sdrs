import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/sections/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils/cn";
import type { MediaImage } from "@sdrs/shared/types/content";

export interface PageHeroProps {
  title: string;
  eyebrow?: string;
  /** Lead paragraph under the heading. */
  intro?: string;
  /** Background image. Omit for the compact text-only treatment. */
  image?: MediaImage;
  crumbs?: Crumb[];
  /** Small labels above the heading, e.g. markets a project belongs to. */
  tags?: string[];
  actions?: { label: string; href: string }[];
  /** `full` for landing pages, `compact` for detail pages. */
  size?: "full" | "compact";
  /** Extra content below the intro — stats, meta lists. */
  children?: ReactNode;
}

/**
 * The hero used by every page. With an `image` it renders light-on-dark over
 * artwork; without one it renders a text-only band. Keeping both cases here
 * means each page declares content, not layout.
 */
export function PageHero({
  title,
  eyebrow,
  intro,
  image,
  crumbs,
  tags,
  actions,
  size = "full",
  children,
}: PageHeroProps) {
  const hasImage = Boolean(image);
  const hasCrumbs = Boolean(crumbs && crumbs.length > 0);
  const hasTags = Boolean(tags && tags.length > 0);

  // The heading only needs a top margin when something is rendered above it —
  // otherwise it sits directly on the band's own padding.
  const headingMargin = eyebrow ? "mt-4" : hasCrumbs || hasTags ? "mt-6" : "";

  return (
    <header
      className={cn(
        "relative isolate overflow-hidden",
        hasImage ? "bg-ink-950 text-white" : "border-b border-ink-200 bg-white",
      )}
    >
      {image && (
        <>
          <Media image={image} fill priority sizes="100vw" />
          <div
            className="absolute inset-0 bg-gradient-to-b from-ink-950/85 via-ink-950/65 to-ink-950/90"
            aria-hidden="true"
          />
        </>
      )}

      <Container
        className={cn(
          "relative",
          // The sticky header stays in flow, so the band already starts below it
          // — this padding is the hero's own rhythm, nothing more. Anything
          // larger reads as an empty strip above the first line.
          size === "full"
            ? "pt-12 pb-14 md:pt-14 md:pb-16 lg:pt-16 lg:pb-20"
            : "pt-8 pb-10 md:pt-10 md:pb-12 lg:pt-12 lg:pb-14",
        )}
      >
        {crumbs && crumbs.length > 0 && (
          <Breadcrumbs crumbs={crumbs} tone={hasImage ? "dark" : "light"} />
        )}

        {tags && tags.length > 0 && (
          <div className={cn("flex flex-wrap gap-2", hasCrumbs && "mt-6")}>
            {tags.map((tag) => (
              <Tag key={tag} tone={hasImage ? "inverse" : "default"}>
                {tag}
              </Tag>
            ))}
          </div>
        )}

        {eyebrow && (
          <p
            className={cn(
              "text-xs font-medium tracking-widest uppercase",
              (hasCrumbs || hasTags) && "mt-6",
              hasImage ? "text-brand-300" : "text-brand-600",
            )}
          >
            {eyebrow}
          </p>
        )}

        <h1
          className={cn(
            headingMargin,
            "max-w-4xl font-medium tracking-tight",
            size === "full"
              ? "text-4xl leading-[1.03] md:text-6xl lg:text-7xl"
              : "text-3xl leading-[1.06] md:text-5xl",
          )}
        >
          {title}
        </h1>

        {intro && (
          <p
            className={cn(
              "mt-6 max-w-2xl text-lg leading-relaxed md:text-xl",
              hasImage ? "text-white/80" : "text-ink-600",
            )}
          >
            {intro}
          </p>
        )}

        {actions && actions.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-4">
            {actions.map((action, index) => (
              <Button
                key={action.href}
                href={action.href}
                icon="arrow"
                size="lg"
                variant={
                  index === 0 ? "primary" : hasImage ? "inverse" : "secondary"
                }
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {children && <div className="mt-12">{children}</div>}
      </Container>
    </header>
  );
}
