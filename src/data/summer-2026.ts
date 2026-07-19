import type { LeagueStandings } from "../types";

// ── Sommer 2026 Tabellen / Standings ──
// Quelle: offizielle BTV nuLiga "Ergebnistabellen gesamt" (vereinsweiter Report, alle Mannschaften):
//   https://btv.liga.nu/.../nuDokument?dokument=ResultReportFOP&type=full&club=22844&season=18103
//   (club=22844 = TC Pliening, season=18103 = Sommer 2026; verlinkt auf der btv.de-Vereinsseite)
// Tabellen + Kreuztabellen 1:1 aus dem offiziellen Report übernommen. Stand: 29.06.2026;
// Die fünf Spielbericht-Konkurrenzen (Gr. 023, 292, 004, 315, 160) auf Endstand
// gebracht (Report vom 19.07.2026).
// Hinweis: Bei zurückgezogenen Mannschaften weichen offizielle Matchpunkte und
// Kreuztabelle ab (BTV streicht gewertete Spiele aus der Tabelle) — Werte verbatim wie offiziell.
// crossResults: "***" = Diagonale, "0:0" = noch nicht gespielt (zeigt "n.a.").

export const SUMMER_STANDINGS: LeagueStandings[] = [
  // ── Herren Südliga 2  Gr. 023 ──
  // Endstand (Report vom 19.07.2026), alle 7 Spieltage: Pliening–Finsing (28.06.)
  // blieb ungespielt und steht auch offiziell mit 0:0.
  {
    teamLabel: "Herren",
    teamColor: "#0ea5e9",
    leagueName: "Südliga 2 · Gr. 023",
    ownRank: 5,
    entries: [
      { rank: 1, club: "TF Markt Schwaben", isOwnClub: false, points: "14:0", matchPoints: "49:14", sets: "102:33", crossResults: ["***", "7:2", "6:3", "7:2", "9:0", "7:2", "6:3", "7:2"] },
      { rank: 2, club: "TSV Feldkirchen II", isOwnClub: false, points: "12:2", matchPoints: "51:12", sets: "106:30", crossResults: ["2:7", "***", "8:1", "9:0", "9:0", "8:1", "9:0", "6:3"] },
      { rank: 3, club: "TC Aschheim III", isOwnClub: false, points: "10:4", matchPoints: "42:21", sets: "87:50", crossResults: ["3:6", "1:8", "***", "5:4", "9:0", "8:1", "8:1", "8:1"] },
      { rank: 4, club: "TC Finsing", isOwnClub: false, points: "6:6", matchPoints: "25:29", sets: "58:62", crossResults: ["2:7", "0:9", "4:5", "***", "0:0", "6:3", "6:3", "7:2"] },
      { rank: 5, club: "TC Pliening", isOwnClub: true , points: "4:8", matchPoints: "19:35", sets: "43:74", crossResults: ["0:9", "0:9", "0:9", "0:0", "***", "2:7", "8:1", "9:0"] },
      { rank: 6, club: "TC Unterföhring II", isOwnClub: false, points: "4:10", matchPoints: "26:37", sets: "58:77", crossResults: ["2:7", "1:8", "1:8", "3:6", "7:2", "***", "4:5", "8:1"] },
      { rank: 7, club: "Polizei SV Haar", isOwnClub: false, points: "2:12", matchPoints: "17:46", sets: "39:97", crossResults: ["3:6", "0:9", "1:8", "3:6", "1:8", "5:4", "***", "4:5"] },
      { rank: 8, club: "TC Erding II", isOwnClub: false, points: "2:12", matchPoints: "14:49", sets: "35:105", crossResults: ["2:7", "3:6", "1:8", "2:7", "0:9", "1:8", "5:4", "***"] },
    ],
  },
  // ── Herren 30 Südliga 4 (4er)  Gr. 292 ──
  // Endstand (Report vom 19.07.2026): inkl. Nachholspiel Finsing–Philathlos 4:2
  // (27.06., abgeschlossen 18.07., meeting 12692775); Oberpframmern–Putzbrunn blieb
  // ungespielt (0:0). Rangfolge verbatim wie offizieller Report (Finsing mit 6:2 aus
  // 4 Spielen vor Pliening mit 5:3 aus 4 Spielen).
  {
    teamLabel: "Herren 30",
    teamColor: "#22d3ee",
    leagueName: "Südliga 4 (4er) · Gr. 292",
    ownRank: 3,
    entries: [
      { rank: 1, club: "TC Finsing", isOwnClub: false, points: "6:2", matchPoints: "14:10", sets: "33:24", crossResults: ["***", "4:2", "2:4", "4:2", "4:2"] },
      { rank: 2, club: "TSV Oberpframmern", isOwnClub: false, points: "4:2", matchPoints: "13:5", sets: "27:11", crossResults: ["2:4", "***", "5:1", "0:0", "6:0"] },
      { rank: 3, club: "TC Pliening", isOwnClub: true , points: "5:3", matchPoints: "14:10", sets: "29:24", crossResults: ["4:2", "1:5", "***", "6:0", "3:3"] },
      { rank: 4, club: "TC Putzbrunn", isOwnClub: false, points: "2:4", matchPoints: "6:12", sets: "17:27", crossResults: ["2:4", "0:0", "0:6", "***", "4:2"] },
      { rank: 5, club: "TC Philathlos München", isOwnClub: false, points: "1:7", matchPoints: "7:17", sets: "16:36", crossResults: ["2:4", "0:6", "3:3", "2:4", "***"] },
    ],
  },
  // ── Herren 40 Regionalliga Süd-Ost  Gr. 004 ──
  // Endstand (Report vom 19.07.2026): inkl. Nachholspiele Gräfelfing–Iphitos 2:7 und
  // Dresden–Kottern 9:0 (Termin 27.06., abgeschlossen 12./11.07.) — Saison komplett.
  {
    teamLabel: "Herren 40",
    teamColor: "#38bdf8",
    leagueName: "Regionalliga Süd-Ost · Gr. 004",
    ownRank: 5,
    entries: [
      { rank: 1, club: "MTTC Iphitos München", isOwnClub: false, points: "12:2", matchPoints: "43:20", sets: "92:49", crossResults: ["***", "3:6", "7:2", "8:1", "5:4", "7:2", "5:4", "8:1"] },
      { rank: 2, club: "Bad WH Dresden", isOwnClub: false, points: "12:2", matchPoints: "42:21", sets: "92:47", crossResults: ["6:3", "***", "3:6", "6:3", "6:3", "5:4", "9:0", "7:2"] },
      { rank: 3, club: "TC Grün-Weiß Gräfelfing", isOwnClub: false, points: "8:6", matchPoints: "32:31", sets: "73:71", crossResults: ["2:7", "6:3", "***", "4:5", "5:4", "5:4", "6:3", "4:5"] },
      { rank: 4, club: "TC Kümmersbruck", isOwnClub: false, points: "8:6", matchPoints: "27:36", sets: "58:77", crossResults: ["1:8", "3:6", "5:4", "***", "6:3", "0:9", "6:3", "6:3"] },
      { rank: 5, club: "TC Pliening", isOwnClub: true , points: "6:8", matchPoints: "36:27", sets: "80:61", crossResults: ["4:5", "3:6", "4:5", "3:6", "***", "7:2", "6:3", "9:0"] },
      { rank: 6, club: "TC Herzogenaurach", isOwnClub: false, points: "4:10", matchPoints: "30:33", sets: "63:73", crossResults: ["2:7", "4:5", "4:5", "9:0", "2:7", "***", "3:6", "6:3"] },
      { rank: 7, club: "TSV Kottern", isOwnClub: false, points: "4:10", matchPoints: "24:39", sets: "55:81", crossResults: ["4:5", "0:9", "3:6", "3:6", "3:6", "6:3", "***", "5:4"] },
      { rank: 8, club: "SpVgg Zolling", isOwnClub: false, points: "2:12", matchPoints: "18:45", sets: "41:95", crossResults: ["1:8", "2:7", "5:4", "3:6", "0:9", "3:6", "4:5", "***"] },
    ],
  },
  // ── Herren 40 II Landesliga 2  Gr. 043 SU ──
  {
    teamLabel: "Herren 40 II",
    teamColor: "#67e8f9",
    leagueName: "Landesliga 2 · Gr. 043 SU",
    ownRank: 8,
    entries: [
      { rank: 1, club: "TSV 1860 Rosenheim", isOwnClub: false, points: "8:0", matchPoints: "21:15", sets: "46:33", crossResults: ["***", "5:4", "0:0", "0:0", "5:4", "5:4", "6:3", "0:0"] },
      { rank: 2, club: "SV Schloßberg-Stephansk.", isOwnClub: false, points: "4:2", matchPoints: "19:8", sets: "38:16", crossResults: ["4:5", "***", "7:2", "0:0", "1:3", "0:0", "8:1", "0:0"] },
      { rank: 3, club: "TC Unterföhring", isOwnClub: false, points: "4:2", matchPoints: "16:11", sets: "32:25", crossResults: ["0:0", "2:7", "***", "5:4", "0:0", "9:0", "0:0", "0:0"] },
      { rank: 4, club: "TSV Marquartstein", isOwnClub: false, points: "4:4", matchPoints: "22:14", sets: "44:31", crossResults: ["0:0", "0:0", "4:5", "***", "3:6", "6:3", "9:0", "0:0"] },
      { rank: 5, club: "TC Grün-Gold München", isOwnClub: false, points: "2:2", matchPoints: "10:8", sets: "24:18", crossResults: ["4:5", "3:1", "0:0", "6:3", "***", "0:0", "0:0", "0:0"] },
      { rank: 6, club: "TC Ramersdorf", isOwnClub: false, points: "0:6", matchPoints: "7:20", sets: "18:40", crossResults: ["4:5", "0:0", "0:9", "3:6", "0:0", "***", "0:0", "0:0"] },
      { rank: 7, club: "TC Anzing", isOwnClub: false, points: "0:6", matchPoints: "4:23", sets: "9:48", crossResults: ["3:6", "1:8", "0:0", "0:9", "0:0", "0:0", "***", "0:0"] },
      { rank: 8, club: "TC Pliening II (zurückgezogen)", isOwnClub: true , points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },
  // ── Herren 40 III Südliga 2  Gr. 315 ──
  // Endstand (Report vom 19.07.2026, 11:12): inkl. Aschheim–Markt Schwaben 8:1 (18.07.).
  // Feldkirchen II–Pliening III (18.07.) steht offiziell weiter ohne Ergebnis (0:0);
  // Forstinning-Begegnungen (zurückgezogen 11.05.) bleiben gestrichen.
  {
    teamLabel: "Herren 40 III",
    teamColor: "#7dd3fc",
    leagueName: "Südliga 2 · Gr. 315",
    ownRank: 3,
    entries: [
      { rank: 1, club: "TC Aschheim", isOwnClub: false, points: "10:2", matchPoints: "36:18", sets: "82:45", crossResults: ["***", "6:3", "2:7", "6:3", "6:3", "8:1", "8:1", "0:0"] },
      { rank: 2, club: "TSV Haar II", isOwnClub: false, points: "10:2", matchPoints: "36:18", sets: "77:47", crossResults: ["3:6", "***", "8:1", "6:3", "5:4", "5:4", "9:0", "0:0"] },
      { rank: 3, club: "TC Pliening III", isOwnClub: true , points: "6:4", matchPoints: "24:21", sets: "55:53", crossResults: ["7:2", "1:8", "***", "4:5", "0:0", "5:4", "7:2", "0:0"] },
      { rank: 4, club: "TC Grün-Gold München II", isOwnClub: false, points: "6:4", matchPoints: "22:23", sets: "50:51", crossResults: ["3:6", "3:6", "5:4", "***", "5:4", "6:3", "0:0", "0:0"] },
      { rank: 5, club: "TSV Feldkirchen II", isOwnClub: false, points: "4:6", matchPoints: "23:22", sets: "55:48", crossResults: ["3:6", "4:5", "0:0", "4:5", "***", "5:4", "7:2", "0:0"] },
      { rank: 6, club: "TF Markt Schwaben", isOwnClub: false, points: "2:10", matchPoints: "23:31", sets: "54:71", crossResults: ["1:8", "4:5", "4:5", "3:6", "4:5", "***", "7:2", "6:3"] },
      { rank: 7, club: "WB Fideliopark München II", isOwnClub: false, points: "0:10", matchPoints: "7:38", sets: "20:78", crossResults: ["1:8", "0:9", "2:7", "0:0", "2:7", "2:7", "***", "0:0"] },
      { rank: 8, club: "VfB Forstinning (zurückgezogen)", isOwnClub: false, points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "0:0", "3:6", "0:0", "***"] },
    ],
  },
  // ── Herren 50 Regionalliga Süd-Ost  Gr. 005 ──
  {
    teamLabel: "Herren 50",
    teamColor: "#06b6d4",
    leagueName: "Regionalliga Süd-Ost · Gr. 005",
    ownRank: 4,
    entries: [
      { rank: 1, club: "1. Regensburger Tennis-Klub", isOwnClub: false, points: "8:0", matchPoints: "33:3", sets: "68:8", crossResults: ["***", "0:0", "9:0", "0:0", "0:0", "7:2", "8:1", "9:0"] },
      { rank: 2, club: "TSV Burgfarrnbach", isOwnClub: false, points: "8:0", matchPoints: "23:13", sets: "47:29", crossResults: ["0:0", "***", "0:0", "5:4", "6:3", "6:3", "6:3", "0:0"] },
      { rank: 3, club: "TC Grün-Weiß Gräfelfing", isOwnClub: false, points: "6:2", matchPoints: "16:20", sets: "33:42", crossResults: ["0:9", "0:0", "***", "5:4", "0:0", "0:0", "5:4", "6:3"] },
      { rank: 4, club: "TC Pliening", isOwnClub: true , points: "4:4", matchPoints: "21:15", sets: "46:33", crossResults: ["0:0", "4:5", "4:5", "***", "6:3", "0:0", "0:0", "7:2"] },
      { rank: 5, club: "MTTC Iphitos München", isOwnClub: false, points: "4:4", matchPoints: "19:17", sets: "40:38", crossResults: ["0:0", "3:6", "0:0", "3:6", "***", "5:4", "0:0", "8:1"] },
      { rank: 6, club: "SpVgg Zolling", isOwnClub: false, points: "2:6", matchPoints: "15:21", sets: "37:43", crossResults: ["2:7", "3:6", "0:0", "0:0", "4:5", "***", "6:3", "0:0"] },
      { rank: 7, club: "TC Bamberg", isOwnClub: false, points: "0:8", matchPoints: "11:25", sets: "22:52", crossResults: ["1:8", "3:6", "4:5", "0:0", "0:0", "3:6", "***", "0:0"] },
      { rank: 8, club: "TSV Altenfurt", isOwnClub: false, points: "0:8", matchPoints: "6:30", sets: "12:60", crossResults: ["0:9", "0:0", "3:6", "2:7", "1:8", "0:0", "0:0", "***"] },
    ],
  },
  // ── Herren 50 II Südliga 1  Gr. 355 ──
  {
    teamLabel: "Herren 50 II",
    teamColor: "#a5f3fc",
    leagueName: "Südliga 1 · Gr. 355",
    ownRank: 1,
    entries: [
      { rank: 1, club: "TC Pliening II", isOwnClub: true , points: "6:0", matchPoints: "27:0", sets: "54:2", crossResults: ["***", "0:0", "9:0", "0:0", "9:0", "9:0", "0:0", "0:0"] },
      { rank: 2, club: "TeG Mühldorf", isOwnClub: false, points: "6:0", matchPoints: "21:6", sets: "42:18", crossResults: ["0:0", "***", "0:0", "0:0", "7:2", "7:2", "7:2", "0:0"] },
      { rank: 3, club: "TSV Altfraunhofen", isOwnClub: false, points: "6:2", matchPoints: "19:17", sets: "40:39", crossResults: ["0:9", "0:0", "***", "6:3", "0:0", "0:0", "6:3", "7:2"] },
      { rank: 4, club: "VfL Waldkraiburg", isOwnClub: false, points: "4:2", matchPoints: "17:10", sets: "34:22", crossResults: ["0:0", "0:0", "3:6", "***", "6:3", "0:0", "8:1", "0:0"] },
      { rank: 5, club: "TC Au", isOwnClub: false, points: "4:6", matchPoints: "18:27", sets: "41:58", crossResults: ["0:9", "2:7", "0:0", "3:6", "***", "0:0", "5:4", "8:1"] },
      { rank: 6, club: "TC Taufkirchen", isOwnClub: false, points: "2:4", matchPoints: "8:19", sets: "19:39", crossResults: ["0:9", "2:7", "0:0", "0:0", "0:0", "***", "0:0", "6:3"] },
      { rank: 7, club: "TC Rot-Weiß Freising", isOwnClub: false, points: "2:8", matchPoints: "18:27", sets: "44:57", crossResults: ["0:0", "2:7", "3:6", "1:8", "4:5", "0:0", "***", "8:1"] },
      { rank: 8, club: "TC Weiss-Blau Landshut", isOwnClub: false, points: "0:8", matchPoints: "7:29", sets: "22:61", crossResults: ["0:0", "0:0", "2:7", "0:0", "1:8", "3:6", "1:8", "***"] },
    ],
  },
  // ── Herren 50 III Südliga 3  Gr. 379 ──
  {
    teamLabel: "Herren 50 III",
    teamColor: "#bae6fd",
    leagueName: "Südliga 3 · Gr. 379",
    ownRank: 1,
    entries: [
      { rank: 1, club: "TC Pliening III", isOwnClub: true , points: "8:2", matchPoints: "29:16", sets: "65:37", crossResults: ["***", "3:6", "0:0", "5:4", "9:0", "6:3", "6:3"] },
      { rank: 2, club: "TC Finsing", isOwnClub: false, points: "6:0", matchPoints: "19:8", sets: "41:24", crossResults: ["6:3", "***", "6:3", "0:0", "0:0", "0:0", "7:2"] },
      { rank: 3, club: "TF Markt Schwaben", isOwnClub: false, points: "2:2", matchPoints: "11:7", sets: "25:17", crossResults: ["0:0", "3:6", "***", "0:0", "4:2", "0:0", "8:1"] },
      { rank: 4, club: "VfB Forstinning", isOwnClub: false, points: "0:2", matchPoints: "4:5", sets: "9:11", crossResults: ["4:5", "0:0", "0:0", "***", "0:0", "0:0", "0:0"] },
      { rank: 5, club: "TSV Oberpframmern", isOwnClub: false, points: "2:4", matchPoints: "9:18", sets: "22:39", crossResults: ["0:9", "0:0", "2:4", "0:0", "***", "7:2", "2:7"] },
      { rank: 6, club: "TS Jahn München", isOwnClub: false, points: "0:4", matchPoints: "5:13", sets: "12:27", crossResults: ["3:6", "0:0", "0:0", "0:0", "2:7", "***", "0:0"] },
      { rank: 7, club: "TC Neuperlach-Kail München II", isOwnClub: false, points: "2:6", matchPoints: "13:23", sets: "30:49", crossResults: ["3:6", "2:7", "1:8", "0:0", "7:2", "0:0", "***"] },
    ],
  },
  // ── Herren 60 Südliga 1  Gr. 404 ──
  {
    teamLabel: "Herren 60",
    teamColor: "#cffafe",
    leagueName: "Südliga 1 · Gr. 404",
    ownRank: 7,
    entries: [
      { rank: 1, club: "SV Hörlkofen", isOwnClub: false, points: "6:0", matchPoints: "21:6", sets: "44:17", crossResults: ["***", "0:0", "0:0", "7:2", "8:1", "0:0", "6:3"] },
      { rank: 2, club: "TSV Rottenburg", isOwnClub: false, points: "6:2", matchPoints: "24:12", sets: "52:28", crossResults: ["0:0", "***", "2:7", "0:0", "7:2", "9:0", "6:3"] },
      { rank: 3, club: "TeG Mühldorf", isOwnClub: false, points: "4:0", matchPoints: "12:6", sets: "30:15", crossResults: ["0:0", "7:2", "***", "5:4", "0:0", "0:0", "0:0"] },
      { rank: 4, club: "FC Langengeisling", isOwnClub: false, points: "4:4", matchPoints: "19:17", sets: "42:43", crossResults: ["2:7", "0:0", "4:5", "***", "0:0", "8:1", "5:4"] },
      { rank: 5, club: "TC Marzling", isOwnClub: false, points: "4:4", matchPoints: "16:20", sets: "37:44", crossResults: ["1:8", "2:7", "0:0", "0:0", "***", "6:3", "7:2"] },
      { rank: 6, club: "TF Eitting", isOwnClub: false, points: "0:6", matchPoints: "4:23", sets: "13:48", crossResults: ["0:0", "0:9", "0:0", "1:8", "3:6", "***", "0:0"] },
      { rank: 7, club: "TC Pliening", isOwnClub: true , points: "0:8", matchPoints: "12:24", sets: "28:51", crossResults: ["3:6", "3:6", "0:0", "4:5", "2:7", "0:0", "***"] },
    ],
  },
  // ── Damen Südliga 2  Gr. 160 ──
  // Endstand (Report vom 19.07.2026): Spieltage 05.07. + 12.07. komplett; ungespielt
  // blieben Fideliopark II–Steinhöring und Jahn–Grün-Gold (offiziell 0:0).
  {
    teamLabel: "Damen",
    teamColor: "#f59e0b",
    leagueName: "Südliga 2 · Gr. 160",
    ownRank: 2,
    entries: [
      { rank: 1, club: "WB Fideliopark München II", isOwnClub: false, points: "10:2", matchPoints: "37:17", sets: "77:44", crossResults: ["***", "7:2", "0:0", "4:5", "5:4", "8:1", "5:4", "8:1"] },
      { rank: 2, club: "TC Pliening", isOwnClub: true , points: "10:4", matchPoints: "38:25", sets: "80:57", crossResults: ["2:7", "***", "4:5", "6:3", "7:2", "7:2", "6:3", "6:3"] },
      { rank: 3, club: "TC Steinhöring", isOwnClub: false, points: "8:4", matchPoints: "30:24", sets: "65:51", crossResults: ["0:0", "5:4", "***", "4:5", "3:6", "7:2", "5:4", "6:3"] },
      { rank: 4, club: "TC Neukeferloh", isOwnClub: false, points: "8:6", matchPoints: "31:32", sets: "68:71", crossResults: ["5:4", "3:6", "5:4", "***", "2:7", "4:5", "6:3", "6:3"] },
      { rank: 5, club: "TC Unterföhring", isOwnClub: false, points: "6:8", matchPoints: "30:33", sets: "72:73", crossResults: ["4:5", "2:7", "6:3", "7:2", "***", "2:7", "4:5", "5:4"] },
      { rank: 6, club: "TC Topspin", isOwnClub: false, points: "6:8", matchPoints: "25:38", sets: "57:85", crossResults: ["1:8", "2:7", "2:7", "5:4", "7:2", "***", "3:6", "5:4"] },
      { rank: 7, club: "TS Jahn München", isOwnClub: false, points: "4:8", matchPoints: "25:29", sets: "57:66", crossResults: ["4:5", "3:6", "4:5", "3:6", "5:4", "6:3", "***", "0:0"] },
      { rank: 8, club: "TC Grün-Gold München", isOwnClub: false, points: "0:12", matchPoints: "18:36", sets: "48:77", crossResults: ["1:8", "3:6", "3:6", "3:6", "4:5", "4:5", "0:0", "***"] },
    ],
  },
  // ── Damen 40 Südliga 1  Gr. 441 ──
  {
    teamLabel: "Damen 40",
    teamColor: "#fbbf24",
    leagueName: "Südliga 1 · Gr. 441",
    ownRank: 6,
    entries: [
      { rank: 1, club: "VfB Hallbergmoos", isOwnClub: false, points: "8:0", matchPoints: "24:12", sets: "52:31", crossResults: ["***", "5:4", "6:3", "5:4", "0:0", "0:0", "8:1", "0:0"] },
      { rank: 2, club: "SC Baldham-Vaterstetten", isOwnClub: false, points: "6:2", matchPoints: "21:15", sets: "47:35", crossResults: ["4:5", "***", "0:0", "5:4", "0:0", "0:0", "7:2", "5:4"] },
      { rank: 3, club: "Weißblau Allianz München", isOwnClub: false, points: "6:2", matchPoints: "20:16", sets: "45:33", crossResults: ["3:6", "0:0", "***", "0:0", "5:4", "6:3", "0:0", "6:3"] },
      { rank: 4, club: "ESV München Sportpark", isOwnClub: false, points: "2:4", matchPoints: "14:13", sets: "31:29", crossResults: ["4:5", "4:5", "0:0", "***", "6:3", "0:0", "0:0", "0:0"] },
      { rank: 5, club: "TC Pfaffenhofen/Ilm II", isOwnClub: false, points: "2:4", matchPoints: "14:13", sets: "29:29", crossResults: ["0:0", "0:0", "4:5", "3:6", "***", "0:0", "0:0", "7:2"] },
      { rank: 6, club: "TC Pliening", isOwnClub: true , points: "2:4", matchPoints: "13:14", sets: "29:33", crossResults: ["0:0", "0:0", "3:6", "0:0", "0:0", "***", "2:7", "8:1"] },
      { rank: 7, club: "TSV Rudelzhausen", isOwnClub: false, points: "2:4", matchPoints: "10:17", sets: "25:37", crossResults: ["1:8", "2:7", "0:0", "0:0", "0:0", "7:2", "***", "0:0"] },
      { rank: 8, club: "WB Fideliopark München", isOwnClub: false, points: "0:8", matchPoints: "10:26", sets: "25:56", crossResults: ["0:0", "4:5", "3:6", "0:0", "2:7", "1:8", "0:0", "***"] },
    ],
  },
  // ── Damen 50 Landesliga 1 (4er)  Gr. 103 SU ──
  {
    teamLabel: "Damen 50",
    teamColor: "#fcd34d",
    leagueName: "Landesliga 1 (4er) · Gr. 103 SU",
    ownRank: 3,
    entries: [
      { rank: 1, club: "TC Hofkirchen", isOwnClub: false, points: "6:2", matchPoints: "16:8", sets: "35:18", crossResults: ["***", "1:5", "0:0", "4:2", "0:0", "6:0", "5:1", "0:0"] },
      { rank: 2, club: "TC Steinhöring", isOwnClub: false, points: "6:2", matchPoints: "15:9", sets: "34:21", crossResults: ["5:1", "***", "3:3", "0:0", "3:3", "4:2", "0:0", "0:0"] },
      { rank: 3, club: "TC Pliening", isOwnClub: true , points: "5:3", matchPoints: "16:8", sets: "33:19", crossResults: ["0:0", "3:3", "***", "0:0", "2:4", "0:0", "5:1", "6:0"] },
      { rank: 4, club: "TSV Eintracht Karlsfeld", isOwnClub: false, points: "5:3", matchPoints: "13:11", sets: "29:23", crossResults: ["2:4", "0:0", "0:0", "***", "4:2", "0:0", "3:3", "4:2"] },
      { rank: 5, club: "TSV Unterhaching II", isOwnClub: false, points: "5:3", matchPoints: "13:11", sets: "27:26", crossResults: ["0:0", "3:3", "4:2", "2:4", "***", "0:0", "0:0", "4:2"] },
      { rank: 6, club: "TSV Moosach München", isOwnClub: false, points: "3:5", matchPoints: "9:15", sets: "20:31", crossResults: ["0:6", "2:4", "0:0", "0:0", "0:0", "***", "3:3", "4:2"] },
      { rank: 7, club: "TC Karlsfeld am See", isOwnClub: false, points: "2:6", matchPoints: "8:16", sets: "18:34", crossResults: ["1:5", "0:0", "1:5", "3:3", "0:0", "3:3", "***", "0:0"] },
      { rank: 8, club: "TC Gernlinden II", isOwnClub: false, points: "0:8", matchPoints: "6:18", sets: "14:38", crossResults: ["0:0", "0:0", "0:6", "2:4", "2:4", "2:4", "0:0", "***"] },
    ],
  },
  // ── Damen 50 II Südliga 2 (4er)  Gr. 488 ──
  {
    teamLabel: "Damen 50 II",
    teamColor: "#fde68a",
    leagueName: "Südliga 2 (4er) · Gr. 488",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TC Steinhöring II", isOwnClub: false, points: "6:2", matchPoints: "18:6", sets: "40:16", crossResults: ["***", "4:2", "0:0", "0:0", "2:4", "0:0", "6:0", "6:0"] },
      { rank: 2, club: "TC Pliening II", isOwnClub: true , points: "5:3", matchPoints: "15:9", sets: "34:24", crossResults: ["2:4", "***", "0:0", "5:1", "0:0", "3:3", "0:0", "5:1"] },
      { rank: 3, club: "TeG Kirchheim", isOwnClub: false, points: "5:3", matchPoints: "14:10", sets: "29:25", crossResults: ["0:0", "0:0", "***", "2:4", "3:3", "5:1", "4:2", "0:0"] },
      { rank: 4, club: "TC Rot-Weiß Poing", isOwnClub: false, points: "5:3", matchPoints: "13:11", sets: "33:26", crossResults: ["0:0", "1:5", "4:2", "***", "5:1", "0:0", "0:0", "3:3"] },
      { rank: 5, club: "FC Forstern", isOwnClub: false, points: "3:3", matchPoints: "8:10", sets: "22:25", crossResults: ["4:2", "0:0", "3:3", "1:5", "***", "0:0", "0:0", "0:0"] },
      { rank: 6, club: "SV Walpertskirchen", isOwnClub: false, points: "2:4", matchPoints: "7:11", sets: "17:24", crossResults: ["0:0", "3:3", "1:5", "0:0", "0:0", "***", "3:3", "0:0"] },
      { rank: 7, club: "TC Anzing", isOwnClub: false, points: "3:5", matchPoints: "9:15", sets: "21:32", crossResults: ["0:6", "0:0", "2:4", "0:0", "0:0", "3:3", "***", "4:2"] },
      { rank: 8, club: "SpVgg Altenerding", isOwnClub: false, points: "1:7", matchPoints: "6:18", sets: "14:38", crossResults: ["0:6", "1:5", "0:0", "3:3", "0:0", "0:0", "2:4", "***"] },
    ],
  },
];
