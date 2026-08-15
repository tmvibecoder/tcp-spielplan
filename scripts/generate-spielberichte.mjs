// Erzeugt src/data/spielberichte-crawled.ts aus scripts/.spielberichte-cache.json
// (siehe scripts/crawl-spielberichte.mjs) und meldet, wo gecrawlte und
// handgepflegte Berichte inhaltlich auseinandergehen.
//
//   npm run gen:spielberichte
//
// Die handgepflegte src/data/spielberichte.ts bleibt unangetastet; sie hat für
// eine Begegnung Vorrang NUR, wenn die Begegnung im Crawl fehlt (z. B.
// gestrichene Spiele zurückgezogener Mannschaften, die nuLiga nicht mehr zeigt).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseModal } from "./parse-spielbericht.mjs";
import { GROUPS } from "./groups.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, "scripts/.spielberichte-cache.json");
const OUT = path.join(ROOT, "src/data/spielberichte-crawled.ts");

const cache = JSON.parse(fs.readFileSync(CACHE, "utf8"));
const DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const out = [];
let failed = 0;
for (const [league, data] of Object.entries(cache)) {
  const teamSize = GROUPS.find((g) => g.leagueName === league)?.teamSize ?? 9;
  for (const r of data.reports) {
    const idBase = r.meetingId ? `m${r.meetingId}` : `${r.home}_${r.away}`.replace(/\W+/g, "");
    let parsed;
    try {
      parsed = parseModal(r.modal, { keyPrefix: idBase, teamSize });
    } catch (e) {
      console.error(`FEHLER ${league} | ${r.home} – ${r.away}: ${e.message}`);
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
        `HINWEIS ${league} | ${r.home} – ${r.away}: Matchsiege ${parsed.finalHome}:${parsed.finalAway}, offiziell ${r.mp} (Strafwertung?) — offizielles Ergebnis übernommen`
      );
    }
    if (officialUsed) {
      parsed.finalHome = mpH;
      parsed.finalAway = mpA;
    }
    const date = r.date ?? parsed.completedDate;
    out.push({
      league,
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

const esc = (s) => JSON.stringify(s);
let ts = `import type { IndividualMatch } from "../types";
import type { Spielbericht } from "../utils/spielbericht";

// ── Spielberichte, direkt aus dem btv.de-Widget gecrawlt ─────────────────────
// AUTO-GENERIERT von scripts/generate-spielberichte.mjs (npm run gen:spielberichte)
// auf Basis von scripts/crawl-spielberichte.mjs — NICHT von Hand editieren.
// Stand: ${new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}.
// Enthält alle in nuLiga sichtbaren Begegnungen der Sommer-Saison 2026
// (${out.length} Berichte). Handgepflegte Berichte in spielberichte.ts greifen nur
// noch für Begegnungen, die hier fehlen (z. B. gestrichene Spiele zurückgezogener
// Mannschaften).

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
    league: ${esc(b.league)},
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
console.log(`  ${out.length} Berichte, ${matchCount} Einzel/Doppel, ${failed} fehlgeschlagen`);
console.log(`  Überschneidung mit Handdaten: ${overlap.length}; nur in Handdaten: ${onlyHand.length}`);
for (const k of onlyHand) console.log(`    nur Hand: ${k}`);
