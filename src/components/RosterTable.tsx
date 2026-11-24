import { useMemo, useState } from "react";
import type { Meldeliste, SeasonId } from "../types";
import type { ClubData } from "../data/data-format";
import { aggregateByName, assignToRoster, parseLk, type PlayerAgg, type PlayerAppearance, type TeamStats } from "../data/player-stats";
import { playerProfile, type PlayerProfile } from "../data/player-history";
import { posLabel } from "../data/history-index";
import { fmtDay, isProtectedName } from "../data/kader";
import { Bilanz12Cell, FormDots, LkCell, ResultTile } from "./KaderBits";

// Die Kaderliste — seit 24.11.2026 eine einzige, kompakte Darstellung für alle
// Stellen der App (Tabelle, Suche, Begegnung): flache Zeilen statt Karten,
// LK und 12-Monats-Bilanz als feste Spalten, wer in dieser Saison gespielt hat,
// ist in der Mannschaftsfarbe hervorgehoben. Antippen klappt die Person auf:
// Einzel und Doppel der Saison, Formverlauf, weitere Mannschaften, Historie.
// Die Akzentfarbe kommt als CSS-Variable --accent vom umgebenden Element.

type Filter = "alle" | "einsatz" | "aktiv";

interface Row {
  key: string;
  /** Meldeposition, 0 = ohne Meldelisten-Eintrag */
  rank: number;
  name: string;
  lk: string;
  jahrgang?: number;
  agg?: PlayerAgg;
  profile: PlayerProfile;
  played: boolean;
}

interface Section {
  label: string;
  rows: Row[];
}

interface RosterTableProps {
  team: TeamStats;
  meldeliste?: Meldeliste;
  /** Nachgeladene Vereinsdaten: 12-Monats-Bilanz, Formverlauf, weitere Mannschaften */
  clubData?: ClubData;
  season: SeasonId;
  /** Spieler-Detail → Spielerhistorie (Schlüssel: Verein + Name) */
  onOpenPlayer?: (club: string, name: string) => void;
}

/** Eine Begegnung im aufgeklappten Spieler bzw. Doppel-Paar. */
export function AppearanceLine({ app, ownLk }: { app: PlayerAppearance; ownLk?: string }) {
  const isDouble = app.position >= 7;
  const oppLk = parseLk(app.opponentLk);
  const own = ownLk ? parseLk(ownLk) : NaN;
  const comparable = !isDouble && !Number.isNaN(oppLk) && !Number.isNaN(own);
  // „LK-Sieg": gegen die bessere (niedrigere) LK gewonnen; umgekehrt ein Dämpfer
  const strongWin = comparable && app.won && oppLk < own;
  const upset = comparable && !app.won && oppLk > own;
  const where = [fmtDay(app.date), app.opponentClub].filter(Boolean).join(" · ");
  return (
    <div className="flex items-center gap-2.5 border-t border-slate-600/30 py-1.5 first:border-t-0">
      <ResultTile label={posLabel(app.position)} won={app.won} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold leading-[17px] text-slate-100">
          {isDouble ? (app.partner ? `mit ${app.partner}` : `gegen ${app.opponent}`) : app.opponent}
          {!isDouble && app.opponentLk && (
            <span className="ml-1.5 font-semibold text-slate-400">{app.opponentLk.replace(/^LK\s*/i, "LK ")}</span>
          )}
        </div>
        <div className="truncate text-[11px] leading-[14px] text-slate-400">
          {isDouble && app.partner ? `gegen ${app.opponent} · ` : ""}
          {where}
          {strongWin && <span className="font-bold text-emerald-300" title="Sieg gegen bessere LK"> · ▲ LK-Sieg</span>}
          {upset && <span className="font-bold text-red-300" title="Niederlage gegen schwächere LK"> · ▼</span>}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[13px] font-extrabold leading-[17px] tabular-nums text-slate-100">{app.score || "w.o."}</div>
        <div className={`text-[11px] font-bold leading-[14px] ${app.won ? "text-emerald-400" : "text-red-300"}`}>{app.won ? "Sieg" : "Niederlage"}</div>
      </div>
    </div>
  );
}

const byDate = (a: PlayerAppearance, b: PlayerAppearance) => (a.date ?? "").localeCompare(b.date ?? "") || a.position - b.position;

function usageText(agg: PlayerAgg | undefined): string {
  if (!agg) return "";
  const parts: string[] = [];
  if (agg.matches) parts.push(`Einzel ${agg.wins}:${agg.losses}`);
  if (agg.doublesMatches) parts.push(`Doppel ${agg.doublesWins}:${agg.doublesLosses}`);
  return parts.join(" · ");
}

function RosterRow({ row, club, isOpen, onToggle, onOpenPlayer }: {
  row: Row;
  club: string;
  isOpen: boolean;
  onToggle: () => void;
  onOpenPlayer?: (club: string, name: string) => void;
}) {
  const { agg, profile, played } = row;
  const usage = usageText(agg);
  const canOpenHistory = !!onOpenPlayer && profile.known;
  const hasDetail = played || profile.form.length > 0 || profile.otherTeams.length > 0 || canOpenHistory;
  const matches = agg ? [...agg.singles, ...agg.doubles].sort(byDate) : [];
  return (
    <div className={`border-b border-slate-600/25 ${isOpen ? "bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]" : ""}`}>
      <button
        type="button"
        onClick={hasDetail ? onToggle : undefined}
        aria-expanded={hasDetail ? isOpen : undefined}
        className={`flex min-h-[44px] w-full items-center gap-2 px-3 py-1 text-left ${
          played ? "bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]" : ""
        } ${hasDetail ? "active:bg-slate-700/40" : "cursor-default"}`}
      >
        <span className={`w-5 shrink-0 text-[13px] font-extrabold tabular-nums ${played ? "text-[var(--accent)]" : "text-slate-400"}`}>
          {row.rank || "–"}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-[14px] leading-[18px] ${played ? "font-extrabold text-slate-50" : "font-semibold text-slate-200"}`}>
            {row.name}
          </span>
          {(row.jahrgang || usage) && (
            <span className="block truncate text-[11px] leading-[14px] text-slate-400">
              {row.jahrgang ? `Jg. ${row.jahrgang}` : ""}
              {row.jahrgang && usage ? " · " : ""}
              {usage && <span className="font-semibold text-slate-200">{usage}</span>}
            </span>
          )}
        </span>
        <LkCell lk={row.lk} played={played} />
        {isProtectedName(row.name) ? (
          // Geschützte Einträge haben keine Historie — „keine" wäre hier eine falsche Aussage
          <span className="block w-14 shrink-0 text-right text-[11px] text-slate-500" title="Für geschützte Einträge wird keine Bilanz geführt">–</span>
        ) : (
          <Bilanz12Cell balance={profile.balance} />
        )}
        <span className={`w-2.5 shrink-0 text-center text-[10px] ${hasDetail ? "text-slate-400" : "text-transparent"}`} aria-hidden="true">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && hasDetail && (
        <div className="space-y-3 px-3 pb-3 pt-1.5">
          {matches.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Diese Saison</p>
              <div className="mt-0.5">
                {matches.map((app, i) => <AppearanceLine key={i} app={app} ownLk={row.lk} />)}
              </div>
            </div>
          )}
          {profile.form.length > 0 && (
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                <span className="mr-auto text-[11px] font-bold uppercase tracking-wider text-slate-400">Form · 12 Monate</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />{profile.balance.wins} Sieg{profile.balance.wins === 1 ? "" : "e"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-red-400" />{profile.balance.losses} Niederlage{profile.balance.losses === 1 ? "" : "n"}
                </span>
              </div>
              <FormDots form={profile.form} />
            </div>
          )}
          {profile.otherTeams.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Diese Saison auch in</span>
              {profile.otherTeams.map((t) => (
                <span key={t} className="rounded-full bg-slate-600/40 px-2.5 py-1 text-[12px] font-bold leading-none text-slate-200">{t}</span>
              ))}
            </div>
          )}
          {canOpenHistory && (
            <button
              type="button"
              onClick={() => onOpenPlayer!(club, row.name)}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-sky-400/45 bg-sky-500/15 text-[13px] font-bold text-sky-200 active:bg-sky-500/25"
            >
              Spielerhistorie über alle Saisons ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function RosterTable({ team, meldeliste, clubData, season, onOpenPlayer }: RosterTableProps) {
  const [filter, setFilter] = useState<Filter>("alle");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const sections = useMemo<Section[]>(() => {
    const aggByName = aggregateByName(team);
    const profileOf = (name: string) => playerProfile(clubData, team.club, name, season, team.leagueName);
    const row = (key: string, rank: number, name: string, lk: string, jahrgang: number | undefined, agg: PlayerAgg | undefined): Row => {
      return {
        key, rank, name, jahrgang, agg,
        // Meldelisten-LK = aktuelle LK beim letzten Abruf; die LK aus dem
        // Spielbericht ist nur der Stand des Spieltags und dient als Rückfall
        lk: lk || agg?.lk || "",
        profile: profileOf(name),
        played: !!agg && agg.matches + agg.doublesMatches > 0,
      };
    };
    if (!meldeliste) {
      // Ohne Meldeliste: alle Eingesetzten, die oberen Einzel-Positionen zuerst
      const rows = [...aggByName.values()]
        .filter((a) => !a.name.startsWith("—"))
        .map((a) => row(`p-${a.name}`, 0, a.name, a.lk, undefined, a));
      return rows.length ? [{ label: "", rows }] : [];
    }
    const listed = new Set([...meldeliste.herren, ...meldeliste.damen].map((e) => e.name));
    const out: Section[] = [];
    const both = meldeliste.herren.length > 0 && meldeliste.damen.length > 0;
    for (const [label, entries] of [["Herren", meldeliste.herren], ["Damen", meldeliste.damen]] as const) {
      if (entries.length === 0) continue;
      // Bilanz je Eintrag — bei doppelten Namen (Initialen) nur einmal vergeben
      const aggs = assignToRoster(entries, aggByName);
      out.push({
        label: both ? label : "",
        rows: entries.map((e, i) => row(`${label}-${e.rang}-${e.name}`, e.rang, e.name, e.lk, e.jahrgang, aggs[i])),
      });
    }
    // Eingesetzte ohne Meldelisten-Eintrag (Ersatz aus anderen Mannschaften des
    // Vereins). „— (w.o.)"-Platzhalter gehören in keine Liste.
    const extra = [...aggByName.values()]
      .filter((a) => !listed.has(a.name) && !a.name.startsWith("—"))
      .map((a) => row(`x-${a.name}`, 0, a.name, a.lk, undefined, a));
    if (extra.length) out.push({ label: "Weitere Einsätze", rows: extra });
    return out;
  }, [team, meldeliste, clubData, season]);

  const all = sections.flatMap((s) => s.rows);
  const nPlayed = all.filter((r) => r.played).length;
  const nActive = all.filter((r) => r.profile.balance.played > 0).length;
  const keep = (r: Row) => filter === "alle" || (filter === "einsatz" ? r.played : r.profile.balance.played > 0);
  const visible = sections.map((s) => ({ ...s, rows: s.rows.filter(keep) })).filter((s) => s.rows.length > 0);

  if (all.length === 0) {
    return (
      <p className="mx-3 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-3 text-center text-[12px] text-slate-400">
        Für {team.club} ist in dieser Saison noch keine Meldeliste erfasst.
      </p>
    );
  }

  const chips: [Filter, string, number][] = [
    ["alle", "Alle", all.length],
    // Vor dem ersten Spieltag gäbe „Im Einsatz" nur eine leere Liste
    ...(nPlayed > 0 ? [["einsatz", "Im Einsatz", nPlayed] as [Filter, string, number]] : []),
    // Die 12-Monats-Bilanz braucht die nachgeladenen Vereinsdaten
    ...(clubData && nActive > 0 ? [["aktiv", "Aktiv 12 Mon.", nActive] as [Filter, string, number]] : []),
  ];

  return (
    <div>
      {all.length > 6 && chips.length > 1 && (
        <div className="flex flex-wrap gap-2 px-3 pb-2">
          {chips.map(([key, label, n]) => (
            <button
              key={key}
              type="button"
              onClick={() => { setFilter(key); setOpenKey(null); }}
              aria-pressed={filter === key}
              className={`h-11 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-bold ${
                filter === key
                  ? "border-[var(--accent)] bg-[var(--accent)] text-slate-950"
                  : "border-slate-500/40 bg-slate-800/70 text-slate-200"
              }`}
            >
              {label} <span className="tabular-nums">{n}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex h-6 items-center gap-2 border-b border-slate-500/40 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <span className="w-5 shrink-0">#</span>
        <span className="min-w-0 flex-1">Spieler</span>
        <span className="w-11 shrink-0 text-center">LK</span>
        <span className="w-14 shrink-0 text-right">12 Mon.</span>
        <span className="w-2.5 shrink-0" />
      </div>

      {visible.length === 0 && (
        <p className="px-3 py-4 text-center text-[12px] text-slate-400">
          {filter === "einsatz" ? "In dieser Saison war noch niemand im Einsatz." : "Niemand mit Matches in den letzten 12 Monaten."}
        </p>
      )}
      {visible.map((s) => (
        <div key={s.label || "liste"}>
          {s.label && (
            <p className="border-b border-slate-600/25 bg-slate-800/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">
              {s.label} <span className="tabular-nums text-slate-400">{s.rows.length}</span>
            </p>
          )}
          {s.rows.map((r) => (
            <RosterRow
              key={r.key}
              row={r}
              club={team.club}
              isOpen={openKey === r.key}
              onToggle={() => setOpenKey((cur) => (cur === r.key ? null : r.key))}
              onOpenPlayer={onOpenPlayer}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
