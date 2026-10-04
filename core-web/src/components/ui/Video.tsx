import { Media, mediaRatios, type MediaRatio } from "@/components/ui/Media";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { cn } from "@/lib/utils/cn";
import type { MediaVideo } from "@sdrs/shared/types/content";

export interface VideoProps {
  video: MediaVideo;
  ratio?: MediaRatio;
  /** Starts a self-hosted film muted on load. Platform embeds decide for themselves. */
  autoPlay?: boolean;
  className?: string;
}

/**
 * The single video component, and the mirror of `Media`:
 *
 *   `url`      → the self-hosted player, with our own controls
 *   `embedUrl` → the platform's iframe player
 *   neither    → the poster, so the band keeps its shape until footage exists
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

  if (video.embedUrl) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-ink-900",
          mediaRatios[ratio],
          className,
        )}
      >
        <iframe
          src={video.embedUrl}
          title={video.alt}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }

  return <Media image={video.poster} ratio={ratio} className={className} />;
}
