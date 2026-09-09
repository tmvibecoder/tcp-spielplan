// Erzeugt src/data/meldelisten.ts aus ALLEN Saison-Caches
// (scripts/.meldelisten-cache-<saison>.json, geschrieben von crawl-meldelisten.mjs).
//
//   npm run gen:meldelisten
//
// Mannschaften ohne Cache werden aus der bestehenden Datei übernommen — ein
// Teil-Crawl verwirft nichts. Jede Meldeliste trägt ihre Saison, weil sich
// Gruppennummern über die Jahre wiederholen.

import fs from "node:fs";
import path from "node:path";
import { ROOT, SEASONS, rosterCacheFile } from "./seasons.mjs";

const OUT = path.join(ROOT, "src/data/meldelisten.ts");

const result = []; // { season, leagueName, club, herren, damen }
const seasonsWithCache = [];
for (const season of SEASONS) {
  const f = rosterCacheFile(season);
  if (!fs.existsSync(f)) continue;
  const part = JSON.parse(fs.readFileSync(f, "utf8"));
  const teams = Object.values(part);
  console.log(`Cache ${season.id}: ${teams.length} Mannschaften`);
  seasonsWithCache.push(season);
  for (const t of teams) result.push({ season: season.id, ...t });
}

// Mannschaften ohne Cache aus dem Bestand übernehmen (gleiches Prinzip wie beim
// Spielbericht-Generator: nichts geht verloren, wenn Caches fehlen).
const covered = new Set(result.map((t) => `${t.season}::${t.leagueName}::${t.club}`));
if (fs.existsSync(OUT)) {
  const mod = await import(OUT);
  let carried = 0;
  for (const t of mod.MELDELISTEN) {
    const season = t.season ?? SEASONS.find((s) => s.groups.some((g) => g.leagueName === t.leagueName))?.id;
    if (!season || covered.has(`${season}::${t.leagueName}::${t.club}`)) continue;
    result.push({ ...t, season });
    carried++;
  }
  if (carried) console.log(`Aus Bestand übernommen (kein Cache): ${carried} Mannschaften`);
}
const order = new Map(SEASONS.map((s, i) => [s.id, i]));
result.sort((a, b) => (order.get(a.season) ?? 99) - (order.get(b.season) ?? 99));

const stand = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
const emitEntry = (e) => {
  const nat = e.nation ? `, nation: "${e.nation}"` : "";
  return `    { rang: ${e.rang}, name: ${JSON.stringify(e.name)}, lk: "${e.lk}", jahrgang: ${e.jahrgang}${nat} },`;
};
const perSeason = SEASONS.filter((s) => result.some((t) => t.season === s.id)).map((s) => `${s.label} (${result.filter((t) => t.season === s.id).length})`).join(", ");

let ts = `import type { Meldeliste, SeasonId } from "../types";

// ── Namentliche Meldelisten ──────────────────────────────────────────────────
// AUTO-GENERIERT von scripts/generate-meldelisten.mjs (npm run gen:meldelisten)
// aus den Caches von scripts/crawl-meldelisten.mjs — NICHT von Hand editieren.
// Stand ${stand}. Quelle: btv.de Mannschaftsportraits der jeweiligen Gruppe.
// Saisons: ${perSeason}.
// Rang = Meldeposition wie in nuLiga (bei Mixed sind Herren und Damen separat
// nummeriert); LK = Leistungsklasse laut Portrait (kann von der LK im
// Spielbericht abweichen, die den Stand am Spieltag zeigt). nation nur,
// wenn nicht GER. Bilanzen stehen NICHT hier — sie kommen live aus den
// Spielberichten (src/data/spielberichte.ts).

export const MELDELISTEN: Meldeliste[] = [
`;
// Mannschaften ohne jeden Spieler weglassen (z. B. Midcourt U10: nuLiga führt
// dort keine namentliche Meldeliste) — sonst zeigt die App "Einzel (0)".
for (const t of result.filter((x) => x.herren.length || x.damen.length)) {
  ts += `  {
    season: ${JSON.stringify(t.season)},
    leagueName: ${JSON.stringify(t.leagueName)},
    club: ${JSON.stringify(t.club)},
    herren: [
${t.herren.map(emitEntry).join("\n")}
    ],
    damen: [
${t.damen.map(emitEntry).join("\n")}
    ],
  },
`;
}
ts += `];

/** Meldeliste einer Mannschaft (exakte league/club-Strings wie in den Tabellen der Saison). */
export function getMeldeliste(
  season: SeasonId,
  leagueName: string,
  club: string
): Meldeliste | undefined {
  return MELDELISTEN.find(
    (m) => m.season === season && m.leagueName === leagueName && m.club === club
  );
}
`;
fs.writeFileSync(OUT, ts);
const total = result.reduce((s, t) => s + t.herren.length + t.damen.length, 0);
console.log(`geschrieben: ${OUT}`);
console.log(`  ${result.length} Mannschaften, ${total} Spieler — ${perSeason}`);
