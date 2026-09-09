# Skill-Vorlage: BTV-Ergebnisse prüfen und auf tcp-spielplan.de nachziehen

Diese Datei fasst alle Erkenntnisse aus der Session vom 15./16.08.2026 zusammen
(PRs #37–#43). Sie ist als Grundlage gedacht, um in der Claude-App einen Skill zu
bauen, der auf Zuruf **alle Mannschaften aller Konkurrenzen auf neue Ergebnisse
prüft und sie in tcp-spielplan.de einträgt** (Spielberichte, Tabellen,
Meldelisten — bis hin zum Live-Deploy).

---

## Was der Skill tun soll (Kurzfassung für den Skill-Prompt)

> Arbeite im Repo `tmvibecoder/tcp-spielplan`
> (lokal `/Users/thomasmiler/Claude/Projects/tcp-spielplan`, in einem frischen
> Worktree von `origin/main`). Prüfe alle Gruppen aus `scripts/groups.mjs` auf
> neue Ergebnisse, crawle fehlende Spielberichte, aktualisiere Tabellen und ggf.
> Meldelisten, prüfe die Konsistenz, baue, verifiziere im Browser und deploye
> per PR + Squash-Merge. Verifiziere danach das Live-Bundle.

**Erst klären, welche Saison gemeint ist.** Die Schritte 1–7 unten beschreiben die **Sommerrunde**.
Läuft gerade die **Winterrunde** (10.10.2026 – 20.03.2027), gilt der eigene Abschnitt
„Winterrunde 2026/27" weiter unten: andere Gruppen, andere Zieldatei, **kein Generator**.

## Ablauf Schritt für Schritt

1. **Schnell-Check, ob es überhaupt Neues gibt** (billig, ohne Browser):
   für jede Gruppe den Gruppen-Report ziehen und mit dem Repo-Stand vergleichen —
   ```
   curl -sL -A "Mozilla/5.0" "https://btv.liga.nu/cgi-bin/WebObjects/nuLigaDokumentTENDE.woa/wa/nuDokument?dokument=ScheduleReportFOP&group=<groupid>"
   ```
   Das PDF („Tabelle und Spielplan", nu.Dokument 013) zeigt jede Begegnung mit
   Ergebnis. Neue Ergebnisse = Zellen, die im Repo (`src/data/summer-2026.ts`)
   noch `"0:0"` sind. `-L` ist Pflicht (Redirect hängt das `etag` an).
   Während der Sommerpause ändert sich nur noch die **Mixed-Runde (Gr. 074)**:
   Spieltage 22.08., 30.08., 06.09., 19.09., 26.09., 27.09.2026 — für den TC Pliening seit dem
   06.09.2026 durch, offen bleiben nur Begegnungen **ohne** Pliening. **Nach dem 27.09.2026 ist die
   Sommerrunde fertig**; ab dem 10.10.2026 gilt der Winter-Abschnitt weiter unten.

2. **Spielberichte crawlen** (nur nötig, wenn Schritt 1 Neues zeigt):
   ```
   npm run crawl:spielberichte -- <groupid> --force   # nur die betroffene Gruppe
   npm run gen:spielberichte                          # Cache -> src/data/spielberichte-crawled.ts
   ```
   `--force` verwirft den Cache der Gruppe (sonst kommt der alte Stand zurück).
   Kompletter Neu-Crawl aller 18 Gruppen dauert ~45 min; eine Gruppe wenige Minuten.

3. **Tabellen nachziehen**:
   ```
   node scripts/generate-standings.mjs            # Diff ansehen
   node scripts/generate-standings.mjs --write    # schreiben (setzt auch SUMMER_STANDINGS_STAND)
   ```
   Achtung: Gr. 043 SU und Gr. 315 stehen in `KEEP` und bleiben handgepflegt
   (zurückgezogene Mannschaften, offizielle Tabelle weicht bewusst ab).
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
   node scripts/check-data.mjs    # Tabellen <-> Berichte <-> Meldelisten
   node scripts/check-names.mjs   # Berichts-Spieler <-> Meldelisten
   ```
   Bekannte, KORREKTE Ausnahmen (nicht „fixen"): siehe unten.

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

## Alle Gruppen (Sommer 2026) — auch in `scripts/groups.mjs`

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

Neue groupid finden: Vereinsseite btv.de → iframe `btvteams/?clubnr=02467` →
**so oft „MEHR LADEN" klicken, bis der Button verschwindet** (sonst fehlen Mannschaften) →
`window.open` überschreiben → „Tabelle/Spielplan [PDF]" klicken → URL enthält `group=<id>`.

## Winterrunde 2026/27 — der Ablauf ist ein anderer

**Ab dem 10.10.2026 laufen die Winter-Spiele** (bis 20.03.2027). Die Sommer-Werkzeuge greifen dort
**nicht**: `GROUPS`, `generate-standings.mjs` und `check-data.mjs` zielen alle auf die Sommer-Saison.
Für den Winter gilt:

| Konkurrenz | leagueName (exakt!) | groupid | teamId |
|---|---|---|---|
| H40 | Bayernliga · Gr. 022 SU | 2253303 | `w27-herren40` |
| H50 | Bayernliga · Gr. 029 SU | 2253304 | `w27-herren50` |
| H30 | Südliga 1 · Gr. 119 | 2257785 | `w27-herren30` |
| H30 II | Südliga 2 · Gr. 129 | 2257803 | `w27-herren30ii` |
| D00 | Südliga 1 · Gr. 082 | 2257743 | `w27-damen` |
| D40 | Südliga 2 · Gr. 200 | 2257871 | `w27-damen40` |
| D50 | Landesliga 1 · Gr. 054 SU | 2253322 | `w27-damen50` |

Dieselbe Liste steht als `WINTER_2627_GROUPS` in `scripts/groups.mjs` — **bewusst getrennt von
`GROUPS`**, weil `gen:spielberichte` die Sommer-Datei komplett aus dem Cache neu schreibt.

1. **Schnell-Check** wie im Sommer: `ScheduleReportFOP&group=<groupid>` per `curl -L` ziehen,
   `pdftotext -layout` und gegen `src/data/winter-2627.ts` vergleichen.
2. **Eintragen von Hand** — für den Winter gibt es **keinen Generator**. Zwei Stellen je Begegnung:
   - in `WINTER_2627_MATCHES` das betroffene Match: `mp`, `sets`, `games` (alle **Heim:Gast**) füllen
     und `status` von `"open"` auf `"played"` setzen. Bei Verlegung `date`/`time`/`day` mitziehen.
   - in `WINTER_2627_STANDINGS` die Liga: `points`/`matchPoints`/`sets` je Zeile und die beiden
     Spiegel-Zellen der Kreuztabelle (`crossResults`) — Rangfolge **verbatim** aus dem PDF.
   - `WINTER_2627_STANDINGS_STAND` auf das Abgleich-Datum setzen (kein Skript tut das).
3. **Format 4 Einzel + 2 Doppel** in allen Winter-Ligen (Blanko-Spielbericht, nu.Dokument 011d):
   höchstens `6:0` Matchpunkte und `12:0` Sätze. Ein `9:0` wäre ein Lesefehler.
4. **Spielberichte**: `spielberichte-crawled.ts` enthält nur die Sommer-Saison. Winter-Berichte
   müssten erst dazugecrawlt werden — der Generator würde die Datei sonst überschreiben. Solange das
   nicht eingerichtet ist, bleibt der Winter **ohne** Einzel-/Doppel-Ansicht; die Kreuztabelle zeigt
   die Ergebnisse, der Drilldown ist leer. Das ist kein Fehler.
5. **Tabellen-Optik vor dem ersten Spieltag**: Steht in einer Liga überall `0:0`, zeigt
   `StandingsView` „*n* Mannschaften" statt „Platz *x*" und lässt die Medaillen weg (die
   BTV-Reihenfolge ist dann nur die Setzliste). Sobald die ersten Punkte eingetragen sind, erscheint
   die normale Darstellung von selbst — nichts umzustellen.
6. **Spielorte**: im PDF sind die Hallennamen abgeschnitten („TC Grün-Weiß Gräfe…"). Vollständig
   stehen sie im btv.de-Widget zwischen den Ergebnis-Spalten und dem Gastverein. Achtung: der
   Spielort kann **wörtlich der Heimverein** sein (Gräfelfing spielt in Gräfelfing) — deshalb den
   Gast aus dem PDF vorgeben und den Spielort als „die andere Zeile" bestimmen, sonst vertauschen
   sich beide.
7. **`check-data.mjs` prüft den Winter nicht** — die Zahlen dort (816/814/0, 407 Berichte) dürfen
   sich durch Winter-Änderungen **nicht** bewegen. Tun sie es doch, wurde versehentlich an den
   Sommer-Daten gedreht.

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
- `scripts/groups.mjs` — zentrale Gruppenliste: `GROUPS` (Sommer) und `WINTER_2627_GROUPS` (Winter).
- Caches (gitignored): `scripts/.spielberichte-cache.json`, `scripts/.meldelisten-cache.json`.

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
