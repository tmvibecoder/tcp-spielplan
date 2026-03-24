import { useState, useCallback } from "react";
import type { Match, Team, MatchScore, IndividualMatch } from "../types";
import { getSinglesCount } from "../data/team-format";
import { getPositionLabel, getSetScores, computeTeamScore } from "../utils/score-helpers";
import ScoreEntry from "./ScoreEntry";

interface LiveScorePanelProps {
  match: Match;
  team: Team;
  score: MatchScore | undefined;
  onSave: (
    teamId: string,
    matchDate: string,
    matchTime: string,
    individualMatches: Omit<IndividualMatch, "id" | "match_score_id">[]
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function LiveScorePanel({
  match,
  team,
  score,
  onSave,
}: LiveScorePanelProps) {
  const [editing, setEditing] = useState(false);
  const opponent = match.isHome ? match.away : match.home;
  const individualMatches = score?.individual_matches || [];
  const singlesCount = getSinglesCount(match.teamId);
  const hasScores = individualMatches.some(
    (im) => im.set1_home != null || im.home_player
  );

  const teamScore = computeTeamScore(individualMatches);

  const handleSave = useCallback(
    async (
      ims: Omit<IndividualMatch, "id" | "match_score_id">[]
    ) => {
      const result = await onSave(match.teamId, match.date, match.time, ims);
      if (result.success) {
        setEditing(false);
      }
      return result;
    },
    [onSave, match]
  );

  // Editing mode
  if (editing) {
    return (
      <div className="mt-3 border-t border-slate-700/50 pt-3">
        <ScoreEntry
          match={match}
          team={team}
          existingMatches={individualMatches}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  // Read-only display
  return (
    <div className="mt-3 border-t border-slate-700/50 pt-3">
      {/* Team score header */}
      {hasScores && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Ergebnisse
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {match.isHome ? "TC Pliening" : opponent}
            </span>
            <span className="text-lg font-extrabold text-slate-100">
              {teamScore.home}:{teamScore.away}
            </span>
            <span className="text-xs text-slate-400">
              {match.isHome ? opponent : "TC Pliening"}
            </span>
          </div>
        </div>
      )}

      {/* Individual matches */}
      {hasScores && (
        <div className="space-y-1 mb-3">
          {/* Singles */}
          {individualMatches
            .filter((im) => im.position <= singlesCount)
            .sort((a, b) => a.position - b.position)
            .map((im) => (
              <IndividualMatchRow
                key={im.position}
                im={im}
                teamId={match.teamId}
              />
            ))}

          {/* Doubles separator */}
          {individualMatches.some((im) => im.position > singlesCount) && (
            <>
              <div className="border-t border-slate-700/30 my-1" />
              {individualMatches
                .filter((im) => im.position > singlesCount)
                .sort((a, b) => a.position - b.position)
                .map((im) => (
                  <IndividualMatchRow
                    key={im.position}
                    im={im}
                    teamId={match.teamId}
                  />
                ))}
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {!hasScores ? (
          <button
            onClick={() => setEditing(true)}
            className="flex-1 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold rounded-lg transition-colors"
          >
            ✏️ Ergebnis eintragen
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex-1 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg transition-colors"
          >
            🔄 Korrektur
          </button>
        )}
      </div>
    </div>
  );
}

// --- Individual Match Row ---
function IndividualMatchRow({
  im,
  teamId,
}: {
  im: IndividualMatch;
  teamId: string;
}) {
  const setScores = getSetScores(im);
  const hasData = im.home_player || im.away_player || setScores.length > 0;
  if (!hasData) return null;

  const label = getPositionLabel(im.position, teamId);
  const isFinished = im.winner != null;

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${
        isFinished ? "bg-slate-900/30" : "bg-transparent"
      }`}
    >
      {/* Position label */}
      <span className="w-14 shrink-0 text-[10px] font-semibold text-slate-500">
        {label}
      </span>

      {/* Home player */}
      <span
        className={`flex-1 truncate text-right ${
          im.winner === "home"
            ? "text-emerald-300 font-semibold"
            : "text-slate-300"
        }`}
      >
        {im.home_player || "—"}
      </span>

      {/* Set scores */}
      <div className="flex items-center gap-1 shrink-0 min-w-[80px] justify-center">
        {setScores.length > 0 ? (
          setScores.map((s, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded bg-slate-800/80 text-[11px] font-mono text-slate-200"
            >
              {s}
            </span>
          ))
        ) : (
          <span className="text-slate-600 text-[10px]">—</span>
        )}
      </div>

      {/* Away player */}
      <span
        className={`flex-1 truncate ${
          im.winner === "away"
            ? "text-emerald-300 font-semibold"
            : "text-slate-300"
        }`}
      >
        {im.away_player || "—"}
      </span>

      {/* Winner indicator */}
      <span className="w-4 shrink-0 text-center">
        {isFinished && <span className="text-emerald-400 text-[10px]">✓</span>}
      </span>
    </div>
  );
}
