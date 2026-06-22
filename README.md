# TC Pliening – Spielplan & Tabellen

React/Vite-App für Spielplan, Tabellen und Statistik des TC Pliening (Sommer-Saison 2026). Live: https://tcp-spielplan.de

## Features

- **Spielplan** – kommende/vergangene Begegnungen; springt beim Laden automatisch ans nächste Wochenende.
- **Tabellen** je Konkurrenz mit **Kreuztabelle**. Auf ein Ergebnis in der Kreuztabelle tippen → **Spielbericht** (Einzel/Doppel) der Begegnung.
- **Spieler-Statistik je Mannschaft** (seit 2026-06-18) – siehe unten.

### Spieler-Statistik je Mannschaft

In der **Tabelle** eine **Mannschaftszeile antippen** (›-Pfeil rechts) → es öffnet sich eine Detailseite mit zwei Reitern:

- **Spieler** – jeder Spieler nach **Ø-Position** sortiert (Durchschnitt der gespielten Position; `1` = oben/stärkste Position), mit eigener **LK**. Aufklappen zeigt pro Einsatz: Gegner **inkl. dessen LK**, Position, Satz-Ergebnis und **SIEG/NIEDERL.** Marker **▲ LK-Sieg** = gegen besseren (niedrigeren) LK gewonnen, **▼** = gegen schwächeren LK verloren.
- **Doppel** – Paarungen separat (Schlüssel = sortierte Nachnamen). Ohne LK, da nuLiga für Doppel keine LK ausweist.

**Datenquelle & Funktionsweise:** Alles wird **live aus den echten nuLiga-Spielberichten** in `src/data/spielberichte.ts` aggregiert – es gibt **keine Beispieldaten**. Funktioniert für **jede** Mannschaft, die in einem Spielbericht vorkommt (auch Gegner), da jeder Bericht beide Aufstellungen enthält. Mannschaften ohne erfassten Spielbericht zeigen einen Hinweis-Leerzustand. Aktuell erfasst (Sommer 2026, Stand 22.06.): **H00** (Südliga 2 · Gr. 023), **H30** (Südliga 4 · Gr. 292), **H40** (Regionalliga Süd-Ost · Gr. 004) und **H40 III** (Südliga 2 · Gr. 315).

**Code-Landkarte:**
- `src/data/player-stats.ts` – Aggregation: `getTeamStats(leagueName, club)`, `aggregatePlayers`, `aggregateDoubles`, `parseLk`.
- `src/components/TeamStatsDetail.tsx` – die Detailseite (Reiter, Drilldown, LK-Pillen).
- `src/components/StandingsView.tsx` – Tabellenzeile klickbar (`selectedClub`-State); koexistiert mit der Spielbericht-Ansicht der Kreuztabelle.
- Spieler-Strings haben das Format `"Nachname, Vorname (Meldeposition, LKxx,x)"` und werden von `src/utils/spielbericht.ts` (`parsePlayer`/`parseSide`) geparst. LK-Format `"LK14,3"` (Komma als Dezimaltrenner).

---

## Daten pflegen (nuLiga)

Alle Liga-/Spieldaten stammen aus offiziellen **BTV-nuLiga-PDFs** und liegen in zwei Dateien. `club=22844` = TC Pliening; Saison Sommer 2026 = `season=18103` (wechselt je Saison — aktuellen Link von der [Vereinsseite](https://www.btv.de/de/mein-verein/vereinsseite/tc-pliening.html) holen).

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
