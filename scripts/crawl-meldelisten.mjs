// Crawlt die namentlichen Meldelisten der Mixed-Runde (Gr. 074) von btv.de und
// schreibt src/data/meldelisten.ts neu.
//
//   npm run crawl:meldelisten
//
// Hintergrund: Die nuLiga-HTML-Seiten sind tot (Redirect aufs Portal) und das
// btv.de-Widget (widget.btv.de/btvgroup) ist eine ZK-Java-App, die DIREKT
// aufgerufen nur ein Fehlerbild zeigt. Sie funktioniert aber, wenn man die
// einbettende btv.de-Seite in einem echten Chrome lädt (headless reicht),
// das Cookiebot-Banner wegklickt und dann im Widget-iframe navigiert:
// Vereinsname in der Tabelle anklicken -> Mannschaftsportrait mit "SPIELER"-
// Grid (Rang, LK, ID, Name, Nation, Bilanzen), 15 Zeilen pro Seite, blättern
// über a.z-paging-next. Benötigt Google Chrome unter CHROME_PATH.

import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const GROUP_URL =
  "https://www.btv.de/de/spielbetrieb/tabelle-spielplan.html?groupid=2244334";
const LEAGUE_NAME = "Spielebene B · Gr. 074"; // exakt wie in summer-2026.ts
const TEAMS = [
  "TF Markt Schwaben",
  "TSV Haar",
  "TC Pliening",
  "FC Forstern",
  "TeG Kirchheim",
  "TSV Feldkirchen",
];
const OUT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/data/meldelisten.ts"
);

// Grid-Zeile: <rang> LK<x,y> <id> <Name, Vorname> (<jahr>) <NAT[*]> [<sg-nr>] <bilanzen>
const ROW_RE =
  /^(\d+) (LK[\d,]+) (\d{7,8}) (.+?) \((\d{4})\) ([A-Z]{3}\*?)(?: (\d{5}))?(?: (.+))?$/;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-first-run", "--disable-gpu", "--lang=de-DE"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 2400 });

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

async function getWidgetFrame() {
  for (let i = 0; i < 40; i++) {
    const f = page.frames().find((fr) => fr.url().includes("widget.btv.de"));
    if (f) {
      const t = await f.evaluate(() => document.body.innerText).catch(() => "");
      if (/Pliening|Schwaben/.test(t)) return f;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Widget-Frame nicht gefunden");
}

async function crawlTeam(club) {
  await page.goto(GROUP_URL, { waitUntil: "networkidle2", timeout: 90000 });
  await dismissConsent(page);
  for (const f of page.frames()) await dismissConsent(f);
  const frame = await getWidgetFrame();

  const ok = await frame.evaluate((name) => {
    const a = [...document.querySelectorAll("a")].find(
      (e) => e.textContent.trim() === name && e.offsetParent !== null
    );
    if (a) { a.click(); return true; }
    return false;
  }, club);
  if (!ok) throw new Error(`Vereins-Link nicht gefunden: ${club}`);

  await new Promise((r) => setTimeout(r, 5000));
  await frame.waitForFunction(() => /SPIELER/i.test(document.body.innerText), { timeout: 25000 });
  await new Promise((r) => setTimeout(r, 2000));

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
    await new Promise((r) => setTimeout(r, 3000));
  }

  // Parsen + in Herren/Damen splitten (Rang-Reset auf 1 = Damen beginnen)
  const herren = [];
  const damen = [];
  let section = herren;
  let prevRang = 0;
  const seenIds = new Set();
  for (const line of raw) {
    const m = line.match(ROW_RE);
    if (!m) throw new Error(`Parse-Fehler ${club}: ${line}`);
    const [, rangS, lk, id, name, jahrS, nation] = m;
    const rang = Number(rangS);
    if (seenIds.has(id)) continue; // Seite doppelt erwischt
    seenIds.add(id);
    if (rang === 1 && prevRang > 1) section = damen;
    const expected = (section[section.length - 1]?.rang ?? 0) + 1;
    if (rang !== expected) throw new Error(`Rang-Lücke ${club}: erwartet ${expected}, bekam ${rang} (${name})`);
    section.push({
      rang,
      name: name.trim(),
      lk,
      jahrgang: Number(jahrS),
      nation: nation === "GER" ? undefined : nation,
    });
    prevRang = rang;
  }
  console.log(`${club}: ${herren.length} Herren + ${damen.length} Damen`);
  return { club, herren, damen };
}

const teams = [];
for (const t of TEAMS) teams.push(await crawlTeam(t));
await browser.close();

const stand = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
const emitEntry = (e) => {
  const nat = e.nation ? `, nation: "${e.nation}"` : "";
  return `    { rang: ${e.rang}, name: ${JSON.stringify(e.name)}, lk: "${e.lk}", jahrgang: ${e.jahrgang}${nat} },`;
};

let ts = `import type { Meldeliste } from "../types";

// ── Namentliche Meldelisten der Südbayern Mixed-Runde (Gr. 074) ──────────────
// AUTO-GENERIERT von scripts/crawl-meldelisten.mjs (npm run crawl:meldelisten),
// Stand ${stand}. Quelle: btv.de Mannschaftsportraits der Gruppe 2244334.
// Rang = Meldeposition wie in nuLiga (Herren und Damen separat nummeriert);
// LK = aktuelle Leistungsklasse laut Portrait (kann von der LK im Spielbericht-
// PDF abweichen, die den Stand am Spieltag zeigt). nation nur, wenn nicht GER.
// Die Bilanzen werden NICHT hier gepflegt — sie kommen live aus den
// Spielberichten (src/data/spielberichte.ts, Schlüssel SB_mx074n<Nr>).

export const MELDELISTEN: Meldeliste[] = [
`;
for (const t of teams) {
  ts += `  {
    leagueName: ${JSON.stringify(LEAGUE_NAME)},
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
console.log(`geschrieben: ${OUT}`);
