import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import TeamFilter from "./TeamFilter";
import { CATEGORIES } from "../data/constants";
import type { Team } from "../types";

interface TeamFilterDropdownProps {
  activeTeams: Set<string>;
  toggleTeam: (id: string) => void;
  toggleCategory: (ids: string[]) => void;
  setAllTeams: (on: boolean) => void;
  categories?: { label: string; ids: string[] }[];
  teams?: Team[];
  homeOnly: boolean;
  setHomeOnly: (v: boolean) => void;
  onSavePrefs: () => void;
}

// Konkurrenz-Auswahl als Header-Button mit Overlay-Panel (gilt für Spielplan UND
// Tabelle). Das Panel wird per Portal an <body> gehängt, damit Backdrop und
// Positionierung nicht vom Header (sticky + backdrop-blur) eingeschränkt werden.
export default function TeamFilterDropdown({
  activeTeams,
  toggleTeam,
  toggleCategory,
  setAllTeams,
  categories,
  teams,
  homeOnly,
  setHomeOnly,
  onSavePrefs,
}: TeamFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const cats = categories || CATEGORIES;
  const activeCount = cats.flatMap((c) => c.ids).filter((id) => activeTeams.has(id)).length;

  // ESC schließt das Panel
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSave = () => {
    onSavePrefs();
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1500);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-colors shrink-0 ${
          open
            ? "bg-sky-600/30 text-sky-200 border-sky-500/60"
            : "bg-slate-800 text-sky-300 border-sky-500/40 hover:bg-slate-700"
        }`}
      >
        Konkurrenzen ({activeCount}) ▾
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] bg-slate-950/70"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div className="fixed left-1/2 -translate-x-1/2 top-12 w-[min(92vw,26rem)] max-h-[75vh] overflow-y-auto rounded-xl border border-slate-600 bg-slate-800 shadow-2xl p-3.5">
              <div className="flex items-center mb-2">
                <span className="text-xs font-extrabold text-slate-200">Konkurrenzen wählen</span>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-auto px-1.5 text-slate-400 hover:text-slate-200 text-sm"
                  aria-label="Schließen"
                >
                  ✕
                </button>
              </div>

              <TeamFilter
                activeTeams={activeTeams}
                toggleTeam={toggleTeam}
                toggleCategory={toggleCategory}
                setAllTeams={setAllTeams}
                categories={categories}
                teams={teams}
                homeOnly={homeOnly}
                setHomeOnly={setHomeOnly}
              />

              <div className="mt-3 pt-3 border-t border-slate-700/60">
                <button
                  onClick={handleSave}
                  className={`w-full px-2.5 py-1.5 text-[11px] font-semibold rounded-md border transition-colors ${
                    savedFlash
                      ? "bg-green-600/25 text-green-300 border-green-500/50"
                      : "bg-slate-900 text-sky-300 border-slate-600 hover:bg-slate-700"
                  }`}
                >
                  {savedFlash ? "✓ Gespeichert" : "Auswahl speichern"}
                </button>
                <p className="mt-1.5 text-[10px] text-slate-500 text-center">
                  Gespeicherte Auswahl wird beim nächsten Besuch automatisch angewandt.
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
