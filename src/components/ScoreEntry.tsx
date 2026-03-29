import { useState, useCallback, useRef, useEffect } from "react";
import type { Match, Team, IndividualMatch } from "../types";
import { getSinglesCount, getDoublesCount } from "../data/team-format";
import { computeWinner, needsThirdSet, isRegularSetComplete, isChampionsTiebreakComplete } from "../utils/score-helpers";

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

/** Color for a set pair — only colored when set is actually complete */
function setColor(tcpScore: string, oppScore: string, isTiebreak: boolean): string {
  const tcp = parseInt(tcpScore, 10);
  const opp = parseInt(oppScore, 10);
  if (isNaN(tcp) || isNaN(opp)) return "bg-slate-800/50 border-slate-700/30";
  const complete = isTiebreak
    ? isChampionsTiebreakComplete(tcp, opp)
    : isRegularSetComplete(tcp, opp);
  if (!complete) return "bg-slate-800/50 border-slate-700/30";
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

/** Collect all score input refs in order for Enter-to-next navigation */
function useScoreInputRefs() {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const register = useCallback((index: number) => (el: HTMLInputElement | null) => {
    refs.current[index] = el;
  }, []);
  const focusNext = useCallback((currentIndex: number) => {
    // Find the next visible (non-null, rendered) input
    for (let i = currentIndex + 1; i < refs.current.length; i++) {
      const el = refs.current[i];
      if (el && el.offsetParent !== null) {
        el.focus();
        el.select();
        return;
      }
    }
  }, []);
  return { register, focusNext };
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

  const { register, focusNext } = useScoreInputRefs();
  // Global input index counter — reset each render
  const inputIndexRef = useRef(0);
  useEffect(() => { inputIndexRef.current = 0; });

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

  const clearRow = useCallback(
    (posIdx: number) => {
      setPositions((prev) => {
        const next = [...prev];
        next[posIdx] = {
          ...next[posIdx],
          set1_tcp: "", set1_opp: "",
          set2_tcp: "", set2_opp: "",
          set3_tcp: "", set3_opp: "",
        };
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

  // Reset input index counter before rendering rows
  inputIndexRef.current = 0;

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
                onClear={() => clearRow(posIdx)}
                registerInput={register}
                onEnter={focusNext}
                inputIndexRef={inputIndexRef}
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
                onClear={() => clearRow(posIdx)}
                registerInput={register}
                onEnter={focusNext}
                inputIndexRef={inputIndexRef}
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
                  onClear={() => { updateField(posIdx, "tcp_player", ""); updateField(posIdx, "opp_player", ""); }}
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
                  onClear={() => { updateField(posIdx, "tcp_player", ""); updateField(posIdx, "opp_player", ""); }}
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
  onClear,
  registerInput,
  onEnter,
  inputIndexRef,
}: {
  label: string;
  p: PositionData;
  posIdx: number;
  isHome: boolean;
  showSet3: boolean;
  updateField: (idx: number, field: keyof PositionData, value: string) => void;
  onClear: () => void;
  registerInput: (index: number) => (el: HTMLInputElement | null) => void;
  onEnter: (currentIndex: number) => void;
  inputIndexRef: React.MutableRefObject<number>;
}) {
  const icon = winnerIcon(p, isHome);
  const hasData = !!(p.set1_tcp || p.set1_opp || p.set2_tcp || p.set2_opp || p.set3_tcp || p.set3_opp);

  return (
    <div className="flex items-center gap-1 py-1 px-0.5 min-w-0 overflow-x-auto">
      {/* Winner icon */}
      {icon}

      {/* Position label */}
      <span className="text-[11px] font-bold text-slate-400 w-5 shrink-0">{label}</span>

      {/* Set 1 */}
      <SetInputPair
        tcpVal={p.set1_tcp}
        oppVal={p.set1_opp}
        onTcp={(v) => updateField(posIdx, "set1_tcp", v)}
        onOpp={(v) => updateField(posIdx, "set1_opp", v)}
        colorClass={setColor(p.set1_tcp, p.set1_opp, false)}
        registerInput={registerInput}
        onEnter={onEnter}
        inputIndexRef={inputIndexRef}
      />

      {/* Set 2 */}
      <SetInputPair
        tcpVal={p.set2_tcp}
        oppVal={p.set2_opp}
        onTcp={(v) => updateField(posIdx, "set2_tcp", v)}
        onOpp={(v) => updateField(posIdx, "set2_opp", v)}
        colorClass={setColor(p.set2_tcp, p.set2_opp, false)}
        registerInput={registerInput}
        onEnter={onEnter}
        inputIndexRef={inputIndexRef}
      />

      {/* Set 3 (only if 1:1 in sets) — Champions Tie-Break */}
      {need3 ? (
        <SetInputPair
          tcpVal={p.set3_tcp}
          oppVal={p.set3_opp}
          onTcp={(v) => updateField(posIdx, "set3_tcp", v)}
          onOpp={(v) => updateField(posIdx, "set3_opp", v)}
          colorClass={setColor(p.set3_tcp, p.set3_opp, true)}
          isTiebreak
          registerInput={registerInput}
          onEnter={onEnter}
          inputIndexRef={inputIndexRef}
        />
      ) : null}

      {/* Delete row button */}
      <button
        onClick={onClear}
        title="Zeile löschen"
        className={`shrink-0 p-0.5 rounded transition-colors ${
          hasData
            ? "text-slate-400 hover:text-red-400 hover:bg-red-900/20"
            : "text-slate-700 cursor-default"
        }`}
        disabled={!hasData}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
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
  registerInput,
  onEnter,
  inputIndexRef,
}: {
  tcpVal: string;
  oppVal: string;
  onTcp: (v: string) => void;
  onOpp: (v: string) => void;
  colorClass: string;
  isTiebreak?: boolean;
  registerInput: (index: number) => (el: HTMLInputElement | null) => void;
  onEnter: (currentIndex: number) => void;
  inputIndexRef: React.MutableRefObject<number>;
}) {
  const tcpIdx = inputIndexRef.current++;
  const oppIdx = inputIndexRef.current++;

  const handleKeyDown = (idx: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter(idx);
    }
  };

  return (
    <div className={`flex items-center gap-0.5 rounded-md px-1 py-0.5 border shrink-0 ${colorClass}`}>
      <input
        ref={registerInput(tcpIdx)}
        type="number"
        inputMode="numeric"
        enterKeyHint="next"
        min={0}
        max={isTiebreak ? 99 : 7}
        value={tcpVal}
        onChange={(e) => onTcp(e.target.value)}
        onKeyDown={handleKeyDown(tcpIdx)}
        className="w-6 h-7 bg-transparent text-center text-xs font-bold text-slate-200 focus:outline-none focus:bg-slate-700/40 rounded [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="text-[10px] font-bold text-slate-500">:</span>
      <input
        ref={registerInput(oppIdx)}
        type="number"
        inputMode="numeric"
        enterKeyHint="next"
        min={0}
        max={isTiebreak ? 99 : 7}
        value={oppVal}
        onChange={(e) => onOpp(e.target.value)}
        onKeyDown={handleKeyDown(oppIdx)}
        className="w-6 h-7 bg-transparent text-center text-xs font-bold text-slate-200 focus:outline-none focus:bg-slate-700/40 rounded [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
  onClear,
  tcpPlaceholder,
  oppPlaceholder,
}: {
  label: string;
  tcpPlayer: string;
  oppPlayer: string;
  onTcpChange: (v: string) => void;
  onOppChange: (v: string) => void;
  onClear: () => void;
  tcpPlaceholder: string;
  oppPlaceholder: string;
}) {
  const hasData = !!(tcpPlayer || oppPlayer);
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
      <button
        onClick={onClear}
        title="Zeile löschen"
        className={`shrink-0 p-0.5 rounded transition-colors ${
          hasData
            ? "text-slate-400 hover:text-red-400 hover:bg-red-900/20"
            : "text-slate-700 cursor-default"
        }`}
        disabled={!hasData}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
