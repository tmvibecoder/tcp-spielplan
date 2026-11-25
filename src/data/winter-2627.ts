import type { LeagueStandings, MonthColor, WinterMatch } from "../types";

// ── Winterrunde 2026/27 ──────────────────────────────────────────────────────
//
// Quelle: die sieben Gruppen-Reports „Tabelle und Spielplan" (nu.Dokument 013)
//   https://btv.liga.nu/.../nuDokument?dokument=ScheduleReportFOP&group=<groupid>
// Spielorte aus dem btv.de-Widget (im PDF sind die Hallennamen abgeschnitten).
//
//   Herren 40      Bayernliga · Gr. 022 SU      groupid 2253303
//   Herren 50      Bayernliga · Gr. 029 SU      groupid 2253304
//   Herren 30      Südliga 1 · Gr. 119          groupid 2257785
//   Herren 30 II   Südliga 2 · Gr. 129          groupid 2257803
//   Damen          Südliga 1 · Gr. 082          groupid 2257743
//   Damen 40       Südliga 2 · Gr. 200          groupid 2257871
//   Damen 50       Landesliga 1 · Gr. 054 SU    groupid 2253322
//
// Spieltage 10.10.2026 – 20.03.2027; vor dem ersten Spieltag stehen alle
// Tabellen auf 0:0 und alle Begegnungen auf status "open".

// ── Winter Teams (für TeamFilter) ──
export const WINTER_2627_TEAMS = [
  { id: "w27-herren40",    label: "Herren 40",      shortLabel: "H40",    league: "Bayernliga · Gr. 022 SU",     color: "#38bdf8", emoji: "🔵" },
  { id: "w27-herren50",    label: "Herren 50",      shortLabel: "H50",    league: "Bayernliga · Gr. 029 SU",     color: "#06b6d4", emoji: "🔵" },
  { id: "w27-herren30",    label: "Herren 30",      shortLabel: "H30",    league: "Südliga 1 · Gr. 119",         color: "#22d3ee", emoji: "🔵" },
  { id: "w27-herren30ii",  label: "Herren 30 II",   shortLabel: "H30-2",  league: "Südliga 2 · Gr. 129",         color: "#67e8f9", emoji: "🔵" },
  { id: "w27-damen",       label: "Damen",          shortLabel: "D",      league: "Südliga 1 · Gr. 082",         color: "#f59e0b", emoji: "🟠" },
  { id: "w27-damen40",     label: "Damen 40",       shortLabel: "D40",    league: "Südliga 2 · Gr. 200",         color: "#fbbf24", emoji: "🟠" },
  { id: "w27-damen50",     label: "Damen 50",       shortLabel: "D50",    league: "Landesliga 1 · Gr. 054 SU",   color: "#fcd34d", emoji: "🟠" },
];

export const WINTER_2627_CATEGORIES = [
  { label: "Herren", ids: ["w27-herren40", "w27-herren50", "w27-herren30", "w27-herren30ii"] },
  { label: "Damen", ids: ["w27-damen", "w27-damen40", "w27-damen50"] },
];

// ── Tabellen / Standings ──

export const WINTER_2627_STANDINGS_STAND = "25.11.2026";

export const WINTER_2627_STANDINGS: LeagueStandings[] = [
  // ── Herren 40 Bayernliga · Gr. 022 SU ──
  {
    teamLabel: "Herren 40",
    teamColor: "#38bdf8",
    leagueName: "Bayernliga · Gr. 022 SU",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TC Grün-Weiß Gräfelfing", isOwnClub: false, points: "2:0", matchPoints: "6:0", sets: "12:0", crossResults: ["***", "0:0", "0:0", "0:0", "0:0", "6:0"] },
      { rank: 2, club: "TC Pliening", isOwnClub: true , points: "2:0", matchPoints: "6:0", sets: "12:1", crossResults: ["0:0", "***", "0:0", "0:0", "6:0", "0:0"] },
      { rank: 3, club: "MTTC Iphitos München", isOwnClub: false, points: "2:0", matchPoints: "5:1", sets: "10:2", crossResults: ["0:0", "0:0", "***", "5:1", "0:0", "0:0"] },
      { rank: 4, club: "TC Gauting", isOwnClub: false, points: "0:2", matchPoints: "1:5", sets: "2:10", crossResults: ["0:0", "0:0", "1:5", "***", "0:0", "0:0"] },
      { rank: 5, club: "TSV Haunstetten", isOwnClub: false, points: "0:2", matchPoints: "0:6", sets: "1:12", crossResults: ["0:0", "0:6", "0:0", "0:0", "***", "0:0"] },
      { rank: 6, club: "HC Wacker München", isOwnClub: false, points: "0:2", matchPoints: "0:6", sets: "0:12", crossResults: ["0:6", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },

  // ── Herren 50 Bayernliga · Gr. 029 SU ──
  {
    teamLabel: "Herren 50",
    teamColor: "#06b6d4",
    leagueName: "Bayernliga · Gr. 029 SU",
    ownRank: 1,
    entries: [
      { rank: 1, club: "TC Pliening", isOwnClub: true , points: "2:0", matchPoints: "4:2", sets: "10:4", crossResults: ["***", "0:0", "0:0", "0:0", "0:0", "4:2"] },
      { rank: 2, club: "GW Luitpoldpark München", isOwnClub: false, points: "1:1", matchPoints: "3:3", sets: "6:6", crossResults: ["0:0", "***", "3:3", "0:0", "0:0", "0:0"] },
      { rank: 3, club: "TC Blutenburg München", isOwnClub: false, points: "1:1", matchPoints: "3:3", sets: "6:6", crossResults: ["0:0", "3:3", "***", "0:0", "0:0", "0:0"] },
      { rank: 4, club: "TC Puchheim", isOwnClub: false, points: "1:1", matchPoints: "2:2", sets: "5:4", crossResults: ["0:0", "0:0", "0:0", "***", "2:2", "0:0"] },
      { rank: 5, club: "TC Ottobrunn", isOwnClub: false, points: "1:1", matchPoints: "2:2", sets: "4:5", crossResults: ["0:0", "0:0", "0:0", "2:2", "***", "0:0"] },
      { rank: 6, club: "TC Grün-Weiß Gräfelfing", isOwnClub: false, points: "0:2", matchPoints: "2:4", sets: "4:10", crossResults: ["2:4", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },

  // ── Herren 30 Südliga 1 · Gr. 119 ──
  {
    teamLabel: "Herren 30",
    teamColor: "#22d3ee",
    leagueName: "Südliga 1 · Gr. 119",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TC Ramersdorf", isOwnClub: false, points: "3:1", matchPoints: "9:3", sets: "19:7", crossResults: ["***", "0:0", "3:3", "0:0", "0:0", "6:0"] },
      { rank: 2, club: "TC Pliening", isOwnClub: true , points: "3:1", matchPoints: "8:4", sets: "18:10", crossResults: ["0:0", "***", "0:0", "5:1", "3:3", "0:0"] },
      { rank: 3, club: "TC Thalkirchen München", isOwnClub: false, points: "3:1", matchPoints: "7:5", sets: "17:11", crossResults: ["3:3", "0:0", "***", "0:0", "4:2", "0:0"] },
      { rank: 4, club: "TS Jahn München II", isOwnClub: false, points: "2:2", matchPoints: "6:6", sets: "14:14", crossResults: ["0:0", "1:5", "0:0", "***", "0:0", "5:1"] },
      { rank: 5, club: "SV Heimstetten", isOwnClub: false, points: "1:3", matchPoints: "5:7", sets: "10:17", crossResults: ["0:0", "3:3", "2:4", "0:0", "***", "0:0"] },
      { rank: 6, club: "Ausstellungspark München", isOwnClub: false, points: "0:4", matchPoints: "1:11", sets: "3:22", crossResults: ["0:6", "0:0", "0:0", "1:5", "0:0", "***"] },
    ],
  },

  // ── Herren 30 II Südliga 2 · Gr. 129 ──
  {
    teamLabel: "Herren 30 II",
    teamColor: "#67e8f9",
    leagueName: "Südliga 2 · Gr. 129",
    ownRank: 4,
    entries: [
      { rank: 1, club: "Polizei SV Haar", isOwnClub: false, points: "4:0", matchPoints: "9:3", sets: "19:9", crossResults: ["***", "0:0", "0:0", "4:2", "5:1"] },
      { rank: 2, club: "TC Riemerling", isOwnClub: false, points: "2:0", matchPoints: "5:1", sets: "11:2", crossResults: ["0:0", "***", "0:0", "5:1", "0:0"] },
      { rank: 3, club: "TC St.Emmeram München", isOwnClub: false, points: "2:0", matchPoints: "5:1", sets: "10:3", crossResults: ["0:0", "0:0", "***", "0:0", "5:1"] },
      { rank: 4, club: "TC Pliening II", isOwnClub: true , points: "0:4", matchPoints: "3:9", sets: "6:20", crossResults: ["2:4", "1:5", "0:0", "***", "0:0"] },
      { rank: 5, club: "ATSV Kirchseeon", isOwnClub: false, points: "0:4", matchPoints: "2:10", sets: "8:20", crossResults: ["1:5", "0:0", "1:5", "0:0", "***"] },
    ],
  },

  // ── Damen Südliga 1 · Gr. 082 ──
  {
    teamLabel: "Damen",
    teamColor: "#f59e0b",
    leagueName: "Südliga 1 · Gr. 082",
    ownRank: 5,
    entries: [
      { rank: 1, club: "TC Rot-Weiß Eschenried III", isOwnClub: false, points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["***", "0:0", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 2, club: "WB Fideliopark München", isOwnClub: false, points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "***", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 3, club: "TC Ismaning III", isOwnClub: false, points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "***", "0:0", "0:0", "0:0"] },
      { rank: 4, club: "SC Freimann II", isOwnClub: false, points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "***", "0:0", "0:0"] },
      { rank: 5, club: "TC Pliening", isOwnClub: true , points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "***", "0:0"] },
      { rank: 6, club: "STK Garching", isOwnClub: false, points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },

  // ── Damen 40 Südliga 2 · Gr. 200 ──
  {
    teamLabel: "Damen 40",
    teamColor: "#fbbf24",
    leagueName: "Südliga 2 · Gr. 200",
    ownRank: 1,
    entries: [
      { rank: 1, club: "TC Pliening", isOwnClub: true , points: "4:0", matchPoints: "9:3", sets: "20:10", crossResults: ["***", "0:0", "0:0", "0:0", "4:2", "5:1"] },
      { rank: 2, club: "TeG Kirchheim", isOwnClub: false, points: "3:1", matchPoints: "6:4", sets: "13:10", crossResults: ["0:0", "***", "0:0", "4:2", "2:2", "0:0"] },
      { rank: 3, club: "TF Markt Schwaben", isOwnClub: false, points: "2:2", matchPoints: "8:4", sets: "19:10", crossResults: ["0:0", "0:0", "***", "2:4", "0:0", "6:0"] },
      { rank: 4, club: "STC München Süd", isOwnClub: false, points: "2:2", matchPoints: "6:6", sets: "15:16", crossResults: ["0:0", "2:4", "4:2", "***", "0:0", "0:0"] },
      { rank: 5, club: "TC Unterföhring II", isOwnClub: false, points: "1:3", matchPoints: "4:6", sets: "10:13", crossResults: ["2:4", "2:2", "0:0", "0:0", "***", "0:0"] },
      { rank: 6, club: "TC Aschheim", isOwnClub: false, points: "0:4", matchPoints: "1:11", sets: "5:23", crossResults: ["1:5", "0:0", "0:6", "0:0", "0:0", "***"] },
    ],
  },

  // ── Damen 50 Landesliga 1 · Gr. 054 SU ──
  {
    teamLabel: "Damen 50",
    teamColor: "#fcd34d",
    leagueName: "Landesliga 1 · Gr. 054 SU",
    ownRank: 1,
    entries: [
      { rank: 1, club: "TC Pliening", isOwnClub: true , points: "2:0", matchPoints: "5:1", sets: "11:2", crossResults: ["***", "0:0", "0:0", "0:0", "0:0", "5:1"] },
      { rank: 2, club: "SV Helfendorf", isOwnClub: false, points: "2:0", matchPoints: "4:2", sets: "9:4", crossResults: ["0:0", "***", "0:0", "0:0", "4:2", "0:0"] },
      { rank: 3, club: "ASV Glonn", isOwnClub: false, points: "1:1", matchPoints: "3:3", sets: "6:6", crossResults: ["0:0", "0:0", "***", "3:3", "0:0", "0:0"] },
      { rank: 4, club: "TC Raschke Taufkirchen", isOwnClub: false, points: "1:1", matchPoints: "3:3", sets: "6:6", crossResults: ["0:0", "0:0", "3:3", "***", "0:0", "0:0"] },
      { rank: 5, club: "MTV 1879 München", isOwnClub: false, points: "0:2", matchPoints: "2:4", sets: "4:9", crossResults: ["0:0", "2:4", "0:0", "0:0", "***", "0:0"] },
      { rank: 6, club: "SV Lohhof", isOwnClub: false, points: "0:2", matchPoints: "1:5", sets: "2:11", crossResults: ["1:5", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },
];

// ── Winter Matches (nur TC Pliening Spiele) ──
export const WINTER_2627_MATCHES: WinterMatch[] = [
  // ── Herren 40 Bayernliga · Gr. 022 SU ──
  { teamId: "w27-herren40", date: "2026-10-17", time: "16:00", day: "Sa", home: "TC Pliening",                 away: "TSV Haunstetten",             isHome: true,   mp: "6:0", sets: "12:1", games: "69:31", venue: "Sporttraum Kirchheim", status: "played" },
  { teamId: "w27-herren40", date: "2026-11-28", time: "16:00", day: "Sa", home: "TC Grün-Weiß Gräfelfing",     away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "TC Grün-Weiß Gräfelfing", status: "open" },
  { teamId: "w27-herren40", date: "2026-12-19", time: "16:00", day: "Sa", home: "TC Pliening",                 away: "MTTC Iphitos München",        isHome: true,   mp: "", sets: "", games: "", venue: "Sporttraum Kirchheim", status: "open" },
  { teamId: "w27-herren40", date: "2027-01-30", time: "16:00", day: "Sa", home: "TC Pliening",                 away: "HC Wacker München",           isHome: true,   mp: "", sets: "", games: "", venue: "Sporttraum Kirchheim", status: "open" },
  { teamId: "w27-herren40", date: "2027-02-27", time: "16:00", day: "Sa", home: "TC Gauting",                  away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "TC Gauting", status: "open" },

  // ── Herren 50 Bayernliga · Gr. 029 SU ──
  { teamId: "w27-herren50", date: "2026-11-14", time: "16:00", day: "Sa", home: "TC Grün-Weiß Gräfelfing",     away: "TC Pliening",                 isHome: false,  mp: "2:4", sets: "4:10", games: "37:68", venue: "TC Grün-Weiß Gräfelfing", status: "played" },
  { teamId: "w27-herren50", date: "2026-12-12", time: "16:00", day: "Sa", home: "TC Pliening",                 away: "TC Ottobrunn",                isHome: true,   mp: "", sets: "", games: "", venue: "Sporttraum Kirchheim", status: "open" },
  { teamId: "w27-herren50", date: "2027-01-23", time: "16:00", day: "Sa", home: "TC Pliening",                 away: "TC Puchheim",                 isHome: true,   mp: "", sets: "", games: "", venue: "Sporttraum Kirchheim", status: "open" },
  { teamId: "w27-herren50", date: "2027-02-20", time: "16:00", day: "Sa", home: "TC Pliening",                 away: "GW Luitpoldpark München",     isHome: true,   mp: "", sets: "", games: "", venue: "Sporttraum Kirchheim", status: "open" },
  { teamId: "w27-herren50", date: "2027-03-13", time: "16:00", day: "Sa", home: "TC Blutenburg München",       away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "Tennis am See Karlsfeld", status: "open" },

  // ── Herren 30 Südliga 1 · Gr. 119 ──
  { teamId: "w27-herren30", date: "2026-10-10", time: "17:00", day: "Sa", home: "TC Pliening",                 away: "TS Jahn München II",          isHome: true,   mp: "5:1", sets: "11:4", games: "59:28", venue: "TSV Haar", status: "played" },
  { teamId: "w27-herren30", date: "2026-11-21", time: "16:00", day: "Sa", home: "SV Heimstetten",              away: "TC Pliening",                 isHome: false,  mp: "3:3", sets: "6:7", games: "49:55", venue: "Sporttraum Kirchheim", status: "played" },
  { teamId: "w27-herren30", date: "2026-12-19", time: "17:00", day: "Sa", home: "Ausstellungspark München",    away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "Raschke Taufkirchen", status: "open" },
  { teamId: "w27-herren30", date: "2027-01-23", time: "17:00", day: "Sa", home: "TC Pliening",                 away: "TC Thalkirchen München",      isHome: true,   mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },
  { teamId: "w27-herren30", date: "2027-02-20", time: "17:00", day: "Sa", home: "TC Pliening",                 away: "TC Ramersdorf",               isHome: true,   mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },

  // ── Herren 30 II Südliga 2 · Gr. 129 ──
  { teamId: "w27-herren30ii", date: "2026-10-10", time: "16:00", day: "Sa", home: "TC Riemerling",               away: "TC Pliening II",              isHome: false,  mp: "5:1", sets: "11:2", games: "70:32", venue: "Tennishalle Riemerling", status: "played" },
  { teamId: "w27-herren30ii", date: "2026-11-08", time: "15:00", day: "So", home: "TC Pliening II",              away: "Polizei SV Haar",             isHome: true,   mp: "2:4", sets: "4:9", games: "42:64", venue: "TS Jahn München", status: "played" },
  { teamId: "w27-herren30ii", date: "2027-02-14", time: "16:00", day: "So", home: "TC St.Emmeram München",       away: "TC Pliening II",              isHome: false,  mp: "", sets: "", games: "", venue: "SV Lohhof", status: "open" },
  { teamId: "w27-herren30ii", date: "2027-03-20", time: "17:00", day: "Sa", home: "TC Pliening II",              away: "ATSV Kirchseeon",             isHome: true,   mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },

  // ── Damen Südliga 1 · Gr. 082 ──
  { teamId: "w27-damen", date: "2026-11-28", time: "17:00", day: "Sa", home: "TC Pliening",                 away: "STK Garching",                isHome: true,   mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },
  { teamId: "w27-damen", date: "2026-12-19", time: "17:00", day: "Sa", home: "TC Pliening",                 away: "TC Ismaning III",             isHome: true,   mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },
  { teamId: "w27-damen", date: "2027-01-09", time: "17:00", day: "Sa", home: "SC Freimann II",              away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },
  { teamId: "w27-damen", date: "2027-02-21", time: "16:00", day: "So", home: "TC Pliening",                 away: "TC Rot-Weiß Eschenried III",  isHome: true,   mp: "", sets: "", games: "", venue: "SV Lohhof", status: "open" },
  { teamId: "w27-damen", date: "2027-03-06", time: "17:00", day: "Sa", home: "WB Fideliopark München",      away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "tenniscoMpany Marschand München", status: "open" },

  // ── Damen 40 Südliga 2 · Gr. 200 ──
  { teamId: "w27-damen40", date: "2026-10-25", time: "15:00", day: "So", home: "TC Pliening",                 away: "TC Aschheim",                 isHome: true,   mp: "5:1", sets: "11:5", games: "64:49", venue: "TC Kirchheim bei Mü.", status: "played" },
  { teamId: "w27-damen40", date: "2026-11-15", time: "15:00", day: "So", home: "TC Pliening",                 away: "TC Unterföhring II",          isHome: true,   mp: "4:2", sets: "9:5", games: "49:35", venue: "VfB Hallbergmoos", status: "played" },
  { teamId: "w27-damen40", date: "2027-01-17", time: "12:00", day: "So", home: "TF Markt Schwaben",           away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "SP Schollbach Erding", status: "open" },
  { teamId: "w27-damen40", date: "2027-02-07", time: "10:00", day: "So", home: "TC Pliening",                 away: "TeG Kirchheim",               isHome: true,   mp: "", sets: "", games: "", venue: "VfB Hallbergmoos", status: "open" },
  { teamId: "w27-damen40", date: "2027-03-14", time: "15:00", day: "So", home: "STC München Süd",             away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "TennisBase Oberhaching", status: "open" },

  // ── Damen 50 Landesliga 1 · Gr. 054 SU ──
  { teamId: "w27-damen50", date: "2026-10-18", time: "16:00", day: "So", home: "SV Lohhof",                   away: "TC Pliening",                 isHome: false,  mp: "1:5", sets: "2:11", games: "31:62", venue: "SV Lohhof", status: "played" },
  { teamId: "w27-damen50", date: "2026-11-29", time: "15:00", day: "So", home: "MTV 1879 München",            away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "TennisBase Oberhaching", status: "open" },
  { teamId: "w27-damen50", date: "2027-01-17", time: "15:00", day: "So", home: "ASV Glonn",                   away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "Tennishalle Riemerling", status: "open" },
  { teamId: "w27-damen50", date: "2027-02-06", time: "17:00", day: "Sa", home: "TC Pliening",                 away: "TC Raschke Taufkirchen",      isHome: true,   mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },
  { teamId: "w27-damen50", date: "2027-03-06", time: "17:00", day: "Sa", home: "TC Pliening",                 away: "SV Helfendorf",               isHome: true,   mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },
];

// ── Winter Monate & Farben ──
export const WINTER_2627_MONTHS: Record<string, string> = {
  "2026-10": "Oktober",
  "2026-11": "November",
  "2026-12": "Dezember",
  "2027-01": "Januar",
  "2027-02": "Februar",
  "2027-03": "März",
};

export const WINTER_2627_MONTH_COLORS: Record<string, MonthColor> = {
  "2026-10": {
    bg: "#78350f25", border: "#d9770640", accent: "#fbbf24", headerBg: "#78350f50", label: "#fcd34d",
    weekBgs: ["#78350f15", "#78350f30", "#78350f15", "#78350f30", "#78350f15", "#78350f30"],
  },
  "2026-11": {
    bg: "#581c8725", border: "#7c3aed40", accent: "#a78bfa", headerBg: "#581c8750", label: "#c4b5fd",
    weekBgs: ["#581c8715", "#581c8730", "#581c8715", "#581c8730", "#581c8715", "#581c8730"],
  },
  "2026-12": {
    bg: "#1e3a5f25", border: "#3b82f640", accent: "#60a5fa", headerBg: "#1e3a5f50", label: "#93c5fd",
    weekBgs: ["#1e3a5f15", "#1e3a5f30", "#1e3a5f15", "#1e3a5f30", "#1e3a5f15", "#1e3a5f30"],
  },
  "2027-01": {
    bg: "#312e8125", border: "#6366f140", accent: "#818cf8", headerBg: "#312e8150", label: "#a5b4fc",
    weekBgs: ["#312e8115", "#312e8130", "#312e8115", "#312e8130", "#312e8115", "#312e8130"],
  },
  "2027-02": {
    bg: "#4c1d9525", border: "#8b5cf640", accent: "#a78bfa", headerBg: "#4c1d9550", label: "#c4b5fd",
    weekBgs: ["#4c1d9515", "#4c1d9530", "#4c1d9515", "#4c1d9530", "#4c1d9515", "#4c1d9530"],
  },
  "2027-03": {
    bg: "#134e4a25", border: "#14b8a640", accent: "#2dd4bf", headerBg: "#134e4a50", label: "#5eead4",
    weekBgs: ["#134e4a15", "#134e4a30", "#134e4a15", "#134e4a30", "#134e4a15", "#134e4a30"],
  },
};
