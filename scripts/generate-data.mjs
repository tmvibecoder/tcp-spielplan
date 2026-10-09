// Erzeugt die JSON-Daten der App unter public/data aus ALLEN Saison-Caches
// (scripts/.spielberichte-cache-<saison>.json, scripts/.meldelisten-cache-<saison>.json)
// — seit 08.10.2026 der Nachfolger von generate-spielberichte.mjs und
// generate-meldelisten.mjs (beide rufen nur noch dieses Skript auf).
//
//   node scripts/generate-data.mjs              # alle Caches + Bestand → public/data
//   node scripts/generate-data.mjs --import-ts  # einmalige Übernahme der alten TS-Dateien
//
// Drei Dateifamilien (Format: src/data/data-format.ts):
//   public/data/groups/<saison>/<liga-slug>.json   Berichte + Meldelisten einer Gruppe
//   public/data/clubs/<verein-slug>.json           alle Personen eines Vereins mit Einsätzen
//   public/data/search.json                        Suchindex (Spieler, Mannschaften)
// dazu src/data/data-version.ts (Cache-Buster für die App).
//
// Gruppen, für die KEIN Cache vorliegt, werden aus dem Bestand (den vorhandenen
// JSON-Dateien) übernommen — ein Teil-Crawl oder ein Rechner ohne Caches
// (GitHub-Runner) verliert also nichts. Dateien werden nur geschrieben, wenn
// sich ihr Inhalt ändert, damit Commits klein bleiben.
//
// Jeder Bericht trägt seine Saison, weil sich Gruppennummern über die Jahre
// wiederholen („Bayernliga · Gr. 022 SU" gab es im Winter 2025/26 UND 2026/27).

import fs from "node:fs";
import path from "node:path";
import { parseModal } from "./parse-spielbericht.mjs";
import { ROOT, SEASONS, cacheFile, rosterCacheFile } from "./seasons.mjs";
import { groupPath, clubPath, SEARCH_PATH } from "../src/data/data-format.ts";
import { buildIndex } from "../src/data/history-index.ts";
import { encodeGroup, decodeGroup, encodeClub, encodeSearch } from "../src/data/data-codec.ts";
import { schuetzen, isAbbreviated } from "./schutz.mjs";

const argv = process.argv.slice(2);
const PUB = path.join(ROOT, "public");
const DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const order = new Map(SEASONS.map((s, i) => [s.id, i]));
const seasonIds = SEASONS.map((s) => s.id);

// ── 1. Bestand: vorhandene Gruppendateien ────────────────────────────────────
const groups = new Map(); // `${season}::${league}` → GroupData
for (const s of SEASONS) {
  const dir = path.join(PUB, "data/groups", s.id);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const g = decodeGroup(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
    groups.set(`${g.season}::${g.league}`, g);
  }
}
const carried = groups.size;

// Einmalige Übernahme der alten TypeScript-Dateien (Stand vor 08.10.2026):
//   git show <commit>:src/data/spielberichte-crawled.ts > scripts/tmp/spielberichte-crawled-old.ts
//   git show <commit>:src/data/meldelisten.ts > scripts/tmp/meldelisten-old.ts
if (argv.includes("--import-ts")) {
  const sbFile = path.join(ROOT, "scripts/tmp/spielberichte-crawled-old.ts");
  const mlFile = path.join(ROOT, "scripts/tmp/meldelisten-old.ts");
  if (fs.existsSync(sbFile)) {
    const { CRAWLED_SPIELBERICHTE } = await import(sbFile);
    for (const b of CRAWLED_SPIELBERICHTE) {
      const g = ensureGroup(b.season, b.league, b.teamLabel ?? "");
      if (!g.reports.some((x) => x.homeClub === b.homeClub && x.awayClub === b.awayClub)) g.reports.push(b);
    }
    console.log(`TS-Import: ${CRAWLED_SPIELBERICHTE.length} Berichte`);
  }
  if (fs.existsSync(mlFile)) {
    const { MELDELISTEN } = await import(mlFile);
    for (const m of MELDELISTEN) {
      const g = ensureGroup(m.season, m.leagueName, "");
      if (!g.rosters.some((x) => x.club === m.club)) g.rosters.push(m);
    }
    console.log(`TS-Import: ${MELDELISTEN.length} Meldelisten`);
  }
}

function ensureGroup(season, league, teamLabel) {
  const k = `${season}::${league}`;
  let g = groups.get(k);
  if (!g) {
    g = { season, league, teamLabel, reports: [], rosters: [] };
    groups.set(k, g);
  }
  if (teamLabel && !g.teamLabel) g.teamLabel = teamLabel;
  return g;
}

// ── 2. Caches einmischen (Cache schlägt Bestand je Gruppe und Teil) ──────────
let fromCacheReports = 0, fromCacheRosters = 0, failed = 0;
const autoFormat = new Set(); // Ligen, deren Format aus dem Bericht statt der Registry kam
for (const season of SEASONS) {
  const rf = cacheFile(season);
  if (fs.existsSync(rf)) {
    const part = JSON.parse(fs.readFileSync(rf, "utf8"));
    for (const [league, data] of Object.entries(part)) {
      const reg = season.groups.find((x) => x.leagueName === league);
      const teamSize = reg?.teamSize ?? season.teamSize ?? 9;
      const g = ensureGroup(season.id, league, reg?.teamLabel ?? "");
      if (reg?.teamLabel) g.teamLabel = reg.teamLabel;
      const reports = [];
      for (const r of data.reports) {
        const idBase = r.meetingId ? `m${r.meetingId}` : `${season.id}_${r.home}_${r.away}`.replace(/\W+/g, "");
        let parsed;
        try {
          try {
            parsed = parseModal(r.modal, { keyPrefix: idBase, teamSize });
          } catch (e) {
            // Format passt nicht zur Registry (Gegner-Gruppen tragen „4er"/„5er"/„2er"
            // nicht immer im Liganamen) → Format aus dem Bericht selbst lesen
            if (!/Matches statt/.test(e.message)) throw e;
            parsed = parseModal(r.modal, { keyPrefix: idBase, teamSize: "auto" });
            autoFormat.add(`${season.id}::${league}`);
          }
        } catch (e) {
          console.error(`FEHLER ${season.id} ${league} | ${r.home} – ${r.away}: ${e.message}`);
          failed++;
          continue;
        }
        // Endstand: offizielles Ergebnis aus dem Spielplan hat Vorrang. Es kann von
        // der Summe der Matchsiege abweichen, wenn der Spielleiter straft (z. B.
        // "Verstoß gegen die Reihenfolge der Aufstellung" -> Strafwertung der Doppel).
        const [mpH, mpA] = (r.mp ?? "").split(":").map(Number);
        const officialUsed = Number.isFinite(mpH) && Number.isFinite(mpA);
        if (officialUsed && (parsed.finalHome !== mpH || parsed.finalAway !== mpA)) {
          console.warn(`HINWEIS ${season.id} ${league} | ${r.home} – ${r.away}: Matchsiege ${parsed.finalHome}:${parsed.finalAway}, offiziell ${r.mp} (Strafwertung?) — offizielles Ergebnis übernommen`);
        }
        if (officialUsed) { parsed.finalHome = mpH; parsed.finalAway = mpA; }
        const date = r.date ?? parsed.completedDate;
        reports.push({
          season: season.id,
          league,
          teamLabel: g.teamLabel,
          homeClub: r.home,
          awayClub: r.away,
          date,
          day: date ? DAYS[new Date(`${date}T12:00:00Z`).getUTCDay()] : undefined,
          finalHome: parsed.finalHome,
          finalAway: parsed.finalAway,
          matches: parsed.matches.map((mm) => toIndividualMatch(mm)),
        });
      }
      g.reports = reports;
      fromCacheReports++;
    }
  }
  const mf = rosterCacheFile(season);
  if (fs.existsSync(mf)) {
    const part = JSON.parse(fs.readFileSync(mf, "utf8"));
    const byLeague = new Map();
    for (const t of Object.values(part)) {
      if (!t.herren.length && !t.damen.length) continue; // z. B. Midcourt U10 ohne namentliche Meldeliste
      const list = byLeague.get(t.leagueName) ?? [];
      list.push({ season: season.id, leagueName: t.leagueName, club: t.club, herren: t.herren, damen: t.damen });
      byLeague.set(t.leagueName, list);
    }
    for (const [league, rosters] of byLeague) {
      const reg = season.groups.find((x) => x.leagueName === league);
      const g = ensureGroup(season.id, league, reg?.teamLabel ?? "");
      g.rosters = rosters;
      fromCacheRosters++;
    }
  }
}

function toIndividualMatch(mm) {
  return {
    id: mm.id,
    match_score_id: mm.id.split("-")[0],
    position: mm.position,
    match_type: mm.type,
    home_player: mm.home,
    away_player: mm.away,
    set1_home: mm.sets[0]?.[0] ?? null,
    set1_away: mm.sets[0]?.[1] ?? null,
    set2_home: mm.sets[1]?.[0] ?? null,
    set2_away: mm.sets[1]?.[1] ?? null,
    set3_home: mm.sets[2]?.[0] ?? null,
    set3_away: mm.sets[2]?.[1] ?? null,
    winner: mm.winner,
  };
}

// ── 2b. Datenschutz: Minderjährige, Jugend, Sperrliste, Jahrgang, Nation ───────
// (scripts/schutz.mjs — läuft über Bestand UND Caches, deshalb nach dem Mischen)
const schutz = schuetzen([...groups.values()]);

// ── 3. Gruppendateien schreiben ──────────────────────────────────────────────
let written = 0, unchanged = 0;
function writeIfChanged(rel, data) {
  const file = path.join(PUB, rel);
  const json = JSON.stringify(data);
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === json) { unchanged++; return; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, json);
  written++;
}

const allReports = [];
const allRosters = [];
for (const g of [...groups.values()].sort((a, b) => (order.get(a.season) ?? 99) - (order.get(b.season) ?? 99) || a.league.localeCompare(b.league, "de"))) {
  // Nichtleere Gruppen: Berichte nach Datum, Meldelisten nach Verein
  g.reports.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "") || a.homeClub.localeCompare(b.homeClub, "de"));
  g.rosters.sort((a, b) => a.club.localeCompare(b.club, "de"));
  // Konkurrenz/Altersklasse aus der Registry — auch für Gruppen, die nur aus dem
  // Bestand kommen (z. B. Meldelisten vor dem ersten Spieltag)
  const reg = SEASONS.find((s) => s.id === g.season)?.groups.find((x) => x.leagueName === g.league);
  if (reg?.teamLabel) g.teamLabel = reg.teamLabel;
  for (const b of g.reports) if (!b.teamLabel && g.teamLabel) b.teamLabel = g.teamLabel;
  writeIfChanged(groupPath(g.season, g.league), encodeGroup(g));
  allReports.push(...g.reports);
  allRosters.push(...g.rosters);
}

// ── 4. Index je Verein und Suchindex ─────────────────────────────────────────
const index = buildIndex(allReports, allRosters, seasonIds);
// Geschützte Personen (nur noch Initialen) bekommen keine Historie und keinen Sucheintrag
let hidden = 0;
for (const [k, p] of index.players) if (isAbbreviated(p.name)) { index.players.delete(k); hidden++; }
const byClub = new Map();
for (const p of index.players.values()) {
  const list = byClub.get(p.club) ?? [];
  list.push(p);
  byClub.set(p.club, list);
}
for (const [club, players] of byClub) {
  players.sort((a, b) => a.name.localeCompare(b.name, "de"));
  writeIfChanged(clubPath(club), encodeClub({ club, players }));
}
const search = {
  players: [...index.players.values()]
    .map((p) => ({ key: p.key, name: p.name, club: p.club, lk: p.lk, seasons: p.seasons, teamLabel: p.teams[0]?.teamLabel ?? "" }))
    .sort((a, b) => a.name.localeCompare(b.name, "de") || a.club.localeCompare(b.club, "de")),
  teams: index.teams,
};
writeIfChanged(SEARCH_PATH, encodeSearch(search, seasonIds));

// ── 5. Datenstand für den Cache-Buster ───────────────────────────────────────
const versionFile = path.join(ROOT, "src/data/data-version.ts");
if (written > 0 || !fs.existsSync(versionFile)) {
  const v = new Date().toISOString().replace(/[-:]/g, "").slice(0, 13);
  fs.writeFileSync(versionFile, `// AUTO-GENERIERT von scripts/generate-data.mjs — NICHT von Hand editieren.
// Stand der JSON-Daten unter public/data; hängt als ?v= an jede Datenanfrage,
// damit der Browser nach einem Generatorlauf nichts Altes aus dem Cache nimmt.
export const DATA_VERSION = "${v}";
`);
}

// ── Zusammenfassung ──────────────────────────────────────────────────────────
const perSeason = SEASONS.map((s) => {
  const gs = [...groups.values()].filter((g) => g.season === s.id);
  const n = gs.reduce((a, g) => a + g.reports.length, 0);
  const r = gs.reduce((a, g) => a + g.rosters.length, 0);
  return `${s.label}: ${gs.length} Gruppen, ${n} Berichte, ${r} Meldelisten`;
});
const matchCount = allReports.reduce((s, b) => s + b.matches.length, 0);
console.log(`Bestand ${carried} Gruppen, aus Caches ${fromCacheReports} Gruppen mit Berichten und ${fromCacheRosters} mit Meldelisten${failed ? `, ${failed} Berichte fehlgeschlagen` : ""}${autoFormat.size ? `, Format aus dem Bericht gelesen in ${autoFormat.size} Ligen` : ""}`);
for (const line of perSeason) console.log(`  ${line}`);
console.log(`Gesamt: ${allReports.length} Berichte, ${matchCount} Einzel/Doppel, ${allRosters.length} Meldelisten, ${index.players.size} Personen in ${byClub.size} Vereinen`);
console.log(`Datenschutz: ${schutz.minors} Minderjährige (Jahrgang ≥ ${schutz.grenze}) und ${schutz.sperrliste} Sperrlisten-Einträge nur mit Initialen, ${schutz.jugendGroups} Jugend-Gruppen komplett, ${hidden} Personen ohne Historie/Suche; Jahrgang nur in TCP-Listen, keine Nationalität`);
console.log(`public/data: ${written} Dateien geschrieben, ${unchanged} unverändert`);
