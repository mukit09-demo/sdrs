import { Container } from "@/components/ui/Container";
import { Video } from "@/components/ui/Video";
import type { MediaVideo } from "@/types/content";

export interface FilmBandProps {
  video: MediaVideo;
  /** One line under the film, saying what it shows. */
  caption?: string;
}

/**
 * The film that follows a dark `PageHero`.
 *
 * Carries no top padding and the same `bg-ink-950` as the hero, so the statement
 * and the film read as a single opening band — and runs to the wide container,
 * so the film is broader than the heading's measure.
 */
export function FilmBand({ video, caption }: FilmBandProps) {
  return (
    <section className="bg-ink-950 pb-14 text-white md:pb-16 lg:pb-20">
      <Container width="wide">
        <Video video={video} ratio="panorama" />

        {caption && (
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/65">
            {caption}
          </p>
        )}
      </Container>
    </section>
  );
}
