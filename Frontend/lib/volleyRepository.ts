// Live data from VolleyAdmin (standings + match calendar) for a team page.
//
// Fetch strategy:
//   - Development: go through the internal Next.js proxy routes (/api/proxy-*),
//     which dodge CORS cleanly while running `next dev`.
//   - Production: the deployed site does not serve those API routes, so fetch
//     through a public CORS proxy (allorigins) straight from the browser.
// Both paths return the same raw VolleyAdmin XML, parsed identically below.

import type { VolleyMatch, VolleyRankingRow } from "@/types";

export type { VolleyMatch, VolleyRankingRow };

const DEFAULT_CLUB_ID = "L-0759";
const IS_DEV = process.env.NODE_ENV !== "production";

const cleanTeamName = (name = ""): string => name.replaceAll(/[+-]/g, "").trim();

const isHamTeam = (name = ""): boolean => {
  const lower = name.toLowerCase();
  return lower.includes("ham") || lower.includes("fit");
};

const toTimestamp = (datum: string, aanvangsuur: string): number => {
  if (!datum) return 0;
  const [day, month, year] = datum.split("/");
  const time = aanvangsuur || "00:00";
  const date = new Date(`${year}-${month}-${day}T${time}`);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

// --- XML helpers (DOMParser in the browser, regex fallback otherwise) ---------

const tagValue = (block: string, tag: string): string => {
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const start = block.indexOf(open);
  const end = block.indexOf(close);
  return start === -1 || end === -1 ? "" : block.substring(start + open.length, end).trim();
};

const eachBlock = (xml: string, tag: string): string[] => {
  const blocks: string[] = [];
  const parts = xml.split(`<${tag}>`);
  for (let i = 1; i < parts.length; i++) {
    const end = parts[i].indexOf(`</${tag}>`);
    if (end !== -1) blocks.push(parts[i].substring(0, end));
  }
  return blocks;
};

const parseMatches = (xml: string): VolleyMatch[] =>
  eachBlock(xml, "wedstrijd").map((block) => {
    const datum = tagValue(block, "datum");
    const aanvangsuur = tagValue(block, "aanvangsuur");
    return {
      datum,
      aanvangsuur,
      reeks: tagValue(block, "reeks"),
      thuisploeg: cleanTeamName(tagValue(block, "thuisploeg")),
      bezoekersploeg: cleanTeamName(tagValue(block, "bezoekersploeg")),
      uitslag: tagValue(block, "uitslag"),
      sporthal: tagValue(block, "sporthal"),
      stamnummer_thuisclub: tagValue(block, "stamnummer_thuisclub"),
      stamnummer_bezoekersclub: tagValue(block, "stamnummer_bezoekersclub"),
      timestamp: toTimestamp(datum, aanvangsuur),
    };
  });

const parseRanking = (xml: string): VolleyRankingRow[] =>
  eachBlock(xml, "rangschikking").map((block) => {
    const ploegnaam = cleanTeamName(tagValue(block, "ploegnaam"));
    return {
      volgorde: tagValue(block, "volgorde"),
      ploegnaam,
      aantalGespeeldeWedstrijden: tagValue(block, "aantalGespeeldeWedstrijden"),
      aantalGewonnenSets: tagValue(block, "aantalGewonnenSets"),
      aantalVerlorenSets: tagValue(block, "aantalVerlorenSets"),
      puntentotaal: tagValue(block, "puntentotaal"),
      isHam: isHamTeam(ploegnaam),
    };
  });

// --- Fetching -----------------------------------------------------------------

const fetchXML = async (devProxyPath: string, upstreamUrl: string): Promise<string> => {
  const url = IS_DEV
    ? `${devProxyPath}&timestamp=${Date.now()}`
    : `https://api.allorigins.win/raw?url=${encodeURIComponent(upstreamUrl)}&timestamp=${Date.now()}`;

  const response = await fetch(url, { headers: { Accept: "text/xml, application/xml, */*" } });
  if (!response.ok) throw new Error(`Status ${response.status}`);
  return response.text();
};

/**
 * Mapping for a handful of series whose display code differs from the code
 * VolleyAdmin's standings endpoint expects (mirrors the kiosk).
 */
const mapSeriesForStandings = (reeks: string): string =>
  ({ "VDP2-B": "LDM1", "VDP4-B": "LDM2" } as Record<string, string>)[reeks] || reeks;

// --- Selecting & formatting the featured match --------------------------------

/** Monday 00:00 → Sunday 23:59:59.999 around `ref`, as epoch ms. */
const weekRange = (ref = new Date()): { start: number; end: number } => {
  const start = new Date(ref);
  const day = start.getDay(); // 0 = Sunday
  const daysToMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - daysToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start: start.getTime(), end: end.getTime() };
};

/**
 * Picks the match to feature on the team page:
 *   - a match in the current week (Mon–Sun): the first not-yet-played one, or
 *     the last if all have been played;
 *   - otherwise the next upcoming match;
 *   - otherwise the most recent past match.
 */
export const pickWeekMatch = (matches: VolleyMatch[]): VolleyMatch | null => {
  const dated = matches.filter((m) => m.timestamp > 0).sort((a, b) => a.timestamp - b.timestamp);
  if (dated.length === 0) return null;

  const { start, end } = weekRange();
  const thisWeek = dated.filter((m) => m.timestamp >= start && m.timestamp <= end);
  if (thisWeek.length > 0) {
    return thisWeek.find((m) => !m.uitslag.trim()) ?? thisWeek[thisWeek.length - 1];
  }

  const now = Date.now();
  return dated.find((m) => m.timestamp >= now) ?? dated[dated.length - 1];
};

/** True when the match falls in the current Mon–Sun week. */
export const isThisWeek = (match: VolleyMatch): boolean => {
  const { start, end } = weekRange();
  return match.timestamp >= start && match.timestamp <= end;
};

/** Home/away set score; "0" / "0" before the match is played. */
export const matchScore = (match: VolleyMatch): { home: string; away: string } => {
  const [home, away] = match.uitslag.split("-").map((p) => p.trim());
  return home && away ? { home, away } : { home: "0", away: "0" };
};

class VolleyRepository {
  /** Standings for a series, ordered as VolleyAdmin returns them. */
  async fetchRanking(reeks: string, clubId: string = DEFAULT_CLUB_ID): Promise<VolleyRankingRow[]> {
    if (!reeks) return [];
    const mapped = mapSeriesForStandings(reeks);
    try {
      const xml = await fetchXML(
        `/api/proxy-rangschikking?stamnummer=${encodeURIComponent(clubId)}&reeks=${encodeURIComponent(mapped)}`,
        `https://www.volleyadmin2.be/services/rangschikking_xml.php?stamnummer=${clubId}&reeks=${mapped}`
      );
      return parseRanking(xml);
    } catch (error) {
      console.error(`Failed to fetch ranking for ${reeks}:`, error);
      return [];
    }
  }

  /** All of a club's matches in a single series. */
  async fetchMatches(reeks: string, clubId: string = DEFAULT_CLUB_ID): Promise<VolleyMatch[]> {
    if (!reeks) return [];
    try {
      const xml = await fetchXML(
        `/api/proxy-matches?stamnummer=${encodeURIComponent(clubId)}`,
        `https://www.volleyadmin2.be/services/wedstrijden_xml.php?stamnummer=${clubId}`
      );
      return parseMatches(xml).filter((match) => match.reeks === reeks);
    } catch (error) {
      console.error(`Failed to fetch matches for ${clubId}:`, error);
      return [];
    }
  }
}

export { VolleyRepository, DEFAULT_CLUB_ID };
