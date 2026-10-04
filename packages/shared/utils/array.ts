/** De-duplicates and alphabetises strings — used to derive filter options. */
export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

/** Groups items by a derived key, preserving insertion order within a group. */
export function groupBy<T, K extends string>(
  items: T[],
  getKey: (item: T) => K,
): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = getKey(item);
    const existing = groups.get(key);
    if (existing) existing.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}
