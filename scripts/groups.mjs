// Alle Konkurrenzen der Sommer-Saison 2026 mit ihrer internen nuLiga-groupid
// (aus dem btv.de-Link `?groupid=`). Reihenfolge wie in SUMMER_STANDINGS.
//
// mode  = Aufbau der Meldeliste: "herren" | "damen" | "mixed" (Rang-Reset trennt)
// teamSize = Matches je Begegnung: 9 (6 Einzel + 3 Doppel) oder 6 (4 Einzel + 2 Doppel)
//
// Neue groupid finden: Vereinsseite btv.de -> iframe btvteams -> window.open
// abfangen und "Tabelle/Spielplan [PDF]" klicken (liefert `group=<id>`).

export const GROUPS = [
  { groupid: "2215909", leagueName: "Südliga 2 · Gr. 023", mode: "herren", teamSize: 9 },            // H00
  { groupid: "2216174", leagueName: "Südliga 4 (4er) · Gr. 292", mode: "herren", teamSize: 6 },      // H30
  { groupid: "2144934", leagueName: "Regionalliga Süd-Ost · Gr. 004", mode: "herren", teamSize: 9 }, // H40
  { groupid: "2165598", leagueName: "Landesliga 2 · Gr. 043 SU", mode: "herren", teamSize: 9 },      // H40 II
  { groupid: "2219941", leagueName: "Südliga 2 · Gr. 315", mode: "herren", teamSize: 9 },            // H40 III
  { groupid: "2139346", leagueName: "Regionalliga Süd-Ost · Gr. 005", mode: "herren", teamSize: 9 }, // H50
  { groupid: "2224597", leagueName: "Südliga 1 · Gr. 355", mode: "herren", teamSize: 9 },            // H50 II
  { groupid: "2216258", leagueName: "Südliga 3 · Gr. 379", mode: "herren", teamSize: 9 },            // H50 III
  { groupid: "2224594", leagueName: "Südliga 1 · Gr. 404", mode: "herren", teamSize: 9 },            // H60
  { groupid: "2216042", leagueName: "Südliga 2 · Gr. 160", mode: "damen", teamSize: 9 },             // D00
  { groupid: "2216316", leagueName: "Südliga 1 · Gr. 441", mode: "damen", teamSize: 9 },             // D40
  { groupid: "2165662", leagueName: "Landesliga 1 (4er) · Gr. 103 SU", mode: "damen", teamSize: 6 }, // D50
  { groupid: "2216367", leagueName: "Südliga 2 (4er) · Gr. 488", mode: "damen", teamSize: 6 },       // D50 II
  { groupid: "2244334", leagueName: "Spielebene B · Gr. 074", mode: "mixed", teamSize: 6 },          // Mixed
  { groupid: "2216568", leagueName: "Südliga 3 · Gr. 686", mode: "damen", teamSize: 6 },             // Juniorinnen 18
  { groupid: "2216473", leagueName: "Südliga 4 · Gr. 596", mode: "herren", teamSize: 6 },            // Knaben 15
  { groupid: "2216513", leagueName: "Südliga 5 · Gr. 638", mode: "herren", teamSize: 6 },            // Knaben 15 II
  { groupid: "2219939", leagueName: "Südliga 1 · Gr. 870", mode: "mixed", teamSize: 6 },             // Midcourt U10
];
