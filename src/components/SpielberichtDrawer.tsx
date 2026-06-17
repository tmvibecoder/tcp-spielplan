import { useEffect } from "react";
import type { IndividualMatch } from "../types";
import { formatDateDE, getTcpSide, headerTeamClass, type SpielberichtMeeting } from "../utils/spielbericht";
import MatchCard from "./MatchCard";

interface Props {
  open: boolean;
  onClose: () => void;
  meeting: SpielberichtMeeting | null;
  matches: IndividualMatch[] | null; // null = kein Spielbericht hinterlegt
  example?: boolean;
}

export default function SpielberichtDrawer({ open, onClose, meeting, matches, example }: Props) {
  // Schließen mit Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const tcpSide = meeting ? getTcpSide(meeting) : null;
  const einzel = (matches || []).filter((x) => x.match_type === "singles");
  const doppel = (matches || []).filter((x) => x.match_type === "doubles");

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`fixed z-50 flex flex-col overflow-hidden bg-slate-900 shadow-2xl transition-transform duration-300
          inset-x-0 bottom-0 max-h-[88vh] rounded-t-2xl border-t border-slate-700/50
          sm:inset-y-0 sm:left-auto sm:right-0 sm:bottom-auto sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0
          ${open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        {meeting && (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-slate-700/50 p-4">
              <div className="min-w-0">
                <div className="text-xs text-sky-400">{meeting.league}</div>
                <div className="mt-0.5 text-lg font-semibold">
                  <span className={headerTeamClass("home", tcpSide)}>{meeting.homeClub}</span>
                  <span className="text-slate-500"> vs. </span>
                  <span className={headerTeamClass("away", tcpSide)}>{meeting.awayClub}</span>
                </div>
                {meeting.date && (
                  <div className="text-xs text-slate-500">
                    {meeting.day ? meeting.day + ". " : ""}
                    {formatDateDE(meeting.date)}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {tcpSide === null ? (
                  <span className="rounded-lg bg-slate-700/40 px-3 py-1.5 text-xl font-bold tabular-nums">
                    <span className="text-sky-300">{meeting.finalHome}</span>
                    <span className="text-slate-500">:</span>
                    <span className="text-amber-300">{meeting.finalAway}</span>
                  </span>
                ) : (
                  <span className="rounded-lg bg-sky-500/15 px-3 py-1.5 text-xl font-bold tabular-nums text-sky-300">
                    {meeting.finalHome}:{meeting.finalAway}
                  </span>
                )}
                <button onClick={onClose} aria-label="Schließen" className="text-2xl leading-none text-slate-400 hover:text-slate-200">
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {example && (
                <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                  ⚠️ Beispieldaten — die einzelnen Spieler/LK/Sätze sind illustrativ; echte Spielbericht-Daten sind noch nicht hinterlegt.
                </div>
              )}
              {matches && matches.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Einzel</h3>
                    <div className="space-y-2">
                      {einzel.map((im) => (
                        <MatchCard key={im.id} im={im} tcpSide={tcpSide} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Doppel</h3>
                    <div className="space-y-2">
                      {doppel.map((im) => (
                        <MatchCard key={im.id} im={im} tcpSide={tcpSide} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-8 text-center text-sm text-slate-400">
                  <p className="mb-1 text-2xl">📋</p>
                  <p className="font-medium text-slate-300">Spielbericht noch nicht hinterlegt</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Das Gesamtergebnis dieser Begegnung ist {meeting.finalHome}:{meeting.finalAway}. Die einzelnen
                    Einzel/Doppel mit Namen und LK werden ergänzt, sobald die Spielbericht-Daten verfügbar sind.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
