import { useMemo, useState } from "react";
import type { Match, Team, MatchScore, IndividualMatch } from "../types";
import ScoreBadge from "./ScoreBadge";
import { MONTHS, MONTH_COLORS } from "../data/constants";
import { getMonthKey, getWeekKey, weekendLabel, formatDate } from "../utils/date-helpers";
import MatchDetail from "./MatchDetail";

interface ListViewProps {
  matches: Match[];
  teamMap: Map<string, Team>;
  scores: Map<string, MatchScore>;
  onSaveScore: (
    teamId: string,
    matchDate: string,
    matchTime: string,
    individualMatches: Omit<IndividualMatch, "id" | "match_score_id">[]
  ) => Promise<{ success: boolean; error?: string }>;
}

interface ListGroup {
  type: "month" | "weekend" | "match";
  monthKey?: string;
  weekKey?: string;
  weekIdx?: number;
  dates?: string[];
  matchCount?: number;
  match?: Match;
}

export default function ListView({ matches, teamMap, scores, onSaveScore }: ListViewProps) {
  const [openMatch, setOpenMatch] = useState<string | null>(null);

  const rows = useMemo<ListGroup[]>(() => {
    const sorted = [...matches].sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    );

    const result: ListGroup[] = [];
    let lastMonth = "";
    let lastWeek = "";
    let weekIdx = 0;

    // Pre-compute weekend match counts and dates
    const weekData = new Map<string, { dates: Set<string>; count: number }>();
    for (const m of sorted) {
      const wk = getWeekKey(m.date);
      if (!weekData.has(wk)) weekData.set(wk, { dates: new Set(), count: 0 });
      weekData.get(wk)!.dates.add(m.date);
      weekData.get(wk)!.count++;
    }

    // Pre-compute date match counts for tinting
    const dateCount = new Map<string, number>();
    for (const m of sorted) {
      dateCount.set(m.date, (dateCount.get(m.date) || 0) + 1);
    }

    for (const m of sorted) {
      const mk = getMonthKey(m.date);
      const wk = getWeekKey(m.date);

      if (mk !== lastMonth) {
        result.push({ type: "month", monthKey: mk });
        lastMonth = mk;
        lastWeek = "";
        weekIdx = 0;
      }

      if (wk !== lastWeek) {
        const wd = weekData.get(wk)!;
        result.push({
          type: "weekend",
          weekKey: wk,
          weekIdx,
          monthKey: mk,
          dates: [...wd.dates],
          matchCount: wd.count,
        });
        lastWeek = wk;
        weekIdx++;
      }

      result.push({ type: "match", match: m, monthKey: mk, weekIdx: weekIdx - 1 });
    }

    return result;
  }, [matches]);

  const matchKey = (m: Match) => `${m.teamId}-${m.date}-${m.time}`;

  const toggleMatch = (key: string) => {
    setOpenMatch((prev) => (prev === key ? null : key));
  };

  // Count matches per date for tinting
  const dateMatchCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of matches) {
      counts.set(m.date, (counts.get(m.date) || 0) + 1);
    }
    return counts;
  }, [matches]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] text-slate-500 uppercase tracking-wider">
            <th className="text-left px-3 py-2">Datum</th>
            <th className="text-left px-3 py-2">Zeit</th>
            <th className="text-left px-3 py-2">Team</th>
            <th className="text-left px-3 py-2">H/A</th>
            <th className="text-left px-3 py-2">Gegner</th>
            <th className="px-3 py-2 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            if (row.type === "month") {
              const colors = MONTH_COLORS[row.monthKey!];
              const monthName = MONTHS[row.monthKey!] || row.monthKey!;
              return (
                <tr key={`m-${i}`}>
                  <td
                    colSpan={6}
                    className="px-4 py-2 font-extrabold text-base"
                    style={{
                      backgroundColor: colors?.headerBg,
                      color: colors?.label,
                      borderLeft: `4px solid ${colors?.accent}`,
                    }}
                  >
                    {monthName} 2026
                  </td>
                </tr>
              );
            }

            if (row.type === "weekend") {
              const colors = MONTH_COLORS[row.monthKey!];
              const wBg = colors?.weekBgs?.[(row.weekIdx || 0) % (colors?.weekBgs?.length || 1)] || colors?.bg;
              return (
                <tr key={`w-${i}`}>
                  <td
                    colSpan={6}
                    className="px-4 py-1.5"
                    style={{ backgroundColor: wBg }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">
                        📅 {weekendLabel(row.dates || [])}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: colors?.accent + "20",
                          color: colors?.accent,
                        }}
                      >
                        {row.matchCount}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            }

            // Match row
            const m = row.match!;
            const key = matchKey(m);
            const team = teamMap.get(m.teamId);
            if (!team) return null;
            const opponent = m.isHome ? m.away : m.home;
            const multiMatch = (dateMatchCount.get(m.date) || 0) >= 2;
            const rowColors = MONTH_COLORS[row.monthKey!];
            const rowWeekBg = rowColors?.weekBgs?.[(row.weekIdx || 0) % (rowColors?.weekBgs?.length || 1)];

            return (
              <tr key={key}>
                <td colSpan={6} className="p-0">
                  <button
                    onClick={() => toggleMatch(key)}
                    className="w-full flex items-center gap-0 text-left hover:bg-slate-700/30 transition-colors"
                    style={{ backgroundColor: multiMatch ? undefined : rowWeekBg }}
                  >
                    <span className="px-3 py-2 text-xs text-slate-400 w-24 shrink-0">
                      {m.day} {formatDate(m.date)}
                    </span>
                    <span className="px-3 py-2 text-xs text-slate-400 w-14 shrink-0 font-mono">
                      {m.time}
                    </span>
                    <span className="px-3 py-2 shrink-0">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border"
                        style={{
                          borderColor: team.color + "40",
                          backgroundColor: team.color + "18",
                          color: team.color,
                        }}
                      >
                        {team.emoji} {team.shortLabel}
                      </span>
                    </span>
                    <span className="px-2 py-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          m.isHome
                            ? "bg-green-900/60 text-green-200"
                            : "bg-yellow-900/60 text-yellow-200"
                        }`}
                      >
                        {m.isHome ? "H" : "A"}
                      </span>
                    </span>
                    <span className="px-3 py-2 text-sm text-slate-200 truncate flex-1 min-w-0">
                      {opponent}
                    </span>
                    {scores.get(key) && (
                      <span className="px-1 py-2 shrink-0">
                        <ScoreBadge score={scores.get(key)!} isHome={m.isHome} />
                      </span>
                    )}
                    <span className="px-3 py-2 text-xs text-slate-500 shrink-0">
                      {openMatch === key ? "▲" : "▼"}
                    </span>
                  </button>
                  {openMatch === key && (
                    <MatchDetail
                      match={m}
                      team={team}
                      onClose={() => setOpenMatch(null)}
                      score={scores.get(key)}
                      onSaveScore={onSaveScore}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {matches.length === 0 && (
        <p className="text-center text-slate-500 py-12">
          Keine Spiele für die ausgewählten Mannschaften.
        </p>
      )}
    </div>
  );
}
