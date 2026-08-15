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
// Lookup ist richtungsunabhängig: eine Begegnung erscheint in zwei
// Kreuztabellen-Zellen.

function key(league: string, homeClub: string, awayClub: string): string {
  return `${league}::${homeClub}::${awayClub}`;
}

const SPIELBERICHTE: Record<string, Spielbericht> = Object.fromEntries(
  CRAWLED_SPIELBERICHTE.map((b) => [key(b.league, b.homeClub, b.awayClub), b]),
);

// Richtungsunabhängig: prüft beide Reihenfolgen (Zeilen-/Spalten-Verein der Kreuztabelle).
export function getSpielbericht(league: string, clubA: string, clubB: string): Spielbericht | null {
  return SPIELBERICHTE[key(league, clubA, clubB)] ?? SPIELBERICHTE[key(league, clubB, clubA)] ?? null;
}

// Alle erfassten Spielberichte (für saisonweite Auswertungen wie die Spieler-Statistik).
export function getAllSpielberichte(): Spielbericht[] {
  return CRAWLED_SPIELBERICHTE;
}
