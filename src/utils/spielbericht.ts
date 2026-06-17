import type { IndividualMatch } from "../types";

// Spielbericht-Datenmodell + Parse-/Farb-Helfer für die Kreuztabellen-Detailansicht (Variante B).
// Spieler-Strings im nuLiga-Format: "Nachname, Vorname (Meldeposition, LKxx,x)" — Doppel mit " / ".

export interface SpielberichtMeeting {
  league: string;
  homeClub: string; // Zeilen-Verein der Kreuztabelle
  awayClub: string; // Spalten-Verein
  date?: string;
  day?: string;
  finalHome: number;
  finalAway: number;
}

export interface Spielbericht extends SpielberichtMeeting {
  matches: IndividualMatch[];
  example?: boolean; // true = Beispieldaten (echte Einzeldaten noch nicht verfügbar)
}

export interface ParsedPlayer {
  name: string;
  meldeposition: string;
  lk: string;
}

const PLAYER_RE = /^(.*?)\s*\((\d+),\s*(LK[\d,]+)\)\s*$/;

export function parsePlayer(raw: string): ParsedPlayer {
  const m = raw.trim().match(PLAYER_RE);
  if (!m) return { name: raw.trim(), meldeposition: "", lk: "" };
  return { name: m[1].trim(), meldeposition: m[2], lk: m[3] };
}

export function parseSide(raw: string): ParsedPlayer[] {
  return raw.split(" / ").map(parsePlayer);
}

export interface SetScore {
  home: number;
  away: number;
  homeWon: boolean;
  isTiebreak: boolean;
}

export function getSets(im: IndividualMatch): SetScore[] {
  const raw: Array<[number | null, number | null]> = [
    [im.set1_home, im.set1_away],
    [im.set2_home, im.set2_away],
    [im.set3_home, im.set3_away],
  ];
  const out: SetScore[] = [];
  raw.forEach(([h, a], i) => {
    if (h == null || a == null) return;
    out.push({ home: h, away: a, homeWon: h > a, isTiebreak: i === 2 });
  });
  return out;
}

export function formatDateDE(iso?: string): string {
  if (!iso) return "";
  const [y, mo, d] = iso.split("-");
  return `${d}.${mo}.${y}`;
}

// ── Farbgebung aus TC-Pliening-Perspektive ──
// Fremd-Paarung (kein TCP): Heim=Sky (blau), Gast=Amber (orange).
export type TcpSide = "home" | "away" | null;

export function getTcpSide(meeting: { homeClub: string; awayClub: string }): TcpSide {
  if (/pliening/i.test(meeting.homeClub)) return "home";
  if (/pliening/i.test(meeting.awayClub)) return "away";
  return null;
}

export type Outcome = "tcpWin" | "oppWin" | "neutralHome" | "neutralAway" | "loss";

export function sideOutcome(side: "home" | "away", won: boolean, tcpSide: TcpSide): Outcome {
  if (!won) return "loss";
  if (tcpSide === null) return side === "home" ? "neutralHome" : "neutralAway";
  return side === tcpSide ? "tcpWin" : "oppWin";
}

export function nameClass(o: Outcome): string {
  if (o === "tcpWin") return "text-emerald-300 font-semibold";
  if (o === "oppWin") return "text-red-300 font-semibold";
  if (o === "neutralHome") return "text-sky-300 font-semibold";
  if (o === "neutralAway") return "text-amber-300 font-semibold";
  return "text-slate-400";
}

export function checkClass(o: Outcome): string | null {
  if (o === "tcpWin") return "text-emerald-400";
  if (o === "oppWin") return "text-red-400";
  if (o === "neutralHome") return "text-sky-400";
  if (o === "neutralAway") return "text-amber-400";
  return null;
}

export function setCellClass(o: Outcome): string {
  if (o === "tcpWin") return "bg-emerald-500/15 font-bold text-emerald-300";
  if (o === "oppWin") return "bg-red-500/15 font-bold text-red-300";
  if (o === "neutralHome") return "bg-sky-500/15 font-bold text-sky-300";
  if (o === "neutralAway") return "bg-amber-500/15 font-bold text-amber-300";
  return "bg-slate-700/30 text-slate-500";
}

export function headerTeamClass(side: "home" | "away", tcpSide: TcpSide): string {
  if (tcpSide === null) return side === "home" ? "text-sky-300" : "text-amber-300";
  return "text-slate-100";
}
