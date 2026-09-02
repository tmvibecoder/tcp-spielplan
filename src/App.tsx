import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import { TEAMS } from "./data/teams";
import { MATCHES } from "./data/matches";
import { SEASONS, DEFAULT_SEASON } from "./data/seasons";
import { MONTHS, MONTH_COLORS } from "./data/constants";
import { SUMMER_STANDINGS, SUMMER_STANDINGS_STAND } from "./data/summer-2026";
import {
  WINTER_STANDINGS,
  WINTER_STANDINGS_STAND,
  WINTER_TEAMS,
  WINTER_MATCHES,
  WINTER_CATEGORIES,
  WINTER_MONTHS,
  WINTER_MONTH_COLORS,
} from "./data/winter-2526";
import type { Team, SeasonId, SubTab } from "./types";
import { generatePrintHTML } from "./utils/pdf-export";
import Header from "./components/Header";
import SeasonDropdown from "./components/SeasonTabs";
import TeamFilterDropdown from "./components/TeamFilterDropdown";
import TimelineView from "./components/TimelineView";
import CalendarDownloads from "./components/CalendarDownloads";
import Footer from "./components/Footer";
import { Impressum, Datenschutz } from "./components/LegalPages";
import { useLiveScores } from "./hooks/useLiveScores";
import { useFavorites } from "./hooks/useFavorites";

// Die Tabellen-Ansicht zieht die großen Spielbericht- und Meldelisten-Daten mit.
// Sie wird erst geladen, wenn jemand den Reiter „Tabelle“ öffnet — der Spielplan
// startet dadurch deutlich schneller.
const StandingsView = lazy(() => import("./components/StandingsView"));

type Page = "spielplan" | "impressum" | "datenschutz";

// Persistenz der Filter-Auswahl (welche Konkurrenzen aktiv, Nur-Heim-Schalter).
// Wird nur per "Auswahl speichern" im Menü geschrieben und beim Laden angewandt.
const PREFS_KEY = "tcp-filter-prefs";

interface FilterPrefs {
  summer: string[];
  winter: string[];
  homeOnly: boolean;
}

function loadPrefs(): FilterPrefs | null {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw) as FilterPrefs;
  } catch {
    // ignore
  }
  return null;
}

function App() {
  // Gespeicherte Auswahl einmalig beim Mount lesen
  const savedPrefs = useMemo(() => loadPrefs(), []);

  const [season, setSeason] = useState<SeasonId>(DEFAULT_SEASON.id);
  const [subTab, setSubTab] = useState<SubTab>("spielplan");

  // Summer team state
  const allSummerTeamIds = useMemo(() => new Set(TEAMS.map((t) => t.id)), []);
  const [activeSummerTeams, setActiveSummerTeams] = useState<Set<string>>(
    () => (savedPrefs ? new Set(savedPrefs.summer) : new Set(allSummerTeamIds))
  );

  // Winter team state
  const allWinterTeamIds = useMemo(() => new Set(WINTER_TEAMS.map((t) => t.id)), []);
  const [activeWinterTeams, setActiveWinterTeams] = useState<Set<string>>(
    () => (savedPrefs ? new Set(savedPrefs.winter) : new Set(allWinterTeamIds))
  );

  const [homeOnly, setHomeOnly] = useState(() => savedPrefs?.homeOnly ?? false);
  const [page, setPage] = useState<Page>("spielplan");

  const isSummer = season === "sommer-26";
  const seasonInfo = SEASONS.find((s) => s.id === season) ?? DEFAULT_SEASON;

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

  // Der Konkurrenz-Filter gilt auch für die Tabellen: Standings sind über
  // teamLabel (1:1 zu Team.label) den Konkurrenz-Ids zugeordnet.
  const summerLabelToId = useMemo(
    () => new Map(TEAMS.map((t) => [t.label, t.id])),
    []
  );
  const winterLabelToId = useMemo(
    () => new Map(WINTER_TEAMS.map((t) => [t.label, t.id])),
    []
  );

  const filteredSummerStandings = useMemo(
    () => SUMMER_STANDINGS.filter((s) => activeSummerTeams.has(summerLabelToId.get(s.teamLabel) ?? "")),
    [activeSummerTeams, summerLabelToId]
  );

  const filteredWinterStandings = useMemo(
    () => WINTER_STANDINGS.filter((s) => activeWinterTeams.has(winterLabelToId.get(s.teamLabel) ?? "")),
    [activeWinterTeams, winterLabelToId]
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

  // Alle Konkurrenzen der aktiven Saison ein- (on=true) oder ausschalten (on=false)
  const setAllTeams = useCallback((on: boolean) => {
    const setter = isSummer ? setActiveSummerTeams : setActiveWinterTeams;
    const allIds = isSummer ? allSummerTeamIds : allWinterTeamIds;
    setter(on ? new Set(allIds) : new Set());
  }, [isSummer, allSummerTeamIds, allWinterTeamIds]);

  // Aktuelle Filter-Auswahl dauerhaft im Browser speichern
  const savePrefs = useCallback(() => {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({
          summer: [...activeSummerTeams],
          winter: [...activeWinterTeams],
          homeOnly,
        })
      );
    } catch {
      // ignore
    }
  }, [activeSummerTeams, activeWinterTeams, homeOnly]);

  const { scores, saveScores } = useLiveScores();
  const { favorites, toggleFavorite } = useFavorites();

  const handlePdf = useCallback(() => {
    generatePrintHTML(MATCHES, activeSummerTeams);
  }, [activeSummerTeams]);

  if (page === "impressum") return <Impressum onBack={backToSpielplan} />;
  if (page === "datenschutz") return <Datenschutz onBack={backToSpielplan} />;

  const standingsFallback = (
    <div className="py-12 text-center text-sm text-slate-500">Tabellen werden geladen …</div>
  );

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
        teamFilter={
          isSummer ? (
            <TeamFilterDropdown
              activeTeams={activeSummerTeams}
              toggleTeam={toggleTeam}
              toggleCategory={toggleCategory}
              setAllTeams={setAllTeams}
              homeOnly={homeOnly}
              setHomeOnly={setHomeOnly}
              onSavePrefs={savePrefs}
            />
          ) : (
            <TeamFilterDropdown
              activeTeams={activeWinterTeams}
              toggleTeam={toggleTeam}
              toggleCategory={toggleCategory}
              setAllTeams={setAllTeams}
              categories={WINTER_CATEGORIES}
              teams={WINTER_TEAMS as Team[]}
              homeOnly={homeOnly}
              setHomeOnly={setHomeOnly}
              onSavePrefs={savePrefs}
            />
          )
        }
      />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {subTab === "spielplan" ? (
          <>
            {isSummer ? (
              <TimelineView
                matches={filteredSummerMatches}
                teamMap={summerTeamMap}
                standings={SUMMER_STANDINGS}
                months={MONTHS}
                monthColors={MONTH_COLORS}
                scores={scores}
                onSaveScore={saveScores}
                allMatches={MATCHES}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                provisionalTimesUntil={seasonInfo.provisionalTimesUntil}
              />
            ) : (
              <TimelineView
                matches={filteredWinterMatches}
                teamMap={winterTeamMap}
                standings={WINTER_STANDINGS}
                months={WINTER_MONTHS}
                monthColors={WINTER_MONTH_COLORS}
                scores={scores}
                onSaveScore={saveScores}
                allMatches={WINTER_MATCHES}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            )}
            <CalendarDownloads season={season} />
          </>
        ) : (
          <Suspense fallback={standingsFallback}>
            <StandingsView
              standings={isSummer ? filteredSummerStandings : filteredWinterStandings}
              seasonLabel={seasonInfo.label}
              stand={isSummer ? SUMMER_STANDINGS_STAND : WINTER_STANDINGS_STAND}
            />
          </Suspense>
        )}

        <Footer onNavigate={navigateToLegal} provisionalTimesUntil={seasonInfo.provisionalTimesUntil} />
      </main>
    </div>
  );
}

export default App;
