import type { Season, SeasonId } from "../types";

// Reihenfolge = Reihenfolge im Saison-Dropdown; SEASONS[0] ist die Vorauswahl.
// Die laufende Saison steht oben, ältere Runden bleiben als Archiv erreichbar.
export const SEASONS: Season[] = [
  { id: "winter-2627", label: "Winter 2026/27", shortLabel: "Winter 26/27", icon: "❄️", provisionalTimesUntil: "2026-10-01" },
  { id: "sommer-26", label: "Sommer 2026", shortLabel: "Sommer 26", icon: "☀️", provisionalTimesUntil: "2026-04-01" },
  { id: "winter-2526", label: "Winter 2025/26", shortLabel: "Winter 25/26", icon: "❄️" },
];

export const DEFAULT_SEASON: Season = SEASONS[0];

// Saisons, die nur als Historie vorliegen (Spielberichte + Meldelisten für die
// Spielerhistorie und die Suche) — ohne Spielplan, nicht im Dropdown.
export const HISTORY_SEASONS: Season[] = [
  { id: "sommer-25", label: "Sommer 2025", shortLabel: "Sommer 25", icon: "☀️", historyOnly: true },
  { id: "winter-2425", label: "Winter 2024/25", shortLabel: "Winter 24/25", icon: "❄️", historyOnly: true },
];

/** Alle Saisons mit Daten, neueste zuerst — für Suche und Spielerhistorie. */
export const ALL_SEASONS: Season[] = [...SEASONS, ...HISTORY_SEASONS];

export function seasonLabel(id: SeasonId): string {
  return ALL_SEASONS.find((s) => s.id === id)?.label ?? id;
}
