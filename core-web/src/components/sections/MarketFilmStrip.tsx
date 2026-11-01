import Link from "next/link";
import {
  SectionHeader,
  type SectionHeaderProps,
} from "@/components/sections/SectionHeader";
import {
  FilmPlaybackProvider,
  FilmPlaybackToggle,
} from "@/components/ui/FilmPlayback";
import { LoopingVideo } from "@/components/ui/LoopingVideo";
import { routes } from "@/lib/config/routes";
import { marketFilm } from "@/lib/content/mappers";
import type { Market } from "@sdrs/shared/types/content";

export interface MarketFilmStripProps {
  markets: Market[];
  /** Band heading. Rendered here rather than by the page so the pause control
   *  can sit on the description's row and still drive the tiles. */
  header: Omit<SectionHeaderProps, "aside">;
}

/**
 * The market films as a strip of letterbox tiles, each linking to its market.
 *
 * One control governs the whole set rather than one per tile: films that loop
 * indefinitely need a way to stop them, and six pause buttons in a grid is
 * noise. Anyone who has asked for reduced motion gets the strip at rest, with
 * the same control to start it.
 */
export function MarketFilmStrip({ markets, header }: MarketFilmStripProps) {
  if (markets.length === 0) return null;

  return (
    <FilmPlaybackProvider>
      <SectionHeader {...header} aside={<FilmPlaybackToggle />} />

      <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((market) => (
          <li key={market.slug}>
            <Link href={routes.market(market.slug)} className="group block">
              <LoopingVideo video={marketFilm(market)} ratio="panorama" />
              <h3 className="mt-4 text-lg font-medium text-ink-900 transition-colors group-hover:text-brand-600">
                {market.name}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">
                {market.tagline}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </FilmPlaybackProvider>
  );
}
