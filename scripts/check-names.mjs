// Wie viele Spieler aus den Spielberichten fehlen in der Meldeliste ihrer
// Mannschaft? (Solche erscheinen in der App unter "Weitere Einsätze" — das sind
// echte Ersatzspieler aus anderen Mannschaften des Vereins, kein Fehler.)
//
//   node scripts/check-names.mjs
//
// Liest seit 08.10.2026 die JSON-Gruppendateien unter public/data/groups.

import { loadAllGroups } from "./data-files.mjs";
import { normalizePlayerName } from "../src/data/player-key.ts";

let checked = 0;
const missing = new Map();
for (const g of loadAllGroups()) {
  const rosters = new Map(g.rosters.map((r) => [r.club, new Set([...r.herren, ...r.damen].map((e) => e.name))]));
  for (const b of g.reports) {
    for (const im of b.matches) {
      for (const [club, raw] of [[b.homeClub, im.home_player], [b.awayClub, im.away_player]]) {
        const roster = rosters.get(club);
        if (!roster) continue; // z. B. Midcourt U10 ohne Meldeliste
        for (const part of raw.split(" / ")) {
          const name = normalizePlayerName(part.replace(/\s*\(\d+,\s*LK[\d,]+\)\s*$/, ""));
          if (!name || name.startsWith("—")) continue;
          checked++;
          if (!roster.has(name)) {
            const k = `${g.season} | ${g.league} | ${club} | ${name}`;
            missing.set(k, (missing.get(k) ?? 0) + 1);
          }
        }
      }
    }
  }
}
console.log(`geprüfte Spieler-Nennungen: ${checked}`);
console.log(`nicht in der Meldeliste (= "Weitere Einsätze"): ${missing.size} Spieler`);
for (const [k, n] of [...missing].sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(`  ${n}x  ${k}`);
