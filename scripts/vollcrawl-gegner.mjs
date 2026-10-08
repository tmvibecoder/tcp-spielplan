// Voll-Crawl der Gegner zum Saisonwechsel (Thomas' Auftrag vom 08.10.2026):
// Jeder Gegnerverein der laufenden Runde wird in den Vorsaisons über ALLE
// Erwachsenen-Altersklassen erfasst — nicht nur in der Klasse, in der er gegen
// den TC Pliening antritt. Nur so hat jeder gemeldete Spieler wirklich alle
// seine Einsätze (Jahrgang 1997 spielt im Sommer noch „Herren", im Winter
// darauf „Herren 30"; ein Herren-40-Spieler steht oft parallel bei Herren 30).
//
// Vier Phasen, einzeln oder zusammen (--all):
//
//   node scripts/vollcrawl-gegner.mjs --discover [--seasons a,b]   # 1 Gruppensuche je Vorsaison, parallel
//   node scripts/vollcrawl-gegner.mjs --merge                       # 2 Treffer in scripts/seasons.mjs eintragen
//   node scripts/vollcrawl-gegner.mjs --crawl [--parallel 6]        # 3 fehlende Gegner-Gruppen crawlen (Berichte + Meldelisten)
//   node scripts/vollcrawl-gegner.mjs --gen                         # 4 Datendateien erzeugen, Konsistenz und Lücken prüfen
//   node scripts/vollcrawl-gegner.mjs --all
//
// Gegnervereine = alle Vereine der Tabellen der laufenden Saison (ohne TC
// Pliening, ohne Mannschaftsziffer). Vorsaisons = alle anderen Saisons der
// Registry (scripts/seasons.mjs). Gruppensuche-Ergebnisse liegen in
// scripts/tmp/found-<saison>.json (gitignored), Logs in scripts/tmp/logs/.
//
// Laufzeit (Stand 08.10.2026, 33 Gegner, 4 Vorsaisons): Gruppensuche ca. 3 h
// (vier Chromes parallel), Crawl 2–4 min je Gruppe bei 6 parallelen Prozessen.
// Die Crawler mischen vor jedem Schreiben den Cache von der Platte ein, deshalb
// dürfen beliebig viele Prozesse derselben Saison parallel laufen.

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { ROOT, SEASONS, detectSeason, cacheFile, rosterCacheFile } from "./seasons.mjs";

const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const arg = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };
const ALL = flag("--all");
const PARALLEL = Number(arg("parallel") ?? 6);
const TMP = path.join(ROOT, "scripts/tmp");
const LOGS = path.join(TMP, "logs");
fs.mkdirSync(LOGS, { recursive: true });

const OWN = /pliening/i;
const baseClub = (c) => c.replace(/\s+(II|III|IV|V|VI)$/, "").replace(/\s*\(.*\)$/, "").trim();

const current = detectSeason().season;
const history = (arg("seasons")?.split(",").map((s) => s.trim()) ?? SEASONS.filter((s) => s.id !== current.id).map((s) => s.id))
  .map((id) => SEASONS.find((s) => s.id === id) ?? (() => { throw new Error(`unbekannte Saison ${id}`); })());

/** Gegnervereine der laufenden Saison aus ihrer Datendatei (Tabellen-Zeilen). */
function opponentClubs() {
  const src = fs.readFileSync(path.join(ROOT, current.dataFile), "utf8");
  const clubs = new Set();
  for (const m of src.matchAll(/club: "([^"]+)"/g)) if (!OWN.test(m[1])) clubs.add(baseClub(m[1]));
  return [...clubs].sort((a, b) => a.localeCompare(b, "de"));
}

function run(cmd, args, { log, env } = {}) {
  return new Promise((resolve) => {
    const out = log ? fs.openSync(log, "a") : "inherit";
    const child = spawn(cmd, args, { cwd: ROOT, stdio: ["ignore", out, out], env: { ...process.env, ...env } });
    child.on("exit", (code) => { if (log) fs.closeSync(out); resolve(code ?? 1); });
  });
}

/** Einfacher Prozess-Pool: höchstens `n` Aufgaben gleichzeitig. */
async function pool(items, n, worker) {
  const queue = [...items];
  const results = [];
  const lanes = Array.from({ length: Math.min(n, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      results.push(await worker(item));
    }
  });
  await Promise.all(lanes);
  return results;
}

// ── Phase 1: Gruppensuche ────────────────────────────────────────────────────
async function discover() {
  const clubs = opponentClubs();
  console.log(`Gegnervereine der ${current.label}: ${clubs.length}\n  ${clubs.join(", ")}`);
  console.log(`Vorsaisons: ${history.map((s) => s.label).join(", ")} — Gruppensuche über alle Erwachsenenklassen, parallel.\n`);
  const codes = await Promise.all(history.map((s) => {
    const out = path.join(TMP, `found-${s.id}.json`);
    const log = path.join(LOGS, `discover-${s.id}.log`);
    console.log(`  ${s.label}: → ${path.relative(ROOT, out)} (Log ${path.relative(ROOT, log)})`);
    return run("node", ["scripts/discover-groups.mjs", "--season", s.btvLabel, "--klassen", "alle", "--clubs", clubs.join(","), "--out", out], { log });
  }));
  codes.forEach((c, i) => console.log(`  ${history[i].label}: ${c === 0 ? "fertig" : `FEHLER (Exit ${c})`}`));
}

// ── Phase 2: Treffer in seasons.mjs eintragen ────────────────────────────────
function merge() {
  const file = path.join(ROOT, "scripts/seasons.mjs");
  let src = fs.readFileSync(file, "utf8");
  let added = 0;
  for (const s of history) {
    const found = path.join(TMP, `found-${s.id}.json`);
    if (!fs.existsSync(found)) { console.log(`${s.label}: keine ${path.relative(ROOT, found)} — übersprungen`); continue; }
    const entries = JSON.parse(fs.readFileSync(found, "utf8"));
    const marker = `      // DISCOVER:${s.id}`;
    if (!src.includes(marker)) throw new Error(`Marker "${marker.trim()}" fehlt in scripts/seasons.mjs`);
    const known = new Set([...src.matchAll(/groupid: "(\d+)"/g)].map((m) => m[1]));
    const lines = [];
    for (const e of entries) {
      if (known.has(e.groupid)) continue;
      known.add(e.groupid);
      const clubs = (e.clubs ?? []).join(", ");
      lines.push(`      { groupid: "${e.groupid}", leagueName: ${JSON.stringify(e.leagueName)}, teamLabel: ${JSON.stringify(e.teamLabel)}, mode: "${e.mode}", teamSize: ${e.teamSize}, gegner: true }, // ${clubs}`);
    }
    if (lines.length) src = src.replace(marker, `${lines.join("\n")}\n${marker}`);
    added += lines.length;
    console.log(`${s.label}: ${entries.length} gefunden, ${lines.length} neu eingetragen`);
  }
  fs.writeFileSync(file, src);
  console.log(`\n${added} Gruppen in scripts/seasons.mjs ergänzt.`);
}

// ── Phase 3: fehlende Gegner-Gruppen crawlen ─────────────────────────────────
async function crawl() {
  // Registry frisch laden (Phase 2 hat sie gerade geändert)
  const { SEASONS: fresh } = await import(`./seasons.mjs?${Date.now()}`);
  const jobs = [];
  for (const s of fresh.filter((x) => history.some((h) => h.id === x.id))) {
    const reports = fs.existsSync(cacheFile(s)) ? JSON.parse(fs.readFileSync(cacheFile(s), "utf8")) : {};
    const rosters = fs.existsSync(rosterCacheFile(s)) ? Object.keys(JSON.parse(fs.readFileSync(rosterCacheFile(s), "utf8"))) : [];
    for (const g of s.groups.filter((x) => x.gegner)) {
      const needReports = !reports[g.leagueName];
      const needRosters = !rosters.some((k) => k.startsWith(`${g.leagueName}::`));
      if (needReports || needRosters) jobs.push({ season: s, group: g, needReports, needRosters });
    }
  }
  console.log(`${jobs.length} Gruppen zu crawlen (${PARALLEL} parallel)\n`);
  const env = { CHROME_ARGS: process.env.CHROME_ARGS ?? "--disable-dev-shm-usage --js-flags=--max-old-space-size=512 --renderer-process-limit=1 --blink-settings=imagesEnabled=false" };
  let done = 0;
  const failed = [];
  await pool(jobs, PARALLEL, async ({ season, group, needReports, needRosters }) => {
    const log = path.join(LOGS, `crawl-${season.id}-${group.groupid}.log`);
    const t0 = Date.now();
    let ok = true;
    if (needReports && (await run("node", ["scripts/crawl-spielberichte.mjs", group.groupid, "--season", season.id], { log, env })) !== 0) ok = false;
    if (needRosters && (await run("node", ["scripts/crawl-meldelisten.mjs", group.groupid, "--season", season.id, "--no-gen"], { log, env })) !== 0) ok = false;
    done++;
    const min = ((Date.now() - t0) / 60000).toFixed(1);
    console.log(`  [${done}/${jobs.length}] ${season.id} ${group.leagueName} (${group.teamLabel}) ${ok ? "✓" : "FEHLER"} ${min} min`);
    if (!ok) failed.push(`${season.id} ${group.groupid} ${group.leagueName}`);
  });
  if (failed.length) console.log(`\n${failed.length} Gruppen fehlgeschlagen (Logs in scripts/tmp/logs):\n  ${failed.join("\n  ")}`);
  else console.log("\nAlle Gruppen gecrawlt.");
}

// ── Phase 4: erzeugen und prüfen ─────────────────────────────────────────────
async function gen() {
  for (const [script, args] of [
    ["scripts/generate-spielberichte.mjs", []],
    ["scripts/generate-meldelisten.mjs", []],
    ["scripts/check-data.mjs", ["--all"]],
    ["scripts/check-luecken.mjs", []],
  ]) {
    console.log(`\n$ node ${script} ${args.join(" ")}`);
    const code = await run("node", [script, ...args]);
    if (code !== 0) console.log(`  → Exit ${code}`);
  }
}

if (ALL || flag("--discover")) await discover();
if (ALL || flag("--merge")) merge();
if (ALL || flag("--crawl")) await crawl();
if (ALL || flag("--gen")) await gen();
if (!ALL && !argv.some((a) => ["--discover", "--merge", "--crawl", "--gen"].includes(a))) {
  console.log("Aufruf: node scripts/vollcrawl-gegner.mjs --discover | --merge | --crawl [--parallel n] | --gen | --all  [--seasons a,b]");
}
