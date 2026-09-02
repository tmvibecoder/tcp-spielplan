import { useMemo, useState, useRef, useEffect } from "react";
import type { Match, Team, MatchScore, IndividualMatch, LeagueStandings, MonthColor } from "../types";
import { resolveMatchResult } from "../data/results";
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
  /** Alle Tabellen der Saison (ungefiltert) — liefern die offiziellen Ergebnisse */
  standings: LeagueStandings[];
  months: Record<string, string>;
  monthColors: Record<string, MonthColor>;
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
  provisionalTimesUntil?: string;
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

const matchKey = (m: Match) => `${m.teamId}-${m.date}-${m.time}`;

export default function TimelineView({
  matches,
  teamMap,
  standings,
  months,
  monthColors,
  scores,
  onSaveScore,
  allMatches,
  favorites,
  toggleFavorite,
  provisionalTimesUntil,
}: TimelineViewProps) {
  const [openMatch, setOpenMatch] = useState<string | null>(null);

  const favoriteMatches = useMemo(() => {
    if (!favorites || favorites.size === 0 || !allMatches) return [];
    return allMatches
      .filter((m) => favorites.has(matchKey(m)))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [allMatches, favorites]);

  const grouped = useMemo<GroupedData>(() => {
    const sorted = [...matches].sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    );

    // Gruppierung: Monat → Wochenende → Tag
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

    const monthArr = [...monthMap.entries()]
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

    return { months: monthArr };
  }, [matches]);

  // Heutiges Datum als YYYY-MM-DD (lokale Zeit), passend zum Match-Datumsformat.
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }, []);

  // Wochenende, das beim Laden angezeigt werden soll: das erste, das heute noch
  // läuft oder in der Zukunft liegt. Ist die Saison vorbei, das zuletzt gespielte.
  const targetWeekKey = useMemo(() => {
    let lastKey: string | null = null;
    for (const month of grouped.months) {
      for (const week of month.weeks) {
        lastKey = week.key;
        const weekEnd = week.dates[week.dates.length - 1];
        if (weekEnd >= todayStr) return week.key;
      }
    }
    return lastKey;
  }, [grouped, todayStr]);

  // Einmalig beim ersten Laden zum Ziel-Wochenende scrollen
  // (nicht bei Filterwechseln, damit die Ansicht dann nicht wegspringt).
  const targetWeekRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);
  useEffect(() => {
    if (hasScrolled.current || !targetWeekRef.current) return;
    hasScrolled.current = true;
    requestAnimationFrame(() => {
      targetWeekRef.current?.scrollIntoView({ block: "start" });
    });
  }, [targetWeekKey]);

  const toggleMatch = (key: string) => {
    setOpenMatch((prev) => (prev === key ? null : key));
  };

  const renderMatch = (m: Match, keyPrefix = "") => {
    const key = matchKey(m);
    const team = teamMap.get(m.teamId);
    if (!team) return null;
    const result = resolveMatchResult(m, team, standings);
    const isOpen = openMatch === key;
    return (
      <div key={keyPrefix + key}>
        <MatchRow
          match={m}
          team={team}
          isOpen={isOpen}
          onClick={() => toggleMatch(key)}
          result={result}
          isPast={m.date < todayStr}
          score={scores.get(key)}
          isFavorite={favorites?.has(key)}
          onToggleFavorite={
            toggleFavorite
              ? (e) => {
                  e.stopPropagation();
                  toggleFavorite(key);
                }
              : undefined
          }
        />
        {isOpen && (
          <MatchDetail
            match={m}
            team={team}
            onClose={() => setOpenMatch(null)}
            result={result}
            score={scores.get(key)}
            onSaveScore={onSaveScore}
            provisionalTimesUntil={provisionalTimesUntil}
            todayStr={todayStr}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Meine Spiele — markierte Begegnungen oben angepinnt */}
      {favoriteMatches.length > 0 && (
        <div>
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
            style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", borderLeft: "4px solid #f59e0b" }}
          >
            <h2 className="text-lg font-extrabold text-amber-200">★ Meine Spiele</h2>
            <span className="text-xs font-semibold text-amber-300">{favoriteMatches.length}</span>
          </div>
          <div className="space-y-1 bg-amber-900/10 border border-amber-500/20 rounded-xl p-2">
            {favoriteMatches.map((m) => renderMatch(m, "fav-"))}
          </div>
        </div>
      )}

      {grouped.months.map((month) => {
        const colors = monthColors[month.key];
        const monthName = months[month.key] || month.key;
        const year = month.key.split("-")[0];

        return (
          <div key={month.key}>
            {/* Monats-Kopf */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl mb-5"
              style={{
                backgroundColor: colors?.headerBg,
                borderLeft: `4px solid ${colors?.accent}`,
              }}
            >
              <h2 className="text-lg font-extrabold" style={{ color: colors?.label }}>
                {monthName} {year}
              </h2>
              <span className="text-xs font-semibold" style={{ color: colors?.label }}>
                {month.matchCount} {month.matchCount === 1 ? "Spiel" : "Spiele"}
              </span>
            </div>

            {/* Wochenenden */}
            <div className="space-y-5">
              {month.weeks.map((week, weekIdx) => {
                const isTarget = week.key === targetWeekKey;
                return (
                  <div
                    key={week.key}
                    ref={isTarget ? targetWeekRef : undefined}
                    className="rounded-xl border overflow-hidden scroll-mt-24"
                    style={{
                      backgroundColor: colors?.weekBgs?.[weekIdx % colors.weekBgs.length] || colors?.bg,
                      borderColor: colors?.border,
                    }}
                  >
                    <div
                      className="flex items-center justify-between px-4 py-2 border-b"
                      style={{ borderColor: colors?.border }}
                    >
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                        📅 {weekendLabel(week.dates)}
                        {isTarget && week.dates[week.dates.length - 1] >= todayStr && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
                            nächstes
                          </span>
                        )}
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

                    <div className="divide-y" style={{ borderColor: colors?.border + "60" }}>
                      {week.days.map((dayData) => (
                        <div key={dayData.date}>
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
                          <div className="py-1">{dayData.matches.map((m) => renderMatch(m))}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {grouped.months.length === 0 && (
        <p className="text-center text-slate-500 py-12">
          Keine Spiele für die ausgewählten Konkurrenzen.
        </p>
      )}
    </div>
  );
}
