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

/** Bilanz der letzten 12 Monate als kleines Schild: grüne Siege, rote
 *  Niederlagen, davor das Etikett „12 Mon.". Ohne Matches in dem Zeitraum
 *  erscheint ein gedimmtes „–" — so sieht man auf den ersten Blick, wer
 *  gemeldet, aber nicht aktiv ist (Thomas, 07.10.2026). Die Zahlen rechnet der
 *  Aufrufer (recentBalance in player-history.ts) — dieses Modul bleibt leicht,
 *  weil es auch im Startbundel steckt. */
export function Bilanz12({ wins, losses, className = "" }: { wins: number; losses: number; className?: string }) {
  const played = wins + losses;
  const title = played
    ? `Letzte 12 Monate: ${played} Match${played === 1 ? "" : "es"}, ${wins} gewonnen, ${losses} verloren`
    : "Keine Matches in den letzten 12 Monaten erfasst";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-[2px] text-[10px] leading-none tabular-nums ${
        played ? "border-slate-600/60 bg-slate-800/70" : "border-slate-700/40 bg-slate-800/30"
      } ${className}`}
      title={title}
    >
      <span className={`font-semibold ${played ? "text-slate-400" : "text-slate-600"}`}>12 Mon.</span>
      {played ? (
        <span className="font-extrabold">
          <span className="text-emerald-400">{wins}</span>
          <span className="text-slate-500">:</span>
          <span className="text-red-400">{losses}</span>
        </span>
      ) : (
        <span className="font-extrabold text-slate-600">–</span>
      )}
    </span>
  );
}

/** Jahrgang als dezenter Zusatz hinter der LK — 0/fehlend (Ersatzspieler ohne
 *  Meldelisten-Eintrag) wird nicht gezeigt. */
export function Jahrgang({ jahrgang, className = "" }: { jahrgang?: number; className?: string }) {
  if (!jahrgang) return null;
  return (
    <span className={`shrink-0 text-[10px] font-semibold tabular-nums text-slate-500 ${className}`} title={`Jahrgang ${jahrgang}`}>
      Jg. {jahrgang}
    </span>
  );
}
