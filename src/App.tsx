import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import { MATCHES } from "./data/matches";
import { SEASONS, DEFAULT_SEASON } from "./data/seasons";
import { SEASON_DATA, getSeasonData } from "./data/season-data";
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

/** Aktive Konkurrenzen je Saison. Die alte Fassung kannte nur `summer`/`winter` —
 *  solche Einträge werden beim Laden auf die Saison-Ids übersetzt. */
interface FilterPrefs {
  teams?: Partial<Record<SeasonId, string[]>>;
  summer?: string[];
  winter?: string[];
  homeOnly: boolean;
}

type TeamSelection = Record<SeasonId, Set<string>>;

function allTeamsOf(id: SeasonId): Set<string> {
  return new Set(SEASON_DATA[id].teams.map((t) => t.id));
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

/** Startauswahl je Saison: gespeicherte Auswahl, sonst alle Konkurrenzen an. */
function initialSelection(prefs: FilterPrefs | null): TeamSelection {
  const legacy: Partial<Record<SeasonId, string[]>> = {
    "sommer-26": prefs?.summer,
    "winter-2526": prefs?.winter,
  };
  const sel = {} as TeamSelection;
  for (const s of SEASONS) {
    const saved = prefs?.teams?.[s.id] ?? legacy[s.id];
    sel[s.id] = saved ? new Set(saved) : allTeamsOf(s.id);
  }
  return sel;
}

function App() {
  // Gespeicherte Auswahl einmalig beim Mount lesen
  const savedPrefs = useMemo(() => loadPrefs(), []);

  const [season, setSeason] = useState<SeasonId>(DEFAULT_SEASON.id);
  const [subTab, setSubTab] = useState<SubTab>("spielplan");

  // Aktive Konkurrenzen je Saison (jede Saison hat eigene Konkurrenz-Ids)
  const [activeTeams, setActiveTeams] = useState<TeamSelection>(() => initialSelection(savedPrefs));

  const [homeOnly, setHomeOnly] = useState(() => savedPrefs?.homeOnly ?? false);
  const [page, setPage] = useState<Page>("spielplan");
  // Kalender-Downloads liegen im ⋯-Menü und öffnen ein Overlay
  const [calendarOpen, setCalendarOpen] = useState(false);

  const data = getSeasonData(season);
  const seasonInfo = data.season;
  const activeSeasonTeams = activeTeams[season];

  // Reiter- und Saisonwechsel schließen ein offenes Overlay mit
  const changeSubTab = useCallback((tab: SubTab) => {
    setSubTab(tab);
    setCalendarOpen(false);
  }, []);

  const navigateToLegal = useCallback((p: "impressum" | "datenschutz") => {
    setPage(p);
    window.scrollTo(0, 0);
  }, []);

  const backToSpielplan = useCallback(() => {
    setPage("spielplan");
    window.scrollTo(0, 0);
  }, []);

  const teamMap = useMemo(
    () => new Map<string, Team>(data.teams.map((t) => [t.id, t])),
    [data.teams]
  );

  const filteredMatches = useMemo(
    () => data.matches.filter((m) => activeSeasonTeams.has(m.teamId) && (!homeOnly || m.isHome)),
    [data.matches, activeSeasonTeams, homeOnly]
  );

  // Der Konkurrenz-Filter gilt auch für die Tabellen: Standings sind über
  // teamLabel (1:1 zu Team.label) den Konkurrenz-Ids zugeordnet.
  const labelToId = useMemo(
    () => new Map(data.teams.map((t) => [t.label, t.id])),
    [data.teams]
  );

  const filteredStandings = useMemo(
    () => data.standings.filter((s) => activeSeasonTeams.has(labelToId.get(s.teamLabel) ?? "")),
    [data.standings, activeSeasonTeams, labelToId]
  );

  /** Auswahl der aktiven Saison ändern, andere Saisons bleiben unberührt. */
  const updateSelection = useCallback(
    (fn: (prev: Set<string>) => Set<string>) => {
      setActiveTeams((prev) => ({ ...prev, [season]: fn(prev[season]) }));
    },
    [season]
  );

  const toggleTeam = useCallback((id: string) => {
    updateSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [updateSelection]);

  const toggleCategory = useCallback((ids: string[]) => {
    updateSelection((prev) => {
      const next = new Set(prev);
      const allOn = ids.every((id) => next.has(id));
      for (const id of ids) {
        if (allOn) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, [updateSelection]);

  // Alle Konkurrenzen der aktiven Saison ein- (on=true) oder ausschalten (on=false)
  const setAllTeams = useCallback((on: boolean) => {
    updateSelection(() => (on ? allTeamsOf(season) : new Set<string>()));
  }, [updateSelection, season]);

  // Aktuelle Filter-Auswahl dauerhaft im Browser speichern
  const savePrefs = useCallback(() => {
    try {
      const teams = Object.fromEntries(
        SEASONS.map((s) => [s.id, [...activeTeams[s.id]]])
      ) as Record<SeasonId, string[]>;
      localStorage.setItem(PREFS_KEY, JSON.stringify({ teams, homeOnly }));
    } catch {
      // ignore
    }
  }, [activeTeams, homeOnly]);

  const { scores, saveScores } = useLiveScores();
  const { favorites, toggleFavorite } = useFavorites();

  const handlePdf = useCallback(() => {
    generatePrintHTML(MATCHES, activeTeams["sommer-26"]);
  }, [activeTeams]);

  if (page === "impressum") return <Impressum onBack={backToSpielplan} />;
  if (page === "datenschutz") return <Datenschutz onBack={backToSpielplan} />;

  const standingsFallback = (
    <div className="py-12 text-center text-sm text-slate-500">Tabellen werden geladen …</div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header
        onPdf={handlePdf}
        onCalendar={() => setCalendarOpen(true)}
        showPdf={data.supportsPdf}
        subTab={subTab}
        setSubTab={changeSubTab}
        showSpielplanControls={subTab === "spielplan"}
        seasonDropdown={
          <SeasonDropdown
            seasons={SEASONS}
            activeSeason={season}
            onChange={(id) => {
              setSeason(id);
              setSubTab("spielplan");
              setCalendarOpen(false);
            }}
          />
        }
        teamFilter={
          <TeamFilterDropdown
            activeTeams={activeSeasonTeams}
            toggleTeam={toggleTeam}
            toggleCategory={toggleCategory}
            setAllTeams={setAllTeams}
            categories={data.categories}
            teams={data.teams}
            homeOnly={homeOnly}
            setHomeOnly={setHomeOnly}
            onSavePrefs={savePrefs}
          />
        }
      />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {subTab === "spielplan" ? (
          <>
            <TimelineView
              matches={filteredMatches}
              teamMap={teamMap}
              standings={data.standings}
              months={data.months}
              monthColors={data.monthColors}
              scores={scores}
              onSaveScore={saveScores}
              allMatches={data.matches}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              provisionalTimesUntil={seasonInfo.provisionalTimesUntil}
            />
            <CalendarDownloads
              season={season}
              open={calendarOpen}
              onClose={() => setCalendarOpen(false)}
            />
          </>
        ) : (
          <Suspense fallback={standingsFallback}>
            <StandingsView
              standings={filteredStandings}
              seasonLabel={seasonInfo.label}
              stand={data.standingsStand}
            />
          </Suspense>
        )}

        <Footer onNavigate={navigateToLegal} provisionalTimesUntil={seasonInfo.provisionalTimesUntil} />
      </main>
    </div>
  );
}

export default App;
