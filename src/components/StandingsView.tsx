import { useState } from "react";
import type { LeagueStandings, IndividualMatch } from "../types";
import SpielberichtDrawer from "./SpielberichtDrawer";
import { getSpielbericht } from "../data/spielberichte";
import type { SpielberichtMeeting } from "../utils/spielbericht";
import { getTeamStats, emptyTeamStats } from "../data/player-stats";
import { getMeldeliste } from "../data/meldelisten";
import TeamStatsDetail from "./TeamStatsDetail";

interface StandingsViewProps {
  standings: LeagueStandings[];
  /** z. B. "Sommer 2026" */
  seasonLabel?: string;
  /** Datum des letzten BTV-Abgleichs, z. B. "19.08.2026" */
  stand?: string;
}

interface SelectedMeeting {
  meeting: SpielberichtMeeting;
  matches: IndividualMatch[] | null;
  example?: boolean;
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
  // Best-of-Konzept: Das Medaillen-Icon (rankMedal) trägt das eigentliche Signal,
  // die warme/edle Tönung ist nur Garnitur. Dadurch hebt sich der Platz sicher ab,
  // ohne mit den Mannschaftsfarben (z.B. Damen 40/50 orange) zu verschwimmen.
  switch (rank) {
    case 1: return "bg-yellow-400/20 text-amber-200 border-yellow-400/70"; // Gold
    case 2: return "bg-zinc-200/20 text-zinc-100 border-zinc-200/70";      // helles Silber (statt unsichtbarem Grau)
    case 3: return "bg-amber-700/30 text-amber-300 border-amber-600/70";   // Bronze
    default: return "bg-slate-800/50 text-slate-400 border-slate-600/30";
  }
}

function rankMedal(rank: number): string {
  switch (rank) {
    case 1: return "🥇";
    case 2: return "🥈";
    case 3: return "🥉";
    default: return "";
  }
}

export default function StandingsView({ standings, seasonLabel, stand }: StandingsViewProps) {
  const [expandedLeague, setExpandedLeague] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedMeeting | null>(null);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  function openCell(league: LeagueStandings, rowClub: string, colClub: string, result: string) {
    const [a, b] = result.split(":").map(Number);
    const bericht = getSpielbericht(league.leagueName, rowClub, colClub);
    const leagueDisplay = `${league.teamLabel} · ${league.leagueName}`;
    setSelected({
      // Bei vorhandenem Bericht den kanonischen Heim/Gast-Stand (echtes Spiel) zeigen,
      // sonst Zellen-Orientierung (Zeile=Heim) + Zellenergebnis.
      meeting: bericht
        ? {
            league: leagueDisplay,
            homeClub: bericht.homeClub,
            awayClub: bericht.awayClub,
            finalHome: bericht.finalHome,
            finalAway: bericht.finalAway,
            date: bericht.date,
            day: bericht.day,
          }
        : { league: leagueDisplay, homeClub: rowClub, awayClub: colClub, finalHome: a, finalAway: b },
      matches: bericht?.matches ?? null,
      example: bericht?.example,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-1">
        <h2 className="text-base font-extrabold text-slate-200 whitespace-nowrap">
          Tabellen{seasonLabel ? <span className="font-semibold text-slate-400"> {seasonLabel}</span> : null}
        </h2>
        {stand && (
          <span className="text-[11px] text-slate-500 whitespace-nowrap" title="Datum des letzten Abgleichs mit den offiziellen BTV-Tabellen">
            BTV-Stand {stand}
          </span>
        )}
      </div>

      {standings.length === 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 px-4 py-8 text-center text-sm text-slate-400">
          Keine Konkurrenz ausgewählt. Oben über „Konkurrenzen“ mindestens eine Mannschaft einschalten.
        </div>
      )}

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
            {/* League Header: Zeile 1 Mannschaft · Platz · Pfeil, Zeile 2 Liga */}
            <button
              onClick={() => {
                setExpandedLeague(isExpanded ? null : league.leagueName);
                setSelectedClub(null);
              }}
              aria-expanded={isExpanded}
              className="w-full px-4 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap"
                  style={{
                    backgroundColor: league.teamColor + "18",
                    borderColor: league.teamColor + "40",
                    color: league.teamColor,
                  }}
                >
                  {league.teamLabel}
                </span>
                <span className="flex-1" />
                {ownEntry && (
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${rankBadge(ownEntry.rank)}`}>
                    {rankMedal(ownEntry.rank) && <span aria-hidden="true">{rankMedal(ownEntry.rank)}</span>}
                    Platz {ownEntry.rank}
                    <span className="font-normal text-slate-500">/{league.entries.length}</span>
                  </span>
                )}
                <span className="text-slate-500 text-xs w-4 text-center">{isExpanded ? "▲" : "▼"}</span>
              </div>
              <div className="mt-1 text-xs text-slate-400 truncate">{league.leagueName}</div>
            </button>

            {/* Standings Table */}
            {isExpanded && (
              <div className="px-3 pb-3 animate-[fadeIn_200ms_ease-out]">
                {selectedClub ? (
                  (() => {
                    const stats = getTeamStats(league.leagueName, selectedClub);
                    const meldeliste = getMeldeliste(league.leagueName, selectedClub);
                    const rank = league.entries.find(
                      (e) => e.club === selectedClub
                    )?.rank;
                    if (stats || meldeliste) {
                      return (
                        <TeamStatsDetail
                          team={stats ?? emptyTeamStats(league.leagueName, selectedClub)}
                          rank={rank}
                          accentColor={league.teamColor}
                          onBack={() => setSelectedClub(null)}
                          meldeliste={meldeliste}
                        />
                      );
                    }
                    return (
                      <div className="animate-[fadeIn_200ms_ease-out]">
                        <button
                          onClick={() => setSelectedClub(null)}
                          className="mb-3 rounded-lg border border-slate-600/50 bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-slate-700/60"
                        >
                          ‹ Tabelle
                        </button>
                        <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-6 text-center">
                          <p className="text-sm font-semibold text-slate-300">
                            {selectedClub}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Für diese Mannschaft sind noch keine Spielberichte
                            erfasst.
                          </p>
                          <p className="mt-1 text-[11px] text-slate-600">
                            Sobald die Begegnungen als Spielbericht (Einzel/Doppel)
                            eingetragen sind, erscheint hier die Spieler-Statistik.
                          </p>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <>
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
                        <th className="w-5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {league.entries.map((entry) => (
                        <tr
                          key={entry.rank}
                          onClick={() => setSelectedClub(entry.club)}
                          className={`border-t border-slate-700/30 cursor-pointer hover:bg-white/[0.04] transition-colors ${
                            entry.isOwnClub ? "bg-sky-900/20" : ""
                          }`}
                        >
                          <td className="py-2 px-2">
                            <span className="inline-flex items-center gap-1.5">
                              {rankMedal(entry.rank) && (
                                <span className="text-[15px] leading-none" aria-hidden="true">
                                  {rankMedal(entry.rank)}
                                </span>
                              )}
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border ${rankBadge(entry.rank)}`}>
                                {entry.rank}
                              </span>
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
                          <td className="py-2 pr-2 text-center text-sky-500/70">›</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cross-table results */}
                <div className="mt-4 pt-3 border-t border-slate-700/30">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 px-1">
                    Kreuztabelle
                  </p>
                  <p className="text-[11px] text-slate-500 mb-2 px-1">
                    Tipp: auf ein Ergebnis tippen für den Spielbericht (Einzel/Doppel).
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
                                  <button
                                    type="button"
                                    onClick={() => openCell(league, row.club, league.entries[ci].club, result)}
                                    title={`${row.club} – ${league.entries[ci].club}: Spielbericht öffnen`}
                                    className={`inline-block w-9 h-6 leading-6 rounded font-bold text-[11px] cursor-pointer transition hover:ring-2 hover:ring-white/40 ${resultColor(result)}`}
                                  >
                                    {result}
                                  </button>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      <SpielberichtDrawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        meeting={selected?.meeting ?? null}
        matches={selected?.matches ?? null}
        example={selected?.example}
      />
    </div>
  );
}
