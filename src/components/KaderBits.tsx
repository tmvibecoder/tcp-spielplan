import type { FormGroup, RecentBalance } from "../data/player-history";
import { ALL_SEASONS } from "../data/seasons";

// Gemeinsame Bausteine der Kader-Ansichten (Kaderliste, Einsatz-Matrix,
// Kader-Vergleich, Vereinskader). Eine Regel gilt überall: Sieg = gefüllt grün,
// Niederlage = rot umrandet — die Form trägt die Aussage mit, nicht nur die Farbe.

/** LK als Zahl im festen Kästchen, damit die Spalte bündig steht. `played`
 *  = in dieser Saison eingesetzt (Akzentfarbe der Mannschaft). */
export function LkCell({ lk, played = false, className = "" }: { lk: string; played?: boolean; className?: string }) {
  const value = lk.replace(/^LK\s*/i, "").trim();
  return (
    <span
      className={`inline-flex h-[22px] w-11 shrink-0 items-center justify-center rounded-md text-[12px] font-extrabold tabular-nums ring-1 ring-inset ${
        played
          ? "bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-slate-50 ring-[color-mix(in_srgb,var(--accent)_55%,transparent)]"
          : "bg-slate-700/50 text-slate-200 ring-slate-500/40"
      } ${className}`}
      title={value ? `Leistungsklasse ${value}` : "keine LK bekannt"}
    >
      {value || "–"}
    </span>
  );
}

/** Siege:Niederlagen in Grün und Rot. */
export function WinLoss({ wins, losses, className = "" }: { wins: number; losses: number; className?: string }) {
  return (
    <span className={`font-extrabold tabular-nums ${className}`}>
      <span className="text-emerald-400">{wins}</span>
      <span className="text-slate-400">:</span>
      <span className="text-red-400">{losses}</span>
    </span>
  );
}

/** Matches, bei denen der Balken der 12-Monats-Bilanz seine volle Breite erreicht. */
const BAR_FULL = 30;

/** Bilanz der letzten 12 Monate: Zahl und darunter ein Balken — Länge = Zahl der
 *  Matches, grün gewonnen, rot verloren. Ohne Matches steht „keine". */
export function Bilanz12Cell({ balance }: { balance: RecentBalance }) {
  const { wins, losses } = balance;
  const played = wins + losses;
  if (!played) {
    return (
      <span className="block w-14 shrink-0 text-right text-[11px] text-slate-400" title="Keine Matches in den letzten 12 Monaten erfasst">
        keine
      </span>
    );
  }
  const total = Math.min(played, BAR_FULL) / BAR_FULL * 100;
  return (
    <span
      className="block w-14 shrink-0"
      title={`Letzte 12 Monate: ${played} Match${played === 1 ? "" : "es"}, ${wins} gewonnen, ${losses} verloren`}
    >
      <span className="block text-right text-[12px] leading-[14px]"><WinLoss wins={wins} losses={losses} /></span>
      <span className="mt-[3px] flex h-1 justify-end" aria-hidden="true">
        <span className="flex h-1 gap-px" style={{ width: `${Math.max(total, 8)}%` }}>
          {wins > 0 && <span className="h-1 rounded-sm bg-emerald-400" style={{ flexGrow: wins }} />}
          {losses > 0 && <span className="h-1 rounded-sm bg-red-400" style={{ flexGrow: losses }} />}
        </span>
      </span>
    </span>
  );
}

/** Kachel einer Position: „E1", „D2" oder nur die Zahl. Sieg gefüllt, Niederlage umrandet. */
export function ResultTile({ label, won, size = "md" }: { label: string; won: boolean; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "h-[22px] w-[22px] rounded-md text-[12px]" : "h-[30px] w-[30px] rounded-lg text-[12px]";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-extrabold tabular-nums ${sz} ${
        won ? "bg-emerald-400 text-emerald-950" : "border-[1.5px] border-red-400 text-red-300"
      }`}
    >
      {label}
    </span>
  );
}

const seasonShort = (id: string) => ALL_SEASONS.find((s) => s.id === id)?.shortLabel ?? id;

/** Formverlauf: ein Punkt je Match der letzten 12 Monate, älteste links, je
 *  Saison gruppiert. Gefüllt = Sieg, Ring = Niederlage. */
export function FormDots({ form }: { form: FormGroup[] }) {
  const all = form.flatMap((g) => g.results);
  const wins = all.filter(Boolean).length;
  return (
    <div
      className="flex flex-wrap gap-x-3 gap-y-2"
      role="img"
      aria-label={`Formverlauf der letzten 12 Monate: ${wins} Siege, ${all.length - wins} Niederlagen`}
    >
      {form.map((g) => (
        <div key={g.season} className="flex min-w-0 flex-col gap-[3px]">
          <div className="flex flex-wrap gap-1">
            {g.results.map((won, i) => (
              <span
                key={i}
                className={`h-3 w-3 rounded-full ${won ? "bg-emerald-400" : "border-2 border-red-400"}`}
              />
            ))}
          </div>
          <div className="whitespace-nowrap text-[11px] leading-[14px] text-slate-400">{seasonShort(g.season)}</div>
        </div>
      ))}
    </div>
  );
}

/** Legende zur Kachel-Schreibweise (Einsatz-Matrix, Spielerdetail). */
export function TileLegend({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px] text-slate-300 ${className}`}>
      <span className="inline-flex items-center gap-1.5"><ResultTile label="1" won size="sm" />Sieg</span>
      <span className="inline-flex items-center gap-1.5"><ResultTile label="1" won={false} size="sm" />Niederlage</span>
      <span className="text-slate-400">Zahl = Position · E Einzel · D Doppel</span>
    </div>
  );
}
