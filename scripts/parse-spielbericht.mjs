// Parst den Text eines Spielbericht-Modals (btv.de-Widget) in die Struktur von
// src/data/spielberichte.ts. Reines Text-Parsing, keine Netz-Zugriffe —
// entwickelt und geprüft gegen die handgepflegten Berichte (siehe
// scripts/verify-parser.mjs).
//
// Aufbau des Modals (Zeilen):
//   Status:abgeschlossen am <datum> / Oberschiedsrichter:… / Druckversion [PDF]
//   Einzelspiele
//   <HEIMMANNSCHAFT> P S1 S2 S3 MP SÄ SP P <GASTMANNSCHAFT>
//   <Heimspieler>  <Pos> <Satz…> <MP> <Sätze> <Spiele> <Pos> <Gastspieler>
//   … ZUSAMMEN: <MP> <Sätze> <Spiele>
//   Doppelspiele
//   <HEIM> P … P <GAST>
//   <Heim1> <Heim2> <Pz1> <Pz2> <Summe> <Satz…> <MP> <Sätze> <Spiele> <Pz1> <Pz2> <Summe> <Gast1> <Gast2>
//
// Die letzten DREI x:y-Tokens einer Zeile sind immer MP / Sätze / Spiele —
// alles davor sind Sätze. Nicht gespielte Sätze fehlen im Modal ganz.

const SCORE = /^\d+:\d+$/;
const INT = /^(\d+|-)$/;              // Platzziffern; bei nachgemeldeten Spielern "-"
const HEADER = /^(P|S1|S2|S3|MP|SÄ|SP)$/i;
// Spieler ohne Namen: "unbekannt / wird nachgenannt k.A.* (-4)" bzw. "nicht anwesend"
const UNNAMED = /unbekannt|nachgenannt|nicht anwesend|k\.A\./i;

/** "Krug, Max GER (9, LK8,8)" → { name, meldeposition, lk, nation } */
function parseSinglesName(raw) {
  const m = raw.match(/^(.*?)\s*\((\d+),\s*(LK[\d,]+)\)\s*$/);
  if (!m) return { raw, name: raw.trim(), meldeposition: null, lk: null };
  return { raw, name: m[1].trim(), meldeposition: m[2], lk: m[3] };
}

/** GER weglassen (Konvention), andere Länderkürzel bleiben am Namen. */
function stripGer(name) {
  return name.replace(/\s+GER(?=\s*(\(|$))/, "").trim();
}

/** Zielformat Einzel: "Nachname, Vorname [NAT] (Meldeposition, LKx,x)"
 *  — Walkover-Vermerk bleibt am Namen, unbenannte Spieler werden zu "—". */
function singlesPlayerString(raw) {
  if (UNNAMED.test(raw)) return /nicht anwesend/i.test(raw) ? "— (w.o.)" : "—";
  const wo = /\(w\.o\.\)/i.test(raw);
  const p = parseSinglesName(raw.replace(/\s*\(w\.o\.\)/i, ""));
  const name = stripGer(p.name) + (wo ? " (w.o.)" : "");
  // WICHTIG: (w.o.) gehört VOR die Klammer — src/utils/spielbericht.ts erwartet
  // "(Meldeposition, LK…)" am Zeilenende, sonst werden Position und LK nicht erkannt.
  return p.meldeposition ? `${name} (${p.meldeposition}, ${p.lk})` : name;
}

/** Zielformat Doppel: "Nachname, Vorname [NAT]" (ohne LK/Position, ohne GER) */
function doublesPlayerString(raw) {
  if (UNNAMED.test(raw)) return /nicht anwesend/i.test(raw) ? "— (w.o.)" : "—";
  const wo = /\(w\.o\.\)/i.test(raw);
  const withoutPos = raw.replace(/\s*\(w\.o\.\)/i, "").replace(/\s*\((\d+|-\d+)\)\s*$/, "").trim();
  const base = stripGer(withoutPos);
  return wo ? `${base} (w.o.)` : base;
}

// Innerhalb eines Blocks ist alles ein Spielername, was Buchstaben enthält und
// weder Spaltenkopf noch Summenzeile noch Platzziffer/Ergebnis ist.
const isName = (l) =>
  /[A-Za-zÄÖÜäöüß]/.test(l) && !HEADER.test(l) && !/^ZUSAMMEN/i.test(l) && !INT.test(l) && !SCORE.test(l);

/**
 * @returns {{date:string|null, matches:Array, finalHome:number, finalAway:number}}
 */
export function parseModal(modal, { keyPrefix = "x", teamSize = 9 } = {}) {
  const lines = modal.split("\n").map((l) => l.trim()).filter((l) => l && l !== " ");
  const singlesCount = teamSize === 6 ? 4 : 6;

  const dateM = modal.match(/abgeschlossen am (\d{2})\.(\d{2})\.(\d{4})/);
  const completedDate = dateM ? `${dateM[3]}-${dateM[2]}-${dateM[1]}` : null;

  const sIdx = lines.findIndex((l) => /^Einzelspiele$/i.test(l));
  const dIdx = lines.findIndex((l) => /^Doppelspiele$/i.test(l));
  if (sIdx < 0) throw new Error("kein Einzelspiele-Block");

  const matches = [];
  let finalHome = null, finalAway = null;

  // ── Einzel ──
  {
    let i = sIdx + 1;
    i++;                                   // Heimmannschaft
    while (i < lines.length && HEADER.test(lines[i])) i++;
    i++;                                   // Gastmannschaft
    let pos = 0;
    while (i < lines.length && !/^ZUSAMMEN/i.test(lines[i])) {
      if (!isName(lines[i])) { i++; continue; }
      const homeRaw = lines[i++];
      // Positionsnummer
      const posNr = INT.test(lines[i]) ? Number(lines[i++]) : ++pos;
      const scores = [];
      while (i < lines.length && SCORE.test(lines[i])) scores.push(lines[i++]);
      // Gast-Position + Gastspieler
      const awayPos = INT.test(lines[i]) ? Number(lines[i++]) : null;
      const awayRaw = isName(lines[i]) ? lines[i++] : "";
      if (scores.length < 3) throw new Error(`Einzel ohne MP/Sätze/Spiele (Pos ${posNr})`);
      const [mp] = scores.slice(-3);
      const sets = scores.slice(0, -3).map((s) => s.split(":").map(Number));
      const [mpH, mpA] = mp.split(":").map(Number);
      matches.push({
        id: `${keyPrefix}-e${posNr}`,
        position: posNr,
        type: "singles",
        home: singlesPlayerString(homeRaw),
        away: singlesPlayerString(awayRaw),
        sets,
        winner: mpH > mpA ? "home" : "away",
        awayPos,
      });
      pos = posNr;
    }
  }

  // ── Doppel ──
  if (dIdx > 0) {
    let i = dIdx + 1;
    i++;                                   // Heimmannschaft
    while (i < lines.length && HEADER.test(lines[i])) i++;
    i++;                                   // Gastmannschaft
    let n = 0;
    while (i < lines.length && !/^ZUSAMMEN/i.test(lines[i])) {
      if (!isName(lines[i])) { i++; continue; }
      const h1 = lines[i++];
      const h2 = isName(lines[i]) ? lines[i++] : "";
      while (i < lines.length && INT.test(lines[i])) i++;      // Platzziffern Heim
      const scores = [];
      while (i < lines.length && SCORE.test(lines[i])) scores.push(lines[i++]);
      while (i < lines.length && INT.test(lines[i])) i++;      // Platzziffern Gast
      const a1 = isName(lines[i]) ? lines[i++] : "";
      const a2 = isName(lines[i]) ? lines[i++] : "";
      if (scores.length < 3) throw new Error(`Doppel ohne MP/Sätze/Spiele (Nr ${n + 1})`);
      const [mp] = scores.slice(-3);
      const sets = scores.slice(0, -3).map((s) => s.split(":").map(Number));
      const [mpH, mpA] = mp.split(":").map(Number);
      n++;
      matches.push({
        id: `${keyPrefix}-d${n}`,
        position: 6 + n,                    // Doppel zählen ab Position 7
        type: "doubles",
        home: [h1, h2].filter(Boolean).map(doublesPlayerString).join(" / "),
        away: [a1, a2].filter(Boolean).map(doublesPlayerString).join(" / "),
        sets,
        winner: mpH > mpA ? "home" : "away",
      });
    }
  }

  // Gesamtergebnis = Anzahl gewonnener Matches je Seite
  finalHome = matches.filter((m) => m.winner === "home").length;
  finalAway = matches.filter((m) => m.winner === "away").length;

  const expected = teamSize;
  if (matches.length !== expected) {
    throw new Error(`${matches.length} Matches statt ${expected} (Einzel ${singlesCount}+Doppel ${expected - singlesCount})`);
  }
  return { completedDate, matches, finalHome, finalAway };
}
