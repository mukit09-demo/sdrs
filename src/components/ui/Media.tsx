import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { gradientFor, idFor, ratioFor } from "@/lib/utils/placeholder";
import type { MediaImage } from "@/types/content";

/** Frame shapes shared by `Media` and `Video`, so both crop to the same scale. */
export const mediaRatios = {
  square: "aspect-square",
  landscape: "aspect-4/3",
  wide: "aspect-16/9",
  portrait: "aspect-3/4",
  panorama: "aspect-21/9",
} as const;

export type MediaRatio = keyof typeof mediaRatios;

export interface MediaProps {
  image: MediaImage;
  ratio?: MediaRatio;
  /** Fills its positioned parent instead of setting an aspect ratio. */
  fill?: boolean;
  /** `sizes` hint for the browser; only matters when a real URL is present. */
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Darkens the image so overlaid text stays legible. */
  overlay?: boolean;
}

/**
 * The single image component.
 *
 * Renders `next/image` when the content layer supplies a URL, and a
 * deterministic gradient otherwise — so the dummy data still produces
 * image-led layouts, and switching to real photography needs no UI change.
 */
export function Media({
  image,
  ratio = "landscape",
  fill = false,
  sizes = "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw",
  priority = false,
  className,
  overlay = false,
}: MediaProps) {
  const seed = image.seed ?? image.alt;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-ink-100",
        fill ? "absolute inset-0" : mediaRatios[ratio],
        className,
      )}
    >
      {image.url ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
      ) : (
        <Placeholder seed={seed} alt={image.alt} />
      )}

      {overlay && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/25 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/**
 * Gradient stand-in for missing photography. `role="img"` with a label keeps it
 * meaningful to assistive tech; the decorative arcs are hidden from it.
 */
function Placeholder({ seed, alt }: { seed: string; alt: string }) {
  const offset = ratioFor(seed);
  const gradientId = idFor(seed, "fade");

  return (
    <div
      role="img"
      aria-label={alt}
      className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
      style={{ backgroundImage: gradientFor(seed) }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full opacity-25"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle
          cx={20 + offset * 60}
          cy={15 + offset * 30}
          r={38}
          fill={`url(#${gradientId})`}
        />
        <path
          d={`M0 ${70 + offset * 20} Q 30 ${45 + offset * 25}, 60 ${
            68 + offset * 15
          } T 100 ${55 + offset * 20} V100 H0 Z`}
          fill="white"
          fillOpacity="0.14"
        />
        <path
          d={`M0 ${85 - offset * 10} Q 40 ${60 + offset * 20}, 100 ${78 - offset * 12}`}
          stroke="white"
          strokeOpacity="0.25"
          strokeWidth="0.4"
          fill="none"
        />
      </svg>
    </div>
  );
}
