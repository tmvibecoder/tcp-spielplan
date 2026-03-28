import type { Match, Team, SeasonId } from "../types";
import { CATEGORIES } from "../data/constants";
import { TEAMS } from "../data/teams";
import { MATCHES } from "../data/matches";
import { WINTER_TEAMS, WINTER_CATEGORIES, WINTER_MATCHES } from "../data/winter-2526";
import { downloadICS } from "../utils/ics-export";

interface CalendarDownloadsProps {
  season: SeasonId;
}

export default function CalendarDownloads({ season }: CalendarDownloadsProps) {
  const isSummer = season === "sommer-26";
  const teamList = isSummer ? TEAMS : (WINTER_TEAMS as Team[]);
  const matchList: Match[] = isSummer ? MATCHES : WINTER_MATCHES;
  const categories = isSummer ? CATEGORIES : WINTER_CATEGORIES;

  const teamMap = new Map<string, Team>(teamList.map((t) => [t.id, t]));

  const matchesByTeam = new Map<string, Match[]>();
  for (const m of matchList) {
    if (!matchesByTeam.has(m.teamId)) matchesByTeam.set(m.teamId, []);
    matchesByTeam.get(m.teamId)!.push(m);
  }

  const handleDownload = (teamId: string) => {
    const team = teamMap.get(teamId);
    const matches = matchesByTeam.get(teamId);
    if (team && matches) {
      downloadICS(matches, team);
    }
  };

  return (
    <div id="kalender-downloads" className="mt-12 border-t border-slate-700/50 pt-8">
      <h2 className="text-lg font-extrabold text-slate-100 mb-1">
        Kalender-Downloads
      </h2>
      <p className="text-xs text-slate-400 mb-5">
        ICS-Dateien für jede Mannschaft — importierbar in Apple Kalender, Google Kalender, Outlook etc.
      </p>

      <div className="space-y-5">
        {categories.map((cat) => (
          <div key={cat.label}>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {cat.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {cat.ids.map((id) => {
                const team = teamMap.get(id);
                if (!team) return null;
                const count = matchesByTeam.get(id)?.length || 0;
                if (count === 0) return null;
                return (
                  <button
                    key={id}
                    onClick={() => handleDownload(id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      borderColor: team.color + "40",
                      backgroundColor: team.color + "10",
                      color: team.color,
                    }}
                  >
                    {team.emoji} {team.shortLabel}
                    <span className="text-slate-400">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
        <p className="text-[11px] text-slate-400">
          <strong className="text-slate-300">Tipp:</strong>{" "}
          iPhone/iPad: .ics-Datei herunterladen, dann Datei öffnen und "Zu Kalender hinzufügen".{" "}
          Google Kalender: calendar.google.com, dann Einstellungen, Importieren & Exportieren, .ics-Datei hochladen.
        </p>
      </div>
    </div>
  );
}
