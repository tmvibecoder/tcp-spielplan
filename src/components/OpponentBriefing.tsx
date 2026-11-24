import { useState, type CSSProperties, type ReactNode } from "react";
import type { SeasonId } from "../types";
import { getMeldeliste } from "../data/meldelisten";
import { getTeamSeason, playerKey, type LineupSlot, type MeetingSummary } from "../data/player-history";
import { emptyTeamStats, getTeamStats } from "../data/player-stats";
import { clubShort, rosterEntries } from "../data/kader";
import { useClub, useGroup } from "../data/store";
import { ALL_SEASONS } from "../data/seasons";
import LkBadge from "./LkBadge";
import KaderVergleich from "./KaderVergleich";
import { LkDuel } from "./LkProfile";
import RosterTable from "./RosterTable";
import SpielberichtDrawer from "./SpielberichtDrawer";
import type { Spielbericht } from "../utils/spielbericht";

// Gegnerbriefing zu einer TCP-Begegnung: was über den Gegner in der LAUFENDEN
// Saison belegt ist — Kader-Vergleich (beide Meldelisten Kopf an Kopf, seit
// 24.11.2026; die vollständigen Listen sind eingeklappt), tatsächliche
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

type Tab = "kader" | "aufstellungen" | "ergebnisse";

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

/** Eingeklappte vollständige Meldeliste (Gegner bzw. eigene Mannschaft). */
function FullRoster({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="-mx-2.5 border-y border-slate-500/30 bg-slate-800/40">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-full items-center gap-2 px-3 text-left active:bg-slate-700/40"
      >
        <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-slate-100">{title}</span>
        <span className="shrink-0 text-[12px] tabular-nums text-slate-400">{count} gemeldet</span>
        <span className="w-2.5 shrink-0 text-center text-[10px] text-slate-400" aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="border-t border-slate-500/30 pb-1 pt-2">{children}</div>}
    </div>
  );
}

export default function OpponentBriefing({ season, league, teamLabel, accentColor, opponentClub, ownClub, onOpenPlayer }: Props) {
  const [tab, setTab] = useState<Tab>("kader");
  const [open, setOpen] = useState<Spielbericht | null>(null);

  // Gruppendatei (Berichte + Meldelisten) und Vereinsdaten beider Seiten werden
  // beim Aufklappen nachgeladen (public/data, seit 08.10.2026)
  const { data: group, loading } = useGroup(season, league);
  const { data: oppData } = useClub(opponentClub);
  const { data: ownData } = useClub(ownClub);
  const opp = getTeamSeason(group, opponentClub);
  const own = getTeamSeason(group, ownClub);
  const oppRoster = getMeldeliste(group, opponentClub);
  const ownRoster = getMeldeliste(group, ownClub);
  const oppRows = rosterEntries(oppRoster);
  const ownRows = rosterEntries(ownRoster);
  const oppStats = getTeamStats(group, opponentClub) ?? emptyTeamStats(league, opponentClub, teamLabel);
  const ownStats = getTeamStats(group, ownClub) ?? emptyTeamStats(league, ownClub, teamLabel);
  const openByName = onOpenPlayer ? (club: string, name: string) => onOpenPlayer(playerKey(club, name)) : undefined;

  const wins = opp.meetings.filter((m) => m.result.own > m.result.opp).length;
  const draws = opp.meetings.filter((m) => m.result.own === m.result.opp).length;
  const losses = opp.meetings.length - wins - draws;

  const tabs: [Tab, string][] = [
    ["kader", "Kader"],
    ["aufstellungen", "Aufstellungen"],
    ["ergebnisse", "Ergebnisse"],
  ];

  return (
    // -mx-3: das Briefing nutzt fast die ganze Breite der Begegnungskarte —
    // sonst werden auf dem Handy die Namen im Kader-Vergleich abgeschnitten
    <div className="-mx-3 mt-3 rounded-lg border border-sky-500/25 bg-slate-900/70 p-2.5" style={{ "--accent": accentColor } as CSSProperties}>
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
            className={`h-10 flex-1 rounded-lg px-2 text-[13px] font-bold transition-colors ${tab === key ? "text-slate-900" : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/50"}`}
            style={tab === key ? { backgroundColor: accentColor } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "kader" && (
        loading && oppRows.length === 0 && ownRows.length === 0 ? (
          <p className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-3 text-center text-[12px] text-slate-400">Meldelisten werden geladen …</p>
        ) : (
          <div className="space-y-3">
            <KaderVergleich
              ownClub={ownClub}
              oppClub={opponentClub}
              ownRoster={ownRoster}
              oppRoster={oppRoster}
              ownData={ownData}
              oppData={oppData}
              onOpenPlayer={onOpenPlayer}
            />
            {oppRows.length > 0 && ownRows.length > 0 && (
              <LkDuel own={ownRows} opp={oppRows} ownLabel={clubShort(ownClub)} oppLabel={clubShort(opponentClub)} />
            )}
            <div className="space-y-2.5">
              <FullRoster title={`Ganze Meldeliste ${opponentClub}`} count={oppRows.length}>
                <RosterTable team={oppStats} meldeliste={oppRoster} clubData={oppData} season={season} onOpenPlayer={openByName} />
              </FullRoster>
              <FullRoster title={`Unsere Meldeliste · ${teamLabel}`} count={ownRows.length}>
                <RosterTable team={ownStats} meldeliste={ownRoster} clubData={ownData} season={season} onOpenPlayer={openByName} />
              </FullRoster>
            </div>
            <p className="px-1 text-[11px] leading-snug text-slate-400">
              Rang und LK laut BTV-Meldeliste beim letzten Abruf, Bilanz aus erfassten Spielberichten der letzten 12 Monate —
              keine Aufstellungsprognose.
            </p>
          </div>
        )
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
