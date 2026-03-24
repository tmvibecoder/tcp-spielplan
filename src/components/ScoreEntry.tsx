import { useState, useCallback } from "react";
import type { Match, Team, IndividualMatch } from "../types";
import { getSinglesCount, getDoublesCount } from "../data/team-format";
import { computeWinner, needsThirdSet, getPositionLabel } from "../utils/score-helpers";

interface ScoreEntryProps {
  match: Match;
  team: Team;
  existingMatches: IndividualMatch[];
  onSave: (
    individualMatches: Omit<IndividualMatch, "id" | "match_score_id">[]
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

interface PositionData {
  position: number;
  match_type: "singles" | "doubles";
  home_player: string;
  away_player: string;
  set1_home: string;
  set1_away: string;
  set2_home: string;
  set2_away: string;
  set3_home: string;
  set3_away: string;
}

function initPositions(
  teamId: string,
  existing: IndividualMatch[]
): PositionData[] {
  const singles = getSinglesCount(teamId);
  const doubles = getDoublesCount(teamId);
  const positions: PositionData[] = [];

  for (let i = 1; i <= singles; i++) {
    const ex = existing.find((e) => e.position === i);
    positions.push({
      position: i,
      match_type: "singles",
      home_player: ex?.home_player || "",
      away_player: ex?.away_player || "",
      set1_home: ex?.set1_home?.toString() || "",
      set1_away: ex?.set1_away?.toString() || "",
      set2_home: ex?.set2_home?.toString() || "",
      set2_away: ex?.set2_away?.toString() || "",
      set3_home: ex?.set3_home?.toString() || "",
      set3_away: ex?.set3_away?.toString() || "",
    });
  }

  for (let i = 1; i <= doubles; i++) {
    const pos = singles + i;
    const ex = existing.find((e) => e.position === pos);
    positions.push({
      position: pos,
      match_type: "doubles",
      home_player: ex?.home_player || "",
      away_player: ex?.away_player || "",
      set1_home: ex?.set1_home?.toString() || "",
      set1_away: ex?.set1_away?.toString() || "",
      set2_home: ex?.set2_home?.toString() || "",
      set2_away: ex?.set2_away?.toString() || "",
      set3_home: ex?.set3_home?.toString() || "",
      set3_away: ex?.set3_away?.toString() || "",
    });
  }

  return positions;
}

function parseNum(s: string): number | null {
  if (s === "" || s === undefined) return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

export default function ScoreEntry({
  match,
  team: _team,
  existingMatches,
  onSave,
  onCancel,
}: ScoreEntryProps) {
  void _team;
  const [positions, setPositions] = useState<PositionData[]>(() =>
    initPositions(match.teamId, existingMatches)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePosition = useCallback(
    (idx: number, field: keyof PositionData, value: string) => {
      setPositions((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], [field]: value };
        return next;
      });
    },
    []
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);

    const individualMatches = positions.map((p) => {
      const im = {
        position: p.position,
        match_type: p.match_type as "singles" | "doubles",
        home_player: p.home_player.trim(),
        away_player: p.away_player.trim(),
        set1_home: parseNum(p.set1_home),
        set1_away: parseNum(p.set1_away),
        set2_home: parseNum(p.set2_home),
        set2_away: parseNum(p.set2_away),
        set3_home: parseNum(p.set3_home),
        set3_away: parseNum(p.set3_away),
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
  }, [positions, onSave]);

  const opponent = match.isHome ? match.away : match.home;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-100">
          Ergebnis eintragen
        </h3>
        <button
          onClick={onCancel}
          className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-2 py-1"
        >
          ✕ Abbrechen
        </button>
      </div>

      {/* Singles */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Einzel
        </p>
        {positions
          .filter((p) => p.match_type === "singles")
          .map((p, idx) => {
            const posIdx = positions.findIndex((pp) => pp.position === p.position);
            return (
              <PositionCard
                key={p.position}
                p={p}
                posIdx={posIdx}
                idx={idx}
                match={match}
                opponent={opponent}
                updatePosition={updatePosition}
              />
            );
          })}
      </div>

      {/* Doubles */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Doppel
        </p>
        {positions
          .filter((p) => p.match_type === "doubles")
          .map((p, idx) => {
            const posIdx = positions.findIndex((pp) => pp.position === p.position);
            return (
              <PositionCard
                key={p.position}
                p={p}
                posIdx={posIdx}
                idx={idx}
                match={match}
                opponent={opponent}
                updatePosition={updatePosition}
                isDoubles
              />
            );
          })}
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
        {saving ? "Speichern..." : "💾 Speichern"}
      </button>
    </div>
  );
}

// --- Position Card: one Einzel or Doppel ---
function PositionCard({
  p,
  posIdx,
  idx,
  match,
  opponent,
  updatePosition,
  isDoubles = false,
}: {
  p: PositionData;
  posIdx: number;
  idx: number;
  match: Match;
  opponent: string;
  updatePosition: (idx: number, field: keyof PositionData, value: string) => void;
  isDoubles?: boolean;
}) {
  const showSet3 = needsThirdSet({
    set1_home: parseNum(p.set1_home),
    set1_away: parseNum(p.set1_away),
    set2_home: parseNum(p.set2_home),
    set2_away: parseNum(p.set2_away),
  });

  const winner = computeWinner({
    set1_home: parseNum(p.set1_home),
    set1_away: parseNum(p.set1_away),
    set2_home: parseNum(p.set2_home),
    set2_away: parseNum(p.set2_away),
    set3_home: parseNum(p.set3_home),
    set3_away: parseNum(p.set3_away),
  });

  const label = getPositionLabel(p.position, match.teamId);
  const placeholderHome = isDoubles ? `Doppel ${idx + 1} (Heim)` : `Spieler ${idx + 1} (${match.isHome ? "Pliening" : opponent})`;
  const placeholderAway = isDoubles ? `Doppel ${idx + 1} (Gast)` : `Spieler ${idx + 1} (${match.isHome ? opponent : "Pliening"})`;

  return (
    <div
      className={`bg-slate-900/50 rounded-xl p-3 border ${
        winner
          ? "border-emerald-700/40"
          : "border-slate-700/30"
      }`}
    >
      {/* Position header with player names */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-bold px-2 py-1 rounded ${
          winner ? "bg-emerald-900/50 text-emerald-300" : "bg-slate-800 text-slate-400"
        }`}>
          {label}
          {winner && " ✓"}
        </span>
      </div>

      {/* Player names row */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-3">
        <input
          type="text"
          value={p.home_player}
          onChange={(e) => updatePosition(posIdx, "home_player", e.target.value)}
          placeholder={placeholderHome}
          className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
        />
        <span className="text-xs font-bold text-slate-500 px-1">vs</span>
        <input
          type="text"
          value={p.away_player}
          onChange={(e) => updatePosition(posIdx, "away_player", e.target.value)}
          placeholder={placeholderAway}
          className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 text-right"
        />
      </div>

      {/* Set scores — stacked vertically */}
      <div className="space-y-2">
        <SetRow
          label="Satz 1"
          h={p.set1_home}
          a={p.set1_away}
          onH={(v) => updatePosition(posIdx, "set1_home", v)}
          onA={(v) => updatePosition(posIdx, "set1_away", v)}
        />
        <SetRow
          label="Satz 2"
          h={p.set2_home}
          a={p.set2_away}
          onH={(v) => updatePosition(posIdx, "set2_home", v)}
          onA={(v) => updatePosition(posIdx, "set2_away", v)}
        />
        {showSet3 && (
          <SetRow
            label="Satz 3"
            h={p.set3_home}
            a={p.set3_away}
            onH={(v) => updatePosition(posIdx, "set3_home", v)}
            onA={(v) => updatePosition(posIdx, "set3_away", v)}
            isTiebreak
          />
        )}
      </div>
    </div>
  );
}

// --- Set Row: label + two inputs ---
function SetRow({
  label,
  h,
  a,
  onH,
  onA,
  isTiebreak = false,
}: {
  label: string;
  h: string;
  a: string;
  onH: (v: string) => void;
  onA: (v: string) => void;
  isTiebreak?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs w-12 shrink-0 ${isTiebreak ? "text-amber-400 font-semibold" : "text-slate-500"}`}>
        {label}
      </span>
      <div className="flex items-center gap-2 flex-1 justify-center">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={isTiebreak ? 99 : 7}
          value={h}
          onChange={(e) => onH(e.target.value)}
          className="w-12 h-10 bg-slate-800 border border-slate-600/50 rounded-lg text-center text-base font-bold text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-sm font-bold text-slate-500">:</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={isTiebreak ? 99 : 7}
          value={a}
          onChange={(e) => onA(e.target.value)}
          className="w-12 h-10 bg-slate-800 border border-slate-600/50 rounded-lg text-center text-base font-bold text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </div>
  );
}
