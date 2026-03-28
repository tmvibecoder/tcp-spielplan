import type { MatchScore } from "../types";

interface ScoreBadgeProps {
  score: MatchScore;
  isHome: boolean;
}

export default function ScoreBadge({ score, isHome }: ScoreBadgeProps) {
  const { home_wins, away_wins } = score;

  // No scores yet — check if any individual match has actual data
  const hasAnyData = score.individual_matches.some(
    (im) => im.set1_home != null || im.set1_away != null || im.home_player || im.away_player
  );
  if (home_wins === 0 && away_wins === 0 && !hasAnyData) {
    return null;
  }

  // Determine color: Pliening perspective
  const plieningWins = isHome ? home_wins : away_wins;
  const opponentWins = isHome ? away_wins : home_wins;

  const colorClass =
    plieningWins > opponentWins
      ? "bg-emerald-900/70 text-emerald-200 border-emerald-700/50"
      : plieningWins < opponentWins
      ? "bg-red-900/70 text-red-200 border-red-700/50"
      : "bg-slate-700/70 text-slate-200 border-slate-600/50";

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold border shrink-0 ${colorClass}`}
    >
      {home_wins}:{away_wins}
    </span>
  );
}
