import { Media, mediaRatios, type MediaRatio } from "@/components/ui/Media";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { cn } from "@/lib/utils/cn";
import type { MediaVideo } from "@sdrs/shared/types/content";

export interface VideoProps {
  video: MediaVideo;
  ratio?: MediaRatio;
  /** Starts the film muted on load. */
  autoPlay?: boolean;
  className?: string;
}

/**
 * The single video component, and the mirror of `Media`:
 *
 *   `url`    → the player, with our own controls
 *   no `url` → the poster, so the band keeps its shape until footage exists
 *
 * Because the frame is reserved in every case, adding a film later never moves
 * the rest of the page.
 */
export function Video({
  video,
  ratio = "wide",
  autoPlay = true,
  className,
}: VideoProps) {
  if (video.url) {
    return (
      <VideoPlayer
        video={{ ...video, url: video.url }}
        autoPlay={autoPlay}
        className={cn(mediaRatios[ratio], className)}
      />
    );
  }

  return <Media image={video.poster} ratio={ratio} className={className} />;
}
