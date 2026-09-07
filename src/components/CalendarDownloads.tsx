import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Match, Team, SeasonId } from "../types";
import { CATEGORIES } from "../data/constants";
import { TEAMS } from "../data/teams";
import { MATCHES } from "../data/matches";
import { WINTER_TEAMS, WINTER_CATEGORIES, WINTER_MATCHES } from "../data/winter-2526";
import { downloadICS } from "../utils/ics-export";

interface CalendarDownloadsProps {
  season: SeasonId;
  open: boolean;
  onClose: () => void;
}

// Kalender-Downloads als Overlay, geöffnet über das ⋯-Menü im Header. Früher stand
// der Block dauerhaft unter dem Spielplan und war dort größer als der Spielplan selbst.
// Das Panel hängt per Portal an <body>, damit der sticky Header (backdrop-blur) die
// Positionierung nicht einschränkt.
export default function CalendarDownloads({ season, open, onClose }: CalendarDownloadsProps) {
  const isSummer = season === "sommer-26";
  const teamList = isSummer ? TEAMS : (WINTER_TEAMS as Team[]);
  const matchList: Match[] = isSummer ? MATCHES : WINTER_MATCHES;
  const categories = isSummer ? CATEGORIES : WINTER_CATEGORIES;

  // ESC schließt das Panel
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

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

  return createPortal(
    <>
      <div className="fixed inset-0 z-[60] bg-slate-950/70" onClick={onClose} />
      <div
        id="kalender-downloads"
        role="dialog"
        aria-modal="true"
        aria-label="Kalender-Downloads"
        className="fixed z-[70] flex flex-col overflow-hidden bg-slate-900 shadow-2xl
          inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t border-slate-700/50
          sm:inset-y-0 sm:left-auto sm:right-0 sm:bottom-auto sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-700/50 p-4">
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-slate-100">📆 Spielplan in den Kalender übernehmen</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              ICS-Datei je Mannschaft für Apple Kalender, Google Kalender, Outlook
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="shrink-0 text-2xl leading-none text-slate-400 hover:text-slate-200 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
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
      </div>
    </>,
    document.body
  );
}
