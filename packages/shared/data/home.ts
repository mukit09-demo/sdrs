import type { HomeContent } from "../types/content";

/**
 * Home page content.
 *
 * The film is the only asset-bearing field. There is no real footage yet, so it
 * points at `public/video/studio-placeholder.webm`: a silent twelve-second loop
 * of drafting linework panning over the gradient the still placeholders use,
 * which keeps the band honest about having no film while still exercising the
 * player. To swap in a real one, drop the file in `public/video/` and change
 * `url`. Drop `url` entirely and the band falls back to the poster still.
 */
export const homeContent: HomeContent = {
  film: {
    url: "/video/studio-placeholder.webm",
    alt: "Film introducing SDRS: the studio, its people and its projects",
    poster: {
      alt: "Model-making bench in the SDRS studio",
      // Seed chosen for its gradient: the graphite ramp sits quietly under the
      // dark hero, and the placeholder loop opens on the same frame.
      seed: "home-showreel",
    },
  },
};
