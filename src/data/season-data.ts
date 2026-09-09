import type { LeagueStandings, Match, MonthColor, Season, SeasonId, Team } from "../types";
import { SEASONS } from "./seasons";
import { TEAMS } from "./teams";
import { MATCHES } from "./matches";
import { CATEGORIES, MONTHS, MONTH_COLORS } from "./constants";
import { SUMMER_STANDINGS, SUMMER_STANDINGS_STAND } from "./summer-2026";
import {
  WINTER_TEAMS,
  WINTER_CATEGORIES,
  WINTER_MATCHES,
  WINTER_STANDINGS,
  WINTER_STANDINGS_STAND,
  WINTER_MONTHS,
  WINTER_MONTH_COLORS,
} from "./winter-2526";
import {
  WINTER_2627_TEAMS,
  WINTER_2627_CATEGORIES,
  WINTER_2627_MATCHES,
  WINTER_2627_STANDINGS,
  WINTER_2627_STANDINGS_STAND,
  WINTER_2627_MONTHS,
  WINTER_2627_MONTH_COLORS,
} from "./winter-2627";

/** Alles, was eine Saison zum Anzeigen braucht — Spielplan, Tabellen, Filter, Monatsfarben. */
export interface SeasonData {
  season: Season;
  teams: Team[];
  categories: { label: string; ids: string[] }[];
  matches: Match[];
  standings: LeagueStandings[];
  /** Datum des letzten BTV-Abgleichs, über den Tabellen als „BTV-Stand" sichtbar. */
  standingsStand: string;
  months: Record<string, string>;
  monthColors: Record<string, MonthColor>;
  /** Der Druck-Spielplan (pdf-export.ts) kennt nur die Sommerrunde. */
  supportsPdf: boolean;
}

function seasonOf(id: SeasonId): Season {
  const s = SEASONS.find((x) => x.id === id);
  if (!s) throw new Error(`Saison ${id} fehlt in SEASONS`);
  return s;
}

// Eine Registry statt einer Sommer/Winter-Verzweigung: seit Winter 2026/27 gibt es
// mehr als zwei Saisons, und „nicht Sommer" wäre nicht mehr eindeutig.
// Saisons, die nur als Historie vorliegen (sommer-25, winter-2425), haben hier
// keinen Eintrag — sie haben keinen Spielplan und keine Tabellen in der App.
export const SEASON_DATA: Partial<Record<SeasonId, SeasonData>> = {
  "winter-2627": {
    season: seasonOf("winter-2627"),
    teams: WINTER_2627_TEAMS as Team[],
    categories: WINTER_2627_CATEGORIES,
    matches: WINTER_2627_MATCHES,
    standings: WINTER_2627_STANDINGS,
    standingsStand: WINTER_2627_STANDINGS_STAND,
    months: WINTER_2627_MONTHS,
    monthColors: WINTER_2627_MONTH_COLORS,
    supportsPdf: false,
  },
  "sommer-26": {
    season: seasonOf("sommer-26"),
    teams: TEAMS,
    categories: CATEGORIES,
    matches: MATCHES,
    standings: SUMMER_STANDINGS,
    standingsStand: SUMMER_STANDINGS_STAND,
    months: MONTHS,
    monthColors: MONTH_COLORS,
    supportsPdf: true,
  },
  "winter-2526": {
    season: seasonOf("winter-2526"),
    teams: WINTER_TEAMS as Team[],
    categories: WINTER_CATEGORIES,
    matches: WINTER_MATCHES,
    standings: WINTER_STANDINGS,
    standingsStand: WINTER_STANDINGS_STAND,
    months: WINTER_MONTHS,
    monthColors: WINTER_MONTH_COLORS,
    supportsPdf: false,
  },
};

export function getSeasonData(id: SeasonId): SeasonData {
  return SEASON_DATA[id] ?? SEASON_DATA["winter-2627"]!;
}
