import { useState } from "react";
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

  const [open, setOpen] = useState(false);
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
    <div id="kalender-downloads" className="mt-12 border-t border-slate-700/50 pt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-left hover:bg-slate-800/50 transition-colors"
      >
        <span>
          <span className="block text-sm font-extrabold text-slate-100">📆 Spielplan in den Kalender übernehmen</span>
          <span className="block text-[11px] text-slate-400 mt-0.5">
            ICS-Datei je Mannschaft für Apple Kalender, Google Kalender, Outlook
          </span>
        </span>
        <span className="text-slate-500 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
      <div className="mt-4 animate-fadeIn">
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
      )}
    </div>
  );
}
