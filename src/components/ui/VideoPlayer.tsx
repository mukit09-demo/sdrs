"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  PauseIcon,
  PlayIcon,
  SoundOffIcon,
  SoundOnIcon,
} from "@/components/ui/Icon";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/utils/cn";
import type { MediaVideo } from "@/types/content";

export interface VideoPlayerProps {
  /** `url` is required: `Video` decides which treatment a film gets. */
  video: MediaVideo & { url: string };
  /** Starts the film muted on load, like a title sequence. */
  autoPlay?: boolean;
  className?: string;
}

/**
 * Self-hosted player for `Video`. A client component because the controls are
 * ours rather than the browser's — the native control bar is too heavy over a
 * full-width film, and hiding it means we have to drive playback ourselves.
 */
export function VideoPlayer({
  video,
  autoPlay = true,
  className,
}: VideoPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);
  // Driven by the element's own events, so the icons follow what is actually
  // happening rather than what we asked for.
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Set as a property, not an attribute: React can drop `muted` during
    // hydration, and no browser autoplays a film with sound.
    element.muted = true;

    if (!autoPlay) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Autoplay is a request, not a guarantee. A refusal (data saver, low
    // battery) simply leaves the poster and the play button in place.
    void element.play().catch(() => undefined);
  }, [autoPlay]);

  function togglePlayback() {
    const element = ref.current;
    if (!element) return;

    if (element.paused) {
      void element.play().catch(() => undefined);
    } else {
      element.pause();
    }
  }

  function toggleSound() {
    const element = ref.current;
    if (!element) return;
    element.muted = !element.muted;
  }

  return (
    <div className={cn("relative isolate overflow-hidden bg-ink-900", className)}>
      {/* No poster image yet: the gradient stand-in sits behind the film, so the
          band is never a black rectangle while the first frame loads. */}
      {!video.poster.url && <Media image={video.poster} fill sizes="100vw" />}

      <video
        ref={ref}
        src={video.url}
        poster={video.poster.url}
        aria-label={video.alt}
        loop
        muted
        playsInline
        preload={autoPlay ? "metadata" : "none"}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
        className="absolute inset-0 size-full object-cover"
      >
        {video.captionsUrl && (
          <track
            src={video.captionsUrl}
            kind="captions"
            srcLang="en"
            label="English"
            default
          />
        )}
      </video>

      <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 p-4 md:p-6">
        <ControlButton
          label={isPlaying ? "Pause film" : "Play film"}
          onClick={togglePlayback}
        >
          {isPlaying ? (
            <PauseIcon className="size-5" />
          ) : (
            <PlayIcon className="size-5" />
          )}
        </ControlButton>

        <ControlButton
          label={isMuted ? "Unmute film" : "Mute film"}
          onClick={toggleSound}
        >
          {isMuted ? (
            <SoundOffIcon className="size-5" />
          ) : (
            <SoundOnIcon className="size-5" />
          )}
        </ControlButton>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid size-11 place-items-center border border-white/25 bg-ink-950/55 text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-ink-950/80"
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}
