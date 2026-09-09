// Saison-Registry für die Skripte — das Gegenstück zu src/data/season-data.ts.
//
// Alle Werkzeuge (Crawler, Generatoren, Prüfskripte) arbeiten auf EINER Saison.
// Welche das ist, muss niemand angeben: `resolveSeason()` liest die Spieltermine
// aus den Datendateien und wählt die Saison, in deren Zeitraum das heutige Datum
// fällt. Trägt jemand im April 2027 die Sommer-27-Termine ein, zieht ab dann
// alles automatisch die Sommerrunde 2027.
//
//   node scripts/seasons.mjs            # zeigt, welche Saison gerade aktiv ist
//
// Eine neue Saison eintragen: Block unten ergänzen (groupids liefert
// `node scripts/discover-groups.mjs`) — mehr braucht keines der Skripte.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// layout: "summer" = Ergebnisse stehen nur in der Kreuztabelle, der Spielplan
//                    (matches.ts) kennt nur Termine.
//         "winter" = jede Begegnung trägt ihr Ergebnis selbst (mp/sets/games/
//                    status) UND steht in der Kreuztabelle.
// prefix: Präfix der Konstanten in der Datendatei (z. B. WINTER_2627_STANDINGS).
// reports/rosters: Dateien mit Spielberichten/Meldelisten, oder null wenn für
//                  diese Saison keine erfasst sind.
export const SEASONS = [
  {
    id: "winter-2627",
    label: "Winter 2026/27",
    layout: "winter",
    prefix: "WINTER_2627",
    dataFile: "src/data/winter-2627.ts",
    matchesFile: "src/data/winter-2627.ts",
    reports: null,
    rosters: null,
    teamSize: 6, // 4 Einzel + 2 Doppel
    groups: [
      { groupid: "2253303", leagueName: "Bayernliga · Gr. 022 SU",   mode: "herren", teamSize: 6 }, // H40
      { groupid: "2253304", leagueName: "Bayernliga · Gr. 029 SU",   mode: "herren", teamSize: 6 }, // H50
      { groupid: "2257785", leagueName: "Südliga 1 · Gr. 119",       mode: "herren", teamSize: 6 }, // H30
      { groupid: "2257803", leagueName: "Südliga 2 · Gr. 129",       mode: "herren", teamSize: 6 }, // H30 II
      { groupid: "2257743", leagueName: "Südliga 1 · Gr. 082",       mode: "damen",  teamSize: 6 }, // D00
      { groupid: "2257871", leagueName: "Südliga 2 · Gr. 200",       mode: "damen",  teamSize: 6 }, // D40
      { groupid: "2253322", leagueName: "Landesliga 1 · Gr. 054 SU", mode: "damen",  teamSize: 6 }, // D50
    ],
  },
  {
    id: "sommer-26",
    label: "Sommer 2026",
    layout: "summer",
    prefix: "SUMMER",
    dataFile: "src/data/summer-2026.ts",
    matchesFile: "src/data/matches.ts",
    reports: "src/data/spielberichte-crawled.ts",
    rosters: "src/data/meldelisten.ts",
    teamSize: 9,
    // Ligen mit zurückgezogenen Mannschaften: die offizielle Tabelle weicht
    // bewusst von den Spielplan-Ergebnissen ab, deshalb handgepflegt lassen.
    keepLeagues: ["Landesliga 2 · Gr. 043 SU", "Südliga 2 · Gr. 315"],
    groups: [
      { groupid: "2215909", leagueName: "Südliga 2 · Gr. 023", mode: "herren", teamSize: 9 },            // H00
      { groupid: "2216174", leagueName: "Südliga 4 (4er) · Gr. 292", mode: "herren", teamSize: 6 },      // H30
      { groupid: "2144934", leagueName: "Regionalliga Süd-Ost · Gr. 004", mode: "herren", teamSize: 9 }, // H40
      { groupid: "2165598", leagueName: "Landesliga 2 · Gr. 043 SU", mode: "herren", teamSize: 9 },      // H40 II
      { groupid: "2219941", leagueName: "Südliga 2 · Gr. 315", mode: "herren", teamSize: 9 },            // H40 III
      { groupid: "2139346", leagueName: "Regionalliga Süd-Ost · Gr. 005", mode: "herren", teamSize: 9 }, // H50
      { groupid: "2224597", leagueName: "Südliga 1 · Gr. 355", mode: "herren", teamSize: 9 },            // H50 II
      { groupid: "2216258", leagueName: "Südliga 3 · Gr. 379", mode: "herren", teamSize: 9 },            // H50 III
      { groupid: "2224594", leagueName: "Südliga 1 · Gr. 404", mode: "herren", teamSize: 9 },            // H60
      { groupid: "2216042", leagueName: "Südliga 2 · Gr. 160", mode: "damen", teamSize: 9 },             // D00
      { groupid: "2216316", leagueName: "Südliga 1 · Gr. 441", mode: "damen", teamSize: 9 },             // D40
      { groupid: "2165662", leagueName: "Landesliga 1 (4er) · Gr. 103 SU", mode: "damen", teamSize: 6 }, // D50
      { groupid: "2216367", leagueName: "Südliga 2 (4er) · Gr. 488", mode: "damen", teamSize: 6 },       // D50 II
      { groupid: "2244334", leagueName: "Spielebene B · Gr. 074", mode: "mixed", teamSize: 6 },          // Mixed
      { groupid: "2216568", leagueName: "Südliga 3 · Gr. 686", mode: "damen", teamSize: 6 },             // Juniorinnen 18
      { groupid: "2216473", leagueName: "Südliga 4 · Gr. 596", mode: "herren", teamSize: 6 },            // Knaben 15
      { groupid: "2216513", leagueName: "Südliga 5 · Gr. 638", mode: "herren", teamSize: 6 },            // Knaben 15 II
      { groupid: "2219939", leagueName: "Südliga 1 · Gr. 870", mode: "mixed", teamSize: 6 },             // Midcourt U10
    ],
  },
  {
    id: "winter-2526",
    label: "Winter 2025/26",
    layout: "winter",
    prefix: "WINTER",
    dataFile: "src/data/winter-2526.ts",
    matchesFile: "src/data/winter-2526.ts",
    reports: null,
    rosters: null,
    teamSize: 6,
    groups: [], // Archiv — die groupids der Saison sind nicht mehr hinterlegt
  },
];

export function seasonById(id) {
  const s = SEASONS.find((x) => x.id === id);
  if (!s) {
    throw new Error(`Unbekannte Saison "${id}". Bekannt: ${SEASONS.map((x) => x.id).join(", ")}`);
  }
  return s;
}

/** Cache-Datei des Spielbericht-Crawls — je Saison eine eigene, damit ein
 *  Winter-Crawl die Sommer-Berichte nicht überschreibt. */
export function cacheFile(season) {
  return path.join(ROOT, `scripts/.spielberichte-cache-${season.id}.json`);
}

export function readFileIfExists(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

/** Alle Spieltermine einer Saison aus ihrer Datendatei (nur die Daten, nach
 *  Datum sortiert). Reicht, um den Zeitraum der Saison zu bestimmen. */
export function seasonDates(season) {
  const src = readFileIfExists(season.matchesFile);
  if (!src) return [];
  return [...src.matchAll(/date:\s*"(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]).sort();
}

/** Zeitraum einer Saison: erster und letzter eingetragener Spieltag. */
export function seasonWindow(season) {
  const dates = seasonDates(season);
  if (!dates.length) return null;
  return { from: dates[0], to: dates[dates.length - 1], count: dates.length };
}

function todayStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Welche Saison ist gerade dran?
 *
 *  1. Läuft eine Saison (heute liegt zwischen erstem und letztem Spieltag) → die.
 *     Bei Überlappung gewinnt die, die früher endet (sie ist eher fertig).
 *  2. Sonst die Saison, die als nächstes beginnt — ab 60 Tagen vor dem ersten
 *     Spieltag, damit Terminverlegungen vor dem Start schon gezogen werden.
 *  3. Sonst die zuletzt beendete (Nachlese nach Rundenende).
 *
 * Rückgabe: { season, reason, window, today }
 */
export function detectSeason(today = todayStr()) {
  const known = SEASONS.map((s) => ({ season: s, window: seasonWindow(s) })).filter((x) => x.window);
  if (!known.length) throw new Error("Keine Saison mit Spielterminen gefunden.");

  const days = (a, b) => Math.round((new Date(a) - new Date(b)) / 86400000);

  const running = known
    .filter((x) => x.window.from <= today && today <= x.window.to)
    .sort((a, b) => a.window.to.localeCompare(b.window.to));
  const upcoming = known
    .filter((x) => x.window.from > today)
    .sort((a, b) => a.window.from.localeCompare(b.window.from));
  const finished = known
    .filter((x) => x.window.to < today)
    .sort((a, b) => b.window.to.localeCompare(a.window.to));

  // Im Übergang zwischen zwei Runden ist die Wahl nicht eindeutig: die alte
  // Saison braucht vielleicht noch eine Nachlese, die neue liegt schon vor.
  // Dann wird die zweite Kandidatin mitgemeldet, statt sie zu verschweigen.
  const hint = (chosen) => {
    const other = [...running, ...upcoming, ...finished].find((x) => x.season.id !== chosen.season.id);
    if (!other) return null;
    if (other.window.to < today && days(today, other.window.to) <= 45) {
      return `${other.season.label} endete vor ${days(today, other.window.to)} Tagen — Nachlese mit --season ${other.season.id}`;
    }
    if (other.window.from > today && days(other.window.from, today) <= 45) {
      return `${other.season.label} startet in ${days(other.window.from, today)} Tagen — mit --season ${other.season.id}`;
    }
    return null;
  };

  let chosen;
  if (running.length) {
    chosen = { ...running[0], reason: "läuft gerade", today };
  } else if (upcoming.length && days(upcoming[0].window.from, today) <= 60) {
    chosen = { ...upcoming[0], reason: `startet in ${days(upcoming[0].window.from, today)} Tagen`, today };
  } else if (finished.length) {
    chosen = { ...finished[0], reason: `endete vor ${days(today, finished[0].window.to)} Tagen`, today };
  } else {
    chosen = { ...upcoming[0], reason: "nächste Saison (Start liegt weiter weg)", today };
  }
  return { ...chosen, alsoRelevant: hint(chosen) };
}

/**
 * Saison für einen Skriptlauf bestimmen: `--season <id>` schlägt die
 * automatische Erkennung. `--season list` zeigt alle bekannten Saisons.
 */
export function resolveSeason(argv = process.argv.slice(2)) {
  const i = argv.indexOf("--season");
  if (i >= 0 && argv[i + 1] && argv[i + 1] !== "auto") {
    const season = seasonById(argv[i + 1]);
    return { season, window: seasonWindow(season), reason: "per --season gewählt", today: todayStr() };
  }
  return detectSeason();
}

/** Einzeiler fürs Log, damit in jedem Skriptlauf sichtbar ist, worauf er wirkt. */
export function describe(res) {
  const w = res.window;
  const range = w ? `${w.from} – ${w.to}, ${w.count} Begegnungen` : "keine Termine";
  let s = `Saison: ${res.season.label} (${res.season.id}) — ${res.reason}; ${range}`;
  if (res.alsoRelevant) s += `\n        Hinweis: ${res.alsoRelevant}`;
  return s;
}

// Direktaufruf: Übersicht aller Saisons und der aktiven.
if (import.meta.url === `file://${process.argv[1]}`) {
  const active = resolveSeason();
  console.log("Bekannte Saisons:\n");
  for (const s of SEASONS) {
    const w = seasonWindow(s);
    const mark = s.id === active.season.id ? "→" : " ";
    const range = w ? `${w.from} – ${w.to}  (${String(w.count).padStart(3)} Begegnungen)` : "(keine Termine)";
    console.log(`${mark} ${s.id.padEnd(13)} ${s.label.padEnd(16)} ${range}  ${s.groups.length} Gruppen, Layout ${s.layout}`);
  }
  console.log(`\n${describe(active)}`);
}
