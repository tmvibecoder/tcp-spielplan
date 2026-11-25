import { useState } from "react";
import type { Meldeliste, SeasonId } from "../types";
import type { ClubData } from "../data/data-format";
import type { TeamStats } from "../data/player-stats";
import { ageClassOf, aktivCutoff, kaderAktiv, type AktivEntry, type AktivStat } from "../data/kader-aktiv";
import { fmtDay } from "../data/kader";
import { playerKey } from "../data/player-history";
import { ALL_SEASONS } from "../data/seasons";
import { LkCell, WinLoss } from "./KaderBits";
import RosterTable from "./RosterTable";

// Reiter „Kader" im Gegnerbriefing (seit 25.11.2026): je Mannschaft die zehn
// Gemeldeten mit den meisten Spieltagen der letzten 12 Monate — sortiert nach
// Einsätzen statt nach Rang, denn die oberen Ränge einer Meldeliste spielen oft
// gar nicht. Umschalter „in dieser Mannschaft" / „in allen Mannschaften des
// Vereins"; antippen klappt die Aufschlüsselung je Saison auf. Darunter lassen
// sich die übrigen Eingesetzten und der Rest der Meldeliste einblenden.
// Ersetzt den Kopf-an-Kopf-Vergleich der ersten acht Ränge (24.11.2026).

type Scope = "team" | "all";

/** So viele Eingesetzte stehen zunächst da */
const TOP = 10;

interface TeamProps {
  club: string;
  teamLabel: string;
  season: SeasonId;
  roster?: Meldeliste;
  clubData?: ClubData;
  /** Vereinsdaten werden noch geladen */
  loading: boolean;
  /** Bilanzen der laufenden Saison — für die Ersatzansicht ohne Einsatzdaten */
  stats: TeamStats;
  own: boolean;
  scope: Scope;
  entries: AktivEntry[];
  /** Balkenmaßstab: meiste Spieltage beider Mannschaften */
  maxDays: number;
  onOpenPlayer?: (key: string) => void;
}

const seasonShort = (id: SeasonId) => ALL_SEASONS.find((s) => s.id === id)?.shortLabel ?? id;
const dayWord = (n: number) => (n === 1 ? "Spieltag" : "Spieltage");

function lineText(l: AktivEntry["lines"][number]): string {
  const parts = [`${l.days} ${dayWord(l.days)}`];
  if (l.singlesWins + l.singlesLosses > 0) parts.push(`Einzel ${l.singlesWins}:${l.singlesLosses}${l.positions ? ` (Pos. ${l.positions})` : ""}`);
  if (l.doublesWins + l.doublesLosses > 0) parts.push(`Doppel ${l.doublesWins}:${l.doublesLosses}`);
  return parts.join(" · ");
}

function TeamBlock({ club, teamLabel, season, roster, clubData, loading, stats, own, scope, entries, maxDays, onOpenPlayer }: TeamProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [showRest, setShowRest] = useState(false);

  const head = (count: string) => (
    <div className="flex items-end gap-2 px-2.5 pb-1.5 pt-3">
      <span className={`min-w-0 flex-1 truncate text-[14px] font-extrabold leading-[18px] ${own ? "text-[var(--accent)]" : "text-slate-100"}`}>{club}</span>
      <span className="shrink-0 text-[12px] leading-[18px] text-slate-400">{count}</span>
    </div>
  );

  if (!roster || entries.length === 0) {
    return (
      <div>
        {head("")}
        <p className="mx-2.5 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-3 text-center text-[12px] text-slate-400">
          Für {club} ist in dieser Saison noch keine Meldeliste erfasst.
        </p>
      </div>
    );
  }
  if (loading && !clubData) {
    return (
      <div>
        {head(`${entries.length} gemeldet`)}
        <p className="px-2.5 py-3 text-[12px] text-slate-400">Einsätze werden geladen …</p>
      </div>
    );
  }
  // Keine Einsatzdaten (Jugend und andere geschützte Listen, neue Gegner ohne
  // Vorsaison): die gewohnte Kaderliste zeigen statt einer leeren Rangliste
  if (!entries.some((e) => e.all.days > 0)) {
    return (
      <div>
        {head(`${entries.length} gemeldet`)}
        <p className="px-2.5 pb-2 text-[12px] leading-snug text-slate-400">
          Für diese Mannschaft liegen keine Einsätze der letzten 12 Monate vor — gezeigt ist die Meldeliste.
        </p>
        <RosterTable
          team={stats}
          meldeliste={roster}
          clubData={clubData}
          season={season}
          onOpenPlayer={onOpenPlayer ? (c, name) => onOpenPlayer(playerKey(c, name)) : undefined}
        />
      </div>
    );
  }

  const statOf = (e: AktivEntry): AktivStat => (scope === "team" ? e.team : e.all);
  const order = new Map(entries.map((e, i) => [e, i]));
  const active = entries
    .filter((e) => statOf(e).days > 0)
    .sort((a, b) => {
      const x = statOf(a), y = statOf(b);
      return y.days - x.days || y.wins + y.losses - (x.wins + x.losses) || order.get(a)! - order.get(b)!;
    });
  const rest = entries.filter((e) => statOf(e).days === 0);
  const shown = showMore ? active : active.slice(0, TOP);
  const extra = active.length - TOP;
  const ageClass = ageClassOf(teamLabel);

  return (
    <div>
      {head(`${active.length} von ${entries.length} Gemeldeten`)}
      <div className="flex h-6 items-center gap-1.5 border-b border-slate-500/40 px-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <span className="min-w-0 flex-1">Spieler</span>
        <span className="w-11 shrink-0 text-center">LK</span>
        <span className="w-[50px] shrink-0 text-right normal-case tracking-normal">Spieltage</span>
        <span className="w-9 shrink-0 text-right normal-case tracking-normal">Bilanz</span>
        <span className="w-2.5 shrink-0" />
      </div>

      {active.length === 0 && (
        <p className="px-2.5 py-3 text-[12px] text-slate-400">
          Niemand der Gemeldeten hat in den letzten 12 Monaten für diese Mannschaft gespielt.
        </p>
      )}

      {shown.map((e) => {
        const s = statOf(e);
        const isOpen = openKey === e.key;
        const lines = scope === "team" ? e.lines.filter((l) => l.thisTeam) : e.lines;
        return (
          <div key={`${e.entry.rang}-${e.entry.name}`} className={`border-b border-slate-600/25 ${isOpen ? "bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]" : ""}`}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenKey(isOpen ? null : e.key)}
              className={`flex min-h-[44px] w-full items-center gap-1.5 px-2.5 py-1 text-left active:bg-slate-700/40 ${isOpen ? "bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]" : ""}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-bold leading-[18px] text-slate-100">{e.entry.name}</span>
                <span className="block truncate text-[11px] leading-[14px] text-slate-400">Rang {e.entry.rang} · zuletzt {fmtDay(s.last)}</span>
              </span>
              <LkCell lk={e.entry.lk} played={own} />
              <span className="block w-[50px] shrink-0" title={`${s.days} ${dayWord(s.days)} in den letzten 12 Monaten`}>
                <span className="block text-right text-[13px] font-extrabold leading-[15px] tabular-nums text-slate-100">{s.days}</span>
                <span className="mt-[3px] flex h-1 justify-end" aria-hidden="true">
                  <span className={`h-1 rounded-sm ${own ? "bg-[var(--accent)]" : "bg-slate-300"}`} style={{ width: `${Math.max(8, (s.days / maxDays) * 100)}%` }} />
                </span>
              </span>
              <span className="w-9 shrink-0 text-right text-[12px]"><WinLoss wins={s.wins} losses={s.losses} /></span>
              <span className="w-2.5 shrink-0 text-center text-[10px] text-slate-400" aria-hidden="true">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div className="px-2.5 pb-3 pt-0.5">
                {lines.map((l) => (
                  <div key={`${l.season}-${l.team}`} className="border-b border-slate-600/30 py-1.5">
                    <div className="text-[13px] font-bold leading-[17px] text-slate-100">{seasonShort(l.season)} · {l.team}</div>
                    <div className="text-[12px] leading-4 text-slate-300">{lineText(l)}</div>
                  </div>
                ))}
                {onOpenPlayer && (
                  <button
                    type="button"
                    onClick={() => onOpenPlayer(e.key)}
                    className="mt-2.5 flex h-11 w-full items-center justify-center rounded-xl border border-sky-400/45 bg-sky-500/15 text-[13px] font-bold text-sky-200 active:bg-sky-500/25"
                  >
                    Spielerhistorie über alle Saisons ›
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {extra > 0 && (
        <button
          type="button"
          onClick={() => { setShowMore((v) => !v); setOpenKey(null); }}
          className="block h-11 w-full border-b border-slate-600/25 px-2.5 text-left text-[12px] font-bold text-sky-300 active:bg-slate-700/40"
        >
          {showMore ? `Nur die ersten ${TOP} zeigen` : `${extra} ${extra === 1 ? "weiterer" : "weitere"} mit Einsatz zeigen`}
        </button>
      )}
      {rest.length > 0 && (
        <button
          type="button"
          aria-expanded={showRest}
          onClick={() => setShowRest((v) => !v)}
          className="block h-11 w-full px-2.5 text-left text-[12px] font-bold text-sky-300 active:bg-slate-700/40"
        >
          {showRest
            ? "Gemeldete ohne Einsatz ausblenden"
            : scope === "team"
              ? `${rest.length} Gemeldete ohne Einsatz in ${ageClass} zeigen`
              : `${rest.length} Gemeldete ohne Match zeigen`}
        </button>
      )}
      {showRest && rest.map((e) => (
        <div key={`${e.entry.rang}-${e.entry.name}`} className="flex min-h-[38px] items-center gap-2 border-t border-slate-600/20 px-2.5 py-0.5">
          <span className="w-5 shrink-0 text-[12px] font-extrabold tabular-nums text-slate-400">{e.entry.rang}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold leading-4 text-slate-200">{e.entry.name}</span>
            <span className="block truncate text-[11px] leading-[13px] text-slate-400">
              {e.protectedEntry
                ? "geschützter Eintrag · keine Bilanz"
                : e.all.days > 0
                  ? `nur in anderen Mannschaften · ${e.all.days} ${dayWord(e.all.days)}`
                  : "kein Match in 12 Monaten"}
            </span>
          </span>
          <LkCell lk={e.entry.lk} />
        </div>
      ))}
    </div>
  );
}

interface Props {
  season: SeasonId;
  teamLabel: string;
  ownClub: string;
  oppClub: string;
  ownRoster?: Meldeliste;
  oppRoster?: Meldeliste;
  ownData?: ClubData;
  oppData?: ClubData;
  ownLoading: boolean;
  oppLoading: boolean;
  ownStats: TeamStats;
  oppStats: TeamStats;
  onOpenPlayer?: (key: string) => void;
}

export default function KaderAktiv({ season, teamLabel, ownClub, oppClub, ownRoster, oppRoster, ownData, oppData, ownLoading, oppLoading, ownStats, oppStats, onOpenPlayer }: Props) {
  const [scope, setScope] = useState<Scope>("team");
  const own = kaderAktiv(ownRoster, ownData, ownClub, teamLabel);
  const opp = kaderAktiv(oppRoster, oppData, oppClub, teamLabel);
  const statOf = (e: AktivEntry) => (scope === "team" ? e.team : e.all);
  const maxDays = Math.max(1, ...own.map((e) => statOf(e).days), ...opp.map((e) => statOf(e).days));
  const ageClass = ageClassOf(teamLabel);
  const since = aktivCutoff().split("-").reverse().join(".");
  // Ohne Einsatzdaten auf beiden Seiten (Jugend: nur Initialen) gibt es nichts
  // umzuschalten — dann stehen nur die beiden Meldelisten da
  const loaded = !(ownLoading && !ownData) && !(oppLoading && !oppData);
  const anyData = !loaded || own.some((e) => e.all.days > 0) || opp.some((e) => e.all.days > 0);
  const chip = (on: boolean) =>
    `h-11 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-bold ${
      on ? "border-[var(--accent)] bg-[var(--accent)] text-slate-950" : "border-slate-500/40 bg-slate-800/70 text-slate-200"
    }`;

  return (
    <div className="-mx-2.5">
      {anyData && (
      <div className="px-2.5">
        <p className="text-[15px] font-extrabold leading-5 text-slate-50">Wer spielt wirklich?</p>
        <p className="mt-0.5 text-[12px] leading-4 text-slate-400">
          Die {TOP} Gemeldeten mit den meisten Spieltagen in den letzten 12 Monaten.
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button type="button" aria-pressed={scope === "team"} onClick={() => setScope("team")} className={chip(scope === "team")}>In {ageClass}</button>
          <button type="button" aria-pressed={scope === "all"} onClick={() => setScope("all")} className={chip(scope === "all")}>In allen Mannschaften</button>
        </div>
      </div>
      )}

      <TeamBlock
        key={`opp-${scope}`}
        club={oppClub} teamLabel={teamLabel} season={season} roster={oppRoster} clubData={oppData} loading={oppLoading}
        stats={oppStats} own={false} scope={scope} entries={opp} maxDays={maxDays} onOpenPlayer={onOpenPlayer}
      />
      <div className="mt-1 border-t border-slate-500/40" />
      <TeamBlock
        key={`own-${scope}`}
        club={ownClub} teamLabel={teamLabel} season={season} roster={ownRoster} clubData={ownData} loading={ownLoading}
        stats={ownStats} own scope={scope} entries={own} maxDays={maxDays} onOpenPlayer={onOpenPlayer}
      />

      {anyData && (
      <p className="px-2.5 pt-2.5 text-[11px] leading-snug text-slate-400">
        Spieltage = Begegnungen mit Einsatz seit {since}{" "}
        {scope === "team"
          ? `für diese Mannschaft (${ageClass}, gleiche Mannschaftsnummer)`
          : "für irgendeine Mannschaft des Vereins"}
        . Bilanz = Einzel und Doppel zusammen. Rang und LK laut BTV-Meldeliste beim letzten Abruf. Gezählt aus Spielberichten — keine Aufstellungsprognose.
      </p>
      )}
    </div>
  );
}
