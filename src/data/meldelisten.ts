import type { Meldeliste } from "../types";
import type { GroupData } from "./data-format";

// ── Namentliche Meldelisten ──────────────────────────────────────────────────
// Seit 08.10.2026 je Gruppe und Saison in public/data/groups/<saison>/<liga>.json
// (Feld `rosters`), erzeugt von scripts/generate-data.mjs aus den Caches von
// scripts/crawl-meldelisten.mjs. Quelle: btv.de Mannschaftsportraits.
// Rang = Meldeposition wie in nuLiga (bei Mixed sind Herren und Damen separat
// nummeriert); LK = Leistungsklasse laut Portrait (kann von der LK im
// Spielbericht abweichen, die den Stand am Spieltag zeigt). nation nur,
// wenn nicht GER. Bilanzen stehen NICHT hier — sie kommen aus den Spielberichten.

/** Meldeliste einer Mannschaft (exakter club-String wie in den Tabellen der Saison). */
export function getMeldeliste(group: GroupData | undefined, club: string): Meldeliste | undefined {
  return group?.rosters.find((m) => m.club === club);
}
