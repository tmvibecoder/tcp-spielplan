// Crawlt die namentlichen Meldelisten aller Mannschaften der gepflegten
// Konkurrenzen von btv.de und schreibt src/data/meldelisten.ts neu.
//
//   npm run crawl:meldelisten            # alle Gruppen aus GROUPS
//   npm run crawl:meldelisten -- 074     # nur Gruppen, deren Kurzname passt
//
// Hintergrund: Die nuLiga-HTML-Seiten sind tot (Redirect aufs Portal) und das
// btv.de-Widget (widget.btv.de/btvgroup) ist eine ZK-Java-App, die DIREKT
// aufgerufen nur ein Fehlerbild zeigt. Sie funktioniert aber, wenn man die
// einbettende btv.de-Seite in einem echten Chrome lädt (headless reicht),
// das Cookiebot-Banner wegklickt und dann im Widget-iframe navigiert:
// Vereinsname in der Tabelle anklicken -> Mannschaftsportrait mit "SPIELER"-
// Grid (Rang, LK, ID, Name, Nation, Bilanzen), 15 Zeilen pro Seite, blättern
// über a.z-paging-next, zurück über den "ZURÜCK"-Button.
// Benötigt Google Chrome unter CHROME_PATH.
//
// groupid = interne nuLiga-ID aus dem btv.de-Link `?groupid=`; sie steht auch
// im "Tabelle/Spielplan [PDF]"-Link der Vereinsseite (dort als `group=`).

import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

import { GROUPS } from "./groups.mjs";

// Vereinsnamen, die im Widget anders heißen als in summer-2026.ts — je Liga,
// denn derselbe Verein kann in einer Liga zurückgezogen sein und in der anderen
// normal weiterspielen (VfB Forstinning: Gr. 315 zurückgezogen, Gr. 379 nicht).
const CLUB_ALIASES = {
  "Südliga 2 · Gr. 315": { "VfB Forstinning": "VfB Forstinning (zurückgezogen)" },
  "Landesliga 2 · Gr. 043 SU": { "TC Pliening II": "TC Pliening II (zurückgezogen)" },
};

const filter = process.argv[2];
const groups = filter
  ? GROUPS.filter((g) => g.leagueName.includes(filter) || g.groupid === filter)
  : GROUPS;

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src/data/meldelisten.ts");

// Grid-Zeile: <rang> LK<x,y> <id> <Name, Vorname> (<jahr>) [NAT[*]] [<sg-nr>] <bilanzen>
// Die Nations-Spalte fehlt in manchen Portraits komplett (z. B. Gr. 004) -> optional.
const ROW_RE =
  /^(\d+) (LK[\d,]+) (\d{7,8}) (.+?) \((\d{4})\)(?: ([A-Z]{3}\*?))?(?: (\d{5}))?(?: (.+))?$/;

// Zwischenstand, damit ein Abbruch nicht alles verwirft (Datei ist gitignored)
const CACHE = path.join(ROOT, "scripts/.meldelisten-cache.json");
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
const cacheKey = (lg, club) => `${lg}::${club}`;

let browser, page;
async function startBrowser() {
  if (browser) await browser.close().catch(() => {});
  browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    // CHROME_ARGS: zusaetzliche Chrome-Flags fuer Container/CI
    // (z. B. CHROME_ARGS="--no-sandbox", wenn der Crawl als root laeuft).
    args: [
      "--no-first-run",
      "--disable-gpu",
      "--lang=de-DE",
      ...(process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(" ").filter(Boolean) : []),
    ],
  });
  page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 2400 });
}
await startBrowser();

async function dismissConsent(target) {
  for (let i = 0; i < 8; i++) {
    let clicked = false;
    try {
      clicked = await target.evaluate(() => {
        const wanted = ["Alle ablehnen", "Nur notwendige Cookies", "Auswahl erlauben", "OK", "Ablehnen"];
        const b = [...document.querySelectorAll("button, a")].find(
          (e) => wanted.includes(e.textContent.trim()) && e.offsetParent !== null
        );
        if (b) { b.click(); return true; }
        return false;
      });
    } catch { /* Frame evtl. noch nicht bereit */ }
    if (clicked) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

async function openGroup(groupid) {
  await page.goto(`https://www.btv.de/de/spielbetrieb/tabelle-spielplan.html?groupid=${groupid}`, {
    waitUntil: "networkidle2",
    timeout: 90000,
  });
  await dismissConsent(page);
  for (const f of page.frames()) await dismissConsent(f);
  for (let i = 0; i < 40; i++) {
    const f = page.frames().find((fr) => fr.url().includes("widget.btv.de"));
    if (f) {
      const t = await f.evaluate(() => document.body.innerText).catch(() => "");
      if (t.includes("Spielplan vom") || /Tabelle/.test(t)) return f;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Widget-Frame nicht gefunden (group ${groupid})`);
}

/** Vereinsnamen aus der Tabelle oben (nicht aus dem Spielplan — dort stehen auch
 *  Spielort-Links wie "TC Kirchheim bei Mü.", die kein Mannschaftsportrait haben). */
function clubLinks(frame) {
  return frame.evaluate(() => {
    // kleinstes Element, das Tabellen-Kopfzeile UND Vereinslinks enthält
    const cands = [...document.querySelectorAll("div, table")].filter(
      (e) => /RANG[\s\S]{0,60}VEREIN/i.test(e.innerText ?? "") && e.querySelectorAll("a").length >= 3
    );
    cands.sort((a, b) => (a.innerText?.length ?? 0) - (b.innerText?.length ?? 0));
    const scope = cands[0] ?? document;
    const seen = new Set();
    const out = [];
    for (const a of scope.querySelectorAll("a")) {
      const t = a.textContent.trim();
      if (!t || t.length < 3 || a.offsetParent === null) continue;
      if (/Druckversion|E-Mail|Blanko|anzeigen|PDF/i.test(t)) continue;
      if (seen.has(t)) continue;
      seen.add(t);
      out.push(t);
    }
    return out;
  });
}

async function crawlTeam(frame, club, mode, leagueName) {
  const ok = await frame.evaluate((name) => {
    const a = [...document.querySelectorAll("a")].find(
      (e) => e.textContent.trim() === name && e.offsetParent !== null
    );
    if (a) { a.click(); return true; }
    return false;
  }, club);
  if (!ok) throw new Error(`Vereins-Link nicht gefunden: ${club}`);

  await new Promise((r) => setTimeout(r, 4000));
  await frame.waitForFunction(() => /SPIELER/i.test(document.body.innerText), { timeout: 25000 });
  await new Promise((r) => setTimeout(r, 1500));

  // Pager auf Seite 1 zurücksetzen — beim Mannschaftswechsel behält ZK sonst die
  // vorherige Seite bei und die Liste beginnt mitten drin (z. B. bei Rang 7).
  for (let i = 0; i < 12; i++) {
    const onFirst = await frame.evaluate(() => {
      const first = document.querySelector("a.z-paging-first:not([disabled])");
      if (first) { first.click(); return false; }
      const row = document.querySelector(".z-grid .z-row td, .z-grid tr td");
      return !row || /^\s*1\s*$/.test(row.innerText);
    });
    if (onFirst) break;
    await new Promise((r) => setTimeout(r, 1200));
  }

  const raw = [];
  for (let p = 1; p <= 30; p++) {
    const rows = await frame.evaluate(() => {
      const out = [];
      for (const row of document.querySelectorAll(".z-grid .z-row, .z-grid tr")) {
        const cells = [...row.querySelectorAll("td")].map((c) =>
          c.innerText.trim().replace(/\n+/g, " ")
        );
        const line = cells.filter(Boolean).join(" ");
        if (/LK\d/.test(line) && /\d{7,8}/.test(line)) out.push(line);
      }
      return out;
    });
    raw.push(...rows);
    const advanced = await frame.evaluate(() => {
      const n = document.querySelector("a.z-paging-next:not([disabled])");
      if (n) { n.click(); return true; }
      return false;
    });
    if (!advanced) break;
    await new Promise((r) => setTimeout(r, 2500));
  }

  // zurück zur Tabelle
  await frame.evaluate(() => {
    const b = [...document.querySelectorAll("a, button, span")].find(
      (e) => /^zur(ü|ue)ck$/i.test(e.textContent.trim()) && e.offsetParent !== null
    );
    b?.click();
  });
  await new Promise((r) => setTimeout(r, 2500));

  const herren = [];
  const damen = [];
  let section = mode === "damen" ? damen : herren;
  let prevRang = 0;
  const seenIds = new Set();
  for (const line of raw) {
    const m = line.match(ROW_RE);
    if (!m) throw new Error(`Parse-Fehler ${club}: ${line}`);
    const [, rangS, lk, id, name, jahrS, nation] = m;
    const rang = Number(rangS);
    if (seenIds.has(id)) continue; // Seite doppelt erwischt
    seenIds.add(id);
    // Bei II./III. Mannschaften startet die Meldeliste NICHT bei 1, sondern bei
    // dem Rang, ab dem der Verein die Spieler dieser Mannschaft gemeldet hat
    // (z. B. Feldkirchen II ab Rang 7) — also nur lückenlose Folge prüfen.
    // Mixed: fällt der Rang wieder, beginnt die Damen-Liste.
    if (mode === "mixed" && prevRang && rang <= prevRang) section = damen;
    // Nur aufsteigend prüfen: Ränge dürfen Lücken haben (abgemeldete Spieler,
    // z. B. Anzing II ohne Rang 20) und beginnen bei II./III. Mannschaften mitten
    // in der vereinsweiten Liste. Ein Rücksprung dagegen heißt: Seite doppelt
    // gelesen oder Damen-Liste beginnt.
    const last = section[section.length - 1]?.rang;
    if (last !== undefined && rang <= last) {
      throw new Error(`Rang-Rücksprung ${club}: nach ${last} kam ${rang} (${name})`);
    }
    section.push({
      rang,
      name: name.trim(),
      lk,
      jahrgang: Number(jahrS),
      nation: nation === "GER" ? undefined : nation,
    });
    prevRang = rang;
  }
  const alias = CLUB_ALIASES[leagueName]?.[club];
  return { club: alias ?? club, herren, damen };
}

const result = [];
for (const g of groups) {
  let frame = await openGroup(g.groupid);
  const clubs = await clubLinks(frame);
  console.log(`\n${g.leagueName} (group ${g.groupid}): ${clubs.length} Mannschaften`);
  for (const club of clubs) {
    const key = cacheKey(g.leagueName, club);
    if (cache[key]) {
      result.push(cache[key]);
      console.log(`  ${cache[key].club}: ${cache[key].herren.length} H + ${cache[key].damen.length} D (Cache)`);
      continue;
    }
    let team;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        team = await crawlTeam(frame, club, g.mode, g.leagueName);
        break;
      } catch (e) {
        console.error(`  ! ${club} (Versuch ${attempt}): ${e.message}`);
        if (attempt === 3) break;
        // Frame ist nach Fehlern oft detached -> Seite (ggf. Browser) neu aufbauen
        try {
          frame = await openGroup(g.groupid);
        } catch {
          await startBrowser();
          frame = await openGroup(g.groupid);
        }
      }
    }
    if (!team) continue;
    const entry = { leagueName: g.leagueName, ...team };
    result.push(entry);
    cache[key] = entry;
    fs.writeFileSync(CACHE, JSON.stringify(cache));
    console.log(`  ${team.club}: ${team.herren.length} H + ${team.damen.length} D`);
  }
}
await browser.close();

const stand = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
const emitEntry = (e) => {
  const nat = e.nation ? `, nation: "${e.nation}"` : "";
  return `    { rang: ${e.rang}, name: ${JSON.stringify(e.name)}, lk: "${e.lk}", jahrgang: ${e.jahrgang}${nat} },`;
};

let ts = `import type { Meldeliste } from "../types";

// ── Namentliche Meldelisten (Sommer 2026 + Mixed-Runde) ──────────────────────
// AUTO-GENERIERT von scripts/crawl-meldelisten.mjs (npm run crawl:meldelisten),
// Stand ${stand}. Quelle: btv.de Mannschaftsportraits der jeweiligen Gruppe.
// Rang = Meldeposition wie in nuLiga (bei Mixed sind Herren und Damen separat
// nummeriert); LK = aktuelle Leistungsklasse laut Portrait (kann von der LK im
// Spielbericht-PDF abweichen, die den Stand am Spieltag zeigt). nation nur,
// wenn nicht GER. Bilanzen stehen NICHT hier — sie kommen live aus den
// Spielberichten (src/data/spielberichte.ts).

export const MELDELISTEN: Meldeliste[] = [
`;
// Mannschaften ohne jeden Spieler weglassen (z. B. Midcourt U10: nuLiga führt
// dort keine namentliche Meldeliste) — sonst zeigt die App "Einzel (0)".
for (const t of result.filter((x) => x.herren.length || x.damen.length)) {
  ts += `  {
    leagueName: ${JSON.stringify(t.leagueName)},
    club: ${JSON.stringify(t.club)},
    herren: [
${t.herren.map(emitEntry).join("\n")}
    ],
    damen: [
${t.damen.map(emitEntry).join("\n")}
    ],
  },
`;
}
ts += `];

/** Meldeliste einer Mannschaft (exakte league/club-Strings wie in SUMMER_STANDINGS). */
export function getMeldeliste(
  leagueName: string,
  club: string
): Meldeliste | undefined {
  return MELDELISTEN.find(
    (m) => m.leagueName === leagueName && m.club === club
  );
}
`;
fs.writeFileSync(OUT, ts);
const total = result.reduce((s, t) => s + t.herren.length + t.damen.length, 0);
console.log(`\ngeschrieben: ${OUT} (${result.length} Mannschaften, ${total} Spieler)`);
