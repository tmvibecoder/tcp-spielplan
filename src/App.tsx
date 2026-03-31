import { useState, useMemo, useCallback } from "react";
import { TEAMS } from "./data/teams";
import { MATCHES } from "./data/matches";
import { SEASONS, DEFAULT_SEASON } from "./data/seasons";
import {
  WINTER_STANDINGS,
  WINTER_TEAMS,
  WINTER_MATCHES,
  WINTER_CATEGORIES,
} from "./data/winter-2526";
import type { Team, SeasonId, SubTab } from "./types";
import { generatePrintHTML } from "./utils/pdf-export";
import Header from "./components/Header";
import SeasonDropdown from "./components/SeasonTabs";
import TeamFilter from "./components/TeamFilter";
import TimelineView from "./components/TimelineView";
import WinterTimelineView from "./components/WinterTimelineView";
import StandingsView from "./components/StandingsView";
import CalendarDownloads from "./components/CalendarDownloads";
import Footer from "./components/Footer";
import { Impressum, Datenschutz } from "./components/LegalPages";
import { useLiveScores } from "./hooks/useLiveScores";
import { useFavorites } from "./hooks/useFavorites";

type Page = "spielplan" | "impressum" | "datenschutz";

function App() {
  const [season, setSeason] = useState<SeasonId>(DEFAULT_SEASON.id);
  const [subTab, setSubTab] = useState<SubTab>("spielplan");

  // Summer team state
  const allSummerTeamIds = useMemo(() => new Set(TEAMS.map((t) => t.id)), []);
  const [activeSummerTeams, setActiveSummerTeams] = useState<Set<string>>(
    () => new Set(allSummerTeamIds)
  );

  // Winter team state
  const allWinterTeamIds = useMemo(() => new Set(WINTER_TEAMS.map((t) => t.id)), []);
  const [activeWinterTeams, setActiveWinterTeams] = useState<Set<string>>(
    () => new Set(allWinterTeamIds)
  );

  const [homeOnly, setHomeOnly] = useState(false);
  const [page, setPage] = useState<Page>("spielplan");

  const isSummer = season === "sommer-26";


  const navigateToLegal = useCallback((p: "impressum" | "datenschutz") => {
    setPage(p);
    window.scrollTo(0, 0);
  }, []);

  const backToSpielplan = useCallback(() => {
    setPage("spielplan");
    window.scrollTo(0, 0);
  }, []);

  // Team maps
  const summerTeamMap = useMemo(
    () => new Map<string, Team>(TEAMS.map((t) => [t.id, t])),
    []
  );
  const winterTeamMap = useMemo(
    () => new Map<string, Team>(WINTER_TEAMS.map((t) => [t.id, t as Team])),
    []
  );

  // Filtered matches
  const filteredSummerMatches = useMemo(
    () => MATCHES.filter((m) => activeSummerTeams.has(m.teamId) && (!homeOnly || m.isHome)),
    [activeSummerTeams, homeOnly]
  );

  const filteredWinterMatches = useMemo(
    () => WINTER_MATCHES.filter((m) => activeWinterTeams.has(m.teamId) && (!homeOnly || m.isHome)),
    [activeWinterTeams, homeOnly]
  );

  const toggleTeam = useCallback((id: string) => {
    const setter = isSummer ? setActiveSummerTeams : setActiveWinterTeams;
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [isSummer]);

  const toggleCategory = useCallback((ids: string[]) => {
    const setter = isSummer ? setActiveSummerTeams : setActiveWinterTeams;
    setter((prev) => {
      const next = new Set(prev);
      const allOn = ids.every((id) => next.has(id));
      for (const id of ids) {
        if (allOn) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, [isSummer]);

  const { scores, saveScores } = useLiveScores();
  const { favorites, toggleFavorite } = useFavorites();

  const handlePdf = useCallback(() => {
    generatePrintHTML(MATCHES, activeSummerTeams);
  }, [activeSummerTeams]);

  if (page === "impressum") return <Impressum onBack={backToSpielplan} />;
  if (page === "datenschutz") return <Datenschutz onBack={backToSpielplan} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header
        onPdf={handlePdf}
        isSummer={isSummer}
        subTab={subTab}
        setSubTab={setSubTab}
        showSpielplanControls={subTab === "spielplan"}
        seasonDropdown={
          <SeasonDropdown
            seasons={SEASONS}
            activeSeason={season}
            onChange={(id) => {
              setSeason(id);
              setSubTab("spielplan");
            }}
          />
        }
      />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {isSummer ? (
          <>
            {subTab === "spielplan" ? (
              <>
                {/* Team Filter */}
                <div className="mb-6">
                  <TeamFilter
                    activeTeams={activeSummerTeams}
                    toggleTeam={toggleTeam}
                    toggleCategory={toggleCategory}
                    homeOnly={homeOnly}
                    setHomeOnly={setHomeOnly}
                  />
                </div>

                {/* Main View */}
                <TimelineView matches={filteredSummerMatches} teamMap={summerTeamMap} scores={scores} onSaveScore={saveScores} allMatches={MATCHES} favorites={favorites} toggleFavorite={toggleFavorite} />

                {/* Calendar Downloads */}
                <CalendarDownloads season="sommer-26" />
              </>
            ) : (
              /* Summer Standings */
              <StandingsView standings={[]} />
            )}
          </>
        ) : (
          <>
            {subTab === "spielplan" ? (
              <>
                {/* Winter Team Filter */}
                <div className="mb-6">
                  <TeamFilter
                    activeTeams={activeWinterTeams}
                    toggleTeam={toggleTeam}
                    toggleCategory={toggleCategory}
                    categories={WINTER_CATEGORIES}
                    teams={WINTER_TEAMS as Team[]}
                    homeOnly={homeOnly}
                    setHomeOnly={setHomeOnly}
                  />
                </div>

                {/* Winter View */}
                <WinterTimelineView matches={filteredWinterMatches} teamMap={winterTeamMap} scores={scores} onSaveScore={saveScores} allMatches={WINTER_MATCHES} favorites={favorites} toggleFavorite={toggleFavorite} />

                {/* Calendar Downloads */}
                <CalendarDownloads season="winter-2526" />
              </>
            ) : (
              /* Winter Standings */
              <StandingsView standings={WINTER_STANDINGS} />
            )}
          </>
        )}

        {/* Footer */}
        <Footer onNavigate={navigateToLegal} />
      </main>
    </div>
  );
}

export default App;
