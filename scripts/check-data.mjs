// Konsistenz-Check der Sommer-Daten (ohne Browser):
//  1. Hat jede Kreuztabellen-Zelle mit Ergebnis einen Spielbericht?
//  2. Passt die Summe der Matchsiege im Bericht zur Kreuztabellen-Zelle?
//  3. Hat jede Mannschaft aus den Tabellen eine Meldeliste?
//
//   node scripts/check-data.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

// ── Tabellen einlesen
const st = read("src/data/summer-2026.ts");
const leagues = [];
for (const block of st.split(/\n {2}\{\n/).slice(1)) {
  const name = block.match(/leagueName: "([^"]+)"/)?.[1];
  if (!name) continue;
  const entries = [...block.matchAll(
    /\{ rank: (\d+), club: "([^"]+)"[\s\S]*?crossResults: \[([^\]]*)\] \}/g
  )].map((m) => ({
    rank: Number(m[1]),
    club: m[2],
    cross: m[3].split(",").map((s) => s.trim().replace(/"/g, "")),
  }));
  if (entries.length) leagues.push({ name, entries });
}

// ── Spielberichte einlesen (generierte Datei)
const sb = read("src/data/spielberichte-crawled.ts");
const reports = new Map();
for (const block of sb.split(/\n {2}\{\n/).slice(1)) {
  const league = block.match(/league: "([^"]+)"/)?.[1];
  const home = block.match(/homeClub: "([^"]+)"/)?.[1];
  const away = block.match(/awayClub: "([^"]+)"/)?.[1];
  const fh = Number(block.match(/finalHome: (\d+)/)?.[1]);
  const fa = Number(block.match(/finalAway: (\d+)/)?.[1]);
  const n = (block.match(/\n\s+m\(/g) ?? []).length;
  if (league && home && away) reports.set(`${league}::${home}::${away}`, { fh, fa, n });
}

// ── Meldelisten einlesen
const ml = read("src/data/meldelisten.ts");
const rosters = new Set();
for (const m of ml.matchAll(/leagueName: "([^"]+)",\s*\n\s*club: "([^"]+)"/g)) {
  rosters.add(`${m[1]}::${m[2]}`);
}

let missingReports = 0, wrongResult = 0, missingRoster = 0, cells = 0, ok = 0;
for (const lg of leagues) {
  for (const row of lg.entries) {
    if (!rosters.has(`${lg.name}::${row.club}`)) {
      console.log(`OHNE MELDELISTE  ${lg.name} | ${row.club}`);
      missingRoster++;
    }
    row.cross.forEach((res, i) => {
      const opp = lg.entries[i]?.club;
      if (!opp || res === "***" || res === "0:0") return;
      cells++;
      const r = reports.get(`${lg.name}::${row.club}::${opp}`) ?? reports.get(`${lg.name}::${opp}::${row.club}`);
      if (!r) { console.log(`OHNE BERICHT     ${lg.name} | ${row.club} – ${opp} (${res})`); missingReports++; return; }
      // Zelle ist aus Sicht der Zeile; Bericht kennt Heim/Gast
      const isHome = reports.has(`${lg.name}::${row.club}::${opp}`);
      const expected = isHome ? `${r.fh}:${r.fa}` : `${r.fa}:${r.fh}`;
      if (expected !== res) {
        console.log(`ERGEBNIS ABWEICHT ${lg.name} | ${row.club} – ${opp}: Tabelle ${res}, Bericht ${expected}`);
        wrongResult++;
      } else ok++;
    });
  }
}
console.log(`\nKreuztabellen-Zellen mit Ergebnis: ${cells} (jede Begegnung 2×)`);
console.log(`  mit passendem Bericht: ${ok}`);
console.log(`  ohne Bericht: ${missingReports}`);
console.log(`  Ergebnis weicht ab: ${wrongResult}`);
console.log(`Mannschaften ohne Meldeliste: ${missingRoster}`);
console.log(`Berichte gesamt: ${reports.size}`);
