export function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** 0 (no similarity) to 1 (identical after normalizing case/punctuation/whitespace). */
export function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 0;
  return 1 - levenshtein(na, nb) / maxLen;
}

export interface MergeSuggestion<T> {
  source: T;
  target: T;
  score: number;
}

/**
 * Pairwise-compares every item by label and returns likely-duplicate pairs
 * above `threshold`, sorted by best match first. The longer label becomes
 * the target (kept), the shorter the source (archived on merge).
 */
export function findMergeSuggestions<T>(
  items: T[],
  getLabel: (item: T) => string,
  threshold = 0.72
): MergeSuggestion<T>[] {
  const suggestions: MergeSuggestion<T>[] = [];
  for (let i = 0; i < items.length; i++) {
    const labelA = getLabel(items[i]);
    for (let j = i + 1; j < items.length; j++) {
      const labelB = getLabel(items[j]);
      const score = similarity(labelA, labelB);
      if (score >= threshold) {
        const [target, source] = labelA.length >= labelB.length ? [items[i], items[j]] : [items[j], items[i]];
        suggestions.push({ source, target, score });
      }
    }
  }
  return suggestions.sort((a, b) => b.score - a.score);
}

/**
 * Like findMergeSuggestions, but only compares items that share the same
 * group (e.g. department) and whose match key is identical once
 * normalized (e.g. course number). Use this when label-only fuzzy
 * matching is too loose — e.g. course numbers are short enough that
 * "532" and "533" look like a near-match by edit distance despite being
 * unrelated courses. The label similarity score is still computed, for
 * sorting and display, but doesn't gate inclusion.
 */
export function findGroupedMergeSuggestions<T>(
  items: T[],
  getGroupKey: (item: T) => string,
  getMatchKey: (item: T) => string,
  getLabel: (item: T) => string
): MergeSuggestion<T>[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = getGroupKey(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }

  const suggestions: MergeSuggestion<T>[] = [];
  for (const group of groups.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i];
        const b = group[j];
        if (normalize(getMatchKey(a)) !== normalize(getMatchKey(b))) continue;

        const labelA = getLabel(a);
        const labelB = getLabel(b);
        const score = similarity(labelA, labelB);
        const [target, source] = labelA.length >= labelB.length ? [a, b] : [b, a];
        suggestions.push({ source, target, score });
      }
    }
  }
  return suggestions.sort((a, b) => b.score - a.score);
}
