import type { IndividualMatch } from "../types";
import { getAllSpielberichte } from "./spielberichte";
import { parsePlayer, parseSide } from "../utils/spielbericht";
import { TEAMS } from "./teams";

// ── Spieler-Statistik pro Mannschaft ──────────────────────────────────────────
// Wird LIVE aus den echten Spielberichten (src/data/spielberichte.ts) berechnet:
// pro Spieler, auf welcher Position er gegen wen (inkl. dessen LK) gewonnen/verloren
// hat – plus die Doppel-Paarungen. Funktioniert für jede Mannschaft, die in einem
// Spielbericht auftaucht (auch Gegner), da jeder Bericht beide Aufstellungen enthält.

export interface PlayerAppearance {
  opponentClub: string;
  date?: string;
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
  singles: PlayerAppearance[];
  doubles: PlayerAppearance[]; // Doppel-Einsätze desselben Spielers (voller Name)
}

export interface DoublesStat {
  players: [string, string];
  appearances: PlayerAppearance[];
}

export interface TeamStats {
  club: string;
  teamLabel: string;
  leagueName: string;
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
export function getTeamStats(
  leagueName: string,
  club: string
): TeamStats | undefined {
  const reports = getAllSpielberichte().filter(
    (b) => b.league === leagueName && (b.homeClub === club || b.awayClub === club)
  );
  if (reports.length === 0) return undefined;

  const playersMap = new Map<string, PlayerStat>();
  const doublesMap = new Map<string, DoublesStat>();

  for (const b of reports) {
    const side: "home" | "away" = b.homeClub === club ? "home" : "away";
    const opponentClub = side === "home" ? b.awayClub : b.homeClub;

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
        ps.singles.push({
          opponentClub,
          date: b.date,
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

  const teamLabel = TEAMS.find((t) => t.league === leagueName)?.label ?? club;

  return {
    club,
    teamLabel,
    leagueName,
    players: [...playersMap.values()],
    doubles: [...doublesMap.values()],
  };
}

/** Leere Team-Statistik — für Mannschaften mit Meldeliste, aber (noch) ohne Spielberichte. */
export function emptyTeamStats(leagueName: string, club: string): TeamStats {
  const teamLabel = TEAMS.find((t) => t.league === leagueName)?.label ?? club;
  return { club, teamLabel, leagueName, players: [], doubles: [] };
}

/** Spielbericht-Namen auf Meldelisten-Form bringen: Walkover-Vermerk und
 *  Länderkürzel entfernen ("Faschang, Michael AUT (w.o.)" -> "Faschang, Michael"). */
export function normalizePlayerName(name: string): string {
  return name
    .replace(/\s*\(w\.o\.\)\s*$/i, "")
    .replace(/\s+[A-Z]{3}\*?$/, "")
    .trim();
}

// ── Abgeleitete Kennzahlen (Einsätze, Bilanz, Ø-Position; sortiert) ───────────

export interface PlayerAgg {
  name: string;
  lk: string;
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
