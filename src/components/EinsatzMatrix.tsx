import type { Meldeliste } from "../types";
import { aggregateByName, assignToRoster, type PlayerAppearance, type TeamStats } from "../data/player-stats";
import { clubShort, fmtDay, rosterEntries } from "../data/kader";
import { ResultTile, TileLegend, WinLoss } from "./KaderBits";

// Einsatz-Matrix: wer hat an welchem Spieltag auf welcher Position gespielt —
// Zeilen = eingesetzte Personen (Reihenfolge der Meldeliste), Spalten =
// Spieltage. Je Spieltag zwei Kacheln: Einzel und Doppel, die Zahl ist die
// Position. Nur belegte Einsätze aus den Spielberichten.

function Slot({ app }: { app: PlayerAppearance | undefined }) {
  if (!app) return <span className="inline-flex h-[22px] w-[22px] items-center justify-center text-[12px] text-slate-500" aria-hidden="true">·</span>;
  const isDouble = app.position >= 7;
  return <ResultTile label={String(isDouble ? app.position - 6 : app.position)} won={app.won} size="sm" />;
}

function resultClass(own: number, opp: number): string {
  if (own > opp) return "bg-emerald-400/15 text-emerald-300";
  if (own < opp) return "bg-red-400/15 text-red-300";
  return "bg-slate-500/25 text-slate-200";
}

export default function EinsatzMatrix({ team, meldeliste }: { team: TeamStats; meldeliste?: Meldeliste }) {
  const listed = rosterEntries(meldeliste);
  const byName = aggregateByName(team);
  // Meldeposition je Person — bei doppelten Namen (Initialen) der richtige Eintrag
  const rankOf = new Map<string, { order: number; rang: number; lk: string }>();
  assignToRoster(listed, byName).forEach((agg, i) => {
    if (agg) rankOf.set(agg.name, { order: i, rang: listed[i].rang, lk: listed[i].lk });
  });
  const players = [...byName.values()]
    .filter((a) => !a.name.startsWith("—") && a.matches + a.doublesMatches > 0)
    .map((a) => ({ agg: a, meta: rankOf.get(a.name) }))
    .sort((x, y) => (x.meta?.order ?? 999) - (y.meta?.order ?? 999) || x.agg.avgPosition - y.agg.avgPosition || x.agg.name.localeCompare(y.agg.name));

  if (team.meetings.length === 0 || players.length === 0) {
    return (
      <p className="mx-3 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-4 text-center text-[12px] text-slate-400">
        Für {team.club} ist in dieser Saison noch keine Begegnung mit Spielbericht erfasst.
      </p>
    );
  }

  const sticky = "sticky left-0 z-10 bg-slate-950";
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th scope="col" className={`${sticky} min-w-[120px] px-3 pb-1 align-bottom text-[11px] font-bold uppercase tracking-wider text-slate-400`}>
                {team.meetings.length} Spieltag{team.meetings.length === 1 ? "" : "e"}
              </th>
              {team.meetings.map((m, i) => (
                <th key={i} scope="col" className="w-[54px] min-w-[54px] px-0.5 pb-1 text-center align-bottom font-normal" title={`${m.isHome ? "Heim gegen" : "Auswärts bei"} ${m.opponentClub}`}>
                  <span className="block text-[12px] font-extrabold leading-[15px] tabular-nums text-slate-100">{fmtDay(m.date) || "–"}</span>
                  <span className="mx-auto block max-w-[52px] truncate text-[11px] leading-[14px] text-slate-400">{clubShort(m.opponentClub)}</span>
                  <span className={`mt-[3px] inline-block rounded-full px-1.5 text-[12px] font-extrabold leading-5 tabular-nums ${resultClass(m.own, m.opp)}`}>{m.own}:{m.opp}</span>
                </th>
              ))}
              <th scope="col" className="w-10 min-w-10 px-3 pb-1 text-right align-bottom text-[11px] font-bold uppercase tracking-wider text-slate-400">Ges.</th>
            </tr>
            <tr aria-hidden="true" className="text-[11px] font-bold text-slate-400">
              <th className={`${sticky} border-b border-slate-500/40`} />
              {team.meetings.map((_, i) => (
                <th key={i} className="border-b border-slate-500/40 pb-0.5 text-center font-bold">
                  <span className="inline-flex gap-0.5"><span className="w-[22px]">E</span><span className="w-[22px]">D</span></span>
                </th>
              ))}
              <th className="border-b border-slate-500/40" />
            </tr>
          </thead>
          <tbody>
            {players.map(({ agg, meta }) => {
              const lk = (meta?.lk || agg.lk).replace(/^LK\s*/i, "");
              const sub = [meta ? `Rang ${meta.rang}` : "", lk ? `LK ${lk}` : ""].filter(Boolean).join(" · ");
              return (
                <tr key={agg.name}>
                  <th scope="row" className={`${sticky} max-w-[150px] border-b border-slate-600/25 px-3 py-1 font-normal`}>
                    <span className="block truncate text-[13px] font-bold leading-[17px] text-slate-100">{agg.name}</span>
                    <span className="block truncate text-[11px] leading-[14px] text-slate-400">{sub}</span>
                  </th>
                  {team.meetings.map((_, i) => (
                    <td key={i} className="border-b border-slate-600/25 px-0.5 py-1 text-center">
                      <span className="inline-flex gap-0.5 align-middle">
                        <Slot app={agg.singles.find((a) => a.meeting === i)} />
                        <Slot app={agg.doubles.find((a) => a.meeting === i)} />
                      </span>
                    </td>
                  ))}
                  <td className="border-b border-slate-600/25 px-3 py-1 text-right text-[13px]">
                    <WinLoss wins={agg.wins + agg.doublesWins} losses={agg.losses + agg.doublesLosses} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TileLegend className="px-3 pt-2.5" />
      <p className="px-3 pt-1.5 text-[11px] leading-snug text-slate-400">
        {players.length} {players.length === 1 ? "Person" : "Personen"} eingesetzt{listed.length ? `, ${listed.length} gemeldet` : ""}. Quelle: nuLiga-Spielberichte.
      </p>
    </div>
  );
}
