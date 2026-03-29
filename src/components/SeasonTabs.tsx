import type { Season, SeasonId } from "../types";

interface SeasonDropdownProps {
  seasons: Season[];
  activeSeason: SeasonId;
  onChange: (id: SeasonId) => void;
}

export default function SeasonDropdown({ seasons, activeSeason, onChange }: SeasonDropdownProps) {
  return (
    <div className="relative inline-block">
      <select
        value={activeSeason}
        onChange={(e) => onChange(e.target.value as SeasonId)}
        className="appearance-none bg-slate-800/70 border border-slate-600/50 rounded-md px-2 py-1 pr-6 text-[11px] font-semibold text-slate-200 cursor-pointer hover:bg-slate-700/70 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500/50"
      >
        {seasons.map((s) => (
          <option key={s.id} value={s.id}>
            {s.icon} {s.shortLabel}
          </option>
        ))}
      </select>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[9px]">
        ▼
      </span>
    </div>
  );
}
