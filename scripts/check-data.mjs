// Konsistenz-Check der Daten einer Saison (ohne Browser). Die Saison wird
// automatisch erkannt — siehe scripts/seasons.mjs.
//
//   node scripts/check-data.mjs                      # aktive Saison
//   node scripts/check-data.mjs --season sommer-26   # andere Saison
//   node scripts/check-data.mjs --all                # alle Saisons nacheinander
//
// Geprüft wird, je nachdem was die Saison hat:
//  1. Hat jede Kreuztabellen-Zelle mit Ergebnis einen Spielbericht?
//  2. Passt die Summe der Matchsiege im Bericht zur Kreuztabellen-Zelle?
//  3. Hat jede Mannschaft aus den Tabellen eine Meldeliste?
//  4. Winter-Layout: trägt jede Begegnung dasselbe Ergebnis wie die Kreuztabelle,
//     und passen Matchpunkte/Sätze zum Format der Runde?

import fs from "node:fs";
import path from "node:path";
import { ROOT, SEASONS, seasonById, resolveSeason, describe } from "./seasons.mjs";

const argv = process.argv.slice(2);
const read = (p) => {
  const f = path.join(ROOT, p);
  return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
};

function checkSeason(season) {
  console.log(`\n═══ ${season.label} (${season.id}) ═══`);

  // ── Saisons ohne Spielplan/Tabellen (nur Spielberichte + Meldelisten für die
  //    Spielerhistorie): Bestand zählen, Berichte auf Vollständigkeit prüfen.
  if (!season.dataFile) {
    const sb = season.reports ? read(season.reports) : null;
    const ml = season.rosters ? read(season.rosters) : null;
    const n = sb ? (sb.match(new RegExp(`season: "${season.id}"`, "g")) ?? []).length : 0;
    const r = ml ? (ml.match(new RegExp(`season: "${season.id}"`, "g")) ?? []).length : 0;
    const leaguesWith = new Set();
    if (sb) for (const block of sb.split(/\n {2}\{\n/).slice(1)) {
      if (block.includes(`season: "${season.id}"`)) leaguesWith.add(block.match(/league: "([^"]+)"/)?.[1]);
    }
    const missing = season.groups.filter((g) => !leaguesWith.has(g.leagueName)).map((g) => g.leagueName);
    console.log(`  nur Historie: ${n} Berichte, ${r} Meldelisten, ${leaguesWith.size}/${season.groups.length} Gruppen mit Berichten`);
    for (const m of missing) console.log(`  OHNE BERICHTE    ${m}`);
    return { fail: 0 };
  }

  // ── Tabellen einlesen
  const st = read(season.dataFile);
  if (!st) {
    console.log(`  Datendatei fehlt: ${season.dataFile}`);
    return { fail: 1 };
  }
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
  console.log(`  Ligen: ${leagues.length}`);

  // ── Spielberichte einlesen (falls die Saison welche hat)
  const reports = new Map();
  const sb = season.reports ? read(season.reports) : null;
  if (sb) {
    for (const block of sb.split(/\n {2}\{\n/).slice(1)) {
      // Berichte anderer Saisons überspringen (gleiche Gruppennummern kommen vor)
      const bs = block.match(/season: "([^"]+)"/)?.[1];
      if (bs && bs !== season.id) continue;
      const league = block.match(/league: "([^"]+)"/)?.[1];
      const home = block.match(/homeClub: "([^"]+)"/)?.[1];
      const away = block.match(/awayClub: "([^"]+)"/)?.[1];
      const fh = Number(block.match(/finalHome: (\d+)/)?.[1]);
      const fa = Number(block.match(/finalAway: (\d+)/)?.[1]);
      const n = (block.match(/\n\s+m\(/g) ?? []).length;
      if (league && home && away) reports.set(`${league}::${home}::${away}`, { fh, fa, n });
    }
  }

  // ── Meldelisten einlesen (falls vorhanden)
  const rosters = new Set();
  const ml = season.rosters ? read(season.rosters) : null;
  if (ml) {
    for (const m of ml.matchAll(/(?:season: "([^"]+)",\s*\n\s*)?leagueName: "([^"]+)",\s*\n\s*club: "([^"]+)"/g)) {
      if (m[1] && m[1] !== season.id) continue;
      rosters.add(`${m[2]}::${m[3]}`);
    }
  }

  let missingReports = 0, wrongResult = 0, missingRoster = 0, cells = 0, ok = 0;
  for (const lg of leagues) {
    for (const row of lg.entries) {
      if (ml && !rosters.has(`${lg.name}::${row.club}`)) {
        console.log(`  OHNE MELDELISTE  ${lg.name} | ${row.club}`);
        missingRoster++;
      }
      row.cross.forEach((res, i) => {
        const opp = lg.entries[i]?.club;
        if (!opp || res === "***" || res === "0:0") return;
        cells++;
        if (!sb) return; // Saison ohne Spielberichte: Zellen nur zählen
        const r = reports.get(`${lg.name}::${row.club}::${opp}`) ?? reports.get(`${lg.name}::${opp}::${row.club}`);
        if (!r) { console.log(`  OHNE BERICHT     ${lg.name} | ${row.club} – ${opp} (${res})`); missingReports++; return; }
        // Zelle ist aus Sicht der Zeile; Bericht kennt Heim/Gast
        const isHome = reports.has(`${lg.name}::${row.club}::${opp}`);
        const expected = isHome ? `${r.fh}:${r.fa}` : `${r.fa}:${r.fh}`;
        if (expected !== res) {
          console.log(`  ERGEBNIS ABWEICHT ${lg.name} | ${row.club} – ${opp}: Tabelle ${res}, Bericht ${expected}`);
          wrongResult++;
        } else ok++;
      });
    }
  }

  // ── Winter-Layout: Begegnungen tragen ihr Ergebnis selbst -> gegen die
  //    Kreuztabelle prüfen. Zwei Quellen, die auseinanderlaufen können.
  let mismatch = 0, played = 0, open = 0;
  if (season.layout === "winter") {
    // teamId -> leagueName
    const teamLeague = new Map();
    for (const m of st.matchAll(/id:\s*"([^"]+)",\s*label:[^,]+,\s*shortLabel:[^,]+,\s*league:\s*"([^"]+)"/g)) {
      teamLeague.set(m[1], m[2]);
    }
    const crossOf = (league, home, away) => {
      const lg = leagues.find((l) => l.name === league);
      if (!lg) return null;
      const r = lg.entries.findIndex((e) => e.club === home);
      const c = lg.entries.findIndex((e) => e.club === away);
      if (r < 0 || c < 0) return null;
      const v = lg.entries[r].cross[c];
      return v === "***" || v === "0:0" ? null : v;
    };
    const maxMp = season.teamSize ?? 6;
    for (const m of st.matchAll(
      /\{ teamId: "([^"]+)",[^\n]*?home: "([^"]+)",\s*away: "([^"]+)",[^\n]*?mp: "([^"]*)",\s*sets: "([^"]*)",\s*games: "([^"]*)",[^\n]*?status: "([^"]+)" \}/g
    )) {
      const [, teamId, home, away, mp, sets, , status] = m;
      const league = teamLeague.get(teamId);
      if (status === "open") { open++; }
      else { played++; }
      const cross = league ? crossOf(league, home, away) : null;
      if (status === "played") {
        if (!mp) {
          console.log(`  MATCH OHNE ERGEBNIS ${league} | ${home} – ${away} (status played, mp leer)`);
          mismatch++;
        } else if (cross && cross !== mp) {
          console.log(`  MATCH ≠ TABELLE  ${league} | ${home} – ${away}: Match ${mp}, Kreuztabelle ${cross}`);
          mismatch++;
        }
        const sum = mp.split(":").map(Number).reduce((a, b) => a + b, 0);
        if (mp && sum > maxMp) {
          console.log(`  UNPLAUSIBEL      ${league} | ${home} – ${away}: ${mp} = ${sum} Matchpunkte, Format erlaubt ${maxMp}`);
          mismatch++;
        }
        // Je Match höchstens 3 Sätze (2 Gewinnsätze + Match-Tiebreak), also
        // maximal 3 × Matchzahl Sätze insgesamt.
        const setSum = sets ? sets.split(":").map(Number).reduce((a, b) => a + b, 0) : 0;
        if (setSum > maxMp * 3) {
          console.log(`  UNPLAUSIBEL      ${league} | ${home} – ${away}: Sätze ${sets} = ${setSum}, Format erlaubt höchstens ${maxMp * 3}`);
          mismatch++;
        }
      } else if (cross) {
        console.log(`  TABELLE ≠ MATCH  ${league} | ${home} – ${away}: Kreuztabelle ${cross}, Match steht auf offen`);
        mismatch++;
      }
    }
  }

  console.log(`\n  Kreuztabellen-Zellen mit Ergebnis: ${cells} (jede Begegnung 2×)`);
  if (sb) {
    console.log(`    mit passendem Bericht: ${ok}`);
    console.log(`    ohne Bericht: ${missingReports}`);
    console.log(`    Ergebnis weicht ab: ${wrongResult}`);
    console.log(`  Berichte gesamt: ${reports.size}`);
  } else {
    console.log(`    (für diese Saison sind keine Spielberichte erfasst — erwartbar)`);
  }
  if (ml) console.log(`  Mannschaften ohne Meldeliste: ${missingRoster}`);
  if (season.layout === "winter") {
    console.log(`  Begegnungen: ${played} gespielt, ${open} offen, ${mismatch} Abweichungen`);
  }
  return { fail: wrongResult + mismatch };
}

let failures = 0;
if (argv.includes("--all")) {
  for (const s of SEASONS) failures += checkSeason(s).fail;
} else {
  const res = resolveSeason(argv);
  console.log(describe(res));
  failures += checkSeason(res.season).fail;
}
if (failures) {
  console.log(`\n${failures} Abweichung(en) — bitte prüfen.`);
  process.exit(1);
}
console.log("\nKeine Abweichungen.");
