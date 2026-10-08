// Lesehilfe für die JSON-Daten der App (public/data, seit 08.10.2026) — für
// Prüfskripte, die ohne Browser über den Bestand laufen (check-data,
// check-names, check-luecken). Schreiben tut nur scripts/generate-data.mjs.

import fs from "node:fs";
import path from "node:path";
import { ROOT, SEASONS } from "./seasons.mjs";
import { decodeGroup, decodeClub, decodeSearch } from "../src/data/data-codec.ts";
import { clubPath, SEARCH_PATH } from "../src/data/data-format.ts";

const PUB = path.join(ROOT, "public");

/** Alle Gruppen (GroupData) einer Saison, alphabetisch nach Liga. */
export function loadGroups(season) {
  const dir = path.join(PUB, "data/groups", season.id);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => decodeGroup(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))));
}

/** Alle Gruppen aller Saisons (Registry-Reihenfolge: neueste zuerst). */
export function loadAllGroups() {
  return SEASONS.flatMap(loadGroups);
}

/** Vereinsdatei (ClubData) oder null, wenn der Verein keine Daten hat. */
export function loadClub(club) {
  const f = path.join(PUB, clubPath(club));
  return fs.existsSync(f) ? decodeClub(JSON.parse(fs.readFileSync(f, "utf8"))) : null;
}

export function loadSearchIndex() {
  const f = path.join(PUB, SEARCH_PATH);
  return fs.existsSync(f) ? decodeSearch(JSON.parse(fs.readFileSync(f, "utf8"))) : { players: [], teams: [] };
}
