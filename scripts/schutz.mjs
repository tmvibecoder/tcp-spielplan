// Datenschutz-Transformationen, die generate-data.mjs VOR dem Schreiben der
// JSON-Daten anwendet (Thomas' Auftrag vom 09.10.2026 nach der DSGVO-Prüfung):
//
//   1. Minderjährige (Geburtsjahr ≥ laufendes Jahr − 18, laut irgendeiner
//      Meldeliste) und alle Spieler in Jugend-Konkurrenzen erscheinen überall
//      nur mit Initialen („Bauer, Stephan" → „B., S."), ohne Jahrgang, ohne
//      Nation, und kommen weder in den Suchindex noch in die Vereinsdateien
//      (keine Spielerhistorie, keine Bilanz). Ihre Ergebnisse bleiben in den
//      Spielberichten stehen — als „B., S.", damit die Begegnung stimmt.
//   2. Personen auf der Sperrliste (scripts/sperrliste.json — Widerspruch nach
//      Art. 21 DSGVO) werden genauso behandelt.
//   3. Jahrgang nur noch in den eigenen TCP-Meldelisten (für Gegner entfernt),
//      Nationalitätskennzeichen nirgends mehr (Datenminimierung).
//
// Alles passiert im Generator, nicht in der App: Was die App nicht bekommt,
// kann sie nicht zeigen — und Klartextnamen Minderjähriger liegen so auch nicht
// in public/data.

import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./seasons.mjs";
import { baseClub, normalizePlayerName } from "../src/data/player-key.ts";

const OWN = /pliening/i;
const JUGEND = /junior|juniorinnen|knaben|mädchen|maedchen|midcourt|bambini|jugend|\bu\s?1\d\b|\bu\s?[6-9]\b/i;
const SPERRLISTE_FILE = path.join(ROOT, "scripts/sperrliste.json");

/** Sperrliste: [{ club, name }] — Schlüssel wie im Spielerindex (Verein ohne Ziffer + Name). */
export function loadSperrliste() {
  if (!fs.existsSync(SPERRLISTE_FILE)) return [];
  return JSON.parse(fs.readFileSync(SPERRLISTE_FILE, "utf8")).personen ?? [];
}

const key = (club, name) => `${baseClub(club)}::${normalizePlayerName(name)}`;

/** „Nachname, Vorname" → „N., V." (Titel weg, Doppelnamen auf den ersten Buchstaben). */
export function abbreviate(name) {
  const clean = normalizePlayerName(name).replace(/^(dr|prof|mag|dipl\.?-?ing)\.?\s+/i, "").trim();
  const [last = "", first = ""] = clean.split(",").map((s) => s.trim());
  const ini = (s) => (s.match(/\p{L}/u)?.[0] ?? "").toUpperCase();
  return first ? `${ini(last)}., ${ini(first)}.` : `${ini(last)}.`;
}

/** Sieht ein Name aus wie eine Abkürzung aus abbreviate()? (für den Index-Filter) */
export const isAbbreviated = (name) => /^\p{Lu}\.(, \p{Lu}\.)?$/u.test(name);

/** Spieler-String eines Berichts („Nachname, Vorname NAT* (3, LK9,9)") umschreiben. */
function rewritePlayer(raw, club, protectedKeys, allProtected) {
  if (!raw || raw.startsWith("—")) return raw;
  const m = raw.match(/^(.*?)(\s*\(.*\))?$/);
  const namePart = (m?.[1] ?? raw).replace(/\s+[A-Z]{3}\*?$/, "").trim(); // Nation weg
  const suffix = m?.[2] ?? "";
  const name = normalizePlayerName(namePart);
  const hit = allProtected || protectedKeys.has(key(club, name));
  return `${hit ? abbreviate(name) : namePart}${suffix}`;
}

/**
 * Wendet den Schutz auf alle Gruppen an (in place) und liefert Kennzahlen.
 * @param groups  GroupData[] (season, league, teamLabel, reports, rosters)
 * @param year    Bezugsjahr für die Altersgrenze (Standard: laufendes Jahr)
 */
export function schuetzen(groups, year = new Date().getFullYear()) {
  const grenze = year - 18; // Jahrgang ≥ grenze → kann im Bezugsjahr noch minderjährig sein
  const protectedKeys = new Set();
  for (const g of groups) {
    for (const r of g.rosters) {
      for (const e of [...r.herren, ...r.damen]) {
        if (e.jahrgang && e.jahrgang >= grenze) protectedKeys.add(key(r.club, e.name));
      }
    }
  }
  const minors = protectedKeys.size;
  const sperrliste = loadSperrliste();
  for (const p of sperrliste) protectedKeys.add(key(p.club, p.name));

  let jugendGroups = 0;
  for (const g of groups) {
    const jugend = JUGEND.test(g.teamLabel ?? "") || JUGEND.test(g.league ?? "");
    if (jugend) jugendGroups++;
    for (const r of g.rosters) {
      const own = OWN.test(r.club);
      for (const list of [r.herren, r.damen]) {
        for (const e of list) {
          const hit = jugend || protectedKeys.has(key(r.club, e.name));
          if (hit) e.name = abbreviate(e.name);
          if (!own || hit) delete e.jahrgang;
          delete e.nation;
        }
      }
    }
    for (const b of g.reports) {
      for (const im of b.matches) {
        im.home_player = im.home_player.split(" / ").map((p) => rewritePlayer(p, b.homeClub, protectedKeys, jugend)).join(" / ");
        im.away_player = im.away_player.split(" / ").map((p) => rewritePlayer(p, b.awayClub, protectedKeys, jugend)).join(" / ");
      }
    }
  }
  return { grenze, minors, sperrliste: sperrliste.length, jugendGroups };
}
