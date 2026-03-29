import { CATEGORIES } from "../data/constants";
import { TEAMS } from "../data/teams";
import { BTV_VEREIN_URL } from "../data/constants";
import type { Team } from "../types";

interface TeamFilterProps {
  activeTeams: Set<string>;
  toggleTeam: (id: string) => void;
  toggleCategory: (ids: string[]) => void;
  categories?: { label: string; ids: string[] }[];
  teams?: Team[];
  homeOnly: boolean;
  setHomeOnly: (v: boolean) => void;
}

export default function TeamFilter({
  activeTeams,
  toggleTeam,
  toggleCategory,
  categories,
  teams,
  homeOnly,
  setHomeOnly,
}: TeamFilterProps) {
  const cats = categories || CATEGORIES;
  const teamList = teams || TEAMS;
  const teamMap = new Map<string, Team>(teamList.map((t) => [t.id, t]));

  return (
    <div className="space-y-3">
      {cats.map((cat) => {
        const allActive = cat.ids.every((id) => activeTeams.has(id));
        return (
          <div key={cat.label}>
            <button
              onClick={() => toggleCategory(cat.ids)}
              className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 transition-colors ${
                allActive ? "text-slate-200" : "text-slate-500"
              } hover:text-slate-300`}
            >
              {cat.label}
            </button>
            <div className="flex flex-wrap gap-1.5">
              {cat.ids.map((id) => {
                const team = teamMap.get(id);
                if (!team) return null;
                const active = activeTeams.has(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleTeam(id)}
                    className="px-2 py-1 rounded-md text-[11px] font-semibold transition-all border"
                    style={{
                      borderColor: active ? team.color + "60" : "#475569",
                      backgroundColor: active ? team.color + "18" : "transparent",
                      color: active ? team.color : "#64748b",
                    }}
                  >
                    {team.emoji} {team.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Bottom row: Nur Heim toggle + BTV link */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => setHomeOnly(!homeOnly)}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors ${
            homeOnly
              ? "bg-green-600/30 text-green-300 border-green-500/50 hover:bg-green-600/40"
              : "bg-slate-800 text-slate-400 border-slate-600 hover:bg-slate-700"
          }`}
        >
          Nur Heim
        </button>
        <a
          href={BTV_VEREIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors ml-auto"
        >
          BTV Vereinsseite →
        </a>
      </div>
    </div>
  );
}
