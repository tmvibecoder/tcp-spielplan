// ── Datenstand der BTV-Berichte und nächster Briefing-Lauf ──────────────────
// Wird vom automatischen Briefing-Lauf (scripts/briefing-run.mjs) geschrieben —
// nach jedem Einlesen der Spielberichte. Die App zeigt beides im ⋯-Menü.
// Von Hand nur anfassen, wenn der Automat nicht läuft.

export interface DataStand {
  /** Zeitpunkt des letzten Einlesens der BTV-Berichte (ISO, mit Zeitzone) */
  crawledAt: string;
  /** Was eingelesen wurde, z. B. "7 Gruppen der Winterrunde 2026/27" */
  scope: string;
  /** Nächster geplanter Lauf, oder null wenn keine TCP-Begegnung ansteht */
  nextRun: { at: string; reason: string } | null;
}

export const DATA_STAND: DataStand = {
  crawledAt: "2026-10-06T23:45:00+02:00",
  scope: "Vorsaisons aller 34 Gegner der Winterrunde 2026/27 (133 Gegner-Gruppen aus Winter 2024/25, Sommer 2025, Winter 2025/26 und Sommer 2026: Spielberichte und Meldelisten); Meldelisten Winter 2026/27 vom 02.10.2026",
  nextRun: {"at":"2026-10-10T01:00:00+02:00","reason":"Spieltag Herren 30 – TS Jahn München II"},
};
