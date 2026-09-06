# tcp-spielplan: gemeinsame Projektanweisungen

## Gemeinsame Arbeitsweise für Claude Code und Codex

Diese Regeln gelten ergänzend zu den projektspezifischen Anweisungen. Der aktuelle Nutzerauftrag bestimmt den Umfang; diese Datei erteilt keine zusätzliche Merge- oder Deployment-Freigabe.

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

- **Nie direkt auf `main` pushen.** Änderungen: Branch → PR → `gh pr merge --squash`
  (der Merge löst den Deploy aus). Nach dem Deploy den **live ausgelieferten Bundle-Hash**
  prüfen (`curl -s https://tcp-spielplan.de/ | grep -oE 'assets/index-[^"]+\.js'`) und im
  Bundle nach einem neuen Datenschnipsel greppen — „grüner Workflow" allein reicht nicht.
- **Kein Bauen ohne Supabase-Env.** `.env` ist gitignored und existiert nur im Haupt-Checkout;
  im Worktree Dummy-Werte setzen, sonst weiße Seite („supabaseUrl is required"):
  `VITE_SUPABASE_URL=https://stub.supabase.co VITE_SUPABASE_ANON_KEY=stub npm run build`
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
| Konkurrenzen + groupids (eine Quelle für alle Skripte) | `scripts/groups.mjs` |
| Tabellen + Kreuztabellen (Sommer) | `src/data/summer-2026.ts` |
| Spielberichte (Einzel/Doppel je Begegnung) | `src/data/spielberichte-crawled.ts` (**generiert**) |
| Lookup drumherum | `src/data/spielberichte.ts` |
| Meldelisten (alle gemeldeten Spieler) | `src/data/meldelisten.ts` (**generiert**) |
| Crawler + Generatoren | `scripts/crawl-meldelisten.mjs`, `crawl-spielberichte.mjs`, `parse-spielbericht.mjs`, `generate-spielberichte.mjs`, `generate-standings.mjs` |
| Prüf-Skripte | `scripts/verify-parser.mjs`, `check-data.mjs`, `check-names.mjs` |
| Aggregation Spieler/Doppel | `src/data/player-stats.ts` |
| Spieler-Detailseite | `src/components/TeamStatsDetail.tsx` |
| Tabellen-Ansicht + Drilldown | `src/components/StandingsView.tsx` |

## Datenpflege in Kürze

Neue Ergebnisse: Gruppen-Report `ScheduleReportFOP&group=<groupid>` per `curl -L` ziehen
(Tabelle **und** Spielplan), Spielberichte per Puppeteer aus dem btv.de-Widget holen
(README-Abschnitt „Spielberichte selbst crawlen") und beides eintragen. Sanity-Checks:
Summe der Einzel-/Doppel-Siege = Endergebnis der Begegnung, Kreuztabellen-Zelle =
Matchpunkte, Tabellen-Delta = Sätze/Spiele des neuen Berichts.
