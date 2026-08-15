// Crawlt Tabelle, Spielplan und ALLE Spielberichte (Einzel/Doppel) einer Gruppe
// aus dem btv.de-Widget und legt die Rohdaten in scripts/.spielberichte-cache.json ab.
//
//   npm run crawl:spielberichte             # alle Gruppen aus GROUPS
//   npm run crawl:spielberichte -- 292      # nur passende Gruppe(n)
//   npm run crawl:spielberichte -- 292 --force   # Cache dieser Gruppe verwerfen
//
// Die Auswertung/Generierung macht scripts/generate-spielberichte.mjs auf Basis
// des Caches — Crawl und Parsing sind bewusst getrennt, damit man am Parser
// iterieren kann, ohne erneut ~1 h zu crawlen.
//
// Vorgehen (siehe README "Spielberichte selbst crawlen"): btv.de-Gruppenseite
// laden, Consent wegklicken, im widget.btv.de-iframe arbeiten. Gespielte
// Begegnungen tragen ein span.gb-status mit Text "anzeigen" -> Klick oeffnet ein
// .z-window-Modal mit dem kompletten Bericht; "Druckversion [PDF]" darin liefert
// per window.open die MeetingReportFOP-URL (= Meeting-ID).

import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GROUPS } from "./groups.mjs";

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, "scripts/.spielberichte-cache.json");

const args = process.argv.slice(2);
const force = args.includes("--force");
const filter = args.find((a) => !a.startsWith("--"));
const groups = filter
  ? GROUPS.filter((g) => g.leagueName.includes(filter) || g.groupid === filter)
  : GROUPS;

const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};

let browser, page;
async function startBrowser() {
  if (browser) await browser.close().catch(() => {});
  browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-first-run", "--disable-gpu", "--lang=de-DE"],
  });
  page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 2400 });
}

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
    } catch { /* Frame noch nicht bereit */ }
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
      if (t.includes("Spielplan")) return f;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Widget-Frame nicht gefunden (group ${groupid})`);
}

const STATUS = /^(ANZEIGEN|OFFEN|Blanko-Spielbericht|URSPRÜNGLICH AM .*|VERLEGT.*)$/i;
const DATE_RE = /^(Mo|Di|Mi|Do|Fr|Sa|So)\.\s+(\d{2})\.(\d{2})\.(\d{2}),\s+(\d{2}:\d{2})$/;
const SCORE = /^\d+:\d+$/;

/** Tabelle + Spielplan aus dem Text des Widgets lesen.
 *  Zwischen den Ergebnis-Spalten und dem Gastverein können Zusatzzeilen stehen
 *  ("Spielort: …") — mal vor, mal hinter dem Gastnamen. Deshalb wird der
 *  Gastverein anhand der Vereinsliste aus der Tabelle bestimmt, nicht über die
 *  Position in der Zeile. */
function parseGroupText(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l && l !== " ");
  const table = [];
  const schedule = [];

  // ── Tabelle: nach dem Header RANG/VEREIN/... kommen 6er-Bloecke
  const tStart = lines.findIndex((l) => /^SÄTZE$/i.test(l));
  const sHeader = lines.findIndex((l) => /^GAST$/i.test(l));
  if (tStart >= 0) {
    for (let i = tStart + 1; i < (sHeader > 0 ? sHeader : lines.length) - 5; i++) {
      if (!/^\d+$/.test(lines[i])) continue;
      const [rank, club, beg, points, mp, sets] = lines.slice(i, i + 6);
      if (!/^\d+$/.test(beg) || !SCORE.test(points) || !SCORE.test(mp) || !SCORE.test(sets)) continue;
      table.push({ rank: Number(rank), club, beg: Number(beg), points, matchPoints: mp, sets });
      i += 5;
    }
  }

  // ── Spielplan: Zeilen ab dem Header GAST
  if (sHeader >= 0) {
    let date = null;
    let i = sHeader + 1;
    while (i < lines.length) {
      const l = lines[i];
      const dm = l.match(DATE_RE);
      if (dm) {
        date = `20${dm[4]}-${dm[3]}-${dm[2]}`;
        i++;
        continue;
      }
      // Begegnung: Heim, MP, SÄ, SP, [Spielort], Gast, Status...
      if (
        i + 4 < lines.length &&
        SCORE.test(lines[i + 1]) && SCORE.test(lines[i + 2]) && SCORE.test(lines[i + 3])
      ) {
        const home = l;
        const [mp, sa, sp] = lines.slice(i + 1, i + 4);
        let j = i + 4;
        const between = [];
        while (j < lines.length && !STATUS.test(lines[j]) && !DATE_RE.test(lines[j])) {
          between.push(lines[j]);
          j++;
        }
        const clubs = new Set(table.map((t) => t.club));
        const away = between.find((b) => clubs.has(b)) ?? between[between.length - 1] ?? "";
        const statuses = [];
        while (j < lines.length && STATUS.test(lines[j])) {
          statuses.push(lines[j]);
          j++;
        }
        schedule.push({
          date,
          home,
          away,
          mp,
          sets: sa,
          games: sp,
          played: statuses.some((s) => /^ANZEIGEN$/i.test(s)),
        });
        i = j;
        continue;
      }
      i++;
    }
  }
  return { table, schedule };
}

/** Heim-/Gastmannschaft aus dem Modal lesen (stehen dort in Großbuchstaben
 *  vor bzw. hinter der Spaltenkopf-Folge P S1 S2 S3 MP SÄ SP P). */
function modalTeams(modal) {
  const lines = modal.split("\n").map((l) => l.trim()).filter(Boolean);
  const start = lines.findIndex((l) => /^Einzelspiele$/i.test(l));
  if (start < 0) return null;
  const home = lines[start + 1];
  let i = start + 2;
  while (i < lines.length && /^(P|S1|S2|S3|MP|SÄ|SP)$/i.test(lines[i])) i++;
  const away = lines[i];
  if (!home || !away) return null;
  return { home: home.toUpperCase(), away: away.toUpperCase() };
}

async function crawlGroup(g) {
  const frame = await openGroup(g.groupid);
  await new Promise((r) => setTimeout(r, 1500));
  const text = await frame.evaluate(() => document.body.innerText);
  const { table, schedule } = parseGroupText(text);
  const played = schedule.filter((s) => s.played);
  // WICHTIG: über die DOM-**id** klicken, nicht über den Index einer gefilterten
  // Liste — der geklickte Span wechselt seinen Text auf "schliessen", wodurch
  // sich eine nach Text gefilterte Liste verschiebt (führt zu Versatz um 1).
  const spanIds = await frame.evaluate(() =>
    [...document.querySelectorAll("span.gb-status")]
      .filter((s) => /^(anzeigen|schliessen)$/i.test(s.textContent.trim()))
      .map((s) => s.id)
  );
  console.log(`${g.leagueName}: ${table.length} Mannschaften, ${schedule.length} Begegnungen, ${played.length} gespielt (${spanIds.length} Buttons)`);
  if (spanIds.length !== played.length) {
    throw new Error(`Zuordnung unsicher: ${spanIds.length} Buttons vs. ${played.length} gespielte Zeilen`);
  }
  const spans = spanIds.length;

  // Zuordnung NICHT über die Reihenfolge: die DOM-Reihenfolge der "anzeigen"-Spans
  // entspricht nicht der Spielplan-Reihenfolge. Stattdessen nennt das Modal selbst
  // beide Mannschaften (Großbuchstaben) — danach wird die Spielplan-Zeile gesucht.
  const byPair = new Map(played.map((r) => [`${r.home.toUpperCase()}::${r.away.toUpperCase()}`, r]));

  const reports = [];
  for (let idx = 0; idx < spans; idx++) {
    const id = spanIds[idx];
    await frame.evaluate((sid) => {
      const s = document.getElementById(sid);
      if (!s) throw new Error(`Span ${sid} verschwunden`);
      s.scrollIntoView({ block: "center" });
      s.click();
    }, id);
    await new Promise((r) => setTimeout(r, 2600));
    const modal = await frame.evaluate(() => {
      const w = [...document.querySelectorAll(".z-window")].filter((m) => m.offsetParent !== null);
      return w.length ? w[w.length - 1].innerText : null;
    });
    const pdfUrl = await frame.evaluate(async () => {
      window.__opened = [];
      window.open = (u) => { window.__opened.push(String(u)); return null; };
      const w = [...document.querySelectorAll(".z-window")].filter((m) => m.offsetParent !== null);
      const m = w[w.length - 1];
      const link = m && [...m.querySelectorAll("a, span, button")].find((e) => /druckversion/i.test(e.textContent));
      if (link) link.click();
      await new Promise((r) => setTimeout(r, 2000));
      return (window.__opened ?? [])[0] ?? null;
    });
    if (!modal) throw new Error(`kein Modal (idx ${idx})`);
    const pair = modalTeams(modal);
    if (!pair) throw new Error(`Mannschaften im Modal nicht erkannt (idx ${idx})`);
    const row = byPair.get(`${pair.home}::${pair.away}`);
    if (!row) throw new Error(`Modal-Paarung ${pair.home} – ${pair.away} steht nicht im Spielplan (idx ${idx})`);
    reports.push({
      league: g.leagueName,
      home: row.home,
      away: row.away,
      date: row.date,
      mp: row.mp,
      meetingId: (pdfUrl ?? "").match(/meeting=(\d+)/)?.[1] ?? null,
      modal,
    });
    // Modal ist "embedded" und hat keinen Schließen-Button: derselbe Span heißt
    // jetzt "schliessen" und klappt den Bericht wieder zu.
    await frame.evaluate((sid) => document.getElementById(sid)?.click(), id);
    await new Promise((r) => setTimeout(r, 900));
  }
  return { groupid: g.groupid, leagueName: g.leagueName, table, schedule, reports };
}

await startBrowser();
for (const g of groups) {
  if (cache[g.leagueName] && !force) {
    console.log(`${g.leagueName}: aus Cache (${cache[g.leagueName].reports.length} Berichte)`);
    continue;
  }
  let data;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      data = await crawlGroup(g);
      break;
    } catch (e) {
      console.error(`  ! ${g.leagueName} (Versuch ${attempt}): ${e.message}`);
      if (attempt < 3) await startBrowser();
    }
  }
  if (!data) continue;
  cache[g.leagueName] = data;
  fs.writeFileSync(CACHE, JSON.stringify(cache));
  console.log(`  -> ${data.reports.length} Berichte gespeichert`);
}
await browser.close();
console.log(`\nCache: ${Object.keys(cache).length} Gruppen, ${Object.values(cache).reduce((s, g) => s + g.reports.length, 0)} Berichte`);
