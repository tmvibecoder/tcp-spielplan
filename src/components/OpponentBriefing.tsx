import { useState } from "react";
import type { SeasonId } from "../types";
import { getMeldeliste } from "../data/meldelisten";
import { getTeamSeason, playerKey, type LineupSlot, type MeetingSummary, type TeamPlayerUsage } from "../data/player-history";
import { ALL_SEASONS } from "../data/seasons";
import LkBadge from "./LkBadge";
import SpielberichtDrawer from "./SpielberichtDrawer";
import type { Spielbericht } from "../utils/spielbericht";

// Gegnerbriefing zu einer TCP-Begegnung: was über den Gegner in der LAUFENDEN
// Saison belegt ist — Meldeliste mit Einsatzhäufigkeit, tatsächliche
// Aufstellungen (auch unsere), bisherige Ergebnisse. Keine Prognosen.
// Farben aus Sicht der jeweils gezeigten Mannschaft (Gegner-Block = Gegnersicht,
// „Unsere Aufstellungen" = Pliening-Sicht). Wird per React.lazy geladen.

interface Props {
  season: SeasonId;
  league: string;
  teamLabel: string;
  accentColor: string;
  opponentClub: string;
  ownClub: string;
  onOpenPlayer?: (key: string) => void;
}

type Tab = "meldeliste" | "aufstellungen" | "ergebnisse";

const seasonLabel = (id: SeasonId) => ALL_SEASONS.find((s) => s.id === id)?.label ?? id;

function fmtDate(iso?: string): string {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}.${m}.`;
}

function ResultPill({ own, opp }: { own: number; opp: number }) {
  const cls = own > opp
    ? "bg-emerald-900/50 text-emerald-200 border-emerald-500/30"
    : own < opp
      ? "bg-red-900/40 text-red-300 border-red-500/30"
      : "bg-amber-900/40 text-amber-200 border-amber-500/30";
  return <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums ${cls}`}>{own}:{opp}</span>;
}

function Slot({ s, onOpenPlayer, club }: { s: LineupSlot; onOpenPlayer?: (key: string) => void; club: string }) {
  return (
    <div className="flex min-w-0 items-baseline gap-1.5 text-[11.5px]">
      <span className="w-5 shrink-0 font-bold text-slate-500">{s.posLabel}</span>
      <span className="min-w-0 truncate">
        {s.players.map((p, i) => (
          <span key={i}>
            {i > 0 && <span className="text-slate-500"> / </span>}
            <button
              type="button"
              onClick={onOpenPlayer ? () => onOpenPlayer(playerKey(club, p.name)) : undefined}
              className={`font-semibold ${s.won ? "text-slate-100" : "text-slate-400"} ${onOpenPlayer ? "hover:text-sky-300" : ""}`}
            >
              {p.name.split(",")[0]}
            </button>
            {p.lk && <LkBadge lk={p.lk} tone="own" className="ml-1" />}
          </span>
        ))}
      </span>
      <span className={`shrink-0 text-[10px] ${s.won ? "text-emerald-400" : "text-red-400/70"}`}>{s.won ? "✓" : "✗"}</span>
    </div>
  );
}

function Lineup({ m, club, onOpenPlayer, onOpen }: { m: MeetingSummary; club: string; onOpenPlayer?: (key: string) => void; onOpen: () => void }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/30">
      <button type="button" onClick={onOpen} className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] font-bold hover:bg-slate-700/30">
        <span className="shrink-0 font-mono text-[11px] font-medium text-slate-400">{fmtDate(m.date)}</span>
        <span className="min-w-0 flex-1 truncate">{m.isHome ? "vs" : "bei"} {m.opponentClub}</span>
        <ResultPill own={m.result.own} opp={m.result.opp} />
      </button>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 px-2.5 pb-1.5">
        {m.singles.map((s) => <Slot key={s.position} s={s} club={club} onOpenPlayer={onOpenPlayer} />)}
      </div>
      <div className="space-y-0.5 px-2.5 pb-2">
        {m.doubles.map((s) => <Slot key={s.position} s={s} club={club} onOpenPlayer={onOpenPlayer} />)}
      </div>
    </div>
  );
}

function usageText(u: TeamPlayerUsage | undefined): string {
  if (!u || (!u.singles && !u.doubles)) return "ohne Einsatz";
  const parts: string[] = [];
  if (u.singles) {
    const pos = [...new Set(u.singlesPositions)].sort((a, b) => a - b);
    const range = pos.length === 1 ? `E${pos[0]}` : `E${pos[0]}–E${pos[pos.length - 1]}`;
    parts.push(`${u.singles}× Einzel · ${range}`);
  }
  if (u.doubles) {
    const partners = [...u.partners.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n.split(",")[0]);
    parts.push(`${u.doubles}× Doppel${partners.length ? " mit " + partners.slice(0, 3).join(", ") : ""}`);
  }
  return parts.join(" · ");
}

export default function OpponentBriefing({ season, league, teamLabel, accentColor, opponentClub, ownClub, onOpenPlayer }: Props) {
  const [tab, setTab] = useState<Tab>("meldeliste");
  const [open, setOpen] = useState<Spielbericht | null>(null);

  const opp = getTeamSeason(season, league, opponentClub);
  const own = getTeamSeason(season, league, ownClub);
  const roster = getMeldeliste(season, league, opponentClub);
  const rosterRows = roster ? [...roster.herren, ...roster.damen] : [];
  // Eingesetzte Spieler ohne Meldelisten-Eintrag (Ersatz aus anderen Mannschaften)
  const extra = [...opp.usage.values()].filter((u) => !rosterRows.some((r) => r.name === u.name));

  const wins = opp.meetings.filter((m) => m.result.own > m.result.opp).length;
  const draws = opp.meetings.filter((m) => m.result.own === m.result.opp).length;
  const losses = opp.meetings.length - wins - draws;

  const tabs: [Tab, string][] = [
    ["meldeliste", "Meldeliste"],
    ["aufstellungen", "Aufstellungen"],
    ["ergebnisse", "Ergebnisse"],
  ];

  return (
    <div className="mt-3 rounded-lg border border-sky-500/25 bg-slate-900/70 p-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-sky-300">🎯 Gegnerbriefing {opponentClub}</p>
        <span className="text-[10px] text-slate-500">{seasonLabel(season)}</span>
      </div>
      <div className="my-2 flex gap-1">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-[12px] font-bold transition-colors ${tab === key ? "text-slate-900" : "bg-slate-800/60 text-slate-400 hover:bg-slate-700/50"}`}
            style={tab === key ? { backgroundColor: accentColor } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "meldeliste" && (
        <div>
          {rosterRows.length === 0 && extra.length === 0 ? (
            <p className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-3 text-center text-[12px] text-slate-400">
              Für {opponentClub} ist in dieser Saison noch keine Meldeliste erfasst.
            </p>
          ) : (
            <div className="space-y-1">
              {rosterRows.map((e) => {
                const u = opp.usage.get(e.name);
                const played = !!u && (u.singles > 0 || u.doubles > 0);
                return (
                  <button
                    key={`${e.rang}-${e.name}`}
                    type="button"
                    onClick={onOpenPlayer ? () => onOpenPlayer(playerKey(opponentClub, e.name)) : undefined}
                    className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left ${played ? "border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/30" : "border-slate-700/30 bg-slate-800/10 opacity-70"}`}
                  >
                    <span className="inline-flex h-6 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-extrabold" style={{ backgroundColor: accentColor + "22", color: accentColor }}>
                      {e.rang}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className={`truncate text-[13px] font-bold ${played ? "text-slate-100" : "text-slate-400"}`}>{e.name}</span>
                        {/* Meldelisten-LK = aktuelle LK beim letzten Wecker-Lauf; die LK aus dem
                            Spielbericht ist nur der Stand des Spieltags und dient als Rückfall */}
                        <LkBadge lk={e.lk || u?.lk || ""} tone={played ? "own" : "muted"} />
                      </span>
                      <span className="block truncate text-[10.5px] text-slate-400">{usageText(u)}</span>
                    </span>
                    {played && u && (
                      <span className="shrink-0 text-[11px] font-bold tabular-nums">
                        <span className="text-emerald-400">{u.singlesWins + u.doublesWins}</span>
                        <span className="text-slate-500">:</span>
                        <span className="text-red-400">{u.singles + u.doubles - u.singlesWins - u.doublesWins}</span>
                      </span>
                    )}
                  </button>
                );
              })}
              {extra.length > 0 && (
                <>
                  <p className="px-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Weitere Einsätze</p>
                  {extra.map((u) => (
                    <button
                      key={u.name}
                      type="button"
                      onClick={onOpenPlayer ? () => onOpenPlayer(playerKey(opponentClub, u.name)) : undefined}
                      className="flex w-full items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 px-2.5 py-1.5 text-left hover:bg-slate-700/30"
                    >
                      <span className="inline-flex h-6 w-7 shrink-0 items-center justify-center rounded-md bg-slate-700/40 text-[11px] font-extrabold text-slate-400">–</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[13px] font-bold text-slate-100">{u.name}</span>
                          <LkBadge lk={u.lk} tone="own" />
                        </span>
                        <span className="block truncate text-[10.5px] text-slate-400">{usageText(u)}</span>
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
          <p className="mt-1.5 px-1 text-[10px] leading-snug text-slate-500">
            Bilanz aus Sicht von {opponentClub}. Nur belegte Einsätze aus Spielberichten dieser Saison — keine Prognose.
          </p>
        </div>
      )}

      {tab === "aufstellungen" && (
        <div>
          <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {opponentClub} · {opp.meetings.length ? `bisher ${opp.meetings.length} Begegnung${opp.meetings.length === 1 ? "" : "en"}` : "noch keine Begegnung gespielt"}
          </p>
          <div className="space-y-1.5">
            {opp.meetings.map((m) => (
              <Lineup key={m.report.matches[0]?.id ?? m.date} m={m} club={opponentClub} onOpenPlayer={onOpenPlayer} onOpen={() => setOpen(m.report)} />
            ))}
          </div>
          <p className="mb-1 mt-3 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Unsere Aufstellungen · {teamLabel} · {own.meetings.length ? `${own.meetings.length} Begegnung${own.meetings.length === 1 ? "" : "en"}` : "noch keine Begegnung gespielt"}
          </p>
          <div className="space-y-1.5">
            {own.meetings.map((m) => (
              <Lineup key={m.report.matches[0]?.id ?? m.date} m={m} club={ownClub} onOpenPlayer={onOpenPlayer} onOpen={() => setOpen(m.report)} />
            ))}
          </div>
          <p className="mt-1.5 px-1 text-[10px] leading-snug text-slate-500">
            Nachname + LK vom Spieltag. Ergebnisse jeweils aus Sicht der gezeigten Mannschaft. Antippen öffnet den Spielbericht.
          </p>
        </div>
      )}

      {tab === "ergebnisse" && (
        <div>
          <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {opponentClub} in dieser Runde{opp.meetings.length ? ` · ${wins} Sieg${wins === 1 ? "" : "e"} · ${draws} Remis · ${losses} Niederlage${losses === 1 ? "" : "n"}` : ""}
          </p>
          {opp.meetings.length === 0 ? (
            <p className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-3 text-center text-[12px] text-slate-400">Noch keine Begegnung gespielt.</p>
          ) : (
            <div className="space-y-1">
              {opp.meetings.map((m) => (
                <button
                  key={m.report.matches[0]?.id ?? m.date}
                  type="button"
                  onClick={() => setOpen(m.report)}
                  className="flex w-full items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 px-2.5 py-1.5 text-left text-[12px] font-bold hover:bg-slate-700/30"
                >
                  <span className="shrink-0 font-mono text-[11px] font-medium text-slate-400">{fmtDate(m.date)}</span>
                  <span className="min-w-0 flex-1 truncate">{m.isHome ? "vs" : "bei"} {m.opponentClub}</span>
                  <ResultPill own={m.result.own} opp={m.result.opp} />
                </button>
              ))}
            </div>
          )}
          <p className="mt-1.5 px-1 text-[10px] leading-snug text-slate-500">
            grün = {opponentClub} hat gewonnen · rot = verloren. Nur die laufende Saison; frühere Duelle stehen in der Spielerhistorie.
          </p>
        </div>
      )}

      <SpielberichtDrawer
        open={open !== null}
        onClose={() => setOpen(null)}
        meeting={open ? { league: `${teamLabel} · ${league}`, homeClub: open.homeClub, awayClub: open.awayClub, finalHome: open.finalHome, finalAway: open.finalAway, date: open.date, day: open.day } : null}
        matches={open?.matches ?? null}
      />
    </div>
  );
}
