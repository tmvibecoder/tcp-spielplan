import type { IndividualMatch } from "../types";
import {
  parseSide,
  getSets,
  sideOutcome,
  nameClass,
  checkClass,
  setCellClass,
  type ParsedPlayer,
  type SetScore,
  type TcpSide,
} from "../utils/spielbericht";

function SideLine({
  players,
  won,
  side,
  sets,
  tcpSide,
}: {
  players: ParsedPlayer[];
  won: boolean;
  side: "home" | "away";
  sets: SetScore[];
  tcpSide: TcpSide;
}) {
  const outcome = sideOutcome(side, won, tcpSide);
  const check = checkClass(outcome);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className={`flex min-w-0 flex-col gap-0.5 ${nameClass(outcome)}`}>
        {players.map((p, i) => (
          <span key={i} className="flex items-center gap-1.5 text-sm leading-tight">
            {check && i === 0 && <span className={check}>✓</span>}
            <span className="truncate">{p.name}</span>
            {p.lk && (
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-300 ring-1 ring-inset ring-slate-600/50">
                {p.lk}
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="flex shrink-0 gap-1 tabular-nums">
        {sets.map((s, i) => {
          const v = side === "home" ? s.home : s.away;
          const setWon = side === "home" ? s.homeWon : !s.homeWon;
          const cell = setCellClass(sideOutcome(side, setWon, tcpSide));
          return (
            <span key={i} className={`h-7 w-7 rounded text-center text-sm leading-7 ${cell}`}>
              {v}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function MatchCard({ im, tcpSide }: { im: IndividualMatch; tcpSide: TcpSide }) {
  const sets = getSets(im);
  const label = im.match_type === "doubles" ? `Doppel ${im.position - 6}` : `Einzel ${im.position}`;

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="space-y-1">
        <SideLine players={parseSide(im.home_player)} won={im.winner === "home"} side="home" sets={sets} tcpSide={tcpSide} />
        <SideLine players={parseSide(im.away_player)} won={im.winner === "away"} side="away" sets={sets} tcpSide={tcpSide} />
      </div>
    </div>
  );
}
