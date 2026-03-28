import { useState, useCallback } from "react";
import type { Match, Team, IndividualMatch } from "../types";
import { getSinglesCount, getDoublesCount } from "../data/team-format";
import { computeWinner, needsThirdSet } from "../utils/score-helpers";

interface ScoreEntryProps {
  match: Match;
  team: Team;
  existingMatches: IndividualMatch[];
  onSave: (
    individualMatches: Omit<IndividualMatch, "id" | "match_score_id">[]
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

/** Position data normalized to TCP perspective (TCP always left) */
interface PositionData {
  position: number;
  match_type: "singles" | "doubles";
  tcp_player: string;
  opp_player: string;
  set1_tcp: string;
  set1_opp: string;
  set2_tcp: string;
  set2_opp: string;
  set3_tcp: string;
  set3_opp: string;
}

function abbreviateClub(name: string): string {
  if (name.includes("Pliening")) return "TCP";
  const prefixes = [
    "MTTC ", "TC ", "TSV ", "SV ", "VfB ", "TF ", "TeG ", "SpVgg ",
    "WB ", "TS ", "SC ", "FC ", "PSV ", "ATSV ", "HC ",
  ];
  let short = name;
  for (const p of prefixes) {
    if (short.startsWith(p)) {
      short = short.slice(p.length);
      break;
    }
  }
  short = short.replace(/ München$/i, "").replace(/ I{2,3}$/, "");
  if (short.length > 14) short = short.slice(0, 13) + ".";
  return short;
}

function initPositions(
  teamId: string,
  existing: IndividualMatch[],
  isHome: boolean
): PositionData[] {
  const singles = getSinglesCount(teamId);
  const doubles = getDoublesCount(teamId);
  const positions: PositionData[] = [];

  for (let i = 1; i <= singles; i++) {
    const ex = existing.find((e) => e.position === i && e.match_type === "singles");
    positions.push(fromExisting(i, "singles", ex, isHome));
  }

  for (let i = 1; i <= doubles; i++) {
    const pos = singles + i;
    const ex = existing.find((e) => e.position === pos && e.match_type === "doubles")
      || existing.find((e) => e.position === pos);
    positions.push(fromExisting(pos, "doubles", ex, isHome));
  }

  return positions;
}

function fromExisting(
  pos: number,
  type: "singles" | "doubles",
  ex: IndividualMatch | undefined,
  isHome: boolean
): PositionData {
  if (!ex) {
    return {
      position: pos, match_type: type,
      tcp_player: "", opp_player: "",
      set1_tcp: "", set1_opp: "",
      set2_tcp: "", set2_opp: "",
      set3_tcp: "", set3_opp: "",
    };
  }
  return {
    position: pos, match_type: type,
    tcp_player: (isHome ? ex.home_player : ex.away_player) || "",
    opp_player: (isHome ? ex.away_player : ex.home_player) || "",
    set1_tcp: (isHome ? ex.set1_home : ex.set1_away)?.toString() || "",
    set1_opp: (isHome ? ex.set1_away : ex.set1_home)?.toString() || "",
    set2_tcp: (isHome ? ex.set2_home : ex.set2_away)?.toString() || "",
    set2_opp: (isHome ? ex.set2_away : ex.set2_home)?.toString() || "",
    set3_tcp: (isHome ? ex.set3_home : ex.set3_away)?.toString() || "",
    set3_opp: (isHome ? ex.set3_away : ex.set3_home)?.toString() || "",
  };
}

function parseNum(s: string): number | null {
  if (s === "" || s === undefined) return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

/** Color for a set pair based on TCP perspective */
function setColor(tcpScore: string, oppScore: string): string {
  const tcp = parseInt(tcpScore, 10);
  const opp = parseInt(oppScore, 10);
  if (isNaN(tcp) || isNaN(opp)) return "bg-slate-800/50 border-slate-700/30";
  if (tcp > opp) return "bg-emerald-900/25 border-emerald-700/30";
  if (opp > tcp) return "bg-red-900/20 border-red-700/25";
  return "bg-slate-800/50 border-slate-700/30";
}

/** Winner icon from TCP perspective */
function winnerIcon(p: PositionData, isHome: boolean): React.ReactNode {
  const winner = computeWinner({
    set1_home: parseNum(isHome ? p.set1_tcp : p.set1_opp),
    set1_away: parseNum(isHome ? p.set1_opp : p.set1_tcp),
    set2_home: parseNum(isHome ? p.set2_tcp : p.set2_opp),
    set2_away: parseNum(isHome ? p.set2_opp : p.set2_tcp),
    set3_home: parseNum(isHome ? p.set3_tcp : p.set3_opp),
    set3_away: parseNum(isHome ? p.set3_opp : p.set3_tcp),
  });
  if (!winner) return <span className="w-4 inline-block" />;
  const tcpWon = (winner === "home" && isHome) || (winner === "away" && !isHome);
  if (tcpWon) return <span className="text-emerald-400/80 text-sm w-4 inline-block text-center">&#10003;</span>;
  return <span className="text-red-400/70 text-sm w-4 inline-block text-center">&#10005;</span>;
}

function showSet3(p: PositionData, isHome: boolean): boolean {
  return needsThirdSet({
    set1_home: parseNum(isHome ? p.set1_tcp : p.set1_opp),
    set1_away: parseNum(isHome ? p.set1_opp : p.set1_tcp),
    set2_home: parseNum(isHome ? p.set2_tcp : p.set2_opp),
    set2_away: parseNum(isHome ? p.set2_opp : p.set2_tcp),
  });
}

export default function ScoreEntry({
  match,
  team: _team,
  existingMatches,
  onSave,
  onCancel,
}: ScoreEntryProps) {
  void _team;
  const isHome = match.isHome;
  const [positions, setPositions] = useState<PositionData[]>(() =>
    initPositions(match.teamId, existingMatches, isHome)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLineup, setShowLineup] = useState(false);

  const opponent = match.isHome ? match.away : match.home;
  const oppShort = abbreviateClub(opponent);

  const updateField = useCallback(
    (idx: number, field: keyof PositionData, value: string) => {
      setPositions((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], [field]: value };
        return next;
      });
    },
    []
  );

  // Compute live team score from TCP perspective
  const tcpWins = positions.filter((p) => {
    const w = computeWinner({
      set1_home: parseNum(isHome ? p.set1_tcp : p.set1_opp),
      set1_away: parseNum(isHome ? p.set1_opp : p.set1_tcp),
      set2_home: parseNum(isHome ? p.set2_tcp : p.set2_opp),
      set2_away: parseNum(isHome ? p.set2_opp : p.set2_tcp),
      set3_home: parseNum(isHome ? p.set3_tcp : p.set3_opp),
      set3_away: parseNum(isHome ? p.set3_opp : p.set3_tcp),
    });
    return (w === "home" && isHome) || (w === "away" && !isHome);
  }).length;

  const oppWins = positions.filter((p) => {
    const w = computeWinner({
      set1_home: parseNum(isHome ? p.set1_tcp : p.set1_opp),
      set1_away: parseNum(isHome ? p.set1_opp : p.set1_tcp),
      set2_home: parseNum(isHome ? p.set2_tcp : p.set2_opp),
      set2_away: parseNum(isHome ? p.set2_opp : p.set2_tcp),
      set3_home: parseNum(isHome ? p.set3_tcp : p.set3_opp),
      set3_away: parseNum(isHome ? p.set3_opp : p.set3_tcp),
    });
    return (w === "home" && !isHome) || (w === "away" && isHome);
  }).length;

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);

    const individualMatches = positions.map((p) => {
      const im = {
        position: p.position,
        match_type: p.match_type as "singles" | "doubles",
        home_player: isHome ? p.tcp_player.trim() : p.opp_player.trim(),
        away_player: isHome ? p.opp_player.trim() : p.tcp_player.trim(),
        set1_home: parseNum(isHome ? p.set1_tcp : p.set1_opp),
        set1_away: parseNum(isHome ? p.set1_opp : p.set1_tcp),
        set2_home: parseNum(isHome ? p.set2_tcp : p.set2_opp),
        set2_away: parseNum(isHome ? p.set2_opp : p.set2_tcp),
        set3_home: parseNum(isHome ? p.set3_tcp : p.set3_opp),
        set3_away: parseNum(isHome ? p.set3_opp : p.set3_tcp),
        winner: null as "home" | "away" | null,
      };
      im.winner = computeWinner(im);
      return im;
    });

    const result = await onSave(individualMatches);
    if (!result.success) {
      setError(result.error || "Speichern fehlgeschlagen");
    }
    setSaving(false);
  }, [positions, onSave, isHome]);

  const singles = positions.filter((p) => p.match_type === "singles");
  const doubles = positions.filter((p) => p.match_type === "doubles");

  return (
    <div className="space-y-4">
      {/* Header with team names and live score */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100">Ergebnis eintragen</h3>
        <button
          onClick={onCancel}
          className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-2 py-1"
        >
          &#10005;
        </button>
      </div>

      <div className="flex items-center justify-center gap-3 py-2 bg-slate-900/60 rounded-lg border border-slate-700/30">
        <span className="text-sm font-bold text-slate-200">TC Pliening</span>
        <span className="text-xl font-extrabold text-slate-100 tabular-nums">
          {tcpWins}:{oppWins}
        </span>
        <span className="text-sm font-bold text-slate-400">{oppShort}</span>
      </div>

      {/* Column legend */}
      <div className="flex items-center justify-end gap-1 px-1">
        <span className="text-[10px] text-slate-500">Links = TCP, Rechts = {oppShort}</span>
      </div>

      {/* EINZEL */}
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Einzel
        </p>
        <div className="space-y-1">
          {singles.map((p, idx) => {
            const posIdx = positions.findIndex((pp) => pp.position === p.position);
            const need3 = showSet3(p, isHome);
            return (
              <ScoreRow
                key={p.position}
                label={`#${idx + 1}`}
                p={p}
                posIdx={posIdx}
                isHome={isHome}
                showSet3={need3}
                updateField={updateField}
              />
            );
          })}
        </div>
      </div>

      {/* DOPPEL */}
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Doppel
        </p>
        <div className="space-y-1">
          {doubles.map((p, idx) => {
            const posIdx = positions.findIndex((pp) => pp.position === p.position);
            const need3 = showSet3(p, isHome);
            return (
              <ScoreRow
                key={p.position}
                label={`#${idx + 1}`}
                p={p}
                posIdx={posIdx}
                isHome={isHome}
                showSet3={need3}
                updateField={updateField}
              />
            );
          })}
        </div>
      </div>

      {/* AUFSTELLUNG (collapsible) */}
      <div className="border-t border-slate-700/30 pt-3">
        <button
          onClick={() => setShowLineup(!showLineup)}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-300 transition-colors w-full"
        >
          <span className="text-[10px]">{showLineup ? "▲" : "▼"}</span>
          Aufstellung
        </button>

        {showLineup && (
          <div className="mt-3 space-y-1">
            {/* Column headers */}
            <div className="flex items-center gap-2 px-1 mb-2">
              <span className="w-8 shrink-0" />
              <span className="flex-1 text-[10px] font-bold text-slate-500 uppercase">TC Pliening</span>
              <span className="flex-1 text-[10px] font-bold text-slate-500 uppercase text-right">{oppShort}</span>
            </div>

            {/* Singles lineup */}
            <p className="text-[10px] text-slate-500 px-1 mt-2">Einzel</p>
            {singles.map((p, idx) => {
              const posIdx = positions.findIndex((pp) => pp.position === p.position);
              return (
                <LineupRow
                  key={p.position}
                  label={`#${idx + 1}`}
                  tcpPlayer={p.tcp_player}
                  oppPlayer={p.opp_player}
                  onTcpChange={(v) => updateField(posIdx, "tcp_player", v)}
                  onOppChange={(v) => updateField(posIdx, "opp_player", v)}
                  tcpPlaceholder={`Spieler ${idx + 1}`}
                  oppPlaceholder={`Spieler ${idx + 1}`}
                />
              );
            })}

            {/* Doubles lineup */}
            <p className="text-[10px] text-slate-500 px-1 mt-3">Doppel</p>
            {doubles.map((p, idx) => {
              const posIdx = positions.findIndex((pp) => pp.position === p.position);
              return (
                <LineupRow
                  key={p.position}
                  label={`#${idx + 1}`}
                  tcpPlayer={p.tcp_player}
                  oppPlayer={p.opp_player}
                  onTcpChange={(v) => updateField(posIdx, "tcp_player", v)}
                  onOppChange={(v) => updateField(posIdx, "opp_player", v)}
                  tcpPlaceholder={`Doppel ${idx + 1}`}
                  oppPlaceholder={`Doppel ${idx + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-emerald-600/80 hover:bg-emerald-600 text-white text-base font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        {saving ? "Speichern..." : "Speichern"}
      </button>
    </div>
  );
}

// ── Score Row: one position with inline set inputs ──
function ScoreRow({
  label,
  p,
  posIdx,
  isHome,
  showSet3: need3,
  updateField,
}: {
  label: string;
  p: PositionData;
  posIdx: number;
  isHome: boolean;
  showSet3: boolean;
  updateField: (idx: number, field: keyof PositionData, value: string) => void;
}) {
  const icon = winnerIcon(p, isHome);

  return (
    <div className="flex items-center gap-1.5 py-1 px-1">
      {/* Winner icon */}
      {icon}

      {/* Position label */}
      <span className="text-xs font-bold text-slate-400 w-6 shrink-0">{label}</span>

      {/* Set 1 */}
      <SetInputPair
        tcpVal={p.set1_tcp}
        oppVal={p.set1_opp}
        onTcp={(v) => updateField(posIdx, "set1_tcp", v)}
        onOpp={(v) => updateField(posIdx, "set1_opp", v)}
        colorClass={setColor(p.set1_tcp, p.set1_opp)}
      />

      {/* Set 2 */}
      <SetInputPair
        tcpVal={p.set2_tcp}
        oppVal={p.set2_opp}
        onTcp={(v) => updateField(posIdx, "set2_tcp", v)}
        onOpp={(v) => updateField(posIdx, "set2_opp", v)}
        colorClass={setColor(p.set2_tcp, p.set2_opp)}
      />

      {/* Set 3 (only if 1:1 in sets) */}
      {need3 ? (
        <SetInputPair
          tcpVal={p.set3_tcp}
          oppVal={p.set3_opp}
          onTcp={(v) => updateField(posIdx, "set3_tcp", v)}
          onOpp={(v) => updateField(posIdx, "set3_opp", v)}
          colorClass={setColor(p.set3_tcp, p.set3_opp)}
          isTiebreak
        />
      ) : (
        /* Spacer for alignment when no set 3 */
        <span className="w-[62px] shrink-0" />
      )}
    </div>
  );
}

// ── Set Input Pair: two compact number inputs with colored background ──
function SetInputPair({
  tcpVal,
  oppVal,
  onTcp,
  onOpp,
  colorClass,
  isTiebreak = false,
}: {
  tcpVal: string;
  oppVal: string;
  onTcp: (v: string) => void;
  onOpp: (v: string) => void;
  colorClass: string;
  isTiebreak?: boolean;
}) {
  return (
    <div className={`flex items-center gap-0.5 rounded-md px-1 py-0.5 border shrink-0 ${colorClass}`}>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={isTiebreak ? 99 : 7}
        value={tcpVal}
        onChange={(e) => onTcp(e.target.value)}
        className="w-7 h-8 bg-transparent text-center text-sm font-bold text-slate-200 focus:outline-none focus:bg-slate-700/40 rounded [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="text-[10px] font-bold text-slate-500">:</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={isTiebreak ? 99 : 7}
        value={oppVal}
        onChange={(e) => onOpp(e.target.value)}
        className="w-7 h-8 bg-transparent text-center text-sm font-bold text-slate-200 focus:outline-none focus:bg-slate-700/40 rounded [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}

// ── Lineup Row: player name inputs ──
function LineupRow({
  label,
  tcpPlayer,
  oppPlayer,
  onTcpChange,
  onOppChange,
  tcpPlaceholder,
  oppPlaceholder,
}: {
  label: string;
  tcpPlayer: string;
  oppPlayer: string;
  onTcpChange: (v: string) => void;
  onOppChange: (v: string) => void;
  tcpPlaceholder: string;
  oppPlaceholder: string;
}) {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="text-[11px] font-bold text-slate-500 w-8 shrink-0">{label}</span>
      <input
        type="text"
        value={tcpPlayer}
        onChange={(e) => onTcpChange(e.target.value)}
        placeholder={tcpPlaceholder}
        className="flex-1 bg-slate-800/60 border border-slate-700/40 rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/40 min-w-0"
      />
      <input
        type="text"
        value={oppPlayer}
        onChange={(e) => onOppChange(e.target.value)}
        placeholder={oppPlaceholder}
        className="flex-1 bg-slate-800/60 border border-slate-700/40 rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/40 text-right min-w-0"
      />
    </div>
  );
}
