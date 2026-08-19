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
  // Endstand (Gruppen-Report vom 15.08.2026): Pliening–Finsing (28.06.) wurde
  // nachträglich mit 3:6 gewertet (stand bis 19.07. offiziell 0:0) — dadurch
  // Finsing 8:6 (Rang 4) und Pliening hinter Unterföhring II auf Rang 6.
  {
    teamLabel: "Herren",
    teamColor: "#0ea5e9",
    leagueName: "Südliga 2 · Gr. 023",
    ownRank: 6,
    entries: [
      { rank: 1, club: "TF Markt Schwaben", isOwnClub: false, points: "14:0", matchPoints: "49:14", sets: "102:33", crossResults: ["***", "7:2", "6:3", "7:2", "7:2", "9:0", "6:3", "7:2"] },
      { rank: 2, club: "TSV Feldkirchen II", isOwnClub: false, points: "12:2", matchPoints: "51:12", sets: "106:30", crossResults: ["2:7", "***", "8:1", "9:0", "8:1", "9:0", "9:0", "6:3"] },
      { rank: 3, club: "TC Aschheim III", isOwnClub: false, points: "10:4", matchPoints: "42:21", sets: "87:50", crossResults: ["3:6", "1:8", "***", "5:4", "8:1", "9:0", "8:1", "8:1"] },
      { rank: 4, club: "TC Finsing", isOwnClub: false, points: "8:6", matchPoints: "31:32", sets: "70:71", crossResults: ["2:7", "0:9", "4:5", "***", "6:3", "6:3", "6:3", "7:2"] },
      { rank: 5, club: "TC Unterföhring II", isOwnClub: false, points: "4:10", matchPoints: "26:37", sets: "58:77", crossResults: ["2:7", "1:8", "1:8", "3:6", "***", "7:2", "4:5", "8:1"] },
      { rank: 6, club: "TC Pliening", isOwnClub: true , points: "4:10", matchPoints: "22:41", sets: "52:86", crossResults: ["0:9", "0:9", "0:9", "3:6", "2:7", "***", "8:1", "9:0"] },
      { rank: 7, club: "Polizei SV Haar", isOwnClub: false, points: "2:12", matchPoints: "17:46", sets: "39:97", crossResults: ["3:6", "0:9", "1:8", "3:6", "5:4", "1:8", "***", "4:5"] },
      { rank: 8, club: "TC Erding II", isOwnClub: false, points: "2:12", matchPoints: "14:49", sets: "35:105", crossResults: ["2:7", "3:6", "1:8", "2:7", "1:8", "0:9", "5:4", "***"] },
    ],
  },
  // ── Herren 30 Südliga 4 (4er)  Gr. 292 ──
  // Endstand (Gruppen-Report vom 15.08.2026): Nachholspiel Putzbrunn–Oberpframmern
  // 0:6 (30.07.) ist gewertet — Saison komplett, Oberpframmern (6:2) jetzt vor
  // Finsing (6:2) auf Rang 1.
  {
    teamLabel: "Herren 30",
    teamColor: "#22d3ee",
    leagueName: "Südliga 4 (4er) · Gr. 292",
    ownRank: 3,
    entries: [
      { rank: 1, club: "TSV Oberpframmern", isOwnClub: false, points: "6:2", matchPoints: "19:5", sets: "39:12", crossResults: ["***", "2:4", "5:1", "6:0", "6:0"] },
      { rank: 2, club: "TC Finsing", isOwnClub: false, points: "6:2", matchPoints: "14:10", sets: "33:24", crossResults: ["4:2", "***", "2:4", "4:2", "4:2"] },
      { rank: 3, club: "TC Pliening", isOwnClub: true , points: "5:3", matchPoints: "14:10", sets: "29:24", crossResults: ["1:5", "4:2", "***", "6:0", "3:3"] },
      { rank: 4, club: "TC Putzbrunn", isOwnClub: false, points: "2:6", matchPoints: "6:18", sets: "18:39", crossResults: ["0:6", "2:4", "0:6", "***", "4:2"] },
      { rank: 5, club: "TC Philathlos München", isOwnClub: false, points: "1:7", matchPoints: "7:17", sets: "16:36", crossResults: ["0:6", "2:4", "3:3", "2:4", "***"] },
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
  // Endstand (Gruppen-Report vom 19.08.2026): Saison komplett. Nachgetragen sind
  // Anzing–Unterföhring 1:8 und Ramersdorf–Grün-Gold 3:6 (19.07.) sowie
  // Grün-Gold–Schloßberg 7:2 (26.07.) — Letzteres stand vorher als 1:3-Streichung
  // in der Tabelle und wird vom BTV jetzt voll gewertet. Dadurch Grün-Gold auf
  // Rang 2 vor Schloßberg und Unterföhring (alle 8:4). Pliening-II-Begegnungen
  // bleiben gestrichen (Rückzug 07.05.). Werte verbatim.
  {
    teamLabel: "Herren 40 II",
    teamColor: "#67e8f9",
    leagueName: "Landesliga 2 · Gr. 043 SU",
    ownRank: 8,
    entries: [
      { rank: 1, club: "TSV 1860 Rosenheim", isOwnClub: false, points: "12:0", matchPoints: "33:21", sets: "70:47", crossResults: ["***", "5:4", "5:4", "6:3", "6:3", "5:4", "6:3", "0:0"] },
      { rank: 2, club: "TC Grün-Gold München", isOwnClub: false, points: "8:4", matchPoints: "36:18", sets: "81:43", crossResults: ["4:5", "***", "7:2", "4:5", "6:3", "6:3", "9:0", "0:0"] },
      { rank: 3, club: "SV Schloßberg-Stephansk.", isOwnClub: false, points: "8:4", matchPoints: "34:20", sets: "72:44", crossResults: ["4:5", "2:7", "***", "7:2", "5:4", "8:1", "8:1", "0:0"] },
      { rank: 4, club: "TC Unterföhring", isOwnClub: false, points: "8:4", matchPoints: "32:22", sets: "67:49", crossResults: ["3:6", "5:4", "2:7", "***", "5:4", "9:0", "8:1", "0:0"] },
      { rank: 5, club: "TSV Marquartstein", isOwnClub: false, points: "4:8", matchPoints: "29:25", sets: "61:55", crossResults: ["3:6", "3:6", "4:5", "4:5", "***", "6:3", "9:0", "0:0"] },
      { rank: 6, club: "TC Ramersdorf", isOwnClub: false, points: "2:10", matchPoints: "20:34", sets: "48:73", crossResults: ["4:5", "3:6", "1:8", "0:9", "3:6", "***", "9:0", "0:0"] },
      { rank: 7, club: "TC Anzing", isOwnClub: false, points: "0:12", matchPoints: "5:49", sets: "13:101", crossResults: ["3:6", "0:9", "1:8", "1:8", "0:9", "0:9", "***", "0:0"] },
      { rank: 8, club: "TC Pliening II (zurückgezogen)", isOwnClub: true , points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },
  // ── Herren 40 III Südliga 2  Gr. 315 ──
  // Endstand (Gruppen-Report vom 19.08.2026): Saison komplett. Nachgetragen sind die
  // beiden letzten Begegnungen vom 18.07. — Feldkirchen II–Pliening III 0:9 und
  // Fideliopark II–Grün-Gold II 2:7. Pliening III steht damit auf Rang 3 (8:4).
  // Forstinning-Begegnungen (zurückgezogen 11.05.) bleiben gestrichen; das
  // Markt Schwaben–Forstinning 6:3 zählt der BTV nicht mit (bekannte Ausnahme).
  {
    teamLabel: "Herren 40 III",
    teamColor: "#7dd3fc",
    leagueName: "Südliga 2 · Gr. 315",
    ownRank: 3,
    entries: [
      { rank: 1, club: "TC Aschheim", isOwnClub: false, points: "10:2", matchPoints: "36:18", sets: "82:45", crossResults: ["***", "6:3", "2:7", "6:3", "6:3", "8:1", "8:1", "0:0"] },
      { rank: 2, club: "TSV Haar II", isOwnClub: false, points: "10:2", matchPoints: "36:18", sets: "77:47", crossResults: ["3:6", "***", "8:1", "6:3", "5:4", "5:4", "9:0", "0:0"] },
      { rank: 3, club: "TC Pliening III", isOwnClub: true , points: "8:4", matchPoints: "33:21", sets: "73:55", crossResults: ["7:2", "1:8", "***", "4:5", "9:0", "5:4", "7:2", "0:0"] },
      { rank: 4, club: "TC Grün-Gold München II", isOwnClub: false, points: "8:4", matchPoints: "29:25", sets: "64:55", crossResults: ["3:6", "3:6", "5:4", "***", "5:4", "6:3", "7:2", "0:0"] },
      { rank: 5, club: "TSV Feldkirchen II", isOwnClub: false, points: "4:8", matchPoints: "23:31", sets: "57:66", crossResults: ["3:6", "4:5", "0:9", "4:5", "***", "5:4", "7:2", "0:0"] },
      { rank: 6, club: "TF Markt Schwaben", isOwnClub: false, points: "2:10", matchPoints: "23:31", sets: "54:71", crossResults: ["1:8", "4:5", "4:5", "3:6", "4:5", "***", "7:2", "6:3"] },
      { rank: 7, club: "WB Fideliopark München II", isOwnClub: false, points: "0:12", matchPoints: "9:45", sets: "24:92", crossResults: ["1:8", "0:9", "2:7", "2:7", "2:7", "2:7", "***", "0:0"] },
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
      { rank: 4, club: "VfB Forstinning", isOwnClub: false, points: "6:6", matchPoints: "24:30", sets: "56:66", crossResults: ["0:9", "6:3", "4:5", "***", "2:7", "5:4", "7:2"] },
      { rank: 5, club: "TS Jahn München", isOwnClub: false, points: "4:8", matchPoints: "24:30", sets: "54:64", crossResults: ["3:6", "2:7", "3:6", "7:2", "***", "7:2", "2:7"] },
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
      { rank: 2, club: "SV Hörlkofen", isOwnClub: false, points: "10:2", matchPoints: "38:16", sets: "80:41", crossResults: ["4:5", "***", "6:3", "8:1", "7:2", "7:2", "6:3"] },
      { rank: 3, club: "TSV Rottenburg", isOwnClub: false, points: "8:4", matchPoints: "33:21", sets: "72:47", crossResults: ["2:7", "3:6", "***", "7:2", "6:3", "9:0", "6:3"] },
      { rank: 4, club: "TC Marzling", isOwnClub: false, points: "6:6", matchPoints: "24:30", sets: "56:67", crossResults: ["2:7", "1:8", "2:7", "***", "6:3", "6:3", "7:2"] },
      { rank: 5, club: "FC Langengeisling", isOwnClub: false, points: "4:8", matchPoints: "25:29", sets: "56:68", crossResults: ["4:5", "2:7", "3:6", "3:6", "***", "8:1", "5:4"] },
      { rank: 6, club: "TF Eitting", isOwnClub: false, points: "2:10", matchPoints: "12:42", sets: "32:89", crossResults: ["1:8", "2:7", "0:9", "3:6", "1:8", "***", "5:4"] },
      { rank: 7, club: "TC Pliening", isOwnClub: true , points: "0:12", matchPoints: "20:34", sets: "46:72", crossResults: ["4:5", "3:6", "3:6", "2:7", "4:5", "4:5", "***"] },
    ],
  },
  // ── Damen Südliga 2  Gr. 160 ──
  // Endstand (Gruppen-Report vom 15.08.2026): Nachzügler Jahn–Grün-Gold 5:4
  // (19.07.) und Steinhöring–Fideliopark II 4:5 (02.08.) sind gewertet —
  // Saison komplett, Jahn (6:8) damit vor Topspin (6:8) auf Rang 6.
  {
    teamLabel: "Damen",
    teamColor: "#f59e0b",
    leagueName: "Südliga 2 · Gr. 160",
    ownRank: 2,
    entries: [
      { rank: 1, club: "WB Fideliopark München II", isOwnClub: false, points: "12:2", matchPoints: "42:21", sets: "87:53", crossResults: ["***", "7:2", "5:4", "4:5", "5:4", "5:4", "8:1", "8:1"] },
      { rank: 2, club: "TC Pliening", isOwnClub: true , points: "10:4", matchPoints: "38:25", sets: "80:57", crossResults: ["2:7", "***", "4:5", "6:3", "7:2", "6:3", "7:2", "6:3"] },
      { rank: 3, club: "TC Steinhöring", isOwnClub: false, points: "8:6", matchPoints: "34:29", sets: "74:61", crossResults: ["4:5", "5:4", "***", "4:5", "3:6", "5:4", "7:2", "6:3"] },
      { rank: 4, club: "TC Neukeferloh", isOwnClub: false, points: "8:6", matchPoints: "31:32", sets: "68:71", crossResults: ["5:4", "3:6", "5:4", "***", "2:7", "6:3", "4:5", "6:3"] },
      { rank: 5, club: "TC Unterföhring", isOwnClub: false, points: "6:8", matchPoints: "30:33", sets: "72:73", crossResults: ["4:5", "2:7", "6:3", "7:2", "***", "4:5", "2:7", "5:4"] },
      { rank: 6, club: "TS Jahn München", isOwnClub: false, points: "6:8", matchPoints: "30:33", sets: "67:74", crossResults: ["4:5", "3:6", "4:5", "3:6", "5:4", "***", "6:3", "5:4"] },
      { rank: 7, club: "TC Topspin", isOwnClub: false, points: "6:8", matchPoints: "25:38", sets: "57:85", crossResults: ["1:8", "2:7", "2:7", "5:4", "7:2", "3:6", "***", "5:4"] },
      { rank: 8, club: "TC Grün-Gold München", isOwnClub: false, points: "0:14", matchPoints: "22:41", sets: "56:87", crossResults: ["1:8", "3:6", "3:6", "3:6", "4:5", "4:5", "4:5", "***"] },
    ],
  },
  // ── Damen 40  Südliga 1  Gr. 441 ──
  // Endstand (Report vom 19.07.2026): offen blieben Pfaffenhofen II–Rudelzhausen (18.07.,
  // noch ohne Ergebnis) und ESV–Rudelzhausen (Nachholspiel 25.07.).
  {
    teamLabel: "Damen 40",
    teamColor: "#fbbf24",
    leagueName: "Südliga 1 · Gr. 441",
    ownRank: 6,
    entries: [
      { rank: 1, club: "VfB Hallbergmoos", isOwnClub: false, points: "14:0", matchPoints: "44:19", sets: "92:47", crossResults: ["***", "6:3", "5:4", "5:4", "8:1", "5:4", "7:2", "8:1"] },
      { rank: 2, club: "Weißblau Allianz München", isOwnClub: false, points: "10:4", matchPoints: "33:30", sets: "75:62", crossResults: ["3:6", "***", "3:6", "5:4", "5:4", "6:3", "5:4", "6:3"] },
      { rank: 3, club: "ESV München Sportpark", isOwnClub: false, points: "8:6", matchPoints: "41:22", sets: "88:50", crossResults: ["4:5", "6:3", "***", "4:5", "4:5", "8:1", "6:3", "9:0"] },
      { rank: 4, club: "SC Baldham-Vaterstetten", isOwnClub: false, points: "8:6", matchPoints: "36:27", sets: "80:64", crossResults: ["4:5", "4:5", "5:4", "***", "7:2", "4:5", "7:2", "5:4"] },
      { rank: 5, club: "TSV Rudelzhausen", isOwnClub: false, points: "8:6", matchPoints: "30:33", sets: "68:73", crossResults: ["1:8", "4:5", "5:4", "2:7", "***", "7:2", "5:4", "6:3"] },
      { rank: 6, club: "TC Pliening", isOwnClub: true , points: "4:10", matchPoints: "27:36", sets: "62:81", crossResults: ["4:5", "3:6", "1:8", "5:4", "2:7", "***", "4:5", "8:1"] },
      { rank: 7, club: "TC Pfaffenhofen/Ilm II", isOwnClub: false, points: "4:10", matchPoints: "27:36", sets: "59:78", crossResults: ["2:7", "4:5", "3:6", "2:7", "4:5", "5:4", "***", "7:2"] },
      { rank: 8, club: "WB Fideliopark München", isOwnClub: false, points: "0:14", matchPoints: "14:49", sets: "34:103", crossResults: ["1:8", "3:6", "0:9", "4:5", "3:6", "1:8", "2:7", "***"] },
    ],
  },
  // ── Damen 50  Landesliga 1 (4er)  Gr. 103 SU ──
  // Endstand (Report vom 19.07.2026): offen blieben Hofkirchen–Unterhaching II (18.07.,
  // noch ohne Ergebnis) und Eintracht Karlsfeld–Steinhöring (Nachholspiel 28.07.).
  {
    teamLabel: "Damen 50",
    teamColor: "#fcd34d",
    leagueName: "Landesliga 1 (4er) · Gr. 103 SU",
    ownRank: 3,
    entries: [
      { rank: 1, club: "TC Hofkirchen", isOwnClub: false, points: "12:2", matchPoints: "30:12", sets: "65:28", crossResults: ["***", "1:5", "4:2", "6:0", "4:2", "5:1", "6:0", "4:2"] },
      { rank: 2, club: "TC Steinhöring", isOwnClub: false, points: "11:3", matchPoints: "29:13", sets: "63:30", crossResults: ["5:1", "***", "3:3", "3:3", "3:3", "5:1", "4:2", "6:0"] },
      { rank: 3, club: "TC Pliening", isOwnClub: true , points: "9:5", matchPoints: "28:14", sets: "61:31", crossResults: ["2:4", "3:3", "***", "2:4", "5:1", "5:1", "5:1", "6:0"] },
      { rank: 4, club: "TSV Unterhaching II", isOwnClub: false, points: "9:5", matchPoints: "24:18", sets: "49:42", crossResults: ["0:6", "3:3", "4:2", "***", "2:4", "5:1", "6:0", "4:2"] },
      { rank: 5, club: "TSV Eintracht Karlsfeld", isOwnClub: false, points: "8:6", matchPoints: "21:21", sets: "45:46", crossResults: ["2:4", "3:3", "1:5", "4:2", "***", "3:3", "4:2", "4:2"] },
      { rank: 6, club: "TC Karlsfeld am See", isOwnClub: false, points: "4:10", matchPoints: "14:28", sets: "32:58", crossResults: ["1:5", "1:5", "1:5", "1:5", "3:3", "***", "3:3", "4:2"] },
      { rank: 7, club: "TSV Moosach München", isOwnClub: false, points: "3:11", matchPoints: "12:30", sets: "28:62", crossResults: ["0:6", "2:4", "1:5", "0:6", "2:4", "3:3", "***", "4:2"] },
      { rank: 8, club: "TC Gernlinden II", isOwnClub: false, points: "0:14", matchPoints: "10:32", sets: "22:68", crossResults: ["2:4", "0:6", "0:6", "2:4", "2:4", "2:4", "2:4", "***"] },
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
  // Eigener Report "Tabelle und Spielplan" der Gruppe (nu.Dokument 013),
  // nicht Teil des vereinsweiten ResultReportFOP der Sommerrunde.
  // Stand 15.08.2026 (Report 16:09): 3. Spieltag (15.08.) komplett — Markt Schwaben–Haar
  // 1:5 (Spielbericht Nr. 7) und Pliening–Feldkirchen 4:2 (Spielbericht Nr. 5).
  // Forstern–Haar (ursprünglich 01.08.) bleibt auf den 27.09. verlegt.
  // Kreuztabelle aus den Spielplan-Ergebnissen abgeleitet; alles Übrige "0:0".
  {
    teamLabel: "Mixed",
    teamColor: "#a855f7",
    leagueName: "Spielebene B · Gr. 074",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TSV Haar", isOwnClub: false, points: "4:0", matchPoints: "9:3", sets: "20:8", crossResults: ["***", "4:2", "0:0", "5:1", "0:0", "0:0"] },
      { rank: 2, club: "TC Pliening", isOwnClub: true , points: "4:2", matchPoints: "10:8", sets: "22:17", crossResults: ["2:4", "***", "0:0", "0:0", "4:2", "4:2"] },
      { rank: 3, club: "FC Forstern", isOwnClub: false, points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "***", "0:0", "0:0", "0:0"] },
      { rank: 4, club: "TF Markt Schwaben", isOwnClub: false, points: "2:2", matchPoints: "5:7", sets: "12:15", crossResults: ["1:5", "0:0", "0:0", "***", "0:0", "4:2"] },
      { rank: 5, club: "TeG Kirchheim", isOwnClub: false, points: "0:2", matchPoints: "2:4", sets: "4:8", crossResults: ["0:0", "2:4", "0:0", "0:0", "***", "0:0"] },
      { rank: 6, club: "TSV Feldkirchen", isOwnClub: false, points: "0:4", matchPoints: "4:8", sets: "8:18", crossResults: ["0:0", "2:4", "0:0", "2:4", "0:0", "***"] },
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
      { rank: 1, club: "TC Unterföhring II", isOwnClub: false, points: "10:0", matchPoints: "29:1", sets: "58:4", crossResults: ["***", "5:1", "6:0", "6:0", "6:0", "6:0"] },
      { rank: 2, club: "TC Pliening", isOwnClub: true , points: "7:3", matchPoints: "19:11", sets: "39:24", crossResults: ["1:5", "***", "3:3", "5:1", "4:2", "6:0"] },
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
    ownRank: 8,
    entries: [
      { rank: 1, club: "TC Rot-Weiß Poing II", isOwnClub: false, points: "14:0", matchPoints: "37:5", sets: "77:13", crossResults: ["***", "6:0", "4:2", "5:1", "6:0", "4:2", "6:0", "6:0"] },
      { rank: 2, club: "FC Forstern", isOwnClub: false, points: "12:2", matchPoints: "33:9", sets: "66:22", crossResults: ["0:6", "***", "6:0", "6:0", "6:0", "4:2", "5:1", "6:0"] },
      { rank: 3, club: "TeG Wasserburg-Reitmehring III", isOwnClub: false, points: "9:5", matchPoints: "24:18", sets: "52:39", crossResults: ["2:4", "0:6", "***", "5:1", "5:1", "3:3", "5:1", "4:2"] },
      { rank: 4, club: "TC Haag", isOwnClub: false, points: "5:9", matchPoints: "15:27", sets: "35:59", crossResults: ["1:5", "0:6", "1:5", "***", "4:2", "1:5", "5:1", "3:3"] },
      { rank: 5, club: "TC Isen", isOwnClub: false, points: "5:9", matchPoints: "15:27", sets: "35:60", crossResults: ["0:6", "0:6", "1:5", "2:4", "***", "4:2", "5:1", "3:3"] },
      { rank: 6, club: "TF Markt Schwaben II", isOwnClub: false, points: "4:10", matchPoints: "19:23", sets: "45:50", crossResults: ["2:4", "2:4", "3:3", "5:1", "2:4", "***", "2:4", "3:3"] },
      { rank: 7, club: "SV Walpertskirchen", isOwnClub: false, points: "4:10", matchPoints: "12:30", sets: "26:65", crossResults: ["0:6", "1:5", "1:5", "1:5", "1:5", "4:2", "***", "4:2"] },
      { rank: 8, club: "TC Pliening II", isOwnClub: true , points: "3:11", matchPoints: "13:29", sets: "32:60", crossResults: ["0:6", "0:6", "2:4", "3:3", "3:3", "3:3", "2:4", "***"] },
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
