import { useState } from "react";
import type { TeamHit } from "../data/player-history";
import { getMeldeliste } from "../data/meldelisten";
import { getTeamStats, emptyTeamStats } from "../data/player-stats";
import { ALL_SEASONS } from "../data/seasons";
import { getAllSpielberichte } from "../data/spielberichte";
import type { SeasonId } from "../types";
import TeamStatsDetail from "./TeamStatsDetail";

// Mannschaftsseite aus der Suche: die vollständige Meldeliste (bestehende
// Darstellung aus der Tabelle) — mit Saison-Umschalter, wenn die Mannschaft in
// mehreren Saisons in einer TCP-Gruppe stand.

interface Props {
  hit: TeamHit;
  onBack: () => void;
  onOpenPlayer?: (club: string, name: string) => void;
}

export default function TeamPage({ hit, onBack, onOpenPlayer }: Props) {
  // Alle Saisons, in denen dieser Verein mit dieser Konkurrenz erfasst ist
  const seasons = ALL_SEASONS.filter((s) =>
    getAllSpielberichte(s.id).some((b) => b.teamLabel === hit.teamLabel && (b.homeClub === hit.club || b.awayClub === hit.club))
    || getMeldeliste(s.id, leagueOf(s.id, hit) ?? hit.league, hit.club),
  );
  const [season, setSeason] = useState<SeasonId>(hit.season);
  const league = leagueOf(season, hit) ?? hit.league;
  const stats = getTeamStats(season, league, hit.club);
  const meldeliste = getMeldeliste(season, league, hit.club);

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
        />
      ) : (
        <div className="px-1">
          <button type="button" onClick={onBack} className="mb-3 rounded-lg border border-slate-600/50 bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-sky-300">
            ‹ Suche
          </button>
          <p className="text-sm text-slate-400">Für {hit.club} ist in dieser Saison nichts erfasst.</p>
        </div>
      )}
    </div>
  );
}

/** Liga dieser Konkurrenz in einer anderen Saison (Gruppennummern wechseln). */
function leagueOf(season: SeasonId, hit: TeamHit): string | undefined {
  if (season === hit.season) return hit.league;
  return getAllSpielberichte(season).find((b) => b.teamLabel === hit.teamLabel && (b.homeClub === hit.club || b.awayClub === hit.club))?.league;
}
