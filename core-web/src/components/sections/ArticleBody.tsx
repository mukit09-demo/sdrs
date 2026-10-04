import { cn } from "@/lib/utils/cn";

export interface ArticleBodyProps {
  /** Paragraphs in order, as stored on `Article.body`. */
  paragraphs: string[];
  className?: string;
}

/**
 * Long-form body copy. Paragraphs arrive as a string array rather than HTML so
 * nothing needs `dangerouslySetInnerHTML` when the backend takes over; swap to a
 * rich-text renderer here if the CMS starts sending markup.
 */
export function ArticleBody({ paragraphs, className }: ArticleBodyProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className={cn(
            "leading-relaxed text-ink-700",
            index === 0 && "text-lg text-ink-800 md:text-xl",
          )}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
