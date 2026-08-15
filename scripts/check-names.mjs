// Wie viele Spieler aus den Spielberichten fehlen in der Meldeliste ihrer
// Mannschaft? (Solche erscheinen in der App unter "Weitere Einsätze" — das sind
// echte Ersatzspieler aus anderen Mannschaften des Vereins, kein Fehler.)
//
//   node scripts/check-names.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sb = fs.readFileSync(path.join(ROOT, "src/data/spielberichte-crawled.ts"), "utf8");
const ml = fs.readFileSync(path.join(ROOT, "src/data/meldelisten.ts"), "utf8");

const rosters = new Map();
for (const block of ml.split(/\{\s*\n\s*leagueName: "/).slice(1)) {
  const league = block.slice(0, block.indexOf('"'));
  const club = block.match(/club: "([^"]+)"/)?.[1];
  const names = new Set([...block.matchAll(/name: "((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`)));
  rosters.set(`${league}::${club}`, names);
}

const norm = (n) =>
  n.replace(/\s*\(w\.o\.\)/gi, "").replace(/\s+[A-Z]{3}\*?$/, "").trim();

let checked = 0;
const missing = new Map();
for (const block of sb.split(/\n {2}\{\n/).slice(1)) {
  const league = block.match(/league: "([^"]+)"/)?.[1];
  const home = block.match(/homeClub: "([^"]+)"/)?.[1];
  const away = block.match(/awayClub: "([^"]+)"/)?.[1];
  if (!league || !home || !away) continue;
  for (const m of block.matchAll(/m\("[^"]+", \d+, "(singles|doubles)", "((?:[^"\\]|\\.)*)", "((?:[^"\\]|\\.)*)"/g)) {
    const [, , h, a] = m;
    for (const [club, raw] of [[home, h], [away, a]]) {
      const roster = rosters.get(`${league}::${club}`);
      if (!roster) continue; // z. B. Midcourt U10 ohne Meldeliste
      for (const part of raw.split(" / ")) {
        const name = norm(part.replace(/\s*\(\d+,\s*LK[\d,]+\)\s*$/, ""));
        if (!name || name.startsWith("—")) continue;
        checked++;
        if (!roster.has(name)) {
          const k = `${league} | ${club} | ${name}`;
          missing.set(k, (missing.get(k) ?? 0) + 1);
        }
      }
    }
  }
}
console.log(`geprüfte Spieler-Nennungen: ${checked}`);
console.log(`nicht in der Meldeliste (= "Weitere Einsätze"): ${missing.size} Spieler`);
for (const [k, n] of [...missing].sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(`  ${n}x  ${k}`);
