import type { LeagueStandings, MonthColor, WinterMatch } from "../types";

// ── Winter Teams (für TeamFilter) ──
export const WINTER_TEAMS = [
  { id: "w-herren40",   label: "Herren 40",    shortLabel: "H40",   league: "Bayernliga · Gr. 022 SU",    color: "#38bdf8", emoji: "🔵" },
  { id: "w-herren50",   label: "Herren 50",    shortLabel: "H50",   league: "Bayernliga · Gr. 029 SU",    color: "#06b6d4", emoji: "🔵" },
  { id: "w-herren30",   label: "Herren 30",    shortLabel: "H30",   league: "Südliga 1 · Gr. 109",        color: "#22d3ee", emoji: "🔵" },
  { id: "w-herren30ii", label: "Herren 30 II", shortLabel: "H30-2", league: "Südliga 2 · Gr. 117",        color: "#67e8f9", emoji: "🔵" },
  { id: "w-damen",      label: "Damen",        shortLabel: "D",     league: "Südliga 2 · Gr. 100",        color: "#f59e0b", emoji: "🟠" },
  { id: "w-damen40",    label: "Damen 40",     shortLabel: "D40",   league: "Südliga 2 · Gr. 192",        color: "#fbbf24", emoji: "🟠" },
  { id: "w-damen50",    label: "Damen 50",     shortLabel: "D50",   league: "Landesliga 2 · Gr. 056 SU",  color: "#fcd34d", emoji: "🟠" },
];

export const WINTER_CATEGORIES = [
  { label: "Herren", ids: ["w-herren40", "w-herren50", "w-herren30", "w-herren30ii"] },
  { label: "Damen",  ids: ["w-damen", "w-damen40", "w-damen50"] },
];

// ── Tabellen / Standings ──

export const WINTER_STANDINGS: LeagueStandings[] = [
  // ── Herren 40 Bayernliga Gr. 022 SU ──
  {
    teamLabel: "Herren 40",
    teamColor: "#38bdf8",
    leagueName: "Bayernliga · Gr. 022 SU",
    ownRank: 1,
    entries: [
      { rank: 1, club: "TC Pliening",            isOwnClub: true,  points: "9:1",  matchPoints: "25:3",  sets: "53:8",   crossResults: ["***", "6:0", "2:2", "6:0", "5:1", "6:0"] },
      { rank: 2, club: "TC Gauting",             isOwnClub: false, points: "6:4",  matchPoints: "16:14", sets: "36:30",  crossResults: ["0:6", "***", "3:3", "3:3", "5:1", "5:1"] },
      { rank: 3, club: "MTTC Iphitos München",   isOwnClub: false, points: "6:4",  matchPoints: "14:14", sets: "32:32",  crossResults: ["2:2", "3:3", "***", "0:6", "4:2", "5:1"] },
      { rank: 4, club: "HC Wacker München",       isOwnClub: false, points: "5:5",  matchPoints: "15:15", sets: "34:35",  crossResults: ["0:6", "3:3", "6:0", "***", "4:2", "2:4"] },
      { rank: 5, club: "TV Altötting",            isOwnClub: false, points: "2:8",  matchPoints: "10:20", sets: "23:44",  crossResults: ["1:5", "1:5", "2:4", "2:4", "***", "4:2"] },
      { rank: 6, club: "TV Hörzhausen",           isOwnClub: false, points: "2:8",  matchPoints: "8:22",  sets: "20:49",  crossResults: ["0:6", "1:5", "1:5", "4:2", "2:4", "***"] },
    ],
  },

  // ── Herren 50 Bayernliga Gr. 029 SU ──
  {
    teamLabel: "Herren 50",
    teamColor: "#06b6d4",
    leagueName: "Bayernliga · Gr. 029 SU",
    ownRank: 2,
    entries: [
      { rank: 1, club: "TC Blutenburg München",    isOwnClub: false, points: "9:1",  matchPoints: "23:7",  sets: "49:18",  crossResults: ["***", "4:2", "3:3", "5:1", "6:0", "5:1"] },
      { rank: 2, club: "TC Pliening",              isOwnClub: true,  points: "7:3",  matchPoints: "21:9",  sets: "46:21",  crossResults: ["2:4", "***", "3:3", "5:1", "6:0", "5:1"] },
      { rank: 3, club: "TC Grün-Weiß Gräfelfing",  isOwnClub: false, points: "7:3",  matchPoints: "20:10", sets: "45:27",  crossResults: ["3:3", "3:3", "***", "5:1", "6:0", "3:3"] },
      { rank: 4, club: "TC Ottobrunn",             isOwnClub: false, points: "4:6",  matchPoints: "12:18", sets: "26:40",  crossResults: ["1:5", "1:5", "1:5", "***", "4:2", "5:1"] },
      { rank: 5, club: "TC Anzing",                isOwnClub: false, points: "2:8",  matchPoints: "8:22",  sets: "22:44",  crossResults: ["0:6", "0:6", "0:6", "2:4", "***", "6:0"] },
      { rank: 6, club: "TC TP Herrsching",          isOwnClub: false, points: "1:9",  matchPoints: "6:24",  sets: "13:51",  crossResults: ["1:5", "1:5", "3:3", "1:5", "0:6", "***"] },
    ],
  },

  // ── Damen Südliga 2 Gr. 100 ──
  {
    teamLabel: "Damen",
    teamColor: "#f59e0b",
    leagueName: "Südliga 2 · Gr. 100",
    ownRank: 1,
    entries: [
      { rank: 1, club: "TC Pliening",              isOwnClub: true,  points: "10:0", matchPoints: "28:2",  sets: "56:4",   crossResults: ["***", "6:0", "5:1", "6:0", "5:1", "6:0"] },
      { rank: 2, club: "TF Markt Schwaben",        isOwnClub: false, points: "8:2",  matchPoints: "21:9",  sets: "44:21",  crossResults: ["0:6", "***", "4:2", "6:0", "5:1", "6:0"] },
      { rank: 3, club: "WB Fideliopark München II", isOwnClub: false, points: "4:4",  matchPoints: "13:11", sets: "29:24",  crossResults: ["1:5", "2:4", "***", "0:0", "5:1", "5:1"] },
      { rank: 4, club: "TeG Kirchheim",            isOwnClub: false, points: "4:4",  matchPoints: "12:12", sets: "24:27",  crossResults: ["0:6", "0:6", "0:0", "***", "6:0", "6:0"] },
      { rank: 5, club: "TC Unterföhring II",       isOwnClub: false, points: "2:8",  matchPoints: "9:21",  sets: "21:46",  crossResults: ["1:5", "1:5", "1:5", "0:6", "***", "6:0"] },
      { rank: 6, club: "TS Jahn München II",        isOwnClub: false, points: "0:10", matchPoints: "1:29",  sets: "6:58",   crossResults: ["0:6", "0:6", "1:5", "0:6", "0:6", "***"] },
    ],
  },

  // ── Damen 50 Landesliga 2 Gr. 056 SU ──
  {
    teamLabel: "Damen 50",
    teamColor: "#fcd34d",
    leagueName: "Landesliga 2 · Gr. 056 SU",
    ownRank: 1,
    entries: [
      { rank: 1, club: "TC Pliening",              isOwnClub: true,  points: "7:1",  matchPoints: "19:5",  sets: "40:13",  crossResults: ["***", "5:1", "3:3", "5:1", "6:0"] },
      { rank: 2, club: "TC Rot-Weiß Freising",    isOwnClub: false, points: "6:2",  matchPoints: "14:10", sets: "31:20",  crossResults: ["1:5", "***", "4:2", "4:2", "5:1"] },
      { rank: 3, club: "MTTC Iphitos München",     isOwnClub: false, points: "5:3",  matchPoints: "15:9",  sets: "32:20",  crossResults: ["3:3", "2:4", "***", "5:1", "5:1"] },
      { rank: 4, club: "WB Fideliopark München",   isOwnClub: false, points: "2:6",  matchPoints: "8:16",  sets: "17:35",  crossResults: ["1:5", "2:4", "1:5", "***", "4:2"] },
      { rank: 5, club: "SV Lohhof II",             isOwnClub: false, points: "0:8",  matchPoints: "4:20",  sets: "10:42",  crossResults: ["0:6", "1:5", "1:5", "2:4", "***"] },
    ],
  },

  // ── Damen 40 Südliga 2 Gr. 192 ──
  {
    teamLabel: "Damen 40",
    teamColor: "#fbbf24",
    leagueName: "Südliga 2 · Gr. 192",
    ownRank: 3,
    entries: [
      { rank: 1, club: "TC Cosima München",       isOwnClub: false, points: "7:3",  matchPoints: "19:11", sets: "40:27",  crossResults: ["***", "2:4", "5:1", "3:3", "5:1", "4:2"] },
      { rank: 2, club: "TeG Kirchheim",           isOwnClub: false, points: "6:2",  matchPoints: "13:9",  sets: "29:22",  crossResults: ["4:2", "***", "3:3", "2:2", "0:0", "4:2"] },
      { rank: 3, club: "TC Pliening",             isOwnClub: true,  points: "6:4",  matchPoints: "19:11", sets: "40:25",  crossResults: ["1:5", "3:3", "***", "3:3", "6:0", "6:0"] },
      { rank: 4, club: "TC Aschheim",             isOwnClub: false, points: "5:3",  matchPoints: "12:10", sets: "32:22",  crossResults: ["3:3", "2:2", "3:3", "***", "4:2", "0:0"] },
      { rank: 5, club: "TC Unterföhring II",      isOwnClub: false, points: "2:6",  matchPoints: "7:17",  sets: "16:37",  crossResults: ["1:5", "0:0", "0:6", "2:4", "***", "4:2"] },
      { rank: 6, club: "TC Schleißheim",          isOwnClub: false, points: "0:8",  matchPoints: "6:18",  sets: "15:39",  crossResults: ["2:4", "2:4", "0:6", "0:0", "2:4", "***"] },
    ],
  },

  // ── Herren 30 Südliga 1 Gr. 109 ──
  {
    teamLabel: "Herren 30",
    teamColor: "#22d3ee",
    leagueName: "Südliga 1 · Gr. 109",
    ownRank: 3,
    entries: [
      { rank: 1, club: "SC Freimann II",           isOwnClub: false, points: "9:1",  matchPoints: "21:9",  sets: "46:22",  crossResults: ["***", "4:2", "5:1", "3:3", "4:2", "5:1"] },
      { rank: 2, club: "TC Unterföhring",          isOwnClub: false, points: "7:3",  matchPoints: "20:10", sets: "42:27",  crossResults: ["2:4", "***", "6:0", "4:2", "3:3", "5:1"] },
      { rank: 3, club: "TC Pliening",              isOwnClub: true,  points: "5:5",  matchPoints: "16:14", sets: "33:31",  crossResults: ["1:5", "0:6", "***", "3:3", "6:0", "6:0"] },
      { rank: 4, club: "WB Fideliopark München",   isOwnClub: false, points: "4:6",  matchPoints: "14:16", sets: "31:33",  crossResults: ["3:3", "2:4", "3:3", "***", "3:3", "3:3"] },
      { rank: 5, club: "TC Thalkirchen München",   isOwnClub: false, points: "3:7",  matchPoints: "11:19", sets: "25:40",  crossResults: ["2:4", "3:3", "0:6", "3:3", "***", "3:3"] },
      { rank: 6, club: "PSV München",              isOwnClub: false, points: "2:8",  matchPoints: "8:22",  sets: "21:45",  crossResults: ["1:5", "1:5", "0:6", "3:3", "3:3", "***"] },
    ],
  },

  // ── Herren 30 II Südliga 2 Gr. 117 ──
  {
    teamLabel: "Herren 30 II",
    teamColor: "#67e8f9",
    leagueName: "Südliga 2 · Gr. 117",
    ownRank: 4,
    entries: [
      { rank: 1, club: "SV Heimstetten",          isOwnClub: false, points: "6:0",  matchPoints: "16:2",  sets: "34:6",   crossResults: ["***", "4:2", "6:0", "0:0", "6:0"] },
      { rank: 2, club: "SV Forsting-Pfaffing",    isOwnClub: false, points: "5:3",  matchPoints: "17:7",  sets: "36:17",  crossResults: ["2:4", "***", "3:3", "6:0", "6:0"] },
      { rank: 3, club: "TeG Kirchheim",           isOwnClub: false, points: "4:4",  matchPoints: "12:12", sets: "25:28",  crossResults: ["0:6", "3:3", "***", "3:3", "6:0"] },
      { rank: 4, club: "TC Pliening II",           isOwnClub: true,  points: "3:3",  matchPoints: "7:11",  sets: "17:24",  crossResults: ["0:0", "0:6", "3:3", "***", "4:2"] },
      { rank: 5, club: "ATSV Kirchseeon",          isOwnClub: false, points: "0:8",  matchPoints: "2:22",  sets: "8:45",   crossResults: ["0:6", "0:6", "0:6", "2:4", "***"] },
    ],
  },
];

// ── Winter Matches (nur TC Pliening Spiele) ──
export const WINTER_MATCHES: WinterMatch[] = [
  // ── Herren 40 Bayernliga Gr. 022 SU ──
  { teamId: "w-herren40", date: "2025-11-01", time: "17:00", day: "Sa", home: "MTTC Iphitos München", away: "TC Pliening", isHome: false, mp: "2:2", sets: "5:6", games: "41:43", venue: "tenniscoMpany Marschand München", status: "played" },
  { teamId: "w-herren40", date: "2025-12-07", time: "12:00", day: "So", home: "TV Hörzhausen", away: "TC Pliening", isHome: false, mp: "0:6", sets: "0:12", games: "26:73", venue: "TC Gauting", status: "played" },
  { teamId: "w-herren40", date: "2026-01-11", time: "15:00", day: "So", home: "HC Wacker München", away: "TC Pliening", isHome: false, mp: "0:6", sets: "1:12", games: "31:69", venue: "TC Gauting", status: "played" },
  { teamId: "w-herren40", date: "2026-02-07", time: "16:00", day: "Sa", home: "TC Pliening", away: "TC Gauting", isHome: true, mp: "6:0", sets: "12:0", games: "74:30", venue: "HC Wacker München", status: "played" },
  { teamId: "w-herren40", date: "2026-03-15", time: "12:00", day: "So", home: "TC Pliening", away: "TV Altötting", isHome: true, mp: "5:1", sets: "11:2", games: "73:32", venue: "tenniscoMpany Marschand München", status: "played" },

  // ── Herren 50 Bayernliga Gr. 029 SU ──
  { teamId: "w-herren50", date: "2026-01-24", time: "16:00", day: "Sa", home: "TC Ottobrunn", away: "TC Pliening", isHome: false, mp: "1:5", sets: "3:11", games: "30:51", venue: "Tennispark Anzing", status: "played" },
  { teamId: "w-herren50", date: "2026-02-15", time: "10:00", day: "So", home: "TC TP Herrsching", away: "TC Pliening", isHome: false, mp: "1:5", sets: "2:10", games: "19:66", venue: "Tennishalle Riemerling", status: "played" },
  { teamId: "w-herren50", date: "2026-03-01", time: "15:00", day: "So", home: "TC Anzing", away: "TC Pliening", isHome: false, mp: "0:6", sets: "1:12", games: "33:69", venue: "Ammersee Tennis Herrsching", status: "played" },
  { teamId: "w-herren50", date: "2026-03-22", time: "10:00", day: "So", home: "TC Pliening", away: "TC Blutenburg München", isHome: true, mp: "2:4", sets: "5:9", games: "36:57", venue: "Tennispark Anzing", status: "played" },

  // ── Damen 50 Landesliga 2 Gr. 056 SU ──
  { teamId: "w-damen50", date: "2025-11-22", time: "16:00", day: "Sa", home: "TC Rot-Weiß Freising", away: "TC Pliening", isHome: false, mp: "1:5", sets: "3:10", games: "35:65", venue: "SV Lohhof", status: "played" },
  { teamId: "w-damen50", date: "2026-01-31", time: "16:00", day: "Sa", home: "TC Pliening", away: "WB Fideliopark München", isHome: true, mp: "5:1", sets: "10:2", games: "67:39", venue: "tenniscoMpany Marschand München", status: "played" },
  { teamId: "w-damen50", date: "2026-03-07", time: "16:00", day: "Sa", home: "TC Pliening", away: "MTTC Iphitos München", isHome: true, mp: "3:3", sets: "8:7", games: "42:36", venue: "SV Lohhof", status: "played" },

  // ── Damen Südliga 2 Gr. 100 ──
  { teamId: "w-damen", date: "2025-10-04", time: "16:00", day: "Sa", home: "TeG Kirchheim", away: "TC Pliening", isHome: false, mp: "0:6", sets: "0:12", games: "14:72", venue: "Sporttraum Kirchheim", status: "played" },
  { teamId: "w-damen", date: "2025-10-25", time: "16:00", day: "Sa", home: "TC Pliening", away: "TC Unterföhring II", isHome: true, mp: "5:1", sets: "10:2", games: "65:28", venue: "Tennispark Anzing", status: "played" },
  { teamId: "w-damen", date: "2025-12-06", time: "16:00", day: "Sa", home: "TC Pliening", away: "TS Jahn München II", isHome: true, mp: "6:0", sets: "12:0", games: "73:22", venue: "Tennispark Anzing", status: "played" },
  { teamId: "w-damen", date: "2026-02-01", time: "15:00", day: "So", home: "TC Pliening", away: "TF Markt Schwaben", isHome: true, mp: "6:0", sets: "12:0", games: "73:17", venue: "Tennispark Anzing", status: "played" },
  { teamId: "w-damen", date: "2026-02-21", time: "17:00", day: "Sa", home: "WB Fideliopark München II", away: "TC Pliening", isHome: false, mp: "1:5", sets: "2:10", games: "24:64", venue: "tenniscoMpany Marschand München", status: "played" },

  // ── Herren 30 Südliga 1 Gr. 109 ──
  { teamId: "w-herren30", date: "2025-11-16", time: "15:00", day: "So", home: "TC Unterföhring", away: "TC Pliening", isHome: false, mp: "6:0", sets: "12:1", games: "72:27", venue: "VfB Hallbergmoos", status: "played" },
  { teamId: "w-herren30", date: "2025-12-07", time: "12:00", day: "So", home: "TC Pliening", away: "PSV München", isHome: true, mp: "6:0", sets: "12:0", games: "73:17", venue: "Tennispark Anzing", status: "played" },
  { teamId: "w-herren30", date: "2026-02-21", time: "17:00", day: "Sa", home: "TC Thalkirchen München", away: "TC Pliening", isHome: false, mp: "0:6", sets: "2:12", games: "33:70", venue: "tenniscoMpany Marschand München", status: "played" },
  { teamId: "w-herren30", date: "2026-03-15", time: "15:00", day: "So", home: "TC Pliening", away: "WB Fideliopark München", isHome: true, mp: "3:3", sets: "6:7", games: "50:63", venue: "Raschke Taufkirchen", status: "played" },

  // ── Herren 30 II Südliga 2 Gr. 117 ──
  { teamId: "w-herren30ii", date: "2026-03-28", time: "16:00", day: "Sa", home: "TC Pliening II", away: "SV Heimstetten", isHome: true, mp: "0:0", sets: "0:0", games: "0:0", venue: "Tennispark Anzing", status: "open" },

  // ── Damen 40 Südliga 2 Gr. 192 ──
  { teamId: "w-damen40", date: "2025-10-05", time: "12:00", day: "So", home: "TC Pliening", away: "TC Cosima München", isHome: true, mp: "1:5", sets: "4:10", games: "40:52", venue: "Tennispark Anzing", status: "played" },
  { teamId: "w-damen40", date: "2025-11-29", time: "17:00", day: "Sa", home: "TeG Kirchheim", away: "TC Pliening", isHome: false, mp: "3:3", sets: "7:6", games: "53:46", venue: "TSV Haar", status: "played" },
  { teamId: "w-damen40", date: "2025-12-21", time: "10:00", day: "So", home: "TC Aschheim", away: "TC Pliening", isHome: false, mp: "3:3", sets: "7:6", games: "42:39", venue: "VfB Hallbergmoos", status: "played" },
  { teamId: "w-damen40", date: "2026-01-17", time: "16:00", day: "Sa", home: "TC Pliening", away: "TC Schleißheim", isHome: true, mp: "6:0", sets: "12:1", games: "71:15", venue: "Tennispark Anzing", status: "played" },
  { teamId: "w-damen40", date: "2026-02-22", time: "15:00", day: "So", home: "TC Unterföhring II", away: "TC Pliening", isHome: false, mp: "0:6", sets: "0:12", games: "16:72", venue: "VfB Hallbergmoos", status: "played" },
];

// ── Winter Monate & Farben ──
export const WINTER_MONTHS: Record<string, string> = {
  "2025-10": "Oktober",
  "2025-11": "November",
  "2025-12": "Dezember",
  "2026-01": "Januar",
  "2026-02": "Februar",
  "2026-03": "März",
};

export const WINTER_MONTH_COLORS: Record<string, MonthColor> = {
  "2025-10": {
    bg: "#78350f25", border: "#d9770640", accent: "#fbbf24", headerBg: "#78350f50", label: "#fcd34d",
    weekBgs: ["#78350f15", "#78350f30", "#78350f15", "#78350f30", "#78350f15", "#78350f30"],
  },
  "2025-11": {
    bg: "#581c8725", border: "#7c3aed40", accent: "#a78bfa", headerBg: "#581c8750", label: "#c4b5fd",
    weekBgs: ["#581c8715", "#581c8730", "#581c8715", "#581c8730", "#581c8715", "#581c8730"],
  },
  "2025-12": {
    bg: "#1e3a5f25", border: "#3b82f640", accent: "#60a5fa", headerBg: "#1e3a5f50", label: "#93c5fd",
    weekBgs: ["#1e3a5f15", "#1e3a5f30", "#1e3a5f15", "#1e3a5f30", "#1e3a5f15", "#1e3a5f30"],
  },
  "2026-01": {
    bg: "#312e8125", border: "#6366f140", accent: "#818cf8", headerBg: "#312e8150", label: "#a5b4fc",
    weekBgs: ["#312e8115", "#312e8130", "#312e8115", "#312e8130", "#312e8115", "#312e8130"],
  },
  "2026-02": {
    bg: "#4c1d9525", border: "#8b5cf640", accent: "#a78bfa", headerBg: "#4c1d9550", label: "#c4b5fd",
    weekBgs: ["#4c1d9515", "#4c1d9530", "#4c1d9515", "#4c1d9530", "#4c1d9515", "#4c1d9530"],
  },
  "2026-03": {
    bg: "#134e4a25", border: "#14b8a640", accent: "#2dd4bf", headerBg: "#134e4a50", label: "#5eead4",
    weekBgs: ["#134e4a15", "#134e4a30", "#134e4a15", "#134e4a30", "#134e4a15", "#134e4a30"],
  },
};
