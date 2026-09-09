import { useMemo } from "react";
import { TEAMS } from "../data/teams";
import { MATCHES } from "../data/matches";
import { WINTER_TEAMS, WINTER_MATCHES } from "../data/winter-2526";
import type { Team, Match } from "../types";
import { useLiveScores } from "../hooks/useLiveScores";
import { formatDateFull } from "../utils/date-helpers";
import ScoreEntry from "./ScoreEntry";

/**
 * Standalone page for score entry, opened via window.open().
 * URL params: ?team=herren&date=2026-05-02&time=14:00
 */
export default function ScoreEntryPage() {
  const params = new URLSearchParams(window.location.search);
  const teamId = params.get("team") || "";
  const matchDate = params.get("date") || "";
  const matchTime = params.get("time") || "";

  const { scores, saveScores } = useLiveScores();

  const allTeams = useMemo(
    () => new Map<string, Team>([
      ...TEAMS.map((t) => [t.id, t] as [string, Team]),
      ...WINTER_TEAMS.map((t) => [t.id, t as Team] as [string, Team]),
    ]),
    []
  );

  const allMatches: Match[] = useMemo(
    () => [...MATCHES, ...WINTER_MATCHES as unknown as Match[]],
    []
  );

  const match = useMemo(
    () => allMatches.find((m) => m.teamId === teamId && m.date === matchDate && m.time === matchTime),
    [allMatches, teamId, matchDate, matchTime]
  );

  const team = allTeams.get(teamId);
  const scoreKey = `${teamId}-${matchDate}-${matchTime}`;
  const score = scores.get(scoreKey);

  if (!match || !team) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-bold text-red-400 mb-2">Match nicht gefunden</p>
          <p className="text-sm text-slate-500">
            team={teamId}, date={matchDate}, time={matchTime}
          </p>
          <button
            onClick={() => window.close()}
            className="mt-4 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors"
          >
            Fenster schliessen
          </button>
        </div>
      </div>
    );
  }

  const opponent = match.isHome ? match.away : match.home;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header with match info */}
      <div className="sticky top-0 z-10 bg-slate-950 border-b border-slate-700/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border shrink-0"
                style={{
                  borderColor: team.color + "40",
                  backgroundColor: team.color + "18",
                  color: team.color,
                }}
              >
                {team.emoji} {team.shortLabel}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                  match.isHome
                    ? "bg-green-900/60 text-green-200"
                    : "bg-yellow-900/60 text-yellow-200"
                }`}
              >
                {match.isHome ? "H" : "A"}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-100 truncate">
              {match.isHome
                ? `TC Pliening vs. ${opponent}`
                : `${opponent} vs. TC Pliening`}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDateFull(match.date, match.day)} · {match.time} Uhr
            </p>
          </div>
          <button
            onClick={() => window.close()}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-600 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors text-lg"
          >
            &#10005;
          </button>
        </div>
      </div>

      {/* Score entry form */}
      <div className="px-4 py-4">
        <ScoreEntry
          match={match}
          team={team}
          existingMatches={score?.individual_matches || []}
          onSave={async (individualMatches) => {
            const result = await saveScores(match.teamId, match.date, match.time, individualMatches);
            return result;
          }}
          onCancel={() => window.close()}
        />
      </div>
    </div>
  );
}
