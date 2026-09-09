// Der automatische Briefing-Lauf (Wecker): prüft, ob eine TCP-Begegnung der
// laufenden Saison in genau 7, 4 oder 0 Tagen liegt, und liest dann für die
// betroffenen Gruppen die BTV-Berichte neu ein — Spielberichte, Meldelisten,
// Tabellen und Begegnungen (inkl. Verlegungen). Danach schreibt er den
// Datenstand für das ⋯-Menü der App. Committen/Deployen macht der Workflow
// (.github/workflows/briefing.yml), nicht dieses Skript.
//
//   node scripts/briefing-run.mjs               # nur wenn heute etwas fällig ist
//   node scripts/briefing-run.mjs --dry-run     # Plan zeigen, nichts crawlen
//   node scripts/briefing-run.mjs --force       # alle Gruppen mit Begegnungen ab heute einlesen
//   node scripts/briefing-run.mjs --stand-only  # nur src/data/data-stand.ts neu schreiben
//
// Zeit: alles in Europe/Berlin. Der Workflow feuert um 23:00 UND 00:00 UTC;
// bei einem Cron-Lauf arbeitet das Skript nur, wenn es in Berlin 01 Uhr ist
// (sonst Exit 0 ohne Wirkung) — so stimmt die Uhrzeit in Sommer- und Winterzeit.
//
// Ausgabe für den Workflow (GITHUB_OUTPUT): ran=true|false, scope=<Text>.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, resolveSeason, describe, readFileIfExists } from "./seasons.mjs";

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const DRY = has("--dry-run");
const FORCE = has("--force") || process.env.FORCE === "true";
const STAND_ONLY = has("--stand-only");
const OFFSETS = [7, 4, 0];
const RUN_HOUR = 1;
const OWN = /pliening/i;

// ── Berlin-Zeit ──────────────────────────────────────────────────────────────
function berlin(d = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    }).formatToParts(d).map((p) => [p.type, p.value]),
  );
  const off = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Berlin", timeZoneName: "longOffset" })
    .formatToParts(d).find((p) => p.type === "timeZoneName")?.value.replace("GMT", "") || "+00:00";
  const hour = Number(parts.hour) % 24;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour,
    iso: `${parts.year}-${parts.month}-${parts.day}T${String(hour).padStart(2, "0")}:${parts.minute}:${parts.second}${off}`,
    offset: off,
  };
}
const now = berlin();
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
const addDays = (iso, n) => new Date(Date.parse(iso) + n * 86400000).toISOString().slice(0, 10);
const fmt = (iso) => iso.split("-").reverse().join(".");
const WEEKDAY = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function output(kv) {
  const lines = Object.entries(kv).map(([k, v]) => `${k}=${String(v).replace(/\n/g, " ")}`);
  console.log(lines.map((l) => `  → ${l}`).join("\n"));
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, lines.join("\n") + "\n");
}

// Cron-Lauf nur zur Berliner Stunde RUN_HOUR (beide UTC-Crons treffen je nach
// Sommer-/Winterzeit einmal daneben).
if (process.env.GITHUB_EVENT_NAME === "schedule" && now.hour !== RUN_HOUR && !FORCE) {
  console.log(`Berlin ${now.iso}: nicht ${RUN_HOUR} Uhr — dieser Cron-Lauf tut nichts.`);
  output({ ran: false, scope: "" });
  process.exit(0);
}

// ── Saison und TCP-Begegnungen ───────────────────────────────────────────────
const res = resolveSeason(argv);
const season = res.season;
console.log(describe(res));
const src = readFileIfExists(season.matchesFile);
if (!src) {
  console.error(`Keine Spielplan-Datei für ${season.label}.`);
  process.exit(1);
}
const dataSrc = readFileIfExists(season.dataFile) ?? "";
// teamId → { label, league } aus den Team-Konstanten der Datendatei
const teams = new Map();
for (const m of dataSrc.matchAll(/id:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*shortLabel:[^,]+,\s*league:\s*"([^"]+)"/g)) {
  teams.set(m[1], { label: m[2], league: m[3] });
}
// Sommer: Teams stehen in src/data/teams.ts
if (!teams.size) {
  const t = readFileIfExists("src/data/teams.ts") ?? "";
  for (const m of t.matchAll(/id:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*shortLabel:[^,]+,\s*league:\s*"([^"]+)"/g)) {
    teams.set(m[1], { label: m[2], league: m[3] });
  }
}
const matches = [];
for (const m of src.matchAll(/\{\s*teamId:\s*"([^"]+)",\s*date:\s*"(\d{4}-\d{2}-\d{2})",\s*time:\s*"([^"]*)",\s*day:\s*"([^"]*)",\s*home:\s*"([^"]+)",\s*away:\s*"([^"]+)"/g)) {
  const [, teamId, date, time, , home, away] = m;
  const t = teams.get(teamId);
  if (!t) continue;
  matches.push({ teamId, date, time, home, away, opponent: OWN.test(home) ? away : home, ...t });
}
matches.sort((a, b) => a.date.localeCompare(b.date));
console.log(`${matches.length} TCP-Begegnungen in ${season.label}, heute ${now.date} (${now.iso})`);

// ── Fälligkeit und nächster Lauf ────────────────────────────────────────────
const due = matches.filter((m) => OFFSETS.includes(daysBetween(now.date, m.date)));
const selected = FORCE ? matches.filter((m) => m.date >= now.date) : due;

let nextRun = null;
for (const m of matches) {
  for (const off of OFFSETS) {
    const runDate = addDays(m.date, -off);
    if (runDate < now.date || (runDate === now.date && now.hour >= RUN_HOUR)) continue;
    const at = `${runDate}T0${RUN_HOUR}:00:00${berlin(new Date(`${runDate}T12:00:00Z`)).offset}`;
    const reason = off === 0
      ? `Spieltag ${m.label} – ${m.opponent}`
      : `${off} Tage vor ${m.label} – ${m.opponent} (${fmt(m.date).slice(0, 6)})`;
    if (!nextRun || at < nextRun.at) nextRun = { at, reason };
  }
}

for (const m of due) console.log(`  fällig: ${m.label} – ${m.opponent} am ${WEEKDAY[new Date(m.date).getUTCDay()]} ${fmt(m.date)} (in ${daysBetween(now.date, m.date)} Tagen)`);
console.log(nextRun ? `Nächster Lauf: ${nextRun.at} — ${nextRun.reason}` : "Kein weiterer Lauf geplant (keine TCP-Begegnung mehr).");

// ── Datenstand schreiben ─────────────────────────────────────────────────────
function writeStand(scope, crawledAt) {
  const file = path.join(ROOT, "src/data/data-stand.ts");
  const ts = `// ── Datenstand der BTV-Berichte und nächster Briefing-Lauf ──────────────────
// Wird vom automatischen Briefing-Lauf (scripts/briefing-run.mjs) geschrieben —
// nach jedem Einlesen der Spielberichte. Die App zeigt beides im ⋯-Menü.
// Von Hand nur anfassen, wenn der Automat nicht läuft.

export interface DataStand {
  /** Zeitpunkt des letzten Einlesens der BTV-Berichte (ISO, mit Zeitzone) */
  crawledAt: string;
  /** Was eingelesen wurde, z. B. "7 Gruppen der Winterrunde 2026/27" */
  scope: string;
  /** Nächster geplanter Lauf, oder null wenn keine TCP-Begegnung ansteht */
  nextRun: { at: string; reason: string } | null;
}

export const DATA_STAND: DataStand = {
  crawledAt: ${JSON.stringify(crawledAt)},
  scope: ${JSON.stringify(scope)},
  nextRun: ${nextRun ? JSON.stringify(nextRun) : "null"},
};
`;
  fs.writeFileSync(file, ts);
  console.log(`geschrieben: ${path.relative(ROOT, file)}`);
}

if (STAND_ONLY) {
  const cur = readFileIfExists("src/data/data-stand.ts") ?? "";
  const crawledAt = cur.match(/crawledAt:\s*"([^"]+)"/)?.[1] ?? now.iso;
  const scope = cur.match(/scope:\s*"([^"]*)"/)?.[1] ?? "";
  writeStand(scope, crawledAt);
  output({ ran: false, scope: "" });
  process.exit(0);
}

if (!selected.length) {
  console.log("Heute ist keine TCP-Begegnung in 7, 4 oder 0 Tagen — nichts zu tun.");
  output({ ran: false, scope: "" });
  process.exit(0);
}

// ── Gruppen einlesen ─────────────────────────────────────────────────────────
const leagues = [...new Set(selected.map((m) => m.league))];
const groups = season.groups.filter((g) => leagues.includes(g.leagueName));
const missing = leagues.filter((l) => !groups.some((g) => g.leagueName === l));
for (const l of missing) console.error(`  ! keine groupid für ${l} in scripts/seasons.mjs`);
const scope = `${groups.map((g) => g.teamLabel ?? g.leagueName).join(", ")} (${season.label})`;
console.log(`\nEinzulesen: ${scope}`);
if (DRY) {
  console.log("--dry-run: es wird nichts gecrawlt.");
  output({ ran: false, scope });
  process.exit(0);
}

const run = (script, args) => {
  console.log(`\n$ node scripts/${script} ${args.join(" ")}`);
  execFileSync("node", [path.join(ROOT, "scripts", script), ...args], { stdio: "inherit", env: process.env, maxBuffer: 64 * 1024 * 1024 });
};
for (const g of groups) {
  run("crawl-spielberichte.mjs", [g.groupid, "--force", "--season", season.id]);
  run("crawl-meldelisten.mjs", [g.groupid, "--season", season.id]);
}
run("generate-spielberichte.mjs", []);
run("generate-standings.mjs", ["--write", "--season", season.id]);
// Konsistenz: schlägt der Check fehl, bricht der Lauf ab (rot → E-Mail), damit
// nichts Widersprüchliches live geht.
run("check-data.mjs", ["--season", season.id]);
writeStand(scope, berlin().iso);
output({ ran: true, scope });
