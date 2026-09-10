# Skill-Vorlage: BTV-Ergebnisse prüfen und auf tcp-spielplan.de nachziehen

> **Einordnung:** Das hier ist die **ausführlichste** Fassung des Ergebnis-Abgleichs,
> gedacht als Vorlage für einen wiederverwendbaren Prompt/Skill. Wer den Ablauf nur
> einmal durchführen will, nimmt die Kurzfassung in
> **[AUFGABEN.md, Abschnitt 2](AUFGABEN.md)**. Fachbegriffe erklärt das
> **[Glossar](GLOSSAR.md)**, den Aufbau des Projekts die
> **[Architektur](ARCHITEKTUR.md)**.

> **Seit 10.09.2026:** Der automatische Wecker (`scripts/briefing-run.mjs`,
> `.github/workflows/briefing.yml`) erledigt die Schritte 1–3 dieses Ablaufs gruppenweise 7, 4
> und 0 Tage vor jeder TCP-Begegnung selbst. Dieser Skill bleibt für Nachlesen ganzer Saisons,
> Gruppen ohne TCP-Begegnung und alles, was der Wecker nicht anfasst.

Diese Datei fasst alle Erkenntnisse aus der Session vom 15./16.08.2026 zusammen
(PRs #37–#43). Sie ist als Grundlage gedacht, um in der Claude-App einen Skill zu
bauen, der auf Zuruf **alle Mannschaften aller Konkurrenzen auf neue Ergebnisse
prüft und sie in tcp-spielplan.de einträgt** (Spielberichte, Tabellen,
Meldelisten — bis hin zum Live-Deploy).

---

## Was der Skill tun soll (Kurzfassung für den Skill-Prompt)

> Arbeite im Repo `tmvibecoder/tcp-spielplan`
> (lokal `/Users/thomasmiler/Claude/Projects/tcp-spielplan`, in einem frischen
> Worktree von `origin/main`). Prüfe die Gruppen der **laufenden Saison** auf neue
> Ergebnisse, crawle fehlende Spielberichte, aktualisiere Tabellen und ggf.
> Meldelisten, prüfe die Konsistenz, baue, verifiziere im Browser und deploye
> per PR + Squash-Merge. Verifiziere danach das Live-Bundle.

**Die Saison muss niemand angeben.** Alle Skripte erkennen sie selbst: `scripts/seasons.mjs`
liest die eingetragenen Spieltermine und wählt die Runde, in deren Zeitraum das heutige Datum
fällt (bzw. die in weniger als 60 Tagen beginnt oder zuletzt endete). Trägt jemand im April 2027
die Sommer-27-Termine ein, zieht ab dann alles automatisch die Sommerrunde 2027.

```
npm run season          # zeigt alle Saisons und welche gerade dran ist
```

Ausgabe am 09.09.2026:

```
→ winter-2627   Winter 2026/27   2026-10-10 – 2027-03-20  ( 34 Begegnungen)  7 Gruppen, Layout winter
  sommer-26     Sommer 2026      2026-05-02 – 2026-09-06  (114 Begegnungen)  18 Gruppen, Layout summer
  winter-2526   Winter 2025/26   2025-10-04 – 2026-03-28  ( 27 Begegnungen)  0 Gruppen, Layout winter

Saison: Winter 2026/27 (winter-2627) — startet in 31 Tagen; 2026-10-10 – 2027-03-20, 34 Begegnungen
        Hinweis: Sommer 2026 endete vor 3 Tagen — Nachlese mit --season sommer-26
```

Jedes Skript nennt beim Start die Saison, auf die es wirkt, und lässt sich mit
`--season <id>` umlenken (für Nachlesen der alten Runde im Übergang).

## Ablauf Schritt für Schritt

1. **Schnell-Check, ob es überhaupt Neues gibt** (billig, ohne Browser):
   für jede Gruppe den Gruppen-Report ziehen und mit dem Repo-Stand vergleichen —
   ```
   curl -sL -A "Mozilla/5.0" "https://btv.liga.nu/cgi-bin/WebObjects/nuLigaDokumentTENDE.woa/wa/nuDokument?dokument=ScheduleReportFOP&group=<groupid>"
   ```
   Das PDF („Tabelle und Spielplan", nu.Dokument 013) zeigt jede Begegnung mit
   Ergebnis. Neue Ergebnisse = Zellen, die in der Datendatei der Saison noch
   `"0:0"` sind. `-L` ist Pflicht (Redirect hängt das `etag` an). Die groupids der
   laufenden Saison stehen in `scripts/seasons.mjs` (`npm run season` zeigt sie).

2. **Spielberichte crawlen** (nur nötig, wenn Schritt 1 Neues zeigt):
   ```
   npm run crawl:spielberichte -- <groupid> --force   # nur die betroffene Gruppe
   npm run gen:spielberichte                          # Caches -> src/data/spielberichte-crawled.ts
   ```
   `--force` verwirft den Cache der Gruppe (sonst kommt der alte Stand zurück).
   Jede Saison hat einen **eigenen** Cache (`scripts/.spielberichte-cache-<id>.json`);
   `gen:spielberichte` führt alle vorhandenen zusammen und **bricht ab**, wenn dabei
   Ligen verlorengingen, die schon in der Datei stehen — dann erst die fehlende Saison
   nachcrawlen. Kompletter Neu-Crawl aller 18 Sommer-Gruppen dauert ~45 min.

3. **Tabellen und Ergebnisse nachziehen**:
   ```
   npm run gen:standings              # Diff der laufenden Saison ansehen
   npm run gen:standings -- --write   # schreiben (setzt auch <PREFIX>_STANDINGS_STAND)
   ```
   Im **Winter-Layout** schreibt derselbe Lauf zusätzlich jede Begegnung selbst
   (`mp`/`sets`/`games`, `status` auf `"played"`) und zieht verlegte Termine nach —
   dort hängen Sätze und Spiele am Match, nicht nur in der Kreuztabelle.
   Achtung: Ligen aus `keepLeagues` (Sommer: Gr. 043 SU und Gr. 315) bleiben
   handgepflegt — zurückgezogene Mannschaften, die offizielle Tabelle weicht bewusst ab.
   Rangfolge immer **verbatim** übernehmen — der BTV sortiert bei ungleicher
   Spielzahl nach Punkt-**Quotient**, „falsch" aussehende Reihenfolgen sind korrekt.

4. **Meldelisten auffrischen** (optional, z. B. monatlich — LKs ändern sich):
   ```
   npm run crawl:meldelisten
   ```
   Cache (`scripts/.meldelisten-cache.json`) vorher löschen, wenn wirklich alles
   neu geholt werden soll; sonst werden gecachte Mannschaften übersprungen.

5. **Konsistenz prüfen** (Pflicht vor jedem Commit):
   ```
   npm run check                  # laufende Saison
   npm run check -- --all         # alle Saisons nacheinander
   node scripts/check-names.mjs   # Berichts-Spieler <-> Meldelisten
   ```
   Im Winter-Layout prüft `check` zusätzlich, dass **Begegnung und Kreuztabelle
   dasselbe Ergebnis tragen** (zwei Quellen, die auseinanderlaufen können) und dass
   Matchpunkte/Sätze zum Format der Runde passen (6 Matches → höchstens 6:0 und
   18 Sätze). Bekannte, KORREKTE Ausnahmen (nicht „fixen"): siehe unten.

6. **Bauen + im Browser prüfen** (nicht nur tsc!):
   ```
   VITE_SUPABASE_URL=https://stub.supabase.co VITE_SUPABASE_ANON_KEY=stub npm run build
   npx vite preview --port 4517   # dann headless Chrome: Tabelle -> Liga -> Zelle/Mannschaft
   ```
   Ohne die Stub-Env crasht die App („supabaseUrl is required", weiße Seite) —
   die echte `.env` liegt nur im Haupt-Checkout, CI hat die Secrets.

7. **Deployen** (niemals direkt auf `main` pushen):
   ```
   git checkout -b <branch> origin/main   # Daten eintragen, committen
   git push -u origin <branch>
   gh pr create ... && gh pr merge <nr> --squash   # Merge löst den Deploy aus
   ```
   Danach warten bis der Actions-Run auf `main` grün ist und das **Live-Bundle
   verifizieren** — grüner Workflow allein reicht nicht:
   ```
   curl -s https://tcp-spielplan.de/ | grep -oE 'assets/index-[^"]+\.js'
   curl -s https://tcp-spielplan.de/assets/<bundle> | grep -c "<neuer Datenschnipsel>"
   ```

## Datenquellen — was funktioniert, was nicht

| Quelle | Status | Zweck |
|---|---|---|
| `nuDokument?dokument=ScheduleReportFOP&group=<id>` | ✅ curl | Tabelle + Spielplan einer Gruppe (Schnell-Check) |
| `nuDokument?dokument=MeetingReportFOP&meeting=<id>` | ✅ curl | Spielbericht-PDF einer Begegnung |
| `nuDokument?dokument=ResultReportFOP&type=full&club=22844&season=<id>` | ✅ curl | vereinsweite Tabellen (deckt Mixed NICHT ab; Saison-ID wechselt, Sommer 2026 = 18103) |
| nuLiga-HTML-Seiten (`groupPage` etc.) | ❌ | leiten aufs btv.de-Portal um |
| btv.de-Widget **direkt** (`widget.btv.de/btvgroup`) | ❌ | zeigt nur ein Fehlerbild |
| btv.de-Widget **über die einbettende Seite** (`btv.de/de/spielbetrieb/tabelle-spielplan.html?groupid=<id>`) per Puppeteer | ✅ | Spielberichte inkl. Meeting-IDs, Meldelisten, aktuelle Tabelle |

Basis-Pfad der PDFs: `https://btv.liga.nu/cgi-bin/WebObjects/nuLigaDokumentTENDE.woa/wa/nuDokument?...`

## Alle Gruppen (Sommer 2026) — auch in `scripts/seasons.mjs`

| Konkurrenz | leagueName (exakt!) | groupid | Format |
|---|---|---|---|
| H00 | Südliga 2 · Gr. 023 | 2215909 | 9 Matches |
| H30 | Südliga 4 (4er) · Gr. 292 | 2216174 | 6 |
| H40 | Regionalliga Süd-Ost · Gr. 004 | 2144934 | 9 |
| H40 II | Landesliga 2 · Gr. 043 SU | 2165598 | 9 |
| H40 III | Südliga 2 · Gr. 315 | 2219941 | 9 |
| H50 | Regionalliga Süd-Ost · Gr. 005 | 2139346 | 9 |
| H50 II | Südliga 1 · Gr. 355 | 2224597 | 9 |
| H50 III | Südliga 3 · Gr. 379 | 2216258 | 9 |
| H60 | Südliga 1 · Gr. 404 | 2224594 | 9 |
| D00 | Südliga 2 · Gr. 160 | 2216042 | 9 |
| D40 | Südliga 1 · Gr. 441 | 2216316 | 9 |
| D50 | Landesliga 1 (4er) · Gr. 103 SU | 2165662 | 6 |
| D50 II | Südliga 2 (4er) · Gr. 488 | 2216367 | 6 |
| **Mixed** | Spielebene B · Gr. 074 | **2244334** | 6 (2H+2D-Einzel, 2 Mixed-Doppel) |
| Juniorinnen 18 | Südliga 3 · Gr. 686 | 2216568 | 6 |
| Knaben 15 | Südliga 4 · Gr. 596 | 2216473 | 6 |
| Knaben 15 II | Südliga 5 · Gr. 638 | 2216513 | 6 |
| Midcourt U10 | Südliga 1 · Gr. 870 | 2219939 | 6, KEINE Meldelisten in nuLiga |

Neue groupids muss niemand mehr suchen:

```
npm run season:new -- --discover-only
```

holt sie aus dem Vereins-Widget (klickt „MEHR LADEN" bis zum Ende, fängt die
`window.open`-URLs der „Tabelle/Spielplan [PDF]"-Elemente ab) und listet Mannschaft
für Mannschaft mit `groupid`.

## Winterrunde 2026/27 (die aktuell laufende Saison)

Spieltage **10.10.2026 – 20.03.2027**, sieben Mannschaften. Die Gruppen stehen in
`scripts/seasons.mjs`; die Werkzeuge oben greifen ohne Zutun auf diese Saison zu.

| Konkurrenz | leagueName (exakt!) | groupid | teamId |
|---|---|---|---|
| H40 | Bayernliga · Gr. 022 SU | 2253303 | `w27-herren40` |
| H50 | Bayernliga · Gr. 029 SU | 2253304 | `w27-herren50` |
| H30 | Südliga 1 · Gr. 119 | 2257785 | `w27-herren30` |
| H30 II | Südliga 2 · Gr. 129 | 2257803 | `w27-herren30ii` |
| D00 | Südliga 1 · Gr. 082 | 2257743 | `w27-damen` |
| D40 | Südliga 2 · Gr. 200 | 2257871 | `w27-damen40` |
| D50 | Landesliga 1 · Gr. 054 SU | 2253322 | `w27-damen50` |

Besonderheiten gegenüber der Sommerrunde:

1. **Layout `winter`**: Jede Begegnung trägt ihr Ergebnis selbst (`mp`/`sets`/`games`, `status`)
   **und** steht in der Kreuztabelle. `gen:standings` schreibt beides und meldet Abweichungen;
   `npm run check` vergleicht die zwei Quellen.
2. **Format 4 Einzel + 2 Doppel** in allen Winter-Ligen (Blanko-Spielbericht, nu.Dokument 011d):
   höchstens `6:0` Matchpunkte und 18 Sätze. Ein `9:0` wäre ein Lesefehler — `check` schlägt an.
3. **Spielberichte** sind für den Winter noch nicht gecrawlt: die Kreuztabelle zeigt die
   Ergebnisse, der Einzel-/Doppel-Drilldown bleibt leer. Kein Fehler. Wer sie will, crawlt sie
   nach — `gen:spielberichte` führt die Saison-Caches zusammen und schützt die Sommer-Berichte.
4. **Tabellen-Optik vor dem ersten Spieltag**: Steht in einer Liga überall `0:0`, zeigt
   `StandingsView` „*n* Mannschaften" statt „Platz *x*" und lässt die Medaillen weg (die
   BTV-Reihenfolge ist dann nur die Setzliste). Sobald Punkte da sind, kommt die normale
   Darstellung von selbst zurück — nichts umzustellen.
5. **Spielorte**: im PDF sind die Hallennamen abgeschnitten („TC Grün-Weiß Gräfe…"). Vollständig
   stehen sie im btv.de-Widget zwischen den Ergebnis-Spalten und dem Gastverein. Achtung: der
   Spielort kann **wörtlich der Heimverein** sein (Gräfelfing spielt in Gräfelfing) — deshalb den
   Gast aus dem PDF vorgeben und den Spielort als „die andere Zeile" bestimmen, sonst vertauschen
   sich beide. (`new-season.mjs` macht das bereits richtig.)

## Eine neue Saison anlegen

Sobald der BTV die Termine der nächsten Runde veröffentlicht — etwa im April 2027 die Sommerrunde:

```
npm run season:new -- --discover-only                                  # erst ansehen, was gelistet ist
npm run season:new -- --id sommer-27 --label "Sommer 2027" --layout summer
```

Das Skript holt Mannschaften und groupids aus dem Vereins-Widget, zieht je Gruppe den
Spielplan-Report, ergänzt die Spielorte aus dem Widget und schreibt eine fertige
`src/data/<id>.ts` (Teams, Kategorien, Tabellen auf 0:0, Begegnungen auf `"open"`,
Monate und Monatsfarben). Am Ende druckt es die Schnipsel für die fünf Stellen, die
noch von Hand dazukommen:

1. `scripts/seasons.mjs` — Saison-Block **nach vorn** (fertig ausgegeben, inkl. groupids)
2. `src/types.ts` — `SeasonId` erweitern
3. `src/data/seasons.ts` — Eintrag nach vorn (`SEASONS[0]` ist die Vorauswahl der App)
4. `src/data/season-data.ts` — Registry-Eintrag mit den `<PREFIX>_*`-Konstanten
5. `src/data/team-format.ts` — Format je Konkurrenz (Winterrunde: durchgehend `"4er"`)

Danach `npm run season` — steht die neue Runde vorn und wird als aktiv erkannt, greifen
Crawler, Generator und Prüfskript ab sofort auf sie zu. **Prüfen**, was das Skript nicht
wissen kann: Das Widget nennt zweite Mannschaften oft nur „Herren 30" — das Skript leitet
die römische Ziffer aus dem Vereinsnamen ab („TC Pliening II") und meldet, wenn ein Name
doppelt bleibt. Ebenso `layout` (Sommer = Ergebnisse nur in der Kreuztabelle) und
`teamSize`/`mode` je Gruppe gegen den Blanko-Spielbericht gegenlesen.

## Wo die Daten liegen

- `src/data/spielberichte-crawled.ts` — **generiert**, alle 407 Berichte (nur Sommer). Nie von Hand editieren.
- `src/data/spielberichte.ts` — nur noch Lookup (`getSpielbericht`, `getAllSpielberichte`).
- `src/data/meldelisten.ts` — **generiert**, 132 Mannschaften / 4.238 Spieler (nur Sommer).
- `src/data/summer-2026.ts` — Tabellen + Kreuztabellen (per `generate-standings.mjs` aktualisierbar) und
  `SUMMER_STANDINGS_STAND` (Anzeige „BTV-Stand" in der App; bei Hand-Änderungen selbst setzen).
- `src/data/matches.ts` — Spielplan-Termine **Sommer**; liefert zusammen mit der Kreuztabelle die
  Ergebnisse im Spielplan. Verlegte Begegnungen auf das Datum aus dem Spielbericht setzen.
- `src/data/winter-2627.ts` — die **laufende Winterrunde** komplett in einer Datei: Teams, Kategorien,
  Spielplan (mit `venue`/`status`), Tabellen, `WINTER_2627_STANDINGS_STAND`, Monatsfarben.
  **Handgepflegt**, siehe Winter-Abschnitt oben. `winter-2526.ts` ist derselbe Aufbau als Archiv.
- `src/data/season-data.ts` — die **Saison-Registry**: welche Saison welche Teams, Matches, Standings,
  Monate und `supportsPdf` zieht. `App.tsx`/`CalendarDownloads.tsx` lesen nur daraus. Eine neue Saison
  braucht hier einen Eintrag (plus `types.ts`, `seasons.ts`, `team-format.ts`) — Komponenten nicht.
- `scripts/seasons.mjs` — **Saison-Registry der Skripte**: je Saison Layout, Datendatei,
  Konstanten-Präfix, Gruppen und `keepLeagues`, dazu die automatische Erkennung der laufenden
  Runde (`resolveSeason`). Löste `scripts/groups.mjs` ab. Neue Saison = ein Block mehr.
- `scripts/new-season.mjs` — legt eine Saison komplett an (Mannschaften, groupids, Spielplan,
  Spielorte) und nennt die Handgriffe, die danach bleiben.
- Caches (gitignored): `scripts/.spielberichte-cache-<saison>.json` (je Saison eine),
  `scripts/.meldelisten-cache.json`.

## Crawler-Stolperfallen (alle in den Skripten gelöst — nicht „wegoptimieren")

1. **Cookiebot-Banner** hat wechselnde Button-Texte: „Alle ablehnen", „Nur
   notwendige Cookies", „Auswahl erlauben", „OK" — alle Kandidaten durchprobieren.
2. Gespielte Begegnungen erkennt man an `span.gb-status` mit Text **„anzeigen"**
   (klein! CSS macht daraus optisch „ANZEIGEN").
3. **Der geklickte Span wird zu „schliessen"** — deshalb über die DOM-`id`
   klicken, nie über den Index einer nach Text gefilterten Liste (Versatz um 1).
   Das Modal (`.z-window`, embedded, ohne Close-Button) schließt derselbe Span.
4. Die **Modal-Reihenfolge entspricht nicht der Spielplan-Reihenfolge** — die
   Paarung aus dem Modal-Inhalt lesen (Mannschaftsnamen in Großbuchstaben) und
   gegen den Spielplan mappen.
5. „Druckversion [PDF]" im Modal liefert per abgefangenem `window.open` die
   **Meeting-ID** (auch für Mixed, deren PDFs nur „Spielbericht (Nr. n)" nennen).
6. **Spielort-Zeilen** („TC Kirchheim bei Mü.") stehen mal vor, mal hinter dem
   Gastverein → Gast über die Vereinsliste der Tabelle bestimmen; Vereinslinks
   nur aus der Tabelle oben nehmen, nicht aus dem Spielplan.
7. Meldelisten: **Ränge von II./III. Mannschaften starten nicht bei 1**
   (Feldkirchen II ab 7, Aschheim III ab 13) und dürfen **Lücken** haben
   (abgemeldete Spieler) — nur auf aufsteigend prüfen; Rücksprung = Fehler.
8. Der **ZK-Pager bleibt beim Mannschaftswechsel stehen** → vor dem Auslesen auf
   Seite 1 zurücksetzen (`a.z-paging-first`); blättern mit `a.z-paging-next`;
   15 Zeilen pro Seite.
9. Die **Nations-Spalte fehlt** in manchen Portraits komplett (Gr. 004) → optional parsen.
10. Nach Fehlern ist der iframe oft **detached** → Seite (notfalls Browser) neu
    aufbauen und den Frame neu holen.
11. Vereins-Aliasse gelten **je Liga**: „VfB Forstinning (zurückgezogen)" nur in
    Gr. 315 — in Gr. 379 spielt derselbe Verein normal.

## Datenkonventionen (der Parser hält sie ein)

- Einzel: `"Nachname, Vorname [NAT≠GER] (Meldeposition, LKx,x)"`; `GER` weglassen,
  andere Kürzel (auch `HKG*`-Stern) behalten. Doppel ohne LK/Position.
- **„(w.o.)" muss VOR die Klammer**: `"Name (w.o.) (23, LK7,2)"` — sonst erkennt
  `src/utils/spielbericht.ts` Position und LK nicht.
- Positionen: Einzel 1–6, Doppel 7–9 (4er/6-Match-Ligen: Einzel 1–4, Doppel 7–8).
- 3. Satz-Eintrag = Match-Tiebreak. Unbenannte Spieler → `"—"` / `"— (w.o.)"`.
- **Endstand = offizielles Spielplan-Ergebnis**, auch wenn die Matchsieg-Summe
  abweicht (Strafwertungen, z. B. WO §60.1 — Generator meldet das als HINWEIS).
- Sanity je Bericht: Σ Matchsiege = Endstand; Kreuztabellen-Zelle = Matchpunkte;
  Tabellen-Delta = Sätze/Spiele des neuen Berichts.

## Bekannte, KORREKTE Ausnahmen (nicht reparieren!)

- Gr. 315: Markt Schwaben–Forstinning 6:3 **ohne Bericht** (Forstinning
  zurückgezogen, nuLiga liefert den Bericht nicht mehr).
- Midcourt U10 (Gr. 870): keine Meldelisten → klassische Spieler-Ansicht.
- ~40 Spieler-Nennungen ohne Meldelisten-Eintrag = **Ersatzspieler** aus anderen
  Mannschaften des Vereins → erscheinen unter „Weitere Einsätze".

## Rahmenbedingungen

- Repo: `tmvibecoder/tcp-spielplan`, live https://tcp-spielplan.de,
  Deploy = GitHub Actions bei Push auf `main`, ausgelöst durch PR-Squash-Merge.
  **Stehende Freigabe (07.09.2026): ohne Rückfrage mergen und live nehmen**, danach das
  ausgelieferte Bundle verifizieren (Tabellen-Texte stecken in lazy geladenen Chunks —
  dafür die Live-Seite im Browser prüfen).
- Immer in einem **frischen Worktree von `origin/main`** arbeiten und `git fetch` vorschalten.
  Der Haupt-Checkout wurde am 09.09.2026 auf `origin/main` nachgezogen; er hing 61 Commits zurück und
  trug einen uncommitteten WIP-Stand vom April 2026, der jeden Pull blockierte. Der Stand liegt
  gesichert auf `wip/score-entry-april-2026` (überholt, nicht zum Mergen). Läuft der Checkout wieder
  voll, **nichts verwerfen** — erst auf einem Branch sichern, dann `git merge --ff-only origin/main`.
- Im Worktree fehlt `node_modules` → einmal `npm install` (der Haupt-Checkout hat kein
  `puppeteer-core`, Browser-Crawls scheitern dort sonst mit `ERR_MODULE_NOT_FOUND`). Eigene
  Hilfsskripte müssen **im Repo** liegen, sonst finden sie `node_modules` nicht.
- Browser-Crawls brauchen Google Chrome
  (`/Applications/Google Chrome.app/...`, überschreibbar via `CHROME_PATH`)
  und `puppeteer-core` (devDependency, `npm install` reicht).
- Ausführliche Doku im Repo: **README** („Daten pflegen", „Meldelisten",
  „Spielberichte selbst crawlen", „nuLiga-Zugriff", „Deployment") und **AGENTS.md**
  (`CLAUDE.md` ist seit #46 nur noch ein Import darauf).
