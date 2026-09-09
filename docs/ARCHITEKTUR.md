# Architektur — wie diese App funktioniert

> Für Agenten und neue Mitarbeitende, die das Projekt zum ersten Mal sehen.
> Diese Seite erklärt **das Ganze**: was die App ist, woher die Daten kommen,
> wie sie durch den Code fließen und was beim Bauen und Ausliefern passiert.
> Begriffe wie *Konkurrenz*, *Kreuztabelle*, *Meldeliste* oder *LK* stehen im
> **[Glossar](GLOSSAR.md)**. Konkrete Arbeitsaufträge stehen in
> **[AUFGABEN.md](AUFGABEN.md)**.

---

## 1. Was die App ist — in drei Sätzen

`tcp-spielplan` ist die inoffizielle Begleit-App zum Ligabetrieb des Tennisvereins
**TC Pliening**. Sie zeigt den **Spielplan** aller Vereinsmannschaften, die
**Tabellen** ihrer Ligen samt Kreuztabelle, die **Spielberichte** (jedes einzelne
Einzel und Doppel) und daraus abgeleitet eine **Spieler-Statistik**. Die Daten stammen
vom Bayerischen Tennis-Verband (BTV) und werden **vor dem Build** in TypeScript-Dateien
eingefroren — die ausgelieferte Seite ist reines statisches HTML/JS.

Live: <https://tcp-spielplan.de>

**Wichtig für das Verständnis:** Es gibt **kein eigenes Backend**. Kein Server, keine
eigene API, keine Datenbank im klassischen Sinn. Die gesamte Liga-Datenlage liegt als
eingecheckter TypeScript-Code in `src/data/`. Eine Datenänderung ist ein Commit, kein
Datenbank-Update.

Die einzige Ausnahme ist die **Live-Ergebnis-Eingabe** (Abschnitt 8): sie spricht zur
Laufzeit eine Supabase-Instanz an.

---

## 2. Technischer Stack

| Bereich | Wahl | Anmerkung |
|---|---|---|
| Build | **Vite 8** | `npm run build` = `tsc -b && vite build` |
| UI | **React 19** + TypeScript 5.9 | Funktionskomponenten, Hooks, **kein Router** |
| Styling | **Tailwind CSS 4** (`@tailwindcss/vite`) | keine eigene CSS-Datei außer `src/index.css` |
| Live-Daten | `@supabase/supabase-js` | nur für Live-Zwischenstände |
| Werkzeuge | Node-Skripte (`.mjs`) + `puppeteer-core` | Crawler und Generatoren, laufen **nie** im Browser |
| Hosting | nginx auf einem Hetzner-Server | statisches `dist/`, kein Node-Prozess |
| CI/CD | GitHub Actions | Push auf `main` → SSH → Build auf dem Server |

**Es gibt keine automatisierten Tests** (kein Vitest, kein Jest, keine `*.test.ts`).
Die Qualitätssicherung läuft über vier andere Wege — siehe Abschnitt 9.

---

## 3. Der Datenfluss — das zentrale Bild

```
   ┌──────────────────────────────────────────────────────────────┐
   │  BTV / nuLiga  (die offizielle Quelle, extern)               │
   │  • PDF-Reports:  btv.liga.nu/…/nuDokument?dokument=…         │
   │  • btv.de-Widget (ZK-Java-App) mit den Spielberichten        │
   └───────────────────────────┬──────────────────────────────────┘
                               │  Crawl (Puppeteer) bzw. curl
                               ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  scripts/*.mjs   —   Crawler + Generatoren                   │
   │  scripts/seasons.mjs = Registry: welche Saison, welche       │
   │                        Gruppen, welches Layout               │
   │  Zwischenlager: scripts/.spielberichte-cache-<saison>.json   │
   │                 scripts/.meldelisten-cache.json (gitignored) │
   └───────────────────────────┬──────────────────────────────────┘
                               │  schreibt TypeScript
                               ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  src/data/*.ts   —   die eingecheckte Wahrheit               │
   │  winter-2627.ts · summer-2026.ts · winter-2526.ts            │
   │  matches.ts · spielberichte-crawled.ts · meldelisten.ts …    │
   │                                                              │
   │  src/data/season-data.ts = Registry: was zieht eine Saison?  │
   └───────────────────────────┬──────────────────────────────────┘
                               │  import (zur Build-Zeit)
                               ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  React-Komponenten  →  vite build  →  dist/                  │
   └───────────────────────────┬──────────────────────────────────┘
                               │  GitHub Action bei Push auf main
                               ▼
                    nginx  →  https://tcp-spielplan.de
```

Dazu **quer** dazu (nur ein kleiner Teil der App):

```
   Browser  ⇄  Supabase (match_scores / individual_matches)
            Live-Zwischenstände während einer laufenden Begegnung
```

**Die wichtigste Konsequenz:** Wer Liga-Daten ändern will, ändert **nicht die App**,
sondern lässt ein Skript laufen, das `src/data/…` neu schreibt — und committet das
Ergebnis. Wer die Darstellung ändern will, fasst `src/components/…` an und rührt
`src/data/` nicht an.

---

## 4. Verzeichnisbaum mit Zuständigkeiten

```
tcp-spielplan/
├── AGENTS.md                 ← Einstieg für Agenten: Regeln + Leseliste (ZUERST LESEN)
├── CLAUDE.md                 ← enthält nur „@AGENTS.md" (Import für Claude Code)
├── README.md                 ← Nachschlagewerk: Features, Datenpflege, Deployment
├── docs/
│   ├── ARCHITEKTUR.md        ← diese Datei
│   ├── GLOSSAR.md            ← Tennis- und BTV-Begriffe
│   ├── AUFGABEN.md           ← Rezepte für die typischen Arbeitsaufträge
│   └── SKILL-VORLAGE-ergebnisse-nachziehen.md   ← Prompt-Vorlage für den Ergebnis-Abgleich
│
├── src/
│   ├── main.tsx              ← Einstiegspunkt (React-Root)
│   ├── App.tsx               ← Zustandshalter: Saison, Reiter, Filter, Persistenz
│   ├── types.ts              ← ALLE Typen des Projekts an einer Stelle
│   ├── index.css             ← Tailwind-Import + wenige globale Regeln
│   │
│   ├── data/                 ← die eingecheckten Liga-Daten (Abschnitt 6)
│   ├── components/           ← die Oberfläche (Abschnitt 7)
│   ├── hooks/                ← useLiveScores (Supabase), useFavorites (localStorage)
│   ├── lib/supabase.ts       ← Supabase-Client, wird beim Modul-Import erzeugt (!)
│   └── utils/                ← date-helpers, ics-export, pdf-export,
│                               score-helpers, spielbericht (Parser fürs Anzeigen)
│
├── scripts/                  ← Node-Werkzeuge (Abschnitt 10)
├── .github/workflows/deploy.yml
├── supabase-setup.sql        ← Schema der beiden Live-Score-Tabellen
└── public/, index.html, vite.config.ts, eslint.config.js, tsconfig*.json
```

---

## 5. Das Datenmodell (`src/types.ts`)

Alle Typen stehen in **einer** Datei. Wer die kennt, kennt das Projekt.

### Spielplan

| Typ | Bedeutung |
|---|---|
| `Team` | **Eine Mannschaft des TC Pliening** (im Projekt „Konkurrenz" genannt), z. B. „Herren 40". Felder: `id`, `label`, `shortLabel`, `league`, `color`, `emoji`. **Die `id` ist der Schlüssel, der überall wiederkehrt** — Filter, `team-format.ts`, `localStorage`. |
| `Match` | Eine **Begegnung** im Spielplan: `teamId`, `date` (`YYYY-MM-DD`), `time`, `day`, `home`, `away`, `isHome`. Enthält **kein** Ergebnis. |
| `WinterMatch extends Match` | Wie `Match`, aber **mit** Ergebnis: `mp` (z. B. `"2:4"`), `sets`, `games`, `venue`, `status: "played" \| "open"`. Nur im Winter-Layout. |
| `Club` | Adresse eines Vereins für den Google-Maps-Link, aus `src/data/clubs.ts`. |

### Tabellen

| Typ | Bedeutung |
|---|---|
| `LeagueStandings` | Die Tabelle **einer Liga**: `leagueName`, `teamLabel`, `teamColor`, `ownRank`, `entries[]`. |
| `StandingsEntry` | Eine **Tabellenzeile**: `rank`, `club`, `isOwnClub`, `points` (z. B. `"8:2"`), `matchPoints`, `sets` und `crossResults[]`. |

`crossResults` **ist** die Kreuztabelle: `crossResults[i]` ist das Ergebnis dieser
Mannschaft gegen die Mannschaft mit `rank === i + 1`. `"***"` markiert die Diagonale
(gegen sich selbst), `"0:0"` heißt „noch nicht gespielt". Die Array-Länge entspricht
immer der Anzahl Mannschaften der Liga.

### Spielberichte und Spieler

| Typ | Bedeutung |
|---|---|
| `IndividualMatch` | **Ein einzelnes Einzel oder Doppel**: `position` (Einzel 1–6, Doppel 7–9; in 4er-Ligen Einzel 1–4, Doppel 7–8), `match_type`, `home_player`, `away_player`, drei Satz-Paare, `winner`. |
| `MatchScore` | Der Container darum: eine Begegnung mit `home_wins`/`away_wins` und `individual_matches[]`. **Derselbe Typ dient zwei Zwecken** — er ist das Supabase-Schema *und* die Struktur der gecrawlten Spielberichte. |
| `Meldeliste` / `MeldelistenEintrag` | Die **gemeldeten Spieler** einer Mannschaft mit `rang` (Meldeposition), `name`, `lk`, `jahrgang`, optional `nation`. Herren und Damen werden getrennt nummeriert. |

Spieler stehen in Berichten als String: `"Nachname, Vorname (Meldeposition, LKxx,x)"`,
geparst von `src/utils/spielbericht.ts`. Das LK-Format hat ein **Komma**: `"LK14,3"`.

### Saison

| Typ | Bedeutung |
|---|---|
| `SeasonId` | Union-Typ, aktuell `"winter-2627" \| "sommer-26" \| "winter-2526"`. **Muss bei jeder neuen Saison erweitert werden.** |
| `Season` | Anzeige-Metadaten: `label`, `shortLabel`, `icon`, optional `provisionalTimesUntil` (bis dahin gelten die BTV-Anspielzeiten als vorläufig, danach verschwindet der Hinweis von selbst). |
| `TeamFormat` | `"6er"` (6 Einzel + 3 Doppel) oder `"4er"` (4 Einzel + 2 Doppel) — steuert, wie viele Positionen eine Begegnung hat. |
| `SubTab` | `"spielplan" \| "tabelle"` — die zwei Reiter der App. |

---

## 6. Die zwei Registries — das Herzstück

Das Projekt hat **zwei parallele Saison-Registries**. Sie kennen einander nicht, und
wer eine ändert, muss fast immer auch die andere anfassen.

### 6.1 `src/data/season-data.ts` — die Registry der **App**

Beantwortet: *Welche Daten zeigt die Oberfläche für Saison X?*

```ts
export const SEASON_DATA: Record<SeasonId, SeasonData> = {
  "winter-2627": { season, teams, categories, matches, standings,
                   standingsStand, months, monthColors, supportsPdf: false },
  "sommer-26":   { … supportsPdf: true },
  "winter-2526": { … },
};
```

`App.tsx` und `CalendarDownloads.tsx` lesen **ausschließlich** hierüber. Früher stand
im Code `isSummer ? … : …`; das war mit zwei Winter-Saisons nicht mehr eindeutig und
wurde durch diese Registry ersetzt. **Konsequenz:** Eine neue Saison anzulegen
erfordert *keine* Änderung an Komponenten.

### 6.2 `scripts/seasons.mjs` — die Registry der **Werkzeuge**

Beantwortet: *Woher holt ein Skript die Daten für Saison X — und welche Saison ist
überhaupt gerade dran?*

Je Saison stehen dort `layout`, `prefix` (Präfix der Konstanten in der Datendatei,
z. B. `WINTER_2627`), `dataFile`, `matchesFile`, `reports`, `rosters`, `teamSize`,
`keepLeagues` und die Liste der `groups` mit ihren `groupid`s.

**Die Saison gibt niemand an.** `detectSeason()` liest per Regex alle `date:`-Einträge
aus der Datendatei, bestimmt daraus das Zeitfenster jeder Saison und wählt:

1. die Saison, in deren Zeitraum **heute** liegt (bei Überlappung die, die früher endet),
2. sonst die, die in **≤ 60 Tagen** beginnt,
3. sonst die zuletzt beendete (Nachlese).

Im Übergang zwischen zwei Runden wird die zweite Kandidatin als Hinweis mitgemeldet.
Jedes Skript druckt beim Start, worauf es wirkt; `--season <id>` überschreibt die
Erkennung, `--season list` zeigt alle bekannten Saisons.

Nützliche Exporte für eigene Skripte: `SEASONS`, `seasonById(id)`, `seasonWindow(s)`,
`detectSeason()`, `resolveSeason(argv)`, `describe(res)`, `cacheFile(season)`, `ROOT`.

### 6.3 `layout` — der wichtigste Unterschied zwischen Sommer und Winter

| | `layout: "summer"` | `layout: "winter"` |
|---|---|---|
| Wo steht das Ergebnis? | **Nur** in der Kreuztabelle (`crossResults`) | **Zusätzlich** an jeder Begegnung (`mp`/`sets`/`games`/`status`) |
| Spielplan-Datei | eigene Datei (`src/data/matches.ts`), kennt nur Termine | dieselbe Datendatei wie die Tabellen |
| Ergebnis im Spielplan | wird von `src/data/results.ts` aus der Kreuztabelle **abgeleitet** | steht direkt am `WinterMatch` |
| `gen:standings` schreibt | Tabellen | Tabellen **und** Begegnungen |

`npm run check` vergleicht bei Winter-Saisons genau diese beiden Quellen gegeneinander.

---

## 7. Die Oberfläche

Die App hat **keinen Router**. Es gibt genau zwei Reiter (`SubTab`) und zwei
Rechtsseiten (Impressum/Datenschutz), die über einen `page`-State getauscht werden.

```
App.tsx  ── hält: season, subTab, activeTeams (Set je Saison), homeOnly,
   │              page, calendarOpen  +  useLiveScores(), useFavorites()
   │
   ├─ Header ────────────── Reiter-Umschaltung, ⋯-Menü (PDF/Kalender)
   │     ├─ SeasonTabs.tsx  (exportiert als „SeasonDropdown") — Saison-Auswahl
   │     └─ TeamFilterDropdown → TeamFilter  — Konkurrenz-Filter, „Auswahl speichern"
   │
   ├─ Reiter „Spielplan"
   │     ├─ TimelineView ── Monatsblöcke, „Heute"-Linie, „Nächstes"-Marke
   │     │     ├─ MatchRow ──── eine Begegnung  (+ ScoreBadge)
   │     │     └─ MatchDetail ─ aufgeklappte Begegnung: Ort, Maps-Link, Bericht
   │     │           └─ LiveScorePanel → ScoreEntry   (Supabase, Abschnitt 8)
   │     └─ CalendarDownloads ─ Overlay mit einer ICS-Datei je Mannschaft
   │
   └─ Reiter „Tabelle"   (React.lazy → eigener Chunk!)
         └─ StandingsView ── Tabelle + Kreuztabelle je Liga
               ├─ SpielberichtDrawer → MatchCard   (Einzel/Doppel einer Begegnung)
               └─ TeamStatsDetail ── Spieler-Statistik einer Mannschaft
```

**Zustand und Persistenz** (alles in `App.tsx`):

- `activeTeams` ist ein `Record<SeasonId, Set<string>>` — **jede Saison hat ihre eigene
  Filterauswahl**, weil die Konkurrenz-Ids je Saison andere sind (`herren40` vs.
  `w27-herren40`).
- Gespeichert wird **nur auf Knopfdruck** („Auswahl speichern"), nicht automatisch:
  `localStorage["tcp-filter-prefs"]` = `{ teams: { <seasonId>: string[] }, homeOnly: boolean }`.
  Die alte Fassung `{ summer: [...], winter: [...] }` wird beim Laden noch migriert.
- Favoriten liegen separat unter `localStorage["tcp-favorites"]` (`useFavorites`).

**Drei Fallen in der Oberfläche:**

1. **`StandingsView` wird lazy geladen.** Tabellen-, Spielbericht- und
   Meldelisten-Texte landen deshalb **nicht** im Startbundle, sondern in
   `StandingsView-*.js`. Ein `grep` im Startbundle nach „BTV-Stand" schlägt korrekt fehl.
2. **`TeamFilter` und `TeamFilterDropdown` haben einen stillen Fallback** auf die
   Sommer-Konstanten (`CATEGORIES`/`TEAMS`), wenn die Props fehlen. Wer sie ohne
   `teams`/`categories` einbindet, sieht wortlos die falsche Saison.
3. **Der PDF-Export ist Sommer-only.** `handlePdf` in `App.tsx` greift fest auf
   `MATCHES` und `activeTeams["sommer-26"]` zu; `pdf-export.ts` kennt nur die
   Sommer-Monatsfarben. Genau dafür gibt es `supportsPdf` in der Registry.

---

## 8. Live-Ergebnisse (Supabase) — der einzige dynamische Teil

Während eine Begegnung läuft, kann jeder Besucher im aufgeklappten Spiel
Zwischenstände eintragen. Das ist der **einzige** Teil der App mit Laufzeit-Daten.

- **Schema:** `supabase-setup.sql` — zwei Tabellen: `match_scores` (eine Begegnung,
  eindeutig über `team_id + match_date + match_time`) und `individual_matches` (ein
  Einzel oder Doppel je Position).
- **Zugriff:** `src/hooks/useLiveScores.ts` lädt beim Start beide Tabellen und
  abonniert Realtime-Updates; `saveScores` schreibt zurück.
- **Kein Login.** Die RLS-Policies erlauben der Rolle `anon` ausdrücklich Lesen,
  Einfügen und Ändern. Das ist bewusst so (Vereins-App ohne Benutzerkonten), man sollte
  es aber wissen, bevor man dort etwas erweitert.
- **UI:** `LiveScorePanel` (Anzeige und Bearbeiten-Umschaltung) → `ScoreEntry`
  (Eingabemaske); die Rechenlogik steht in `src/utils/score-helpers.ts`.
- Diese Live-Stände sind **unabhängig** von den offiziellen BTV-Ergebnissen. Sobald der
  offizielle Spielbericht vorliegt, wird er über die Skripte nachgezogen — er ist die
  maßgebliche Quelle.

**Die wichtigste Build-Falle des Projekts hängt daran:** `src/lib/supabase.ts` ruft
`createClient(url, key)` **schon beim Modul-Import** auf. Fehlen die Env-Variablen,
wirft das beim Laden, und die App rendert eine **komplett leere Seite** (nicht etwa nur
ohne Live-Scores). Da `.env` gitignored ist, passiert das in jedem frischen
`git worktree`. Abhilfe für Bau- und Rendering-Tests:

```bash
VITE_SUPABASE_URL=https://stub.supabase.co VITE_SUPABASE_ANON_KEY=stub npm run build
```

Vite backt Env-Variablen **zur Build-Zeit** ein — nach einer Änderung muss neu gebaut
werden.

---

## 9. Prüfen statt testen

Es gibt keine Unit-Tests. Stattdessen vier Prüfebenen, die zusammen die Rolle der
Testsuite übernehmen:

| Ebene | Befehl | Prüft |
|---|---|---|
| Typen + Build | `npm run build` (`tsc -b && vite build`) | Kompiliert alles? Sind die Datendateien typkonform? |
| Lint | `npm run lint` | ESLint inklusive React-Hooks-Regeln |
| **Daten-Konsistenz** | `npm run check` (`-- --all` für alle Saisons) | Kreuztabelle ↔ Spielberichte ↔ Meldelisten, Format-Grenzen (6 Matches → höchstens 6:0 und 18 Sätze), im Winter zusätzlich Begegnung ↔ Kreuztabelle |
| **Echter Browser** | headless Chrome gegen `npm run preview` oder gegen die Live-URL | Rendert die Seite? Sind Reiter, Drilldown-Inhalte und Leerzustände da? |

Ergänzend: `node scripts/verify-parser.mjs` (Parser-Ausgabe gegen bekannte Daten
diffen) und `node scripts/check-names.mjs` (Spieler ohne Meldelisten-Eintrag zählen).

**Der Browser-Check ist Pflicht bei UI-Änderungen.** `tsc` sieht nicht, dass eine
Komponente zur Laufzeit nichts rendert. Die App ist **mobil-erst** — deshalb mit
Geräte-Emulation prüfen (Viewport **420×912**, `isMobile: true, hasTouch: true`, und
`.tap()` statt `.click()`), und zusätzlich auf horizontalen Overflow achten
(`document.documentElement.scrollWidth > clientWidth` muss `false` sein).

---

## 10. Die Werkzeuge in `scripts/`

Alle sind Node-ESM-Skripte, laufen über `node scripts/<name>.mjs` bzw. die
`npm run`-Aliase und bestimmen ihre Saison selbst.

| Skript | Aufgabe |
|---|---|
| `seasons.mjs` | Registry + Saison-Erkennung. Direkt aufgerufen (`npm run season`) zeigt es alle Saisons und die aktive. |
| `new-season.mjs` | Legt eine komplette neue Saison an: Mannschaften und `groupid`s aus dem Vereins-Widget, Spielplan-Reports, Spielorte → fertige `src/data/<id>.ts`. |
| `crawl-spielberichte.mjs` | Puppeteer-Crawl aller Spielberichte einer Gruppe → Cache-JSON. Langsam (~45 min für alles). |
| `parse-spielbericht.mjs` | Reines Text-Parsing des Bericht-Modals. **Keine Netzzugriffe** — dadurch kann man am Parser arbeiten, ohne neu zu crawlen. |
| `generate-spielberichte.mjs` | Cache → `src/data/spielberichte-crawled.ts`. Schreibt die Datei **komplett** neu. |
| `generate-standings.mjs` | Cache → Tabellen (und im Winter-Layout die Begegnungen). `--write` schreibt, ohne Flag gibt es nur den Diff. |
| `crawl-meldelisten.mjs` | Puppeteer-Crawl der Meldelisten → `src/data/meldelisten.ts`. |
| `check-data.mjs` | Der Konsistenz-Check (siehe oben). |
| `check-names.mjs` | Spieler aus Berichten ohne Meldelisten-Eintrag (das sind Ersatzspieler, kein Fehler). |
| `verify-parser.mjs` | Parser-Ausgabe gegen bekannte Daten diffen. |

**Zwei Sicherungen, die man kennen muss:**

- Crawl-Caches liegen **je Saison** (`scripts/.spielberichte-cache-<id>.json`) und sind
  gitignored. `generate-spielberichte.mjs` führt sie zusammen und **bricht ab**, wenn
  Ligen verschwinden würden, die schon in der Zieldatei stehen. `--force` übergeht das
  bewusst — nur mit gutem Grund und nach Rücksprache.
- Für die Crawler wird **Google Chrome** gebraucht (`puppeteer-core`, Pfad über
  `CHROME_PATH`). Bei wenig Arbeitsspeicher gruppenweise crawlen und Chrome bremsen:
  `CHROME_ARGS="--disable-dev-shm-usage --js-flags=--max-old-space-size=384 --renderer-process-limit=1 --blink-settings=imagesEnabled=false"`.

---

## 11. Build und Auslieferung

```
Branch → Pull Request → gh pr merge --squash
                            │
                            ▼  Push auf main löst die Action aus
        .github/workflows/deploy.yml
                            │  SSH auf den Server
                            ▼
   cd /var/www/tcp-spielplan.de
   git fetch origin main && git reset --hard origin/main
   npm ci && npm run build && test -d dist/assets
                            │
                            ▼
              nginx serviert dist/ → tcp-spielplan.de
```

- **Nie direkt auf `main` pushen.** Immer Branch → PR → Squash-Merge.
- Reine Doku-Commits mit `[skip ci]` in der Commit-Message — dann läuft korrekt **kein**
  Deploy, und der Bundle-Hash bleibt unverändert.
- **„Grüner Workflow" ist kein Beweis.** Genau dieser Fehler ist im Juni 2026 passiert:
  `npm install` veränderte die `package-lock.json`, `git pull` scheiterte still, der
  alte Code wurde neu gebaut — und weil nur der Exit-Code des letzten Befehls zählte,
  meldete die Action trotzdem Erfolg. Der Workflow ist seitdem repariert
  (`set -euo pipefail`, `git reset --hard`, `npm ci`, `test -d dist/assets`), die
  **Nachkontrolle bleibt trotzdem Pflicht**:

```bash
curl -s https://tcp-spielplan.de/ | grep -oE 'assets/index-[^"]+\.js'
curl -s https://tcp-spielplan.de/assets/index-XXXX.js | grep -c '<neuer-datenschnipsel>'
```

Für Tabellen- und Spielbericht-Inhalte im **lazy geladenen Chunk** suchen
(`StandingsView-*.js`) oder die Live-Seite im Browser öffnen und den Reiter „Tabelle"
aufmachen.

---

## 12. Woran man sich beim Ändern hält

1. **Daten kommen aus offiziellen BTV-Quellen und werden verbatim übernommen** — auch
   wenn eine Rangfolge falsch aussieht (bei ungleicher Spielzahl sortiert der BTV nach
   Punkt-*Quotient*, nicht nach Summe). Nichts schätzen, nichts hochrechnen, nichts
   „korrigieren".
2. **Generierte Dateien nie von Hand editieren**: `src/data/spielberichte-crawled.ts`
   und `src/data/meldelisten.ts`. Änderungen laufen über die Skripte.
3. **Neue Saison = Daten + fünf Registrierungen**, aber keine Komponenten-Änderung
   (Rezept in [AUFGABEN.md](AUFGABEN.md)).
4. **Nach Datenänderungen `npm run check`**, nach UI-Änderungen der Browser-Check.
5. **Deutsche Sprache** in Code-Kommentaren, Doku und Oberflächentexten; Bezeichner und
   Fachbegriffe bleiben, wie sie sind.

---

## 13. Geplante Erweiterung: Suche, Spielerhistorie, Gegnerbriefing, Auto-Aktualisierung

> **Status 09.09.2026: Spezifikation, nicht gebaut.** Fachliche Anforderungen und offene Fragen
> stehen im README („Vorhaben: Suche, Spielerhistorie und Gegnerbriefing"). Dieser Abschnitt
> beschreibt, **was sich am Aufbau ändern müsste** — als Leitplanke für die Umsetzung nach der
> Freigabe. Vor der Freigabe wird weder Anwendungscode geändert noch eine Automatik aktiviert.

### 13.1 Datenmodell: Saison an jedem Bericht und jeder Meldeliste

Heute kennen `Spielbericht` und `Meldeliste` **keine Saison** — der Schlüssel ist
`league::homeClub::awayClub`, und `spielberichte-crawled.ts` enthält nur Sommer 2026. Für eine
Historie über Winter 2024/25 … Winter 2026/27 muss jeder Bericht und jede Meldeliste ein
`season: SeasonId` tragen; `getSpielbericht` bleibt richtungsunabhängig, wird aber um die Saison
ergänzt (Gruppennummern wiederholen sich über Jahre, z. B. „Bayernliga · Gr. 022 SU" in beiden
Winterrunden). `SeasonId` wächst um `"sommer-25"` und `"winter-2425"`; beide Registries bekommen
Einträge, aber **ohne Spielplan-Anzeige** (`SEASONS` im Dropdown bleibt unverändert — die alten
Runden sind reine Datenquellen). Dafür braucht `SeasonData` ein Kennzeichen wie `historyOnly`.

Neu dazu kommt ein abgeleiteter Index (Arbeitsname `src/data/player-history.ts`):

- **Spieler-Index:** normalisierter Name + Verein → alle Einsätze über alle Saisons, mit Datum,
  Position, Gegner, Partner, Sätzen, Ergebnis und `vsTcp: boolean`. Gebaut aus
  `getAllSpielberichte()` wie heute `player-stats.ts`, nur saisonübergreifend und ohne
  Mannschaftsbezug.
- **Mannschafts-Index je Gruppe:** je Mannschaft die gespielten Begegnungen mit Aufstellung
  (Positionen → Namen), Einsatzzähler je Spieler, Doppelpaare, Begegnungsergebnisse.
- **Datenstand je Gruppe und Saison** (`dataStand: { [groupid]: ISO-Zeitstempel }`) plus der
  **nächste geplante Lauf**, geschrieben vom Crawl, angezeigt im **⋯-Menü des Headers** — nicht
  im Briefing (Entscheidung des Auftraggebers vom 09.09.2026).

Die Suche braucht eine flache Liste aller Namen (Spieler) und aller Mannschaften in TCP-Gruppen;
beides ist aus dem Index ableitbar. Alles bleibt eingecheckter TypeScript-Code — **kein Backend**,
Supabase bleibt auf Live-Zwischenstände beschränkt.

**Bundle-Größe:** Historie und Briefing lesen die vollständigen Spielberichte aller Saisons.
Diese Daten gehören wie heute in **lazy geladene Chunks** (Muster `SpielberichtLink`/
`StandingsView`), sonst wächst das Startbundle des Spielplans um mehrere hundert Kilobyte.

### 13.2 Oberfläche: drei neue Einstiege, kein Router

```
Header ── „🔍 Suche" (neu) ──► SearchOverlay ──► Spieler  ──► PlayerHistory (neu, lazy)
       │                                     └─► Mannschaft ──► TeamStatsDetail (bestehend)
       └─ ⋯-Menü ── Kalender-Downloads · PDF (Sommer) · Datenstand + nächster Lauf (neu)
TimelineView ► MatchRow ► MatchDetail ──► OpponentBriefing (neu, lazy, nur laufende Saison)
                                            ├─ Meldeliste    (RosterRow + LK + Einsatzhäufigkeit)
                                            ├─ Aufstellungen (Nachname + LK; Gegner + „Unsere")
                                            └─ Ergebnisse    (Begegnungen des Gegners, Gegnersicht)
```

- Overlay- und Seitenzustand liegen wie `calendarOpen` und `page` in `App.tsx`; ein
  `searchOpen` und ein `selectedPlayer` reichen. Zurück-Navigation schließt jeweils eine Ebene.
- Wiederverwendet werden `RosterRow`, `LkPill`, `ResultBadge` (aus `TeamStatsDetail` zu
  exportieren), `MatchCard`/`SideLine`, das Bottom-Sheet aus `SpielberichtDrawer`.
- **Saisonneutral bleiben** (Regel aus AUFGABEN.md, Abschnitt 1): das Briefing findet die Gruppe
  des Gegners über `Team.league` + Saison, nie über eine Saison-Fallunterscheidung.

### 13.3 Farblogik: die betrachtete Seite bestimmt die Farbe

`sideOutcome(side, won, tcpSide)` in `src/utils/spielbericht.ts` färbt heute aus TCP-Sicht
(`tcpWin` grün, `oppWin` rot) oder neutral bei Fremdpaarungen. Für Profile und Briefing wird
der feste `tcpSide` durch einen Parameter **„betrachtete Seite"** ersetzt — die Mannschaft oder
der Spieler, dessen Seite gerade offen ist. Entscheidung vom 09.09.2026:

| Kontext | betrachtete Seite | grün bedeutet |
|---|---|---|
| Spielerhistorie (eigener oder gegnerischer Spieler), auch Zeilen gegen Pliening | der Spieler | der Spieler hat gewonnen |
| Meldeliste / Ergebnisse / Aufstellungen des Gegners im Briefing | der Gegner | der Gegner hat gewonnen |
| „Unsere Aufstellungen" im Briefing | TC Pliening | Pliening hat gewonnen |
| Spielbericht einer TCP-Begegnung (Spielplan, Kreuztabelle) — **unverändert** | TC Pliening | Pliening hat gewonnen |
| Spielbericht einer Fremdpaarung — **unverändert** | keine | Heim sky / Gast amber wie heute |

Kein Farbwechsel innerhalb einer Liste; Zeilen gegen Pliening tragen nur eine „TCP"-Marke.
Satzfelder folgen derselben Entscheidung über `setCellClass`. Neue Farbwerte gibt es nicht.

### 13.4 Auto-Aktualisierung: Wecker statt Terminplan

Entschieden am 09.09.2026 (F5–F7 im README): ein **täglicher Cron um 01:00 Uhr
Europe/Berlin** in GitHub Actions, Daten per **Bot-PR mit sofortigem Merge**, E-Mail bei rotem
Lauf. Weil Actions-Cron in UTC läuft, zwei Cron-Zeilen (23:00 und
00:00 UTC) und ein Skript, das die lokale Stunde prüft und sonst sofort beendet. Der Lauf:

```
seasons.mjs → Termine der laufenden Saison
   └─ liegt eine TCP-Begegnung in genau 7, 4 oder 0 Tagen?   nein → Ende
        ja ↓
   ScheduleReportFOP der betroffenen Gruppen  (Verlegungen erkennen)
   crawl:spielberichte -- <groupid> --force   (neue/korrigierte Berichte, Gegnerspiele)
   crawl:meldelisten -- <groupid>              (Nachmeldungen)
   gen:spielberichte · gen:standings --write · check
   Datenstand je Gruppe schreiben
   Commit → Bot-PR → Auto-Merge → Deploy        (F6: kein Direkt-Commit des Bots)
   bei Fehler: Workflow rot → E-Mail an den Auftraggeber (F7)
```

Spielverlegungen brauchen keine Sonderbehandlung: Der Wecker rechnet die Abstände jeden Tag aus
den **aktuellen** Terminen neu. Fällt ein Lauf aus (BTV nicht erreichbar, Chrome-Absturz), bleibt
der alte Datenstand sichtbar — deshalb zeigt das ⋯-Menü ihn samt nächstem Lauf an. Die Regeln aus Abschnitt 11
(Bundle-Hash prüfen, `[skip ci]` nur für Doku) gelten für Bot-Commits unverändert; ein Bot-Commit
ist **kein** Doku-Commit und muss deployen.

**Nicht verhandelbar:** Der Automat darf nie `--force` auf `gen:spielberichte` setzen und nie
Ligen aus `keepLeagues` überschreiben — die Sicherungen aus Abschnitt 10 bleiben scharf.
