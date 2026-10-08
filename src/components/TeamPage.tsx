import { useMemo, useState } from "react";
import type { TeamHit } from "../data/player-history";
import { recentBalance } from "../data/player-history";
import { getMeldeliste } from "../data/meldelisten";
import { getTeamStats, emptyTeamStats } from "../data/player-stats";
import { ALL_SEASONS } from "../data/seasons";
import { useClub, useGroup, useSearchIndex } from "../data/store";
import type { SeasonId } from "../types";
import TeamStatsDetail from "./TeamStatsDetail";

// Mannschaftsseite aus der Suche: die vollständige Meldeliste (bestehende
// Darstellung aus der Tabelle) — mit Saison-Umschalter, wenn die Mannschaft in
// mehreren Saisons erfasst ist. Welche Saisons das sind, weiß der Suchindex
// (eine Zeile je Verein, Konkurrenz und Saison); Berichte und Meldeliste der
// gewählten Saison kommen aus der Gruppendatei (public/data, seit 08.10.2026).

interface Props {
  hit: TeamHit;
  onBack: () => void;
  onOpenPlayer?: (club: string, name: string) => void;
}

export default function TeamPage({ hit, onBack, onOpenPlayer }: Props) {
  const { data: index } = useSearchIndex();
  // Alle Saisons, in denen dieser Verein mit dieser Konkurrenz erfasst ist
  // (Liga je Saison, weil Gruppennummern wechseln)
  const perSeason = useMemo(() => {
    const map = new Map<SeasonId, string>();
    map.set(hit.season, hit.league);
    for (const t of index?.teams ?? []) {
      if (t.club === hit.club && t.teamLabel === hit.teamLabel && !map.has(t.season)) map.set(t.season, t.league);
    }
    return map;
  }, [index, hit]);
  const seasons = ALL_SEASONS.filter((s) => perSeason.has(s.id));
  const [season, setSeason] = useState<SeasonId>(hit.season);
  const league = perSeason.get(season) ?? hit.league;
  const { data: group, loading } = useGroup(season, league);
  const { data: clubData } = useClub(hit.club);
  const stats = getTeamStats(group, hit.club);
  const meldeliste = getMeldeliste(group, hit.club);

  return (
    <div>
      {seasons.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-1 px-1">
          {seasons.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSeason(s.id)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                s.id === season ? "border-sky-400/60 bg-sky-500/15 text-sky-200" : "border-slate-600/60 bg-slate-800/50 text-slate-400"
              }`}
            >
              {s.icon} {s.shortLabel}
            </button>
          ))}
        </div>
      )}
      {stats || meldeliste ? (
        <TeamStatsDetail
          key={season}
          team={stats ?? emptyTeamStats(league, hit.club, hit.teamLabel)}
          accentColor={/^Damen|^Juniorinnen/.test(hit.teamLabel) ? "#fbbf24" : /^Mixed/.test(hit.teamLabel) ? "#a855f7" : "#38bdf8"}
          onBack={onBack}
          backLabel="Suche"
          meldeliste={meldeliste}
          onOpenPlayer={onOpenPlayer}
          balanceOf={(name) => recentBalance(clubData, hit.club, name)}
        />
      ) : (
        <div className="px-1">
          <button type="button" onClick={onBack} className="mb-3 rounded-lg border border-slate-600/50 bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-sky-300">
            ‹ Suche
          </button>
          <p className="text-sm text-slate-400">{loading ? "Wird geladen …" : `Für ${hit.club} ist in dieser Saison nichts erfasst.`}</p>
        </div>
      )}
    </div>
  );
}
