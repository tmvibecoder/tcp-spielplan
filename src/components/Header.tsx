import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import type { SubTab } from "../types";

interface HeaderProps {
  onPdf: () => void;
  isSummer: boolean;
  seasonDropdown: ReactNode;
  // Konkurrenz-Auswahl (Button + Overlay), gilt für Spielplan UND Tabelle
  teamFilter: ReactNode;
  subTab: SubTab;
  setSubTab: (tab: SubTab) => void;
  showSpielplanControls: boolean;
}

export default function Header({
  onPdf,
  isSummer,
  seasonDropdown,
  teamFilter,
  subTab,
  setSubTab,
  showSpielplanControls,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
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
      {/* Zeile 1: Logo · Saison · Konkurrenzen · Menü */}
      <div className="max-w-5xl mx-auto px-2 pt-1.5 pb-1 flex items-center gap-1.5">
        {/* Logo / Title */}
        <h1 className="text-sm font-extrabold text-slate-100 tracking-tight shrink-0">
          TCP
        </h1>

        {/* Season Dropdown */}
        {seasonDropdown}

        {/* Konkurrenz-Auswahl */}
        {teamFilter}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ⋯ Menu (nur Sommer-Spielplan: PDF-Export) */}
        {showSpielplanControls && isSummer && (
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
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-1 min-w-[160px] z-50">
                <button
                  onClick={() => { onPdf(); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-purple-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  PDF exportieren
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zeile 2: Spielplan / Tabelle als volle Segment-Leiste */}
      <div className="max-w-5xl mx-auto px-2 pb-1.5">
        <div className="flex rounded-lg overflow-hidden border border-slate-600">
          <button
            onClick={() => setSubTab("spielplan")}
            className={`flex-1 py-1.5 text-xs font-bold transition-colors ${
              subTab === "spielplan"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            📅 Spielplan
          </button>
          <button
            onClick={() => setSubTab("tabelle")}
            className={`flex-1 py-1.5 text-xs font-bold transition-colors ${
              subTab === "tabelle"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            📊 Tabelle
          </button>
        </div>
      </div>
    </header>
  );
}
