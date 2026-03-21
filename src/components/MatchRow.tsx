import type { Match, Team } from "../types";

interface MatchRowProps {
  match: Match;
  team: Team;
  isOpen: boolean;
  onClick: () => void;
}

export default function MatchRow({ match, team, isOpen, onClick }: MatchRowProps) {
  const opponent = match.isHome ? match.away : match.home;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700/30 transition-colors text-left group"
    >
      <span className="text-xs text-slate-400 w-11 shrink-0 font-mono">
        {match.time}
      </span>

      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 border"
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

      <span className="text-sm text-slate-200 truncate">
        {opponent}
      </span>

      <span className="ml-auto text-slate-500 text-xs group-hover:text-slate-300 transition-colors shrink-0">
        {isOpen ? "▲" : "▼"}
      </span>
    </button>
  );
}
