import type { SubTab } from "../types";

interface SubTabsProps {
  activeTab: SubTab;
  onChange: (tab: SubTab) => void;
  spielplanCount?: number;
}

export default function SubTabs({ activeTab, onChange, spielplanCount }: SubTabsProps) {
  const tabs: { id: SubTab; label: string; icon: string }[] = [
    { id: "spielplan", label: "Spielplan", icon: "📋" },
    { id: "tabelle", label: "Tabelle", icon: "📊" },
  ];

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              active
                ? "bg-slate-700/60 text-slate-100 border border-slate-500/50 shadow-sm"
                : "bg-slate-800/30 text-slate-400 border border-slate-700/30 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <span className="text-xs">{tab.icon}</span>
            {tab.label}
            {tab.id === "spielplan" && spielplanCount !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                active ? "bg-slate-600/60 text-slate-300" : "bg-slate-700/40 text-slate-500"
              }`}>
                {spielplanCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
