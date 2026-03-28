import { useState, useCallback } from "react";
import type { Match, Team, MatchScore, IndividualMatch } from "../types";
import { getSinglesCount } from "../data/team-format";
import { computeTeamScore, isRegularSetComplete, isChampionsTiebreakComplete } from "../utils/score-helpers";
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

function abbreviateClub(name: string): string {
  if (name.includes("Pliening")) return "TCP";
  const prefixes = [
    "MTTC ", "TC ", "TSV ", "SV ", "VfB ", "TF ", "TeG ", "SpVgg ",
    "WB ", "TS ", "SC ", "FC ", "PSV ", "ATSV ", "HC ",
  ];
  let short = name;
  for (const p of prefixes) {
    if (short.startsWith(p)) {
      short = short.slice(p.length);
      break;
    }
  }
  short = short.replace(/ München$/i, "").replace(/ I{2,3}$/, "");
  if (short.length > 14) short = short.slice(0, 13) + ".";
  return short;
}

function setDisplayColor(tcpScore: number | null, oppScore: number | null, isTiebreak: boolean): string {
  if (tcpScore == null || oppScore == null) return "bg-slate-800/40 text-slate-500";
  const complete = isTiebreak
    ? isChampionsTiebreakComplete(tcpScore, oppScore)
    : isRegularSetComplete(tcpScore, oppScore);
  if (!complete) return "bg-slate-800/40 text-slate-400";
  if (tcpScore > oppScore) return "bg-emerald-900/25 text-emerald-200";
  if (oppScore > tcpScore) return "bg-red-900/20 text-red-300";
  return "bg-slate-800/40 text-slate-400";
}

export default function LiveScorePanel({
  match,
  team,
  score,
  onSave,
}: LiveScorePanelProps) {
  const [editing, setEditing] = useState(false);
  const [showLineup, setShowLineup] = useState(false);
  const isHome = match.isHome;
  const opponent = isHome ? match.away : match.home;
  const oppShort = abbreviateClub(opponent);
  const individualMatches = score?.individual_matches || [];
  const singlesCount = getSinglesCount(match.teamId);
  const hasScores = individualMatches.some(
    (im) => im.set1_home != null || im.home_player
  );

  const teamScore = computeTeamScore(individualMatches);
  const tcpWins = isHome ? teamScore.home : teamScore.away;
  const oppWins = isHome ? teamScore.away : teamScore.home;

  const handleSave = useCallback(
    async (ims: Omit<IndividualMatch, "id" | "match_score_id">[]) => {
      const result = await onSave(match.teamId, match.date, match.time, ims);
      if (result.success) setEditing(false);
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

  // Helper: get TCP/Opp scores from IndividualMatch
  const tcpScore = (im: IndividualMatch, setNum: 1 | 2 | 3): number | null => {
    const h = im[`set${setNum}_home`];
    const a = im[`set${setNum}_away`];
    return isHome ? h : a;
  };
  const oppScore = (im: IndividualMatch, setNum: 1 | 2 | 3): number | null => {
    const h = im[`set${setNum}_home`];
    const a = im[`set${setNum}_away`];
    return isHome ? a : h;
  };

  const tcpPlayer = (im: IndividualMatch) => isHome ? im.home_player : im.away_player;
  const oppPlayer = (im: IndividualMatch) => isHome ? im.away_player : im.home_player;

  // Winner from TCP perspective
  const tcpWonMatch = (im: IndividualMatch): boolean | null => {
    if (!im.winner) return null;
    return (im.winner === "home" && isHome) || (im.winner === "away" && !isHome);
  };

  // Check if set 3 should show
  const hasSet3 = (im: IndividualMatch): boolean => {
    return im.set3_home != null && im.set3_away != null && (im.set3_home > 0 || im.set3_away > 0);
  };

  const singlesMatches = individualMatches
    .filter((im) => im.position <= singlesCount)
    .sort((a, b) => a.position - b.position);

  const doublesMatches = individualMatches
    .filter((im) => im.position > singlesCount)
    .sort((a, b) => a.position - b.position);

  // Read-only display
  return (
    <div className="mt-3 border-t border-slate-700/50 pt-3">
      {/* Team score header */}
      {hasScores && (
        <div className="flex items-center justify-center gap-3 py-2 mb-3 bg-slate-900/60 rounded-lg border border-slate-700/30">
          <span className="text-sm font-bold text-slate-200">TC Pliening</span>
          <span className="text-xl font-extrabold text-slate-100 tabular-nums">
            {tcpWins}:{oppWins}
          </span>
          <span className="text-sm font-bold text-slate-400">{oppShort}</span>
        </div>
      )}

      {/* Scoreboard rows */}
      {hasScores && (
        <div className="space-y-0.5 mb-3">
          {/* Singles */}
          {singlesMatches.length > 0 && (
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-1">
              Einzel
            </p>
          )}
          {singlesMatches.map((im) => {
            const won = tcpWonMatch(im);
            const hasData = im.set1_home != null || tcpPlayer(im) || oppPlayer(im);
            if (!hasData) return null;
            return (
              <ReadOnlyRow
                key={im.position}
                label={`#${im.position}`}
                won={won}
                sets={[1, 2, 3].map((s) => ({
                  tcp: tcpScore(im, s as 1 | 2 | 3),
                  opp: oppScore(im, s as 1 | 2 | 3),
                  show: s <= 2 || hasSet3(im),
                  isTiebreak: s === 3,
                }))}
              />
            );
          })}

          {/* Doubles */}
          {doublesMatches.length > 0 && (
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-1 mt-2">
              Doppel
            </p>
          )}
          {doublesMatches.map((im) => {
            const won = tcpWonMatch(im);
            const dblIdx = im.position - singlesCount;
            const hasData = im.set1_home != null || tcpPlayer(im) || oppPlayer(im);
            if (!hasData) return null;
            return (
              <ReadOnlyRow
                key={im.position}
                label={`#${dblIdx}`}
                won={won}
                sets={[1, 2, 3].map((s) => ({
                  tcp: tcpScore(im, s as 1 | 2 | 3),
                  opp: oppScore(im, s as 1 | 2 | 3),
                  show: s <= 2 || hasSet3(im),
                  isTiebreak: s === 3,
                }))}
              />
            );
          })}
        </div>
      )}

      {/* Lineup (collapsible) */}
      {hasScores && individualMatches.some((im) => tcpPlayer(im) || oppPlayer(im)) && (
        <div className="border-t border-slate-700/30 pt-2 mb-3">
          <button
            onClick={() => setShowLineup(!showLineup)}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors"
          >
            <span className="text-[9px]">{showLineup ? "▲" : "▼"}</span>
            Aufstellung
          </button>

          {showLineup && (
            <div className="mt-2 space-y-0.5">
              {/* Column headers */}
              <div className="flex items-center gap-2 px-1 mb-1">
                <span className="w-8 shrink-0" />
                <span className="flex-1 text-[10px] font-bold text-slate-500">TC Pliening</span>
                <span className="flex-1 text-[10px] font-bold text-slate-500 text-right">{oppShort}</span>
              </div>

              {singlesMatches.length > 0 && (
                <p className="text-[9px] text-slate-600 px-1">Einzel</p>
              )}
              {singlesMatches.map((im) => (
                <div key={im.position} className="flex items-center gap-2 px-1 py-0.5">
                  <span className="text-[11px] font-bold text-slate-500 w-8 shrink-0">#{im.position}</span>
                  <span className="flex-1 text-xs text-slate-300 truncate">{tcpPlayer(im) || "—"}</span>
                  <span className="flex-1 text-xs text-slate-400 truncate text-right">{oppPlayer(im) || "—"}</span>
                </div>
              ))}

              {doublesMatches.length > 0 && (
                <p className="text-[9px] text-slate-600 px-1 mt-1">Doppel</p>
              )}
              {doublesMatches.map((im) => (
                <div key={im.position} className="flex items-center gap-2 px-1 py-0.5">
                  <span className="text-[11px] font-bold text-slate-500 w-8 shrink-0">#{im.position - singlesCount}</span>
                  <span className="flex-1 text-xs text-slate-300 truncate">{tcpPlayer(im) || "—"}</span>
                  <span className="flex-1 text-xs text-slate-400 truncate text-right">{oppPlayer(im) || "—"}</span>
                </div>
              ))}
            </div>
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
            Ergebnis eintragen
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex-1 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg transition-colors"
          >
            Korrektur
          </button>
        )}
      </div>
    </div>
  );
}

// ── Read-only Score Row ──
function ReadOnlyRow({
  label,
  won,
  sets,
}: {
  label: string;
  won: boolean | null;
  sets: { tcp: number | null; opp: number | null; show: boolean; isTiebreak: boolean }[];
}) {
  return (
    <div className="flex items-center gap-1.5 py-1 px-1">
      {/* Winner indicator */}
      <span className="w-4 shrink-0 text-center">
        {won === true && <span className="text-emerald-400/80 text-sm">&#10003;</span>}
        {won === false && <span className="text-red-400/70 text-sm">&#10005;</span>}
      </span>

      {/* Position label */}
      <span className="text-xs font-bold text-slate-400 w-6 shrink-0">{label}</span>

      {/* Set scores */}
      {sets.map((s, i) => {
        if (!s.show) return <span key={i} className="w-[62px] shrink-0" />;
        const hasScore = s.tcp != null && s.opp != null;
        const color = setDisplayColor(s.tcp, s.opp, s.isTiebreak);
        return (
          <span
            key={i}
            className={`inline-flex items-center justify-center gap-0.5 rounded-md px-1.5 py-1 border border-transparent shrink-0 w-[62px] text-sm font-bold tabular-nums ${color}`}
          >
            {hasScore ? `${s.tcp}:${s.opp}` : "–"}
          </span>
        );
      })}
    </div>
  );
}
