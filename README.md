# TC Pliening – Spielplan & Tabellen

React/Vite-App für Spielplan, Tabellen und Statistik des TC Pliening (Sommer-Saison 2026). Live: https://tcp-spielplan.de

## Features

- **Spielplan** – kommende/vergangene Begegnungen; springt beim Laden automatisch ans nächste Wochenende.
- **Konkurrenz-Filter** – einzelne Mannschaften/Konkurrenzen ein-/ausblenden, `Nur Heim`, `Alle aus`/`Alle an` und **gespeicherte Auswahl** (seit 2026-06-22) – siehe unten.
- **Tabellen** je Konkurrenz mit **Kreuztabelle**. Auf ein Ergebnis in der Kreuztabelle tippen → **Spielbericht** (Einzel/Doppel) der Begegnung.
- **Spieler-Statistik je Mannschaft** (seit 2026-06-18) – siehe unten.

### Konkurrenz-Filter & gespeicherte Auswahl

Über dem Spielplan stehen die Konkurrenzen nach Kategorie (HERREN/DAMEN/JUGEND); ein Klick blendet eine Mannschaft ein/aus, ein Klick auf die Kategorie-Überschrift schaltet die ganze Kategorie um. In der unteren Zeile:

- **`Alle aus` / `Alle an`** – ein Toggle-Button, der sich nach dem Zustand richtet: solange **noch eine** Konkurrenz aktiv ist, heißt er `Alle aus` (Klick → alle ab); ist **keine** aktiv, heißt er `Alle an` (Klick → alle ein). Wirkt nur auf die **gerade angezeigte Saison** (Sommer **oder** Winter), nicht auf beide.
- **`Nur Heim`** – blendet Auswärtsbegegnungen aus (saisonübergreifender Schalter).

**Auswahl speichern:** Im **⋯-Menü** (oben rechts, neben „PDF exportieren") liegt **`Auswahl speichern`**. Das schreibt die aktuelle Auswahl **explizit** (nicht automatisch) in `localStorage` und zeigt kurz „✓ Gespeichert". Beim nächsten Seitenaufruf wird sie automatisch geladen – ohne erneutes Einstellen.

**Code-Landkarte:**
- `src/components/TeamFilter.tsx` – Filter-UI; `Alle aus`/`Alle an` leitet sich aus `anyActive` über alle Kategorie-IDs ab und ruft den Prop `setAllTeams(on)`.
- `src/App.tsx` – Quelle der Wahrheit: getrennte Sets `activeSummerTeams` / `activeWinterTeams` (+ `homeOnly`). `setAllTeams` wirkt auf die aktive Saison. **Persistenz**: `loadPrefs()` einmalig beim Mount (initialisiert die State-Sets), `savePrefs()` schreibt auf Knopfdruck.
- `src/components/Header.tsx` – Menüpunkt `Auswahl speichern` (Prop `onSavePrefs`) inkl. „✓ Gespeichert"-Flash.
- `localStorage`-Key **`tcp-filter-prefs`**, Format `{ "summer": string[], "winter": string[], "homeOnly": boolean }` (Team-IDs der **aktiven** Konkurrenzen, beide Saisons in einem Eintrag). Liegt neben dem separaten Favoriten-Key `tcp-favorites` aus `src/hooks/useFavorites.ts`.

### Spieler-Statistik je Mannschaft

In der **Tabelle** eine **Mannschaftszeile antippen** (›-Pfeil rechts) → es öffnet sich eine Detailseite mit zwei Reitern:

- **Spieler** – jeder Spieler nach **Ø-Position** sortiert (Durchschnitt der gespielten Position; `1` = oben/stärkste Position), mit eigener **LK**. Aufklappen zeigt pro Einsatz: Gegner **inkl. dessen LK**, Position, Satz-Ergebnis und **SIEG/NIEDERL.** Marker **▲ LK-Sieg** = gegen besseren (niedrigeren) LK gewonnen, **▼** = gegen schwächeren LK verloren.
- **Doppel** – Paarungen separat (Schlüssel = sortierte Nachnamen). Ohne LK, da nuLiga für Doppel keine LK ausweist.

**Datenquelle & Funktionsweise:** Alles wird **live aus den echten nuLiga-Spielberichten** in `src/data/spielberichte.ts` aggregiert – es gibt **keine Beispieldaten**. Funktioniert für **jede** Mannschaft, die in einem Spielbericht vorkommt (auch Gegner), da jeder Bericht beide Aufstellungen enthält. Mannschaften ohne erfassten Spielbericht zeigen einen Hinweis-Leerzustand. Mit Spielberichten gepflegt werden **fünf Konkurrenzen** (Sommer 2026): **H00** (Südliga 2 · Gr. 023), **H30** (Südliga 4 (4er) · Gr. 292), **H40** (Regionalliga Süd-Ost · Gr. 004), **H40 III** (Südliga 2 · Gr. 315) und **D00** (Südliga 2 · Gr. 160).

**Code-Landkarte:**
- `src/data/player-stats.ts` – Aggregation: `getTeamStats(leagueName, club)`, `aggregatePlayers`, `aggregateDoubles`, `parseLk`.
- `src/components/TeamStatsDetail.tsx` – die Detailseite (Reiter, Drilldown, LK-Pillen).
- `src/components/StandingsView.tsx` – Tabellenzeile klickbar (`selectedClub`-State); koexistiert mit der Spielbericht-Ansicht der Kreuztabelle.
- Spieler-Strings haben das Format `"Nachname, Vorname (Meldeposition, LKxx,x)"` und werden von `src/utils/spielbericht.ts` (`parsePlayer`/`parseSide`) geparst. LK-Format `"LK14,3"` (Komma als Dezimaltrenner).

---

## Daten pflegen (nuLiga)

Alle Liga-/Spieldaten stammen aus offiziellen **BTV-nuLiga-PDFs** und liegen in zwei Dateien. `club=22844` = TC Pliening; Saison Sommer 2026 = `season=18103` (wechselt je Saison — aktuellen Link von der [Vereinsseite](https://www.btv.de/de/mein-verein/vereinsseite/tc-pliening.html) holen).

> **Zuordnung passiert automatisch aus dem PDF.** Jedes Spielbericht-PDF (MeetingReportFOP) nennt im Kopf **Liga/Gruppe, Termin, beide Mannschaften und Endergebnis** — daraus folgt eindeutig die Ziel-Liga und -Begegnung. Es genügt also, die **PDF-Links zu liefern** (die Konkurrenz muss nicht dazugeschrieben werden). Auch Begegnungen **ohne TC Pliening** werden eingetragen (sie füllen die Kreuztabelle der jeweiligen Liga). Den **Gesamt-Tabellen-Report** (ResultReportFOP, s. u.) holt man sich selbst dazu — er steckt NICHT im einzelnen Spielbericht.

**Datenstand (19.07.2026):** **Gr. 023**, **Gr. 292** und **Gr. 160** sind auf **Saison-Endstand** (PR #26/#28). Gr. 023 und Gr. 160 damit lückenlos (27 bzw. 26 gespielte Begegnungen, alle mit Spielbericht); ungespielt blieben Pliening–Finsing (Gr. 023), Oberpframmern–Putzbrunn (Gr. 292), Fideliopark II–Steinhöring und Jahn–Grün-Gold (Gr. 160) — alle offiziell 0:0. **Noch offen:** Gr. 004 fehlen 6, Gr. 315 fehlen 7 Ergebnisse — diese Tabellen (wie auch die 8 Ligen ohne Spielberichte) stehen auf Stand 29.06.

### Tabellen → `src/data/summer-2026.ts` (`SUMMER_STANDINGS`)

Quelle: **eine** PDF mit allen Ligen, „Ergebnistabellen gesamt":
`https://btv.liga.nu/.../nuDokument?dokument=ResultReportFOP&type=full&club=22844&season=18103`

Pro Liga ein `LeagueStandings`-Objekt; `entries` in **Rang-Reihenfolge**. `crossResults[i]` = Ergebnis der Zeilen-Mannschaft gegen die Mannschaft mit `rank = i+1` (`"***"` = Diagonale, `"0:0"` = noch nicht gespielt → „n.a."); Array-Länge = Mannschaftszahl. Werte **1:1** übernehmen — auch bei zurückgezogenen Teams, wo offizielle Matchpunkte von der Kreuztabelle abweichen. Erfasst sind die 13 Herren-/Damen-Ligen (Jugend bewusst nicht). `ownRank`/`isOwnClub` zeigen auf den TC-Pliening-Eintrag.

### Spielberichte (Kreuztabellen-Detailansicht) → `src/data/spielberichte.ts`

Quelle: **je Begegnung** eine PDF, „MeetingReportFOP":
`https://btv.liga.nu/.../nuDokument?dokument=MeetingReportFOP&meeting=<ID>` (das `etag` im Link ist optional). Pro Begegnung ein `const SB_<meetingID>` über den Helfer `m(...)`, danach in `const ALL` eintragen.

- `league` / `homeClub` / `awayClub` müssen **exakt** den Strings in `summer-2026.ts` entsprechen (Lookup `getSpielbericht` ist richtungsunabhängig — eine Begegnung steht in 2 Spiegel-Zellen der Kreuztabelle).
- Einzel-Spieler: `"Nachname, Vorname [LÄNDERKÜRZEL≠GER] (Meldeposition, LKx,x)"` — die Meldeposition ist die PDF-Spalte „Nr. laut Meldeliste", nicht die laufende Nr.; `GER` weglassen. Doppel: `"Nachname, Vorname / Nachname, Vorname"` ohne LK.
- `position`: Einzel 1–6, Doppel 7–9 (4er-Ligen: Einzel 1–4, Doppel 7–8).
- `sets`: Liste von `[heim, gast]`-Sätzen; ein 3. Eintrag ist der Match-Tiebreak (z. B. `[10, 6]`). Nicht gespielte Sätze weglassen. Walkover → `(w.o.)` am Spielernamen **und** `sets: []`.

### Workflow

PDF(s) ziehen → Daten eintragen → `npm run build` (`tsc -b` + `vite`) → **PR + `gh pr merge`** (löst Deploy aus). Sanity-Checks: Summe der gewonnenen Einzel/Doppel = Endstand der Begegnung; Kreuztabellen-Wert = Mannschafts-Matchpunkte. Nach dem Deploy den live ausgelieferten Bundle-Hash prüfen (siehe „Stolperfalle" unten).

**Fehlende Spiele finden:** aktuellen Gesamt-Report (ResultReportFOP) ziehen und dessen Kreuztabellen gegen `SUMMER_STANDINGS` diffen — Zellen, die bei uns `"0:0"` sind und offiziell ein Ergebnis haben, fehlen. Die **Spieltage** von Fremd-Begegnungen stehen nicht im Gesamt-Report; sie folgen aber eindeutig aus der Rundenlogik (jede Paarung genau 1×, pro Spieltag jedes Team genau 1×) — Vorsicht bei **Nachholspielen** (Beispiel Gr. 292: Finsing–Philathlos, Termin 27.06., erst am 18.07. „abgeschlossen" und damit lange ohne Ergebnis im Report). Der Spielbericht-PDF-Kopf nennt immer den echten Termin.

**Rangfolge verbatim übernehmen**, auch wenn sie „falsch" aussieht: bei ungleicher Spielzahl (ungespielte Begegnungen) sortiert der BTV nach Punkt-**Quotient**, nicht -Summe — z. B. steht in Gr. 292 Finsing (6:2 aus 4) vor Pliening (5:3 aus 4).

### nuLiga-Zugriff: Was funktioniert (und was nicht)

- ✅ **Nur die PDF-Endpoints** (`nuDokument`) sind maschinell erreichbar: `ResultReportFOP` (Gesamt-Tabellen) und `MeetingReportFOP&meeting=<ID>` (Einzelbericht; `etag` optional). Per `curl` laden, als PDF lesen.
- ❌ `btv.liga.nu/...groupPage?...` (HTML-Gruppenseiten) leitet inzwischen generisch auf das btv.de-Portal um — mit beliebigen `championship`-Werten kommt nur die Portal-Startseite.
- ❌ Die btv.de-Seite „Tabelle/Spielplan" (`tabelle-spielplan.html?groupid=<id>`) ist ein iframe auf `widget.btv.de/btvgroup/` — eine **ZK-Java-App**, die headless nicht bootet (Cookiebot-Consent + ZK-Client rendern nicht). Nicht scrapbar; Meeting-IDs fehlender Begegnungen lassen sich daher nicht automatisch ermitteln → **MeetingReportFOP-Links müssen geliefert werden** (aus dem Browser kopiert).

---

## Tooling (Vite-Template-Notizen)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Deployment

Seit 2026-06-17 Auto-Deploy via GitHub Actions (`.github/workflows/deploy.yml`):
Push auf `main` → SSH zu Server web01 → Repo synchronisieren + `npm ci` + `npm run build` (Vite).

- Statische Site: nginx serviert `/var/www/tcp-spielplan.de/dist`, kein pm2/Server-Prozess.
- Repo-Secrets: `SERVER_IP`, `SERVER_USER`, `SSH_PRIVATE_KEY` (gemeinsamer Deploy-Key auf web01).
- Deploy nur via **PR-Merge** auf `main` (kein Direkt-Push).
- Doku-Commits, die NICHT deployen sollen, mit `[skip ci]` in der Commit-Message versehen.

### ⚠️ Stolperfalle „grüner Deploy, aber alter Code" (behoben 2026-06-18)

Der ursprüngliche Workflow lief `git pull origin main && npm install && npm run build && echo …`.
Problem: `npm install` verändert die `package-lock.json`; danach bricht `git pull` mit
„local changes would be overwritten" ab → der **alte** Code wird neu gebaut. Weil der
SSH-Step nur den Exit-Code des **letzten** Befehls (`echo`) auswertet, meldete GitHub Actions
trotzdem **success**. Folge: PR #8 (Spieler-Statistik) war gemergt, CI grün – aber nie live.

**Fix (jetzt im Workflow):**
- `set -euo pipefail` – echte Fehler schlagen rot durch statt still verschluckt zu werden.
- `git fetch origin main && git reset --hard origin/main` – harter Sync; verwirft lokale
  Änderungen. `.env`, `node_modules`, `dist` bleiben unberührt (gitignored).
- `npm ci` statt `npm install` – deterministisch, verändert `package-lock.json` nicht.
- Build-Check (`test -d dist/assets`).

**Lehre:** Grüner Deploy ≠ neuer Code live. Nach einem Deploy den live ausgelieferten
Bundle-Hash prüfen, z. B.:
```bash
curl -s https://tcp-spielplan.de/ | grep -oE 'assets/index-[A-Za-z0-9_]+\.js'
curl -s https://tcp-spielplan.de/assets/index-XXXX.js | grep -c <feature-string>
```

### ⚠️ Stolperfalle „leere Seite im git-worktree" (lokales Testen)

Die Supabase-Zugangsdaten kommen aus `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` und werden
**zur Build-Zeit** ins Bundle eingebettet (`src/lib/supabase.ts` ruft `createClient(...)` schon
beim Modul-Import). Die `.env` ist **gitignored** und wird daher **nicht** in einen frischen
`git worktree` übernommen. Folge: ohne `.env` baut zwar alles, aber `createClient(undefined, …)`
wirft beim Laden → die App rendert eine **leere Seite** (Filter/Spielplan fehlen komplett).

**Vor dem lokalen Browser-Test im Worktree** die `.env` aus dem Haupt-Checkout kopieren und
**neu bauen** (env-Vars stecken im Build, nicht zur Laufzeit):
```bash
cp ../../../.env .env   # vom Worktree aus; Pfad zum Haupt-Repo anpassen
npm run build && npm run preview -- --port 4317
```
Geht es nur um Rendering/Daten (nicht um Live-Scores), reichen auch **Dummy-Werte** statt der echten `.env`:
```bash
VITE_SUPABASE_URL=https://dummy.supabase.co VITE_SUPABASE_ANON_KEY=dummy npm run build
```
Nützliche Selektoren für den Tabellen-Smoke-Test: Liga-Akkordeon = `button` mit Text `Gr. <NNN>`;
Kreuztabellen-Zellen = `button[title$="Spielbericht öffnen"]` (Anzahl = gespielte Begegnungen × 2).
Headless-Browser-Smoke-Test (Chrome via `puppeteer-core`, `npm i --no-save puppeteer-core`,
damit `package.json`/`package-lock.json` unberührt bleiben): prüfen, dass `button`-Elemente
gerendert werden und `localStorage["tcp-filter-prefs"]` nach „Auswahl speichern" gesetzt ist.

**Derselbe Smoke-Test läuft auch direkt gegen die Live-URL** (`https://tcp-spielplan.de/`) —
praktisch zur Nach-Deploy-Kontrolle, ganz ohne lokale `.env`/Build.

**Mobil mitprüfen (die App ist mobil-erst).** Geräte emulieren statt nur Desktop-Viewport:
`page.setUserAgent(<iPhone-UA>)` + `page.setViewport({ width, height, isMobile: true, hasTouch: true })`
und mit **`elementHandle.tap()` statt `.click()`** interagieren (echte Touch-Events; deckt z. B.
das ⋯-Menü-Öffnen ab). Sinnvolle Viewports: iPhone 13 `390×844` und iPhone SE `375×667`
(kleinster gängiger Screen). Zusätzlich auf **horizontalen Overflow** prüfen
(`document.documentElement.scrollWidth > clientWidth` muss `false` sein).
