import type { Meldeliste, MeldelistenEintrag, SeasonId } from "../types";
import type { ClubData } from "./data-format";
import { compareSeasons, findPlayer } from "./player-history";
import { playerKey } from "./player-key";
import { isProtectedName, rosterEntries } from "./kader";

// ── „Wer spielt wirklich?" — Einsätze der Gemeldeten in den letzten 12 Monaten ──
//
// Grundlage des Reiters „Kader" im Gegnerbriefing (seit 25.11.2026, Thomas'
// Wunsch): Die ersten Ränge einer Meldeliste sagen wenig, weil viele davon gar
// nicht spielen (TC Pliening Herren 40: 32 gemeldet, 11 eingesetzt; der Spieler
// mit den meisten Spieltagen steht auf Rang 7). Gezählt wird nur, was in
// Spielberichten steht — keine Aufstellungsprognose.
//
// „Diese Mannschaft" = gleiche Altersklasse UND gleiche Mannschaftsnummer wie
// die Mannschaft der Begegnung. Die Altersklasse steht im teamLabel des
// Einsatzes (bei Gegner-Gruppen ohne Ziffer, bei TCP-Gruppen mit der Ziffer der
// TCP-Mannschaft — deshalb wird sie dort abgeschnitten), die Nummer am
// Vereinsnamen („TC Pliening II").

const NUM_RE = /\s+(II|III|IV|V|VI)$/;

/** „Herren 30 II" → „Herren 30" */
export function ageClassOf(teamLabel: string): string {
  return teamLabel.replace(NUM_RE, "").trim();
}

/** „TC Pliening II (zurückgezogen)" → „II", erste Mannschaft → „" */
export function teamNoOf(club: string): string {
  return club.replace(/\s*\([^)]*\)\s*$/, "").match(NUM_RE)?.[1] ?? "";
}

export interface AktivStat {
  /** Begegnungen mit mindestens einem Einsatz */
  days: number;
  wins: number;
  losses: number;
  /** Datum des letzten Einsatzes (ISO) */
  last: string;
}

/** Einsätze einer Saison in einer Mannschaft — eine Zeile im aufgeklappten Spieler. */
export interface AktivLine {
  season: SeasonId;
  /** Mannschaft, z. B. „Herren 40" oder „Herren 50 II" */
  team: string;
  /** true = die Mannschaft der Begegnung */
  thisTeam: boolean;
  days: number;
  singlesWins: number;
  singlesLosses: number;
  /** gespielte Einzel-Positionen, z. B. „2–3" */
  positions: string;
  doublesWins: number;
  doublesLosses: number;
}

export interface AktivEntry {
  entry: MeldelistenEintrag;
  /** Schlüssel für die Spielerhistorie */
  key: string;
  /** Nur Initialen: keine Historie, deshalb auch keine Einsatzzählung */
  protectedEntry: boolean;
  /** Einsätze für die Mannschaft der Begegnung */
  team: AktivStat;
  /** Einsätze für irgendeine Mannschaft des Vereins */
  all: AktivStat;
  lines: AktivLine[];
}

const EMPTY: AktivStat = { days: 0, wins: 0, losses: 0, last: "" };

function range(xs: number[]): string {
  const s = [...new Set(xs)].sort((a, b) => a - b);
  if (s.length === 0) return "";
  return s.length === 1 ? String(s[0]) : `${s[0]}–${s[s.length - 1]}`;
}

/** Stichtag (ISO) der 12-Monats-Auswertung */
export function aktivCutoff(days = 365, today = new Date()): string {
  return new Date(today.getTime() - days * 86400000).toISOString().slice(0, 10);
}

/** Je Meldelisten-Eintrag: Spieltage, Bilanz und Aufschlüsselung der letzten
 *  12 Monate — einmal für die Mannschaft der Begegnung, einmal für alle
 *  Mannschaften des Vereins. Reihenfolge wie die Meldeliste. */
export function kaderAktiv(
  roster: Meldeliste | undefined,
  clubData: ClubData | undefined,
  club: string,
  teamLabel: string,
  days = 365,
  today = new Date(),
): AktivEntry[] {
  const cutoff = aktivCutoff(days, today);
  const ageClass = ageClassOf(teamLabel);
  const no = teamNoOf(club);
  return rosterEntries(roster).map((entry) => {
    const key = playerKey(club, entry.name);
    const protectedEntry = isProtectedName(entry.name);
    const p = protectedEntry ? undefined : findPlayer(clubData, club, entry.name);
    const recent = (p?.appearances ?? []).filter((a) => a.date && a.date >= cutoff);
    if (recent.length === 0) return { entry, key, protectedEntry, team: EMPTY, all: EMPTY, lines: [] };

    type App = (typeof recent)[number];
    const isThis = (a: App) => ageClassOf(a.teamLabel) === ageClass && teamNoOf(a.club) === no;
    const dayKey = (a: App) => `${a.date}|${a.club}|${a.opponentClub}`;
    const stat = (list: App[]): AktivStat => ({
      days: new Set(list.map(dayKey)).size,
      wins: list.filter((a) => a.won).length,
      losses: list.filter((a) => !a.won).length,
      last: list.reduce((m, a) => ((a.date ?? "") > m ? a.date ?? "" : m), ""),
    });

    const groups = new Map<string, { season: SeasonId; team: string; thisTeam: boolean; apps: App[] }>();
    for (const a of recent) {
      const n = teamNoOf(a.club);
      const team = `${ageClassOf(a.teamLabel)}${n ? ` ${n}` : ""}`;
      const k = `${a.season}|${team}`;
      let g = groups.get(k);
      if (!g) {
        g = { season: a.season, team, thisTeam: isThis(a), apps: [] };
        groups.set(k, g);
      }
      g.apps.push(a);
    }
    const lines: AktivLine[] = [...groups.values()]
      .sort((a, b) => compareSeasons(a.season, b.season) || Number(b.thisTeam) - Number(a.thisTeam) || a.team.localeCompare(b.team, "de"))
      .map((g) => {
        const s = g.apps.filter((a) => a.type === "singles");
        const d = g.apps.filter((a) => a.type === "doubles");
        return {
          season: g.season,
          team: g.team,
          thisTeam: g.thisTeam,
          days: new Set(g.apps.map(dayKey)).size,
          singlesWins: s.filter((a) => a.won).length,
          singlesLosses: s.filter((a) => !a.won).length,
          positions: range(s.map((a) => a.position)),
          doublesWins: d.filter((a) => a.won).length,
          doublesLosses: d.filter((a) => !a.won).length,
        };
      });
    return { entry, key, protectedEntry, team: stat(recent.filter(isThis)), all: stat(recent), lines };
  });
}
