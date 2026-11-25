import { useState, type CSSProperties, type ReactNode } from "react";
import type { SeasonId } from "../types";
import { getMeldeliste } from "../data/meldelisten";
import { getTeamSeason, playerKey, type LineupSlot, type MeetingSummary } from "../data/player-history";
import { emptyTeamStats, getTeamStats } from "../data/player-stats";
import { rosterEntries } from "../data/kader";
import { useClub, useGroup } from "../data/store";
import { ALL_SEASONS } from "../data/seasons";
import LkBadge from "./LkBadge";
import KaderAktiv from "./KaderAktiv";
import SpielberichtDrawer from "./SpielberichtDrawer";
import type { Spielbericht } from "../utils/spielbericht";

// Gegnerbriefing zu einer TCP-Begegnung: was über den Gegner belegt ist —
// Reiter „Kader" (KaderAktiv, seit 25.11.2026: wer hat in den letzten 12 Monaten
// wirklich gespielt, je Mannschaft die zehn mit den meisten Spieltagen),
// tatsächliche Aufstellungen der LAUFENDEN Saison (auch unsere) und bisherige
// Ergebnisse. Keine Prognosen.
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

function Slot({ s, onOpenPlayer, club, own }: { s: LineupSlot; onOpenPlayer?: (key: string) => void; club: string; own: boolean }) {
  const nameClass = `font-semibold ${s.won ? "text-slate-100" : "text-slate-400"} ${onOpenPlayer ? "hover:text-sky-300" : ""}`;
  const open = (name: string) => (onOpenPlayer ? () => onOpenPlayer(playerKey(club, name)) : undefined);
  const single = s.players.length === 1 ? s.players[0] : null;
  return (
    <div className="flex min-w-0 items-baseline gap-1.5 text-[11.5px]">
      <span className="w-5 shrink-0 font-bold text-slate-400">{s.posLabel}</span>
      {single ? (
        // Einzel: ein langer Name wird gekürzt, die LK bleibt immer ganz stehen
        <span className="flex min-w-0 items-baseline gap-1">
          <button type="button" onClick={open(single.name)} className={`min-w-0 truncate ${nameClass}`}>
            {single.name.split(",")[0]}
          </button>
          {single.lk && <LkBadge lk={single.lk} tone={own ? "own" : "opp"} />}
        </span>
      ) : (
        <span className="min-w-0 truncate">
          {s.players.map((p, i) => (
            <span key={i}>
              {i > 0 && <span className="text-slate-500"> / </span>}
              <button type="button" onClick={open(p.name)} className={nameClass}>
                {p.name.split(",")[0]}
              </button>
              {p.lk && <LkBadge lk={p.lk} tone={own ? "own" : "opp"} className="ml-1" />}
            </span>
          ))}
        </span>
      )}
      <span className={`shrink-0 text-[10px] ${s.won ? "text-emerald-400" : "text-red-400"}`}>{s.won ? "✓" : "✗"}</span>
    </div>
  );
}

function Lineup({ m, club, own, onOpenPlayer, onOpen }: { m: MeetingSummary; club: string; own: boolean; onOpenPlayer?: (key: string) => void; onOpen: () => void }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-600/50 bg-slate-900/60">
      <button type="button" onClick={onOpen} className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] font-bold hover:bg-slate-700/30">
        <span className="shrink-0 font-mono text-[11px] font-medium text-slate-300">{fmtDate(m.date)}</span>
        <span className="min-w-0 flex-1 truncate text-slate-100">{m.isHome ? "Heim gegen" : "Auswärts bei"} {m.opponentClub}</span>
        <ResultPill own={m.result.own} opp={m.result.opp} />
      </button>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 px-2.5 pb-1.5">
        {m.singles.map((s) => <Slot key={s.position} s={s} club={club} own={own} onOpenPlayer={onOpenPlayer} />)}
      </div>
      <div className="space-y-0.5 px-2.5 pb-2">
        {m.doubles.map((s) => <Slot key={s.position} s={s} club={club} own={own} onOpenPlayer={onOpenPlayer} />)}
      </div>
    </div>
  );
}

/** Ein Block im Reiter „Aufstellungen": Gegner oder wir — mit eigenem Rahmen,
 *  farbiger Kopfzeile und dem Schild „Gegner" bzw. „Wir". Bis 25.11.2026
 *  trennte nur eine kleine graue Zeile die beiden Mannschaften, und die Karten
 *  nannten nur den jeweiligen Gegner der Begegnung; Thomas konnte nicht auf
 *  einen Blick sehen, wessen Aufstellung er vor sich hat. */
function LineupSection({ own, club, sub, empty, children }: { own: boolean; club: string; sub: string; empty: boolean; children: ReactNode }) {
  return (
    <section
      className={`rounded-xl border-2 ${
        own
          ? "border-[color-mix(in_srgb,var(--accent)_60%,transparent)] bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]"
          : "border-slate-400/50 bg-slate-800/40"
      }`}
    >
      {/* Die Kopfzeile bleibt beim Scrollen unter der App-Leiste stehen — bei sieben
          Begegnungen wüsste man sonst mitten im Block nicht mehr, wessen Aufstellung das ist */}
      <header className={`sticky top-[78px] z-10 flex items-center gap-2.5 rounded-t-[10px] px-2.5 py-2 ${own ? "bg-[color-mix(in_srgb,var(--accent)_22%,#0f172a)]" : "bg-slate-700"}`}>
        <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-extrabold uppercase leading-none tracking-wider ${own ? "bg-[var(--accent)] text-slate-950" : "bg-slate-200 text-slate-950"}`}>
          {own ? "Wir" : "Gegner"}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-[14px] font-extrabold leading-[18px] ${own ? "text-[var(--accent)]" : "text-slate-50"}`}>{club}</span>
          <span className="block truncate text-[11px] leading-[14px] text-slate-300">{sub}</span>
        </span>
      </header>
      {empty ? (
        <p className="px-2.5 py-3 text-[12px] text-slate-400">Noch keine Begegnung mit Spielbericht in dieser Runde.</p>
      ) : (
        <div className="space-y-1.5 p-2">{children}</div>
      )}
    </section>
  );
}

export default function OpponentBriefing({ season, league, teamLabel, accentColor, opponentClub, ownClub, onOpenPlayer }: Props) {
  const [tab, setTab] = useState<Tab>("kader");
  const [open, setOpen] = useState<Spielbericht | null>(null);

  // Gruppendatei (Berichte + Meldelisten) und Vereinsdaten beider Seiten werden
  // beim Aufklappen nachgeladen (public/data, seit 08.10.2026)
  const { data: group, loading } = useGroup(season, league);
  const { data: oppData, loading: oppLoading } = useClub(opponentClub);
  const { data: ownData, loading: ownLoading } = useClub(ownClub);
  const opp = getTeamSeason(group, opponentClub);
  const own = getTeamSeason(group, ownClub);
  const oppRoster = getMeldeliste(group, opponentClub);
  const ownRoster = getMeldeliste(group, ownClub);
  const oppRows = rosterEntries(oppRoster);
  const ownRows = rosterEntries(ownRoster);
  const oppStats = getTeamStats(group, opponentClub) ?? emptyTeamStats(league, opponentClub, teamLabel);
  const ownStats = getTeamStats(group, ownClub) ?? emptyTeamStats(league, ownClub, teamLabel);

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
          <KaderAktiv
            season={season}
            teamLabel={teamLabel}
            ownClub={ownClub}
            oppClub={opponentClub}
            ownRoster={ownRoster}
            oppRoster={oppRoster}
            ownData={ownData}
            oppData={oppData}
            ownLoading={ownLoading}
            oppLoading={oppLoading}
            ownStats={ownStats}
            oppStats={oppStats}
            onOpenPlayer={onOpenPlayer}
          />
        )
      )}

      {tab === "aufstellungen" && (
        <div>
          <div className="space-y-3">
            <LineupSection
              own={false}
              club={opponentClub}
              sub={opp.meetings.length ? `Aufstellungen des Gegners · ${opp.meetings.length} Begegnung${opp.meetings.length === 1 ? "" : "en"}` : "Aufstellungen des Gegners"}
              empty={opp.meetings.length === 0}
            >
              {opp.meetings.map((m) => (
                <Lineup key={m.report.matches[0]?.id ?? m.date} m={m} club={opponentClub} own={false} onOpenPlayer={onOpenPlayer} onOpen={() => setOpen(m.report)} />
              ))}
            </LineupSection>
            <LineupSection
              own
              club={ownClub}
              sub={own.meetings.length ? `Unsere Aufstellungen · ${teamLabel} · ${own.meetings.length} Begegnung${own.meetings.length === 1 ? "" : "en"}` : `Unsere Aufstellungen · ${teamLabel}`}
              empty={own.meetings.length === 0}
            >
              {own.meetings.map((m) => (
                <Lineup key={m.report.matches[0]?.id ?? m.date} m={m} club={ownClub} own onOpenPlayer={onOpenPlayer} onOpen={() => setOpen(m.report)} />
              ))}
            </LineupSection>
          </div>
          <p className="mt-2 px-1 text-[11px] leading-snug text-slate-400">
            Oben der Gegner, darunter wir. Nachname + LK vom Spieltag, ✓ gewonnen, ✗ verloren. Das Ergebnis steht jeweils aus Sicht der gezeigten Mannschaft. Antippen öffnet den Spielbericht.
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
