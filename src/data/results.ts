import type { LeagueStandings, Match, Team, WinterMatch } from "../types";

// ── Offizielle Mannschaftsergebnisse für den Spielplan ────────────────────────
//
// Der Spielplan (matches.ts / WINTER_MATCHES) kennt nur Termine. Die Ergebnisse
// stehen bereits in den offiziellen BTV-Tabellen: crossResults[zeile][spalte] ist
// das Ergebnis der Zeilen-Mannschaft gegen die Spalten-Mannschaft (immer aus Sicht
// der Zeile, unabhängig vom Heimrecht). Daraus lässt sich für jede Begegnung des
// Spielplans das Endergebnis ableiten, ohne zusätzliche Daten zu laden.
//
// Winter-Begegnungen bringen ihr Ergebnis (mp/sets/games) direkt mit — das hat
// Vorrang, weil dort auch Sätze und Spiele bekannt sind.

export interface MatchResult {
  /** Matchpunkte aus Sicht des TC Pliening */
  tcp: number;
  opp: number;
  /** Matchpunkte in Heim:Gast-Reihenfolge (für Spielberichte) */
  home: number;
  away: number;
  /** "cancelled" = Begegnung vom BTV gestrichen (Mannschaft zurückgezogen) */
  outcome: "win" | "loss" | "draw" | "cancelled";
  /** nur Winter: Sätze und Spiele aus Sicht des TC Pliening */
  sets?: string;
  games?: string;
}

function outcomeOf(a: number, b: number): MatchResult["outcome"] {
  if (a > b) return "win";
  if (a < b) return "loss";
  return "draw";
}

function flip(s: string): string {
  return s.split(":").reverse().join(":");
}

/** Ergebnis Heim:Gast aus der Kreuztabelle einer Liga, oder null wenn ungespielt/unbekannt. */
export function getCrossResult(
  standings: LeagueStandings[],
  leagueName: string,
  homeClub: string,
  awayClub: string,
): { home: number; away: number } | null {
  const league = standings.find((l) => l.leagueName === leagueName);
  if (!league) return null;
  const rowIdx = league.entries.findIndex((e) => e.club === homeClub);
  const colIdx = league.entries.findIndex((e) => e.club === awayClub);
  if (rowIdx < 0 || colIdx < 0) return null;
  const cell = league.entries[rowIdx].crossResults[colIdx];
  if (!cell || !/^\d+:\d+$/.test(cell) || cell === "0:0") return null;
  const [home, away] = cell.split(":").map(Number);
  return { home, away };
}

function isWithdrawn(standings: LeagueStandings[], leagueName: string, club: string): boolean {
  const league = standings.find((l) => l.leagueName === leagueName);
  return !!league?.entries.some((e) => e.club === `${club} (zurückgezogen)`);
}

/** Offizielles Ergebnis einer Spielplan-Begegnung (Winterdaten oder Kreuztabelle). */
export function resolveMatchResult(
  match: Match,
  team: Team,
  standings: LeagueStandings[],
): MatchResult | null {
  const w = match as Partial<WinterMatch>;
  if (w.status === "played" && w.mp && /^\d+:\d+$/.test(w.mp)) {
    const [home, away] = w.mp.split(":").map(Number);
    const tcp = match.isHome ? home : away;
    const opp = match.isHome ? away : home;
    return {
      tcp,
      opp,
      home,
      away,
      outcome: outcomeOf(tcp, opp),
      sets: w.sets ? (match.isHome ? w.sets : flip(w.sets)) : undefined,
      games: w.games ? (match.isHome ? w.games : flip(w.games)) : undefined,
    };
  }

  const cross = getCrossResult(standings, team.league, match.home, match.away);
  if (!cross) {
    // Zurückgezogene Mannschaften führt der BTV als "<Verein> (zurückgezogen)" in der
    // Tabelle; alle ihre Begegnungen sind gestrichen und zählen nicht.
    if (isWithdrawn(standings, team.league, match.home) || isWithdrawn(standings, team.league, match.away)) {
      return { tcp: 0, opp: 0, home: 0, away: 0, outcome: "cancelled" };
    }
    return null;
  }
  const tcp = match.isHome ? cross.home : cross.away;
  const opp = match.isHome ? cross.away : cross.home;
  return { tcp, opp, home: cross.home, away: cross.away, outcome: outcomeOf(tcp, opp) };
}
