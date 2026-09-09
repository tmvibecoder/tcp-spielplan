// Legt eine neue Saison an: holt Mannschaften, groupids, Spielplan und
// Spielorte vom BTV und schreibt daraus eine fertige Datendatei.
//
//   node scripts/new-season.mjs --id winter-2728 --label "Winter 2027/28" --layout winter
//   node scripts/new-season.mjs --id sommer-27  --label "Sommer 2027"     --layout summer
//   node scripts/new-season.mjs --discover-only        # nur zeigen, was der BTV listet
//
// Ablauf (das, was sonst von Hand nötig wäre):
//   1. btvteams-Widget der Vereinsseite öffnen, "MEHR LADEN" bis zum Ende klicken
//      und über die "Tabelle/Spielplan [PDF]"-Elemente die groupids abfangen.
//   2. Je Gruppe den Report "Tabelle und Spielplan" (ScheduleReportFOP) ziehen —
//      daraus Teilnehmer, Termine und Paarungen.
//   3. Die Spielorte aus dem btv.de-Widget nachladen; im PDF sind die
//      Hallennamen abgeschnitten ("TC Grün-Weiß Gräfe...").
//   4. Datendatei schreiben (Teams, Kategorien, Standings auf 0:0, Matches auf
//      "open", Monate + Monatsfarben).
//
// Danach von Hand: Saison in scripts/seasons.mjs, src/types.ts (SeasonId),
// src/data/seasons.ts, src/data/season-data.ts und src/data/team-format.ts
// eintragen — das Skript nennt am Ende die fertigen Schnipsel dafür.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer-core";
import { ROOT } from "./seasons.mjs";

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const CLUB_WIDGET = "https://btv-prod.burdadigitalsystems.de/btvteams/?clubnr=02467";
const GROUP_PAGE = "https://www.btv.de/de/spielbetrieb/tabelle-spielplan.html?groupid=";
const PDF = "https://btv.liga.nu/cgi-bin/WebObjects/nuLigaDokumentTENDE.woa/wa/nuDokument?dokument=ScheduleReportFOP&group=";
const OWN = /pliening/i;

const argv = process.argv.slice(2);
const arg = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : def;
};
const discoverOnly = argv.includes("--discover-only");
const id = arg("id");
const label = arg("label");
const layout = arg("layout", "winter");
if (!discoverOnly && (!id || !label)) {
  console.error("Aufruf: node scripts/new-season.mjs --id <saison-id> --label \"<Anzeigename>\" [--layout winter|summer]");
  console.error("        node scripts/new-season.mjs --discover-only");
  process.exit(1);
}

// Farben und Kürzel wie in den bestehenden Saisons (Herren blau, Damen orange,
// Mixed violett, Jugend grün — je Gruppe von kräftig nach hell).
const PALETTE = {
  herren: ["#0ea5e9", "#38bdf8", "#06b6d4", "#22d3ee", "#67e8f9", "#7dd3fc", "#a5f3fc", "#bae6fd", "#cffafe"],
  damen: ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a"],
  mixed: ["#a855f7"],
  jugend: ["#22c55e", "#4ade80", "#86efac", "#a3e635"],
};
const EMOJI = { herren: "🔵", damen: "🟠", mixed: "🟣", jugend: "🟢" };
const MONTH_NAMES = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
// Farbtöne für die Monatsköpfe, der Reihe nach vergeben
const MONTH_COLORS = [
  "#78350f|#d97706|#fbbf24|#fcd34d", "#581c87|#7c3aed|#a78bfa|#c4b5fd",
  "#1e3a5f|#3b82f6|#60a5fa|#93c5fd", "#312e81|#6366f1|#818cf8|#a5b4fc",
  "#4c1d95|#8b5cf6|#a78bfa|#c4b5fd", "#134e4a|#14b8a6|#2dd4bf|#5eead4",
  "#0c4a6e|#0369a1|#38bdf8|#7dd3fc", "#14532d|#16a34a|#4ade80|#86efac",
  "#7c2d12|#dc2626|#f87171|#fca5a5",
];
const WEEKDAY = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

// ── 1. Mannschaften + groupids aus dem Vereins-Widget ────────────────────────

async function dismissConsent(target) {
  for (let i = 0; i < 8; i++) {
    let clicked = false;
    try {
      clicked = await target.evaluate(() => {
        const wanted = ["Alle ablehnen", "Nur notwendige Cookies", "Auswahl erlauben", "OK", "Ablehnen"];
        const b = [...document.querySelectorAll("button, a")].find(
          (e) => wanted.includes(e.textContent.trim()) && e.offsetParent !== null);
        if (b) { b.click(); return true; }
        return false;
      });
    } catch { /* Frame noch nicht bereit */ }
    if (clicked) return;
    await new Promise((r) => setTimeout(r, 800));
  }
}

async function discover(page) {
  console.log("Vereins-Widget öffnen …");
  await page.goto("https://www.btv.de/de/mein-verein/vereinsseite/tc-pliening.html#Mannschaften", {
    waitUntil: "networkidle2", timeout: 90000,
  });
  await dismissConsent(page);
  for (const f of page.frames()) await dismissConsent(f);

  let frame = null;
  for (let i = 0; i < 40; i++) {
    frame = page.frames().find((fr) => fr.url().includes("btvteams"));
    if (frame) {
      const t = await frame.evaluate(() => document.body.innerText).catch(() => "");
      if (t.includes("MANNSCHAFTEN")) break;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!frame) throw new Error("btvteams-Frame nicht gefunden");

  await frame.evaluate(() => {
    window.open = function (u) {
      (window.__urls ||= []).push(String(u));
      return { closed: false, close() {}, focus() {}, document: { write() {}, close() {} }, location: { href: "" } };
    };
  });

  // "MEHR LADEN" bis zum Ende — ohne das fehlen Mannschaften
  for (let round = 0; round < 20; round++) {
    const more = await frame.evaluate(() => {
      const el = [...document.querySelectorAll("*")].find(
        (e) => e.children.length === 0 && /^MEHR LADEN$/i.test(e.textContent.trim()));
      if (el) { (el.closest("button, a, .z-button, div[onclick]") ?? el).click(); return true; }
      return false;
    });
    if (!more) break;
    await new Promise((r) => setTimeout(r, 2500));
  }

  const text = await frame.evaluate(() => document.body.innerText);
  const saison = text.split("\n").map((l) => l.trim()).find((l) => /^(WINTER|SOMMER|MIXED)/i.test(l)) ?? "?";
  // Zeilen der Form "Herren 40 Bayernliga Gr. 022 SU" stehen jeweils hinter dem Kurzkürzel
  const leagues = [...text.matchAll(/^(Herren|Damen|Mixed|Juniorinnen|Junioren|Knaben|Mädchen|Midcourt)[^\n]*Gr\. \d+[^\n]*$/gim)]
    .map((m) => m[0].trim());

  const count = await frame.evaluate(() => {
    window.__pdf = [...document.querySelectorAll("*")].filter(
      (e) => e.children.length === 0 && /^Tabelle\/Spielplan \[PDF\]$/i.test(e.textContent.trim()));
    return window.__pdf.length;
  });
  const groups = [];
  for (let i = 0; i < count; i++) {
    await frame.evaluate((idx) => {
      window.__urls = [];
      const el = window.__pdf[idx];
      (el.closest("button, a, .z-button, .z-toolbarbutton, div[onclick]") ?? el).click();
    }, i);
    await new Promise((r) => setTimeout(r, 1800));
    const urls = await frame.evaluate(() => window.__urls ?? []);
    const gid = urls.join(" ").match(/group=(\d+)/)?.[1];
    if (gid) groups.push({ groupid: gid, title: leagues[i] ?? `Mannschaft ${i + 1}` });
  }
  console.log(`Saison laut Widget: ${saison} — ${groups.length} Mannschaften`);
  return { saison, groups };
}

// ── 2. Spielplan + Teilnehmer aus dem Gruppen-PDF ────────────────────────────

function pdfText(groupid) {
  const tmp = path.join(ROOT, `scripts/.tmp-${groupid}.pdf`);
  execFileSync("curl", ["-sL", `${PDF}${groupid}`, "-o", tmp]);
  const txt = execFileSync("pdftotext", ["-layout", tmp, "-"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  fs.unlinkSync(tmp);
  return txt;
}

/** Kopfzeile, Teilnehmerliste und Spielplan aus dem ScheduleReportFOP lesen. */
function parseSchedule(txt) {
  const lines = txt.split("\n");
  const header = lines.slice(0, 3).map((l) => l.trim());
  const headerIdx = lines.findIndex((l) => /\bTermin\b/.test(l) && /Heimmannschaft/.test(l));
  if (headerIdx < 0) throw new Error("Kopfzeile des Spielplans nicht gefunden");
  const col = lines[headerIdx].indexOf("Termin");

  const clubs = [];
  for (const l of lines) {
    const m = l.slice(0, col).match(/^\s*(\d+)\s+(.+?)\s+\((\d+)\)\s/);
    if (m) clubs.push({ rank: Number(m[1]), club: m[2].trim() });
  }
  clubs.sort((a, b) => a.rank - b.rank);
  const names = [...new Set(clubs.map((c) => c.club))].sort((a, b) => b.length - a.length);

  const matches = [];
  let date = null, day = null;
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const right = lines[i].slice(col).trimEnd();
    if (!right.trim()) continue;
    if (/^(Legende|HP\.\.\.|z\.\.\.|nu ?\.Dokument)/.test(right.trim())) continue;
    const hm = right.trim().match(/^Halle:\s*(.+)$/);
    if (hm) { if (matches.length) matches[matches.length - 1].venueShort = hm[1].trim(); continue; }

    let rest = right.trim(), time = null;
    const dm = rest.match(/^(Mo|Di|Mi|Do|Fr|Sa|So)\.\s+(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}:\d{2})\s+(.*)$/);
    if (dm) { day = dm[1]; date = `${dm[4]}-${dm[3]}-${dm[2]}`; time = dm[5]; rest = dm[6]; }
    else {
      const tm = rest.match(/^(\d{2}:\d{2})\s+(.*)$/);
      if (!tm) continue;
      time = tm[1]; rest = tm[2];
    }
    if (!date) continue;
    const home = names.find((n) => rest.startsWith(n));
    if (!home) continue;
    const away = names.find((n) => rest.slice(home.length).trim().startsWith(n));
    if (!away) continue;
    matches.push({ date, day, time, home, away, venueShort: null });
  }
  return { header, clubs, matches };
}

// ── 3. Spielorte aus dem Widget (im PDF abgeschnitten) ───────────────────────

const STATUS = /^(ANZEIGEN|OFFEN|Blanko-Spielbericht|URSPRÜNGLICH AM .*|VERLEGT.*|SPIELBERICHT.*)$/i;
const SCORE = /^\d+:\d+$/;
const WDATE = /^(Mo|Di|Mi|Do|Fr|Sa|So)\.\s+(\d{2})\.(\d{2})\.(\d{2}),\s+(\d{2}:\d{2})$/;

async function venueBlocks(page, groupid, clubNames) {
  await page.goto(`${GROUP_PAGE}${groupid}`, { waitUntil: "networkidle2", timeout: 90000 });
  await dismissConsent(page);
  for (const f of page.frames()) await dismissConsent(f);
  let text = "";
  for (let i = 0; i < 40; i++) {
    const f = page.frames().find((fr) => fr.url().includes("widget.btv.de"));
    if (f) {
      text = await f.evaluate(() => document.body.innerText).catch(() => "");
      if (text.includes("Spielplan")) break;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  const map = new Map();
  if (!text) return map;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const names = new Set(clubNames);
  const start = lines.findIndex((l) => /^GAST$/i.test(l));
  if (start < 0) return map;
  let date = null, time = null;
  for (let i = start + 1; i < lines.length; i++) {
    const dm = lines[i].match(WDATE);
    if (dm) { date = `20${dm[4]}-${dm[3]}-${dm[2]}`; time = dm[5]; continue; }
    if (!date || !names.has(lines[i])) continue;
    if (!(SCORE.test(lines[i + 1]) && SCORE.test(lines[i + 2]) && SCORE.test(lines[i + 3]))) continue;
    const rest = [];
    for (let j = i + 4; j < Math.min(i + 9, lines.length); j++) {
      if (STATUS.test(lines[j])) break;
      rest.push(lines[j].replace(/^Spielort:\s*/i, ""));
    }
    map.set(`${date}|${time}|${lines[i]}`, rest);
    i += 3;
  }
  return map;
}

/** Spielort = die Zeile des Blocks, die nicht der Gast ist. Der Spielort kann
 *  wörtlich der Heimverein sein, deshalb wird der Gast aus dem PDF vorgegeben. */
function venueOf(blocks, m) {
  const rest = blocks.get(`${m.date}|${m.time}|${m.home}`);
  if (!rest) return null;
  const i = rest.indexOf(m.away);
  return (i < 0 ? rest : rest.filter((_, k) => k !== i))[0] ?? null;
}

// ── 4. Datendatei schreiben ──────────────────────────────────────────────────

/** "Herren 40 Bayernliga Gr. 022 SU" -> Label "Herren 40", Liga "Bayernliga · Gr. 022 SU" */
function splitTitle(title) {
  const m = title.match(/^((?:Herren|Damen|Mixed|Juniorinnen|Junioren|Knaben|Mädchen|Midcourt)(?:\s+\d+)?(?:\s+(?:II|III|IV))?)\s+(.*?)(Gr\.\s*\d+.*)$/i);
  if (!m) return { label: title, league: title };
  return { label: m[1].trim(), league: `${m[2].trim()} · ${m[3].trim()}` };
}

function kindOf(label) {
  if (/^Mixed/i.test(label)) return "mixed";
  if (/^(Juniorinnen|Junioren|Knaben|Mädchen|Midcourt)/i.test(label)) return "jugend";
  if (/^Damen/i.test(label)) return "damen";
  return "herren";
}

const q = (s) => JSON.stringify(String(s));
const pad = (s, n) => String(s).padEnd(n);

function buildFile({ id, label, prefix, teams }) {
  const allMatches = teams.flatMap((t) => t.own.map((m) => ({ ...m, teamId: t.teamId, club: t.club })));
  const dates = allMatches.map((m) => m.date).sort();
  const months = [...new Set(dates.map((d) => d.slice(0, 7)))].sort();

  const teamLines = teams.map((t) =>
    `  { id: ${pad(q(t.teamId) + ",", 20)} label: ${pad(q(t.label) + ",", 18)} shortLabel: ${pad(q(t.shortLabel) + ",", 10)} ` +
    `league: ${pad(q(t.league) + ",", 32)} color: ${q(t.color)}, emoji: ${q(t.emoji)} },`).join("\n");

  const cats = [];
  for (const [catLabel, kind] of [["Herren", "herren"], ["Damen", "damen"], ["Mixed", "mixed"], ["Jugend", "jugend"]]) {
    const ids = teams.filter((t) => t.kind === kind).map((t) => q(t.teamId));
    if (ids.length) cats.push(`  { label: ${q(catLabel)}, ids: [${ids.join(", ")}] },`);
  }

  const standings = teams.map((t) => {
    const n = t.clubs.length;
    const rows = t.clubs.map((c, i) => {
      const cross = Array.from({ length: n }, (_, j) => (i === j ? '"***"' : '"0:0"')).join(", ");
      return `      { rank: ${c.rank}, club: ${pad(q(c.club) + ",", 34)} isOwnClub: ${pad((c.club === t.club) + ",", 7)} ` +
             `points: "0:0", matchPoints: "0:0", sets: "0:0", crossResults: [${cross}] },`;
    }).join("\n");
    const ownRank = t.clubs.find((c) => c.club === t.club)?.rank ?? 0;
    return `  // ── ${t.label} ${t.league} ──\n  {\n    teamLabel: ${q(t.label)},\n    teamColor: ${q(t.color)},\n` +
           `    leagueName: ${q(t.league)},\n    ownRank: ${ownRank},\n    entries: [\n${rows}\n    ],\n  },`;
  }).join("\n\n");

  const matchLines = teams.flatMap((t) => [
    `\n  // ── ${t.label} ${t.league} ──`,
    ...t.own.map((m) =>
      `  { teamId: ${q(t.teamId)}, date: ${q(m.date)}, time: ${q(m.time)}, day: ${q(m.day)}, ` +
      `home: ${pad(q(m.home) + ",", 32)} away: ${pad(q(m.away) + ",", 32)} ` +
      `isHome: ${pad((m.home === t.club) + ",", 7)} mp: "", sets: "", games: "", venue: ${q(m.venue ?? "")}, status: "open" },`),
  ]).join("\n");

  const monthLines = months.map((mo) =>
    `  ${q(mo)}: ${q(MONTH_NAMES[Number(mo.slice(5)) - 1])},`).join("\n");
  const colorLines = months.map((mo, i) => {
    const [bg, border, accent, lab] = MONTH_COLORS[i % MONTH_COLORS.length].split("|");
    return `  ${q(mo)}: {\n    bg: "${bg}25", border: "${border}40", accent: "${accent}", headerBg: "${bg}50", label: "${lab}",\n` +
           `    weekBgs: ["${bg}15", "${bg}30", "${bg}15", "${bg}30", "${bg}15", "${bg}30"],\n  },`;
  }).join("\n");

  const groupTable = teams.map((t) =>
    `//   ${pad(t.label, 16)} ${pad(t.league, 30)} groupid ${t.groupid}`).join("\n");

  return `import type { LeagueStandings, MonthColor, WinterMatch } from "../types";

// ── ${label} ──────────────────────────────────────────────────
//
// ERZEUGT von scripts/new-season.mjs — danach von Hand gepflegt
// (Ergebnisse zieht scripts/generate-standings.mjs nach).
//
// Quelle: die Gruppen-Reports „Tabelle und Spielplan" (nu.Dokument 013)
//   https://btv.liga.nu/.../nuDokument?dokument=ScheduleReportFOP&group=<groupid>
// Spielorte aus dem btv.de-Widget (im PDF sind die Hallennamen abgeschnitten).
//
${groupTable}
//
// Spieltage ${dates[0]} – ${dates[dates.length - 1]}; vor dem ersten Spieltag stehen
// alle Tabellen auf 0:0 und alle Begegnungen auf status "open".

// ── Teams (für TeamFilter) ──
export const ${prefix}_TEAMS = [
${teamLines}
];

export const ${prefix}_CATEGORIES = [
${cats.join("\n")}
];

// ── Tabellen / Standings ──

export const ${prefix}_STANDINGS_STAND = ${q(new Date().toLocaleDateString("de-DE"))};

export const ${prefix}_STANDINGS: LeagueStandings[] = [
${standings}
];

// ── Matches (nur TC Pliening Spiele) ──
export const ${prefix}_MATCHES: WinterMatch[] = [${matchLines}
];

// ── Monate & Farben ──
export const ${prefix}_MONTHS: Record<string, string> = {
${monthLines}
};

export const ${prefix}_MONTH_COLORS: Record<string, MonthColor> = {
${colorLines}
};
`;
}

// ── Ablauf ───────────────────────────────────────────────────────────────────

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: "new",
  args: ["--no-first-run", "--disable-gpu", "--lang=de-DE", "--disable-dev-shm-usage",
         "--js-flags=--max-old-space-size=512", "--renderer-process-limit=1",
         "--blink-settings=imagesEnabled=false"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 3000 });

try {
  const { saison, groups } = await discover(page);
  if (!groups.length) throw new Error("Keine Mannschaften gefunden");

  console.log("\nGefundene Mannschaften:");
  for (const g of groups) console.log(`  ${g.groupid}  ${g.title}`);
  if (discoverOnly) {
    console.log("\n--discover-only: nichts geschrieben.");
    await browser.close();
    process.exit(0);
  }

  const prefix = id.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  const usedShort = new Set();
  const counters = {};
  const teams = [];

  for (const g of groups) {
    console.log(`\n── ${g.title} (group ${g.groupid})`);
    const { clubs, matches } = parseSchedule(pdfText(g.groupid));
    const { label: baseLabel, league } = splitTitle(g.title);
    const kind = kindOf(baseLabel);

    // Eigener Verein in dieser Gruppe (kann "TC Pliening II" heißen)
    const club = clubs.map((c) => c.club).find((c) => OWN.test(c));
    if (!club) { console.log("  ! TC Pliening steht nicht in dieser Gruppe — übersprungen"); continue; }

    // Das Widget nennt beide Herren-30-Mannschaften schlicht "Herren 30". Welche
    // die zweite ist, verrät der Vereinsname in der Gruppe ("TC Pliening II").
    const roman = club.match(/\s+(II|III|IV)$/)?.[1];
    let tLabel = roman ? `${baseLabel} ${roman}` : baseLabel;
    if (teams.some((t) => t.label === tLabel)) {
      // Gleicher Name ohne römische Ziffer: der Reihe nach durchnummerieren
      const n = teams.filter((t) => t.label.startsWith(baseLabel)).length + 1;
      tLabel = `${baseLabel} ${"I".repeat(n)}`;
      console.log(`  ! Name doppelt — als "${tLabel}" geführt (bitte gegen btv.de prüfen)`);
    }

    const blocks = await venueBlocks(page, g.groupid, clubs.map((c) => c.club));
    const own = matches
      .filter((m) => m.home === club || m.away === club)
      .map((m) => ({ ...m, venue: venueOf(blocks, m) ?? m.venueShort ?? "" }));
    const cut = own.filter((m) => m.venue.endsWith("...")).length;
    if (cut) console.log(`  ! ${cut} Spielorte blieben gekürzt (Widget lieferte nichts)`);

    counters[kind] = (counters[kind] ?? 0);
    const color = PALETTE[kind][counters[kind] % PALETTE[kind].length];
    counters[kind]++;

    let shortLabel = tLabel.replace(/^Herren\s*/i, "H").replace(/^Damen\s*/i, "D")
      .replace(/^Mixed.*/i, "Mix").replace(/^Juniorinnen\s*/i, "J").replace(/^Junioren\s*/i, "Jn")
      .replace(/^Knaben\s*/i, "Kn").replace(/^Mädchen\s*/i, "Md").replace(/^Midcourt.*/i, "U10")
      .replace(/\s+II$/, "-2").replace(/\s+III$/, "-3").replace(/\s+/g, "");
    while (usedShort.has(shortLabel)) shortLabel += "*";
    usedShort.add(shortLabel);

    const teamId = `${id.replace(/-/g, "")}-${tLabel.toLowerCase().replace(/\s+/g, "")}`;
    teams.push({
      groupid: g.groupid, teamId, label: tLabel, shortLabel, league, kind, color,
      emoji: EMOJI[kind], club, clubs, own,
    });
    console.log(`  ${clubs.length} Mannschaften, ${own.length} Begegnungen für ${club}`);
  }

  if (!teams.length) throw new Error("Keine Mannschaft mit TC Pliening gefunden");

  // Reihenfolge wie in den handgepflegten Dateien: Herren, Damen, Mixed, Jugend
  // — innerhalb nach Altersklasse, die erste Mannschaft vor der zweiten.
  const ORDER = { herren: 0, damen: 1, mixed: 2, jugend: 3 };
  const ageOf = (l) => Number(l.match(/\d+/)?.[0] ?? 0);
  const romanOf = (l) => (l.match(/\s(II|III|IV)$/)?.[1] ?? "I").length;
  teams.sort((a, b) =>
    ORDER[a.kind] - ORDER[b.kind] ||
    ageOf(a.label) - ageOf(b.label) ||
    romanOf(a.label) - romanOf(b.label) ||
    a.label.localeCompare(b.label));

  const outRel = `src/data/${id}.ts`;
  fs.writeFileSync(path.join(ROOT, outRel), buildFile({ id, label, prefix, teams }));
  const total = teams.reduce((n, t) => n + t.own.length, 0);
  console.log(`\ngeschrieben: ${outRel} — ${teams.length} Mannschaften, ${total} Begegnungen (Widget-Saison: ${saison})`);

  console.log(`\n── Noch von Hand eintragen ─────────────────────────────────`);
  console.log(`\n1) scripts/seasons.mjs — neuen Block VOR die anderen Saisons:\n`);
  console.log(`  {
    id: ${q(id)},
    label: ${q(label)},
    layout: ${q(layout)},
    prefix: ${q(prefix)},
    dataFile: ${q(outRel)},
    matchesFile: ${q(layout === "summer" ? "src/data/matches.ts" : outRel)},
    reports: null,
    rosters: null,
    teamSize: 6,
    groups: [`);
  for (const t of teams) {
    console.log(`      { groupid: ${q(t.groupid)}, leagueName: ${q(t.league)}, mode: ${q(t.kind === "jugend" ? "herren" : t.kind)}, teamSize: 6 }, // ${t.shortLabel}`);
  }
  console.log(`    ],\n  },`);
  console.log(`\n2) src/types.ts — SeasonId um ${q(id)} erweitern`);
  console.log(`3) src/data/seasons.ts — { id: ${q(id)}, label: ${q(label)}, shortLabel: "…", icon: "❄️" } nach vorn`);
  console.log(`4) src/data/season-data.ts — Registry-Eintrag mit den ${prefix}_*-Konstanten`);
  console.log(`5) src/data/team-format.ts — Format je Konkurrenz (Winterrunde: durchgehend "4er"):`);
  for (const t of teams) console.log(`     ${q(t.teamId)}: "4er",`);
  console.log(`\nDanach prüfen:  node scripts/seasons.mjs && node scripts/check-data.mjs`);
} finally {
  await browser.close();
}
