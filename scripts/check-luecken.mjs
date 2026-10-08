// Lücken-Check (Thomas' Auftrag vom 08.10.2026): Welche gemeldeten Spieler der
// Gegner haben in den erfassten Vorsaisons KEINEN einzigen Einsatz? Eine Häufung
// unter den Spitzenrängen einer Meldeliste heißt fast immer: die Mannschaft,
// in der diese Leute vorher spielten, ist noch nicht gecrawlt (andere
// Altersklasse — Jahrgang 1997 spielt im Sommer „Herren", im Winter darauf
// „Herren 30"). So fiel am 08.10. Hasanbegovic (TC Riemerling) auf.
//
//   node scripts/check-luecken.mjs                 # Gegner der aktiven Saison
//   node scripts/check-luecken.mjs --season <id>   # andere Saison
//   node scripts/check-luecken.mjs --top 8         # Rang-Grenze (Standard 6)
//   node scripts/check-luecken.mjs --alle          # jeden Gemeldeten ohne Einsatz listen
//
// Exit 0 immer — der Check ist ein Hinweisgeber, kein Abbruchkriterium.

import { resolveSeason, describe } from "./seasons.mjs";
import { loadGroups, loadClub } from "./data-files.mjs";
import { baseClub, playerKey } from "../src/data/player-key.ts";

const argv = process.argv.slice(2);
const TOP = Number(argv[argv.indexOf("--top") + 1]) || 6;
const ALLE = argv.includes("--alle");
const OWN = /pliening/i;

const res = resolveSeason(argv);
const season = res.season;
console.log(describe(res));

const clubCache = new Map();
const appearances = (club, name) => {
  const base = baseClub(club);
  if (!clubCache.has(base)) clubCache.set(base, loadClub(base));
  const data = clubCache.get(base);
  const p = data?.players.find((x) => x.key === playerKey(club, name));
  // Einsätze außerhalb der geprüften Saison zählen (Vorsaisons)
  return p ? p.appearances.filter((a) => a.season !== season.id).length : 0;
};

let lists = 0, players = 0, zero = 0, topZero = 0;
const rows = [];
for (const g of loadGroups(season)) {
  if (!g.rosters.some((r) => OWN.test(r.club))) continue; // nur Gruppen mit TC Pliening
  for (const r of g.rosters) {
    if (OWN.test(r.club)) continue;
    lists++;
    const entries = [...r.herren, ...r.damen];
    players += entries.length;
    const missing = entries.filter((e) => appearances(r.club, e.name) === 0);
    zero += missing.length;
    const top = missing.filter((e) => e.rang <= TOP);
    topZero += top.length;
    rows.push({ club: r.club, league: g.league, teamLabel: g.teamLabel, n: entries.length, missing, top });
  }
}

const pct = players ? Math.round((100 * zero) / players) : 0;
console.log(`\nGegner-Meldelisten ${season.label}: ${lists} Listen, ${players} Gemeldete, davon ohne Einsatz in den Vorsaisons: ${zero} (${pct} %), unter den Top ${TOP}: ${topZero}`);
console.log(`\nOhne Einsatz unter den Top ${TOP} (Rang · Name · LK · Jg.):`);
for (const r of rows.sort((a, b) => b.top.length - a.top.length || a.club.localeCompare(b.club, "de"))) {
  const list = ALLE ? r.missing : r.top;
  if (!list.length) continue;
  console.log(`  ${r.club} · ${r.teamLabel} [${r.league}] — ${r.missing.length}/${r.n} ohne Einsatz`);
  for (const e of list) console.log(`      ${String(e.rang).padStart(2)}. ${e.name}  ${e.lk}  Jg. ${e.jahrgang}`);
}
if (!topZero) console.log("  keine — alle Spitzenspieler der Gegner haben erfasste Einsätze.");
