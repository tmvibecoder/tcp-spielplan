import { useState, useMemo, useCallback } from "react";
import { TEAMS } from "./data/teams";
import { MATCHES } from "./data/matches";
import type { Team } from "./types";
import { generatePrintHTML } from "./utils/pdf-export";
import Header from "./components/Header";
import TeamFilter from "./components/TeamFilter";
import TimelineView from "./components/TimelineView";
import ListView from "./components/ListView";
import CalendarDownloads from "./components/CalendarDownloads";
import Footer from "./components/Footer";
import { Impressum, Datenschutz } from "./components/LegalPages";
import { useLiveScores } from "./hooks/useLiveScores";

type View = "timeline" | "list";
type Page = "spielplan" | "impressum" | "datenschutz";

function App() {
  const allTeamIds = useMemo(() => new Set(TEAMS.map((t) => t.id)), []);
  const [activeTeams, setActiveTeams] = useState<Set<string>>(
    () => new Set(allTeamIds)
  );
  const [view, setView] = useState<View>("timeline");
  const [homeOnly, setHomeOnly] = useState(false);
  const [page, setPage] = useState<Page>("spielplan");

  const navigateToLegal = useCallback((p: "impressum" | "datenschutz") => {
    setPage(p);
    window.scrollTo(0, 0);
  }, []);

  const backToSpielplan = useCallback(() => {
    setPage("spielplan");
    window.scrollTo(0, 0);
  }, []);

  const teamMap = useMemo(
    () => new Map<string, Team>(TEAMS.map((t) => [t.id, t])),
    []
  );

  const filteredMatches = useMemo(
    () => MATCHES.filter((m) => activeTeams.has(m.teamId) && (!homeOnly || m.isHome)),
    [activeTeams, homeOnly]
  );

  const homeCount = useMemo(
    () => filteredMatches.filter((m) => m.isHome).length,
    [filteredMatches]
  );
  const awayCount = filteredMatches.length - homeCount;

  const allActive = activeTeams.size === allTeamIds.size;

  const toggleAll = useCallback(() => {
    setActiveTeams(allActive ? new Set() : new Set(allTeamIds));
  }, [allActive, allTeamIds]);

  const toggleTeam = useCallback((id: string) => {
    setActiveTeams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleCategory = useCallback((ids: string[]) => {
    setActiveTeams((prev) => {
      const next = new Set(prev);
      const allOn = ids.every((id) => next.has(id));
      for (const id of ids) {
        if (allOn) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, []);

  const { scores, saveScores } = useLiveScores();

  const handlePdf = useCallback(() => {
    generatePrintHTML(MATCHES, activeTeams);
  }, [activeTeams]);

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
      />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Team Filter */}
        <div className="mb-6">
          <TeamFilter
            activeTeams={activeTeams}
            toggleTeam={toggleTeam}
            toggleCategory={toggleCategory}
          />
        </div>

        {/* Main View */}
        {view === "timeline" ? (
          <TimelineView matches={filteredMatches} teamMap={teamMap} scores={scores} onSaveScore={saveScores} />
        ) : (
          <ListView matches={filteredMatches} teamMap={teamMap} scores={scores} onSaveScore={saveScores} />
        )}

        {/* Calendar Downloads */}
        <CalendarDownloads />

        {/* Footer */}
        <Footer onNavigate={navigateToLegal} />
      </main>
    </div>
  );
}

export default App;
