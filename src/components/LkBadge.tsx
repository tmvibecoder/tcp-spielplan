// Leistungsklasse als eigenständiges, überall gleiches Abzeichen.
//
// Auftraggeber-Wunsch (09.09.2026): LKs sollen „ein bisschen grafisch
// hervorgehoben" sein, damit sie beim Überfliegen sofort ins Auge fallen —
// deshalb ein kleines Schild mit abgesetztem „LK"-Präfix und fetter Zahl,
// nicht nur Text. Wird in Spielberichten, Meldelisten, Spielerhistorie und
// Gegnerbriefing verwendet; neue Farben gibt es nicht (Sky für die eigene
// Seite, Slate für die Gegenseite).

interface LkBadgeProps {
  /** "LK14,3" oder "14,3" — leer → nichts rendern */
  lk: string;
  /** own = betrachtete Seite (Sky), opp = Gegenseite (Slate), muted = ohne Einsatz */
  tone?: "own" | "opp" | "muted";
  size?: "sm" | "md";
  className?: string;
}

const TONE = {
  own: "bg-sky-500/15 text-sky-100 ring-sky-400/40",
  opp: "bg-slate-700/60 text-slate-200 ring-slate-500/40",
  muted: "bg-slate-800/60 text-slate-400 ring-slate-600/40",
};

export default function LkBadge({ lk, tone = "own", size = "sm", className = "" }: LkBadgeProps) {
  const value = lk.replace(/^LK\s*/i, "").trim();
  if (!value) return null;
  const sz = size === "md" ? "px-1.5 py-0.5 text-[12px]" : "px-1 py-[1px] text-[10.5px]";
  return (
    <span
      className={`inline-flex shrink-0 items-baseline gap-0.5 rounded-md ring-1 ring-inset font-extrabold tabular-nums leading-none ${sz} ${TONE[tone]} ${className}`}
      title={`Leistungsklasse ${value}`}
    >
      <span className="text-[0.7em] font-bold uppercase tracking-wide opacity-70">LK</span>
      {value}
    </span>
  );
}
