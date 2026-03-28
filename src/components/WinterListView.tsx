import { useMemo } from "react";
import type { WinterMatch, Team } from "../types";
import { WINTER_MONTHS, WINTER_MONTH_COLORS } from "../data/winter-2526";
import { getMonthKey, getWeekKey, weekendLabel, formatDate } from "../utils/date-helpers";

interface WinterListViewProps {
  matches: WinterMatch[];
  teamMap: Map<string, Team>;
}

interface ListGroup {
  type: "month" | "weekend" | "match";
  monthKey?: string;
  weekKey?: string;
  weekIdx?: number;
  dates?: string[];
  matchCount?: number;
  match?: WinterMatch;
}

function scoreResult(mp: string): "win" | "loss" | "draw" {
  const [h, a] = mp.split(":").map(Number);
  if (h > a) return "win";
  if (h < a) return "loss";
  return "draw";
}

function getYearFromMonth(monthKey: string): string {
  return monthKey.split("-")[0];
}

export default function WinterListView({ matches, teamMap }: WinterListViewProps) {
  const rows = useMemo<ListGroup[]>(() => {
    const sorted = [...matches].sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    );

    const result: ListGroup[] = [];
    let lastMonth = "";
    let lastWeek = "";
    let weekIdx = 0;

    const weekData = new Map<string, { dates: Set<string>; count: number }>();
    for (const m of sorted) {
      const wk = getWeekKey(m.date);
      if (!weekData.has(wk)) weekData.set(wk, { dates: new Set(), count: 0 });
      weekData.get(wk)!.dates.add(m.date);
      weekData.get(wk)!.count++;
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

  const dateMatchCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of matches) {
      counts.set(m.date, (counts.get(m.date) || 0) + 1);
    }
    return counts;
  }, [matches]);

  const resultStyles = {
    win: "bg-emerald-900/50 text-emerald-200 border-emerald-500/30",
    loss: "bg-red-900/40 text-red-300 border-red-500/30",
    draw: "bg-amber-900/40 text-amber-200 border-amber-500/30",
  };

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
            <th className="text-right px-3 py-2">Ergebnis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            if (row.type === "month") {
              const colors = WINTER_MONTH_COLORS[row.monthKey!];
              const monthName = WINTER_MONTHS[row.monthKey!] || row.monthKey!;
              const year = getYearFromMonth(row.monthKey!);
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
                    {monthName} {year}
                  </td>
                </tr>
              );
            }

            if (row.type === "weekend") {
              const colors = WINTER_MONTH_COLORS[row.monthKey!];
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
                        {weekendLabel(row.dates || [])}
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
            const key = `${m.teamId}-${m.date}-${m.time}`;
            const team = teamMap.get(m.teamId);
            if (!team) return null;
            const opponent = m.isHome ? m.away : m.home;
            const multiMatch = (dateMatchCount.get(m.date) || 0) >= 2;
            const rowColors = WINTER_MONTH_COLORS[row.monthKey!];
            const rowWeekBg = rowColors?.weekBgs?.[(row.weekIdx || 0) % (rowColors?.weekBgs?.length || 1)];

            const isPlayed = m.status === "played";
            const result = isPlayed ? (
              m.isHome ? scoreResult(m.mp) : scoreResult(m.mp.split(":").reverse().join(":"))
            ) : null;
            const [mpH, mpA] = m.mp.split(":").map(Number);
            const tcpMp = m.isHome ? `${mpH}:${mpA}` : `${mpA}:${mpH}`;

            return (
              <tr
                key={key}
                className="hover:bg-slate-700/30 transition-colors"
                style={{ backgroundColor: multiMatch ? undefined : rowWeekBg }}
              >
                <td className="px-3 py-2 text-xs text-slate-400 w-24 shrink-0">
                  {m.day} {formatDate(m.date)}
                </td>
                <td className="px-3 py-2 text-xs text-slate-400 w-14 shrink-0 font-mono">
                  {m.time}
                </td>
                <td className="px-3 py-2 shrink-0">
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
                </td>
                <td className="px-2 py-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      m.isHome
                        ? "bg-green-900/60 text-green-200"
                        : "bg-yellow-900/60 text-yellow-200"
                    }`}
                  >
                    {m.isHome ? "H" : "A"}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm text-slate-200 truncate min-w-0">
                  {opponent}
                </td>
                <td className="px-3 py-2 text-right shrink-0">
                  {isPlayed && result ? (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${resultStyles[result]}`}>
                      {tcpMp}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">offen</span>
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
