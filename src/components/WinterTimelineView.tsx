import { useMemo, useState } from "react";
import type { WinterMatch, Team, MatchScore, IndividualMatch } from "../types";
import { WINTER_MONTHS, WINTER_MONTH_COLORS } from "../data/winter-2526";
import {
  getMonthKey,
  getWeekKey,
  weekendLabel,
  getDayFromDate,
  formatDateFull,
} from "../utils/date-helpers";
import LiveScorePanel from "./LiveScorePanel";

interface WinterTimelineViewProps {
  matches: WinterMatch[];
  teamMap: Map<string, Team>;
  scores: Map<string, MatchScore>;
  onSaveScore: (
    teamId: string,
    matchDate: string,
    matchTime: string,
    individualMatches: Omit<IndividualMatch, "id" | "match_score_id">[]
  ) => Promise<{ success: boolean; error?: string }>;
  allMatches?: WinterMatch[];
  favorites?: Set<string>;
  toggleFavorite?: (key: string) => void;
}

function getYearFromMonth(monthKey: string): string {
  return monthKey.split("-")[0];
}

function scoreResult(mp: string): "win" | "loss" | "draw" {
  const [h, a] = mp.split(":").map(Number);
  if (h > a) return "win";
  if (h < a) return "loss";
  return "draw";
}

function WinterMatchRow({
  match,
  team,
  isOpen,
  onClick,
  isFavorite,
  onToggleFavorite,
  score,
}: {
  match: WinterMatch;
  team: Team;
  isOpen: boolean;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  score?: MatchScore;
}) {
  const opponent = match.isHome ? match.away : match.home;
  const isPlayed = match.status === "played";

  const result = isPlayed
    ? match.isHome
      ? scoreResult(match.mp)
      : scoreResult(match.mp.split(":").reverse().join(":"))
    : null;

  const resultStyles = {
    win: "bg-emerald-900/50 text-emerald-200 border-emerald-500/30",
    loss: "bg-red-900/40 text-red-300 border-red-500/30",
    draw: "bg-amber-900/40 text-amber-200 border-amber-500/30",
  };

  const [mpH, mpA] = match.mp.split(":").map(Number);
  const tcpMp = match.isHome ? `${mpH}:${mpA}` : `${mpA}:${mpH}`;

  // Live score from Supabase (for "open" matches with partial results)
  const liveScore = useMemo(() => {
    if (isPlayed || !score) return null;
    const hasAnyData = score.individual_matches.some(
      (im) => im.set1_home != null || im.set1_away != null
    );
    if (!hasAnyData) return null;
    const tcpW = match.isHome ? score.home_wins : score.away_wins;
    const oppW = match.isHome ? score.away_wins : score.home_wins;
    return { tcp: tcpW, opp: oppW };
  }, [isPlayed, score, match.isHome]);

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

      <span className="text-sm text-slate-200 truncate flex-1 min-w-0">
        {opponent}
      </span>

      {isPlayed && result ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded border ${resultStyles[result]}`}
          >
            {tcpMp}
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            {match.isHome
              ? match.sets
              : match.sets.split(":").reverse().join(":")}
          </span>
        </div>
      ) : liveScore ? (
        <span className="text-xs font-bold px-2 py-0.5 rounded border bg-slate-700/70 text-slate-200 border-slate-600/50 shrink-0">
          {liveScore.tcp}:{liveScore.opp}
        </span>
      ) : (
        <span className="text-[10px] text-slate-500 italic shrink-0">
          offen
        </span>
      )}

      {onToggleFavorite && (
        <button
          onClick={onToggleFavorite}
          className={`shrink-0 text-sm p-0.5 transition-colors ${
            isFavorite ? "text-amber-400" : "text-slate-600 hover:text-slate-400"
          }`}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      )}

      <span className="ml-1 text-slate-500 text-xs group-hover:text-slate-300 transition-colors shrink-0">
        {isOpen ? "▲" : "▼"}
      </span>
    </button>
  );
}

function WinterMatchDetail({
  match,
  team,
  onClose,
  score,
  onSaveScore,
}: {
  match: WinterMatch;
  team: Team;
  onClose: () => void;
  score?: MatchScore;
  onSaveScore: (
    teamId: string,
    matchDate: string,
    matchTime: string,
    individualMatches: Omit<IndividualMatch, "id" | "match_score_id">[]
  ) => Promise<{ success: boolean; error?: string }>;
}) {
  const opponent = match.isHome ? match.away : match.home;
  const isPlayed = match.status === "played";

  const [mpH, mpA] = match.mp.split(":").map(Number);
  const tcpMp = match.isHome ? `${mpH}:${mpA}` : `${mpA}:${mpH}`;
  const tcpSets = match.isHome
    ? match.sets
    : match.sets.split(":").reverse().join(":");
  const tcpGames = match.isHome
    ? match.games
    : match.games.split(":").reverse().join(":");

  return (
    <div className="animate-fadeIn bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mx-1 mb-2">
      {/* Header */}
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
          &#10005;
        </button>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Termin
          </p>
          <p className="text-sm text-slate-200">
            {formatDateFull(match.date, match.day)}
          </p>
          <p className="text-sm text-slate-200">{match.time} Uhr</p>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Spielort
          </p>
          <p className="text-sm text-slate-200">{match.venue}</p>
        </div>
      </div>

      {/* Official team result */}
      {isPlayed && (
        <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Mannschaftsergebnis
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs text-slate-400">TCP</span>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <span>MP {tcpMp}</span>
              <span className="text-slate-600">|</span>
              <span>S {tcpSets}</span>
              <span className="text-slate-600">|</span>
              <span>Sp {tcpGames}</span>
            </div>
            <span className="text-xs text-slate-500">{opponent}</span>
          </div>
        </div>
      )}

      {/* Live Score Panel for individual match details */}
      <LiveScorePanel
        match={match}
        team={team}
        score={score}
        onSave={onSaveScore}
      />
    </div>
  );
}

export default function WinterTimelineView({
  matches,
  teamMap,
  scores,
  onSaveScore,
  allMatches,
  favorites,
  toggleFavorite,
}: WinterTimelineViewProps) {
  const [openMatch, setOpenMatch] = useState<string | null>(null);

  const favoriteMatches = useMemo(() => {
    if (!favorites || favorites.size === 0 || !allMatches) return [];
    return allMatches
      .filter((m) => favorites.has(`${m.teamId}-${m.date}-${m.time}`))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [allMatches, favorites]);

  const grouped = useMemo(() => {
    const sorted = [...matches].sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    );

    const monthMap = new Map<
      string,
      Map<string, Map<string, { day: string; matches: WinterMatch[] }>>
    >();

    for (const m of sorted) {
      const mk = getMonthKey(m.date);
      const wk = getWeekKey(m.date);

      if (!monthMap.has(mk)) monthMap.set(mk, new Map());
      const weeks = monthMap.get(mk)!;
      if (!weeks.has(wk)) weeks.set(wk, new Map());
      const dates = weeks.get(wk)!;
      if (!dates.has(m.date))
        dates.set(m.date, { day: m.day, matches: [] });
      dates.get(m.date)!.matches.push(m);
    }

    const months = [...monthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mk, weeks]) => {
        const weekArr = [...weeks.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([wk, dates]) => {
            const dayArr = [...dates.entries()]
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, data]) => ({
                date,
                day: data.day,
                matches: data.matches,
              }));
            return {
              key: wk,
              dates: dayArr.map((d) => d.date),
              days: dayArr,
              matchCount: dayArr.reduce(
                (s, d) => s + d.matches.length,
                0
              ),
            };
          });
        return {
          key: mk,
          weeks: weekArr,
          matchCount: weekArr.reduce((s, w) => s + w.matchCount, 0),
        };
      });

    return { months };
  }, [matches]);

  const matchKey = (m: WinterMatch) => `${m.teamId}-${m.date}-${m.time}`;
  const toggleMatch = (key: string) =>
    setOpenMatch((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-10">
      {/* Meine Spiele — Favorited matches pinned to top */}
      {favoriteMatches.length > 0 && (
        <div>
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
            style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", borderLeft: "4px solid #f59e0b" }}
          >
            <h2 className="text-lg font-extrabold text-amber-200">
              ★ Meine Spiele
            </h2>
            <span className="text-xs font-semibold text-amber-300">
              {favoriteMatches.length}
            </span>
          </div>
          <div className="space-y-1 bg-amber-900/10 border border-amber-500/20 rounded-xl p-2">
            {favoriteMatches.map((m) => {
              const key = matchKey(m);
              const team = teamMap.get(m.teamId);
              if (!team) return null;
              return (
                <div key={`fav-${key}`}>
                  <WinterMatchRow
                    match={m}
                    team={team}
                    isOpen={openMatch === key}
                    onClick={() => toggleMatch(key)}
                    isFavorite={true}
                    onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite?.(key); }}
                    score={scores.get(key)}
                  />
                  {openMatch === key && (
                    <WinterMatchDetail
                      match={m}
                      team={team}
                      onClose={() => setOpenMatch(null)}
                      score={scores.get(key)}
                      onSaveScore={onSaveScore}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {grouped.months.map((month) => {
        const colors = WINTER_MONTH_COLORS[month.key];
        const monthName = WINTER_MONTHS[month.key] || month.key;
        const year = getYearFromMonth(month.key);

        return (
          <div key={month.key}>
            {/* Month header */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl mb-5"
              style={{
                backgroundColor: colors?.headerBg,
                borderLeft: `4px solid ${colors?.accent}`,
              }}
            >
              <h2
                className="text-lg font-extrabold"
                style={{ color: colors?.label }}
              >
                {monthName} {year}
              </h2>
              <span
                className="text-xs font-semibold"
                style={{ color: colors?.label }}
              >
                {month.matchCount} Spiele
              </span>
            </div>

            {/* Weeks */}
            <div className="space-y-5 relative">
              <div
                className="absolute left-[15px] top-0 bottom-0 w-px"
                style={{ backgroundColor: colors?.accent + "30" }}
              />

              {month.weeks.map((week, weekIdx) => (
                <div
                  key={week.key}
                  className="rounded-xl border overflow-hidden ml-4"
                  style={{
                    backgroundColor:
                      colors?.weekBgs?.[
                        weekIdx % colors.weekBgs.length
                      ] || colors?.bg,
                    borderColor: colors?.border,
                  }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-2 border-b"
                    style={{ borderColor: colors?.border }}
                  >
                    <span className="text-xs font-semibold text-slate-300">
                      {weekendLabel(week.dates)}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: colors?.accent + "20",
                        color: colors?.accent,
                      }}
                    >
                      {week.matchCount}
                    </span>
                  </div>

                  <div
                    className="divide-y"
                    style={{ borderColor: colors?.border + "60" }}
                  >
                    {week.days.map((dayData) => {
                      const dayStyle =
                        dayData.day === "Sa"
                          ? {
                              sidebarBg: colors?.accent + "18",
                              rowBg: colors?.accent + "06",
                              labelColor: "#94a3b8",
                              numColor: "#cbd5e1",
                            }
                          : {
                              sidebarBg: colors?.accent + "22",
                              rowBg: colors?.accent + "0c",
                              labelColor: "#93c5fd",
                              numColor: "#60a5fa",
                            };

                      return (
                        <div
                          key={dayData.date}
                          className="flex"
                          style={{ backgroundColor: dayStyle.rowBg }}
                        >
                          <div
                            className="shrink-0 w-12 flex flex-col items-center justify-center py-2 border-r"
                            style={{
                              borderColor: colors?.border,
                              backgroundColor: dayStyle.sidebarBg,
                            }}
                          >
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: dayStyle.labelColor }}
                            >
                              {dayData.day}
                            </span>
                            <span
                              className="text-xl font-extrabold leading-tight"
                              style={{ color: dayStyle.numColor }}
                            >
                              {getDayFromDate(dayData.date)}
                            </span>
                            {dayData.matches.length >= 2 && (
                              <span className="text-[9px] font-bold bg-yellow-500/20 text-yellow-300 px-1.5 rounded-full mt-0.5">
                                {dayData.matches.length}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 py-1 min-w-0">
                            {dayData.matches.map((m) => {
                              const key = matchKey(m);
                              const team = teamMap.get(m.teamId);
                              if (!team) return null;
                              return (
                                <div key={key}>
                                  <WinterMatchRow
                                    match={m}
                                    team={team}
                                    isOpen={openMatch === key}
                                    onClick={() => toggleMatch(key)}
                                    isFavorite={favorites?.has(key)}
                                    onToggleFavorite={toggleFavorite ? (e) => { e.stopPropagation(); toggleFavorite(key); } : undefined}
                                    score={scores.get(key)}
                                  />
                                  {openMatch === key && (
                                    <WinterMatchDetail
                                      match={m}
                                      team={team}
                                      onClose={() => setOpenMatch(null)}
                                      score={scores.get(key)}
                                      onSaveScore={onSaveScore}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {grouped.months.length === 0 && (
        <p className="text-center text-slate-500 py-12">
          Keine Spiele für die ausgewählten Mannschaften.
        </p>
      )}
    </div>
  );
}
