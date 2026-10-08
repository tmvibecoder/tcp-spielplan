import type { IndividualMatch, SeasonId } from "../types";
import { ALL_SEASONS } from "./seasons";
import { normalizePlayerName, playerKey } from "./player-key";
import { parseSide, type Spielbericht } from "../utils/spielbericht";
import { posLabel } from "./history-index";
import type { AppearanceData, ClubData, ClubPlayer, GroupData, SearchIndex, SearchPlayer, TeamHit } from "./data-format";

// ── Spielerhistorie, Suche, Gegnerbriefing: Auswertungen auf geladenen Daten ──
//
// Seit 08.10.2026 baut die App keinen saisonübergreifenden Index mehr selbst.
// Der Generator (scripts/generate-data.mjs, Logik in history-index.ts) schreibt
// je Verein eine JSON-Datei mit allen Personen und Einsätzen, und die App lädt
// sie bei Bedarf (store.ts). Die Funktionen hier bekommen die geladenen Daten
// als Argument — sie bleiben damit rein und testbar.

export type Appearance = AppearanceData;
export type PlayerEntry = ClubPlayer;
export type { TeamHit, SearchPlayer };
export { playerKey };

const seasonOrder = new Map(ALL_SEASONS.map((s, i) => [s.id, i]));
/** Neueste Saison zuerst */
export function compareSeasons(a: SeasonId, b: SeasonId): number {
  return (seasonOrder.get(a) ?? 99) - (seasonOrder.get(b) ?? 99);
}

/** Verein aus einem Spieler-Schlüssel ("Verein::Nachname, Vorname"). */
export function clubOfKey(key: string): string {
  return key.split("::")[0] ?? "";
}

export function getPlayer(club: ClubData | undefined, key: string): PlayerEntry | undefined {
  return club?.players.find((p) => p.key === key);
}

/** Spieler einer Mannschaft (Verein) über die Meldeliste oder die Einsätze finden. */
export function findPlayer(club: ClubData | undefined, clubName: string, name: string): PlayerEntry | undefined {
  return getPlayer(club, playerKey(clubName, name));
}

export interface RecentBalance {
  played: number;
  wins: number;
  losses: number;
  singles: number;
  doubles: number;
}

/** Bilanz einer Person über die letzten `days` Tage (Standard: 12 Monate) aus
 *  allen erfassten Einzeln und Doppeln — saison- und vereinsübergreifend, aber
 *  je Verein getrennt (Vereinswechsel = eigener Eintrag, wie überall).
 *  Thomas' Wunsch vom 07.10.2026: auf den ersten Blick sehen, ob jemand
 *  zuletzt wirklich gespielt hat oder nur gemeldet ist — als grüne Siege und
 *  rote Niederlagen, nicht bloß als Zahl. */
export function recentBalance(club: ClubData | undefined, clubName: string, name: string, days = 365, today = new Date()): RecentBalance {
  const cutoff = new Date(today.getTime() - days * 86400000).toISOString().slice(0, 10);
  const out: RecentBalance = { played: 0, wins: 0, losses: 0, singles: 0, doubles: 0 };
  const p = findPlayer(club, clubName, name);
  if (!p) return out;
  for (const a of p.appearances) {
    if (!a.date || a.date < cutoff) continue;
    out.played++;
    if (a.won) out.wins++;
    else out.losses++;
    if (a.type === "singles") out.singles++;
    else out.doubles++;
  }
  return out;
}

// ── Suche ───────────────────────────────────────────────────────────────────

const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");

export interface SearchResult {
  players: SearchPlayer[];
  teams: TeamHit[];
}

/** Ab zwei Zeichen: Spieler (Name in beiden Reihenfolgen) und Mannschaften
 *  (Vereinsname) aller erfassten Saisons. */
export function search(index: SearchIndex | undefined, query: string, limit = 40): SearchResult {
  const q = fold(query.trim());
  if (q.length < 2 || !index) return { players: [], teams: [] };
  const words = q.split(/\s+/).filter(Boolean);
  const matches = (hay: string) => words.every((w) => hay.includes(w));

  const playerHits: SearchPlayer[] = [];
  for (const p of index.players) {
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

  const teamHits = index.teams.filter((t) => matches(fold(`${t.club} ${t.teamLabel}`)));

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

const EMPTY_GROUP: GroupData = { season: "sommer-26", league: "", teamLabel: "", reports: [], rosters: [] };

/** Alle gespielten Begegnungen einer Mannschaft in einer Saison mit
 *  tatsächlichen Aufstellungen und Einsatzzählern je Spieler — aus der
 *  geladenen Gruppendatei. */
export function getTeamSeason(group: GroupData | undefined, club: string): TeamSeason {
  const g = group ?? EMPTY_GROUP;
  const reports = g.reports.filter((b) => b.homeClub === club || b.awayClub === club);
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
  const ml = g.rosters.find((m) => m.club === club);
  if (ml) {
    for (const e of [...ml.herren, ...ml.damen]) {
      const u = usage.get(e.name);
      if (u && !u.lk) u.lk = e.lk;
    }
  }

  const teamLabel = reports.find((b) => b.teamLabel)?.teamLabel ?? g.teamLabel;
  return { season: g.season, league: g.league, teamLabel, club, meetings, usage };
}
