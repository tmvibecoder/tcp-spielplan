import type { Match, Team, MatchScore, IndividualMatch } from "../types";
import { CLUBS } from "../data/clubs";
import { PLIENING_ADDRESS } from "../data/constants";
import { formatDateFull } from "../utils/date-helpers";
import LiveScorePanel from "./LiveScorePanel";

interface MatchDetailProps {
  match: Match;
  team: Team;
  onClose: () => void;
  score?: MatchScore;
  onSaveScore?: (
    teamId: string,
    matchDate: string,
    matchTime: string,
    individualMatches: Omit<IndividualMatch, "id" | "match_score_id">[]
  ) => Promise<{ success: boolean; error?: string }>;
}

function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export default function MatchDetail({ match, team, onClose, score, onSaveScore }: MatchDetailProps) {
  const opponent = match.isHome ? match.away : match.home;
  const address = match.isHome
    ? PLIENING_ADDRESS
    : CLUBS[opponent]?.address || "Adresse unbekannt";

  return (
    <div className="animate-fadeIn bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mx-1 mb-2">
      {/* Close button */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-slate-100">
            {match.isHome
              ? `TC Pliening vs. ${opponent}`
              : `${opponent} vs. TC Pliening`}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {team.emoji} {team.label} · {team.league}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-200 text-lg leading-none p-1 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            📅 Termin
          </p>
          <p className="text-sm text-slate-200">
            {formatDateFull(match.date, match.day)}
          </p>
          <p className="text-sm text-slate-200">{match.time} Uhr</p>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {match.isHome ? "🏠 Heimspiel" : "🚗 Auswärtsspiel"}
          </p>
          <p className="text-sm text-slate-200">
            {match.isHome ? "TC Pliening" : opponent}
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          📍 Spielort
        </p>
        <p className="text-sm text-slate-200 mb-2">{address}</p>
        <a
          href={mapsUrl(address)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold hover:bg-blue-600/30 transition-colors"
        >
          🗺️ Google Maps
        </a>
      </div>

      {/* Live Score Panel */}
      {onSaveScore && (
        <LiveScorePanel
          match={match}
          team={team}
          score={score}
          onSave={onSaveScore}
        />
      )}

      {/* Disclaimer */}
      <p className="text-[11px] text-slate-500 mt-3">
        ⚠️ Beginnzeiten können sich noch ändern (finale Zeiten ab 01.04.)
      </p>
    </div>
  );
}
