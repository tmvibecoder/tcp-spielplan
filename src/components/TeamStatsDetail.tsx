import { useState } from "react";
import type { TeamStats, PlayerAppearance } from "../data/player-stats";
import {
  aggregatePlayers,
  aggregateDoubles,
  parseLk,
} from "../data/player-stats";

interface TeamStatsDetailProps {
  team: TeamStats;
  rank?: number;
  accentColor: string;
  onBack: () => void;
}

type StatTab = "spieler" | "doppel";

function fmtAvg(p: number): string {
  return p.toFixed(1).replace(".", ",");
}

/** kleine LK-Pille (wird bei leerer LK nicht gerendert) */
function LkPill({ lk, own = false }: { lk: string; own?: boolean }) {
  if (!lk) return null;
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold leading-none whitespace-nowrap ${
        own ? "bg-sky-500/20 text-sky-200" : "bg-slate-700/60 text-slate-300"
      }`}
    >
      {lk}
    </span>
  );
}

function ResultBadge({ won }: { won: boolean }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-extrabold tracking-wide ${
        won ? "bg-emerald-900/60 text-emerald-200" : "bg-red-900/50 text-red-300"
      }`}
    >
      {won ? "SIEG" : "NIEDERL."}
    </span>
  );
}

/** Eine Begegnungs-Zeile im Drilldown (Einzel oder Doppel) */
function AppearanceRow({
  app,
  ownLk,
}: {
  app: PlayerAppearance;
  ownLk?: string;
}) {
  const oppLkVal = parseLk(app.opponentLk);
  const ownLkVal = ownLk ? parseLk(ownLk) : NaN;
  // "LK-Sieg": gegen besseren (niedrigeren) LK gewonnen
  const strongWin =
    app.won &&
    !Number.isNaN(oppLkVal) &&
    !Number.isNaN(ownLkVal) &&
    oppLkVal < ownLkVal;
  // Niederlage gegen schwächeren (höheren) LK
  const upset =
    !app.won &&
    !Number.isNaN(oppLkVal) &&
    !Number.isNaN(ownLkVal) &&
    oppLkVal > ownLkVal;

  return (
    <div className="flex items-center gap-2.5 border-t border-slate-700/30 py-2">
      <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded bg-slate-700/50 text-[10px] font-bold text-slate-300">
        {app.position}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-[13px] text-slate-200">
            vs <span className="font-semibold">{app.opponent}</span>
          </span>
          <LkPill lk={app.opponentLk} />
          {strongWin && (
            <span
              className="text-[10px] font-bold text-emerald-300"
              title="Sieg gegen besseren LK"
            >
              ▲ LK-Sieg
            </span>
          )}
          {upset && (
            <span
              className="text-[10px] font-bold text-red-300/80"
              title="Niederlage gegen schwächeren LK"
            >
              ▼
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[11px] text-slate-500">
          {app.opponentClub} · {app.score}
        </div>
      </div>
      <ResultBadge won={app.won} />
    </div>
  );
}

export default function TeamStatsDetail({
  team,
  rank,
  accentColor,
  onBack,
}: TeamStatsDetailProps) {
  const [tab, setTab] = useState<StatTab>("spieler");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const players = aggregatePlayers(team);
  const doubles = aggregateDoubles(team);

  const toggle = (key: string) =>
    setOpenKey((cur) => (cur === key ? null : key));

  return (
    <div className="animate-[fadeIn_200ms_ease-out]">
      {/* Kopf mit Zurück-Button */}
      <div className="flex items-center gap-3 px-1 pb-2">
        <button
          onClick={onBack}
          className="flex-none rounded-lg border border-slate-600/50 bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-slate-700/60"
        >
          ‹ Tabelle
        </button>
        <div className="min-w-0">
          <div className="truncate text-base font-extrabold text-slate-100">
            {team.club}
          </div>
          <div className="truncate text-[11px] text-slate-400">
            {team.teamLabel} · {team.leagueName}
            {rank ? ` · Platz ${rank}` : ""}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-2 flex gap-1 px-1">
        {(
          [
            ["spieler", `Spieler (${players.length})`],
            ["doppel", `Doppel (${doubles.length})`],
          ] as [StatTab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              setOpenKey(null);
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
              tab === key
                ? "text-slate-900"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            }`}
            style={tab === key ? { backgroundColor: accentColor } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mb-2 px-2 text-[10px] text-slate-500">
        Sortiert nach Ø-Position (1 = oben). <b className="text-slate-400">LK</b>{" "}
        = Leistungsklasse des Gegners · Quelle: nuLiga-Spielberichte.
      </p>

      {/* ── Spieler-Tab ── */}
      {tab === "spieler" && (
        <div className="space-y-1.5">
          {players.map((p) => {
            const key = `s-${p.name}`;
            const isOpen = openKey === key;
            return (
              <div
                key={key}
                className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/30"
              >
                <button
                  onClick={() => toggle(key)}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-700/30"
                >
                  <span
                    className="inline-flex flex-none items-center justify-center rounded-md px-1.5 py-1 text-[11px] font-extrabold"
                    style={{
                      backgroundColor: accentColor + "22",
                      color: accentColor,
                    }}
                  >
                    Ø{fmtAvg(p.avgPosition)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[14px] font-bold text-slate-100">
                        {p.name}
                      </span>
                      <LkPill lk={p.lk} own />
                    </div>
                  </div>
                  <div className="flex-none text-right text-[11px] text-slate-400">
                    <span className="font-bold text-slate-200">{p.matches}</span>{" "}
                    Eins. ·{" "}
                    <span className="font-bold text-emerald-400">{p.wins}</span>
                    <span className="text-slate-500">:</span>
                    <span className="font-bold text-red-400">{p.losses}</span>
                  </div>
                  <span className="flex-none text-[11px] text-slate-500">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-3 pb-2.5">
                    {p.singles.map((app, i) => (
                      <AppearanceRow key={i} app={app} ownLk={p.lk} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Doppel-Tab ── */}
      {tab === "doppel" && (
        <div className="space-y-1.5">
          {doubles.map((d) => {
            const key = `d-${d.label}`;
            const isOpen = openKey === key;
            return (
              <div
                key={key}
                className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/30"
              >
                <button
                  onClick={() => toggle(key)}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-700/30"
                >
                  <span className="inline-flex flex-none items-center justify-center rounded-md bg-teal-500/15 px-1.5 py-1 text-[12px] font-extrabold text-teal-300">
                    🤝
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="truncate text-[14px] font-bold text-slate-100">
                      {d.label}
                    </span>
                  </div>
                  <div className="flex-none text-right text-[11px] text-slate-400">
                    <span className="font-bold text-slate-200">{d.matches}</span>{" "}
                    Eins. ·{" "}
                    <span className="font-bold text-emerald-400">{d.wins}</span>
                    <span className="text-slate-500">:</span>
                    <span className="font-bold text-red-400">{d.losses}</span>
                  </div>
                  <span className="flex-none text-[11px] text-slate-500">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-3 pb-2.5">
                    {d.appearances.map((app, i) => (
                      <AppearanceRow key={i} app={app} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
