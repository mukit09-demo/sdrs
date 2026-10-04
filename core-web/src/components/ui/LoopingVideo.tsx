"use client";

import { useEffect, useRef } from "react";
import { useFilmPlayback } from "@/components/ui/FilmPlayback";
import { Media, mediaRatios, type MediaRatio } from "@/components/ui/Media";
import { cn } from "@/lib/utils/cn";
import type { MediaVideo } from "@sdrs/shared/types/content";

export interface LoopingVideoProps {
  video: MediaVideo;
  ratio?: MediaRatio;
  /** Overrides the shared playback state — pass it only for a film that is
   *  genuinely on its own. */
  play?: boolean;
  /** Darkens the film so text can sit over it, as `Media` does. */
  overlay?: boolean;
  className?: string;
}

/**
 * A silent film that loops with no controls of its own.
 *
 * `VideoPlayer` is the wrong tool for a grid: its control bar is sized for a
 * full-width band, and several of them on one page would each want their own.
 * This takes its play state from the nearest `FilmPlaybackProvider`, so one
 * control governs the whole set — and only decodes while it is actually on
 * screen, so a page of films costs about as much as the two or three in view.
 */
export function LoopingVideo({
  video,
  ratio = "wide",
  play,
  overlay = false,
  className,
}: LoopingVideoProps) {
  const playback = useFilmPlayback();
  const shouldPlay = play ?? playback?.isPlaying ?? true;

  const ref = useRef<HTMLVideoElement>(null);
  // Tracked separately from `play` so leaving the viewport pauses the film
  // without losing the fact that it is meant to be running.
  const isVisible = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // A property, not an attribute: React can drop `muted` during hydration.
    element.muted = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (entry.isIntersecting && shouldPlay) {
          // Autoplay is a request, not a guarantee. A refusal just leaves the
          // poster gradient in place, which is a legitimate resting state.
          void element.play().catch(() => undefined);
        } else {
          element.pause();
        }
      },
      // Start fetching just before the tile arrives, so it is moving by the
      // time it is worth looking at.
      { rootMargin: "200px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldPlay]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (shouldPlay && isVisible.current) {
      void element.play().catch(() => undefined);
    } else {
      element.pause();
    }
  }, [shouldPlay]);

  // No footage: the poster carries the tile on its own.
  if (!video.url) {
    return (
      <Media
        image={video.poster}
        ratio={ratio}
        overlay={overlay}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-ink-900",
        mediaRatios[ratio],
        className,
      )}
    >
      {/* The same gradient the still placeholder uses, so the tile is never a
          black rectangle while the first frame loads. */}
      {!video.poster.url && (
        <Media
          image={video.poster}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
      )}

      <video
        ref={ref}
        src={video.url}
        poster={video.poster.url}
        aria-label={video.alt}
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
      />

      {overlay && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/25 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
