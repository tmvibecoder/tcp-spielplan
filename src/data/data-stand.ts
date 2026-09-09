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
  crawledAt: "2026-09-09T22:40:00+02:00",
  scope: "Sommer 2026 vollständig; Winterrunde 2026/27 noch ohne Spieltag",
  nextRun: {"at":"2026-10-03T01:00:00+02:00","reason":"7 Tage vor Herren 30 – TS Jahn München II (10.10.)"},
};
