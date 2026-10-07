// ── Spieler-Schlüssel, ohne Datenimporte ────────────────────────────────────
// Bewusst ein Blatt im Modulgraphen: App.tsx braucht nur playerKey(), darf aber
// nicht die großen Datenmodule (Spielberichte, Meldelisten) ins Startbundle
// ziehen. Seit 07.10.2026 hier statt in player-stats/player-history — als
// TeamStatsDetail den Spielerindex importierte, landeten 3 MB Meldelisten im
// Startbundle, weil player-history über App.tsx statisch erreichbar war.

/** Namen aus Spielberichten normalisieren: „(w.o.)"-Zusatz und Länderkürzel
 *  („GER", „CRO*") hinter dem Namen entfernen. */
export function normalizePlayerName(name: string): string {
  return name
    .replace(/\s*\(w\.o\.\)\s*$/i, "")
    .replace(/\s+[A-Z]{3}\*?$/, "")
    .trim();
}

/** Verein ohne Mannschaftsziffer und Zusätze: „TC Pliening III" → „TC Pliening",
 *  „TC Pliening II (zurückgezogen)" → „TC Pliening". Erste, zweite und dritte
 *  Mannschaft sind derselbe Verein — und dieselben Personen wandern zwischen
 *  ihnen (Nico Ehlers: Sommer 2026 einmal Herren 30, viermal Herren 40 III).
 *  Bis 07.10.2026 ergab jede Ziffer einen eigenen Spieler-Eintrag; Thomas sah
 *  deshalb bei ihm „nur ein Doppel". */
export function baseClub(club: string): string {
  return club
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/\s+(II|III|IV|V|VI)$/, "")
    .trim();
}

/** Schlüssel einer Person im saisonübergreifenden Index: Verein (ohne
 *  Mannschaftsziffer) + Name. Ein echter Vereinswechsel ergibt bewusst zwei
 *  Einträge (Entscheidung 09.09.2026) — ein Wechsel zwischen erster und zweiter
 *  Mannschaft desselben Vereins nicht (07.10.2026). */
export const playerKey = (club: string, name: string) => `${baseClub(club)}::${normalizePlayerName(name)}`;
