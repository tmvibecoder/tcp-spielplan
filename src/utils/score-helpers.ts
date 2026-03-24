import type { IndividualMatch } from "../types";
import { getSinglesCount } from "../data/team-format";

/** Determine winner of an individual match from set scores */
export function computeWinner(
  im: Pick<IndividualMatch, "set1_home" | "set1_away" | "set2_home" | "set2_away" | "set3_home" | "set3_away">
): "home" | "away" | null {
  let homeSets = 0;
  let awaySets = 0;

  // Set 1
  if (im.set1_home != null && im.set1_away != null && (im.set1_home >= 6 || im.set1_away >= 6)) {
    if (im.set1_home > im.set1_away) homeSets++;
    else if (im.set1_away > im.set1_home) awaySets++;
  }

  // Set 2
  if (im.set2_home != null && im.set2_away != null && (im.set2_home >= 6 || im.set2_away >= 6)) {
    if (im.set2_home > im.set2_away) homeSets++;
    else if (im.set2_away > im.set2_home) awaySets++;
  }

  // Set 3 / Match-Tiebreak
  if (im.set3_home != null && im.set3_away != null && (im.set3_home > 0 || im.set3_away > 0)) {
    if (im.set3_home > im.set3_away) homeSets++;
    else if (im.set3_away > im.set3_home) awaySets++;
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

/** Check if sets are 1:1 (third set needed) */
export function needsThirdSet(im: Pick<IndividualMatch, "set1_home" | "set1_away" | "set2_home" | "set2_away">): boolean {
  if (im.set1_home == null || im.set1_away == null) return false;
  if (im.set2_home == null || im.set2_away == null) return false;

  let homeSets = 0;
  let awaySets = 0;

  if (im.set1_home > im.set1_away) homeSets++;
  else if (im.set1_away > im.set1_home) awaySets++;

  if (im.set2_home > im.set2_away) homeSets++;
  else if (im.set2_away > im.set2_home) awaySets++;

  return homeSets === 1 && awaySets === 1;
}
