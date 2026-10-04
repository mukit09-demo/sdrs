import { cn } from "@/lib/utils/cn";

export interface QuoteBlockProps {
  quote: string;
  attribution: string;
  /** Secondary line under the attribution, e.g. a role or location. */
  detail?: string;
  tone?: "light" | "dark";
  className?: string;
}

/** Pull quote as a proper `<blockquote>` with a `<figcaption>` attribution. */
export function QuoteBlock({
  quote,
  attribution,
  detail,
  tone = "light",
  className,
}: QuoteBlockProps) {
  const isDark = tone === "dark";

  return (
    <figure className={cn("max-w-4xl", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "font-display block text-6xl leading-none",
          isDark ? "text-brand-400" : "text-brand-500",
        )}
      >
        &ldquo;
      </span>
      <blockquote
        className={cn(
          "font-display mt-2 text-2xl leading-snug font-medium md:text-3xl lg:text-4xl",
          isDark ? "text-white" : "text-ink-900",
        )}
      >
        {quote}
      </blockquote>
      <figcaption
        className={cn("mt-6 text-sm", isDark ? "text-white/60" : "text-ink-500")}
      >
        <span className={isDark ? "text-white" : "text-ink-900"}>{attribution}</span>
        {detail && <span className="block">{detail}</span>}
      </figcaption>
    </figure>
  );
}
