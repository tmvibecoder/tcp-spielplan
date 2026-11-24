import { useState } from "react";
import type { Meldeliste, MeldelistenEintrag } from "../types";
import type { ClubData } from "../data/data-format";
import { playerKey, recentBalance, type RecentBalance } from "../data/player-history";
import { parseLk } from "../data/player-stats";
import { isProtectedName, shortName } from "../data/kader";
import { WinLoss } from "./KaderBits";

// Kader-Vergleich zur Begegnung: die oberen Ränge beider Meldelisten Kopf an
// Kopf — unsere Mannschaft links, der Gegner rechts, je Zeile LK gegen LK und
// die Bilanz der letzten 12 Monate. „Nur Aktive" lässt weg, wer in dieser Zeit
// kein erfasstes Match hat. Das ist ein Filter auf belegte Daten, keine
// Aufstellungsprognose (Projektregel: nichts schätzen).

type Mode = "rang" | "aktiv";

interface Entry {
  e: MeldelistenEintrag;
  balance: RecentBalance;
}

interface Props {
  ownClub: string;
  oppClub: string;
  ownRoster?: Meldeliste;
  oppRoster?: Meldeliste;
  ownData?: ClubData;
  oppData?: ClubData;
  onOpenPlayer?: (key: string) => void;
}

function LkPill({ lk, better, own }: { lk: string; better: boolean; own: boolean }) {
  const value = lk.replace(/^LK\s*/i, "").trim() || "–";
  const cls = better
    ? own ? "bg-[var(--accent)] text-slate-950" : "bg-slate-200 text-slate-950"
    : "border border-slate-400/50 text-slate-200";
  return (
    <span className={`inline-flex h-6 w-10 shrink-0 items-center justify-center rounded-lg text-[13px] font-extrabold tabular-nums ${cls}`}>
      {value}
    </span>
  );
}

function Side({ entry, club, right, onOpenPlayer }: { entry: Entry | undefined; club: string; right?: boolean; onOpenPlayer?: (key: string) => void }) {
  if (!entry) return <span className="min-w-0 flex-1" />;
  const { e, balance } = entry;
  const canOpen = !!onOpenPlayer && !isProtectedName(e.name);
  return (
    <button
      type="button"
      onClick={canOpen ? () => onOpenPlayer!(playerKey(club, e.name)) : undefined}
      className={`min-w-0 flex-1 py-1 ${right ? "text-right" : "text-left"} ${canOpen ? "" : "cursor-default"}`}
      title={e.name}
    >
      <span className="block truncate text-[13px] font-bold leading-[17px] text-slate-100">
        <span className="mr-1 text-[11px] font-extrabold tabular-nums text-slate-400">{e.rang}</span>
        {shortName(e.name)}
      </span>
      <span className="block truncate text-[11px] leading-[14px] text-slate-400">
        12 Mon. {balance.played ? <WinLoss wins={balance.wins} losses={balance.losses} /> : "keine"}
      </span>
    </button>
  );
}

export default function KaderVergleich({ ownClub, oppClub, ownRoster, oppRoster, ownData, oppData, onOpenPlayer }: Props) {
  const [mode, setMode] = useState<Mode>("rang");

  const withBalance = (list: MeldelistenEintrag[], data: ClubData | undefined, club: string): Entry[] =>
    list.map((e) => ({ e, balance: recentBalance(data, club, e.name) }));
  const pick = (list: Entry[]) => (mode === "aktiv" ? list.filter((x) => x.balance.played > 0) : list);

  const sections = ([
    ["Herren", "herren"],
    ["Damen", "damen"],
  ] as const)
    .map(([label, key]) => ({
      label,
      own: pick(withBalance(ownRoster?.[key] ?? [], ownData, ownClub)),
      opp: pick(withBalance(oppRoster?.[key] ?? [], oppData, oppClub)),
      any: (ownRoster?.[key].length ?? 0) + (oppRoster?.[key].length ?? 0) > 0,
    }))
    .filter((s) => s.any);
  // Eine Meldeliste: die ersten acht. Mixed (Herren und Damen): je vier.
  const perSection = sections.length > 1 ? 4 : 8;
  const count = (r: Meldeliste | undefined) => (r ? r.herren.length + r.damen.length : 0);

  if (sections.length === 0) {
    return (
      <p className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-3 text-center text-[12px] text-slate-400">
        Für diese Begegnung ist noch keine Meldeliste erfasst.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 pb-2">
        {([["rang", "Nach Meldeliste"], ["aktiv", "Nur Aktive (12 Mon.)"]] as [Mode, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
            className={`h-11 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-bold ${
              mode === key ? "border-[var(--accent)] bg-[var(--accent)] text-slate-950" : "border-slate-500/40 bg-slate-800/70 text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2 border-b border-slate-500/40 pb-1.5">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-extrabold leading-4 text-[var(--accent)]">{ownClub}</div>
          <div className="text-[11px] leading-[14px] text-slate-400">{count(ownRoster)} gemeldet</div>
        </div>
        <div className="shrink-0 pb-px text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">LK · LK</div>
        <div className="min-w-0 flex-1 text-right">
          <div className="truncate text-[13px] font-extrabold leading-4 text-slate-200">{oppClub}</div>
          <div className="text-[11px] leading-[14px] text-slate-400">{count(oppRoster)} gemeldet</div>
        </div>
      </div>

      {sections.map((s) => {
        const n = Math.min(perSection, Math.max(s.own.length, s.opp.length));
        return (
          <div key={s.label}>
            {sections.length > 1 && (
              <p className="border-b border-slate-600/25 bg-slate-800/50 px-1 py-1 text-center text-[11px] font-bold uppercase tracking-wider text-slate-300">{s.label}</p>
            )}
            {n === 0 && (
              <p className="py-3 text-center text-[12px] text-slate-400">Niemand mit Matches in den letzten 12 Monaten.</p>
            )}
            {Array.from({ length: n }, (_, i) => {
              const a = s.own[i];
              const b = s.opp[i];
              const la = a ? parseLk(a.e.lk) : NaN;
              const lb = b ? parseLk(b.e.lk) : NaN;
              const comparable = !Number.isNaN(la) && !Number.isNaN(lb);
              return (
                <div key={i} className="flex min-h-[48px] items-center gap-1.5 border-b border-slate-600/25">
                  <Side entry={a} club={ownClub} onOpenPlayer={onOpenPlayer} />
                  {a ? <LkPill lk={a.e.lk} own better={comparable && la < lb} /> : <span className="w-10 shrink-0" />}
                  {b ? <LkPill lk={b.e.lk} own={false} better={comparable && lb < la} /> : <span className="w-10 shrink-0" />}
                  <Side entry={b} club={oppClub} right onOpenPlayer={onOpenPlayer} />
                </div>
              );
            })}
          </div>
        );
      })}
      <p className="pt-1.5 text-[11px] leading-snug text-slate-400">
        Kleine Zahl = Rang in der Meldeliste. Gefüllt = die bessere (niedrigere) LK der Zeile.
        {mode === "aktiv" ? " Gezeigt ist nur, wer in den letzten 12 Monaten ein erfasstes Match hat." : ""}
      </p>
    </div>
  );
}
