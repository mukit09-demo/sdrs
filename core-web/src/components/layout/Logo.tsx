import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/config/routes";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

/**
 * The wordmark asset and its intrinsic size, shared by everywhere it is set —
 * the header below, and the footer strapline, which opens with it in place of
 * the practice's name. Each caller brings its own `alt`, `sizes` and colour,
 * because those genuinely differ; only the file and its proportions are common.
 */
export const wordmark = {
  src: "/sdrs-wordmark.png",
  width: 922,
  height: 160,
} as const;

export interface LogoProps {
  className?: string;
}

/**
 * The SDRS logotype, lifted from the brand badge in `public/sdrs-logo.png` so
 * the letterforms are the real ones rather than a typeset approximation. The
 * mark is red on transparent, which reads on both light and dark bands.
 *
 * The mark stands on its own — the full legal name is carried by the document
 * title and by the footer strapline, not set beneath it here.
 */
export function Logo({ className }: LogoProps) {
  return (
    <Link
      href={routes.home}
      className={cn(
        "inline-flex items-center transition-opacity hover:opacity-80",
        className,
      )}
    >
      <Image
        {...wordmark}
        alt={siteConfig.name}
        // Rendered at h-7/h-8, so ~161–184px wide. Without this hint Next would
        // serve a 1080w variant of a logo that is never wider than 184px.
        sizes="(min-width: 640px) 184px, 161px"
        // Always in the header, above the fold.
        loading="eager"
        className="h-7 w-auto sm:h-8"
      />
      <span className="sr-only">home</span>
    </Link>
  );
}
