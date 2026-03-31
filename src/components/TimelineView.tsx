import { useMemo, useState } from "react";
import type { Match, Team, MatchScore, IndividualMatch } from "../types";
import { MONTHS, MONTH_COLORS } from "../data/constants";
import {
  getMonthKey,
  getWeekKey,
  weekendLabel,
  formatDayHeader,
} from "../utils/date-helpers";
import MatchRow from "./MatchRow";
import MatchDetail from "./MatchDetail";

interface TimelineViewProps {
  matches: Match[];
  teamMap: Map<string, Team>;
  scores: Map<string, MatchScore>;
  onSaveScore: (
    teamId: string,
    matchDate: string,
    matchTime: string,
    individualMatches: Omit<IndividualMatch, "id" | "match_score_id">[]
  ) => Promise<{ success: boolean; error?: string }>;
  allMatches?: Match[];
  favorites?: Set<string>;
  toggleFavorite?: (key: string) => void;
}

interface GroupedData {
  months: {
    key: string;
    weeks: {
      key: string;
      dates: string[];
      days: {
        date: string;
        day: string;
        matches: Match[];
      }[];
      matchCount: number;
    }[];
    matchCount: number;
  }[];
}

export default function TimelineView({ matches, teamMap, scores, onSaveScore, allMatches, favorites, toggleFavorite }: TimelineViewProps) {
  const [openMatch, setOpenMatch] = useState<string | null>(null);

  const favoriteMatches = useMemo(() => {
    if (!favorites || favorites.size === 0 || !allMatches) return [];
    return allMatches
      .filter((m) => favorites.has(`${m.teamId}-${m.date}-${m.time}`))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [allMatches, favorites]);

  const grouped = useMemo<GroupedData>(() => {
    // Sort matches
    const sorted = [...matches].sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    );

    // Group: month → week → date
    const monthMap = new Map<
      string,
      Map<string, Map<string, { day: string; matches: Match[] }>>
    >();

    for (const m of sorted) {
      const mk = getMonthKey(m.date);
      const wk = getWeekKey(m.date);

      if (!monthMap.has(mk)) monthMap.set(mk, new Map());
      const weeks = monthMap.get(mk)!;
      if (!weeks.has(wk)) weeks.set(wk, new Map());
      const dates = weeks.get(wk)!;
      if (!dates.has(m.date)) dates.set(m.date, { day: m.day, matches: [] });
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
              matchCount: dayArr.reduce((s, d) => s + d.matches.length, 0),
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

  const toggleMatch = (key: string) => {
    setOpenMatch((prev) => (prev === key ? null : key));
  };

  const matchKey = (m: Match) => `${m.teamId}-${m.date}-${m.time}`;

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
                  <MatchRow
                    match={m}
                    team={team}
                    isOpen={openMatch === key}
                    onClick={() => toggleMatch(key)}
                    score={scores.get(key)}
                    isFavorite={true}
                    onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite?.(key); }}
                  />
                  {openMatch === key && (
                    <MatchDetail
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
        const colors = MONTH_COLORS[month.key];
        const monthName = MONTHS[month.key] || month.key;

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
                {monthName} 2026
              </h2>
              <span
                className="text-xs font-semibold"
                style={{ color: colors?.label }}
              >
                {month.matchCount} Spiele
              </span>
            </div>

            {/* Weeks */}
            <div className="space-y-5">
              {month.weeks.map((week, weekIdx) => (
                <div
                  key={week.key}
                  className="rounded-xl border overflow-hidden"
                  style={{
                    backgroundColor: colors?.weekBgs?.[weekIdx % colors.weekBgs.length] || colors?.bg,
                    borderColor: colors?.border,
                  }}
                >
                  {/* Weekend header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b"
                    style={{ borderColor: colors?.border }}
                  >
                    <span className="text-xs font-semibold text-slate-300">
                      📅 {weekendLabel(week.dates)}
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

                  {/* Days */}
                  <div className="divide-y" style={{ borderColor: colors?.border + "60" }}>
                    {week.days.map((dayData) => (
                      <div key={dayData.date}>
                        {/* Day header */}
                        <div
                          className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border-b"
                          style={{
                            color: colors?.accent,
                            backgroundColor: colors?.accent + "10",
                            borderColor: colors?.border + "40",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {formatDayHeader(dayData.date, dayData.day)}
                          {dayData.matches.length >= 2 && (
                            <span className="ml-2 text-[9px] font-bold bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full">
                              {dayData.matches.length}
                            </span>
                          )}
                        </div>

                        {/* Matches */}
                        <div className="py-1">
                          {dayData.matches.map((m) => {
                            const key = matchKey(m);
                            const team = teamMap.get(m.teamId);
                            if (!team) return null;
                            return (
                              <div key={key}>
                                <MatchRow
                                  match={m}
                                  team={team}
                                  isOpen={openMatch === key}
                                  onClick={() => toggleMatch(key)}
                                  score={scores.get(key)}
                                  isFavorite={favorites?.has(key)}
                                  onToggleFavorite={toggleFavorite ? (e) => { e.stopPropagation(); toggleFavorite(key); } : undefined}
                                />
                                {openMatch === key && (
                                  <MatchDetail
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
                    ))}
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
