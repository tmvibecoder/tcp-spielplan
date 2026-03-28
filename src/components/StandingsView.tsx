import { useState } from "react";
import type { LeagueStandings } from "../types";

interface StandingsViewProps {
  standings: LeagueStandings[];
  activeTeamIds?: Set<string>;
}

function parseResult(r: string): "win" | "loss" | "draw" | "none" {
  if (r === "***" || r === "0:0") return "none";
  const [a, b] = r.split(":").map(Number);
  if (a > b) return "win";
  if (a < b) return "loss";
  return "draw";
}

function resultColor(r: string): string {
  const type = parseResult(r);
  switch (type) {
    case "win":  return "bg-emerald-900/60 text-emerald-200";
    case "loss": return "bg-red-900/50 text-red-300";
    case "draw": return "bg-amber-900/40 text-amber-200";
    default:     return "bg-slate-800/50 text-slate-500";
  }
}

function rankBadge(rank: number): string {
  switch (rank) {
    case 1: return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
    case 2: return "bg-slate-400/15 text-slate-300 border-slate-400/30";
    case 3: return "bg-amber-700/20 text-amber-400 border-amber-600/30";
    default: return "bg-slate-800/50 text-slate-400 border-slate-600/30";
  }
}

export default function StandingsView({ standings }: StandingsViewProps) {
  const [expandedLeague, setExpandedLeague] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-extrabold text-slate-200 flex items-center gap-2">
        <span className="text-base">📊</span> Tabellen
      </h2>

      {standings.map((league) => {
        const isExpanded = expandedLeague === league.leagueName;
        const ownEntry = league.entries.find((e) => e.isOwnClub);

        return (
          <div
            key={league.leagueName}
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor: league.teamColor + "30",
              backgroundColor: league.teamColor + "08",
            }}
          >
            {/* League Header */}
            <button
              onClick={() => setExpandedLeague(isExpanded ? null : league.leagueName)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border"
                  style={{
                    backgroundColor: league.teamColor + "18",
                    borderColor: league.teamColor + "40",
                    color: league.teamColor,
                  }}
                >
                  {league.teamLabel}
                </span>
                <span className="text-sm text-slate-400">{league.leagueName}</span>
              </div>
              <div className="flex items-center gap-3">
                {ownEntry && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${rankBadge(ownEntry.rank)}`}>
                    Platz {ownEntry.rank}
                  </span>
                )}
                <span className="text-slate-500 text-xs">{isExpanded ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Standings Table */}
            {isExpanded && (
              <div className="px-3 pb-3 animate-[fadeIn_200ms_ease-out]">
                {/* Main standings */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 uppercase tracking-wider">
                        <th className="py-2 px-2 text-left w-8">#</th>
                        <th className="py-2 px-2 text-left">Verein</th>
                        <th className="py-2 px-2 text-center w-14">PKT</th>
                        <th className="py-2 px-2 text-center w-14">MP</th>
                        <th className="py-2 px-2 text-center w-16">Sätze</th>
                      </tr>
                    </thead>
                    <tbody>
                      {league.entries.map((entry) => (
                        <tr
                          key={entry.rank}
                          className={`border-t border-slate-700/30 ${
                            entry.isOwnClub ? "bg-sky-900/20" : ""
                          }`}
                        >
                          <td className="py-2 px-2">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border ${rankBadge(entry.rank)}`}>
                              {entry.rank}
                            </span>
                          </td>
                          <td className={`py-2 px-2 font-medium ${entry.isOwnClub ? "text-sky-300" : "text-slate-200"}`}>
                            {entry.club}
                            {entry.isOwnClub && (
                              <span className="ml-1.5 text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded-full font-bold">
                                TCP
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-slate-200">{entry.points}</td>
                          <td className="py-2 px-2 text-center text-slate-300">{entry.matchPoints}</td>
                          <td className="py-2 px-2 text-center text-slate-400">{entry.sets}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cross-table results */}
                <div className="mt-4 pt-3 border-t border-slate-700/30">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 px-1">
                    Kreuztabelle
                  </p>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full">
                      <thead>
                        <tr>
                          <th className="py-1.5 px-1 text-left text-slate-500 min-w-[120px]"></th>
                          {league.entries.map((e, i) => (
                            <th
                              key={i}
                              className={`py-1.5 px-1 text-center min-w-[42px] ${
                                e.isOwnClub ? "text-sky-400" : "text-slate-500"
                              }`}
                              title={e.club}
                            >
                              {i + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {league.entries.map((row, ri) => (
                          <tr key={ri} className={row.isOwnClub ? "bg-sky-900/10" : ""}>
                            <td className={`py-1 px-1 font-medium truncate max-w-[140px] ${
                              row.isOwnClub ? "text-sky-300" : "text-slate-300"
                            }`}>
                              <span className="text-slate-600 mr-1">{row.rank}.</span>
                              {row.club.length > 22 ? row.club.slice(0, 20) + "…" : row.club}
                            </td>
                            {row.crossResults.map((result, ci) => (
                              <td key={ci} className="py-1 px-0.5 text-center">
                                {result === "***" ? (
                                  <span className="inline-block w-9 h-6 leading-6 rounded bg-slate-800/60 text-slate-600">–</span>
                                ) : result === "0:0" ? (
                                  <span className="inline-block w-9 h-6 leading-6 rounded bg-slate-800/40 text-slate-600 text-[10px]">n.a.</span>
                                ) : (
                                  <span className={`inline-block w-9 h-6 leading-6 rounded font-bold text-[11px] ${resultColor(result)}`}>
                                    {result}
                                  </span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {standings.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">Noch keine Tabellen verfügbar.</p>
          <p className="text-xs mt-1">Ergebnisse werden eingetragen sobald die Saison läuft.</p>
        </div>
      )}
    </div>
  );
}
