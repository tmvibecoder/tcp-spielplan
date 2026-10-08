import { useState } from "react";
import type { MatchResult } from "../data/results";
import type { SeasonId } from "../types";
import { getSpielbericht } from "../data/spielberichte";
import { useGroup } from "../data/store";
import SpielberichtDrawer from "./SpielberichtDrawer";

interface Props {
  season: SeasonId;
  league: string;      // Team.league, identisch mit LeagueStandings.leagueName
  leagueLabel: string; // z. B. "Herren · Südliga 2 · Gr. 023"
  homeClub: string;
  awayClub: string;
  result: MatchResult;
}

// Lädt die Gruppendatei (public/data/groups/…) erst, wenn jemand ein gespieltes
// Spiel im Spielplan aufklappt — die Berichte stecken seit 08.10.2026 nicht mehr
// im Bundle.
export default function SpielberichtLink({ season, league, leagueLabel, homeClub, awayClub, result }: Props) {
  const [open, setOpen] = useState(false);
  const { data: group } = useGroup(season, league);
  const bericht = getSpielbericht(group, homeClub, awayClub);
  if (!bericht) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold rounded-lg transition-colors"
      >
        📋 Spielbericht: alle Einzel &amp; Doppel
      </button>
      <SpielberichtDrawer
        open={open}
        onClose={() => setOpen(false)}
        meeting={{
          league: leagueLabel,
          homeClub: bericht.homeClub,
          awayClub: bericht.awayClub,
          finalHome: result.home,
          finalAway: result.away,
          date: bericht.date,
          day: bericht.day,
        }}
        matches={bericht.matches}
        example={bericht.example}
      />
    </>
  );
}
