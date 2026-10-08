import type { Meldeliste, SeasonId } from "../types";
import type { Spielbericht } from "../utils/spielbericht";

// ── Datenformat der JSON-Dateien unter public/data ───────────────────────────
//
// Seit 08.10.2026 liegen Spielberichte und Meldelisten nicht mehr als
// TypeScript-Literale im Bundle, sondern als JSON-Dateien, die die App bei
// Bedarf nachlädt. Grund: Thomas' Voll-Crawl aller Gegnervereine über alle
// Erwachsenenklassen vervielfacht die Datenmenge — als Bundle-Chunk wären das
// mehrere Megabyte für ein einziges Antippen gewesen.
//
// Drei Dateifamilien, erzeugt von scripts/generate-data.mjs:
//
//   public/data/groups/<saison>/<liga-slug>.json   eine Gruppe: alle Spielberichte
//                                                  und Meldelisten dieser Liga
//   public/data/clubs/<verein-slug>.json           ein Verein: alle Personen mit
//                                                  allen Einsätzen (alle Saisons)
//   public/data/search.json                        Suchindex: Namen, Vereine,
//                                                  Mannschaften
//
// Dieses Modul ist bewusst ein Blatt ohne React und ohne Datenimporte — es wird
// vom Generator (Node, per Typ-Stripping) UND von der App benutzt. Pfade und
// Slugs müssen auf beiden Seiten identisch entstehen, deshalb stehen sie hier.

/** Alle Berichte und Meldelisten einer Gruppe (Liga) in einer Saison. */
export interface GroupData {
  season: SeasonId;
  league: string;
  /** Konkurrenz des TC Pliening bzw. Altersklasse bei Gegner-Gruppen */
  teamLabel: string;
  reports: Spielbericht[];
  rosters: Meldeliste[];
}

/** Ein Einsatz einer Person (Einzel oder Doppel) — so wie die Spielerhistorie
 *  ihn zeigt. Den vollständigen Spielbericht lädt die App bei Bedarf über `ref`. */
export interface AppearanceData {
  season: SeasonId;
  league: string;
  teamLabel: string;
  date?: string;
  day?: string;
  /** Mannschaft, für die der Spieler hier antrat (mit Ziffer, z. B. "TC Pliening II") */
  club: string;
  opponentClub: string;
  vsTcp: boolean;
  isHome: boolean;
  type: "singles" | "doubles";
  position: number;
  posLabel: string;
  /** LK am Spieltag (nur Einzel) */
  lk: string;
  partner?: string;
  opponents: { name: string; lk: string }[];
  sets: { own: number; opp: number; won: boolean; isTiebreak: boolean }[];
  won: boolean;
  teamResult: { own: number; opp: number };
  /** Begegnung und Match im Spielbericht (Gruppendatei) */
  ref: { homeClub: string; awayClub: string; matchId: string };
}

export interface ClubPlayer {
  key: string;
  name: string;
  /** Verein ohne Mannschaftsziffer */
  club: string;
  /** zuletzt bekannte LK (neueste Meldeliste, sonst neuester Einsatz) */
  lk: string;
  /** neueste zuerst */
  seasons: SeasonId[];
  teams: { season: SeasonId; teamLabel: string; league: string }[];
  appearances: AppearanceData[];
}

/** Alle Personen eines Vereins (ohne Mannschaftsziffer) mit ihren Einsätzen. */
export interface ClubData {
  club: string;
  players: ClubPlayer[];
}

export interface SearchPlayer {
  key: string;
  name: string;
  club: string;
  lk: string;
  seasons: SeasonId[];
  /** Konkurrenz der neuesten Saison */
  teamLabel: string;
}

export interface TeamHit {
  season: SeasonId;
  league: string;
  teamLabel: string;
  club: string;
}

export interface SearchIndex {
  players: SearchPlayer[];
  teams: TeamHit[];
}

// ── Pfade ────────────────────────────────────────────────────────────────────

/** Dateiname aus einem Liga- oder Vereinsnamen: Kleinbuchstaben, Umlaute
 *  aufgelöst, alles andere als Bindestrich. "Südliga 3 · Gr. 047" →
 *  "suedliga-3-gr-047", "TC Grün-Weiß Gräfelfing" → "tc-gruen-weiss-graefelfing". */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const DATA_ROOT = "data";

export function groupPath(season: SeasonId, league: string): string {
  return `${DATA_ROOT}/groups/${season}/${slugify(league)}.json`;
}

export function clubPath(club: string): string {
  return `${DATA_ROOT}/clubs/${slugify(club)}.json`;
}

export const SEARCH_PATH = `${DATA_ROOT}/search.json`;
