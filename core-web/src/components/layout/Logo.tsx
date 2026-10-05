import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
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

/** Red on its own, or flattened to white for a dark or brand-coloured band. */
export type WordmarkTone = "brand" | "inverse";

export interface InlineWordmarkProps {
  tone?: WordmarkTone;
  className?: string;
}

/**
 * The wordmark set inside a line of copy, standing in for the name written out.
 * It is sized in `em` so it tracks whatever type it lands in, and the asset is
 * cropped to the letterforms, so an `inline-block` sits its baseline on the
 * text's own — no nudging per call site.
 */
export function InlineWordmark({
  tone = "brand",
  className,
}: InlineWordmarkProps) {
  return (
    <Image
      {...wordmark}
      alt={siteConfig.name}
      // Never wider than roughly 6× the cap height of body copy.
      sizes="160px"
      // Usually the first line of a hero, where lazy loading makes the mark the
      // LCP element and delays it. At this size it is a few KB, and the header
      // is already loading the same asset eagerly.
      loading="eager"
      className={cn(
        "inline-block h-[0.72em] w-auto align-baseline",
        // `brightness-0` flattens the red to black and `invert` lifts it to
        // white, both preserving the alpha, so the letterforms stay the ones in
        // the file and no second asset is needed.
        tone === "inverse" && "brightness-0 invert",
        className,
      )}
    />
  );
}

/**
 * Every mention of the name, including the ones that open a proper noun — "The
 * SDRS Journal" — because the mark stands in for the word wherever it is set,
 * not only where it stands alone.
 */
const brandName = /SDRS/g;

export interface BrandTextProps {
  /** Copy that may mention the practice by name. */
  children: string;
  tone?: WordmarkTone;
}

/**
 * Prose with the practice's name set as the wordmark. Wrap body copy in this
 * rather than reaching for `InlineWordmark` directly — the text stays a plain
 * string in the content layer, which is what the API will send.
 */
export function BrandText({ children, tone = "brand" }: BrandTextProps) {
  const parts = children.split(brandName);

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && <InlineWordmark tone={tone} />}
          {part}
        </Fragment>
      ))}
    </>
  );
}
