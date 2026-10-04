"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { PauseIcon, PlayIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import { usePrefersReducedMotion } from "@/lib/utils/reduced-motion";

interface FilmPlayback {
  isPlaying: boolean;
  toggle: () => void;
}

const FilmPlaybackContext = createContext<FilmPlayback | null>(null);

/**
 * Play/pause state shared by every looping film beneath it.
 *
 * A context rather than a prop because the films on a filtered page sit under
 * `FilterableGrid` and `CardGrid`, neither of which should have to know that a
 * card might be moving. One control governs the set, which is also what keeps
 * indefinite looping acceptable: motion that autoplays needs a way to stop.
 */
export function FilmPlaybackProvider({ children }: { children: ReactNode }) {
  // The preference sets the starting position; an explicit choice overrides it,
  // so someone who reduces motion generally can still play these if they want.
  const prefersReducedMotion = usePrefersReducedMotion();
  const [choice, setChoice] = useState<boolean | null>(null);
  const isPlaying = choice ?? !prefersReducedMotion;

  return (
    <FilmPlaybackContext.Provider
      value={{ isPlaying, toggle: () => setChoice(!isPlaying) }}
    >
      {children}
    </FilmPlaybackContext.Provider>
  );
}

/** `null` outside a provider — a lone film just plays. */
export function useFilmPlayback() {
  return useContext(FilmPlaybackContext);
}

/** The one control for a set of films. Renders nothing outside a provider. */
export function FilmPlaybackToggle({ className }: { className?: string }) {
  const playback = useFilmPlayback();
  if (!playback) return null;

  const { isPlaying, toggle } = playback;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!isPlaying}
      className={cn(
        "inline-flex items-center gap-2 border border-ink-300 px-4 py-2 text-xs font-medium tracking-widest text-ink-600 uppercase transition-colors hover:border-ink-900 hover:text-ink-900",
        className,
      )}
    >
      {isPlaying ? (
        <PauseIcon className="size-4" />
      ) : (
        <PlayIcon className="size-4" />
      )}
      {isPlaying ? "Pause films" : "Play films"}
    </button>
  );
}
