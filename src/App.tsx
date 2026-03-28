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
import SubTabs from "./components/SubTabs";
import TeamFilter from "./components/TeamFilter";
import TimelineView from "./components/TimelineView";
import ListView from "./components/ListView";
import WinterTimelineView from "./components/WinterTimelineView";
import WinterListView from "./components/WinterListView";
import StandingsView from "./components/StandingsView";
import CalendarDownloads from "./components/CalendarDownloads";
import Footer from "./components/Footer";
import { Impressum, Datenschutz } from "./components/LegalPages";
import { useLiveScores } from "./hooks/useLiveScores";

type View = "timeline" | "list";
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

  const [view, setView] = useState<View>("timeline");
  const [homeOnly, setHomeOnly] = useState(false);
  const [page, setPage] = useState<Page>("spielplan");

  const isSummer = season === "sommer-26";

  // Current season's active teams
  const activeTeams = isSummer ? activeSummerTeams : activeWinterTeams;
  const allTeamIds = isSummer ? allSummerTeamIds : allWinterTeamIds;

  const currentSeason = useMemo(
    () => SEASONS.find((s) => s.id === season) || DEFAULT_SEASON,
    [season]
  );

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

  const filteredMatches = isSummer ? filteredSummerMatches : filteredWinterMatches;

  const homeCount = useMemo(
    () => filteredMatches.filter((m) => m.isHome).length,
    [filteredMatches]
  );
  const awayCount = filteredMatches.length - homeCount;

  const allActive = activeTeams.size === allTeamIds.size;

  const toggleAll = useCallback(() => {
    if (isSummer) {
      setActiveSummerTeams(allActive ? new Set() : new Set(allSummerTeamIds));
    } else {
      setActiveWinterTeams(allActive ? new Set() : new Set(allWinterTeamIds));
    }
  }, [allActive, allSummerTeamIds, allWinterTeamIds, isSummer]);

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

  const handlePdf = useCallback(() => {
    generatePrintHTML(MATCHES, activeSummerTeams);
  }, [activeSummerTeams]);

  if (page === "impressum") return <Impressum onBack={backToSpielplan} />;
  if (page === "datenschutz") return <Datenschutz onBack={backToSpielplan} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header
        view={view}
        setView={setView}
        allActive={allActive}
        toggleAll={toggleAll}
        onPdf={handlePdf}
        totalMatches={filteredMatches.length}
        homeMatches={homeCount}
        awayMatches={awayCount}
        homeOnly={homeOnly}
        setHomeOnly={setHomeOnly}
        seasonLabel={currentSeason.label}
        showControls={subTab === "spielplan"}
        isSummer={isSummer}
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
        {/* Sub Tabs (Spielplan / Tabelle) */}
        <div className="mb-6">
          <SubTabs
            activeTab={subTab}
            onChange={setSubTab}
            spielplanCount={filteredMatches.length}
          />
        </div>

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
                  />
                </div>

                {/* Main View */}
                {view === "timeline" ? (
                  <TimelineView matches={filteredSummerMatches} teamMap={summerTeamMap} scores={scores} onSaveScore={saveScores} />
                ) : (
                  <ListView matches={filteredSummerMatches} teamMap={summerTeamMap} scores={scores} onSaveScore={saveScores} />
                )}

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
                  />
                </div>

                {/* Winter View */}
                {view === "timeline" ? (
                  <WinterTimelineView matches={filteredWinterMatches} teamMap={winterTeamMap} />
                ) : (
                  <WinterListView matches={filteredWinterMatches} teamMap={winterTeamMap} />
                )}

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
