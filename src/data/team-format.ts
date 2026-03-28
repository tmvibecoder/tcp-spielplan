import type { TeamFormat } from "../types";

export const TEAM_FORMAT: Record<string, TeamFormat> = {
  // 6er Mannschaften (6 Einzel + 3 Doppel)
  herren: "6er",
  herren40: "6er",
  herren40ii: "6er",
  herren40iii: "6er",
  herren50: "6er",
  herren50ii: "6er",
  herren50iii: "6er",
  herren60: "6er",
  damen: "6er",
  damen40: "6er",
  damen50: "6er",
  damen50ii: "6er",
  // Winter Mannschaften
  "w-herren40": "6er",
  "w-herren50": "6er",
  "w-herren30": "6er",
  "w-herren30ii": "4er",
  "w-damen": "6er",
  "w-damen40": "6er",
  "w-damen50": "6er",
  // 4er Mannschaften (4 Einzel + 2 Doppel)
  herren30: "4er",
  juniorinnen18: "4er",
  knaben15: "4er",
  knaben15ii: "4er",
  midcourt: "4er",
};

export function getSinglesCount(teamId: string): number {
  return TEAM_FORMAT[teamId] === "4er" ? 4 : 6;
}

export function getDoublesCount(teamId: string): number {
  return TEAM_FORMAT[teamId] === "4er" ? 2 : 3;
}

export function getTotalPositions(teamId: string): number {
  return getSinglesCount(teamId) + getDoublesCount(teamId);
}
