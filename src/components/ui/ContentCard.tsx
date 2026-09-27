import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/Icon";
import { LoopingVideo } from "@/components/ui/LoopingVideo";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/utils/cn";
import type { CardItem } from "@/types/content";

export type CardVariant =
  /** Image above, text below. The workhorse for grids. */
  | "stacked"
  /** Text overlaid on a darkened image. For features and hero rows. */
  | "overlay"
  /** Text only, separated by rules. For dense lists. */
  | "minimal";

/** Image aspect ratios a card may use — mirrors the `Media` ratios. */
export type CardRatio = "square" | "landscape" | "wide" | "portrait" | "panorama";

export interface ContentCardProps {
  item: CardItem;
  variant?: CardVariant;
  /** Image aspect ratio; ignored by the `minimal` variant. */
  ratio?: CardRatio;
  /** Eagerly loads the image — set on above-the-fold cards only. */
  priority?: boolean;
  /** Renders the title one level larger, for the lead item in a grid. */
  featured?: boolean;
  className?: string;
}

/**
 * Renders any `CardItem`, whatever entity it came from. Mappers in
 * `src/lib/content/mappers.ts` do the translation, so this is the only card
 * component in the app.
 */
export function ContentCard({
  item,
  variant = "stacked",
  ratio = "landscape",
  priority = false,
  featured = false,
  className,
}: ContentCardProps) {
  if (variant === "minimal") {
    return (
      <Link
        href={item.href}
        className={cn(
          "group flex items-start justify-between gap-6 border-t border-ink-200 py-6",
          "transition-colors hover:border-ink-900",
          className,
        )}
      >
        <div className="min-w-0">
          {item.eyebrow && (
            <p className="text-xs font-medium tracking-widest text-brand-600 uppercase">
              {item.eyebrow}
            </p>
          )}
          <h3
            className={cn(
              "mt-2 font-medium text-ink-900",
              featured ? "text-2xl md:text-3xl" : "text-lg md:text-xl",
            )}
          >
            {item.title}
          </h3>
          {item.summary && (
            <p className="mt-2 max-w-2xl text-sm text-ink-600">{item.summary}</p>
          )}
          <CardMeta meta={item.meta} />
        </div>
        <ArrowRightIcon className="mt-1 size-5 shrink-0 text-ink-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand-600" />
      </Link>
    );
  }

  if (variant === "overlay") {
    return (
      <Link
        href={item.href}
        className={cn("group relative block overflow-hidden", className)}
      >
        <CardFrame
          item={item}
          ratio={ratio}
          priority={priority}
          overlay
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          {item.eyebrow && (
            <p className="text-xs font-medium tracking-widest text-white/80 uppercase">
              {item.eyebrow}
            </p>
          )}
          <h3
            className={cn(
              "mt-2 font-medium text-white",
              featured ? "text-3xl md:text-4xl" : "text-xl md:text-2xl",
            )}
          >
            {item.title}
          </h3>
          {item.summary && (
            <p className="mt-3 max-w-xl text-sm text-white/85 md:text-base">
              {item.summary}
            </p>
          )}
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white">
            Read more
            <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={item.href} className={cn("group flex flex-col", className)}>
      <CardFrame
        item={item}
        ratio={ratio}
        priority={priority}
        sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
      />
      <div className="flex flex-1 flex-col pt-5">
        {item.eyebrow && (
          <p className="text-xs font-medium tracking-widest text-brand-600 uppercase">
            {item.eyebrow}
          </p>
        )}
        <h3
          className={cn(
            "mt-2 font-medium text-ink-900 transition-colors group-hover:text-brand-600",
            featured ? "text-2xl md:text-3xl" : "text-lg md:text-xl",
          )}
        >
          {item.title}
        </h3>
        {item.summary && (
          <p className="mt-3 text-sm leading-relaxed text-ink-600">{item.summary}</p>
        )}
        <CardMeta meta={item.meta} />
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink-900">
          Read more
          <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

/**
 * The card's image frame — a film if the item has one, the still otherwise.
 *
 * Both crop to the same `mediaRatios` box, so a grid mixing moving and still
 * cards stays on one baseline. `LoopingVideo` takes its play state from the
 * page's `FilmPlaybackProvider`, which is why nothing has to be threaded
 * through `CardGrid`.
 */
function CardFrame({
  item,
  ratio,
  priority,
  sizes,
  overlay = false,
}: {
  item: CardItem;
  ratio: CardRatio;
  priority: boolean;
  sizes: string;
  overlay?: boolean;
}) {
  if (item.video) {
    return <LoopingVideo video={item.video} ratio={ratio} overlay={overlay} />;
  }

  return (
    <Media
      image={item.image}
      ratio={ratio}
      priority={priority}
      overlay={overlay}
      sizes={sizes}
    />
  );
}

function CardMeta({ meta }: { meta?: string[] }) {
  if (!meta?.length) return null;

  return (
    <p className="mt-3 text-xs text-ink-500">
      {meta.map((entry, index) => (
        <span key={entry}>
          {index > 0 && <span aria-hidden="true"> · </span>}
          {entry}
        </span>
      ))}
    </p>
  );
}
