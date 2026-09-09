// Erzeugt src/data/spielberichte-crawled.ts aus ALLEN Saison-Caches
// (scripts/.spielberichte-cache-<saison>.json, siehe crawl-spielberichte.mjs)
// und meldet, wo gecrawlte und handgepflegte Berichte auseinandergehen.
//
//   npm run gen:spielberichte
//
// Die Datei wird komplett neu geschrieben. Ligen, für die KEIN Cache vorliegt,
// werden aus der bestehenden Datei übernommen (siehe unten) — ein Teil-Crawl
// oder ein Rechner ohne Caches (GitHub-Runner) verliert also nichts.
//
// Jeder Bericht trägt seine Saison (`season`). Das ist nötig, weil sich
// Gruppennummern über die Jahre wiederholen („Bayernliga · Gr. 022 SU" gab es
// in der Winterrunde 2025/26 UND 2026/27) — der Lookup läuft deshalb immer
// über Saison + Liga + beide Vereine.
//
// Die handgepflegte src/data/spielberichte.ts bleibt unangetastet; sie hat für
// eine Begegnung Vorrang NUR, wenn die Begegnung im Crawl fehlt (z. B.
// gestrichene Spiele zurückgezogener Mannschaften, die nuLiga nicht mehr zeigt).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseModal } from "./parse-spielbericht.mjs";
import { SEASONS, cacheFile } from "./seasons.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src/data/spielberichte-crawled.ts");

// Alle Saison-Caches zusammenführen, Schlüssel = Saison + Liga.
const entries = []; // { season, league, teamLabel, teamSize, data }
const seasonsWithCache = [];
for (const season of SEASONS) {
  const f = cacheFile(season);
  if (!fs.existsSync(f)) continue;
  const part = JSON.parse(fs.readFileSync(f, "utf8"));
  const n = Object.keys(part).length;
  console.log(`Cache ${season.id}: ${n} Ligen`);
  seasonsWithCache.push(season);
  for (const [league, data] of Object.entries(part)) {
    const g = season.groups.find((x) => x.leagueName === league);
    entries.push({ season: season.id, league, teamLabel: g?.teamLabel ?? "", teamSize: g?.teamSize ?? season.teamSize ?? 9, data });
  }
}
if (!entries.length) console.log("Kein Saison-Cache vorhanden — die Datei wird aus dem Bestand neu geschrieben.");

// Ligen ohne Cache (z. B. auf dem GitHub-Runner, wo die gitignorierten Caches
// fehlen, oder nach einem Rechnerwechsel) werden aus dem BESTAND übernommen:
// die bestehende Datendatei wird per Node-Typ-Stripping importiert und alles,
// was kein Cache abdeckt, unverändert wieder herausgeschrieben. So löscht ein
// Teil-Crawl nie andere Ligen oder Saisons.
const covered = new Set(entries.map((e) => `${e.season}::${e.league}`));
const carried = [];
if (fs.existsSync(OUT)) {
  const mod = await import(OUT);
  for (const b of mod.CRAWLED_SPIELBERICHTE) {
    const season = b.season ?? SEASONS.find((s) => s.groups.some((g) => g.leagueName === b.league))?.id;
    if (!season || covered.has(`${season}::${b.league}`)) continue;
    carried.push({ ...b, season });
  }
  const carriedLeagues = new Set(carried.map((b) => `${b.season}::${b.league}`));
  if (carriedLeagues.size) console.log(`Aus Bestand übernommen (kein Cache): ${carriedLeagues.size} Ligen, ${carried.length} Berichte`);
}

const DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const out = [];
let failed = 0;
for (const { season, league, teamLabel, teamSize, data } of entries) {
  for (const r of data.reports) {
    const idBase = r.meetingId ? `m${r.meetingId}` : `${season}_${r.home}_${r.away}`.replace(/\W+/g, "");
    let parsed;
    try {
      parsed = parseModal(r.modal, { keyPrefix: idBase, teamSize });
    } catch (e) {
      console.error(`FEHLER ${season} ${league} | ${r.home} – ${r.away}: ${e.message}`);
      failed++;
      continue;
    }
    // Endstand: offizielles Ergebnis aus dem Spielplan hat Vorrang. Es kann von
    // der Summe der Matchsiege abweichen, wenn der Spielleiter straft (z. B.
    // "Verstoß gegen die Reihenfolge der Aufstellung" -> Strafwertung der Doppel).
    const [mpH, mpA] = (r.mp ?? "").split(":").map(Number);
    const officialUsed = Number.isFinite(mpH) && Number.isFinite(mpA);
    if (officialUsed && (parsed.finalHome !== mpH || parsed.finalAway !== mpA)) {
      console.warn(
        `HINWEIS ${season} ${league} | ${r.home} – ${r.away}: Matchsiege ${parsed.finalHome}:${parsed.finalAway}, offiziell ${r.mp} (Strafwertung?) — offizielles Ergebnis übernommen`
      );
    }
    if (officialUsed) {
      parsed.finalHome = mpH;
      parsed.finalAway = mpA;
    }
    const date = r.date ?? parsed.completedDate;
    out.push({
      season,
      league,
      teamLabel,
      homeClub: r.home,
      awayClub: r.away,
      date,
      day: date ? DAYS[new Date(`${date}T12:00:00Z`).getUTCDay()] : undefined,
      finalHome: parsed.finalHome,
      finalAway: parsed.finalAway,
      meetingId: r.meetingId,
      matches: parsed.matches,
    });
  }
}

// Bestand ohne Cache anhängen — Sätze aus dem IndividualMatch-Format zurückholen
for (const b of carried) {
  out.push({
    season: b.season,
    league: b.league,
    teamLabel: b.teamLabel ?? "",
    homeClub: b.homeClub,
    awayClub: b.awayClub,
    date: b.date,
    day: b.day,
    finalHome: b.finalHome,
    finalAway: b.finalAway,
    meetingId: null,
    matches: b.matches.map((im) => ({
      id: im.id,
      position: im.position,
      type: im.match_type,
      home: im.home_player,
      away: im.away_player,
      sets: [[im.set1_home, im.set1_away], [im.set2_home, im.set2_away], [im.set3_home, im.set3_away]].filter(([h, a]) => h != null && a != null),
      winner: im.winner,
    })),
  });
}
// Neueste Saison zuerst, innerhalb der Saison stabile Reihenfolge
const order = new Map(SEASONS.map((s, i) => [s.id, i]));
out.sort((a, b) => (order.get(a.season) ?? 99) - (order.get(b.season) ?? 99));

// ── Abgleich mit den Handdaten (nur Report, kein Eingriff) ───────────────────
const src = fs.readFileSync(path.join(ROOT, "src/data/spielberichte.ts"), "utf8");
const handKeys = new Set();
for (const block of src.split(/const SB_[A-Za-z0-9_]+: Spielbericht = \{/).slice(1)) {
  const b = block.slice(0, block.indexOf("\n};"));
  const l = b.match(/league: "([^"]+)"/)?.[1];
  const h = b.match(/homeClub: "([^"]+)"/)?.[1];
  const a = b.match(/awayClub: "([^"]+)"/)?.[1];
  if (l && h && a) handKeys.add(`${l}::${h}::${a}`);
}
const crawledKeys = new Set(out.map((b) => `${b.league}::${b.homeClub}::${b.awayClub}`));
const onlyHand = [...handKeys].filter((k) => !crawledKeys.has(k));
const overlap = [...crawledKeys].filter((k) => handKeys.has(k));

const perSeason = SEASONS.filter((s) => out.some((b) => b.season === s.id)).map((s) => {
  const n = out.filter((b) => b.season === s.id).length;
  return `${s.label} (${n})`;
}).join(", ");

const esc = (s) => JSON.stringify(s);
let ts = `import type { IndividualMatch } from "../types";
import type { Spielbericht } from "../utils/spielbericht";

// ── Spielberichte, direkt aus dem btv.de-Widget gecrawlt ─────────────────────
// AUTO-GENERIERT von scripts/generate-spielberichte.mjs (npm run gen:spielberichte)
// auf Basis von scripts/crawl-spielberichte.mjs — NICHT von Hand editieren.
// Stand: ${new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}.
// Enthält alle in nuLiga sichtbaren Begegnungen der Saisons ${perSeason}
// — ${out.length} Berichte. Jeder Bericht trägt seine Saison, weil sich
// Gruppennummern über die Jahre wiederholen. Handgepflegte Berichte in
// spielberichte.ts greifen nur für Begegnungen, die hier fehlen (z. B.
// gestrichene Spiele zurückgezogener Mannschaften).

function m(
  id: string,
  position: number,
  type: "singles" | "doubles",
  home: string,
  away: string,
  sets: Array<[number, number]>,
  winner: "home" | "away",
): IndividualMatch {
  return {
    id,
    match_score_id: id.split("-")[0],
    position,
    match_type: type,
    home_player: home,
    away_player: away,
    set1_home: sets[0]?.[0] ?? null,
    set1_away: sets[0]?.[1] ?? null,
    set2_home: sets[1]?.[0] ?? null,
    set2_away: sets[1]?.[1] ?? null,
    set3_home: sets[2]?.[0] ?? null,
    set3_away: sets[2]?.[1] ?? null,
    winner,
  };
}

export const CRAWLED_SPIELBERICHTE: Spielbericht[] = [
`;
for (const b of out) {
  ts += `  {
    season: ${esc(b.season)},
    league: ${esc(b.league)},
    teamLabel: ${esc(b.teamLabel)},
    homeClub: ${esc(b.homeClub)},
    awayClub: ${esc(b.awayClub)},
    date: ${esc(b.date)},
    day: ${esc(b.day ?? "")},
    finalHome: ${b.finalHome},
    finalAway: ${b.finalAway},
    matches: [
${b.matches
  .map(
    (mm) =>
      `      m(${esc(mm.id)}, ${mm.position}, ${esc(mm.type)}, ${esc(mm.home)}, ${esc(mm.away)}, [${mm.sets
        .map((s) => `[${s[0]}, ${s[1]}]`)
        .join(", ")}], ${esc(mm.winner)}),`
  )
  .join("\n")}
    ],
  },
`;
}
ts += `];
`;
fs.writeFileSync(OUT, ts);

const matchCount = out.reduce((s, b) => s + b.matches.length, 0);
console.log(`geschrieben: ${OUT}`);
console.log(`  ${out.length} Berichte, ${matchCount} Einzel/Doppel, ${failed} fehlgeschlagen — ${perSeason}`);
console.log(`  Überschneidung mit Handdaten: ${overlap.length}; nur in Handdaten: ${onlyHand.length}`);
for (const k of onlyHand) console.log(`    nur Hand: ${k}`);
