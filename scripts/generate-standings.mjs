// Aktualisiert die Tabellen in src/data/summer-2026.ts aus dem Crawl-Cache
// (scripts/.spielberichte-cache.json enthält je Gruppe Tabelle + Spielplan).
//
//   node scripts/generate-standings.mjs            # nur Diff anzeigen
//   node scripts/generate-standings.mjs --write    # Änderungen schreiben
//
// crossResults werden aus den Spielplan-Ergebnissen abgeleitet (Zeile = Heim →
// Ergebnis direkt, Zeile = Gast → gedreht, ungespielt → "0:0").
//
// ACHTUNG: Ligen mit zurückgezogenen Mannschaften stehen in KEEP — dort weicht
// die offizielle Tabelle bewusst von den Spielplan-Ergebnissen ab (der BTV
// streicht gewertete Spiele), deshalb bleiben sie handgepflegt.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cache = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/.spielberichte-cache.json"), "utf8"));
const FILE = path.join(ROOT, "src/data/summer-2026.ts");
const write = process.argv.includes("--write");

const KEEP = new Set([
  "Landesliga 2 · Gr. 043 SU", // TC Pliening II zurückgezogen
  "Südliga 2 · Gr. 315",       // VfB Forstinning zurückgezogen
]);

let src = fs.readFileSync(FILE, "utf8");
let changed = 0;

for (const [league, data] of Object.entries(cache)) {
  if (KEEP.has(league)) {
    console.log(`${league}: übersprungen (handgepflegt, zurückgezogene Mannschaft)`);
    continue;
  }
  const { table, schedule } = data;
  if (!table.length) {
    console.log(`${league}: keine Tabelle im Cache`);
    continue;
  }
  const clubs = table.map((t) => t.club);
  const idx = new Map(clubs.map((c, i) => [c, i]));

  // Kreuztabelle aus dem Spielplan
  const cross = clubs.map(() => clubs.map(() => "0:0"));
  for (let i = 0; i < clubs.length; i++) cross[i][i] = "***";
  for (const s of schedule) {
    const hi = idx.get(s.home);
    const ai = idx.get(s.away);
    if (hi == null || ai == null) continue;
    if (!/^\d+:\d+$/.test(s.mp) || s.mp === "0:0") continue;
    const [h, a] = s.mp.split(":");
    cross[hi][ai] = `${h}:${a}`;
    cross[ai][hi] = `${a}:${h}`;
  }

  const own = table.find((t) => /pliening/i.test(t.club));
  const entries = table
    .map((t, i) => {
      const isOwn = /pliening/i.test(t.club);
      return `      { rank: ${t.rank}, club: ${JSON.stringify(t.club)}, isOwnClub: ${isOwn ? "true " : "false"}, points: ${JSON.stringify(
        t.points
      )}, matchPoints: ${JSON.stringify(t.matchPoints)}, sets: ${JSON.stringify(t.sets)}, crossResults: [${cross[i]
        .map((c) => JSON.stringify(c))
        .join(", ")}] },`;
    })
    .join("\n");

  // Block der Liga in der Datei finden und entries/ownRank ersetzen
  const marker = `leagueName: ${JSON.stringify(league)}`;
  const at = src.indexOf(marker);
  if (at < 0) {
    console.log(`${league}: nicht in summer-2026.ts gefunden`);
    continue;
  }
  const blockStart = src.lastIndexOf("\n  {", at);
  const blockEnd = src.indexOf("\n  },", at);
  if (blockStart < 0 || blockEnd < 0) {
    console.log(`${league}: Block-Grenzen nicht gefunden`);
    continue;
  }
  const before = src.slice(blockStart, blockEnd);
  const after = before
    .replace(/ownRank: \d+,/, `ownRank: ${own ? own.rank : 0},`)
    .replace(/entries: \[[\s\S]*?\n {4}\],/, `entries: [\n${entries}\n    ],`);
  if (before === after) {
    console.log(`${league}: unverändert`);
    continue;
  }
  changed++;
  console.log(`${league}: aktualisiert (${table.length} Mannschaften, Rang TCP ${own ? own.rank : "—"})`);
  src = src.slice(0, blockStart) + after + src.slice(blockEnd);
}

if (write && changed) {
  // Anzeigedatum "BTV-Stand" in der App auf heute setzen
  const d = new Date();
  const stand = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
  src = src.replace(/export const SUMMER_STANDINGS_STAND = "[^"]*";/, `export const SUMMER_STANDINGS_STAND = "${stand}";`);
  fs.writeFileSync(FILE, src);
  console.log(`\n${changed} Ligen in summer-2026.ts geschrieben (SUMMER_STANDINGS_STAND = ${stand}).`);
} else {
  console.log(`\n${changed} Ligen würden sich ändern (mit --write schreiben).`);
}
