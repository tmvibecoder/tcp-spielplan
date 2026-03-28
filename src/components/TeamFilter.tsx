import { CATEGORIES } from "../data/constants";
import { TEAMS } from "../data/teams";
import type { Team } from "../types";

interface TeamFilterProps {
  activeTeams: Set<string>;
  toggleTeam: (id: string) => void;
  toggleCategory: (ids: string[]) => void;
  categories?: { label: string; ids: string[] }[];
  teams?: Team[];
}

export default function TeamFilter({
  activeTeams,
  toggleTeam,
  toggleCategory,
  categories,
  teams,
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
    </div>
  );
}
