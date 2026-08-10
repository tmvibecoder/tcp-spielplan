import type { LeagueStandings } from "../types";

// ── Sommer 2026 Tabellen / Standings ──
// Quelle: offizielle BTV nuLiga "Ergebnistabellen gesamt" (vereinsweiter Report, alle Mannschaften):
//   https://btv.liga.nu/.../nuDokument?dokument=ResultReportFOP&type=full&club=22844&season=18103
//   (club=22844 = TC Pliening, season=18103 = Sommer 2026; verlinkt auf der btv.de-Vereinsseite)
// Tabellen + Kreuztabellen 1:1 aus dem offiziellen Report übernommen.
// Stand: 19.07.2026 für ALLE Konkurrenzen — die fünf Spielbericht-Ligen auf Endstand,
// die übrigen Erwachsenen-Ligen und (seit 19.07.) auch die vier Jugend-Konkurrenzen
// aus dem Report bzw. den Gruppen-ScheduleReports (Gr. 488 damit einen Tick aktueller).
// Hinweis: Bei zurückgezogenen Mannschaften weichen offizielle Matchpunkte und
// Kreuztabelle ab (BTV streicht gewertete Spiele aus der Tabelle) — Werte verbatim wie offiziell.
// crossResults: "***" = Diagonale, "0:0" = noch nicht gespielt (zeigt "n.a.").
// Ausnahme Mixed (Gr. 074): eigene Südbayern Mixed-Runde im August/September mit
// eigenem Gruppen-Report ("Tabelle und Spielplan", Stand 05.08.2026) — läuft noch.

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
  // ── Herren 40 II  Landesliga 2  Gr. 043 SU ──
  // Endstand (Report vom 19.07.2026): Pliening-II-Begegnungen gestrichen (Rückzug 07.05.);
  // offen blieben Unterföhring–Anzing und Grün-Gold–Ramersdorf. Werte verbatim (BTV streicht
  // gewertete Spiele, daher weichen Punkte teils von der Kreuztabelle ab).
  {
    teamLabel: "Herren 40 II",
    teamColor: "#67e8f9",
    leagueName: "Landesliga 2 · Gr. 043 SU",
    ownRank: 8,
    entries: [
      { rank: 1, club: "TSV 1860 Rosenheim", isOwnClub: false, points: "12:0", matchPoints: "33:21", sets: "70:47", crossResults: ["***", "5:4", "6:3", "5:4", "6:3", "5:4", "6:3", "0:0"] },
      { rank: 2, club: "SV Schloßberg-Stephansk.", isOwnClub: false, points: "8:2", matchPoints: "32:13", sets: "67:29", crossResults: ["4:5", "***", "7:2", "1:3", "5:4", "8:1", "8:1", "0:0"] },
      { rank: 3, club: "TC Unterföhring", isOwnClub: false, points: "6:4", matchPoints: "24:21", sets: "50:47", crossResults: ["3:6", "2:7", "***", "5:4", "5:4", "9:0", "0:0", "0:0"] },
      { rank: 4, club: "TC Grün-Gold München", isOwnClub: false, points: "4:4", matchPoints: "23:13", sets: "52:30", crossResults: ["4:5", "3:1", "4:5", "***", "6:3", "0:0", "9:0", "0:0"] },
      { rank: 5, club: "TSV Marquartstein", isOwnClub: false, points: "4:8", matchPoints: "29:25", sets: "61:55", crossResults: ["3:6", "4:5", "4:5", "3:6", "***", "6:3", "9:0", "0:0"] },
      { rank: 6, club: "TC Ramersdorf", isOwnClub: false, points: "2:8", matchPoints: "17:28", sets: "40:59", crossResults: ["4:5", "1:8", "0:9", "0:0", "3:6", "***", "9:0", "0:0"] },
      { rank: 7, club: "TC Anzing", isOwnClub: false, points: "0:10", matchPoints: "4:41", sets: "11:84", crossResults: ["3:6", "1:8", "0:0", "0:9", "0:9", "0:9", "***", "0:0"] },
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
  // ── Herren 50  Regionalliga Süd-Ost  Gr. 005 ──
  // Endstand (Report vom 19.07.2026) — Saison komplett.
  {
    teamLabel: "Herren 50",
    teamColor: "#06b6d4",
    leagueName: "Regionalliga Süd-Ost · Gr. 005",
    ownRank: 3,
    entries: [
      { rank: 1, club: "1. Regensburger Tennis-Klub", isOwnClub: false, points: "14:0", matchPoints: "59:4", sets: "120:11", crossResults: ["***", "9:0", "8:1", "9:0", "9:0", "7:2", "9:0", "8:1"] },
      { rank: 2, club: "TSV Burgfarrnbach", isOwnClub: false, points: "12:2", matchPoints: "34:29", sets: "70:61", crossResults: ["0:9", "***", "5:4", "6:3", "6:3", "6:3", "5:4", "6:3"] },
      { rank: 3, club: "TC Pliening", isOwnClub: true , points: "8:6", matchPoints: "35:28", sets: "75:62", crossResults: ["1:8", "4:5", "***", "6:3", "4:5", "5:4", "7:2", "8:1"] },
      { rank: 4, club: "MTTC Iphitos München", isOwnClub: false, points: "8:6", matchPoints: "34:29", sets: "71:62", crossResults: ["0:9", "3:6", "3:6", "***", "6:3", "5:4", "8:1", "9:0"] },
      { rank: 5, club: "TC Grün-Weiß Gräfelfing", isOwnClub: false, points: "8:6", matchPoints: "29:34", sets: "59:73", crossResults: ["0:9", "3:6", "5:4", "3:6", "***", "6:3", "7:2", "5:4"] },
      { rank: 6, club: "SpVgg Zolling", isOwnClub: false, points: "4:10", matchPoints: "28:35", sets: "69:76", crossResults: ["2:7", "3:6", "4:5", "4:5", "3:6", "***", "6:3", "6:3"] },
      { rank: 7, club: "TSV Altenfurt", isOwnClub: false, points: "2:12", matchPoints: "20:43", sets: "44:88", crossResults: ["0:9", "4:5", "2:7", "1:8", "2:7", "3:6", "***", "8:1"] },
      { rank: 8, club: "TC Bamberg", isOwnClub: false, points: "0:14", matchPoints: "13:50", sets: "27:102", crossResults: ["1:8", "3:6", "1:8", "0:9", "4:5", "3:6", "1:8", "***"] },
    ],
  },
  // ── Herren 50 II  Südliga 1  Gr. 355 ──
  // Endstand (Report vom 19.07.2026) — Saison komplett, TC Pliening II MEISTER (14:0)!
  {
    teamLabel: "Herren 50 II",
    teamColor: "#a5f3fc",
    leagueName: "Südliga 1 · Gr. 355",
    ownRank: 1,
    entries: [
      { rank: 1, club: "TC Pliening II", isOwnClub: true , points: "14:0", matchPoints: "59:4", sets: "118:10", crossResults: ["***", "8:1", "9:0", "6:3", "9:0", "9:0", "9:0", "9:0"] },
      { rank: 2, club: "TeG Mühldorf", isOwnClub: false, points: "12:2", matchPoints: "43:20", sets: "87:50", crossResults: ["1:8", "***", "6:3", "7:2", "7:2", "7:2", "7:2", "8:1"] },
      { rank: 3, club: "TSV Altfraunhofen", isOwnClub: false, points: "10:4", matchPoints: "35:28", sets: "76:67", crossResults: ["0:9", "3:6", "***", "6:3", "7:2", "6:3", "6:3", "7:2"] },
      { rank: 4, club: "VfL Waldkraiburg", isOwnClub: false, points: "8:6", matchPoints: "37:26", sets: "75:54", crossResults: ["3:6", "2:7", "3:6", "***", "6:3", "6:3", "8:1", "9:0"] },
      { rank: 5, club: "TC Taufkirchen", isOwnClub: false, points: "6:8", matchPoints: "25:38", sets: "58:84", crossResults: ["0:9", "2:7", "2:7", "3:6", "***", "5:4", "7:2", "6:3"] },
      { rank: 6, club: "TC Au", isOwnClub: false, points: "4:10", matchPoints: "25:38", sets: "61:82", crossResults: ["0:9", "2:7", "3:6", "3:6", "4:5", "***", "5:4", "8:1"] },
      { rank: 7, club: "TC Rot-Weiß Freising", isOwnClub: false, points: "2:12", matchPoints: "20:43", sets: "52:90", crossResults: ["0:9", "2:7", "3:6", "1:8", "2:7", "4:5", "***", "8:1"] },
      { rank: 8, club: "TC Weiss-Blau Landshut", isOwnClub: false, points: "0:14", matchPoints: "8:55", sets: "24:114", crossResults: ["0:9", "1:8", "2:7", "0:9", "3:6", "1:8", "1:8", "***"] },
    ],
  },
  // ── Herren 50 III  Südliga 3  Gr. 379 ──
  // Endstand (Report vom 19.07.2026): offen blieb nur Jahn–Forstinning (Nachholspiel 25.07.).
  {
    teamLabel: "Herren 50 III",
    teamColor: "#bae6fd",
    leagueName: "Südliga 3 · Gr. 379",
    ownRank: 3,
    entries: [
      { rank: 1, club: "TF Markt Schwaben", isOwnClub: false, points: "10:2", matchPoints: "42:12", sets: "88:30", crossResults: ["***", "3:6", "9:0", "9:0", "6:3", "8:1", "7:2"] },
      { rank: 2, club: "TC Finsing", isOwnClub: false, points: "10:2", matchPoints: "37:17", sets: "79:43", crossResults: ["6:3", "***", "6:3", "3:6", "7:2", "7:2", "8:1"] },
      { rank: 3, club: "TC Pliening III", isOwnClub: true , points: "8:4", matchPoints: "29:25", sets: "65:53", crossResults: ["0:9", "3:6", "***", "5:4", "6:3", "6:3", "9:0"] },
      { rank: 4, club: "VfB Forstinning", isOwnClub: false, points: "6:4", matchPoints: "22:23", sets: "50:51", crossResults: ["0:9", "6:3", "4:5", "***", "0:0", "5:4", "7:2"] },
      { rank: 5, club: "TS Jahn München", isOwnClub: false, points: "2:8", matchPoints: "17:28", sets: "39:58", crossResults: ["3:6", "2:7", "3:6", "0:0", "***", "7:2", "2:7"] },
      { rank: 6, club: "TC Neuperlach-Kail München II", isOwnClub: false, points: "2:10", matchPoints: "19:35", sets: "42:78", crossResults: ["1:8", "2:7", "3:6", "4:5", "2:7", "***", "7:2"] },
      { rank: 7, club: "TSV Oberpframmern", isOwnClub: false, points: "2:10", matchPoints: "14:40", sets: "34:84", crossResults: ["2:7", "1:8", "0:9", "2:7", "7:2", "2:7", "***"] },
    ],
  },
  // ── Herren 60  Südliga 1  Gr. 404 ──
  // Endstand (Report vom 19.07.2026): offen blieb nur Eitting–Hörlkofen (Nachholspiel 25.07.).
  {
    teamLabel: "Herren 60",
    teamColor: "#cffafe",
    leagueName: "Südliga 1 · Gr. 404",
    ownRank: 7,
    entries: [
      { rank: 1, club: "TeG Mühldorf", isOwnClub: false, points: "12:0", matchPoints: "37:17", sets: "84:42", crossResults: ["***", "5:4", "7:2", "7:2", "5:4", "8:1", "5:4"] },
      { rank: 2, club: "SV Hörlkofen", isOwnClub: false, points: "8:2", matchPoints: "31:14", sets: "65:37", crossResults: ["4:5", "***", "6:3", "8:1", "7:2", "0:0", "6:3"] },
      { rank: 3, club: "TSV Rottenburg", isOwnClub: false, points: "8:4", matchPoints: "33:21", sets: "72:47", crossResults: ["2:7", "3:6", "***", "7:2", "6:3", "9:0", "6:3"] },
      { rank: 4, club: "TC Marzling", isOwnClub: false, points: "6:6", matchPoints: "24:30", sets: "56:67", crossResults: ["2:7", "1:8", "2:7", "***", "6:3", "6:3", "7:2"] },
      { rank: 5, club: "FC Langengeisling", isOwnClub: false, points: "4:8", matchPoints: "25:29", sets: "56:68", crossResults: ["4:5", "2:7", "3:6", "3:6", "***", "8:1", "5:4"] },
      { rank: 6, club: "TF Eitting", isOwnClub: false, points: "2:8", matchPoints: "10:35", sets: "28:74", crossResults: ["1:8", "0:0", "0:9", "3:6", "1:8", "***", "5:4"] },
      { rank: 7, club: "TC Pliening", isOwnClub: true , points: "0:12", matchPoints: "20:34", sets: "46:72", crossResults: ["4:5", "3:6", "3:6", "2:7", "4:5", "4:5", "***"] },
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
  // ── Damen 40  Südliga 1  Gr. 441 ──
  // Endstand (Report vom 19.07.2026): offen blieben Pfaffenhofen II–Rudelzhausen (18.07.,
  // noch ohne Ergebnis) und ESV–Rudelzhausen (Nachholspiel 25.07.).
  {
    teamLabel: "Damen 40",
    teamColor: "#fbbf24",
    leagueName: "Südliga 1 · Gr. 441",
    ownRank: 7,
    entries: [
      { rank: 1, club: "VfB Hallbergmoos", isOwnClub: false, points: "14:0", matchPoints: "44:19", sets: "92:47", crossResults: ["***", "6:3", "5:4", "5:4", "8:1", "7:2", "5:4", "8:1"] },
      { rank: 2, club: "Weißblau Allianz München", isOwnClub: false, points: "10:4", matchPoints: "33:30", sets: "75:62", crossResults: ["3:6", "***", "3:6", "5:4", "5:4", "5:4", "6:3", "6:3"] },
      { rank: 3, club: "ESV München Sportpark", isOwnClub: false, points: "8:4", matchPoints: "37:17", sets: "78:39", crossResults: ["4:5", "6:3", "***", "4:5", "0:0", "6:3", "8:1", "9:0"] },
      { rank: 4, club: "SC Baldham-Vaterstetten", isOwnClub: false, points: "8:6", matchPoints: "36:27", sets: "80:64", crossResults: ["4:5", "4:5", "5:4", "***", "7:2", "7:2", "4:5", "5:4"] },
      { rank: 5, club: "TSV Rudelzhausen", isOwnClub: false, points: "4:6", matchPoints: "20:25", sets: "46:54", crossResults: ["1:8", "4:5", "0:0", "2:7", "***", "0:0", "7:2", "6:3"] },
      { rank: 6, club: "TC Pfaffenhofen/Ilm II", isOwnClub: false, points: "4:8", matchPoints: "23:31", sets: "50:67", crossResults: ["2:7", "4:5", "3:6", "2:7", "0:0", "***", "5:4", "7:2"] },
      { rank: 7, club: "TC Pliening", isOwnClub: true , points: "4:10", matchPoints: "27:36", sets: "62:81", crossResults: ["4:5", "3:6", "1:8", "5:4", "2:7", "4:5", "***", "8:1"] },
      { rank: 8, club: "WB Fideliopark München", isOwnClub: false, points: "0:14", matchPoints: "14:49", sets: "34:103", crossResults: ["1:8", "3:6", "0:9", "4:5", "3:6", "2:7", "1:8", "***"] },
    ],
  },
  // ── Damen 50  Landesliga 1 (4er)  Gr. 103 SU ──
  // Endstand (Report vom 19.07.2026): offen blieben Hofkirchen–Unterhaching II (18.07.,
  // noch ohne Ergebnis) und Eintracht Karlsfeld–Steinhöring (Nachholspiel 28.07.).
  {
    teamLabel: "Damen 50",
    teamColor: "#fcd34d",
    leagueName: "Landesliga 1 (4er) · Gr. 103 SU",
    ownRank: 4,
    entries: [
      { rank: 1, club: "TC Steinhöring", isOwnClub: false, points: "10:2", matchPoints: "26:10", sets: "56:24", crossResults: ["***", "5:1", "3:3", "3:3", "0:0", "5:1", "4:2", "6:0"] },
      { rank: 2, club: "TC Hofkirchen", isOwnClub: false, points: "10:2", matchPoints: "24:12", sets: "53:28", crossResults: ["1:5", "***", "0:0", "4:2", "4:2", "5:1", "6:0", "4:2"] },
      { rank: 3, club: "TSV Unterhaching II", isOwnClub: false, points: "9:3", matchPoints: "24:12", sets: "49:30", crossResults: ["3:3", "0:0", "***", "4:2", "2:4", "5:1", "6:0", "4:2"] },
      { rank: 4, club: "TC Pliening", isOwnClub: true , points: "9:5", matchPoints: "28:14", sets: "61:31", crossResults: ["3:3", "2:4", "2:4", "***", "5:1", "5:1", "5:1", "6:0"] },
      { rank: 5, club: "TSV Eintracht Karlsfeld", isOwnClub: false, points: "7:5", matchPoints: "18:18", sets: "39:39", crossResults: ["0:0", "2:4", "4:2", "1:5", "***", "3:3", "4:2", "4:2"] },
      { rank: 6, club: "TC Karlsfeld am See", isOwnClub: false, points: "4:10", matchPoints: "14:28", sets: "32:58", crossResults: ["1:5", "1:5", "1:5", "1:5", "3:3", "***", "3:3", "4:2"] },
      { rank: 7, club: "TSV Moosach München", isOwnClub: false, points: "3:11", matchPoints: "12:30", sets: "28:62", crossResults: ["2:4", "0:6", "0:6", "1:5", "2:4", "3:3", "***", "4:2"] },
      { rank: 8, club: "TC Gernlinden II", isOwnClub: false, points: "0:14", matchPoints: "10:32", sets: "22:68", crossResults: ["0:6", "2:4", "2:4", "0:6", "2:4", "2:4", "2:4", "***"] },
    ],
  },
  // ── Damen 50 II  Südliga 2 (4er)  Gr. 488 ──
  // Endstand — Saison komplett. Basis: Report vom 19.07.2026, ergänzt um Forstern–Altenerding
  // 5:1 (18.07.) aus dem Gruppen-ScheduleReport (fehlte im Gesamt-Report von 11:12 noch).
  {
    teamLabel: "Damen 50 II",
    teamColor: "#fde68a",
    leagueName: "Südliga 2 (4er) · Gr. 488",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TC Rot-Weiß Poing", isOwnClub: false, points: "11:3", matchPoints: "26:16", sets: "61:39", crossResults: ["***", "1:5", "5:1", "4:2", "4:2", "5:1", "4:2", "3:3"] },
      { rank: 2, club: "TC Pliening II", isOwnClub: true , points: "10:4", matchPoints: "27:15", sets: "62:40", crossResults: ["5:1", "***", "2:4", "4:2", "3:3", "5:1", "3:3", "5:1"] },
      { rank: 3, club: "TC Steinhöring II", isOwnClub: false, points: "8:6", matchPoints: "26:16", sets: "61:38", crossResults: ["1:5", "4:2", "***", "5:1", "2:4", "2:4", "6:0", "6:0"] },
      { rank: 4, club: "TeG Kirchheim", isOwnClub: false, points: "7:7", matchPoints: "22:20", sets: "47:48", crossResults: ["2:4", "2:4", "1:5", "***", "5:1", "3:3", "4:2", "5:1"] },
      { rank: 5, club: "SV Walpertskirchen", isOwnClub: false, points: "7:7", matchPoints: "20:22", sets: "44:50", crossResults: ["2:4", "3:3", "4:2", "1:5", "***", "4:2", "3:3", "3:3"] },
      { rank: 6, club: "FC Forstern", isOwnClub: false, points: "6:8", matchPoints: "19:23", sets: "48:54", crossResults: ["1:5", "1:5", "4:2", "3:3", "2:4", "***", "3:3", "5:1"] },
      { rank: 7, club: "TC Anzing", isOwnClub: false, points: "5:9", matchPoints: "17:25", sets: "40:55", crossResults: ["2:4", "3:3", "0:6", "2:4", "3:3", "3:3", "***", "4:2"] },
      { rank: 8, club: "SpVgg Altenerding", isOwnClub: false, points: "2:12", matchPoints: "11:31", sets: "27:66", crossResults: ["3:3", "1:5", "0:6", "1:5", "3:3", "1:5", "2:4", "***"] },
    ],
  },
  // ── Mixed  Spielebene B  Gr. 074 (Südbayern Mixed-Runde) ──
  // Eigener Report "Tabelle und Spielplan" der Gruppe (nu.Dokument 013 vom 05.08.2026),
  // nicht Teil des vereinsweiten ResultReportFOP der Sommerrunde.
  // Stand 09.08.2026: 1. Spieltag (01.08.) — Pliening–Kirchheim 4:2, Feldkirchen–Markt Schwaben 2:4;
  // 2. Spieltag (09.08.) — Haar–Pliening 4:2 (Spielbericht Nr. 4).
  // Forstern–Haar (ursprünglich 01.08.) wurde auf den 27.09. verlegt.
  // Kreuztabelle daher aus den Spielplan-Ergebnissen abgeleitet; alles Übrige "0:0".
  {
    teamLabel: "Mixed",
    teamColor: "#a855f7",
    leagueName: "Spielebene B · Gr. 074",
    ownRank: 3,
    entries: [
      { rank: 1, club: "TF Markt Schwaben", isOwnClub: false, points: "2:0", matchPoints: "4:2", sets: "9:4", crossResults: ["***", "0:0", "0:0", "0:0", "0:0", "4:2"] },
      { rank: 2, club: "TSV Haar", isOwnClub: false, points: "2:0", matchPoints: "4:2", sets: "9:5", crossResults: ["0:0", "***", "4:2", "0:0", "0:0", "0:0"] },
      { rank: 3, club: "TC Pliening", isOwnClub: true , points: "2:2", matchPoints: "6:6", sets: "13:13", crossResults: ["0:0", "2:4", "***", "0:0", "4:2", "0:0"] },
      { rank: 4, club: "FC Forstern", isOwnClub: false, points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "***", "0:0", "0:0"] },
      { rank: 5, club: "TeG Kirchheim", isOwnClub: false, points: "0:2", matchPoints: "2:4", sets: "4:8", crossResults: ["0:0", "0:0", "2:4", "0:0", "***", "0:0"] },
      { rank: 6, club: "TSV Feldkirchen", isOwnClub: false, points: "0:2", matchPoints: "2:4", sets: "4:9", crossResults: ["2:4", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },
  // ── Juniorinnen 18  Südliga 3  Gr. 686 ──
  // Endstand (Report vom 19.07.2026): offen blieb nur Unterföhring II–Pliening (Nachholspiel 24.07.).
  {
    teamLabel: "Juniorinnen 18",
    teamColor: "#22c55e",
    leagueName: "Südliga 3 · Gr. 686",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TC Unterföhring II", isOwnClub: false, points: "8:0", matchPoints: "24:0", sets: "48:1", crossResults: ["***", "0:0", "6:0", "6:0", "6:0", "6:0"] },
      { rank: 2, club: "TC Pliening", isOwnClub: true , points: "7:1", matchPoints: "18:6", sets: "36:14", crossResults: ["0:0", "***", "3:3", "5:1", "4:2", "6:0"] },
      { rank: 3, club: "1.Deisenhofer Kinder-TC", isOwnClub: false, points: "5:5", matchPoints: "16:14", sets: "36:28", crossResults: ["0:6", "3:3", "***", "2:4", "6:0", "5:1"] },
      { rank: 4, club: "TS Jahn München", isOwnClub: false, points: "5:5", matchPoints: "14:16", sets: "30:35", crossResults: ["0:6", "1:5", "4:2", "***", "3:3", "6:0"] },
      { rank: 5, club: "TSV Haar II", isOwnClub: false, points: "2:8", matchPoints: "8:22", sets: "17:45", crossResults: ["0:6", "2:4", "0:6", "3:3", "***", "3:3"] },
      { rank: 6, club: "TC Ottobrunn", isOwnClub: false, points: "1:9", matchPoints: "4:26", sets: "8:52", crossResults: ["0:6", "0:6", "1:5", "0:6", "3:3", "***"] },
    ],
  },
  // ── Knaben 15  Südliga 4  Gr. 596 ──
  // Endstand (Report vom 19.07.2026) — Saison komplett, TC Pliening MEISTER (12:0)!
  {
    teamLabel: "Knaben 15",
    teamColor: "#4ade80",
    leagueName: "Südliga 4 · Gr. 596",
    ownRank: 1,
    entries: [
      { rank: 1, club: "TC Pliening", isOwnClub: true , points: "12:0", matchPoints: "30:6", sets: "62:16", crossResults: ["***", "5:1", "4:2", "6:0", "5:1", "6:0", "4:2"] },
      { rank: 2, club: "SC Baldham-Vaterstetten", isOwnClub: false, points: "9:3", matchPoints: "22:14", sets: "46:31", crossResults: ["1:5", "***", "3:3", "4:2", "5:1", "5:1", "4:2"] },
      { rank: 3, club: "TF Markt Schwaben", isOwnClub: false, points: "7:5", matchPoints: "23:13", sets: "52:29", crossResults: ["2:4", "3:3", "***", "3:3", "6:0", "3:3", "6:0"] },
      { rank: 4, club: "ATSV Kirchseeon", isOwnClub: false, points: "7:5", matchPoints: "17:19", sets: "36:42", crossResults: ["0:6", "2:4", "3:3", "***", "4:2", "4:2", "4:2"] },
      { rank: 5, club: "TC Putzbrunn", isOwnClub: false, points: "3:9", matchPoints: "12:24", sets: "28:50", crossResults: ["1:5", "1:5", "0:6", "2:4", "***", "3:3", "5:1"] },
      { rank: 6, club: "TC Anzing II", isOwnClub: false, points: "2:10", matchPoints: "11:25", sets: "28:53", crossResults: ["0:6", "1:5", "3:3", "2:4", "3:3", "***", "2:4"] },
      { rank: 7, club: "TSV Haar II", isOwnClub: false, points: "2:10", matchPoints: "11:25", sets: "24:55", crossResults: ["2:4", "2:4", "0:6", "2:4", "1:5", "4:2", "***"] },
    ],
  },
  // ── Knaben 15 II  Südliga 5  Gr. 638 ──
  // Endstand (Report vom 19.07.2026): offen sind Walpertskirchen–Pliening II (19.07.),
  // Pliening II–Isen (24.07.) und Haag–Wasserburg (25.07.).
  {
    teamLabel: "Knaben 15 II",
    teamColor: "#86efac",
    leagueName: "Südliga 5 · Gr. 638",
    ownRank: 7,
    entries: [
      { rank: 1, club: "TC Rot-Weiß Poing II", isOwnClub: false, points: "14:0", matchPoints: "37:5", sets: "77:13", crossResults: ["***", "6:0", "4:2", "5:1", "6:0", "4:2", "6:0", "6:0"] },
      { rank: 2, club: "FC Forstern", isOwnClub: false, points: "12:2", matchPoints: "33:9", sets: "66:22", crossResults: ["0:6", "***", "6:0", "6:0", "6:0", "4:2", "6:0", "5:1"] },
      { rank: 3, club: "TeG Wasserburg-Reitmehring III", isOwnClub: false, points: "7:5", matchPoints: "19:17", sets: "42:36", crossResults: ["2:4", "0:6", "***", "0:0", "5:1", "3:3", "4:2", "5:1"] },
      { rank: 4, club: "TC Haag", isOwnClub: false, points: "5:7", matchPoints: "14:22", sets: "32:49", crossResults: ["1:5", "0:6", "0:0", "***", "4:2", "1:5", "3:3", "5:1"] },
      { rank: 5, club: "TC Isen", isOwnClub: false, points: "4:8", matchPoints: "12:24", sets: "29:52", crossResults: ["0:6", "0:6", "1:5", "2:4", "***", "4:2", "0:0", "5:1"] },
      { rank: 6, club: "TF Markt Schwaben II", isOwnClub: false, points: "4:10", matchPoints: "19:23", sets: "45:50", crossResults: ["2:4", "2:4", "3:3", "5:1", "2:4", "***", "3:3", "2:4"] },
      { rank: 7, club: "TC Pliening II", isOwnClub: true , points: "2:8", matchPoints: "8:22", sets: "20:45", crossResults: ["0:6", "0:6", "2:4", "3:3", "0:0", "3:3", "***", "0:0"] },
      { rank: 8, club: "SV Walpertskirchen", isOwnClub: false, points: "2:10", matchPoints: "8:28", sets: "17:61", crossResults: ["0:6", "1:5", "1:5", "1:5", "1:5", "4:2", "0:0", "***"] },
    ],
  },
  // ── Midcourt U10  Südliga 1  Gr. 870 ──
  // Endstand (Report vom 19.07.2026) — Saison komplett.
  {
    teamLabel: "Midcourt U10",
    teamColor: "#a3e635",
    leagueName: "Südliga 1 · Gr. 870",
    ownRank: 6,
    entries: [
      { rank: 1, club: "TC Sport Scheck", isOwnClub: false, points: "9:1", matchPoints: "24:6", sets: "50:14", crossResults: ["***", "3:3", "4:2", "6:0", "5:1", "6:0"] },
      { rank: 2, club: "STK Garching", isOwnClub: false, points: "9:1", matchPoints: "24:6", sets: "50:17", crossResults: ["3:3", "***", "5:1", "5:1", "5:1", "6:0"] },
      { rank: 3, club: "TC Cosima München", isOwnClub: false, points: "5:5", matchPoints: "15:15", sets: "31:33", crossResults: ["2:4", "1:5", "***", "4:2", "3:3", "5:1"] },
      { rank: 4, club: "TC Aschheim II", isOwnClub: false, points: "4:6", matchPoints: "12:18", sets: "30:39", crossResults: ["0:6", "1:5", "2:4", "***", "4:2", "5:1"] },
      { rank: 5, club: "SC Freimann", isOwnClub: false, points: "3:7", matchPoints: "13:17", sets: "28:35", crossResults: ["1:5", "1:5", "3:3", "2:4", "***", "6:0"] },
      { rank: 6, club: "TC Pliening", isOwnClub: true , points: "0:10", matchPoints: "2:28", sets: "5:56", crossResults: ["0:6", "0:6", "1:5", "1:5", "0:6", "***"] },
    ],
  },
];
