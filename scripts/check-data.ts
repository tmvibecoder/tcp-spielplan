// Konsistenz-Check der nuLiga-Daten. Lauf: `npm run check`
//
// Prüft die Sanity-Checks aus der README automatisch, statt sie beim Eintragen
// von Hand zu machen:
//   1. Doppelte/gespiegelte Spielbericht-Schlüssel
//   2. Summe der gewonnenen Einzel/Doppel  ==  Endstand der Begegnung
//   3. Gewinner je Match  ==  Satz-Ergebnis (Walkover ausgenommen)
//   4. Endstand der Begegnung  ==  Wert in der Kreuztabelle (beide Richtungen)
//   5. Vereinsnamen in Spielberichten/Spielplan existieren in der Tabelle
//      (sonst schlägt getSpielbericht still fehl)
//   6. Kreuztabellen sind quadratisch und spiegelsymmetrisch
//
// Exit-Code 1, sobald ein Fehler gefunden wird.

import { SUMMER_STANDINGS } from "../src/data/summer-2026.ts";
import { MATCHES } from "../src/data/matches.ts";
import { TEAMS } from "../src/data/teams.ts";
import { getAllSpielberichte } from "../src/data/spielberichte.ts";

const errors: string[] = [];
const warnings: string[] = [];

const fail = (m: string) => errors.push(m);
const warn = (m: string) => warnings.push(m);

const leagues = new Map(SUMMER_STANDINGS.map((l) => [l.leagueName, l]));
const berichte = getAllSpielberichte();

// ── 1. Doppelte / gespiegelte Schlüssel ──────────────────────────────────────
const seen = new Map<string, string>();
for (const b of berichte) {
  const label = `${b.homeClub} – ${b.awayClub} (${b.league})`;
  const fwd = `${b.league}::${b.homeClub}::${b.awayClub}`;
  const rev = `${b.league}::${b.awayClub}::${b.homeClub}`;
  if (seen.has(fwd)) fail(`Doppelter Spielbericht: ${label}`);
  else if (seen.has(rev)) fail(`Gespiegelter Doppel-Eintrag: ${label} — überschreibt ${seen.get(rev)}`);
  else seen.set(fwd, label);
}

// ── 2.–3. Interne Stimmigkeit je Spielbericht ────────────────────────────────
for (const b of berichte) {
  const label = `${b.homeClub} ${b.finalHome}:${b.finalAway} ${b.awayClub} (${b.league}, ${b.date})`;

  const wonHome = b.matches.filter((m) => m.winner === "home").length;
  const wonAway = b.matches.filter((m) => m.winner === "away").length;
  if (wonHome !== b.finalHome || wonAway !== b.finalAway) {
    fail(`Endstand passt nicht zu den Einzelergebnissen: ${label} — gezählt ${wonHome}:${wonAway}`);
  }

  if (b.matches.length !== b.finalHome + b.finalAway) {
    fail(`Anzahl Matches (${b.matches.length}) != Endstand-Summe (${b.finalHome + b.finalAway}): ${label}`);
  }

  const positions = b.matches.map((m) => m.position);
  if (new Set(positions).size !== positions.length) {
    fail(`Doppelte Position in ${label}: [${positions.join(", ")}]`);
  }

  for (const m of b.matches) {
    const sets: Array<[number, number]> = [];
    if (m.set1_home != null && m.set1_away != null) sets.push([m.set1_home, m.set1_away]);
    if (m.set2_home != null && m.set2_away != null) sets.push([m.set2_home, m.set2_away]);
    if (m.set3_home != null && m.set3_away != null) sets.push([m.set3_home, m.set3_away]);

    const walkover = /\(w\.o\.\)/.test(m.home_player) || /\(w\.o\.\)/.test(m.away_player);
    if (sets.length === 0) {
      if (!walkover) warn(`Match ohne Sätze und ohne (w.o.): ${label} · Pos ${m.position}`);
      continue;
    }
    if (walkover) continue; // abgebrochene w.o.-Partien haben Teil-Sätze

    const setsHome = sets.filter(([h, a]) => h > a).length;
    const setsAway = sets.filter(([h, a]) => a > h).length;
    const bySets = setsHome > setsAway ? "home" : setsAway > setsHome ? "away" : null;
    if (bySets && bySets !== m.winner) {
      fail(
        `Gewinner passt nicht zu den Sätzen: ${label} · Pos ${m.position} ` +
          `(${sets.map((s) => s.join("-")).join(" ")}) → laut Sätzen ${bySets}, eingetragen ${m.winner}`,
      );
    }
  }
}

// ── 4.–5. Abgleich mit Tabelle / Kreuztabelle ────────────────────────────────
for (const b of berichte) {
  const league = leagues.get(b.league);
  if (!league) {
    fail(`Unbekannte Liga im Spielbericht: "${b.league}" (${b.homeClub} – ${b.awayClub})`);
    continue;
  }
  const home = league.entries.find((e) => e.club === b.homeClub);
  const away = league.entries.find((e) => e.club === b.awayClub);
  if (!home) fail(`Verein "${b.homeClub}" fehlt in der Tabelle "${b.league}" — Lookup schlägt still fehl`);
  if (!away) fail(`Verein "${b.awayClub}" fehlt in der Tabelle "${b.league}" — Lookup schlägt still fehl`);
  if (!home || !away) continue;

  const cell = home.crossResults[away.rank - 1];
  const expected = `${b.finalHome}:${b.finalAway}`;
  if (cell !== expected) {
    fail(
      `Kreuztabelle weicht ab: ${b.league} · ${b.homeClub} – ${b.awayClub} — ` +
        `Spielbericht ${expected}, Tabelle "${cell}"`,
    );
  }
  const mirror = away.crossResults[home.rank - 1];
  const expectedMirror = `${b.finalAway}:${b.finalHome}`;
  if (mirror !== expectedMirror) {
    fail(
      `Kreuztabelle-Spiegel weicht ab: ${b.league} · ${b.awayClub} – ${b.homeClub} — ` +
        `erwartet "${expectedMirror}", Tabelle "${mirror}"`,
    );
  }
}

// ── 6. Kreuztabellen-Struktur ────────────────────────────────────────────────
for (const league of SUMMER_STANDINGS) {
  const n = league.entries.length;
  league.entries.forEach((e, i) => {
    if (e.rank !== i + 1) fail(`${league.leagueName}: Eintrag ${i + 1} hat rank ${e.rank} (Reihenfolge != Rang)`);
    if (e.crossResults.length !== n) {
      fail(`${league.leagueName}: "${e.club}" hat ${e.crossResults.length} crossResults, erwartet ${n}`);
    }
    if (e.crossResults[i] !== "***") {
      fail(`${league.leagueName}: "${e.club}" hat auf der Diagonale "${e.crossResults[i]}" statt "***"`);
    }
  });

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = league.entries[i].crossResults[j];
      const b = league.entries[j].crossResults[i];
      if (a === "***" || b === "***") continue;
      const flip = (s: string) => s.split(":").reverse().join(":");
      if (a !== flip(b)) {
        fail(
          `${league.leagueName}: Kreuztabelle unsymmetrisch — ` +
            `"${league.entries[i].club}" vs "${league.entries[j].club}": "${a}" / "${b}"`,
        );
      }
    }
  }

  const own = league.entries.filter((e) => e.isOwnClub);
  if (own.length !== 1) fail(`${league.leagueName}: ${own.length} Einträge mit isOwnClub (erwartet genau 1)`);
  else if (own[0].rank !== league.ownRank) {
    fail(`${league.leagueName}: ownRank=${league.ownRank}, isOwnClub steht aber auf Rang ${own[0].rank}`);
  }
}

// ── 5b. Spielplan-Gegner gegen Tabelle ───────────────────────────────────────
const teamLeague = new Map(TEAMS.map((t) => [t.id, t.league]));
for (const match of MATCHES) {
  const leagueName = teamLeague.get(match.teamId);
  if (!leagueName) {
    fail(`Spielplan: unbekannte teamId "${match.teamId}"`);
    continue;
  }
  const league = leagues.get(leagueName);
  if (!league) continue; // Jugend hat bewusst keine Tabelle
  const clubs = new Set(league.entries.map((e) => e.club));
  for (const club of [match.home, match.away]) {
    // zurückgezogene Teams stehen mit Zusatz in der Tabelle
    const known = clubs.has(club) || [...clubs].some((c) => c.replace(/ \(zurückgezogen\)$/, "") === club);
    if (!known) {
      warn(`Spielplan ${match.date} (${match.teamId}): "${club}" steht nicht in der Tabelle "${leagueName}"`);
    }
  }
}

// ── Ausgabe ──────────────────────────────────────────────────────────────────
const pliening = berichte.filter((b) => /^TC Pliening/.test(b.homeClub) || /^TC Pliening/.test(b.awayClub));
console.log(`Spielberichte gesamt: ${berichte.length}  (davon mit TC Pliening: ${pliening.length})`);
console.log(`Ligen mit Tabelle:    ${SUMMER_STANDINGS.length}`);
console.log(`Spielplan-Begegnungen: ${MATCHES.length}\n`);

for (const w of warnings) console.log(`⚠️  ${w}`);
if (warnings.length) console.log("");

if (errors.length === 0) {
  console.log("✅ Keine Inkonsistenzen gefunden.");
} else {
  for (const e of errors) console.log(`❌ ${e}`);
  console.log(`\n${errors.length} Fehler.`);
  process.exit(1);
}
