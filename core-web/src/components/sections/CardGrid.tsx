import {
  ContentCard,
  type CardRatio,
  type CardVariant,
} from "@/components/ui/ContentCard";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils/cn";
import type { CardItem } from "@sdrs/shared/types/content";

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

export interface CardGridProps {
  items: CardItem[];
  columns?: keyof typeof columnClasses;
  variant?: CardVariant;
  ratio?: CardRatio;
  /** Renders the first card larger, spanning two columns. */
  leadFeature?: boolean;
  /** Eagerly loads the first row's images. */
  priorityCount?: number;
  /** Shown instead of the grid when `items` is empty. */
  emptyMessage?: string;
  className?: string;
}

/** Responsive grid of `ContentCard`s, with staggered reveal on scroll. */
export function CardGrid({
  items,
  columns = 3,
  variant = "stacked",
  ratio = "landscape",
  leadFeature = false,
  priorityCount = 0,
  emptyMessage = "Nothing matches your selection yet.",
  className,
}: CardGridProps) {
  if (items.length === 0) {
    return (
      <p className="border border-dashed border-ink-200 px-6 py-16 text-center text-ink-500">
        {emptyMessage}
      </p>
    );
  }

  const isList = variant === "minimal";

  return (
    <div
      className={cn(
        isList ? "flex flex-col" : cn("grid gap-x-8 gap-y-12", columnClasses[columns]),
        className,
      )}
    >
      {items.map((item, index) => {
        const isLead = leadFeature && index === 0;

        return (
          <Reveal
            key={item.id}
            // Stagger only the first row; longer delays feel sluggish on scroll.
            delay={Math.min(index, 3) * 80}
            className={cn(
              isLead && !isList && columns > 1 && "md:col-span-2",
              !isList && "flex",
            )}
          >
            <ContentCard
              item={item}
              variant={variant}
              ratio={isLead ? "wide" : ratio}
              featured={isLead}
              priority={index < priorityCount}
              className={isList ? undefined : "w-full"}
            />
          </Reveal>
        );
      })}
    </div>
  );
}
