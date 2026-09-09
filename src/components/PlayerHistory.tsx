import { useMemo, useState } from "react";
import { getPlayer, compareSeasons, type Appearance } from "../data/player-history";
import { getAllSpielberichte } from "../data/spielberichte";
import { ALL_SEASONS } from "../data/seasons";
import { SEASON_DATA } from "../data/season-data";
import type { SeasonId } from "../types";
import { setCellClass, viewOutcome } from "../utils/spielbericht";
import LkBadge from "./LkBadge";
import SpielberichtDrawer from "./SpielberichtDrawer";

// Spielerhistorie: alle Einzel und Doppel einer Person über alle erfassten
// Saisons (ab Winter 2024/25), nach Saison getrennt, neueste zuerst.
// Farben IMMER aus Sicht des betrachteten Spielers (Entscheidung 09.09.2026):
// grün = er hat gewonnen, rot = er hat verloren — auch gegen den TC Pliening.
// Zeilen gegen Pliening tragen nur eine kleine „TCP"-Marke (Anker für den Filter).

interface Props {
  playerKey: string;
  onBack: () => void;
  backLabel?: string;
}

const seasonMeta = new Map(ALL_SEASONS.map((s) => [s.id, s]));

function fmtDate(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y.slice(2)}`;
}

function Row({ a, onOpen }: { a: Appearance; onOpen: () => void }) {
  const isTcpPlayer = /pliening/i.test(a.club);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full rounded-lg border px-2.5 py-2 text-left hover:bg-slate-700/30 ${
        a.vsTcp ? "border-sky-500/30 bg-slate-800/40" : "border-slate-700/50 bg-slate-800/30"
      }`}
    >
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <span className="font-mono">{fmtDate(a.date)}</span>
        <span className="rounded bg-slate-700/60 px-1.5 py-[1px] text-[10px] font-extrabold text-slate-100">{a.posLabel}</span>
        {a.type === "doubles" && a.partner ? (
          <span className="min-w-0 truncate">
            mit <b className="font-semibold text-slate-300">{a.partner}</b>
          </span>
        ) : (
          <span className="min-w-0 truncate">{a.isHome ? "vs" : "bei"} {a.opponentClub}</span>
        )}
        {a.vsTcp && !isTcpPlayer && (
          <span className="ml-auto rounded border border-slate-500/40 bg-slate-500/15 px-1 py-[1px] text-[9px] font-extrabold tracking-wider text-slate-300">
            TCP
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 text-[13px] leading-tight text-slate-200">
          {a.type === "doubles" ? (
            <>
              <span className="truncate">vs {a.opponents.map((o) => o.name.split(",")[0]).join(" / ")}</span>
              <span className="block text-[10.5px] text-slate-500">{a.opponentClub}</span>
            </>
          ) : (
            <span className="flex flex-wrap items-center gap-1.5">
              <b className="font-bold">{a.opponents[0]?.name ?? "—"}</b>
              {a.opponents[0]?.lk && <LkBadge lk={a.opponents[0].lk} tone="opp" />}
              {a.lk && (
                <span className="text-[10px] text-slate-500">
                  eigene <LkBadge lk={a.lk} tone="own" />
                </span>
              )}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 tabular-nums">
          {a.sets.length === 0 ? (
            <span className="text-[10px] text-slate-500">w.o.</span>
          ) : (
            a.sets.map((s, i) => (
              <span key={i} className={`h-6 w-[26px] rounded text-center text-[12px] leading-6 ${setCellClass(viewOutcome(s.won))}`}>
                {s.own}
              </span>
            ))
          )}
        </div>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-wide ${
            a.won ? "bg-emerald-900/60 text-emerald-200" : "bg-red-900/50 text-red-300"
          }`}
        >
          {a.won ? "SIEG" : "NIEDERL."}
        </span>
      </div>
    </button>
  );
}

export default function PlayerHistory({ playerKey, onBack, backLabel = "Zurück" }: Props) {
  const player = getPlayer(playerKey);
  const [onlyTcp, setOnlyTcp] = useState(false);
  const [open, setOpen] = useState<Appearance | null>(null);

  const bySeason = useMemo(() => {
    const map = new Map<SeasonId, Appearance[]>();
    for (const a of player?.appearances ?? []) {
      if (onlyTcp && !a.vsTcp) continue;
      const list = map.get(a.season) ?? [];
      list.push(a);
      map.set(a.season, list);
    }
    return map;
  }, [player, onlyTcp]);

  // Datenlücken: Saisons ganz ohne Spielberichte im Datenbestand — eine Runde,
  // die noch nicht begonnen hat, ist keine Lücke.
  const gaps = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const notStarted = (id: SeasonId) => {
      const d = SEASON_DATA[id];
      return !!d && d.matches.every((m) => m.date > today);
    };
    return ALL_SEASONS.filter((s) => !notStarted(s.id) && getAllSpielberichte(s.id).length === 0).map((s) => s.id);
  }, []);

  if (!player) {
    return (
      <div className="px-1">
        <button type="button" onClick={onBack} className="mb-3 rounded-lg border border-slate-600/50 bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-sky-300">
          ‹ {backLabel}
        </button>
        <p className="text-sm text-slate-400">Spieler nicht gefunden.</p>
      </div>
    );
  }

  const singles = player.appearances.filter((a) => a.type === "singles").length;
  const doubles = player.appearances.length - singles;
  const isTcp = /pliening/i.test(player.club);
  const seasonsShown = [...new Set([...player.seasons, ...(onlyTcp ? [] : [])])].sort(compareSeasons);

  return (
    <div className="animate-[fadeIn_200ms_ease-out]">
      <div className="flex items-start gap-3 px-1 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-none rounded-lg border border-slate-600/50 bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-slate-700/60"
        >
          ‹ {backLabel}
        </button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-extrabold text-slate-100">{player.name}</span>
            <LkBadge lk={player.lk} tone={isTcp ? "own" : "opp"} size="md" />
          </div>
          <div className="text-[11px] leading-snug text-slate-400">
            {player.club}
            {player.teams[0]?.teamLabel ? ` · ${player.teams[0].teamLabel}` : ""}
            {" · "}
            {singles} Einzel · {doubles} Doppel seit {seasonMeta.get(player.seasons[player.seasons.length - 1])?.label ?? "—"}
          </div>
        </div>
      </div>

      {!isTcp && (
        <button
          type="button"
          role="switch"
          aria-checked={onlyTcp}
          onClick={() => setOnlyTcp((v) => !v)}
          className="mb-3 flex w-full items-center justify-between rounded-xl border border-slate-700/60 bg-slate-800/40 px-3 py-2 text-left"
        >
          <span className="text-[12.5px] font-semibold text-slate-200">Nur gegen TC Pliening</span>
          <span className={`relative h-[22px] w-10 rounded-full transition-colors ${onlyTcp ? "bg-blue-600" : "bg-slate-600"}`}>
            <span className={`absolute top-[3px] h-4 w-4 rounded-full bg-slate-100 transition-all ${onlyTcp ? "left-[21px]" : "left-[3px]"}`} />
          </span>
        </button>
      )}

      <div className="space-y-4">
        {seasonsShown.map((sid) => {
          const meta = seasonMeta.get(sid);
          const rows = bySeason.get(sid) ?? [];
          const teams = player.teams.filter((t) => t.season === sid);
          const nS = rows.filter((a) => a.type === "singles").length;
          const nD = rows.length - nS;
          return (
            <section key={sid}>
              <div className="flex items-baseline justify-between gap-2 px-1 pb-1.5">
                <span className="text-[13px] font-extrabold text-slate-100">
                  {meta?.icon} {meta?.label ?? sid}
                  {teams[0] && <span className="ml-1.5 text-[11px] font-semibold text-slate-400">{teams.map((t) => t.teamLabel || t.league).join(", ")}</span>}
                </span>
                <span className="text-[10.5px] text-slate-400">
                  {rows.length ? `${nS} Einzel · ${nD} Doppel` : onlyTcp ? "kein Spiel gegen TCP" : "kein Einsatz erfasst"}
                </span>
              </div>
              {rows.length > 0 ? (
                <div className="space-y-1">
                  {rows.map((a, i) => (
                    <Row key={`${a.match.id}-${i}`} a={a} onOpen={() => setOpen(a)} />
                  ))}
                </div>
              ) : gaps.includes(sid) ? (
                <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11.5px] leading-snug text-amber-200">
                  <b className="font-extrabold">Datenlücke:</b> Für {meta?.label} sind noch keine Spielberichte erfasst.
                </p>
              ) : (
                <p className="px-1 text-[11px] text-slate-500">
                  {onlyTcp ? "In dieser Saison nicht gegen den TC Pliening gespielt." : "Gemeldet, aber ohne erfassten Einsatz."}
                </p>
              )}
            </section>
          );
        })}
        {gaps.filter((g) => !seasonsShown.includes(g)).length > 0 && (
          <p className="px-1 text-[10.5px] leading-snug text-slate-500">
            Ohne Spielberichte im Datenbestand: {gaps.filter((g) => !seasonsShown.includes(g)).map((g) => seasonMeta.get(g)?.label ?? g).join(", ")} — dort kann ein Einsatz fehlen.
          </p>
        )}
      </div>

      <SpielberichtDrawer
        open={open !== null}
        onClose={() => setOpen(null)}
        meeting={
          open
            ? {
                league: `${open.teamLabel ? open.teamLabel + " · " : ""}${open.league}`,
                homeClub: open.report.homeClub,
                awayClub: open.report.awayClub,
                finalHome: open.report.finalHome,
                finalAway: open.report.finalAway,
                date: open.report.date,
                day: open.report.day,
              }
            : null
        }
        matches={open?.report.matches ?? null}
      />
    </div>
  );
}
