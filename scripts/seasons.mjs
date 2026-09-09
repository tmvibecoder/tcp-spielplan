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
// Eine neue Saison eintragen: Block unten ergänzen — groupids liefert
// `npm run season:new -- --discover-only` (laufende Runde) bzw.
// `node scripts/discover-groups.mjs --season "<BTV-Name>"` (jede Runde,
// auch vergangene). Mehr braucht keines der Skripte.
//
// Zwei Arten von Saisons:
//   - mit Spielplan/Tabellen (dataFile gesetzt): erscheinen in der App im
//     Saison-Dropdown, Ergebnisse zieht generate-standings.mjs nach.
//   - nur Historie (dataFile null, historyOnly true): es gibt für sie
//     ausschließlich Spielberichte und Meldelisten — für die Spielerhistorie und
//     die Suche. Die App zeigt keinen Spielplan dafür.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Gemeinsame Ablage der gecrawlten Berichte und Meldelisten (alle Saisons in
// EINER Datei, jeder Eintrag trägt seine Saison).
const REPORTS_FILE = "src/data/spielberichte-crawled.ts";
const ROSTERS_FILE = "src/data/meldelisten.ts";

// layout: "summer" = Ergebnisse stehen nur in der Kreuztabelle, der Spielplan
//                    (matches.ts) kennt nur Termine.
//         "winter" = jede Begegnung trägt ihr Ergebnis selbst (mp/sets/games/
//                    status) UND steht in der Kreuztabelle.
// prefix: Präfix der Konstanten in der Datendatei (z. B. WINTER_2627_STANDINGS).
// btvLabel: Name der Saison im btv.de-Gruppen-Such-Widget (für discover-groups).
// groups: je Gruppe groupid, leagueName (exakt wie in der Datendatei), teamLabel
//         (Konkurrenz des TC Pliening), mode (herren/damen/mixed für die
//         Meldelisten-Nummerierung) und teamSize (9 = 6 Einzel + 3 Doppel,
//         6 = 4 Einzel + 2 Doppel bzw. Mixed).
export const SEASONS = [
  {
    id: "winter-2627",
    label: "Winter 2026/27",
    btvLabel: "Winter 2026/2027",
    layout: "winter",
    prefix: "WINTER_2627",
    dataFile: "src/data/winter-2627.ts",
    matchesFile: "src/data/winter-2627.ts",
    reports: REPORTS_FILE,
    rosters: ROSTERS_FILE,
    teamSize: 6, // 4 Einzel + 2 Doppel
    groups: [
      { groupid: "2253303", leagueName: "Bayernliga · Gr. 022 SU",   teamLabel: "Herren 40",    mode: "herren", teamSize: 6 },
      { groupid: "2253304", leagueName: "Bayernliga · Gr. 029 SU",   teamLabel: "Herren 50",    mode: "herren", teamSize: 6 },
      { groupid: "2257785", leagueName: "Südliga 1 · Gr. 119",       teamLabel: "Herren 30",    mode: "herren", teamSize: 6 },
      { groupid: "2257803", leagueName: "Südliga 2 · Gr. 129",       teamLabel: "Herren 30 II", mode: "herren", teamSize: 6 },
      { groupid: "2257743", leagueName: "Südliga 1 · Gr. 082",       teamLabel: "Damen",        mode: "damen",  teamSize: 6 },
      { groupid: "2257871", leagueName: "Südliga 2 · Gr. 200",       teamLabel: "Damen 40",     mode: "damen",  teamSize: 6 },
      { groupid: "2253322", leagueName: "Landesliga 1 · Gr. 054 SU", teamLabel: "Damen 50",     mode: "damen",  teamSize: 6 },
    ],
  },
  {
    id: "sommer-26",
    label: "Sommer 2026",
    btvLabel: "Sommer 2026",
    layout: "summer",
    prefix: "SUMMER",
    dataFile: "src/data/summer-2026.ts",
    matchesFile: "src/data/matches.ts",
    reports: REPORTS_FILE,
    rosters: ROSTERS_FILE,
    teamSize: 9,
    // Ligen mit zurückgezogenen Mannschaften: die offizielle Tabelle weicht
    // bewusst von den Spielplan-Ergebnissen ab, deshalb handgepflegt lassen.
    keepLeagues: ["Landesliga 2 · Gr. 043 SU", "Südliga 2 · Gr. 315"],
    groups: [
      { groupid: "2215909", leagueName: "Südliga 2 · Gr. 023",               teamLabel: "Herren",         mode: "herren", teamSize: 9 },
      { groupid: "2216174", leagueName: "Südliga 4 (4er) · Gr. 292",         teamLabel: "Herren 30",      mode: "herren", teamSize: 6 },
      { groupid: "2144934", leagueName: "Regionalliga Süd-Ost · Gr. 004",    teamLabel: "Herren 40",      mode: "herren", teamSize: 9 },
      { groupid: "2165598", leagueName: "Landesliga 2 · Gr. 043 SU",         teamLabel: "Herren 40 II",   mode: "herren", teamSize: 9 },
      { groupid: "2219941", leagueName: "Südliga 2 · Gr. 315",               teamLabel: "Herren 40 III",  mode: "herren", teamSize: 9 },
      { groupid: "2139346", leagueName: "Regionalliga Süd-Ost · Gr. 005",    teamLabel: "Herren 50",      mode: "herren", teamSize: 9 },
      { groupid: "2224597", leagueName: "Südliga 1 · Gr. 355",               teamLabel: "Herren 50 II",   mode: "herren", teamSize: 9 },
      { groupid: "2216258", leagueName: "Südliga 3 · Gr. 379",               teamLabel: "Herren 50 III",  mode: "herren", teamSize: 9 },
      { groupid: "2224594", leagueName: "Südliga 1 · Gr. 404",               teamLabel: "Herren 60",      mode: "herren", teamSize: 9 },
      { groupid: "2216042", leagueName: "Südliga 2 · Gr. 160",               teamLabel: "Damen",          mode: "damen",  teamSize: 9 },
      { groupid: "2216316", leagueName: "Südliga 1 · Gr. 441",               teamLabel: "Damen 40",       mode: "damen",  teamSize: 9 },
      { groupid: "2165662", leagueName: "Landesliga 1 (4er) · Gr. 103 SU",   teamLabel: "Damen 50",       mode: "damen",  teamSize: 6 },
      { groupid: "2216367", leagueName: "Südliga 2 (4er) · Gr. 488",         teamLabel: "Damen 50 II",    mode: "damen",  teamSize: 6 },
      { groupid: "2244334", leagueName: "Spielebene B · Gr. 074",            teamLabel: "Mixed",          mode: "mixed",  teamSize: 6 },
      { groupid: "2216568", leagueName: "Südliga 3 · Gr. 686",               teamLabel: "Juniorinnen 18", mode: "damen",  teamSize: 6 },
      { groupid: "2216473", leagueName: "Südliga 4 · Gr. 596",               teamLabel: "Knaben 15",      mode: "herren", teamSize: 6 },
      { groupid: "2216513", leagueName: "Südliga 5 · Gr. 638",               teamLabel: "Knaben 15 II",   mode: "herren", teamSize: 6 },
      { groupid: "2219939", leagueName: "Südliga 1 · Gr. 870",               teamLabel: "Midcourt U10",   mode: "mixed",  teamSize: 6 },
    ],
  },
  {
    id: "winter-2526",
    label: "Winter 2025/26",
    btvLabel: "Winter 2025/2026",
    layout: "winter",
    prefix: "WINTER",
    dataFile: "src/data/winter-2526.ts",
    matchesFile: "src/data/winter-2526.ts",
    reports: REPORTS_FILE,
    rosters: ROSTERS_FILE,
    teamSize: 6,
    // groupids am 09.09.2026 über discover-groups.mjs aus dem btv.de-Archiv geholt
    groups: [
      { groupid: "2114538", leagueName: "Bayernliga · Gr. 022 SU",   teamLabel: "Herren 40", mode: "herren", teamSize: 6 },
      { groupid: "2115145", leagueName: "Südliga 1 · Gr. 109",       teamLabel: "Herren 30", mode: "herren", teamSize: 6 },
      { groupid: "2114563", leagueName: "Landesliga 2 · Gr. 056 SU", teamLabel: "Damen 50",  mode: "damen",  teamSize: 6 },
      // DISCOVER:winter-2526
    ],
  },
  // ── Nur Historie (Spielberichte + Meldelisten für Spielerhistorie und Suche) ──
  {
    id: "sommer-25",
    label: "Sommer 2025",
    btvLabel: "Sommer 2025",
    layout: "summer",
    prefix: null,
    historyOnly: true,
    dataFile: null,
    matchesFile: null,
    reports: REPORTS_FILE,
    rosters: ROSTERS_FILE,
    teamSize: 9,
    groups: [
      // DISCOVER:sommer-25
    ],
  },
  {
    id: "winter-2425",
    label: "Winter 2024/25",
    btvLabel: "Winter 2024/2025",
    layout: "winter",
    prefix: null,
    historyOnly: true,
    dataFile: null,
    matchesFile: null,
    reports: REPORTS_FILE,
    rosters: ROSTERS_FILE,
    teamSize: 6,
    groups: [
      // DISCOVER:winter-2425
    ],
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

/** Cache-Datei des Meldelisten-Crawls, ebenfalls je Saison. */
export function rosterCacheFile(season) {
  return path.join(ROOT, `scripts/.meldelisten-cache-${season.id}.json`);
}

export function readFileIfExists(rel) {
  if (!rel) return null;
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

/** Alle Spieltermine einer Saison aus ihrer Datendatei (nur die Daten, nach
 *  Datum sortiert). Reicht, um den Zeitraum der Saison zu bestimmen.
 *  Saisons ohne Datendatei (nur Historie) haben keine Termine. */
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
 * Saisons ohne Termine (nur Historie) kommen nie automatisch dran — nur per
 * `--season <id>`.
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
  const range = w ? `${w.from} – ${w.to}, ${w.count} Begegnungen` : (res.season.historyOnly ? "nur Historie, keine Termine" : "keine Termine");
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
    const range = w ? `${w.from} – ${w.to}  (${String(w.count).padStart(3)} Begegnungen)` : (s.historyOnly ? "(nur Historie)                     " : "(keine Termine)                    ");
    console.log(`${mark} ${s.id.padEnd(13)} ${s.label.padEnd(16)} ${range}  ${s.groups.length} Gruppen, Layout ${s.layout}`);
  }
  console.log(`\n${describe(active)}`);
}
