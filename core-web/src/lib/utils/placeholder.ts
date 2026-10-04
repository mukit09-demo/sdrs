/**
 * Deterministic gradient placeholders.
 *
 * The dummy content has no real photography, but the layouts are image-led. A
 * stable hash of each item's seed picks a gradient, so every card looks
 * intentional and never changes between server render and hydration. Once the
 * backend returns `MediaImage.url`, these are simply not used.
 */

const GRADIENTS = [
  "linear-gradient(135deg, #0f2d3d 0%, #1d5f70 55%, #4aa39b 100%)",
  "linear-gradient(135deg, #2a1b3d 0%, #44318d 55%, #8265a7 100%)",
  "linear-gradient(135deg, #3a1214 0%, #a10b0b 60%, #e40303 100%)",
  "linear-gradient(135deg, #10212f 0%, #2d4a6b 55%, #7ea8c4 100%)",
  "linear-gradient(135deg, #1c2b16 0%, #3f6212 55%, #8bad4f 100%)",
  "linear-gradient(135deg, #2e1f0b 0%, #855c1b 55%, #d9a441 100%)",
  "linear-gradient(135deg, #14181f 0%, #414a57 55%, #8c96a4 100%)",
  "linear-gradient(135deg, #0b2b2b 0%, #0f5f5c 55%, #57b8a9 100%)",
  "linear-gradient(135deg, #2b0f24 0%, #7a1f5c 55%, #c46fa1 100%)",
  "linear-gradient(135deg, #171c23 0%, #1f3a5f 55%, #3f8fbf 100%)",
] as const;

/** FNV-1a — small, fast and stable across environments. */
function hash(seed: string): number {
  let value = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    value ^= seed.charCodeAt(i);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

export function gradientFor(seed: string): string {
  return GRADIENTS[hash(seed) % GRADIENTS.length];
}

/** Stable 0–1 value from a seed, for varying placeholder detail. */
export function ratioFor(seed: string): number {
  return (hash(`${seed}-ratio`) % 1000) / 1000;
}

/**
 * Stable, DOM-safe id derived from a seed. Seeds are alt text, which contains
 * spaces and punctuation that cannot appear in an SVG `url(#id)` reference.
 */
export function idFor(seed: string, prefix: string): string {
  return `${prefix}-${hash(seed).toString(36)}`;
}
