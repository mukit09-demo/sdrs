import type { ReactNode } from "react";
import { BrandText } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  /** Optional trailing action, right-aligned on wide screens. */
  action?: { label: string; href: string };
  /**
   * A control belonging to the band below, placed on the description's row.
   * Supplying it lifts `action` up to sit beside the heading instead.
   */
  aside?: ReactNode;
  tone?: "light" | "dark";
  /** Heading level — pick to keep the page outline correct. */
  as?: "h1" | "h2" | "h3";
  className?: string;
}

/** Eyebrow, heading, supporting copy and an optional action, in one block. */
export function SectionHeader({
  title,
  eyebrow,
  description,
  action,
  aside,
  tone = "light",
  as: Heading = "h2",
  className,
}: SectionHeaderProps) {
  const isDark = tone === "dark";

  const eyebrowClass = cn(
    "text-xs font-medium tracking-widest uppercase",
    isDark ? "text-brand-300" : "text-brand-600",
  );
  const headingClass = cn(
    "text-3xl leading-[1.08] font-medium md:text-4xl lg:text-5xl",
    isDark ? "text-white" : "text-ink-900",
  );
  const descriptionClass = cn(
    "text-lg leading-relaxed",
    isDark ? "text-white/70" : "text-ink-600",
  );
  const actionButton = action ? (
    <Button
      href={action.href}
      variant={isDark ? "inverse" : "secondary"}
      icon="arrow"
      className="shrink-0 self-start md:self-auto"
    >
      {action.label}
    </Button>
  ) : null;

  // With an aside there are two things to place on the right, so each one pairs
  // with the line it belongs to: the action with the heading, the control with
  // the copy. One column of text and one of controls reads as a grid rather
  // than as two buttons stacked in a corner.
  if (aside) {
    const row = "flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10";

    return (
      <div className={className}>
        {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}

        <div className={cn("mt-3", row)}>
          <Heading className={cn(headingClass, "max-w-3xl")}>
            <BrandText tone={isDark ? "inverse" : "brand"}>{title}</BrandText>
          </Heading>
          {actionButton}
        </div>

        <div className={cn("mt-5", row)}>
          {description && (
            <p className={cn(descriptionClass, "max-w-3xl")}>
              <BrandText tone={isDark ? "inverse" : "brand"}>
                {description}
              </BrandText>
            </p>
          )}
          <div className="shrink-0 self-start md:self-auto">{aside}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}
        <Heading className={cn("mt-3", headingClass)}>
          <BrandText tone={isDark ? "inverse" : "brand"}>{title}</BrandText>
        </Heading>
        {description && (
          <p className={cn("mt-5", descriptionClass)}>
            <BrandText tone={isDark ? "inverse" : "brand"}>
              {description}
            </BrandText>
          </p>
        )}
      </div>

      {actionButton}
    </div>
  );
}
