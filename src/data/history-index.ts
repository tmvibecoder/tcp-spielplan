import type { IndividualMatch, Meldeliste, SeasonId } from "../types";
import type { Spielbericht } from "../utils/spielbericht.ts";
import { getSets, parseSide, type SetScore } from "../utils/spielbericht.ts";
import { baseClub, normalizePlayerName, playerKey } from "./player-key.ts";
import type { AppearanceData, ClubPlayer, TeamHit } from "./data-format";

// ── Saisonübergreifender Index: Spieler, Mannschaften, Einsätze ──────────────
//
// Grundlage für Suche, Spielerhistorie und Gegnerbriefing. Bis 08.10.2026
// baute die App diesen Index beim ersten Zugriff selbst aus allen Berichten;
// seitdem rechnet ihn scripts/generate-data.mjs einmal beim Erzeugen der
// Daten und schreibt das Ergebnis je Verein nach public/data/clubs/. Dieses
// Modul ist deshalb reine Logik ohne Datenimporte — der Generator lädt es per
// Node-Typ-Stripping.
//
// Ein Spieler ist über Saisons hinweg dieselbe Person, wenn Name UND Verein
// gleich sind (Entscheidung 09.09.2026: ein Vereinswechsel ergibt zwei
// getrennte Einträge). Die Mannschaftsziffer zählt dabei NICHT (07.10.2026,
// baseClub in player-key.ts): „TC Pliening III" und „TC Pliening" sind eine
// Person. Die LK am Namen ist immer die des jeweiligen Spieltags
// (aus dem Bericht) bzw. der Meldeliste — nie hochgerechnet.

const OWN_CLUB = /pliening/i;

export function posLabel(position: number): string {
  return position >= 7 ? `D${position - 6}` : `E${position}`;
}

function setsFor(im: IndividualMatch, side: "home" | "away") {
  return getSets(im).map((s: SetScore) => ({
    own: side === "home" ? s.home : s.away,
    opp: side === "home" ? s.away : s.home,
    won: side === "home" ? s.homeWon : !s.homeWon,
    isTiebreak: s.isTiebreak,
  }));
}

export interface HistoryIndex {
  players: Map<string, ClubPlayer>;
  teams: TeamHit[];
}

/** Index aus allen Berichten und Meldelisten bauen. `seasonOrder` liefert die
 *  Reihenfolge der Saisons (neueste zuerst, kleinerer Wert = neuer). */
export function buildIndex(reports: Spielbericht[], rosters: Meldeliste[], seasonOrder: SeasonId[]): HistoryIndex {
  const order = new Map(seasonOrder.map((s, i) => [s, i]));
  const compareSeasons = (a: SeasonId, b: SeasonId) => (order.get(a) ?? 99) - (order.get(b) ?? 99);

  const players = new Map<string, ClubPlayer>();
  const teamKeys = new Map<string, TeamHit>();

  const touchPlayer = (club: string, rawName: string): ClubPlayer | null => {
    const name = normalizePlayerName(rawName);
    if (!name || name.startsWith("—")) return null; // "— (w.o.)"-Platzhalter
    const key = playerKey(club, name);
    let p = players.get(key);
    if (!p) {
      // club ohne Mannschaftsziffer: der Eintrag gehört der Person, nicht der
      // Mannschaft. Welche Mannschaft es je Einsatz war, steht in Appearance.club.
      p = { key, name, club: baseClub(club), lk: "", seasons: [], teams: [], appearances: [] };
      players.set(key, p);
    }
    return p;
  };
  const touchTeam = (season: SeasonId, league: string, teamLabel: string, club: string) => {
    const k = `${season}::${league}::${club}`;
    if (!teamKeys.has(k)) teamKeys.set(k, { season, league, teamLabel, club });
  };
  const addTeamToPlayer = (p: ClubPlayer, season: SeasonId, teamLabel: string, league: string) => {
    if (!p.seasons.includes(season)) p.seasons.push(season);
    if (!p.teams.some((t) => t.season === season && t.league === league)) p.teams.push({ season, teamLabel, league });
  };

  for (const b of reports) {
    const teamLabel = b.teamLabel ?? "";
    touchTeam(b.season, b.league, teamLabel, b.homeClub);
    touchTeam(b.season, b.league, teamLabel, b.awayClub);
    for (const im of b.matches) {
      for (const side of ["home", "away"] as const) {
        const club = side === "home" ? b.homeClub : b.awayClub;
        const opponentClub = side === "home" ? b.awayClub : b.homeClub;
        const ownRaw = side === "home" ? im.home_player : im.away_player;
        const oppRaw = side === "home" ? im.away_player : im.home_player;
        if (!ownRaw) continue;
        const ownPlayers = parseSide(ownRaw);
        const opponents = parseSide(oppRaw).map((o) => ({ name: normalizePlayerName(o.name), lk: o.lk }));
        const won = im.winner === side;
        const sets = setsFor(im, side);
        const teamResult = side === "home"
          ? { own: b.finalHome, opp: b.finalAway }
          : { own: b.finalAway, opp: b.finalHome };
        for (const pl of ownPlayers) {
          const p = touchPlayer(club, pl.name);
          if (!p) continue;
          addTeamToPlayer(p, b.season, teamLabel, b.league);
          const partnerRaw = im.match_type === "doubles"
            ? ownPlayers.find((q) => q.name !== pl.name)?.name
            : undefined;
          const a: AppearanceData = {
            season: b.season,
            league: b.league,
            teamLabel,
            date: b.date,
            day: b.day,
            club,
            opponentClub,
            vsTcp: OWN_CLUB.test(opponentClub),
            isHome: side === "home",
            type: im.match_type,
            position: im.position,
            posLabel: posLabel(im.position),
            lk: pl.lk,
            partner: partnerRaw ? normalizePlayerName(partnerRaw) : undefined,
            opponents,
            sets,
            won,
            teamResult,
            ref: { homeClub: b.homeClub, awayClub: b.awayClub, matchId: im.id },
          };
          p.appearances.push(a);
        }
      }
    }
  }

  // Meldelisten: auch Spieler ohne Einsatz sind auffindbar, und die LK dort ist
  // die jüngste bekannte.
  for (const ml of rosters) {
    const teamLabel = teamKeys.get(`${ml.season}::${ml.leagueName}::${ml.club}`)?.teamLabel
      ?? [...teamKeys.values()].find((t) => t.season === ml.season && t.league === ml.leagueName)?.teamLabel
      ?? "";
    touchTeam(ml.season, ml.leagueName, teamLabel, ml.club);
    for (const e of [...ml.herren, ...ml.damen]) {
      const p = touchPlayer(ml.club, e.name);
      if (!p) continue;
      addTeamToPlayer(p, ml.season, teamLabel, ml.leagueName);
      // Meldelisten-LK der neuesten Saison gewinnt
      const newest = p.seasons.slice().sort(compareSeasons)[0];
      if (!p.lk || ml.season === newest) p.lk = e.lk;
    }
  }

  for (const p of players.values()) {
    p.seasons.sort(compareSeasons);
    p.teams.sort((a, b) => compareSeasons(a.season, b.season));
    p.appearances.sort(
      (a, b) => compareSeasons(a.season, b.season) || (b.date ?? "").localeCompare(a.date ?? "") || a.position - b.position,
    );
    if (!p.lk) {
      const withLk = p.appearances.find((a) => a.lk);
      if (withLk) p.lk = withLk.lk;
    }
  }

  const teams = [...teamKeys.values()].sort(
    (a, b) => a.club.localeCompare(b.club, "de") || compareSeasons(a.season, b.season) || a.teamLabel.localeCompare(b.teamLabel, "de"),
  );
  return { players, teams };
}
