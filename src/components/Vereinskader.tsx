import { useMemo, useState, type CSSProperties } from "react";
import type { LeagueStandings, SeasonId, Team } from "../types";
import { useGroups } from "../data/store";
import { baseClub } from "../data/player-key";
import { parseLk } from "../data/player-stats";
import { isProtectedName } from "../data/kader";
import { LkCell } from "./KaderBits";

// Vereinskader (seit 24.11.2026): wer ist in welcher eigenen Mannschaft auf
// welchem Rang gemeldet — eine Zeile je Person, eine Spalte je Mannschaft,
// sortiert nach LK. Quelle sind ausschließlich die Meldelisten der eigenen
// Mannschaften der gewählten Saison.
//
// Datenschutz: nur Erwachsenen-Konkurrenzen (Herren, Damen, Mixed). Geschützte
// Einträge (Initialen — Minderjährige, Sperrliste) erscheinen hier gar nicht:
// über Mannschaften hinweg ließen sich gleiche Initialen nicht sicher derselben
// Person zuordnen, und eine solche Zusammenführung soll es für sie nicht geben.

type Gender = "herren" | "damen";

interface Props {
  season: SeasonId;
  seasonLabel: string;
  teams: Team[];
  standings: LeagueStandings[];
  onBack: () => void;
  /** Person antippen → Spielerhistorie (Schlüssel: Verein + Name) */
  onOpenPlayer?: (club: string, name: string) => void;
}

interface Person {
  name: string;
  lk: string;
  ranks: (number | undefined)[];
  teams: number;
}

const FALLBACK_CLUB = "TC Pliening";
const ACCENT: Record<Gender, string> = { herren: "#38bdf8", damen: "#fbbf24" };

export default function Vereinskader({ season, seasonLabel, teams, standings, onBack, onOpenPlayer }: Props) {
  const [gender, setGender] = useState<Gender>("herren");
  const [multiOnly, setMultiOnly] = useState(false);

  const adult = useMemo(() => teams.filter((t) => /^(Herren|Damen|Mixed)/.test(t.label)), [teams]);
  const leagues = useMemo(() => adult.map((t) => t.league), [adult]);
  const { data: groups, loading, error } = useGroups(season, leagues);

  const view = useMemo(() => {
    const build = (g: Gender) => {
      const cols = adult
        .map((t, i) => {
          // Vereinsname der eigenen Mannschaft exakt wie in der Tabelle („TC Pliening II")
          const own = standings.find((s) => s.leagueName === t.league && s.teamLabel === t.label)?.entries.find((e) => e.isOwnClub)?.club;
          const rosters = groups?.[i]?.rosters ?? [];
          const roster = rosters.find((r) => r.club === own) ?? rosters.find((r) => baseClub(r.club) === FALLBACK_CLUB);
          const all = roster?.[g] ?? [];
          return { team: t, total: all.length, list: all.filter((e) => !isProtectedName(e.name)) };
        })
        .filter((c) => c.list.length > 0);
      const byName = new Map<string, Person>();
      cols.forEach((c, ci) => {
        for (const e of c.list) {
          let p = byName.get(e.name);
          if (!p) {
            p = { name: e.name, lk: e.lk, ranks: cols.map(() => undefined), teams: 0 };
            byName.set(e.name, p);
          }
          if (!p.lk) p.lk = e.lk;
          if (p.ranks[ci] === undefined) p.teams++;
          p.ranks[ci] = e.rang;
        }
      });
      const lkOf = (p: Person) => { const v = parseLk(p.lk); return Number.isNaN(v) ? 99 : v; };
      const persons = [...byName.values()].sort((a, b) => lkOf(a) - lkOf(b) || a.name.localeCompare(b.name));
      return { cols, persons };
    };
    return { herren: build("herren"), damen: build("damen") };
  }, [adult, groups, standings]);

  const { cols, persons } = view[gender];
  const rows = multiOnly ? persons.filter((p) => p.teams > 1) : persons;
  const club = baseClub(standings.flatMap((s) => s.entries).find((e) => e.isOwnClub)?.club ?? FALLBACK_CLUB);
  const sticky = "sticky left-0 z-10 bg-slate-950";
  const chip = (on: boolean) =>
    `h-11 whitespace-nowrap rounded-full border px-3 text-[13px] font-bold ${
      on ? "border-[var(--accent)] bg-[var(--accent)] text-slate-950" : "border-slate-500/40 bg-slate-800/70 text-slate-200"
    }`;

  return (
    <div className="-mx-3 animate-[fadeIn_200ms_ease-out]" style={{ "--accent": ACCENT[gender] } as CSSProperties}>
      <div className="flex items-center gap-2.5 px-3 pb-2.5">
        <button
          type="button"
          onClick={onBack}
          className="h-11 shrink-0 rounded-lg border border-slate-500/50 bg-slate-800/70 px-3 text-[13px] font-bold text-sky-300 active:bg-slate-700/70"
        >
          ‹ Zurück
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[17px] font-extrabold leading-[21px] text-slate-50">Vereinskader</h2>
          <p className="truncate text-[12px] leading-4 text-slate-400">{club} · {seasonLabel} · wer ist wo gemeldet</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-3 pb-2.5">
        {(["herren", "damen"] as Gender[]).map((g) => (
          <button key={g} type="button" aria-pressed={gender === g} onClick={() => setGender(g)} className={chip(gender === g)}>
            {g === "herren" ? "Herren" : "Damen"} <span className="tabular-nums">{view[g].persons.length}</span>
          </button>
        ))}
        <button type="button" aria-pressed={multiOnly} onClick={() => setMultiOnly((v) => !v)} className={chip(multiOnly)}>
          Mehrfach gemeldet <span className="tabular-nums">{persons.filter((p) => p.teams > 1).length}</span>
        </button>
      </div>

      {loading && <p className="px-3 py-8 text-center text-sm text-slate-400">Meldelisten werden geladen …</p>}
      {error && <p className="px-3 py-8 text-center text-sm text-red-300">Die Meldelisten konnten nicht geladen werden.</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="mx-3 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-4 text-center text-[12px] text-slate-400">
          {persons.length === 0
            ? `Für die ${gender === "herren" ? "Herren" : "Damen"} ist in dieser Saison keine Meldeliste erfasst.`
            : "Niemand ist in mehr als einer Mannschaft gemeldet."}
        </p>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th scope="col" className={`${sticky} w-full min-w-[132px] max-w-0 border-b border-slate-500/40 px-3 pb-1 align-bottom text-[11px] font-bold uppercase tracking-wider text-slate-400`}>
                  Spieler
                </th>
                <th scope="col" className="w-[50px] min-w-[50px] border-b border-slate-500/40 px-[3px] pb-1 text-center align-bottom text-[11px] font-bold uppercase tracking-wider text-slate-400">LK</th>
                {cols.map((c) => (
                  <th key={c.team.id} scope="col" className="w-[44px] min-w-[44px] border-b border-slate-500/40 px-0.5 pb-1 text-center align-bottom font-normal last:w-[52px] last:min-w-[52px] last:pr-2.5" title={`${c.team.label} · ${c.team.league}`}>
                    <span className="block whitespace-nowrap text-[12px] font-extrabold leading-[15px] text-[var(--accent)]">{c.team.shortLabel}</span>
                    <span className="block text-[11px] leading-[14px] tabular-nums text-slate-400">{c.total}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.name}>
                  <th scope="row" className={`${sticky} w-full min-w-[132px] max-w-0 border-b border-slate-600/25 p-0 font-normal`}>
                    <button
                      type="button"
                      onClick={onOpenPlayer ? () => onOpenPlayer(club, p.name) : undefined}
                      className={`flex min-h-[44px] w-full flex-col justify-center px-3 py-1 text-left ${onOpenPlayer ? "active:bg-slate-700/40" : "cursor-default"}`}
                    >
                      <span className="block max-w-full truncate text-[13px] font-bold leading-[17px] text-slate-100">{p.name}</span>
                      {p.teams > 1 && (
                        <span className={`block text-[11px] leading-[14px] ${p.teams > 2 ? "font-semibold text-[var(--accent)]" : "text-slate-400"}`}>{p.teams} Mannschaften</span>
                      )}
                    </button>
                  </th>
                  <td className="border-b border-slate-600/25 px-[3px] text-center"><LkCell lk={p.lk} /></td>
                  {p.ranks.map((r, i) => (
                    <td key={cols[i].team.id} className="border-b border-slate-600/25 px-0.5 text-center last:pr-2.5">
                      {r !== undefined ? (
                        <span className="inline-flex h-[26px] w-9 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] text-[13px] font-extrabold tabular-nums text-slate-50">{r}</span>
                      ) : (
                        <span className="text-[12px] text-slate-500" aria-hidden="true">·</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && persons.length > 0 && (
        <p className="px-3 pt-2.5 text-[11px] leading-snug text-slate-400">
          Sortiert nach LK. Zahl = Rang in der Meldeliste der jeweiligen Mannschaft, unter dem Kürzel steht die Zahl der dort Gemeldeten —
          laut BTV beim letzten Abruf. Nur Erwachsenen-Konkurrenzen; Einträge, die in der App nur mit Initialen erscheinen, sind hier nicht enthalten.
        </p>
      )}
    </div>
  );
}
