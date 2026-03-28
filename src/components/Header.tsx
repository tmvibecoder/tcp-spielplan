import type { ReactNode } from "react";
import { BTV_VEREIN_URL } from "../data/constants";

type View = "timeline" | "list";

interface HeaderProps {
  view: View;
  setView: (v: View) => void;
  allActive: boolean;
  toggleAll: () => void;
  onPdf: () => void;
  totalMatches: number;
  homeMatches: number;
  awayMatches: number;
  homeOnly: boolean;
  setHomeOnly: (v: boolean) => void;
  seasonLabel: string;
  showControls: boolean;
  isSummer: boolean;
  seasonDropdown: ReactNode;
}

export default function Header({
  view,
  setView,
  allActive,
  toggleAll,
  onPdf,
  totalMatches,
  homeMatches,
  awayMatches,
  homeOnly,
  setHomeOnly,
  seasonLabel,
  showControls,
  isSummer,
  seasonDropdown,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-5xl mx-auto px-4 py-3">
        {/* Title row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
                TC Pliening
              </h1>
              <p className="text-xs text-slate-400">
                {seasonLabel} · Spielplan
              </p>
            </div>
            {seasonDropdown}
          </div>
          <a
            href={BTV_VEREIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
          >
            BTV Vereinsseite
          </a>
        </div>

        {/* Controls row */}
        {showControls && (
          <div className="flex flex-wrap items-center gap-2">
            {/* View toggle - for both seasons */}
            <div className="flex rounded-lg overflow-hidden border border-slate-600">
              <button
                onClick={() => setView("timeline")}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === "timeline"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Zeitstrahl
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Liste
              </button>
            </div>

            {isSummer && (
              <button
                onClick={onPdf}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-colors"
              >
                PDF
              </button>
            )}

            <button
              onClick={() => setHomeOnly(!homeOnly)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                homeOnly
                  ? "bg-green-600/30 text-green-300 border-green-500/50 hover:bg-green-600/40"
                  : "bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700"
              }`}
            >
              Nur Heim
            </button>

            <button
              onClick={toggleAll}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700 transition-colors"
            >
              {allActive ? "Alle aus" : "Alle an"}
            </button>

            <span className="ml-auto text-xs text-slate-400">
              {totalMatches} Spiele · {homeMatches} H · {awayMatches} A
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
