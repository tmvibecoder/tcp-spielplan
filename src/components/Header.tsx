import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import type { SubTab } from "../types";

interface HeaderProps {
  onPdf: () => void;
  onRefresh: () => Promise<void>;
  isSummer: boolean;
  seasonDropdown: ReactNode;
  subTab: SubTab;
  setSubTab: (tab: SubTab) => void;
  showSpielplanControls: boolean;
}

export default function Header({
  onPdf,
  onRefresh,
  isSummer,
  seasonDropdown,
  subTab,
  setSubTab,
  showSpielplanControls,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshDone, setRefreshDone] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

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

        {/* Refresh button */}
        {showSpielplanControls && (
          <button
            onClick={async () => {
              setRefreshing(true);
              setRefreshDone(false);
              await onRefresh();
              setRefreshing(false);
              setRefreshDone(true);
              setTimeout(() => setRefreshDone(false), 2000);
            }}
            disabled={refreshing}
            className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-md border transition-colors ${
              refreshDone
                ? "bg-emerald-900/30 border-emerald-500/30 text-emerald-400"
                : "bg-slate-800 border-slate-600 text-sky-400 hover:bg-slate-700 hover:text-sky-300"
            } disabled:opacity-50`}
            title="Spielstände aktualisieren"
          >
            <svg
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              {refreshDone ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115.36-5.36M20 15a9 9 0 01-15.36 5.36" />
              )}
            </svg>
          </button>
        )}

        {/* ⋯ Menu (only when Spielplan tab is active) */}
        {showSpielplanControls && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`px-2 py-1 text-[11px] font-bold rounded-md border transition-colors ${
                menuOpen
                  ? "bg-slate-700 text-slate-100 border-slate-500"
                  : "bg-slate-800 text-slate-400 border-slate-600 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              ⋯
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-1 min-w-[140px] z-50">
                {isSummer && (
                  <button
                    onClick={() => { onPdf(); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-purple-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    PDF exportieren
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
