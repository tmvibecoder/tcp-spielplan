import type { IndividualMatch } from "../types";
import { getSinglesCount } from "../data/team-format";

/**
 * Check if a regular set (Set 1 or Set 2) is complete.
 * Complete when: 6:0–6:4, 7:5, or 7:6 (tiebreak).
 */
export function isRegularSetComplete(a: number | null, b: number | null): boolean {
  if (a == null || b == null) return false;
  const high = Math.max(a, b);
  const low = Math.min(a, b);
  if (high < 6) return false;
  // 6:0 through 6:4, or 7:5
  if (high >= 6 && high - low >= 2) return true;
  // 7:6 (tiebreak decided)
  if (high === 7 && low === 6) return true;
  return false;
}

/**
 * Check if a Champions Tie-Break (3rd set) is complete.
 * First to 10, must win by 2. Valid: 10:0–10:8, 11:9, 12:10, etc.
 */
export function isChampionsTiebreakComplete(a: number | null, b: number | null): boolean {
  if (a == null || b == null) return false;
  const high = Math.max(a, b);
  const low = Math.min(a, b);
  if (high < 10) return false;
  if (high - low >= 2) return true;
  return false;
}

/** Determine winner of an individual match from set scores */
export function computeWinner(
  im: Pick<IndividualMatch, "set1_home" | "set1_away" | "set2_home" | "set2_away" | "set3_home" | "set3_away">
): "home" | "away" | null {
  let homeSets = 0;
  let awaySets = 0;

  // Set 1 — only count if complete
  if (isRegularSetComplete(im.set1_home, im.set1_away)) {
    if (im.set1_home! > im.set1_away!) homeSets++;
    else if (im.set1_away! > im.set1_home!) awaySets++;
  }

  // Set 2 — only count if complete
  if (isRegularSetComplete(im.set2_home, im.set2_away)) {
    if (im.set2_home! > im.set2_away!) homeSets++;
    else if (im.set2_away! > im.set2_home!) awaySets++;
  }

  // Set 3 — Champions Tie-Break, only count if complete
  if (isChampionsTiebreakComplete(im.set3_home, im.set3_away)) {
    if (im.set3_home! > im.set3_away!) homeSets++;
    else if (im.set3_away! > im.set3_home!) awaySets++;
  }

  if (homeSets >= 2) return "home";
  if (awaySets >= 2) return "away";
  return null;
}

/** Compute team score from individual matches */
export function computeTeamScore(
  individualMatches: IndividualMatch[]
): { home: number; away: number } {
  let home = 0;
  let away = 0;
  for (const im of individualMatches) {
    if (im.winner === "home") home++;
    else if (im.winner === "away") away++;
  }
  return { home, away };
}

/** Get label for a position */
export function getPositionLabel(position: number, teamId: string): string {
  const singlesCount = getSinglesCount(teamId);
  if (position <= singlesCount) {
    return `Einzel ${position}`;
  }
  return `Doppel ${position - singlesCount}`;
}

/** Format set score for display, e.g. "6:3" */
export function formatSetScore(
  home: number | null,
  away: number | null
): string | null {
  if (home == null || away == null) return null;
  return `${home}:${away}`;
}

/** Get all set scores as formatted strings */
export function getSetScores(im: IndividualMatch): string[] {
  const scores: string[] = [];
  const s1 = formatSetScore(im.set1_home, im.set1_away);
  if (s1) scores.push(s1);
  const s2 = formatSetScore(im.set2_home, im.set2_away);
  if (s2) scores.push(s2);
  const s3 = formatSetScore(im.set3_home, im.set3_away);
  if (s3) scores.push(s3);
  return scores;
}

/** Check if sets are 1:1 (third set needed) — only counts completed sets */
export function needsThirdSet(im: Pick<IndividualMatch, "set1_home" | "set1_away" | "set2_home" | "set2_away">): boolean {
  if (!isRegularSetComplete(im.set1_home, im.set1_away)) return false;
  if (!isRegularSetComplete(im.set2_home, im.set2_away)) return false;

  let homeSets = 0;
  let awaySets = 0;

  if (im.set1_home! > im.set1_away!) homeSets++;
  else if (im.set1_away! > im.set1_home!) awaySets++;

  if (im.set2_home! > im.set2_away!) homeSets++;
  else if (im.set2_away! > im.set2_home!) awaySets++;

  return homeSets === 1 && awaySets === 1;
}
