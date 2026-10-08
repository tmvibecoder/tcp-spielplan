import type { IndividualMatch, Meldeliste, SeasonId } from "../types";
import type { Spielbericht } from "../utils/spielbericht";
import type { AppearanceData, ClubData, ClubPlayer, GroupData, SearchIndex, SearchPlayer, TeamHit } from "./data-format";

// ── Kompakte Schreibweise der JSON-Dateien ───────────────────────────────────
//
// Die Datenobjekte der App (data-format.ts) sind sprechend, aber in JSON
// wortreich: ein Einsatz wiederholt Liga, Vereine, Datum und Namen, ein Match
// trägt zwölf Satz-Felder. Mit allen Gegnervereinen über alle Altersklassen
// wären das Dutzende Megabyte. Deshalb schreibt der Generator (Node) jede
// Datei über `encode…` als Tupel mit Stringtabelle, und die App (store.ts)
// packt sie über `decode…` wieder aus. Beide Seiten leben hier, damit sie
// nicht auseinanderlaufen. Die Dateien sind kein öffentliches Format — nur
// Generator und App lesen sie.

// ── Gruppen ──────────────────────────────────────────────────────────────────

/** [id, position, type, home, away, sets, winner] */
type MatchRow = [string, number, "s" | "d", string, string, Array<[number, number]>, "h" | "a"];
interface ReportRow {
  h: string; // homeClub
  a: string; // awayClub
  d?: string; // date
  w?: string; // day
  fh: number;
  fa: number;
  m: MatchRow[];
}
export interface GroupFile {
  season: SeasonId;
  league: string;
  teamLabel: string;
  reports: ReportRow[];
  rosters: Meldeliste[];
}

function encodeMatch(im: IndividualMatch): MatchRow {
  const sets: Array<[number, number]> = [];
  for (const [h, a] of [[im.set1_home, im.set1_away], [im.set2_home, im.set2_away], [im.set3_home, im.set3_away]]) {
    if (h != null && a != null) sets.push([h, a]);
  }
  return [im.id, im.position, im.match_type === "singles" ? "s" : "d", im.home_player, im.away_player, sets, im.winner === "home" ? "h" : "a"];
}

function decodeMatch([id, position, type, home, away, sets, winner]: MatchRow): IndividualMatch {
  return {
    id,
    match_score_id: id.split("-")[0],
    position,
    match_type: type === "s" ? "singles" : "doubles",
    home_player: home,
    away_player: away,
    set1_home: sets[0]?.[0] ?? null,
    set1_away: sets[0]?.[1] ?? null,
    set2_home: sets[1]?.[0] ?? null,
    set2_away: sets[1]?.[1] ?? null,
    set3_home: sets[2]?.[0] ?? null,
    set3_away: sets[2]?.[1] ?? null,
    winner: winner === "h" ? "home" : "away",
  };
}

export function encodeGroup(g: GroupData): GroupFile {
  return {
    season: g.season,
    league: g.league,
    teamLabel: g.teamLabel,
    reports: g.reports.map((b) => {
      const r: ReportRow = { h: b.homeClub, a: b.awayClub, fh: b.finalHome, fa: b.finalAway, m: b.matches.map(encodeMatch) };
      if (b.date) r.d = b.date;
      if (b.day) r.w = b.day;
      return r;
    }),
    rosters: g.rosters,
  };
}

export function decodeGroup(f: GroupFile): GroupData {
  const reports: Spielbericht[] = f.reports.map((r) => ({
    season: f.season,
    league: f.league,
    teamLabel: f.teamLabel,
    homeClub: r.h,
    awayClub: r.a,
    date: r.d,
    day: r.w,
    finalHome: r.fh,
    finalAway: r.fa,
    matches: r.m.map(decodeMatch),
  }));
  return { season: f.season, league: f.league, teamLabel: f.teamLabel, reports, rosters: f.rosters };
}

// ── Stringtabelle ────────────────────────────────────────────────────────────

class Strings {
  list: string[] = [];
  private idx = new Map<string, number>();
  id(s: string | undefined): number {
    if (s === undefined) return -1;
    let i = this.idx.get(s);
    if (i === undefined) { i = this.list.length; this.list.push(s); this.idx.set(s, i); }
    return i;
  }
}
const at = (table: string[], i: number): string => (i < 0 ? "" : table[i]);
const opt = (table: string[], i: number): string | undefined => (i < 0 ? undefined : table[i]);

// ── Vereine ──────────────────────────────────────────────────────────────────

/** [season, league, teamLabel, date, day, club, opponentClub, isHome, type, position, lk,
 *   partner, opponents[[name, lk]], sets[[own, opp, won, tb]], won, teamOwn, teamOpp,
 *   homeClub, awayClub, matchId] — Strings als Index in die Tabelle */
type AppRow = [number, number, number, number, number, number, number, 0 | 1, 0 | 1, number, number,
  number, Array<[number, number]>, Array<[number, number, 0 | 1, 0 | 1]>, 0 | 1, number, number, number, number, number];
interface PlayerRow {
  k: string;
  n: string;
  lk: string;
  se: SeasonId[];
  t: Array<[SeasonId, number, number]>; // [season, teamLabel, league]
  a: AppRow[];
}
export interface ClubFile {
  club: string;
  s: string[];
  players: PlayerRow[];
}

export function encodeClub(c: ClubData): ClubFile {
  const st = new Strings();
  const b = (v: boolean): 0 | 1 => (v ? 1 : 0);
  const players = c.players.map((p): PlayerRow => ({
    k: p.key,
    n: p.name,
    lk: p.lk,
    se: p.seasons,
    t: p.teams.map((t) => [t.season, st.id(t.teamLabel), st.id(t.league)] as [SeasonId, number, number]),
    a: p.appearances.map((a): AppRow => [
      st.id(a.season), st.id(a.league), st.id(a.teamLabel), st.id(a.date), st.id(a.day), st.id(a.club), st.id(a.opponentClub),
      b(a.isHome), a.type === "singles" ? 0 : 1, a.position, st.id(a.lk), st.id(a.partner),
      a.opponents.map((o) => [st.id(o.name), st.id(o.lk)] as [number, number]),
      a.sets.map((s) => [s.own, s.opp, b(s.won), b(s.isTiebreak)] as [number, number, 0 | 1, 0 | 1]),
      b(a.won), a.teamResult.own, a.teamResult.opp, st.id(a.ref.homeClub), st.id(a.ref.awayClub), st.id(a.ref.matchId),
    ]),
  }));
  return { club: c.club, s: st.list, players };
}

export function decodeClub(f: ClubFile): ClubData {
  const s = f.s;
  const players: ClubPlayer[] = f.players.map((p) => ({
    key: p.k,
    name: p.n,
    club: f.club,
    lk: p.lk,
    seasons: p.se,
    teams: p.t.map(([season, tl, lg]) => ({ season, teamLabel: at(s, tl), league: at(s, lg) })),
    appearances: p.a.map((r): AppearanceData => ({
      season: at(s, r[0]) as SeasonId,
      league: at(s, r[1]),
      teamLabel: at(s, r[2]),
      date: opt(s, r[3]),
      day: opt(s, r[4]),
      club: at(s, r[5]),
      opponentClub: at(s, r[6]),
      vsTcp: /pliening/i.test(at(s, r[6])),
      isHome: r[7] === 1,
      type: r[8] === 0 ? "singles" : "doubles",
      position: r[9],
      posLabel: r[9] >= 7 ? `D${r[9] - 6}` : `E${r[9]}`,
      lk: at(s, r[10]),
      partner: opt(s, r[11]),
      opponents: r[12].map(([n, lk]) => ({ name: at(s, n), lk: at(s, lk) })),
      sets: r[13].map(([own, opp, won, tb]) => ({ own, opp, won: won === 1, isTiebreak: tb === 1 })),
      won: r[14] === 1,
      teamResult: { own: r[15], opp: r[16] },
      ref: { homeClub: at(s, r[17]), awayClub: at(s, r[18]), matchId: at(s, r[19]) },
    })),
  }));
  return { club: f.club, players };
}

// ── Suchindex ────────────────────────────────────────────────────────────────

/** players: [name, club, lk, seasonsMask, teamLabel] (Strings als Index);
 *  teams: [season, league, teamLabel, club] */
export interface SearchFile {
  seasons: SeasonId[];
  s: string[];
  players: Array<[number, number, number, number, number]>;
  teams: Array<[number, number, number, number]>;
}

export function encodeSearch(index: SearchIndex, seasons: SeasonId[]): SearchFile {
  const st = new Strings();
  const mask = (list: SeasonId[]) => list.reduce((m, id) => m | (1 << seasons.indexOf(id)), 0);
  return {
    seasons,
    s: st.list,
    players: index.players.map((p) => [st.id(p.name), st.id(p.club), st.id(p.lk), mask(p.seasons), st.id(p.teamLabel)]),
    teams: index.teams.map((t) => [st.id(t.season), st.id(t.league), st.id(t.teamLabel), st.id(t.club)]),
  };
}

export function decodeSearch(f: SearchFile): SearchIndex {
  const s = f.s;
  const players: SearchPlayer[] = f.players.map(([n, c, lk, m, tl]) => {
    const name = at(s, n);
    const club = at(s, c);
    return {
      key: `${club}::${name}`,
      name,
      club,
      lk: at(s, lk),
      seasons: f.seasons.filter((_, i) => m & (1 << i)),
      teamLabel: at(s, tl),
    };
  });
  const teams: TeamHit[] = f.teams.map(([se, lg, tl, c]) => ({ season: at(s, se) as SeasonId, league: at(s, lg), teamLabel: at(s, tl), club: at(s, c) }));
  return { players, teams };
}
