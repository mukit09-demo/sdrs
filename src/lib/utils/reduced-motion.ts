"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** Nothing is animating during the server render, so motion is the safe answer. */
function getServerSnapshot() {
  return false;
}

/**
 * Whether the visitor has asked the OS to reduce motion.
 *
 * A subscription rather than a one-off read in an effect: the setting can change
 * while the page is open, and `useSyncExternalStore` keeps the render consistent
 * through hydration instead of flipping state on the first commit.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
