import { searchableContent } from "@/data/searchData";
import type { SearchResult } from "@/types";

// Het zoekvenster in de header zoekt NIET in de database. Het doorzoekt de
// handgeschreven teksten in data/searchData.ts. Nieuwe tekst op de site is dus
// pas vindbaar als je ze daar ook toevoegt.

/** Vanaf hoeveel getypte letters we beginnen zoeken. */
export const MIN_QUERY_LENGTH = 2;

/**
 * Zoekt de term in alle stukjes tekst uit data/searchData.ts en geeft de
 * treffers terug, de meest relevante eerst (dat is: waar de term het vroegst in
 * de tekst voorkomt).
 */
export function searchSite(query: string): SearchResult[] {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  const needle = trimmed.toLowerCase();
  const results: SearchResult[] = [];

  for (const page of searchableContent) {
    for (const section of page.sections) {
      const haystack = `${section.title ?? ""} ${section.content}`.toLowerCase();
      const matchIndex = haystack.indexOf(needle);
      if (matchIndex === -1) continue;

      results.push({
        page: page.page,
        path: page.path,
        sectionTitle: section.title,
        snippet: createSnippet(section.content, trimmed),
        matchIndex,
      });
    }
  }

  return results.sort((first, second) => first.matchIndex - second.matchIndex);
}

/**
 * Knipt een stukje tekst rond de gevonden term uit, met "..." aan de kanten waar
 * er nog tekst voor of na staat.
 */
function createSnippet(text: string, query: string, contextLength = 60): string {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return `${text.substring(0, contextLength * 2)}...`;

  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + query.length + contextLength);

  let snippet = text.substring(start, end);
  if (start > 0) snippet = `...${snippet}`;
  if (end < text.length) snippet = `${snippet}...`;

  return snippet;
}

/**
 * Splitst een stukje tekst op de zoekterm, zodat de UI de treffers geel kan
 * markeren. De losse stukjes komen om beurt terug: gewone tekst, treffer,
 * gewone tekst, ...
 */
export function splitOnQuery(text: string, query: string): { text: string; isMatch: boolean }[] {
  if (!query.trim()) return [{ text, isMatch: false }];

  const lowerQuery = query.toLowerCase();
  // Speciale regex-tekens in de zoekterm onschadelijk maken.
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return text
    .split(new RegExp(`(${escaped})`, "gi"))
    .filter((part) => part !== "")
    .map((part) => ({ text: part, isMatch: part.toLowerCase() === lowerQuery }));
}
