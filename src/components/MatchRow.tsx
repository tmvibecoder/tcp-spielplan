import type { Match, Team, MatchScore } from "../types";
import type { MatchResult } from "../data/results";
import ScoreBadge from "./ScoreBadge";

interface MatchRowProps {
  match: Match;
  team: Team;
  isOpen: boolean;
  onClick: () => void;
  /** Offizielles BTV-Ergebnis (aus Tabelle/Kreuztabelle), null = noch keines */
  result: MatchResult | null;
  /** Termin liegt in der Vergangenheit (ohne Ergebnis → gedimmt, "offen") */
  isPast: boolean;
  score?: MatchScore;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

const RESULT_STYLES: Record<MatchResult["outcome"], string> = {
  win: "bg-emerald-900/50 text-emerald-200 border-emerald-500/30",
  loss: "bg-red-900/40 text-red-300 border-red-500/30",
  draw: "bg-amber-900/40 text-amber-200 border-amber-500/30",
  cancelled: "bg-slate-800/60 text-slate-500 border-slate-600/40 line-through",
};

export default function MatchRow({
  match,
  team,
  isOpen,
  onClick,
  result,
  isPast,
  score,
  isFavorite,
  onToggleFavorite,
}: MatchRowProps) {
  const opponent = match.isHome ? match.away : match.home;
  const pending = isPast && !result;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-expanded={isOpen}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700/30 transition-colors text-left cursor-pointer ${
        isOpen ? "bg-slate-700/20" : ""
      } ${pending ? "opacity-60" : ""}`}
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
        title={match.isHome ? "Heimspiel" : "Auswärtsspiel"}
      >
        {match.isHome ? "H" : "A"}
      </span>

      <span className="text-sm text-slate-200 truncate min-w-0 flex-1">
        {opponent}
      </span>

      {result ? (
        result.outcome === "cancelled" ? (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${RESULT_STYLES.cancelled}`}>
            gestrichen
          </span>
        ) : (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 tabular-nums ${RESULT_STYLES[result.outcome]}`}
            title={`Endergebnis aus Sicht TC Pliening: ${result.tcp}:${result.opp}`}
          >
            {result.tcp}:{result.opp}
          </span>
        )
      ) : score ? (
        <ScoreBadge score={score} isHome={match.isHome} />
      ) : pending ? (
        <span className="text-[10px] text-slate-500 italic shrink-0">offen</span>
      ) : null}

      {onToggleFavorite && (
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Aus „Meine Spiele“ entfernen" : "Zu „Meine Spiele“ hinzufügen"}
          className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
            isFavorite
              ? "text-amber-400 bg-amber-400/10"
              : "text-slate-600 hover:text-slate-400 hover:bg-slate-700/40"
          }`}
        >
          <span className="text-base">{isFavorite ? "★" : "☆"}</span>
        </button>
      )}
    </div>
  );
}
