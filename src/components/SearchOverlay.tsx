import { useEffect, useMemo, useRef, useState } from "react";
import { search, type PlayerEntry, type TeamHit } from "../data/player-history";
import { ALL_SEASONS } from "../data/seasons";
import type { SeasonId } from "../types";
import LkBadge from "./LkBadge";

// Suche über alle erfassten Saisons: Spieler (eigene und gegnerische) und
// Mannschaften — bei Mannschaften nur solche, die mit einer TCP-Konkurrenz in
// derselben Gruppe spielen (mehr ist nicht erfasst). Wird per React.lazy
// geladen, weil der Index alle Spielberichte und Meldelisten braucht.

interface Props {
  onClose: () => void;
  onOpenPlayer: (key: string) => void;
  onOpenTeam: (hit: TeamHit) => void;
}

const shortLabel = new Map(ALL_SEASONS.map((s) => [s.id, s.shortLabel]));
const seasonChip = (id: SeasonId) => (
  <span key={id} className="ml-1 rounded border border-slate-600/60 px-1 py-[1px] text-[9px] font-bold text-slate-400">
    {shortLabel.get(id) ?? id}
  </span>
);

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  const i = q ? text.toLowerCase().indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="text-sky-300">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </>
  );
}

export default function SearchOverlay({ onClose, onOpenPlayer, onOpenTeam }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const result = useMemo(() => search(query), [query]);
  const tooShort = query.trim().length < 2;

  const teamGroups = useMemo(() => {
    // Gleicher Verein + gleiche Konkurrenz über mehrere Saisons → eine Zeile mit Saison-Chips
    const map = new Map<string, { hit: TeamHit; seasons: SeasonId[]; all: TeamHit[] }>();
    for (const t of result.teams) {
      const k = `${t.club}::${t.teamLabel}`;
      const g = map.get(k);
      if (g) { g.seasons.push(t.season); g.all.push(t); }
      else map.set(k, { hit: t, seasons: [t.season], all: [t] });
    }
    return [...map.values()];
  }, [result.teams]);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-slate-700/50">
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg border border-slate-600/50 bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-slate-700/60"
        >
          ‹ Zurück
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-sky-500/60 bg-slate-900/80 px-3 py-2">
          <span aria-hidden="true">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Spieler oder Verein …"
            className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-slate-100 placeholder:text-slate-500 outline-none"
            autoCapitalize="off"
            autoCorrect="off"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Eingabe löschen" className="text-slate-500 hover:text-slate-300">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {tooShort ? (
          <p className="px-1 pt-6 text-center text-sm text-slate-500">
            Mindestens zwei Buchstaben eingeben — gesucht wird in allen erfassten Saisons,
            eigene und gegnerische Spieler.
          </p>
        ) : result.players.length === 0 && teamGroups.length === 0 ? (
          <p className="px-1 pt-6 text-center text-sm text-slate-500">Nichts gefunden.</p>
        ) : (
          <>
            {teamGroups.length > 0 && (
              <section className="mb-4">
                <h2 className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Mannschaften in TCP-Gruppen ({teamGroups.length})
                </h2>
                <div className="space-y-1">
                  {teamGroups.map(({ hit, seasons, all }) => (
                    <button
                      key={`${hit.club}::${hit.teamLabel}`}
                      type="button"
                      onClick={() => onOpenTeam(all[0])}
                      className="flex w-full items-center gap-2.5 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-2 text-left hover:bg-slate-700/30"
                    >
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-700/50 text-sm">
                        {/^Damen|^Juniorinnen/.test(hit.teamLabel) ? "🟠" : /^Mixed/.test(hit.teamLabel) ? "🟣" : "🔵"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-slate-100">
                          <Highlight text={hit.club} query={query} />
                          {hit.teamLabel && <span className="text-slate-400 font-semibold"> · {hit.teamLabel}</span>}
                        </span>
                        <span className="block truncate text-[10.5px] text-slate-400">
                          {hit.league}
                          {seasons.map(seasonChip)}
                        </span>
                      </span>
                      <span className="text-slate-600">›</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
            {result.players.length > 0 && (
              <section>
                <h2 className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Spieler ({result.players.length})
                </h2>
                <div className="space-y-1">
                  {result.players.map((p: PlayerEntry) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => onOpenPlayer(p.key)}
                      className="flex w-full items-center gap-2.5 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-2 text-left hover:bg-slate-700/30"
                    >
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-700/50 text-sm">👤</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[13px] font-bold text-slate-100">
                            <Highlight text={p.name} query={query} />
                          </span>
                          <LkBadge lk={p.lk} tone={/pliening/i.test(p.club) ? "own" : "opp"} />
                        </span>
                        <span className="block truncate text-[10.5px] text-slate-400">
                          {p.club}
                          {p.teams[0]?.teamLabel ? ` · ${p.teams[0].teamLabel}` : ""}
                          {p.seasons.map(seasonChip)}
                        </span>
                      </span>
                      <span className="text-slate-600">›</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
