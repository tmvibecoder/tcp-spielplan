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
   Spieltage 22.08., 30.08., 06.09., 19.09., 26.09., 27.09.2026.

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
   node scripts/generate-standings.mjs --write    # schreiben
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
`window.open` überschreiben → „Tabelle/Spielplan [PDF]" klicken → URL enthält `group=<id>`.

## Wo die Daten liegen

- `src/data/spielberichte-crawled.ts` — **generiert**, alle 402 Berichte. Nie von Hand editieren.
- `src/data/spielberichte.ts` — nur noch Lookup (`getSpielbericht`, `getAllSpielberichte`).
- `src/data/meldelisten.ts` — **generiert**, 132 Mannschaften / 4.238 Spieler.
- `src/data/summer-2026.ts` — Tabellen + Kreuztabellen (per `generate-standings.mjs` aktualisierbar).
- `scripts/groups.mjs` — zentrale Gruppenliste für alle Skripte.
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
- Gr. 043 SU: Schloßberg–Grün-Gold Tabelle **1:3**, gespielt 2:7 (BTV-Streichung).
- Midcourt U10 (Gr. 870): keine Meldelisten → klassische Spieler-Ansicht.
- ~40 Spieler-Nennungen ohne Meldelisten-Eintrag = **Ersatzspieler** aus anderen
  Mannschaften des Vereins → erscheinen unter „Weitere Einsätze".

## Rahmenbedingungen

- Repo: `tmvibecoder/tcp-spielplan`, live https://tcp-spielplan.de,
  Deploy = GitHub Actions bei Push auf `main`, ausgelöst durch PR-Squash-Merge.
- Immer in einem **frischen Worktree von `origin/main`** arbeiten (der lokale
  Haupt-Checkout hängt oft zurück und hat lokale Änderungen).
- Browser-Crawls brauchen Google Chrome
  (`/Applications/Google Chrome.app/...`, überschreibbar via `CHROME_PATH`)
  und `puppeteer-core` (devDependency, `npm install` reicht).
- Ausführliche Doku im Repo: **README** („Daten pflegen", „Meldelisten",
  „Spielberichte selbst crawlen", „nuLiga-Zugriff", „Deployment") und **CLAUDE.md**.
