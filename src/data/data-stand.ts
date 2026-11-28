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
  crawledAt: "2026-11-28T05:32:20+01:00",
  scope: "Herren 40, Damen (Winter 2026/27)",
  nextRun: {"at":"2026-11-29T01:00:00+01:00","reason":"Ergebnis 1 Tag nach Herren 40 – TC Grün-Weiß Gräfelfing (28.11.)"},
};
