// Vergleicht die Parser-Ausgabe (aus dem Crawl-Cache) mit den bereits von Hand
// gepflegten Berichten in src/data/spielberichte.ts. Jede Abweichung ist ein
// Parser-Bug (oder eine echte Datenkorrektur) — bitte einzeln anschauen.
//
//   node scripts/verify-parser.mjs [Filter]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseModal } from "./parse-spielbericht.mjs";
import { GROUPS } from "./groups.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cache = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/.spielberichte-cache.json"), "utf8"));
const src = fs.readFileSync(path.join(ROOT, "src/data/spielberichte.ts"), "utf8");
const filter = process.argv[2];

// Handgepflegte Berichte aus dem TS-Quelltext lesen
const hand = new Map();
for (const block of src.split(/const SB_[A-Za-z0-9_]+: Spielbericht = \{/).slice(1)) {
  const body = block.slice(0, block.indexOf("\n};"));
  const league = body.match(/league: "([^"]+)"/)?.[1];
  const home = body.match(/homeClub: "([^"]+)"/)?.[1];
  const away = body.match(/awayClub: "([^"]+)"/)?.[1];
  const date = body.match(/date: "([^"]+)"/)?.[1];
  const matches = [...body.matchAll(
    /m\("([^"]+)",\s*(\d+),\s*"(singles|doubles)",\s*"((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)",\s*\[((?:\s*\[\d+,\s*\d+\]\s*,?)*)\s*\],\s*"(home|away)"\)/g
  )].map((mm) => ({
    position: Number(mm[2]),
    type: mm[3],
    home: JSON.parse(`"${mm[4]}"`),
    away: JSON.parse(`"${mm[5]}"`),
    sets: [...mm[6].matchAll(/\[(\d+),\s*(\d+)\]/g)].map((s) => [Number(s[1]), Number(s[2])]),
    winner: mm[7],
  }));
  if (league && home && away) hand.set(`${league}::${home}::${away}`, { date, matches });
}

let checked = 0, ok = 0;
const diffs = [];
for (const [league, data] of Object.entries(cache)) {
  if (filter && !league.includes(filter)) continue;
  const teamSize = GROUPS.find((g) => g.leagueName === league)?.teamSize ?? 9;
  for (const r of data.reports) {
    const key = `${league}::${r.home}::${r.away}`;
    const h = hand.get(key);
    if (!h) continue; // nur gegen vorhandene Handdaten prüfen
    checked++;
    let parsed;
    try {
      parsed = parseModal(r.modal, { keyPrefix: "x", teamSize });
    } catch (e) {
      diffs.push(`${key}: PARSE-FEHLER ${e.message}`);
      continue;
    }
    const norm = (arr) =>
      arr
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((m) => `${m.position}|${m.type}|${m.home}|${m.away}|${JSON.stringify(m.sets)}|${m.winner}`);
    const a = norm(parsed.matches);
    const b = norm(h.matches);
    if (a.join("\n") === b.join("\n")) { ok++; continue; }
    diffs.push(`${key}:`);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) diffs.push(`   Crawl: ${a[i] ?? "—"}\n   Hand : ${b[i] ?? "—"}`);
    }
  }
}
console.log(`geprüft: ${checked} Berichte, identisch: ${ok}, abweichend: ${checked - ok}`);
for (const d of diffs.slice(0, 60)) console.log(d);
