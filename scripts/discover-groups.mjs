// Findet die Gruppen (groupids) einer BELIEBIGEN Saison, in denen der TC Pliening
// gespielt hat — auch für vergangene Runden, die das Vereins-Widget nicht mehr
// anbietet. Quelle ist das Gruppen-Such-Widget von btv.de (btvgrpsearch): dort
// lässt sich über den Knopf „Archiv" jede frühere Saison wählen, danach
// Altersbereich → Altersklasse → Gruppe; die gewählte Gruppe erscheint mit
// Tabelle und „Link auf Gruppe" (= groupid).
//
//   node scripts/discover-groups.mjs --season "Winter 2025/2026"
//   node scripts/discover-groups.mjs --season "Sommer 2025" --regions "Südbayern,BTV-Ligen,Regionalliga"
//   node scripts/discover-groups.mjs --season "Mixed 2025" --regions Südbayern --bereiche MIXED
//   node scripts/discover-groups.mjs --season "Winter 2024/2025" --jugend   # auch Jugend-Klassen
//
// Ausgabe: JSON-Liste { groupid, leagueName, teamLabel, mode, teamSize } nach
// stdout (und als scripts/.discover-<saison>.json), fertig zum Einfügen in den
// Saison-Block von scripts/seasons.mjs. Fortschritt geht nach stderr.
//
// Fallen (alle hier behandelt):
//   - Das Widget rendert NUR eingebettet in eine btv.de-Seite (Referer); direkt
//     aufgerufen zeigt es ein Fehlerbild. Deshalb wird bezirks-archiv.html
//     geladen und die iframe-Quelle auf die gewünschte Region umgebogen.
//   - `?archive=true` führt in ein ALTES Archiv (bis Winter 2021/22). Die Runden
//     ab 2022 stehen im normalen Modus hinter dem Knopf „Archiv" (dritter
//     dropdown-toggle), dessen Einträge ohne Klick schon im DOM liegen.
//   - Menüs und Knöpfe sind ZK-Komponenten: JS-`click()` reicht nicht, es
//     braucht echte Maus-Klicks über die Bounding-Box.
//   - Nach der Wahl einer Altersklasse verschwinden die übrigen Klassen-Knöpfe,
//     und die Kopfzeile („ALTERSKLASSE (Herren 40)") reagiert nicht auf Klicks.
//     Deshalb wird das Widget für JEDE Altersklasse frisch geladen; nur die
//     Gruppen einer Klasse lassen sich nacheinander anklicken.
//   - Der Liganame im Widget ist GROSSGESCHRIEBEN („HERREN 40 BAYERNLIGA GR. 022 SU");
//     die richtige Schreibweise kommt aus dem Gruppen-PDF (ScheduleReportFOP).
//   - Regionen: Bayernliga/Landesliga = „BTV-Ligen", Südliga = „Südbayern",
//     Regionalliga = „Regionalliga" (nur Sommer). Mixed-Runden sind eigene
//     Saisons („Mixed 2025") in der Region Südbayern.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer-core";
import { ROOT } from "./seasons.mjs";

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const EMBED = "https://www.btv.de/de/spielbetrieb/bezirks-archiv.html";
const PDF = "https://btv.liga.nu/cgi-bin/WebObjects/nuLigaDokumentTENDE.woa/wa/nuDokument?dokument=ScheduleReportFOP&group=";
const OWN = /pliening/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const argv = process.argv.slice(2);
const arg = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : def;
};
const SEASON = arg("season");
if (!SEASON) {
  console.error('Aufruf: node scripts/discover-groups.mjs --season "Winter 2025/2026" [--regions a,b] [--bereiche a,b] [--jugend]');
  process.exit(1);
}
const isMixed = /^mixed/i.test(SEASON);
const isWinter = /^winter/i.test(SEASON);
const REGIONS = (arg("regions") ?? (isMixed ? "Südbayern" : isWinter ? "BTV-Ligen,Südbayern" : "BTV-Ligen,Südbayern,Regionalliga"))
  .split(",").map((s) => s.trim());
const BEREICHE = (arg("bereiche") ?? (isMixed ? "MIXED" : "DAMEN/HERREN,DA/HE 30 UND ÄLTER")).split(",").map((s) => s.trim());
if (argv.includes("--jugend") && !BEREICHE.includes("JUGEND")) BEREICHE.unshift("JUGEND");
// Altersklassen: Standard sind die, in denen der TC Pliening Mannschaften stellt —
// spart die Hälfte der Klicks. `--klassen alle` nimmt alles, `--klassen "Herren 40,Damen"` gezielt.
const KLASSEN_ARG = arg("klassen");
const KLASSEN = KLASSEN_ARG === "alle" ? null
  : (KLASSEN_ARG ?? "Herren,Damen,Herren 30,Herren 40,Herren 50,Herren 60,Damen 30,Damen 40,Damen 50,Mixed 00 A,Mixed 00 B,Mixed 30 A,Mixed 40 A,Mixed 50 A")
      .split(",").map((k) => k.trim().toLowerCase());
const OUTFILE = path.join(ROOT, `scripts/.discover-${SEASON.replace(/[^a-z0-9]+/gi, "_")}.json`);
const log = (...a) => console.error(...a);
// Fehlersuche: --only "<Bereich>::<Klasse>" beschränkt den Lauf auf eine Klasse
// und gibt nach jedem Schritt den Seitentext aus.
const ONLY = arg("only");
const [ONLY_BEREICH, ONLY_KLASSE] = ONLY ? ONLY.split("::") : [null, null];
const dump = async (label) => {
  if (!ONLY) return;
  log(`\n--- ${label} ---\n` + (await bodyText()).replace(/\n+/g, " | ").slice(0, 1500));
};

async function dismissConsent(target) {
  for (let i = 0; i < 8; i++) {
    let clicked = false;
    try {
      clicked = await target.evaluate(() => {
        const wanted = ["Alle ablehnen", "Nur notwendige Cookies", "Auswahl erlauben", "OK", "Ablehnen"];
        const b = [...document.querySelectorAll("button, a")].find((e) => wanted.includes(e.textContent.trim()) && e.offsetParent !== null);
        if (b) { b.click(); return true; }
        return false;
      });
    } catch { /* Frame noch nicht bereit */ }
    if (clicked) return;
    await sleep(800);
  }
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-first-run", "--disable-gpu", "--lang=de-DE"] });
const page = await browser.newPage();
await page.setViewport({ width: 1300, height: 2600 });

const frame = () => page.frames().find((f) => f.url().includes("btvgrpsearch"));
const grow = () => page.evaluate(() => {
  for (const i of document.querySelectorAll("iframe")) if (i.src.includes("btvgrpsearch")) { i.style.height = "2400px"; i.style.minHeight = "2400px"; }
});
const bodyText = async () => frame().evaluate(() => document.body.innerText);

/** Widget frisch laden: btv.de-Seite (nur bis DOM, die Werbung muss nicht
 *  fertig sein), Consent weg, iframe auf die Region umbiegen. */
async function fresh(region) {
  await page.goto(EMBED, { waitUntil: "domcontentloaded", timeout: 90000 });
  await sleep(1500);
  await dismissConsent(page);
  for (const f of page.frames()) await dismissConsent(f);
  await page.evaluate((r) => {
    const ifr = [...document.querySelectorAll("iframe")].find((i) => i.src.includes("btvgrpsearch"));
    ifr.src = `https://widget.btv.de/btvgrpsearch/?region=${encodeURIComponent(r)}`;
  }, region);
  for (let i = 0; i < 25; i++) {
    await sleep(800);
    const f = frame();
    if (f && /Altersbereich/i.test(await f.evaluate(() => document.body.innerText).catch(() => ""))) break;
  }
  await sleep(800);
  await grow();
}

/** Zurück zur Bereichswahl OHNE Neuladen: die Saison im „Archiv"-Menü erneut
 *  wählen setzt die Auswahl zurück. Klappt das nicht, frisch laden. */
async function reset(region) {
  try {
    const toggles = await frame().$$(".dropdown-toggle");
    const box = await toggles[2]?.boundingBox();
    if (box) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await sleep(900);
      if (await clickText(SEASON, ".z-menuitem-text, .z-menuitem", 1500)) {
        const b = await choices("In welchem Altersbereich");
        if (b.length) return true;
      }
    }
  } catch { /* Frame weg o. ä. — dann neu laden */ }
  await fresh(region);
  return pickSeason();
}

/** Sichtbares Element mit exakt diesem Text per Maus klicken (kleinstes zuerst). */
async function clickText(text, sel = "button, a, li, div, span, td, .z-menuitem-text", wait = 1800) {
  await grow();
  // Nach einem Gruppenklick scrollt die btv.de-Seite nach unten; dann liegen
  // die Knöpfe hinter der festen Kopfleiste der Seite und Klicks gehen ins
  // Leere. Der iframe ist hoch genug — also immer oben messen und klicken.
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(150);
  const els = await frame().$$(sel);
  // Kandidaten: exakter Text, sichtbar, mit echter Fläche im Fenster. Derselbe
  // Text steht oft mehrfach im DOM (responsive Kopien) — davon liegt nur eine
  // Kopie wirklich sichtbar auf der Seite; die anderen haben 0×0 oder liegen
  // außerhalb. Von den sichtbaren gewinnt das kleinste Element.
  const cands = [];
  for (const el of els) {
    const t = await el.evaluate((e) => (e.offsetParent !== null ? e.textContent.trim() : null));
    if (!t || t.toLowerCase() !== text.toLowerCase()) continue;
    const box = await el.boundingBox();
    const info = await el.evaluate((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(" ").slice(0, 2).join(".")}`);
    cands.push({ el, box, info, len: t.length });
  }
  if (ONLY) log(`  Kandidaten "${text}": ` + cands.map((c) => `${c.info}@${c.box ? [c.box.x, c.box.y, c.box.width, c.box.height].map(Math.round).join(",") : "-"}`).join(" | "));
  const vp = page.viewport();
  const inView = (c) => c.box && c.box.width > 4 && c.box.height > 4 && c.box.x >= 0 && c.box.y >= 0 && c.box.x + c.box.width <= vp.width && c.box.y + c.box.height <= vp.height;
  let usable = cands.filter(inView);
  // Die Altersklassen liegen in einem horizontalen Karussell (drei Folien, nur
  // eine im Fenster). Steht der Treffer links oder rechts außerhalb, mit den
  // Pfeilknöpfen (.btvbtn-prev / .btvbtn-next) blättern und neu messen.
  for (let round = 0; !usable.length && cands.some((c) => c.box) && round < 6; round++) {
    const off = cands.find((c) => c.box);
    const dir = off.box.x < 0 ? ".btvbtn-prev" : ".btvbtn-next";
    const btn = (await frame().$$(dir)).at(0);
    const bb = btn && (await btn.boundingBox());
    if (!bb) break;
    await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await sleep(700);
    for (const c of cands) c.box = await c.el.boundingBox();
    usable = cands.filter(inView);
    if (ONLY) log(`  geblättert (${dir}): ` + cands.map((c) => (c.box ? [c.box.x, c.box.y].map(Math.round).join(",") : "-")).join(" | "));
  }
  usable.sort((a, b) => a.len - b.len || a.box.width * a.box.height - b.box.width * b.box.height);
  const best = usable[0];
  if (!best) return false;
  await page.mouse.click(best.box.x + best.box.width / 2, best.box.y + best.box.height / 2);
  await sleep(wait);
  await grow();
  return true;
}

/** Saison über den Knopf „Archiv" (dritter dropdown-toggle) wählen. */
async function pickSeason() {
  const toggles = await frame().$$(".dropdown-toggle");
  const current = await toggles[1]?.evaluate((e) => e.textContent.trim());
  if (current?.toLowerCase() === SEASON.toLowerCase()) return true;
  const box = await toggles[2]?.boundingBox();
  if (!box) return false;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(1500);
  return clickText(SEASON, ".z-menuitem-text, .z-menuitem");
}

/** Texte der sichtbaren Auswahl-Knöpfe hinter der Frage „… suchen Sie?" */
async function choices(question) {
  const lines = (await bodyText()).split("\n").map((l) => l.trim()).filter(Boolean);
  const i = lines.findIndex((l) => l.startsWith(question));
  if (i < 0) return [];
  const out = [];
  for (let k = i + 1; k < lines.length; k++) {
    if (/suchen Sie\?|^Tabelle$|^RANG$/i.test(lines[k])) break;
    out.push(lines[k]);
  }
  return [...new Set(out)];
}

/** Gruppen-Knöpfe einer Klasse: kurze Texte wie "022-SU" oder "109". */
async function groupButtons() {
  return frame().evaluate(() => [...new Set([...document.querySelectorAll("button, a, div, span, td")]
    .filter((e) => e.children.length === 0 && e.offsetParent !== null && /^\d{3}(-[A-Z]{2})?$/.test(e.textContent.trim()))
    .map((e) => e.textContent.trim()))]);
}

/** Nach Klick auf eine Gruppe: Kopfzeile, Vereine der Tabelle, groupid. */
async function readGroup() {
  const lines = (await bodyText()).split("\n").map((l) => l.trim()).filter(Boolean);
  const hi = lines.findIndex((l) => /GR\.\s*\d+/i.test(l) && l === l.toUpperCase());
  const header = hi >= 0 ? lines[hi] : null;
  const clubs = [];
  const ti = lines.findIndex((l) => /^SÄTZE$/i.test(l));
  if (ti >= 0) {
    for (let k = ti + 1; k + 5 < lines.length; k++) {
      if (/^\d+$/.test(lines[k]) && /^\d+$/.test(lines[k + 2]) && /^\d+:\d+$/.test(lines[k + 3])) { clubs.push(lines[k + 1]); k += 5; }
      else if (/^Link auf Gruppe$/i.test(lines[k])) break;
    }
  }
  const groupid = await frame().evaluate(() => {
    const a = [...document.querySelectorAll("a[href]")].find((x) => /groupid=\d+/.test(x.href));
    return a ? a.href.match(/groupid=(\d+)/)[1] : null;
  });
  return { header, clubs, groupid };
}

/** "Herren 40 Bayernliga Gr. 022 SU" (aus dem PDF) -> Label + Liganame in Projektschreibweise */
function splitTitle(title) {
  const m = title.match(/^((?:Herren|Damen|Mixed|Juniorinnen|Junioren|Knaben|Mädchen|Midcourt)(?:\s+\d+)?)\s+(.*?)(Gr\.\s*\d+.*)$/i);
  if (!m) return { label: title, league: title };
  return { label: m[1].trim(), league: `${m[2].trim()} · ${m[3].trim()}` };
}
function pdfTitle(groupid) {
  try {
    const tmp = path.join(ROOT, `scripts/.tmp-${groupid}.pdf`);
    execFileSync("curl", ["-sL", "-A", "Mozilla/5.0", `${PDF}${groupid}`, "-o", tmp]);
    const txt = execFileSync("pdftotext", ["-l", "1", "-layout", tmp, "-"], { encoding: "utf8" });
    fs.unlinkSync(tmp);
    return txt.split("\n").map((l) => l.trim()).find((l) => /Gr\.\s*\d+/.test(l)) ?? null;
  } catch {
    return null;
  }
}
/** Schreibweise notfalls aus der Großschreibung rekonstruieren. */
function fromUpper(header) {
  return header.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bGr\.\s*/i, "Gr. ").replace(/\b(Su|No|Ii|Iii|Iv)\b/g, (m) => m.toUpperCase())
    .replace(/(\d+)Er\b/g, "$1er");
}

const found = [];
const seen = new Set();
for (const region of REGIONS) {
  await fresh(region);
  if (!(await pickSeason())) { log(`${region}: Saison "${SEASON}" nicht im Angebot — übersprungen`); continue; }
  const bereiche = await choices("In welchem Altersbereich");
  log(`\n${region} · ${SEASON}: Altersbereiche ${JSON.stringify(bereiche)}`);
  for (const bereich of BEREICHE) {
    if (ONLY_BEREICH && bereich.toLowerCase() !== ONLY_BEREICH.toLowerCase()) continue;
    if (!bereiche.some((b) => b.toLowerCase() === bereich.toLowerCase())) continue;
    await reset(region);
    if (!(await clickText(bereich))) { log(`  ${bereich}: nicht klickbar`); continue; }
    const klassen = await choices("In welcher Altersklasse");
    const wanted = klassen.filter((k) => !KLASSEN || KLASSEN.includes(k.toLowerCase()));
    log(`  ${bereich}: ${klassen.join(", ")}${KLASSEN ? ` → geprüft: ${wanted.join(", ") || "keine"}` : ""}`);
    for (const klasse of wanted) {
      if (ONLY_KLASSE && klasse.toLowerCase() !== ONLY_KLASSE.toLowerCase()) continue;
      await reset(region);
      await dump("nach Saison");
      if (!(await clickText(bereich))) { log(`    ${klasse}: Bereich nicht klickbar`); continue; }
      await dump("nach Bereich");
      if (!(await clickText(klasse))) { log(`    ${klasse}: Klasse nicht klickbar`); continue; }
      await dump("nach Klasse");
      const buttons = await groupButtons();
      const hits = [];
      for (const b of buttons) {
        if (!(await clickText(b))) continue;
        const g = await readGroup();
        if (!g.groupid || seen.has(g.groupid)) continue;
        seen.add(g.groupid);
        if (!g.clubs.some((c) => OWN.test(c))) continue;
        const pdf = pdfTitle(g.groupid);
        const title = pdf ?? fromUpper(g.header ?? `${klasse} ${b}`);
        const { label, league } = splitTitle(title);
        const mode = /^Mixed/i.test(label) ? "mixed" : /^Damen|^Juniorinnen|^Mädchen/i.test(label) ? "damen" : "herren";
        const teamSize = isWinter || /\(4er\)/.test(league) || mode === "mixed" ? 6 : 9;
        const entry = { groupid: g.groupid, leagueName: league, teamLabel: label, mode, teamSize, region, clubs: g.clubs };
        found.push(entry);
        hits.push(`${league} (${g.groupid})`);
        fs.writeFileSync(OUTFILE, JSON.stringify(found, null, 2)); // Zwischenstand
      }
      log(`    ${klasse}: ${buttons.length} Gruppen${hits.length ? " — ✓ " + hits.join(", ") : ""}`);
    }
  }
}
await browser.close();
fs.writeFileSync(OUTFILE, JSON.stringify(found, null, 2));
log(`\n${found.length} Gruppen mit TC Pliening — ${path.relative(ROOT, OUTFILE)}`);
console.log(JSON.stringify(found.map(({ clubs, region, ...g }) => g), null, 2));
