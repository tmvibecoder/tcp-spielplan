import { useState } from "react";
import type { TeamStats, PlayerAppearance, PlayerAgg } from "../data/player-stats";
import {
  aggregatePlayers,
  aggregateDoubles,
  parseLk,
  normalizePlayerName,
} from "../data/player-stats";
import type { Meldeliste, MeldelistenEintrag } from "../types";

interface TeamStatsDetailProps {
  team: TeamStats;
  rank?: number;
  accentColor: string;
  onBack: () => void;
  /** Komplette namentliche Meldeliste (falls vorhanden, z. B. Mixed Gr. 074):
   *  der Spieler-Tab zeigt dann ALLE gemeldeten Spieler statt nur der eingesetzten. */
  meldeliste?: Meldeliste;
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
          {app.partner ? (
            <span className="truncate text-[13px] text-slate-200">
              mit <span className="font-semibold">{app.partner}</span>
            </span>
          ) : (
            <span className="truncate text-[13px] text-slate-200">
              vs <span className="font-semibold">{app.opponent}</span>
            </span>
          )}
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
          {app.partner && (
            <>
              vs {app.opponent} ·{" "}
            </>
          )}
          {app.opponentClub} · {app.score}
        </div>
      </div>
      <ResultBadge won={app.won} />
    </div>
  );
}

/** Eine Meldelisten-Zeile: Rang vorne, Name + LK, rechts Ø-Position und Bilanz
 *  (sofern der Spieler schon ein Match in dieser Runde gespielt hat).
 *  mode "einzel" zählt nur Einzel, mode "doppel" nur Doppel-Einsätze. */
function RosterRow({
  entry,
  agg,
  mode,
  accentColor,
  isOpen,
  onToggle,
}: {
  entry: MeldelistenEintrag;
  agg?: PlayerAgg;
  mode: "einzel" | "doppel";
  accentColor: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const isEinzel = mode === "einzel";
  const shownMatches = agg ? (isEinzel ? agg.matches : agg.doublesMatches) : 0;
  const shownWins = agg ? (isEinzel ? agg.wins : agg.doublesWins) : 0;
  const shownLosses = agg ? (isEinzel ? agg.losses : agg.doublesLosses) : 0;
  const played = shownMatches > 0;
  return (
    <div
      className={`overflow-hidden rounded-lg border ${
        played
          ? "border-slate-700/50 bg-slate-800/30"
          : "border-slate-700/30 bg-slate-800/10"
      }`}
    >
      <button
        onClick={played ? onToggle : undefined}
        className={`flex w-full items-center gap-2.5 px-3 py-2 text-left ${
          played ? "hover:bg-slate-700/30" : "cursor-default"
        }`}
      >
        <span
          className="inline-flex h-6 w-7 flex-none items-center justify-center rounded-md text-[11px] font-extrabold"
          style={{ backgroundColor: accentColor + "22", color: accentColor }}
        >
          {entry.rang}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`truncate text-[13px] font-bold ${
                played ? "text-slate-100" : "text-slate-400"
              }`}
            >
              {entry.name}
            </span>
            <LkPill lk={entry.lk} own={played} />
            {entry.nation && (
              <span className="text-[9px] font-bold text-slate-500">
                {entry.nation}
              </span>
            )}
          </div>
        </div>
        {played && agg ? (
          <>
            {isEinzel && (
              <span
                className="flex-none rounded-md bg-slate-700/50 px-1.5 py-1 text-[10px] font-extrabold text-slate-200"
                title="Durchschnittliche Einzel-Position"
              >
                Ø&thinsp;{fmtAvg(agg.avgPosition)}
              </span>
            )}
            <div className="flex-none text-right text-[11px] text-slate-400">
              <span className="font-bold text-emerald-400">{shownWins}</span>
              <span className="text-slate-500">:</span>
              <span className="font-bold text-red-400">{shownLosses}</span>
            </div>
            <span className="flex-none text-[11px] text-slate-500">
              {isOpen ? "▲" : "▼"}
            </span>
          </>
        ) : (
          <span className="flex-none pr-1 text-[10px] text-slate-600">
            {isEinzel ? "ohne Einzel" : "ohne Doppel"}
          </span>
        )}
      </button>
      {isOpen && played && agg && (
        <div className="px-3 pb-2.5">
          {(isEinzel ? agg.singles : agg.doubles).map((app, i) => (
            <AppearanceRow
              key={i}
              app={app}
              ownLk={isEinzel ? entry.lk : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeamStatsDetail({
  team,
  rank,
  accentColor,
  onBack,
  meldeliste,
}: TeamStatsDetailProps) {
  const [tab, setTab] = useState<StatTab>("spieler");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const players = aggregatePlayers(team);
  const doubles = aggregateDoubles(team);
  // Klassische Ansicht (ohne Meldeliste): wie bisher nur Spieler mit Einzel-Einsatz
  const singlesPlayers = players.filter((p) => p.matches > 0);

  // Meldelisten-Modus: Bilanzen der eingesetzten Spieler über den normalisierten
  // Namen (ohne Länderkürzel/„(w.o.)") an die Meldeliste hängen. Derselbe Spieler
  // kann in den Berichten mehrfach auftauchen (mit und ohne Vermerk) — zusammenführen.
  const aggByName = new Map<string, PlayerAgg>();
  for (const p of players) {
    const key = normalizePlayerName(p.name);
    const prev = aggByName.get(key);
    if (!prev) {
      aggByName.set(key, { ...p, name: key });
      continue;
    }
    const singles = [...prev.singles, ...p.singles];
    const doubles = [...prev.doubles, ...p.doubles];
    aggByName.set(key, {
      ...prev,
      lk: prev.lk || p.lk,
      matches: singles.length,
      wins: singles.filter((s) => s.won).length,
      losses: singles.filter((s) => !s.won).length,
      avgPosition: singles.length
        ? singles.reduce((sum, s) => sum + s.position, 0) / singles.length
        : 99,
      singles,
      doublesMatches: doubles.length,
      doublesWins: doubles.filter((d) => d.won).length,
      doublesLosses: doubles.filter((d) => !d.won).length,
      doubles,
    });
  }
  const rosterCount = meldeliste
    ? meldeliste.herren.length + meldeliste.damen.length
    : 0;
  // Sicherheitsnetz: eingesetzte Spieler, die (noch) nicht in der Meldeliste stehen
  const rosterNames = new Set(
    meldeliste
      ? [...meldeliste.herren, ...meldeliste.damen].map((e) => e.name)
      : []
  );
  // Eingesetzte Spieler, die nicht auf der Meldeliste stehen (Ersatzspieler aus
  // anderen Mannschaften des Vereins). "— (w.o.)"-Platzhalter gehören in keine Liste.
  const unmatched = meldeliste
    ? [...aggByName.entries()]
        .filter(([key]) => !rosterNames.has(key) && !key.startsWith("—"))
        .map(([, agg]) => agg)
    : [];

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
          (meldeliste
            ? [
                ["spieler", `Einzel (${rosterCount})`],
                ["doppel", `Doppel (${rosterCount})`],
              ]
            : [
                ["spieler", `Spieler (${singlesPlayers.length})`],
                ["doppel", `Doppel (${doubles.length})`],
              ]) as [StatTab, string][]
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

      {meldeliste ? (
        tab === "spieler" ? (
          <p className="mb-2 px-2 text-[10px] text-slate-500">
            Komplette Meldeliste, sortiert nach <b className="text-slate-400">Rang</b>{" "}
            (= Meldeposition laut nuLiga). <b className="text-slate-400">Ø</b> = durchschnittliche
            Einzel-Position, Bilanz grün:rot = Einzel-Siege:Niederlagen — antippen für die
            einzelnen Matches. Quelle: btv.de-Mannschaftsportrait + nuLiga-Spielberichte.
          </p>
        ) : (
          <p className="mb-2 px-2 text-[10px] text-slate-500">
            Komplette Meldeliste, sortiert nach <b className="text-slate-400">Rang</b>.
            Bilanz grün:rot = Doppel-Siege:Niederlagen der einzelnen Person — antippen
            zeigt pro Doppel, <b className="text-slate-400">mit wem</b> sie gespielt hat,
            gegen welches Paar und welche Mannschaft, mit Ergebnis.
          </p>
        )
      ) : (
        <p className="mb-2 px-2 text-[10px] text-slate-500">
          Sortiert nach Ø-Position (1 = oben). <b className="text-slate-400">LK</b>{" "}
          = Leistungsklasse des Gegners · Quelle: nuLiga-Spielberichte.
        </p>
      )}

      {/* ── Meldelisten-Modus: beide Tabs zeigen ALLE gemeldeten Spieler —
            "Einzel" mit Einzel-Bilanz/Ø, "Doppel" mit Doppel-Bilanz + Partner ── */}
      {meldeliste && (
        <div className="space-y-3">
          {(
            [
              ["Herren", meldeliste.herren],
              ["Damen", meldeliste.damen],
            ] as [string, MeldelistenEintrag[]][]
          )
            .filter(([, entries]) => entries.length > 0)
            .map(([label, entries]) => (
            <div key={label}>
              <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {label} ({entries.length})
              </p>
              <div className="space-y-1">
                {entries.map((e) => {
                  const key = `m-${tab}-${label}-${e.rang}`;
                  return (
                    <RosterRow
                      key={key}
                      entry={e}
                      agg={aggByName.get(e.name)}
                      mode={tab === "spieler" ? "einzel" : "doppel"}
                      accentColor={accentColor}
                      isOpen={openKey === key}
                      onToggle={() => toggle(key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          {unmatched.length > 0 && (
            <div>
              <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Weitere Einsätze
              </p>
              <div className="space-y-1">
                {unmatched.map((p) => {
                  const key = `mu-${tab}-${p.name}`;
                  return (
                    <RosterRow
                      key={key}
                      entry={{ rang: 0, name: p.name, lk: p.lk, jahrgang: 0 }}
                      agg={p}
                      mode={tab === "spieler" ? "einzel" : "doppel"}
                      accentColor={accentColor}
                      isOpen={openKey === key}
                      onToggle={() => toggle(key)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Spieler-Tab ── */}
      {tab === "spieler" && !meldeliste && (
        <div className="space-y-1.5">
          {singlesPlayers.map((p) => {
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

      {/* ── Doppel-Tab (klassische Paar-Ansicht, nur ohne Meldeliste) ── */}
      {tab === "doppel" && !meldeliste && (
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
