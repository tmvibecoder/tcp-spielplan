import { LK_STEPS, lkStep } from "../data/kader";

// LK-Verteilung eines Kaders als kleine Grafik: wie stark und wie breit ist die
// Meldeliste besetzt, und wo darin liegen die tatsächlich Eingesetzten?
// Gezählt wird je voller LK-Stufe (LK 1 bis 25) — verbatim aus der Meldeliste.

const STEPS = Array.from({ length: LK_STEPS }, (_, i) => i);
const AXIS = [5, 10, 15, 20];

function Axis() {
  return (
    <div className="relative mt-0.5 h-[14px] text-[11px] leading-[14px] tabular-nums text-slate-400" aria-hidden="true">
      <span className="absolute left-0">LK 1</span>
      {AXIS.map((n) => (
        <span key={n} className="absolute -translate-x-1/2" style={{ left: `${((n - 0.5) / LK_STEPS) * 100}%` }}>{n}</span>
      ))}
      <span className="absolute right-0">25</span>
    </div>
  );
}

/** Bis zu dieser Stapelhöhe ein Punkt je Person, darüber Säulen. */
const MAX_DOTS = 7;

interface ProfileEntry {
  lk: string;
  /** in dieser Saison eingesetzt */
  played: boolean;
}

/** LK-Profil eines Kaders: ein Punkt je gemeldeter Person, gestapelt je LK-Stufe;
 *  Eingesetzte in der Akzentfarbe. Große Meldelisten (mehr als 7 je Stufe)
 *  werden als Säulen gezeichnet. */
export default function LkProfile({ entries, title = "LK-Profil des Kaders" }: { entries: ProfileEntry[]; title?: string }) {
  const cols = STEPS.map(() => ({ total: 0, played: 0 }));
  for (const e of entries) {
    const i = lkStep(e.lk);
    if (i < 0) continue;
    cols[i].total++;
    if (e.played) cols[i].played++;
  }
  const max = Math.max(0, ...cols.map((c) => c.total));
  if (max === 0) return null;
  const anyPlayed = cols.some((c) => c.played > 0);
  const dots = max <= MAX_DOTS;
  const counted = cols.reduce((s, c) => s + c.total, 0);
  const label = `Verteilung der ${counted} Gemeldeten nach Leistungsklasse von LK 1 bis LK 25`;

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 px-3 pb-1.5 pt-2">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
        <span className="mr-auto text-[12px] font-bold text-slate-200">{title}</span>
        {anyPlayed && (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />im Einsatz
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
          <span className="h-2 w-2 rounded-full bg-slate-500" />gemeldet
        </span>
      </div>
      <div
        role="img"
        aria-label={label}
        className={`mt-1.5 grid border-b border-slate-500/50 ${dots ? "items-end" : "items-stretch"}`}
        style={{ gridTemplateColumns: `repeat(${LK_STEPS}, minmax(0, 1fr))`, height: dots ? max * 9 + 1 : 57 }}
      >
        {cols.map((c, i) =>
          dots ? (
            <div key={i} className="flex flex-col-reverse items-center gap-px pb-px">
              {Array.from({ length: c.total }, (_, k) => (
                <span key={k} className={`h-2 w-2 rounded-full ${k < c.played ? "bg-[var(--accent)]" : "bg-slate-500"}`} />
              ))}
            </div>
          ) : (
            <div key={i} className="flex h-full flex-col-reverse items-center">
              {c.played > 0 && <span className="w-[62%] bg-[var(--accent)]" style={{ height: `${(c.played / max) * 100}%` }} />}
              {c.total > c.played && <span className="w-[62%] rounded-t-sm bg-slate-500" style={{ height: `${((c.total - c.played) / max) * 100}%` }} />}
            </div>
          ),
        )}
      </div>
      <Axis />
      {!dots && <p className="text-[11px] leading-snug text-slate-400">Säulenhöhe = Zahl der Gemeldeten je LK-Stufe, höchste Säule: {max}.</p>}
    </div>
  );
}
