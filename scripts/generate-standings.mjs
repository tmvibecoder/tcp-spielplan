// Aktualisiert Tabellen (und im Winter auch die Begegnungen) aus dem Crawl-Cache.
// Die Saison wird automatisch erkannt — siehe scripts/seasons.mjs.
//
//   node scripts/generate-standings.mjs                        # Diff der aktiven Saison
//   node scripts/generate-standings.mjs --write                # schreiben
//   node scripts/generate-standings.mjs --season sommer-26     # andere Saison
//
// crossResults werden aus den Spielplan-Ergebnissen abgeleitet (Zeile = Heim →
// Ergebnis direkt, Zeile = Gast → gedreht, ungespielt → "0:0").
//
// Layout "summer": nur die Tabellen — die Ergebnisse im Spielplan leitet die App
//   aus der Kreuztabelle ab (src/data/results.ts).
// Layout "winter": zusätzlich jede Begegnung selbst (mp/sets/games/status und,
//   bei Verlegung, date/time/day), weil dort Sätze und Spiele am Match hängen.
//
// ACHTUNG: Ligen aus `keepLeagues` bleiben handgepflegt — dort weicht die
// offizielle Tabelle bewusst von den Spielplan-Ergebnissen ab (der BTV streicht
// gewertete Spiele zurückgezogener Mannschaften).

import fs from "node:fs";
import path from "node:path";
import { ROOT, resolveSeason, describe, cacheFile } from "./seasons.mjs";

const write = process.argv.includes("--write");
const res = resolveSeason();
const season = res.season;
console.log(describe(res));

const CACHE = cacheFile(season);
if (!fs.existsSync(CACHE)) {
  console.error(
    `\nKein Crawl-Cache für ${season.label}: ${path.relative(ROOT, CACHE)}\n` +
    `Erst crawlen:  npm run crawl:spielberichte -- --season ${season.id}`
  );
  process.exit(1);
}
const cache = JSON.parse(fs.readFileSync(CACHE, "utf8"));
const FILE = path.join(ROOT, season.dataFile);
const KEEP = new Set(season.keepLeagues ?? []);
const WEEKDAY = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

let src = fs.readFileSync(FILE, "utf8");
let changed = 0;
let matchesChanged = 0;

// Liga → teamId (nur Winter-Layout: die Begegnungen hängen an der teamId)
const teamIdByLeague = new Map();
for (const m of src.matchAll(/id:\s*"([^"]+)",\s*label:[^,]+,\s*shortLabel:[^,]+,\s*league:\s*"([^"]+)"/g)) {
  teamIdByLeague.set(m[2], m[1]);
}

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
    console.log(`${league}: nicht in ${season.dataFile} gefunden`);
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
  if (before !== after) {
    changed++;
    console.log(`${league}: Tabelle aktualisiert (${table.length} Mannschaften, Rang TCP ${own ? own.rank : "—"})`);
    src = src.slice(0, blockStart) + after + src.slice(blockEnd);
  } else {
    console.log(`${league}: Tabelle unverändert`);
  }

  // ── Winter: die Begegnungen tragen ihr Ergebnis selbst ──
  if (season.layout !== "winter") continue;
  const teamId = teamIdByLeague.get(league);
  if (!teamId) {
    console.log(`${league}: keine teamId gefunden — Begegnungen nicht aktualisiert`);
    continue;
  }
  for (const s of schedule) {
    if (!/^\d+:\d+$/.test(s.mp) || s.mp === "0:0") continue;
    // Nur eigene Begegnungen stehen im Spielplan der App
    if (!/pliening/i.test(s.home) && !/pliening/i.test(s.away)) continue;
    const line = new RegExp(
      `^ {2}\\{ teamId: "${teamId}",[^\\n]*home: ${JSON.stringify(s.home)},[^\\n]*away: ${JSON.stringify(s.away)},[^\\n]*$`,
      "m"
    );
    const found = src.match(line);
    if (!found) {
      console.log(`  ! ${league}: Begegnung ${s.home} – ${s.away} nicht im Spielplan gefunden`);
      continue;
    }
    let updated = found[0]
      .replace(/mp: "[^"]*"/, `mp: ${JSON.stringify(s.mp)}`)
      .replace(/sets: "[^"]*"/, `sets: ${JSON.stringify(s.sets)}`)
      .replace(/games: "[^"]*"/, `games: ${JSON.stringify(s.games)}`)
      .replace(/status: "[^"]*"/, `status: "played"`);
    // Verlegt? Datum/Tag aus dem Crawl übernehmen.
    if (s.date && !updated.includes(`date: "${s.date}"`)) {
      const day = WEEKDAY[new Date(`${s.date}T12:00:00`).getDay()];
      updated = updated
        .replace(/date: "[^"]*"/, `date: ${JSON.stringify(s.date)}`)
        .replace(/day: "[^"]*"/, `day: ${JSON.stringify(day)}`);
      console.log(`  ~ ${league}: ${s.home} – ${s.away} verlegt auf ${s.date}`);
    }
    if (updated !== found[0]) {
      src = src.replace(found[0], updated);
      matchesChanged++;
      console.log(`  + ${league}: ${s.home} – ${s.away} ${s.mp} (Sätze ${s.sets}, Spiele ${s.games})`);
    }
  }
}

const total = changed + matchesChanged;
if (write && total) {
  // Anzeigedatum "BTV-Stand" in der App auf heute setzen
  const d = new Date();
  const stand = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
  const standConst = `${season.prefix}_STANDINGS_STAND`;
  const re = new RegExp(`export const ${standConst} = "[^"]*";`);
  if (!re.test(src)) {
    console.error(`\n${standConst} nicht in ${season.dataFile} gefunden — nichts geschrieben.`);
    process.exit(1);
  }
  src = src.replace(re, `export const ${standConst} = "${stand}";`);
  fs.writeFileSync(FILE, src);
  console.log(`\n${changed} Ligen und ${matchesChanged} Begegnungen in ${season.dataFile} geschrieben (${standConst} = ${stand}).`);
} else {
  console.log(`\n${changed} Ligen und ${matchesChanged} Begegnungen würden sich ändern (mit --write schreiben).`);
}
