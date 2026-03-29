import type { ReactNode } from "react";
import type { SubTab } from "../types";

type View = "timeline" | "list";

interface HeaderProps {
  view: View;
  setView: (v: View) => void;
  onPdf: () => void;
  isSummer: boolean;
  seasonDropdown: ReactNode;
  subTab: SubTab;
  setSubTab: (tab: SubTab) => void;
  showSpielplanControls: boolean;
}

export default function Header({
  view,
  setView,
  onPdf,
  isSummer,
  seasonDropdown,
  subTab,
  setSubTab,
  showSpielplanControls,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-5xl mx-auto px-2 py-1.5 flex items-center gap-1.5">
        {/* Logo / Title */}
        <h1 className="text-sm font-extrabold text-slate-100 tracking-tight shrink-0">
          TCP
        </h1>

        {/* Season Dropdown */}
        {seasonDropdown}

        {/* Spielplan / Tabelle toggle */}
        <div className="flex rounded-md overflow-hidden border border-slate-600 shrink-0">
          <button
            onClick={() => setSubTab("spielplan")}
            className={`px-2 py-1 text-[11px] font-semibold transition-colors ${
              subTab === "spielplan"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Spielplan
          </button>
          <button
            onClick={() => setSubTab("tabelle")}
            className={`px-2 py-1 text-[11px] font-semibold transition-colors ${
              subTab === "tabelle"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Tabelle
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Spielplan-specific controls (only visible when Spielplan tab active) */}
        {showSpielplanControls && (
          <div className="flex items-center gap-1 shrink-0">
            {/* View toggle: Timeline / List as icons */}
            <div className="flex rounded-md overflow-hidden border border-slate-600">
              <button
                onClick={() => setView("timeline")}
                title="Zeitstrahl"
                className={`px-1.5 py-1 transition-colors ${
                  view === "timeline"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  <circle cx="4" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="4" cy="18" r="1.5" fill="currentColor" />
                </svg>
              </button>
              <button
                onClick={() => setView("list")}
                title="Liste"
                className={`px-1.5 py-1 transition-colors ${
                  view === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M3 10h18M3 15h18M3 20h18" />
                </svg>
              </button>
            </div>

            {/* PDF button (summer only) */}
            {isSummer && (
              <button
                onClick={onPdf}
                title="PDF exportieren"
                className="px-1.5 py-1 rounded-md bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 4h4" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
