import React, { useMemo, useState } from "react";
import type { WinterMatch, Team, MatchScore, IndividualMatch } from "../types";
import { WINTER_MONTHS, WINTER_MONTH_COLORS } from "../data/winter-2526";
import { getMonthKey, getWeekKey, weekendLabel, formatDate, formatDateFull } from "../utils/date-helpers";
import LiveScorePanel from "./LiveScorePanel";

interface WinterListViewProps {
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

function WinterListMatchDetail({
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
    <tr>
      <td colSpan={6} className="px-0 py-0">
        <div className="animate-fadeIn bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mx-2 my-2">
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

          {/* Live Score Panel */}
          <LiveScorePanel
            match={match}
            team={team}
            score={score}
            onSave={onSaveScore}
          />
        </div>
      </td>
    </tr>
  );
}

export default function WinterListView({ matches, teamMap, scores, onSaveScore, allMatches, favorites, toggleFavorite }: WinterListViewProps) {
  const [openMatch, setOpenMatch] = useState<string | null>(null);

  const favoriteMatches = useMemo(() => {
    if (!favorites || favorites.size === 0 || !allMatches) return [];
    return allMatches
      .filter((m) => favorites.has(`${m.teamId}-${m.date}-${m.time}`))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [allMatches, favorites]);

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

  const matchKey = (m: WinterMatch) => `${m.teamId}-${m.date}-${m.time}`;
  const toggleMatch = (key: string) =>
    setOpenMatch((prev) => (prev === key ? null : key));

  return (
    <div className="overflow-x-auto">
      {/* Meine Spiele — Favorited matches pinned to top */}
      {favoriteMatches.length > 0 && (
        <div className="mb-6">
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
            style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", borderLeft: "4px solid #f59e0b" }}
          >
            <h2 className="text-lg font-extrabold text-amber-200">★ Meine Spiele</h2>
            <span className="text-xs font-semibold text-amber-300">{favoriteMatches.length}</span>
          </div>
          <div className="space-y-1 bg-amber-900/10 border border-amber-500/20 rounded-xl p-2">
            {favoriteMatches.map((m) => {
              const key = matchKey(m);
              const team = teamMap.get(m.teamId);
              if (!team) return null;
              const opponent = m.isHome ? m.away : m.home;
              const isPlayed = m.status === "played";
              const [mH, mA] = m.mp.split(":").map(Number);
              const fTcpMp = m.isHome ? `${mH}:${mA}` : `${mA}:${mH}`;
              const fResult = isPlayed ? (m.isHome ? scoreResult(m.mp) : scoreResult(m.mp.split(":").reverse().join(":"))) : null;
              return (
                <div key={`fav-${key}`}>
                  <button
                    onClick={() => toggleMatch(key)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700/30 transition-colors text-left"
                  >
                    <span className="text-xs text-slate-400 w-11 shrink-0 font-mono">{m.time}</span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 border"
                      style={{ borderColor: team.color + "40", backgroundColor: team.color + "18", color: team.color }}
                    >
                      {team.emoji} {team.shortLabel}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${m.isHome ? "bg-green-900/60 text-green-200" : "bg-yellow-900/60 text-yellow-200"}`}>
                      {m.isHome ? "H" : "A"}
                    </span>
                    <span className="text-sm text-slate-200 truncate flex-1 min-w-0">{opponent}</span>
                    {isPlayed && fResult ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${resultStyles[fResult]}`}>{fTcpMp}</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic shrink-0">offen</span>
                    )}
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite?.(key); }}
                      className="shrink-0 text-sm text-amber-400 p-0.5"
                    >★</span>
                    <span className="text-slate-500 text-xs shrink-0">{openMatch === key ? "▲" : "▼"}</span>
                  </button>
                  {openMatch === key && (
                    <WinterListMatchDetail match={m} team={team} onClose={() => setOpenMatch(null)} score={scores.get(key)} onSaveScore={onSaveScore} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
            const key = matchKey(m);
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
            const isOpen = openMatch === key;

            return (
              <React.Fragment key={key}>
                <tr
                  onClick={() => toggleMatch(key)}
                  className="hover:bg-slate-700/30 transition-colors cursor-pointer"
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
                    <div className="flex items-center justify-end gap-1.5">
                      {isPlayed && result ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${resultStyles[result]}`}>
                          {tcpMp}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">offen</span>
                      )}
                      {toggleFavorite && (
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(key); }}
                          className={`text-sm transition-colors ${
                            favorites?.has(key) ? "text-amber-400" : "text-slate-600 hover:text-slate-400"
                          }`}
                        >
                          {favorites?.has(key) ? "★" : "☆"}
                        </span>
                      )}
                      <span className="text-slate-500 text-xs">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>
                  </td>
                </tr>
                {isOpen && (
                  <WinterListMatchDetail
                    match={m}
                    team={team}
                    onClose={() => setOpenMatch(null)}
                    score={scores.get(key)}
                    onSaveScore={onSaveScore}
                  />
                )}
              </React.Fragment>
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
