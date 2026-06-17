import type { LeagueStandings } from "../types";

// ── Sommer 2026 Tabellen / Standings ──
// Quelle: BTV nuLiga (Südbayern · Sommer 2026)
// Offizielle PDF: btv.liga.nu .../nuDokument?dokument=ScheduleReportFOP&group=<gruppe>
// btv.de Tabelle/Spielplan: ?groupid=<gruppe>

export const SUMMER_STANDINGS: LeagueStandings[] = [
  // ── Herren Südliga 2 Gr. 023 ── (Stand 17.06.2026, 12 von 28 Begegnungen gespielt)
  // Kreuztabelle-Reihenfolge: 1 Feldkirchen II · 2 Aschheim III · 3 Markt Schwaben · 4 Pliening · 5 Finsing · 6 Polizei Haar · 7 Erding II · 8 Unterföhring II
  // "0:0" = Begegnung noch nicht ausgetragen (wird in der Tabelle als "n.a." dargestellt)
  {
    teamLabel: "Herren",
    teamColor: "#0ea5e9",
    leagueName: "Südliga 2 · Gr. 023",
    ownRank: 4,
    entries: [
      { rank: 1, club: "TSV Feldkirchen II",  isOwnClub: false, points: "6:0", matchPoints: "26:1",  sets: "52:6",  crossResults: ["***", "0:0", "0:0", "9:0", "9:0", "0:0", "0:0", "8:1"] },
      { rank: 2, club: "TC Aschheim III",      isOwnClub: false, points: "6:0", matchPoints: "21:6",  sets: "43:15", crossResults: ["0:0", "***", "0:0", "0:0", "5:4", "8:1", "0:0", "8:1"] },
      { rank: 3, club: "TF Markt Schwaben",    isOwnClub: false, points: "6:0", matchPoints: "20:7",  sets: "41:15", crossResults: ["0:0", "0:0", "***", "0:0", "0:0", "6:3", "7:2", "7:2"] },
      { rank: 4, club: "TC Pliening",          isOwnClub: true,  points: "4:2", matchPoints: "17:10", sets: "36:22", crossResults: ["0:9", "0:0", "0:0", "***", "0:0", "8:1", "9:0", "0:0"] },
      { rank: 5, club: "TC Finsing",           isOwnClub: false, points: "2:4", matchPoints: "11:16", sets: "28:32", crossResults: ["0:9", "4:5", "0:0", "0:0", "***", "0:0", "7:2", "0:0"] },
      { rank: 6, club: "Polizei SV Haar",      isOwnClub: false, points: "0:6", matchPoints: "5:22",  sets: "12:46", crossResults: ["0:0", "1:8", "3:6", "1:8", "0:0", "***", "0:0", "0:0"] },
      { rank: 7, club: "TC Erding II",         isOwnClub: false, points: "0:6", matchPoints: "4:23",  sets: "11:49", crossResults: ["0:0", "0:0", "2:7", "0:9", "2:7", "0:0", "***", "0:0"] },
      { rank: 8, club: "TC Unterföhring II",   isOwnClub: false, points: "0:6", matchPoints: "4:23",  sets: "8:46",  crossResults: ["1:8", "1:8", "2:7", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },

  // ── Herren 30 Südliga 4 (4er) Gr. 292 ── (Stand 17.06.2026, 4 von 10 Begegnungen gespielt)
  // Kreuztabelle-Reihenfolge: 1 Finsing · 2 Pliening · 3 Philathlos · 4 Oberpframmern · 5 Putzbrunn
  // "0:0" = Begegnung noch nicht ausgetragen (wird in der Tabelle als "n.a." dargestellt)
  {
    teamLabel: "Herren 30",
    teamColor: "#22d3ee",
    leagueName: "Südliga 4 (4er) · Gr. 292",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TC Finsing",            isOwnClub: false, points: "4:0",  matchPoints: "8:4",   sets: "18:11", crossResults: ["***", "0:0", "0:0", "4:2", "4:2"] },
      { rank: 2, club: "TC Pliening",           isOwnClub: true,  points: "3:1",  matchPoints: "9:3",   sets: "18:8",  crossResults: ["0:0", "***", "3:3", "0:0", "6:0"] },
      { rank: 3, club: "TC Philathlos München", isOwnClub: false, points: "1:1",  matchPoints: "3:3",   sets: "6:6",   crossResults: ["0:0", "3:3", "***", "0:0", "0:0"] },
      { rank: 4, club: "TSV Oberpframmern",     isOwnClub: false, points: "0:2",  matchPoints: "2:4",   sets: "5:8",   crossResults: ["2:4", "0:0", "0:0", "***", "0:0"] },
      { rank: 5, club: "TC Putzbrunn",          isOwnClub: false, points: "0:4",  matchPoints: "2:10",  sets: "8:22",  crossResults: ["2:4", "0:6", "0:0", "0:0", "***"] },
    ],
  },
];
