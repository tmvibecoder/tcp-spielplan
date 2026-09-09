# tcp-spielplan: gemeinsame Projektanweisungen

## Gemeinsame Arbeitsweise für Claude Code und Codex

Diese Regeln gelten ergänzend zu den projektspezifischen Anweisungen. Der aktuelle Nutzerauftrag bestimmt den Umfang. Für das Ausliefern gilt die **stehende Freigabe des Auftraggebers vom 07.09.2026**: fertige, geprüfte Änderungen werden ohne Rückfrage gemergt und live genommen (siehe „Harte Regeln"). Sie ersetzt keine der Prüfpflichten unten und erlaubt keine Arbeiten außerhalb des Auftrags.

- Zu Beginn und bei jedem Modellwechsel den tatsächlichen Git-Stand prüfen: Repository-Root und Remote-Zuordnung, Branch, HEAD, `git status --short --branch`, ungestagten und gestagten Diff, letzte Commits und vorhandenen Upstream. Gecachte Remote-Refs nicht als frisch abgeglichen ausgeben.
- Bestehende Änderungen, ungetrackte Dateien und andere Worktrees erhalten. Kein automatisches Stash, Reset, Clean oder Branchwechsel, um einen vermeintlich sauberen Start herzustellen; nur eigene auftragsbezogene Dateien aufnehmen.
- Projekt- und Statusdokumentation vor der Fortsetzung lesen. Wissen aus einer früheren Claude-/Codex-Unterhaltung oder lokalem Memory nicht voraussetzen und nicht ungeprüft übernehmen. Fehlende Informationen als offen kennzeichnen.
- Die betroffene Änderung angemessen prüfen: vorhandene relevante Tests, Lint-/Buildbefehle und projektbezogene Browserprüfungen verwenden. Reine Dokumentationsänderungen auf Diff, Verweise und Konsistenz prüfen; keine Tests oder erfolgreichen Deploys behaupten, die nicht ausgeführt wurden. Strengere projektspezifische Prüfregeln bleiben bestehen.
- Dauerhaftes Projektwissen in der unten zugeordneten gemeinsamen Dokumentation pflegen. Bestehende Status-/Offene-Punkte-Dokumente bei relevanten Änderungen aktualisieren. Zur Übergabe Branch/Commit, Änderungen, tatsächlich ausgeführte Prüfungen, offene Punkte und nächsten Schritt knapp festhalten; ohne eigene Statusdatei genügt dafür die Aufgabenabschlussnachricht.
- `CLAUDE.md` bleibt der Import. Gemeinsame Regeln nur in `AGENTS.md` bzw. der ausdrücklich zugeordneten Projektdokumentation pflegen. Historische Claude-Bezeichnungen und Selbstverweise in übernommenen Texten ändern diese Zuordnung nicht.

## Dokumentationszuordnung

`AGENTS.md`, `README.md`, `docs/SKILL-VORLAGE-ergebnisse-nachziehen.md`.

Die folgenden Projektanweisungen wurden aus `CLAUDE.md` übernommen. Sie gelten für Claude Code und Codex und werden künftig hier gepflegt.

---

# Arbeitsanweisungen für Claude (tcp-spielplan)

React/Vite-SPA für Spielplan, Tabellen und Spieler-Statistik des TC Pliening.
Live: https://tcp-spielplan.de · Deploy = **GitHub-Actions bei Push auf `main`**.

Die inhaltliche Doku steht im **[README](README.md)** — dort nachlesen statt raten:
„Daten pflegen (nuLiga)", „Meldelisten", „Spielberichte selbst crawlen",
„nuLiga-Zugriff", „Deployment" (inkl. der beiden Stolperfallen).

## Harte Regeln

- **Fertige Arbeit wird ausgeliefert.** Stehende Freigabe vom 07.09.2026: geprüfte Änderungen ohne
  Rückfrage mergen, deployen und live nehmen — das gilt für alle Repositories von Thomas.
  Rückfragepflichtig bleiben Datenverlust und Eingriffe in fremde Systeme.
- **Nie direkt auf `main` pushen.** Änderungen: Branch → PR → `gh pr merge --squash`
  (der Merge löst den Deploy aus). Reine Doku-Commits mit `[skip ci]`. Nach dem Deploy den **live ausgelieferten Bundle-Hash**
  prüfen (`curl -s https://tcp-spielplan.de/ | grep -oE 'assets/index-[^"]+\.js'`) und im
  Bundle nach einem neuen Datenschnipsel greppen — „grüner Workflow" allein reicht nicht.
- **Kein Bauen ohne Supabase-Env.** `.env` ist gitignored und existiert nur im Haupt-Checkout;
  im Worktree Dummy-Werte setzen, sonst weiße Seite („supabaseUrl is required"):
  `VITE_SUPABASE_URL=https://stub.supabase.co VITE_SUPABASE_ANON_KEY=stub npm run build`
  Im Worktree fehlt außerdem `node_modules` → einmal `npm install`; der Haupt-Checkout hat kein
  `puppeteer-core`, Browser-Crawls scheitern dort mit `ERR_MODULE_NOT_FOUND`. Eigene Hilfsskripte
  müssen **im Repo** liegen (sonst finden sie `node_modules` nicht) und danach wieder weg.
- **Uncommittete Fremdstände nie verwerfen.** Der Haupt-Checkout wurde am 09.09.2026 auf
  `origin/main` nachgezogen (hing 61 Commits zurück, blockiert von einem WIP-Stand vom April 2026;
  gesichert auf `wip/score-entry-april-2026`, überholt). Findet sich der Checkout wieder so vor:
  erst auf einem Branch committen und pushen, dann `git merge --ff-only origin/main` — kein Reset,
  kein blindes Stash, und die sieben alten Worktrees unter `.claude/worktrees/` in Ruhe lassen.
- **Liga-/Spieldaten nur aus offiziellen BTV-Quellen** übernehmen, **verbatim** — auch wenn die
  BTV-Rangfolge „falsch" aussieht (bei ungleicher Spielzahl sortiert der BTV nach Punkt-Quotient).
  Nichts schätzen, nichts hochrechnen.
- **`src/data/meldelisten.ts` und `src/data/spielberichte-crawled.ts` sind generiert** — nur über
  `npm run crawl:meldelisten` bzw. `npm run crawl:spielberichte && npm run gen:spielberichte` ändern.
  Nach Datenänderungen `node scripts/check-data.mjs` laufen lassen (Tabellen ↔ Berichte ↔ Meldelisten).
- **UI-Änderungen im echten Browser prüfen** (headless Chrome gegen `npx vite preview`),
  nicht nur `tsc`/Build. Beispiel-Checks: Tabs, Sektionen, Drilldown-Inhalt, Leerzustände.

## Wo was liegt

| Zweck | Datei |
|---|---|
| **Saison-Registry der Skripte** (Gruppen, Layout, Datendatei je Saison) + Erkennung der laufenden Runde | `scripts/seasons.mjs` |
| Neue Saison komplett anlegen (Mannschaften, groupids, Spielplan, Spielorte) | `scripts/new-season.mjs` |
| **Welche Daten eine Saison zieht** (Teams, Matches, Standings, Monate, `supportsPdf`) | `src/data/season-data.ts` |
| Saison-Liste + Vorauswahl (`SEASONS[0]`) | `src/data/seasons.ts` |
| Tabellen + Kreuztabellen (Sommer) + `SUMMER_STANDINGS_STAND` (Anzeige „BTV-Stand") | `src/data/summer-2026.ts` |
| Winterrunde 2026/27 komplett (Teams, Spielplan, Tabellen, Monatsfarben) | `src/data/winter-2627.ts` |
| Winterrunde 2025/26 (Archiv) | `src/data/winter-2526.ts` |
| Spielplan-Termine Sommer (bei Verlegung: Datum aus dem Spielbericht) | `src/data/matches.ts` |
| Ergebnis je Spielplan-Begegnung aus der Kreuztabelle ableiten | `src/data/results.ts` |
| Spielberichte (Einzel/Doppel je Begegnung) | `src/data/spielberichte-crawled.ts` (**generiert**) |
| Lookup drumherum | `src/data/spielberichte.ts` |
| Meldelisten (alle gemeldeten Spieler) | `src/data/meldelisten.ts` (**generiert**) |
| Crawler + Generatoren | `scripts/crawl-meldelisten.mjs`, `crawl-spielberichte.mjs`, `parse-spielbericht.mjs`, `generate-spielberichte.mjs`, `generate-standings.mjs` |
| Prüf-Skripte | `scripts/verify-parser.mjs`, `check-data.mjs`, `check-names.mjs` |
| Aggregation Spieler/Doppel | `src/data/player-stats.ts` |
| Spieler-Detailseite | `src/components/TeamStatsDetail.tsx` |
| Tabellen-Ansicht + Drilldown (lazy geladen) | `src/components/StandingsView.tsx` |
| Spielplan (Sommer und Winter, eine Komponente) | `src/components/TimelineView.tsx`, `MatchRow.tsx`, `MatchDetail.tsx` |
| Kalender-Downloads (Overlay aus dem ⋯-Menü) | `src/components/CalendarDownloads.tsx` |

## Datenpflege in Kürze

**Die Saison gibt niemand an.** Alle Skripte erkennen sie aus den eingetragenen Spielterminen
(`scripts/seasons.mjs`) und nennen beim Start, worauf sie wirken; `--season <id>` lenkt um.

```bash
npm run season                     # welche Saison ist dran? (alle Runden im Überblick)
npm run gen:standings -- --write   # Ergebnisse der laufenden Saison nachziehen
npm run check                      # Konsistenz (--all für alle Saisons)
npm run season:new -- --discover-only   # Mannschaften + groupids einer neuen Runde
```

**Neue Saison anlegen:** `npm run season:new -- --id <id> --label "<Name>" --layout winter|summer`
schreibt die Datendatei aus den BTV-Quellen und nennt die fünf Handgriffe danach
(`scripts/seasons.mjs`, `types.ts`, `seasons.ts`, `season-data.ts`, `team-format.ts`).
App-Komponenten bleiben unangetastet — Details im README („Eine Saison anlegen").

Neue Ergebnisse: `npm run gen:standings` zieht Tabellen **und** (im Winter-Layout) die
Begegnungen selbst aus dem Crawl-Cache; verlegte Termine kommen mit. Sanity-Checks:
Summe der Einzel-/Doppel-Siege = Endergebnis der Begegnung, Kreuztabellen-Zelle =
Matchpunkte, Tabellen-Delta = Sätze/Spiele des neuen Berichts. Das `_STANDINGS_STAND`
der Saison setzt der Generator; bei Hand-Änderungen selbst nachziehen.
