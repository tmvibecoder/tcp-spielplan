import type { IndividualMatch, MeldelistenEintrag } from "../types";
import type { GroupData } from "./data-format";
import { normalizePlayerName } from "./player-key";
import { parsePlayer, parseSide } from "../utils/spielbericht";

// ── Spieler-Statistik pro Mannschaft ──────────────────────────────────────────
// Wird LIVE aus den echten Spielberichten (src/data/spielberichte.ts) berechnet:
// pro Spieler, auf welcher Position er gegen wen (inkl. dessen LK) gewonnen/verloren
// hat – plus die Doppel-Paarungen. Funktioniert für jede Mannschaft, die in einem
// Spielbericht auftaucht (auch Gegner), da jeder Bericht beide Aufstellungen enthält.

export interface PlayerAppearance {
  opponentClub: string;
  date?: string;
  /** Index der Begegnung in TeamStats.meetings (für die Einsatz-Matrix) */
  meeting: number;
  position: number;
  opponent: string;   // Einzel: Gegnername · Doppel: "A / B" (Nachnamen)
  opponentLk: string; // LK des Gegners (Einzel); Doppel ohne LK (nuLiga weist sie nicht aus)
  score: string;      // Satz-Ergebnis aus eigener Sicht, z.B. "6:3 6:4"
  won: boolean;
  partner?: string;   // nur Doppel-Einsätze pro Spieler: voller Name des Partners
}

export interface PlayerStat {
  name: string;
  lk: string;
  /** Meldeposition laut Spielbericht (steht nur bei Einzeln dabei) */
  rang?: number;
  singles: PlayerAppearance[];
  doubles: PlayerAppearance[]; // Doppel-Einsätze desselben Spielers (voller Name)
}

export interface DoublesStat {
  players: [string, string];
  appearances: PlayerAppearance[];
}

/** Eine gespielte Begegnung der Mannschaft — Spalte der Einsatz-Matrix. */
export interface TeamMeeting {
  date?: string;
  opponentClub: string;
  isHome: boolean;
  /** Matchpunkte aus Sicht der Mannschaft */
  own: number;
  opp: number;
}

export interface TeamStats {
  club: string;
  teamLabel: string;
  leagueName: string;
  /** Gespielte Begegnungen, älteste zuerst */
  meetings: TeamMeeting[];
  players: PlayerStat[];
  doubles: DoublesStat[];
}

function surname(name: string): string {
  return name.split(",")[0].trim();
}

// Satz-Ergebnis aus Sicht der eigenen Mannschaft formatieren
function scoreFromSide(im: IndividualMatch, side: "home" | "away"): string {
  const sets: Array<[number | null, number | null]> = [
    [im.set1_home, im.set1_away],
    [im.set2_home, im.set2_away],
    [im.set3_home, im.set3_away],
  ];
  return sets
    .filter(([h, a]) => h != null && a != null)
    .map(([h, a]) => (side === "home" ? `${h}:${a}` : `${a}:${h}`))
    .join(" ");
}

/** Baut die Spieler-Statistik einer Mannschaft aus allen Spielberichten der Konkurrenz. */
export function getTeamStats(group: GroupData | undefined, club: string): TeamStats | undefined {
  const leagueName = group?.league ?? "";
  const reports = (group?.reports ?? [])
    .filter((b) => b.homeClub === club || b.awayClub === club)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  if (reports.length === 0) return undefined;

  const playersMap = new Map<string, PlayerStat>();
  const doublesMap = new Map<string, DoublesStat>();
  const meetings: TeamMeeting[] = [];

  for (const b of reports) {
    const side: "home" | "away" = b.homeClub === club ? "home" : "away";
    const opponentClub = side === "home" ? b.awayClub : b.homeClub;
    const meeting = meetings.length;
    meetings.push({
      date: b.date,
      opponentClub,
      isHome: side === "home",
      own: side === "home" ? b.finalHome : b.finalAway,
      opp: side === "home" ? b.finalAway : b.finalHome,
    });

    for (const im of b.matches) {
      const ourRaw = side === "home" ? im.home_player : im.away_player;
      const oppRaw = side === "home" ? im.away_player : im.home_player;
      if (!ourRaw) continue;
      const won = im.winner === side;
      const score = scoreFromSide(im, side);

      if (im.match_type === "singles") {
        const ours = parsePlayer(ourRaw);
        const opp = parsePlayer(oppRaw);
        let ps = playersMap.get(ours.name);
        if (!ps) {
          ps = { name: ours.name, lk: ours.lk, singles: [], doubles: [] };
          playersMap.set(ours.name, ps);
        }
        if (!ps.lk && ours.lk) ps.lk = ours.lk;
        if (ps.rang === undefined && ours.meldeposition) ps.rang = Number(ours.meldeposition);
        ps.singles.push({
          opponentClub,
          date: b.date,
          meeting,
          position: im.position,
          opponent: opp.name,
          opponentLk: opp.lk,
          score,
          won,
        });
      } else {
        const ourPlayers = parseSide(ourRaw);
        const ourPair = ourPlayers.map((p) => surname(p.name));
        const oppPair = parseSide(oppRaw).map((p) => surname(p.name));
        const k = [...ourPair].sort().join("|");
        let ds = doublesMap.get(k);
        if (!ds) {
          ds = { players: [ourPair[0] ?? "", ourPair[1] ?? ""], appearances: [] };
          doublesMap.set(k, ds);
        }
        const appearance: PlayerAppearance = {
          opponentClub,
          date: b.date,
          meeting,
          position: im.position,
          opponent: oppPair.join(" / "),
          opponentLk: "",
          score,
          won,
        };
        ds.appearances.push(appearance);
        // Doppel-Einsatz zusätzlich jedem der beiden Spieler zuordnen
        // (voller Name + Partner; wichtig für die Meldelisten-Ansicht der Mixed-Runde)
        for (const p of ourPlayers) {
          if (!p.name || p.name.startsWith("—")) continue; // "— (w.o.)"-Platzhalter
          let ps = playersMap.get(p.name);
          if (!ps) {
            ps = { name: p.name, lk: p.lk, singles: [], doubles: [] };
            playersMap.set(p.name, ps);
          }
          const partnerRaw =
            ourPlayers.find((q) => q.name !== p.name)?.name ?? "";
          ps.doubles.push({
            ...appearance,
            partner: normalizePlayerName(partnerRaw),
          });
        }
      }
    }
  }

  const teamLabel = reports.find((b) => b.teamLabel)?.teamLabel ?? club;

  return {
    club,
    teamLabel,
    leagueName,
    meetings,
    players: [...playersMap.values()],
    doubles: [...doublesMap.values()],
  };
}

/** Leere Team-Statistik — für Mannschaften mit Meldeliste, aber (noch) ohne Spielberichte. */
export function emptyTeamStats(leagueName: string, club: string, teamLabel = club): TeamStats {
  return { club, teamLabel, leagueName, meetings: [], players: [], doubles: [] };
}

/** Spielbericht-Namen auf Meldelisten-Form bringen: Walkover-Vermerk und
 *  Länderkürzel entfernen ("Faschang, Michael AUT (w.o.)" -> "Faschang, Michael"). */
// normalizePlayerName wohnt seit 07.10.2026 in player-key.ts (ohne Datenimporte);
// hier nur weitergereicht, damit bestehende Importe funktionieren.
export { normalizePlayerName };

// ── Abgeleitete Kennzahlen (Einsätze, Bilanz, Ø-Position; sortiert) ───────────

export interface PlayerAgg {
  name: string;
  lk: string;
  /** Meldeposition laut Spielbericht, sofern ein Einzel gespielt wurde */
  rang?: number;
  matches: number; // Einzel-Einsätze
  wins: number;
  losses: number;
  avgPosition: number;
  singles: PlayerAppearance[];
  doublesMatches: number;
  doublesWins: number;
  doublesLosses: number;
  doubles: PlayerAppearance[];
}

export function aggregatePlayers(team: TeamStats): PlayerAgg[] {
  return team.players
    .map((p) => {
      const matches = p.singles.length;
      const wins = p.singles.filter((s) => s.won).length;
      const doublesMatches = p.doubles.length;
      const doublesWins = p.doubles.filter((d) => d.won).length;
      const avg =
        matches > 0
          ? p.singles.reduce((sum, s) => sum + s.position, 0) / matches
          : 99;
      return {
        name: p.name,
        lk: p.lk,
        rang: p.rang,
        matches,
        wins,
        losses: matches - wins,
        avgPosition: avg,
        singles: [...p.singles].sort(
          (a, b) =>
            a.position - b.position || (a.date ?? "").localeCompare(b.date ?? "")
        ),
        doublesMatches,
        doublesWins,
        doublesLosses: doublesMatches - doublesWins,
        doubles: [...p.doubles].sort(
          (a, b) =>
            a.position - b.position || (a.date ?? "").localeCompare(b.date ?? "")
        ),
      };
    })
    .sort((a, b) => a.avgPosition - b.avgPosition || a.name.localeCompare(b.name));
}

/** Bilanzen je Person über den normalisierten Namen (ohne Länderkürzel und
 *  „(w.o.)") — so passen sie an die Meldeliste. Derselbe Spieler kann in den
 *  Berichten mehrfach auftauchen (mit und ohne Vermerk): zusammenführen. */
export function aggregateByName(team: TeamStats): Map<string, PlayerAgg> {
  const byName = new Map<string, PlayerAgg>();
  for (const p of aggregatePlayers(team)) {
    const key = normalizePlayerName(p.name);
    const prev = byName.get(key);
    if (!prev) {
      byName.set(key, { ...p, name: key });
      continue;
    }
    const singles = [...prev.singles, ...p.singles];
    const doubles = [...prev.doubles, ...p.doubles];
    byName.set(key, {
      ...prev,
      lk: prev.lk || p.lk,
      rang: prev.rang ?? p.rang,
      matches: singles.length,
      wins: singles.filter((s) => s.won).length,
      losses: singles.filter((s) => !s.won).length,
      avgPosition: singles.length ? singles.reduce((sum, s) => sum + s.position, 0) / singles.length : 99,
      singles,
      doublesMatches: doubles.length,
      doublesWins: doubles.filter((d) => d.won).length,
      doublesLosses: doubles.filter((d) => !d.won).length,
      doubles,
    });
  }
  return byName;
}

/** Ordnet die Bilanzen den Einträgen einer Meldeliste zu — je Person höchstens
 *  einem Eintrag. Nötig, weil Namen in einer Liste doppelt vorkommen können:
 *  geschützte Einträge tragen nur Initialen („W., L." auf Rang 2 und Rang 9),
 *  und bis 24.11.2026 bekamen dann beide dieselben Einsätze zugeschrieben. Bei
 *  doppelten Namen entscheidet die Meldeposition aus dem Spielbericht; fehlt
 *  sie (nur Doppel gespielt), gilt der zuerst gemeldete Eintrag.
 *  Rückgabe: Bilanz je Eintrag, in der Reihenfolge von `entries`. */
export function assignToRoster(entries: MeldelistenEintrag[], byName: Map<string, PlayerAgg>): (PlayerAgg | undefined)[] {
  const out: (PlayerAgg | undefined)[] = entries.map(() => undefined);
  const taken = new Set<string>();
  // 1. Durchgang: Name und Meldeposition stimmen überein
  entries.forEach((e, i) => {
    const agg = byName.get(e.name);
    if (agg && !taken.has(e.name) && agg.rang === e.rang) {
      out[i] = agg;
      taken.add(e.name);
    }
  });
  // 2. Durchgang: Rest dem zuerst gemeldeten Eintrag mit diesem Namen
  entries.forEach((e, i) => {
    const agg = byName.get(e.name);
    if (agg && !taken.has(e.name)) {
      out[i] = agg;
      taken.add(e.name);
    }
  });
  return out;
}

export interface DoublesAgg {
  label: string;
  matches: number;
  wins: number;
  losses: number;
  avgPosition: number;
  appearances: PlayerAppearance[];
}

export function aggregateDoubles(team: TeamStats): DoublesAgg[] {
  return team.doubles
    .map((d) => {
      const matches = d.appearances.length;
      const wins = d.appearances.filter((a) => a.won).length;
      const avg =
        matches > 0
          ? d.appearances.reduce((sum, a) => sum + a.position, 0) / matches
          : 99;
      return {
        label: `${d.players[0]} / ${d.players[1]}`,
        matches,
        wins,
        losses: matches - wins,
        avgPosition: avg,
        appearances: [...d.appearances].sort(
          (a, b) =>
            a.position - b.position || (a.date ?? "").localeCompare(b.date ?? "")
        ),
      };
    })
    .sort((a, b) => b.matches - a.matches || a.label.localeCompare(b.label));
}

/** Parst "LK14,3" / "LK 14,3" → 14.3 (für LK-Vergleiche). NaN wenn nicht parsebar. */
export function parseLk(lk: string): number {
  const m = lk.match(/(\d+)[.,]?(\d*)/);
  if (!m) return NaN;
  return parseFloat(`${m[1]}.${m[2] || "0"}`);
}
