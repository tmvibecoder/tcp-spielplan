import type { Spielbericht } from "../utils/spielbericht";
import type { GroupData } from "./data-format";

// Spielberichte (Einzel/Doppel je Begegnung) — ECHTE nuLiga-Daten.
//
// Seit 08.10.2026 liegen sie je Gruppe und Saison als JSON unter
// public/data/groups/<saison>/<liga>.json (erzeugt von scripts/generate-data.mjs
// aus den Crawl-Caches) und werden von der App bei Bedarf geladen (store.ts,
// useGroup). Vorher standen alle Saisons als TypeScript-Literale im Bundle —
// mit dem Voll-Crawl aller Gegnervereine wäre das zu groß geworden.
//
// Lookup ist richtungsunabhängig: eine Begegnung erscheint in zwei
// Kreuztabellen-Zellen.

export function getSpielbericht(group: GroupData | undefined, clubA: string, clubB: string): Spielbericht | null {
  if (!group) return null;
  return group.reports.find(
    (b) => (b.homeClub === clubA && b.awayClub === clubB) || (b.homeClub === clubB && b.awayClub === clubA),
  ) ?? null;
}
