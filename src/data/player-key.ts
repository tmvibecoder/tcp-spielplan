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

/** Schlüssel einer Person im saisonübergreifenden Index: Verein + Name.
 *  Ein Vereinswechsel ergibt bewusst zwei Einträge (Entscheidung 09.09.2026). */
export const playerKey = (club: string, name: string) => `${club}::${normalizePlayerName(name)}`;
