import type { LeagueStandings } from "../types";

// ── Sommer 2026 Tabellen / Standings ──
// Quelle: offizielle BTV nuLiga "Ergebnistabellen gesamt" (vereinsweiter Report, alle Mannschaften):
//   https://btv.liga.nu/.../nuDokument?dokument=ResultReportFOP&type=full&club=22844&season=18103
//   (club=22844 = TC Pliening, season=18103 = Sommer 2026; verlinkt auf der btv.de-Vereinsseite)
// Tabellen + Kreuztabellen 1:1 aus dem offiziellen Report übernommen. Stand: 17.06.2026.
// Hinweis: Bei zurückgezogenen Mannschaften weichen offizielle Matchpunkte und
// Kreuztabelle ab (BTV streicht gewertete Spiele aus der Tabelle) — Werte verbatim wie offiziell.
// crossResults: "***" = Diagonale, "0:0" = noch nicht gespielt (zeigt "n.a.").

export const SUMMER_STANDINGS: LeagueStandings[] = [
  // ── Herren Südliga 2  Gr. 023 ──
  {
    teamLabel: "Herren",
    teamColor: "#0ea5e9",
    leagueName: "Südliga 2 · Gr. 023",
    ownRank: 4,
    entries: [
      { rank: 1, club: "TSV Feldkirchen II", isOwnClub: false, points: "6:0", matchPoints: "26:1", sets: "52:6", crossResults: ["***", "0:0", "0:0", "9:0", "9:0", "0:0", "0:0", "8:1"] },
      { rank: 2, club: "TC Aschheim III", isOwnClub: false, points: "6:0", matchPoints: "21:6", sets: "43:15", crossResults: ["0:0", "***", "0:0", "0:0", "5:4", "8:1", "0:0", "8:1"] },
      { rank: 3, club: "TF Markt Schwaben", isOwnClub: false, points: "6:0", matchPoints: "20:7", sets: "41:15", crossResults: ["0:0", "0:0", "***", "0:0", "0:0", "6:3", "7:2", "7:2"] },
      { rank: 4, club: "TC Pliening", isOwnClub: true , points: "4:2", matchPoints: "17:10", sets: "36:22", crossResults: ["0:9", "0:0", "0:0", "***", "0:0", "8:1", "9:0", "0:0"] },
      { rank: 5, club: "TC Finsing", isOwnClub: false, points: "2:4", matchPoints: "11:16", sets: "28:32", crossResults: ["0:9", "4:5", "0:0", "0:0", "***", "0:0", "7:2", "0:0"] },
      { rank: 6, club: "Polizei SV Haar", isOwnClub: false, points: "0:6", matchPoints: "5:22", sets: "12:46", crossResults: ["0:0", "1:8", "3:6", "1:8", "0:0", "***", "0:0", "0:0"] },
      { rank: 7, club: "TC Erding II", isOwnClub: false, points: "0:6", matchPoints: "4:23", sets: "11:49", crossResults: ["0:0", "0:0", "2:7", "0:9", "2:7", "0:0", "***", "0:0"] },
      { rank: 8, club: "TC Unterföhring II", isOwnClub: false, points: "0:6", matchPoints: "4:23", sets: "8:46", crossResults: ["1:8", "1:8", "2:7", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },
  // ── Herren 30 Südliga 4 (4er)  Gr. 292 ──
  {
    teamLabel: "Herren 30",
    teamColor: "#22d3ee",
    leagueName: "Südliga 4 (4er) · Gr. 292",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TC Finsing", isOwnClub: false, points: "4:0", matchPoints: "8:4", sets: "18:11", crossResults: ["***", "0:0", "0:0", "4:2", "4:2"] },
      { rank: 2, club: "TC Pliening", isOwnClub: true , points: "3:1", matchPoints: "9:3", sets: "18:8", crossResults: ["0:0", "***", "3:3", "0:0", "6:0"] },
      { rank: 3, club: "TC Philathlos München", isOwnClub: false, points: "1:1", matchPoints: "3:3", sets: "6:6", crossResults: ["0:0", "3:3", "***", "0:0", "0:0"] },
      { rank: 4, club: "TSV Oberpframmern", isOwnClub: false, points: "0:2", matchPoints: "2:4", sets: "5:8", crossResults: ["2:4", "0:0", "0:0", "***", "0:0"] },
      { rank: 5, club: "TC Putzbrunn", isOwnClub: false, points: "0:4", matchPoints: "2:10", sets: "8:22", crossResults: ["2:4", "0:6", "0:0", "0:0", "***"] },
    ],
  },
  // ── Herren 40 Regionalliga Süd-Ost  Gr. 004 ──
  {
    teamLabel: "Herren 40",
    teamColor: "#38bdf8",
    leagueName: "Regionalliga Süd-Ost · Gr. 004",
    ownRank: 4,
    entries: [
      { rank: 1, club: "MTTC Iphitos München", isOwnClub: false, points: "8:0", matchPoints: "25:11", sets: "53:27", crossResults: ["***", "0:0", "0:0", "5:4", "0:0", "5:4", "8:1", "7:2"] },
      { rank: 2, club: "Bad WH Dresden", isOwnClub: false, points: "6:2", matchPoints: "20:16", sets: "47:36", crossResults: ["0:0", "***", "6:3", "6:3", "3:6", "0:0", "0:0", "5:4"] },
      { rank: 3, club: "TC Kümmersbruck", isOwnClub: false, points: "6:2", matchPoints: "20:16", sets: "43:35", crossResults: ["0:0", "3:6", "***", "0:0", "5:4", "6:3", "6:3", "0:0"] },
      { rank: 4, club: "TC Pliening", isOwnClub: true , points: "4:4", matchPoints: "20:16", sets: "45:37", crossResults: ["4:5", "3:6", "0:0", "***", "0:0", "6:3", "0:0", "7:2"] },
      { rank: 5, club: "TC Grün-Weiß Gräfelfing", isOwnClub: false, points: "4:4", matchPoints: "19:17", sets: "42:36", crossResults: ["0:0", "6:3", "4:5", "0:0", "***", "0:0", "4:5", "5:4"] },
      { rank: 6, club: "TSV Kottern", isOwnClub: false, points: "2:6", matchPoints: "15:21", sets: "33:44", crossResults: ["4:5", "0:0", "3:6", "3:6", "0:0", "***", "5:4", "0:0"] },
      { rank: 7, club: "SpVgg Zolling", isOwnClub: false, points: "2:6", matchPoints: "13:23", sets: "31:51", crossResults: ["1:8", "0:0", "3:6", "0:0", "5:4", "4:5", "***", "0:0"] },
      { rank: 8, club: "TC Herzogenaurach", isOwnClub: false, points: "0:8", matchPoints: "12:24", sets: "27:55", crossResults: ["2:7", "4:5", "0:0", "2:7", "4:5", "0:0", "0:0", "***"] },
    ],
  },
  // ── Herren 40 II Landesliga 2  Gr. 043 SU ──
  {
    teamLabel: "Herren 40 II",
    teamColor: "#67e8f9",
    leagueName: "Landesliga 2 · Gr. 043 SU",
    ownRank: 8,
    entries: [
      { rank: 1, club: "TSV 1860 Rosenheim", isOwnClub: false, points: "6:0", matchPoints: "16:11", sets: "36:25", crossResults: ["***", "0:0", "0:0", "5:4", "5:4", "0:0", "6:3", "0:0"] },
      { rank: 2, club: "TSV Marquartstein", isOwnClub: false, points: "4:2", matchPoints: "19:8", sets: "38:17", crossResults: ["0:0", "***", "4:5", "0:0", "0:0", "6:3", "9:0", "0:0"] },
      { rank: 3, club: "TC Unterföhring", isOwnClub: false, points: "4:2", matchPoints: "16:11", sets: "32:25", crossResults: ["0:0", "5:4", "***", "2:7", "0:0", "9:0", "0:0", "0:0"] },
      { rank: 4, club: "SV Schloßberg-Stephansk.", isOwnClub: false, points: "2:2", matchPoints: "11:7", sets: "22:14", crossResults: ["4:5", "0:0", "7:2", "***", "1:3", "0:0", "0:0", "0:0"] },
      { rank: 5, club: "TC Grün-Gold München", isOwnClub: false, points: "0:2", matchPoints: "4:5", sets: "10:12", crossResults: ["4:5", "0:0", "0:0", "3:1", "***", "0:0", "0:0", "0:0"] },
      { rank: 6, club: "TC Ramersdorf", isOwnClub: false, points: "0:4", matchPoints: "3:15", sets: "10:30", crossResults: ["0:0", "3:6", "0:9", "0:0", "0:0", "***", "0:0", "0:0"] },
      { rank: 7, club: "TC Anzing", isOwnClub: false, points: "0:4", matchPoints: "3:15", sets: "7:32", crossResults: ["3:6", "0:9", "0:0", "0:0", "0:0", "0:0", "***", "0:0"] },
      { rank: 8, club: "TC Pliening II (zurückgezogen)", isOwnClub: true , points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },
  // ── Herren 40 III Südliga 2  Gr. 315 ──
  {
    teamLabel: "Herren 40 III",
    teamColor: "#7dd3fc",
    leagueName: "Südliga 2 · Gr. 315",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TC Grün-Gold München II", isOwnClub: false, points: "6:0", matchPoints: "16:11", sets: "34:25", crossResults: ["***", "5:4", "0:0", "0:0", "5:4", "6:3", "0:0", "0:0"] },
      { rank: 2, club: "TC Pliening III", isOwnClub: true , points: "4:2", matchPoints: "18:9", sets: "38:27", crossResults: ["4:5", "***", "0:0", "7:2", "0:0", "0:0", "7:2", "0:0"] },
      { rank: 3, club: "TSV Haar II", isOwnClub: false, points: "4:2", matchPoints: "13:14", sets: "30:34", crossResults: ["0:0", "0:0", "***", "3:6", "5:4", "5:4", "0:0", "0:0"] },
      { rank: 4, club: "TC Aschheim", isOwnClub: false, points: "2:2", matchPoints: "8:10", sets: "22:23", crossResults: ["0:0", "2:7", "6:3", "***", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 5, club: "TSV Feldkirchen II", isOwnClub: false, points: "2:4", matchPoints: "15:12", sets: "33:25", crossResults: ["4:5", "0:0", "4:5", "0:0", "***", "0:0", "7:2", "0:0"] },
      { rank: 6, club: "TF Markt Schwaben", isOwnClub: false, points: "0:4", matchPoints: "7:11", sets: "19:23", crossResults: ["3:6", "0:0", "4:5", "0:0", "0:0", "***", "0:0", "6:3"] },
      { rank: 7, club: "WB Fideliopark München II", isOwnClub: false, points: "0:4", matchPoints: "4:14", sets: "10:29", crossResults: ["0:0", "2:7", "0:0", "0:0", "2:7", "0:0", "***", "0:0"] },
      { rank: 8, club: "VfB Forstinning (zurückgezogen)", isOwnClub: false, points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "0:0", "3:6", "0:0", "***"] },
    ],
  },
  // ── Herren 50 Regionalliga Süd-Ost  Gr. 005 ──
  {
    teamLabel: "Herren 50",
    teamColor: "#06b6d4",
    leagueName: "Regionalliga Süd-Ost · Gr. 005",
    ownRank: 5,
    entries: [
      { rank: 1, club: "1. Regensburger Tennis-Klub", isOwnClub: false, points: "6:0", matchPoints: "26:1", sets: "53:2", crossResults: ["***", "0:0", "0:0", "9:0", "0:0", "0:0", "8:1", "9:0"] },
      { rank: 2, club: "TSV Burgfarrnbach", isOwnClub: false, points: "6:0", matchPoints: "17:10", sets: "35:22", crossResults: ["0:0", "***", "0:0", "0:0", "5:4", "6:3", "6:3", "0:0"] },
      { rank: 3, club: "MTTC Iphitos München", isOwnClub: false, points: "4:2", matchPoints: "16:11", sets: "33:26", crossResults: ["0:0", "0:0", "***", "0:0", "3:6", "5:4", "0:0", "8:1"] },
      { rank: 4, club: "TC Grün-Weiß Gräfelfing", isOwnClub: false, points: "4:2", matchPoints: "11:16", sets: "23:34", crossResults: ["0:9", "0:0", "0:0", "***", "5:4", "0:0", "0:0", "6:3"] },
      { rank: 5, club: "TC Pliening", isOwnClub: true , points: "2:4", matchPoints: "14:13", sets: "32:29", crossResults: ["0:0", "4:5", "6:3", "4:5", "***", "0:0", "0:0", "0:0"] },
      { rank: 6, club: "SpVgg Zolling", isOwnClub: false, points: "2:4", matchPoints: "13:14", sets: "31:28", crossResults: ["0:0", "3:6", "4:5", "0:0", "0:0", "***", "6:3", "0:0"] },
      { rank: 7, club: "TC Bamberg", isOwnClub: false, points: "0:6", matchPoints: "7:20", sets: "14:42", crossResults: ["1:8", "3:6", "0:0", "0:0", "0:0", "3:6", "***", "0:0"] },
      { rank: 8, club: "TSV Altenfurt", isOwnClub: false, points: "0:6", matchPoints: "4:23", sets: "8:46", crossResults: ["0:9", "0:0", "1:8", "3:6", "0:0", "0:0", "0:0", "***"] },
    ],
  },
  // ── Herren 50 II Südliga 1  Gr. 355 ──
  {
    teamLabel: "Herren 50 II",
    teamColor: "#a5f3fc",
    leagueName: "Südliga 1 · Gr. 355",
    ownRank: 1,
    entries: [
      { rank: 1, club: "TC Pliening II", isOwnClub: true , points: "6:0", matchPoints: "27:0", sets: "54:2", crossResults: ["***", "0:0", "9:0", "0:0", "9:0", "0:0", "9:0", "0:0"] },
      { rank: 2, club: "TeG Mühldorf", isOwnClub: false, points: "6:0", matchPoints: "21:6", sets: "42:18", crossResults: ["0:0", "***", "0:0", "0:0", "7:2", "7:2", "7:2", "0:0"] },
      { rank: 3, club: "TSV Altfraunhofen", isOwnClub: false, points: "6:2", matchPoints: "19:17", sets: "40:39", crossResults: ["0:9", "0:0", "***", "6:3", "0:0", "6:3", "0:0", "7:2"] },
      { rank: 4, club: "VfL Waldkraiburg", isOwnClub: false, points: "4:2", matchPoints: "17:10", sets: "34:22", crossResults: ["0:0", "0:0", "3:6", "***", "0:0", "8:1", "6:3", "0:0"] },
      { rank: 5, club: "TC Taufkirchen", isOwnClub: false, points: "2:4", matchPoints: "8:19", sets: "19:39", crossResults: ["0:9", "2:7", "0:0", "0:0", "***", "0:0", "0:0", "6:3"] },
      { rank: 6, club: "TC Rot-Weiß Freising", isOwnClub: false, points: "2:6", matchPoints: "14:22", sets: "35:47", crossResults: ["0:0", "2:7", "3:6", "1:8", "0:0", "***", "0:0", "8:1"] },
      { rank: 7, club: "TC Au", isOwnClub: false, points: "2:6", matchPoints: "13:23", sets: "31:49", crossResults: ["0:9", "2:7", "0:0", "3:6", "0:0", "0:0", "***", "8:1"] },
      { rank: 8, club: "TC Weiss-Blau Landshut", isOwnClub: false, points: "0:8", matchPoints: "7:29", sets: "22:61", crossResults: ["0:0", "0:0", "2:7", "0:0", "3:6", "1:8", "1:8", "***"] },
    ],
  },
  // ── Herren 50 III Südliga 3  Gr. 379 ──
  {
    teamLabel: "Herren 50 III",
    teamColor: "#bae6fd",
    leagueName: "Südliga 3 · Gr. 379",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TC Finsing", isOwnClub: false, points: "4:0", matchPoints: "12:6", sets: "26:19", crossResults: ["***", "6:3", "6:3", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 2, club: "TC Pliening III", isOwnClub: true , points: "6:2", matchPoints: "20:16", sets: "47:34", crossResults: ["3:6", "***", "0:0", "0:0", "5:4", "6:3", "6:3"] },
      { rank: 3, club: "TF Markt Schwaben", isOwnClub: false, points: "2:2", matchPoints: "11:7", sets: "25:17", crossResults: ["3:6", "0:0", "***", "4:2", "0:0", "8:1", "0:0"] },
      { rank: 4, club: "TSV Oberpframmern", isOwnClub: false, points: "2:2", matchPoints: "9:9", sets: "19:21", crossResults: ["0:0", "0:0", "2:4", "***", "0:0", "2:7", "7:2"] },
      { rank: 5, club: "VfB Forstinning", isOwnClub: false, points: "0:2", matchPoints: "4:5", sets: "9:11", crossResults: ["0:0", "4:5", "0:0", "0:0", "***", "0:0", "0:0"] },
      { rank: 6, club: "TC Neuperlach-Kail München II", isOwnClub: false, points: "2:4", matchPoints: "11:16", sets: "25:34", crossResults: ["0:0", "3:6", "1:8", "7:2", "0:0", "***", "0:0"] },
      { rank: 7, club: "TS Jahn München", isOwnClub: false, points: "0:4", matchPoints: "5:13", sets: "12:27", crossResults: ["0:0", "3:6", "0:0", "2:7", "0:0", "0:0", "***"] },
    ],
  },
  // ── Herren 60 Südliga 1  Gr. 404 ──
  {
    teamLabel: "Herren 60",
    teamColor: "#cffafe",
    leagueName: "Südliga 1 · Gr. 404",
    ownRank: 6,
    entries: [
      { rank: 1, club: "TSV Rottenburg", isOwnClub: false, points: "6:2", matchPoints: "24:12", sets: "52:28", crossResults: ["***", "0:0", "2:7", "7:2", "0:0", "6:3", "9:0"] },
      { rank: 2, club: "SV Hörlkofen", isOwnClub: false, points: "4:0", matchPoints: "13:5", sets: "27:13", crossResults: ["0:0", "***", "0:0", "0:0", "7:2", "6:3", "0:0"] },
      { rank: 3, club: "TeG Mühldorf", isOwnClub: false, points: "4:0", matchPoints: "12:6", sets: "30:15", crossResults: ["7:2", "0:0", "***", "0:0", "5:4", "0:0", "0:0"] },
      { rank: 4, club: "TC Marzling", isOwnClub: false, points: "4:2", matchPoints: "15:12", sets: "33:27", crossResults: ["2:7", "0:0", "0:0", "***", "0:0", "7:2", "6:3"] },
      { rank: 5, club: "FC Langengeisling", isOwnClub: false, points: "2:4", matchPoints: "14:13", sets: "31:33", crossResults: ["0:0", "2:7", "4:5", "0:0", "***", "0:0", "8:1"] },
      { rank: 6, club: "TC Pliening", isOwnClub: true , points: "0:6", matchPoints: "8:19", sets: "18:40", crossResults: ["3:6", "3:6", "0:0", "2:7", "0:0", "***", "0:0"] },
      { rank: 7, club: "TF Eitting", isOwnClub: false, points: "0:6", matchPoints: "4:23", sets: "13:48", crossResults: ["0:9", "0:0", "0:0", "3:6", "1:8", "0:0", "***"] },
    ],
  },
  // ── Damen Südliga 2  Gr. 160 ──
  {
    teamLabel: "Damen",
    teamColor: "#f59e0b",
    leagueName: "Südliga 2 · Gr. 160",
    ownRank: 3,
    entries: [
      { rank: 1, club: "WB Fideliopark München II", isOwnClub: false, points: "6:0", matchPoints: "20:7", sets: "41:18", crossResults: ["***", "0:0", "7:2", "0:0", "5:4", "0:0", "8:1", "0:0"] },
      { rank: 2, club: "TC Neukeferloh", isOwnClub: false, points: "6:0", matchPoints: "17:10", sets: "37:23", crossResults: ["0:0", "***", "0:0", "5:4", "0:0", "6:3", "0:0", "6:3"] },
      { rank: 3, club: "TC Pliening", isOwnClub: true , points: "4:2", matchPoints: "14:13", sets: "31:30", crossResults: ["2:7", "0:0", "***", "0:0", "0:0", "6:3", "0:0", "6:3"] },
      { rank: 4, club: "TC Steinhöring", isOwnClub: false, points: "2:4", matchPoints: "13:14", sets: "29:29", crossResults: ["0:0", "4:5", "0:0", "***", "3:6", "0:0", "0:0", "6:3"] },
      { rank: 5, club: "TC Unterföhring", isOwnClub: false, points: "2:4", matchPoints: "12:15", sets: "29:34", crossResults: ["4:5", "0:0", "0:0", "6:3", "***", "0:0", "2:7", "0:0"] },
      { rank: 6, club: "TS Jahn München", isOwnClub: false, points: "2:4", matchPoints: "12:15", sets: "28:33", crossResults: ["0:0", "3:6", "3:6", "0:0", "0:0", "***", "6:3", "0:0"] },
      { rank: 7, club: "TC Topspin", isOwnClub: false, points: "2:4", matchPoints: "11:16", sets: "25:36", crossResults: ["1:8", "0:0", "0:0", "0:0", "7:2", "3:6", "***", "0:0"] },
      { rank: 8, club: "TC Grün-Gold München", isOwnClub: false, points: "0:6", matchPoints: "9:18", sets: "21:38", crossResults: ["0:0", "3:6", "3:6", "3:6", "0:0", "0:0", "0:0", "***"] },
    ],
  },
  // ── Damen 40 Südliga 1  Gr. 441 ──
  {
    teamLabel: "Damen 40",
    teamColor: "#fbbf24",
    leagueName: "Südliga 1 · Gr. 441",
    ownRank: 4,
    entries: [
      { rank: 1, club: "VfB Hallbergmoos", isOwnClub: false, points: "8:0", matchPoints: "24:12", sets: "52:31", crossResults: ["***", "6:3", "5:4", "0:0", "5:4", "0:0", "8:1", "0:0"] },
      { rank: 2, club: "Weißblau Allianz München", isOwnClub: false, points: "6:2", matchPoints: "20:16", sets: "45:33", crossResults: ["3:6", "***", "0:0", "6:3", "0:0", "5:4", "0:0", "6:3"] },
      { rank: 3, club: "SC Baldham-Vaterstetten", isOwnClub: false, points: "4:2", matchPoints: "16:11", sets: "36:26", crossResults: ["4:5", "0:0", "***", "0:0", "0:0", "0:0", "7:2", "5:4"] },
      { rank: 4, club: "TC Pliening", isOwnClub: true , points: "2:2", matchPoints: "11:7", sets: "24:18", crossResults: ["0:0", "3:6", "0:0", "***", "0:0", "0:0", "0:0", "8:1"] },
      { rank: 5, club: "ESV München Sportpark", isOwnClub: false, points: "2:2", matchPoints: "10:8", sets: "22:18", crossResults: ["4:5", "0:0", "0:0", "0:0", "***", "6:3", "0:0", "0:0"] },
      { rank: 6, club: "TC Pfaffenhofen/Ilm II", isOwnClub: false, points: "0:4", matchPoints: "7:11", sets: "14:24", crossResults: ["0:0", "4:5", "0:0", "0:0", "3:6", "***", "0:0", "0:0"] },
      { rank: 7, club: "TSV Rudelzhausen", isOwnClub: false, points: "0:4", matchPoints: "3:15", sets: "10:32", crossResults: ["1:8", "0:0", "2:7", "0:0", "0:0", "0:0", "***", "0:0"] },
      { rank: 8, club: "WB Fideliopark München", isOwnClub: false, points: "0:6", matchPoints: "8:19", sets: "20:41", crossResults: ["0:0", "3:6", "4:5", "1:8", "0:0", "0:0", "0:0", "***"] },
    ],
  },
  // ── Damen 50 Landesliga 1 (4er)  Gr. 103 SU ──
  {
    teamLabel: "Damen 50",
    teamColor: "#fcd34d",
    leagueName: "Landesliga 1 (4er) · Gr. 103 SU",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TC Steinhöring", isOwnClub: false, points: "5:1", matchPoints: "12:6", sets: "27:15", crossResults: ["***", "0:0", "5:1", "0:0", "4:2", "3:3", "0:0", "0:0"] },
      { rank: 2, club: "TC Pliening", isOwnClub: true , points: "4:2", matchPoints: "13:5", sets: "27:12", crossResults: ["0:0", "***", "0:0", "0:0", "0:0", "2:4", "5:1", "6:0"] },
      { rank: 3, club: "TC Hofkirchen", isOwnClub: false, points: "4:2", matchPoints: "10:8", sets: "23:17", crossResults: ["1:5", "0:0", "***", "4:2", "0:0", "0:0", "5:1", "0:0"] },
      { rank: 4, club: "TSV Eintracht Karlsfeld", isOwnClub: false, points: "4:2", matchPoints: "10:8", sets: "22:16", crossResults: ["0:0", "0:0", "2:4", "***", "0:0", "4:2", "0:0", "4:2"] },
      { rank: 5, club: "TSV Moosach München", isOwnClub: false, points: "3:3", matchPoints: "9:9", sets: "19:19", crossResults: ["2:4", "0:0", "0:0", "0:0", "***", "0:0", "3:3", "4:2"] },
      { rank: 6, club: "TSV Unterhaching II", isOwnClub: false, points: "3:3", matchPoints: "9:9", sets: "19:22", crossResults: ["3:3", "4:2", "0:0", "2:4", "0:0", "***", "0:0", "0:0"] },
      { rank: 7, club: "TC Karlsfeld am See", isOwnClub: false, points: "1:5", matchPoints: "5:13", sets: "11:27", crossResults: ["0:0", "1:5", "1:5", "0:0", "3:3", "0:0", "***", "0:0"] },
      { rank: 8, club: "TC Gernlinden II", isOwnClub: false, points: "0:6", matchPoints: "4:14", sets: "10:30", crossResults: ["0:0", "0:6", "0:0", "2:4", "2:4", "0:0", "0:0", "***"] },
    ],
  },
  // ── Damen 50 II Südliga 2 (4er)  Gr. 488 ──
  {
    teamLabel: "Damen 50 II",
    teamColor: "#fde68a",
    leagueName: "Südliga 2 (4er) · Gr. 488",
    ownRank: 1,
    entries: [
      { rank: 1, club: "TC Pliening II", isOwnClub: true , points: "5:1", matchPoints: "13:5", sets: "28:16", crossResults: ["***", "0:0", "5:1", "0:0", "0:0", "0:0", "3:3", "5:1"] },
      { rank: 2, club: "TC Steinhöring II", isOwnClub: false, points: "4:2", matchPoints: "14:4", sets: "32:10", crossResults: ["0:0", "***", "0:0", "0:0", "2:4", "6:0", "0:0", "6:0"] },
      { rank: 3, club: "TC Rot-Weiß Poing", isOwnClub: false, points: "4:2", matchPoints: "10:8", sets: "26:19", crossResults: ["1:5", "0:0", "***", "4:2", "5:1", "0:0", "0:0", "0:0"] },
      { rank: 4, club: "TeG Kirchheim", isOwnClub: false, points: "3:3", matchPoints: "10:8", sets: "21:20", crossResults: ["0:0", "0:0", "2:4", "***", "3:3", "0:0", "5:1", "0:0"] },
      { rank: 5, club: "FC Forstern", isOwnClub: false, points: "3:3", matchPoints: "8:10", sets: "22:25", crossResults: ["0:0", "4:2", "1:5", "3:3", "***", "0:0", "0:0", "0:0"] },
      { rank: 6, club: "TC Anzing", isOwnClub: false, points: "3:3", matchPoints: "7:11", sets: "16:24", crossResults: ["0:0", "0:6", "0:0", "0:0", "0:0", "***", "3:3", "4:2"] },
      { rank: 7, club: "SV Walpertskirchen", isOwnClub: false, points: "2:4", matchPoints: "7:11", sets: "17:24", crossResults: ["3:3", "0:0", "0:0", "1:5", "0:0", "3:3", "***", "0:0"] },
      { rank: 8, club: "SpVgg Altenerding", isOwnClub: false, points: "0:6", matchPoints: "3:15", sets: "7:31", crossResults: ["1:5", "0:6", "0:0", "0:0", "0:0", "2:4", "0:0", "***"] },
    ],
  },
];
