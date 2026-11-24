import { useState, type CSSProperties } from "react";
import type { TeamStats } from "../data/player-stats";
import { aggregateByName, aggregateDoubles, assignToRoster } from "../data/player-stats";
import type { Meldeliste, SeasonId } from "../types";
import type { ClubData } from "../data/data-format";
import { rosterEntries } from "../data/kader";
import { WinLoss } from "./KaderBits";
import LkProfile from "./LkProfile";
import RosterTable, { AppearanceLine } from "./RosterTable";
import EinsatzMatrix from "./EinsatzMatrix";

// Mannschaftsseite (aus Tabelle und Suche), Redesign 24.11.2026:
//   Kader     LK-Profil + kompakte Kaderliste (RosterTable)
//   Einsätze  Matrix Spieler × Spieltage (EinsatzMatrix)
//   Doppel    gespielte Paarungen mit Bilanz
// Vorher zeigten „Einzel" und „Doppel" zweimal dieselbe lange Kartenliste.

interface TeamStatsDetailProps {
  team: TeamStats;
  season: SeasonId;
  rank?: number;
  /** Zahl der Mannschaften der Gruppe — für „Platz 2 / 6" */
  teamCount?: number;
  accentColor: string;
  onBack: () => void;
  /** Komplette namentliche Meldeliste; fehlt sie, zeigt der Kader nur die Eingesetzten */
  meldeliste?: Meldeliste;
  /** Beschriftung des Zurück-Knopfs (Standard „Tabelle") */
  backLabel?: string;
  /** Spieler antippen → Spielerhistorie (Schlüssel: Verein + Name) */
  onOpenPlayer?: (club: string, name: string) => void;
  /** Nachgeladene Vereinsdaten (12-Monats-Bilanz, Formverlauf) */
  clubData?: ClubData;
}

type Tab = "kader" | "einsaetze" | "doppel";

export default function TeamStatsDetail({
  team,
  season,
  rank,
  teamCount,
  accentColor,
  onBack,
  meldeliste,
  backLabel = "Tabelle",
  onOpenPlayer,
  clubData,
}: TeamStatsDetailProps) {
  const [tab, setTab] = useState<Tab>("kader");
  const [openPair, setOpenPair] = useState<string | null>(null);

  const aggByName = aggregateByName(team);
  const used = [...aggByName.values()].filter((a) => !a.name.startsWith("—") && a.matches + a.doublesMatches > 0);
  const listed = rosterEntries(meldeliste);
  const pairs = aggregateDoubles(team);
  const assigned = assignToRoster(listed, aggByName);
  const profile = listed.length
    ? listed.map((e, i) => ({ lk: e.lk, played: !!assigned[i] && assigned[i]!.matches + assigned[i]!.doublesMatches > 0 }))
    : used.map((a) => ({ lk: a.lk, played: true }));

  const tabs: [Tab, string, number][] = [
    ["kader", "Kader", listed.length || used.length],
    ["einsaetze", "Einsätze", used.length],
    ["doppel", "Doppel", pairs.length],
  ];

  return (
    <div className="animate-[fadeIn_200ms_ease-out]" style={{ "--accent": accentColor } as CSSProperties}>
      {/* Kopf: Zurück · Verein/Mannschaft · Platz */}
      <div className="flex items-center gap-2.5 px-3 pb-2.5">
        <button
          type="button"
          onClick={onBack}
          className="h-11 shrink-0 rounded-lg border border-slate-500/50 bg-slate-800/70 px-3 text-[13px] font-bold text-sky-300 active:bg-slate-700/70"
        >
          ‹ {backLabel}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[17px] font-extrabold leading-[21px] text-slate-50">{team.club}</div>
          <div className="truncate text-[12px] leading-4 text-slate-400">{team.teamLabel} · {team.leagueName}</div>
        </div>
        {rank ? (
          <div className="shrink-0 whitespace-nowrap rounded-full bg-slate-500/25 px-2.5 py-1 text-[13px] font-extrabold leading-5 text-slate-100">
            Platz {rank}
            {teamCount ? <span className="text-[12px] font-semibold text-slate-400"> / {teamCount}</span> : null}
          </div>
        ) : null}
      </div>

      {/* Ansicht wählen */}
      <div className="mx-3 mb-2.5 flex gap-[3px] rounded-xl bg-slate-800/80 p-[3px]" role="tablist">
        {tabs.map(([key, label, n]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => { setTab(key); setOpenPair(null); }}
            className={`h-[38px] flex-1 whitespace-nowrap rounded-[9px] text-[13px] ${
              tab === key ? "bg-[var(--accent)] font-extrabold text-slate-950" : "font-bold text-slate-300 active:bg-slate-700/60"
            }`}
          >
            {label} · <span className="tabular-nums">{n}</span>
          </button>
        ))}
      </div>

      {tab === "kader" && (
        <>
          <div className="mx-3 mb-2.5 empty:hidden">
            <LkProfile entries={profile} />
          </div>
          <RosterTable team={team} meldeliste={meldeliste} clubData={clubData} season={season} onOpenPlayer={onOpenPlayer} />
          <p className="px-3 pt-2.5 text-[11px] leading-snug text-slate-400">
            {meldeliste
              ? "Rang und LK laut BTV-Meldeliste beim letzten Abruf. "
              : "Für diese Mannschaft liegt keine Meldeliste vor — gezeigt sind die Eingesetzten. "}
            Farbig hervorgehoben: in dieser Saison im Einsatz. Balken = Matches der letzten 12 Monate, grün gewonnen, rot verloren.
            Antippen zeigt die einzelnen Matches.
          </p>
        </>
      )}

      {tab === "einsaetze" && <EinsatzMatrix team={team} meldeliste={meldeliste} />}

      {tab === "doppel" && (
        pairs.length === 0 ? (
          <p className="mx-3 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-4 text-center text-[12px] text-slate-400">
            Für {team.club} ist in dieser Saison noch kein Doppel mit Spielbericht erfasst.
          </p>
        ) : (
          <div>
            <div className="flex h-6 items-center gap-2 border-b border-slate-500/40 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="min-w-0 flex-1">Paarung</span>
              <span className="w-16 shrink-0 text-center">Einsätze</span>
              <span className="w-12 shrink-0 text-right">Bilanz</span>
              <span className="w-2.5 shrink-0" />
            </div>
            {pairs.map((d) => {
              const isOpen = openPair === d.label;
              return (
                <div key={d.label} className={`border-b border-slate-600/25 ${isOpen ? "bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]" : ""}`}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenPair(isOpen ? null : d.label)}
                    className="flex min-h-[44px] w-full items-center gap-2 px-3 py-1 text-left active:bg-slate-700/40"
                  >
                    <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-slate-100">{d.label}</span>
                    <span className="w-16 shrink-0 text-center text-[13px] font-bold tabular-nums text-slate-200">{d.matches}</span>
                    <span className="w-12 shrink-0 text-right text-[13px]"><WinLoss wins={d.wins} losses={d.losses} /></span>
                    <span className="w-2.5 shrink-0 text-center text-[10px] text-slate-400" aria-hidden="true">{isOpen ? "▲" : "▼"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-2.5">
                      {d.appearances.map((app, i) => <AppearanceLine key={i} app={app} />)}
                    </div>
                  )}
                </div>
              );
            })}
            <p className="px-3 pt-2.5 text-[11px] leading-snug text-slate-400">
              Sortiert nach Zahl der gemeinsamen Einsätze. D1, D2 … = Position des Doppels. Quelle: nuLiga-Spielberichte.
            </p>
          </div>
        )
      )}
    </div>
  );
}
