import type { IndividualMatch, SeasonId } from "../types";
import { getAllSpielberichte } from "./spielberichte";
import { MELDELISTEN } from "./meldelisten";
import { ALL_SEASONS } from "./seasons";
import { normalizePlayerName } from "./player-stats";
import { getSets, parseSide, type SetScore, type Spielbericht } from "../utils/spielbericht";

// ── Saisonübergreifender Index: Spieler, Mannschaften, Einsätze ──────────────
//
// Grundlage für Suche, Spielerhistorie und Gegnerbriefing. Wird LIVE aus den
// gecrawlten Spielberichten (alle Saisons) und den Meldelisten gebaut — einmal
// beim ersten Zugriff, danach aus dem Speicher.
//
// Ein Spieler ist über Saisons hinweg dieselbe Person, wenn Name UND Verein
// gleich sind (Entscheidung 09.09.2026: ein Vereinswechsel ergibt zwei
// getrennte Einträge). Die LK am Namen ist immer die des jeweiligen Spieltags
// (aus dem Bericht) bzw. der Meldeliste — nie hochgerechnet.

const OWN_CLUB = /pliening/i;

export interface SetView {
  own: number;
  opp: number;
  won: boolean;
  isTiebreak: boolean;
}

export interface Appearance {
  season: SeasonId;
  league: string;
  /** Konkurrenz des TC Pliening in dieser Gruppe, z. B. "Herren 40" */
  teamLabel: string;
  date?: string;
  day?: string;
  /** Verein, für den der Spieler hier angetreten ist */
  club: string;
  opponentClub: string;
  /** Begegnung gegen den TC Pliening (aus Sicht eines Gegners) */
  vsTcp: boolean;
  isHome: boolean;
  type: "singles" | "doubles";
  position: number;
  /** "E1" … "E6" bzw. "D1" … "D3" */
  posLabel: string;
  /** LK des Spielers am Spieltag (nur Einzel — Doppel weisen keine LK aus) */
  lk: string;
  partner?: string;
  opponents: { name: string; lk: string }[];
  sets: SetView[];
  won: boolean;
  /** Begegnungsergebnis aus Sicht des Spielers */
  teamResult: { own: number; opp: number };
  /** Zum Öffnen des Spielberichts */
  report: Spielbericht;
  match: IndividualMatch;
}

export interface PlayerEntry {
  key: string;
  name: string;
  club: string;
  /** zuletzt bekannte LK (neueste Meldeliste, sonst neuester Einsatz) */
  lk: string;
  seasons: SeasonId[];
  /** Mannschaften je Saison (Konkurrenz des TC Pliening in dieser Gruppe + Liga) */
  teams: { season: SeasonId; teamLabel: string; league: string }[];
  appearances: Appearance[];
}

export interface TeamHit {
  season: SeasonId;
  league: string;
  teamLabel: string;
  club: string;
}

function posLabel(position: number): string {
  return position >= 7 ? `D${position - 6}` : `E${position}`;
}

function setsFor(im: IndividualMatch, side: "home" | "away"): SetView[] {
  return getSets(im).map((s: SetScore) => ({
    own: side === "home" ? s.home : s.away,
    opp: side === "home" ? s.away : s.home,
    won: side === "home" ? s.homeWon : !s.homeWon,
    isTiebreak: s.isTiebreak,
  }));
}

const seasonOrder = new Map(ALL_SEASONS.map((s, i) => [s.id, i]));
/** Neueste Saison zuerst */
export function compareSeasons(a: SeasonId, b: SeasonId): number {
  return (seasonOrder.get(a) ?? 99) - (seasonOrder.get(b) ?? 99);
}

export const playerKey = (club: string, name: string) => `${club}::${normalizePlayerName(name)}`;

interface Index {
  players: Map<string, PlayerEntry>;
  teams: TeamHit[];
}

let index: Index | null = null;

function build(): Index {
  const players = new Map<string, PlayerEntry>();
  const teamKeys = new Map<string, TeamHit>();

  const touchPlayer = (club: string, rawName: string): PlayerEntry | null => {
    const name = normalizePlayerName(rawName);
    if (!name || name.startsWith("—")) return null; // "— (w.o.)"-Platzhalter
    const key = playerKey(club, name);
    let p = players.get(key);
    if (!p) {
      p = { key, name, club, lk: "", seasons: [], teams: [], appearances: [] };
      players.set(key, p);
    }
    return p;
  };
  const touchTeam = (season: SeasonId, league: string, teamLabel: string, club: string) => {
    const k = `${season}::${league}::${club}`;
    if (!teamKeys.has(k)) teamKeys.set(k, { season, league, teamLabel, club });
  };
  const addTeamToPlayer = (p: PlayerEntry, season: SeasonId, teamLabel: string, league: string) => {
    if (!p.seasons.includes(season)) p.seasons.push(season);
    if (!p.teams.some((t) => t.season === season && t.league === league)) p.teams.push({ season, teamLabel, league });
  };

  for (const b of getAllSpielberichte()) {
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
          p.appearances.push({
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
            report: b,
            match: im,
          });
        }
      }
    }
  }

  // Meldelisten: auch Spieler ohne Einsatz sind auffindbar, und die LK dort ist
  // die jüngste bekannte.
  for (const ml of MELDELISTEN) {
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

function idx(): Index {
  if (!index) index = build();
  return index;
}

export function getPlayer(key: string): PlayerEntry | undefined {
  return idx().players.get(key);
}

/** Spieler einer Mannschaft (Verein) über die Meldeliste oder die Einsätze finden. */
export function findPlayer(club: string, name: string): PlayerEntry | undefined {
  return idx().players.get(playerKey(club, name));
}

// ── Suche ───────────────────────────────────────────────────────────────────

const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss");

export interface SearchResult {
  players: PlayerEntry[];
  teams: TeamHit[];
}

/** Ab zwei Zeichen: Spieler (Name in beiden Reihenfolgen) und Mannschaften
 *  (Vereinsname) aller erfassten Saisons — nur Gruppen, in denen der TC
 *  Pliening spielt, denn nur die sind erfasst. */
export function search(query: string, limit = 40): SearchResult {
  const q = fold(query.trim());
  if (q.length < 2) return { players: [], teams: [] };
  const words = q.split(/\s+/).filter(Boolean);
  const matches = (hay: string) => words.every((w) => hay.includes(w));
  const { players, teams } = idx();

  const playerHits: PlayerEntry[] = [];
  for (const p of players.values()) {
    const [last, first = ""] = p.name.split(",").map((s) => s.trim());
    const hay = fold(`${p.name} ${first} ${last} ${p.club}`);
    if (matches(hay)) playerHits.push(p);
  }
  playerHits.sort((a, b) => {
    // Treffer am Namensanfang zuerst, dann alphabetisch
    const sa = fold(a.name).startsWith(q) ? 0 : 1;
    const sb = fold(b.name).startsWith(q) ? 0 : 1;
    return sa - sb || a.name.localeCompare(b.name, "de") || a.club.localeCompare(b.club, "de");
  });

  const teamHits = teams.filter((t) => matches(fold(`${t.club} ${t.teamLabel}`)));

  return { players: playerHits.slice(0, limit), teams: teamHits.slice(0, limit) };
}

// ── Mannschaft in einer Saison (fürs Gegnerbriefing) ────────────────────────

export interface LineupSlot {
  position: number;
  posLabel: string;
  players: { name: string; lk: string }[];
  won: boolean;
}

export interface MeetingSummary {
  date?: string;
  day?: string;
  isHome: boolean;
  opponentClub: string;
  result: { own: number; opp: number };
  singles: LineupSlot[];
  doubles: LineupSlot[];
  report: Spielbericht;
}

export interface TeamPlayerUsage {
  name: string;
  /** LK laut jüngstem Einsatz (Einzel) bzw. Meldeliste */
  lk: string;
  singles: number;
  singlesPositions: number[];
  singlesWins: number;
  doubles: number;
  doublesWins: number;
  partners: Map<string, number>;
}

export interface TeamSeason {
  season: SeasonId;
  league: string;
  teamLabel: string;
  club: string;
  meetings: MeetingSummary[];
  usage: Map<string, TeamPlayerUsage>;
}

const teamCache = new Map<string, TeamSeason>();

/** Alle gespielten Begegnungen einer Mannschaft in einer Saison mit
 *  tatsächlichen Aufstellungen und Einsatzzählern je Spieler. */
export function getTeamSeason(season: SeasonId, league: string, club: string): TeamSeason {
  const k = `${season}::${league}::${club}`;
  const cached = teamCache.get(k);
  if (cached) return cached;

  const reports = getAllSpielberichte(season).filter(
    (b) => b.league === league && (b.homeClub === club || b.awayClub === club),
  );
  const usage = new Map<string, TeamPlayerUsage>();
  const use = (name: string): TeamPlayerUsage => {
    let u = usage.get(name);
    if (!u) {
      u = { name, lk: "", singles: 0, singlesPositions: [], singlesWins: 0, doubles: 0, doublesWins: 0, partners: new Map() };
      usage.set(name, u);
    }
    return u;
  };

  const meetings: MeetingSummary[] = reports.map((b) => {
    const side: "home" | "away" = b.homeClub === club ? "home" : "away";
    const slot = (im: IndividualMatch): LineupSlot => {
      const raw = side === "home" ? im.home_player : im.away_player;
      const players = parseSide(raw).map((p) => ({ name: normalizePlayerName(p.name), lk: p.lk }));
      return { position: im.position, posLabel: posLabel(im.position), players, won: im.winner === side };
    };
    const singles = b.matches.filter((m) => m.match_type === "singles").map(slot);
    const doubles = b.matches.filter((m) => m.match_type === "doubles").map(slot);
    for (const s of singles) {
      const p = s.players[0];
      if (!p || p.name.startsWith("—")) continue;
      const u = use(p.name);
      u.singles++;
      u.singlesPositions.push(s.position);
      if (s.won) u.singlesWins++;
      if (p.lk) u.lk = p.lk;
    }
    for (const d of doubles) {
      const names = d.players.map((p) => p.name).filter((n) => n && !n.startsWith("—"));
      for (const n of names) {
        const u = use(n);
        u.doubles++;
        if (d.won) u.doublesWins++;
        for (const other of names) if (other !== n) u.partners.set(other, (u.partners.get(other) ?? 0) + 1);
      }
    }
    return {
      date: b.date,
      day: b.day,
      isHome: side === "home",
      opponentClub: side === "home" ? b.awayClub : b.homeClub,
      result: side === "home" ? { own: b.finalHome, opp: b.finalAway } : { own: b.finalAway, opp: b.finalHome },
      singles,
      doubles,
      report: b,
    };
  });
  meetings.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  // LK aus der Meldeliste, wenn kein Einzel gespielt wurde
  const ml = MELDELISTEN.find((m) => m.season === season && m.leagueName === league && m.club === club);
  if (ml) {
    for (const e of [...ml.herren, ...ml.damen]) {
      const u = usage.get(e.name);
      if (u && !u.lk) u.lk = e.lk;
    }
  }

  const teamLabel = reports.find((b) => b.teamLabel)?.teamLabel ?? "";
  const ts: TeamSeason = { season, league, teamLabel, club, meetings, usage };
  teamCache.set(k, ts);
  return ts;
}
