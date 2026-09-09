import type { Season } from "../types";

// Reihenfolge = Reihenfolge im Saison-Dropdown; SEASONS[0] ist die Vorauswahl.
// Die laufende Saison steht oben, ältere Runden bleiben als Archiv erreichbar.
export const SEASONS: Season[] = [
  { id: "winter-2627", label: "Winter 2026/27", shortLabel: "Winter 26/27", icon: "❄️", provisionalTimesUntil: "2026-10-01" },
  { id: "sommer-26", label: "Sommer 2026", shortLabel: "Sommer 26", icon: "☀️", provisionalTimesUntil: "2026-04-01" },
  { id: "winter-2526", label: "Winter 2025/26", shortLabel: "Winter 25/26", icon: "❄️" },
];

export const DEFAULT_SEASON: Season = SEASONS[0];
