import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import type { SubTab } from "../types";
import type { DataStand } from "../data/data-stand";

interface HeaderProps {
  onPdf: () => void;
  /** Öffnet die Kalender-Downloads (Overlay) */
  onCalendar: () => void;
  /** Öffnet die Suche (Spieler und Mannschaften) */
  onSearch: () => void;
  /** Den PDF-Export gibt es nur für Saisons mit Druck-Spielplan (Sommerrunde). */
  showPdf: boolean;
  /** Datenstand der BTV-Berichte und nächster Briefing-Lauf (im ⋯-Menü) */
  dataStand: DataStand;
  seasonDropdown: ReactNode;
  // Konkurrenz-Auswahl (Button + Overlay), gilt für Spielplan UND Tabelle
  teamFilter: ReactNode;
  subTab: SubTab;
  setSubTab: (tab: SubTab) => void;
  showSpielplanControls: boolean;
}

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

/** "2026-10-03T01:00:00+02:00" → "Sa 03.10.2026, 01:00 Uhr" (lokale Zeit des Geräts) */
export function formatStand(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${WEEKDAYS[d.getDay()]} ${dd}.${mm}.${d.getFullYear()}, ${hh}:${mi} Uhr`;
}

export default function Header({
  onPdf,
  onCalendar,
  onSearch,
  showPdf,
  dataStand,
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
      {/* Zeile 1: Logo · Saison · Konkurrenzen · Suche · Menü */}
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

        {/* Suche: beschriftet und größer als die übrigen Pillen, damit der
            Einstieg zu Spielern und Mannschaften auffällt */}
        <button
          type="button"
          onClick={onSearch}
          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-500/50 bg-sky-500/10 text-sky-300 text-xs font-bold hover:bg-sky-500/20 transition-colors"
          aria-label="Spieler und Mannschaften suchen"
        >
          🔍 Suche
        </button>

        {/* ⋯ Menü: Kalender-Downloads + PDF (nur Spielplan), Datenstand (immer) */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menü"
            className={`px-2.5 py-1.5 text-[13px] leading-none font-bold rounded-lg border transition-colors ${
              menuOpen
                ? "bg-slate-700 text-slate-100 border-slate-500"
                : "bg-slate-800 text-slate-400 border-slate-600 hover:text-slate-200 hover:bg-slate-700"
            }`}
          >
            ⋯
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-1 min-w-[250px] z-50">
              {showSpielplanControls && (
                <>
                  <button
                    onClick={() => { onCalendar(); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-sky-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    📆 Kalender-Downloads
                  </button>
                  {showPdf && (
                    <button
                      onClick={() => { onPdf(); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-purple-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      PDF exportieren
                    </button>
                  )}
                  <div className="my-1 border-t border-slate-700" />
                </>
              )}
              {/* Datenstand: bewusst hier versteckt statt im Briefing (Auftraggeber, 09.09.2026) */}
              <div className="px-3 py-1.5 text-[11px] text-slate-400 leading-relaxed tabular-nums">
                <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500">Datenstand BTV-Berichte</p>
                <p className="text-slate-200 font-semibold">{formatStand(dataStand.crawledAt)}</p>
                <p className="text-slate-500">{dataStand.scope}</p>
              </div>
              <div className="px-3 pb-2 pt-0.5 text-[11px] text-slate-400 leading-relaxed tabular-nums">
                <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500">Nächster Lauf</p>
                {dataStand.nextRun ? (
                  <>
                    <p className="text-slate-200 font-semibold">{formatStand(dataStand.nextRun.at)}</p>
                    <p className="text-slate-500">{dataStand.nextRun.reason}</p>
                  </>
                ) : (
                  <p className="text-slate-500">keine TCP-Begegnung geplant</p>
                )}
              </div>
            </div>
          )}
        </div>
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
