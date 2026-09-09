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

export const WINTER_2627_STANDINGS_STAND = "09.09.2026";

export const WINTER_2627_STANDINGS: LeagueStandings[] = [
  // ── Herren 40 Bayernliga · Gr. 022 SU ──
  {
    teamLabel: "Herren 40",
    teamColor: "#38bdf8",
    leagueName: "Bayernliga · Gr. 022 SU",
    ownRank: 1,
    entries: [
      { rank: 1, club: "TC Pliening",                   isOwnClub: true,   points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["***", "0:0", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 2, club: "TC Gauting",                    isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "***", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 3, club: "MTTC Iphitos München",          isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "***", "0:0", "0:0", "0:0"] },
      { rank: 4, club: "HC Wacker München",             isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "***", "0:0", "0:0"] },
      { rank: 5, club: "TC Grün-Weiß Gräfelfing",       isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "***", "0:0"] },
      { rank: 6, club: "TSV Haunstetten",               isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },

  // ── Herren 50 Bayernliga · Gr. 029 SU ──
  {
    teamLabel: "Herren 50",
    teamColor: "#06b6d4",
    leagueName: "Bayernliga · Gr. 029 SU",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TC Blutenburg München",         isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["***", "0:0", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 2, club: "TC Pliening",                   isOwnClub: true,   points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "***", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 3, club: "TC Grün-Weiß Gräfelfing",       isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "***", "0:0", "0:0", "0:0"] },
      { rank: 4, club: "TC Ottobrunn",                  isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "***", "0:0", "0:0"] },
      { rank: 5, club: "TC Puchheim",                   isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "***", "0:0"] },
      { rank: 6, club: "GW Luitpoldpark München",       isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },

  // ── Herren 30 Südliga 1 · Gr. 119 ──
  {
    teamLabel: "Herren 30",
    teamColor: "#22d3ee",
    leagueName: "Südliga 1 · Gr. 119",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TC Ramersdorf",                 isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["***", "0:0", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 2, club: "TC Pliening",                   isOwnClub: true,   points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "***", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 3, club: "TS Jahn München II",            isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "***", "0:0", "0:0", "0:0"] },
      { rank: 4, club: "SV Heimstetten",                isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "***", "0:0", "0:0"] },
      { rank: 5, club: "TC Thalkirchen München",        isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "***", "0:0"] },
      { rank: 6, club: "Ausstellungspark München",      isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },

  // ── Herren 30 II Südliga 2 · Gr. 129 ──
  {
    teamLabel: "Herren 30 II",
    teamColor: "#67e8f9",
    leagueName: "Südliga 2 · Gr. 129",
    ownRank: 3,
    entries: [
      { rank: 1, club: "TC St.Emmeram München",         isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["***", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 2, club: "Polizei SV Haar",               isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "***", "0:0", "0:0", "0:0"] },
      { rank: 3, club: "TC Pliening II",                isOwnClub: true,   points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "***", "0:0", "0:0"] },
      { rank: 4, club: "ATSV Kirchseeon",               isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "***", "0:0"] },
      { rank: 5, club: "TC Riemerling",                 isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },

  // ── Damen Südliga 1 · Gr. 082 ──
  {
    teamLabel: "Damen",
    teamColor: "#f59e0b",
    leagueName: "Südliga 1 · Gr. 082",
    ownRank: 5,
    entries: [
      { rank: 1, club: "TC Rot-Weiß Eschenried III",    isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["***", "0:0", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 2, club: "WB Fideliopark München",        isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "***", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 3, club: "TC Ismaning III",               isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "***", "0:0", "0:0", "0:0"] },
      { rank: 4, club: "SC Freimann II",                isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "***", "0:0", "0:0"] },
      { rank: 5, club: "TC Pliening",                   isOwnClub: true,   points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "***", "0:0"] },
      { rank: 6, club: "STK Garching",                  isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },

  // ── Damen 40 Südliga 2 · Gr. 200 ──
  {
    teamLabel: "Damen 40",
    teamColor: "#fbbf24",
    leagueName: "Südliga 2 · Gr. 200",
    ownRank: 4,
    entries: [
      { rank: 1, club: "TeG Kirchheim",                 isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["***", "0:0", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 2, club: "TF Markt Schwaben",             isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "***", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 3, club: "STC München Süd",               isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "***", "0:0", "0:0", "0:0"] },
      { rank: 4, club: "TC Pliening",                   isOwnClub: true,   points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "***", "0:0", "0:0"] },
      { rank: 5, club: "TC Aschheim",                   isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "***", "0:0"] },
      { rank: 6, club: "TC Unterföhring II",            isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },

  // ── Damen 50 Landesliga 1 · Gr. 054 SU ──
  {
    teamLabel: "Damen 50",
    teamColor: "#fcd34d",
    leagueName: "Landesliga 1 · Gr. 054 SU",
    ownRank: 5,
    entries: [
      { rank: 1, club: "ASV Glonn",                     isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["***", "0:0", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 2, club: "SV Helfendorf",                 isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "***", "0:0", "0:0", "0:0", "0:0"] },
      { rank: 3, club: "MTV 1879 München",              isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "***", "0:0", "0:0", "0:0"] },
      { rank: 4, club: "SV Lohhof",                     isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "***", "0:0", "0:0"] },
      { rank: 5, club: "TC Pliening",                   isOwnClub: true,   points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "***", "0:0"] },
      { rank: 6, club: "TC Raschke Taufkirchen",        isOwnClub: false,  points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: ["0:0", "0:0", "0:0", "0:0", "0:0", "***"] },
    ],
  },
];

// ── Winter Matches (nur TC Pliening Spiele) ──
export const WINTER_2627_MATCHES: WinterMatch[] = [
  // ── Herren 40 Bayernliga · Gr. 022 SU ──
  { teamId: "w27-herren40", date: "2026-10-17", time: "16:00", day: "Sa", home: "TC Pliening",                 away: "TSV Haunstetten",             isHome: true,   mp: "", sets: "", games: "", venue: "Sporttraum Kirchheim", status: "open" },
  { teamId: "w27-herren40", date: "2026-11-28", time: "16:00", day: "Sa", home: "TC Grün-Weiß Gräfelfing",     away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "TC Grün-Weiß Gräfelfing", status: "open" },
  { teamId: "w27-herren40", date: "2026-12-19", time: "16:00", day: "Sa", home: "TC Pliening",                 away: "MTTC Iphitos München",        isHome: true,   mp: "", sets: "", games: "", venue: "Sporttraum Kirchheim", status: "open" },
  { teamId: "w27-herren40", date: "2027-01-30", time: "16:00", day: "Sa", home: "TC Pliening",                 away: "HC Wacker München",           isHome: true,   mp: "", sets: "", games: "", venue: "Sporttraum Kirchheim", status: "open" },
  { teamId: "w27-herren40", date: "2027-02-27", time: "16:00", day: "Sa", home: "TC Gauting",                  away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "TC Gauting", status: "open" },

  // ── Herren 50 Bayernliga · Gr. 029 SU ──
  { teamId: "w27-herren50", date: "2026-11-14", time: "16:00", day: "Sa", home: "TC Grün-Weiß Gräfelfing",     away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "TC Grün-Weiß Gräfelfing", status: "open" },
  { teamId: "w27-herren50", date: "2026-12-12", time: "16:00", day: "Sa", home: "TC Pliening",                 away: "TC Ottobrunn",                isHome: true,   mp: "", sets: "", games: "", venue: "Sporttraum Kirchheim", status: "open" },
  { teamId: "w27-herren50", date: "2027-01-23", time: "16:00", day: "Sa", home: "TC Pliening",                 away: "TC Puchheim",                 isHome: true,   mp: "", sets: "", games: "", venue: "Sporttraum Kirchheim", status: "open" },
  { teamId: "w27-herren50", date: "2027-02-20", time: "16:00", day: "Sa", home: "TC Pliening",                 away: "GW Luitpoldpark München",     isHome: true,   mp: "", sets: "", games: "", venue: "Sporttraum Kirchheim", status: "open" },
  { teamId: "w27-herren50", date: "2027-03-13", time: "16:00", day: "Sa", home: "TC Blutenburg München",       away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "Tennis am See Karlsfeld", status: "open" },

  // ── Herren 30 Südliga 1 · Gr. 119 ──
  { teamId: "w27-herren30", date: "2026-10-10", time: "17:00", day: "Sa", home: "TC Pliening",                 away: "TS Jahn München II",          isHome: true,   mp: "", sets: "", games: "", venue: "TSV Haar", status: "open" },
  { teamId: "w27-herren30", date: "2026-11-21", time: "16:00", day: "Sa", home: "SV Heimstetten",              away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "Sporttraum Kirchheim", status: "open" },
  { teamId: "w27-herren30", date: "2026-12-19", time: "17:00", day: "Sa", home: "Ausstellungspark München",    away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "Raschke Taufkirchen", status: "open" },
  { teamId: "w27-herren30", date: "2027-01-23", time: "17:00", day: "Sa", home: "TC Pliening",                 away: "TC Thalkirchen München",      isHome: true,   mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },
  { teamId: "w27-herren30", date: "2027-02-20", time: "17:00", day: "Sa", home: "TC Pliening",                 away: "TC Ramersdorf",               isHome: true,   mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },

  // ── Herren 30 II Südliga 2 · Gr. 129 ──
  { teamId: "w27-herren30ii", date: "2026-10-10", time: "16:00", day: "Sa", home: "TC Riemerling",               away: "TC Pliening II",              isHome: false,  mp: "", sets: "", games: "", venue: "Tennishalle Riemerling", status: "open" },
  { teamId: "w27-herren30ii", date: "2026-11-08", time: "15:00", day: "So", home: "TC Pliening II",              away: "Polizei SV Haar",             isHome: true,   mp: "", sets: "", games: "", venue: "TS Jahn München", status: "open" },
  { teamId: "w27-herren30ii", date: "2027-02-14", time: "16:00", day: "So", home: "TC St.Emmeram München",       away: "TC Pliening II",              isHome: false,  mp: "", sets: "", games: "", venue: "SV Lohhof", status: "open" },
  { teamId: "w27-herren30ii", date: "2027-03-20", time: "17:00", day: "Sa", home: "TC Pliening II",              away: "ATSV Kirchseeon",             isHome: true,   mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },

  // ── Damen Südliga 1 · Gr. 082 ──
  { teamId: "w27-damen", date: "2026-11-28", time: "17:00", day: "Sa", home: "TC Pliening",                 away: "STK Garching",                isHome: true,   mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },
  { teamId: "w27-damen", date: "2026-12-19", time: "17:00", day: "Sa", home: "TC Pliening",                 away: "TC Ismaning III",             isHome: true,   mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },
  { teamId: "w27-damen", date: "2027-01-09", time: "17:00", day: "Sa", home: "SC Freimann II",              away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },
  { teamId: "w27-damen", date: "2027-02-21", time: "16:00", day: "So", home: "TC Pliening",                 away: "TC Rot-Weiß Eschenried III",  isHome: true,   mp: "", sets: "", games: "", venue: "SV Lohhof", status: "open" },
  { teamId: "w27-damen", date: "2027-03-06", time: "17:00", day: "Sa", home: "WB Fideliopark München",      away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "tenniscoMpany Marschand München", status: "open" },

  // ── Damen 40 Südliga 2 · Gr. 200 ──
  { teamId: "w27-damen40", date: "2026-10-18", time: "15:00", day: "So", home: "TC Pliening",                 away: "TC Aschheim",                 isHome: true,   mp: "", sets: "", games: "", venue: "TC Kirchheim bei Mü.", status: "open" },
  { teamId: "w27-damen40", date: "2026-11-15", time: "15:00", day: "So", home: "TC Pliening",                 away: "TC Unterföhring II",          isHome: true,   mp: "", sets: "", games: "", venue: "VfB Hallbergmoos", status: "open" },
  { teamId: "w27-damen40", date: "2027-01-17", time: "12:00", day: "So", home: "TF Markt Schwaben",           away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "SP Schollbach Erding", status: "open" },
  { teamId: "w27-damen40", date: "2027-02-07", time: "10:00", day: "So", home: "TC Pliening",                 away: "TeG Kirchheim",               isHome: true,   mp: "", sets: "", games: "", venue: "VfB Hallbergmoos", status: "open" },
  { teamId: "w27-damen40", date: "2027-03-14", time: "15:00", day: "So", home: "STC München Süd",             away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "TennisBase Oberhaching", status: "open" },

  // ── Damen 50 Landesliga 1 · Gr. 054 SU ──
  { teamId: "w27-damen50", date: "2026-10-18", time: "16:00", day: "So", home: "SV Lohhof",                   away: "TC Pliening",                 isHome: false,  mp: "", sets: "", games: "", venue: "SV Lohhof", status: "open" },
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
