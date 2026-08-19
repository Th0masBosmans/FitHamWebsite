// Haalt de rangschikking en de wedstrijdkalender op bij VolleyAdmin, de site van
// de volleybalbond. Dit is de enige gegevensbron die NIET van ons is: er komt
// geen Supabase of Cloudinary aan te pas en wij kunnen deze gegevens ook niet
// aanpassen.
//
// De browser mag VolleyAdmin niet rechtstreeks aanspreken, dus loopt alles via
// onze eigen tussenroutes /api/proxy-matches en /api/proxy-rangschikking. Die
// geven de gegevens onbewerkt door; het uitlezen gebeurt hieronder.
//
// Wordt gebruikt door de teampagina (pages/public/TeamDetailContent) voor de
// wedstrijdkaart en de rangschikkingstabel.

import type { VolleyMatch, VolleyRankingRow } from "@/types";

export type { VolleyMatch, VolleyRankingRow };

const DEFAULT_CLUB_ID = "L-0759";

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

// --- De gegevens van VolleyAdmin uitlezen ---------------------------------

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

// --- Ophalen ---------------------------------------------------------------

const fetchXML = async (proxyPath: string): Promise<string> => {
  const url = `${proxyPath}&timestamp=${Date.now()}`;
  const response = await fetch(url, { headers: { Accept: "text/xml, application/xml, */*" } });
  if (!response.ok) throw new Error(`Status ${response.status}`);
  return response.text();
};

/**
 * Bij een paar reeksen heet de code in de rangschikking anders dan de code die
 * wij tonen. Dit lijstje vertaalt die.
 */
const mapSeriesForStandings = (reeks: string): string =>
  ({ "VDP2-B": "LDM1", "VDP4-B": "LDM2" } as Record<string, string>)[reeks] || reeks;

// --- Uitzoeken welke wedstrijd we tonen ------------------------------------

/** Begin en einde van de week (maandag tot en met zondag) waarin `ref` valt. */
const weekRange = (ref = new Date()): { start: number; end: number } => {
  const start = new Date(ref);
  const day = start.getDay(); // 0 = zondag
  const daysToMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - daysToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start: start.getTime(), end: end.getTime() };
};

/**
 * Kiest welke wedstrijd op de teampagina komt:
 *   - speelt het team deze week, dan die wedstrijd (de eerste die nog niet
 *     gespeeld is, of anders de laatste van die week);
 *   - zo niet, de eerstvolgende wedstrijd;
 *   - en is het seizoen gedaan, de laatst gespeelde wedstrijd.
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

/** De setstand thuis/uit. Vóór de wedstrijd is dat "0" - "0". */
export const matchScore = (match: VolleyMatch): { home: string; away: string } => {
  const [home, away] = match.uitslag.split("-").map((p) => p.trim());
  return home && away ? { home, away } : { home: "0", away: "0" };
};

class VolleyRepository {
  /** De rangschikking van een reeks, in de volgorde die VolleyAdmin teruggeeft. */
  async fetchRanking(reeks: string, clubId: string = DEFAULT_CLUB_ID): Promise<VolleyRankingRow[]> {
    if (!reeks) return [];
    const mapped = mapSeriesForStandings(reeks);
    try {
      const xml = await fetchXML(
        `/api/proxy-rangschikking?stamnummer=${encodeURIComponent(clubId)}&reeks=${encodeURIComponent(mapped)}`
      );
      return parseRanking(xml);
    } catch (error) {
      console.error(`Failed to fetch ranking for ${reeks}:`, error);
      return [];
    }
  }

  /** Alle wedstrijden van de club in één reeks. */
  async fetchMatches(reeks: string, clubId: string = DEFAULT_CLUB_ID): Promise<VolleyMatch[]> {
    if (!reeks) return [];
    try {
      const xml = await fetchXML(
        `/api/proxy-matches?stamnummer=${encodeURIComponent(clubId)}`
      );
      return parseMatches(xml).filter((match) => match.reeks === reeks);
    } catch (error) {
      console.error(`Failed to fetch matches for ${clubId}:`, error);
      return [];
    }
  }
}

export { VolleyRepository, DEFAULT_CLUB_ID };
