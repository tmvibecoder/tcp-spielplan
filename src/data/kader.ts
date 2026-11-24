import type { Meldeliste, MeldelistenEintrag } from "../types";
import { parseLk } from "./player-stats";

// ── Kleine, reine Helfer für die Kader-Ansichten ─────────────────────────────
// Kaderliste, LK-Profil, Einsatz-Matrix, Kader-Vergleich und Vereinskader
// (Redesign der Mannschaftslisten, 24.11.2026). Nichts hier schätzt oder rechnet
// hoch — es wird nur gezählt, sortiert und gekürzt, was in Meldeliste und
// Spielberichten steht.

/** Alle Einträge einer Meldeliste, Herren vor Damen (wie überall in der App). */
export function rosterEntries(roster: Meldeliste | undefined): MeldelistenEintrag[] {
  return roster ? [...roster.herren, ...roster.damen] : [];
}

/** „Hahn, Matthias" → „Hahn, M." — für die enge Kopf-an-Kopf-Darstellung.
 *  Initialen-Einträge („B., S.") und Namen ohne Komma bleiben, wie sie sind. */
export function shortName(name: string): string {
  const [last, first] = name.split(",").map((s) => s.trim());
  if (!first) return name;
  if (/^\p{L}\.$/u.test(first)) return name;
  return `${last}, ${first.charAt(0)}.`;
}

/** Geschützte Einträge tragen nur Initialen („B., S.") — siehe scripts/schutz.mjs.
 *  Sie werden nirgends über Mannschaften hinweg zusammengeführt. */
export function isProtectedName(name: string): boolean {
  return /^\p{L}\.,\s*\p{L}\.$/u.test(name.trim());
}

/** Höchste LK-Stufe der Verteilungen (LK 25 ist die schwächste Leistungsklasse). */
export const LK_STEPS = 25;

/** Index der LK-Stufe (0 = LK 1 … 24 = LK 25) oder -1, wenn keine LK bekannt ist. */
export function lkStep(lk: string): number {
  const v = parseLk(lk);
  if (Number.isNaN(v) || v < 1) return -1;
  return Math.min(LK_STEPS, Math.floor(v)) - 1;
}

/** Anzahl Gemeldeter je voller LK-Stufe (LK 1 bis 25). */
export function lkCounts(entries: { lk: string }[]): number[] {
  const counts = Array<number>(LK_STEPS).fill(0);
  for (const e of entries) {
    const i = lkStep(e.lk);
    if (i >= 0) counts[i]++;
  }
  return counts;
}

/** „2026-10-10" → „10.10." */
export function fmtDay(iso?: string): string {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}.${m}.`;
}

/** Vereinsname für schmale Spaltenköpfe: gängige Vorsätze weg
 *  („TC Philathlos München" → „Philathlos München"). Kürzen übernimmt CSS. */
export function clubShort(club: string): string {
  return club.replace(/^(TC|TSV|SV|SC|TV|FC|ESV|TF|TeG|STK|MTTC|HC|TS|ATSV|PSV|SpVgg|TG|TA|DJK|VfL|VfB|ASV|MTV|STC|WB|GW)\s+/u, "");
}
