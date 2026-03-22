import type { Team } from "../types";

export const TEAMS: Team[] = [
  // ── Herren (Blau-Cyan Palette: kräftig → hell je älter) ──
  { id: "herren",       label: "Herren",          shortLabel: "H",      league: "Südliga 2 · Gr. 023",                color: "#0ea5e9", emoji: "🔵" },
  { id: "herren30",     label: "Herren 30",       shortLabel: "H30",    league: "Südliga 4 (4er) · Gr. 292",          color: "#22d3ee", emoji: "🔵" },
  { id: "herren40",     label: "Herren 40",       shortLabel: "H40",    league: "Regionalliga Süd-Ost · Gr. 004",     color: "#38bdf8", emoji: "🔵" },
  { id: "herren40ii",   label: "Herren 40 II",    shortLabel: "H40-2",  league: "Landesliga 2 · Gr. 043 SU",          color: "#67e8f9", emoji: "🔵" },
  { id: "herren40iii",  label: "Herren 40 III",   shortLabel: "H40-3",  league: "Südliga 2 · Gr. 315",                color: "#7dd3fc", emoji: "🔵" },
  { id: "herren50",     label: "Herren 50",       shortLabel: "H50",    league: "Regionalliga Süd-Ost · Gr. 005",     color: "#06b6d4", emoji: "🔵" },
  { id: "herren50ii",   label: "Herren 50 II",    shortLabel: "H50-2",  league: "Südliga 1 · Gr. 355",                color: "#a5f3fc", emoji: "🔵" },
  { id: "herren50iii",  label: "Herren 50 III",   shortLabel: "H50-3",  league: "Südliga 3 · Gr. 379",                color: "#bae6fd", emoji: "🔵" },
  { id: "herren60",     label: "Herren 60",       shortLabel: "H60",    league: "Südliga 1 · Gr. 404",                color: "#cffafe", emoji: "🔵" },
  // ── Damen (Orange-Amber Palette: kräftig → hell je älter) ──
  { id: "damen",        label: "Damen",           shortLabel: "D",      league: "Südliga 2 · Gr. 160",                color: "#f59e0b", emoji: "🟠" },
  { id: "damen40",      label: "Damen 40",        shortLabel: "D40",    league: "Südliga 1 · Gr. 441",                color: "#fbbf24", emoji: "🟠" },
  { id: "damen50",      label: "Damen 50",        shortLabel: "D50",    league: "Landesliga 1 (4er) · Gr. 103 SU",    color: "#fcd34d", emoji: "🟠" },
  { id: "damen50ii",    label: "Damen 50 II",     shortLabel: "D50-2",  league: "Südliga 2 (4er) · Gr. 488",          color: "#fde68a", emoji: "🟠" },
  // ── Jugend (Grün-Lime Palette: kräftig → hell je jünger) ──
  { id: "juniorinnen18",label: "Juniorinnen 18",  shortLabel: "J18w",   league: "Südliga 3 · Gr. 686",                color: "#22c55e", emoji: "🟢" },
  { id: "knaben15",     label: "Knaben 15",       shortLabel: "Kn15",   league: "Südliga 4 · Gr. 596",                color: "#4ade80", emoji: "🟢" },
  { id: "knaben15ii",   label: "Knaben 15 II",    shortLabel: "Kn15-2", league: "Südliga 5 · Gr. 638",                color: "#86efac", emoji: "🟢" },
  { id: "midcourt",     label: "Midcourt U10",    shortLabel: "U10",    league: "Südliga 1 · Gr. 870",                color: "#a3e635", emoji: "🟢" },
];
