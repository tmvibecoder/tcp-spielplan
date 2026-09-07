import { lazy, Suspense } from "react";
import type { Match, Team, MatchScore, IndividualMatch, WinterMatch } from "../types";
import type { MatchResult } from "../data/results";
import { CLUBS } from "../data/clubs";
import { PLIENING_ADDRESS } from "../data/constants";
import { formatDateFull } from "../utils/date-helpers";
import LiveScorePanel from "./LiveScorePanel";

const SpielberichtLink = lazy(() => import("./SpielberichtLink"));

interface MatchDetailProps {
  match: Match;
  team: Team;
  onClose: () => void;
  result: MatchResult | null;
  score?: MatchScore;
  onSaveScore?: (
    teamId: string,
    matchDate: string,
    matchTime: string,
    individualMatches: Omit<IndividualMatch, "id" | "match_score_id">[]
  ) => Promise<{ success: boolean; error?: string }>;
  /** Hinweis „Beginnzeiten vorläufig“ nur bis zu diesem Datum zeigen */
  provisionalTimesUntil?: string;
  todayStr: string;
}

function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

const OUTCOME_LABEL: Record<MatchResult["outcome"], string> = {
  win: "Sieg",
  loss: "Niederlage",
  draw: "Unentschieden",
  cancelled: "gestrichen",
};

const OUTCOME_CLASS: Record<MatchResult["outcome"], string> = {
  win: "text-emerald-300",
  loss: "text-red-300",
  draw: "text-amber-200",
  cancelled: "text-slate-500",
};

export default function MatchDetail({
  match,
  team,
  onClose,
  result,
  score,
  onSaveScore,
  provisionalTimesUntil,
  todayStr,
}: MatchDetailProps) {
  const opponent = match.isHome ? match.away : match.home;
  // Winter: Hallen-Spielort steht direkt am Termin. Sommer: Heim = Pliening,
  // Auswärts = Adresse des Gegners aus clubs.ts.
  const venue = (match as Partial<WinterMatch>).venue;
  const address = venue
    ? venue
    : match.isHome
      ? PLIENING_ADDRESS
      : CLUBS[opponent]?.address || "Adresse unbekannt";
  const showTimesHint =
    !!provisionalTimesUntil && todayStr < provisionalTimesUntil && match.date >= todayStr;
  const hasOfficialResult = !!result && result.outcome !== "cancelled";

  return (
    <div className="animate-fadeIn bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mx-1 mb-2">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-slate-100">
            {match.home} vs. {match.away}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {team.emoji} {team.label} · {team.league}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Schließen"
          className="text-slate-500 hover:text-slate-200 text-lg leading-none p-1 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Offizielles Ergebnis */}
      {result && (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3 mb-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            🏁 Endergebnis
          </p>
          {result.outcome === "cancelled" ? (
            <p className="text-sm text-slate-400">
              Begegnung vom BTV gestrichen (Mannschaft zurückgezogen) — zählt nicht für die Tabelle.
            </p>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-bold text-slate-200">{match.isHome ? match.home : match.away}</span>
              <span className={`text-2xl font-extrabold tabular-nums ${OUTCOME_CLASS[result.outcome]}`}>
                {result.tcp}:{result.opp}
              </span>
              <span className="text-sm font-bold text-slate-400 truncate">{opponent}</span>
              <span className={`ml-auto text-xs font-semibold ${OUTCOME_CLASS[result.outcome]}`}>
                {OUTCOME_LABEL[result.outcome]}
              </span>
            </div>
          )}
          {(result.sets || result.games) && (
            <p className="mt-1.5 text-[11px] text-slate-500">
              {result.sets && <>Sätze {result.sets}</>}
              {result.sets && result.games && " · "}
              {result.games && <>Spiele {result.games}</>}
            </p>
          )}
          {hasOfficialResult && (
            <div className="mt-2">
              <Suspense fallback={null}>
                <SpielberichtLink
                  league={team.league}
                  leagueLabel={`${team.label} · ${team.league}`}
                  homeClub={match.home}
                  awayClub={match.away}
                  result={result}
                />
              </Suspense>
            </div>
          )}
        </div>
      )}

      {/* Termin + Heim/Auswärts */}
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

      {/* Spielort */}
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

      {/* Manuelle Ergebniserfassung nur, solange kein offizielles Ergebnis vorliegt */}
      {onSaveScore && !result && (
        <LiveScorePanel
          match={match}
          team={team}
          score={score}
          onSave={onSaveScore}
        />
      )}

      {showTimesHint && (
        <p className="text-[11px] text-slate-500 mt-3">
          ⚠️ Beginnzeiten können sich laut BTV noch ändern (endgültig ab{" "}
          {provisionalTimesUntil!.split("-").reverse().join(".")}).
        </p>
      )}
    </div>
  );
}
