import type { SeasonId } from "../types";
import type { Spielbericht } from "../utils/spielbericht";
import { CRAWLED_SPIELBERICHTE } from "./spielberichte-crawled";

// Spielberichte (Einzel/Doppel je Begegnung) — ECHTE nuLiga-Daten.
//
// Die Daten stehen in src/data/spielberichte-crawled.ts und werden komplett
// generiert (npm run crawl:spielberichte && npm run gen:spielberichte, siehe
// README "Spielberichte selbst crawlen"). Bis 15.08.2026 wurden sie von Hand aus
// den MeetingReportFOP-PDFs übertragen; seit dem Crawl deckt die generierte Datei
// alle damals gepflegten Begegnungen ab (117/117 identisch bis auf zwei Namen,
// die nuLiga inzwischen korrigiert hat) — die Handdaten sind daher entfallen und
// stecken bei Bedarf in der Git-Historie.
//
// Seit 09.09.2026 liegen mehrere Saisons in derselben Datei. Weil sich
// Gruppennummern über die Jahre wiederholen („Bayernliga · Gr. 022 SU" gab es
// im Winter 2025/26 UND 2026/27), gehört die Saison immer mit in den Schlüssel.
//
// Lookup ist richtungsunabhängig: eine Begegnung erscheint in zwei
// Kreuztabellen-Zellen.

function key(season: SeasonId, league: string, homeClub: string, awayClub: string): string {
  return `${season}::${league}::${homeClub}::${awayClub}`;
}

const SPIELBERICHTE: Record<string, Spielbericht> = Object.fromEntries(
  CRAWLED_SPIELBERICHTE.map((b) => [key(b.season, b.league, b.homeClub, b.awayClub), b]),
);

// Richtungsunabhängig: prüft beide Reihenfolgen (Zeilen-/Spalten-Verein der Kreuztabelle).
export function getSpielbericht(
  season: SeasonId,
  league: string,
  clubA: string,
  clubB: string,
): Spielbericht | null {
  return SPIELBERICHTE[key(season, league, clubA, clubB)] ?? SPIELBERICHTE[key(season, league, clubB, clubA)] ?? null;
}

// Alle erfassten Spielberichte — einer Saison oder (ohne Argument) aller Saisons,
// für saisonweite Auswertungen wie Spieler-Statistik, Suche und Spielerhistorie.
export function getAllSpielberichte(season?: SeasonId): Spielbericht[] {
  return season ? CRAWLED_SPIELBERICHTE.filter((b) => b.season === season) : CRAWLED_SPIELBERICHTE;
}
