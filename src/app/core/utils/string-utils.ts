/**
 * Compare two strings alphabetically using locale-aware ordering.
 * Use as a comparator for Array.prototype.sort when sorting strings.
 */
export function compareByLocale(a: string, b: string): number {
  return a.localeCompare(b);
}
