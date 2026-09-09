# tcp-spielplan — Projektanweisungen für KI-Agenten und Mitarbeitende

**Diese Datei ist der Einstieg. Lies sie vollständig, bevor du etwas änderst.**
Sie gilt für **jeden** Agenten, der an diesem Repository arbeitet — Claude Code, Codex,
Astra und alle weiteren. Wo ältere Texte „Claude" sagen, ist der jeweils arbeitende
Agent gemeint; das ändert nichts an der Zuständigkeit.

---

## Das Projekt in fünf Zeilen

**tcp-spielplan** ist die Begleit-App zum Ligabetrieb des Tennisvereins **TC Pliening**:
Spielplan, Tabellen, Spielberichte und Spieler-Statistik. Live unter
**<https://tcp-spielplan.de>**.

Technik: **React 19 + TypeScript + Vite 8 + Tailwind 4**, ausgeliefert als **statische
Seite** über nginx. **Kein eigenes Backend** — alle Liga-Daten sind eingecheckter
TypeScript-Code in `src/data/`, erzeugt von Node-Skripten aus offiziellen BTV-Quellen.
Einzige Laufzeit-Anbindung ist Supabase für Live-Zwischenstände.

---

## Lies in dieser Reihenfolge

| # | Datei | Wofür |
|---|---|---|
| 1 | **diese Datei** | Regeln, Befehle, Wo-was-liegt |
| 2 | **[docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md)** | Wie die App aufgebaut ist: Datenfluss, Datenmodell, die zwei Registries, Build und Deploy |
| 3 | **[docs/GLOSSAR.md](docs/GLOSSAR.md)** | Die Fachsprache: Konkurrenz, Kreuztabelle, Matchpunkte, Meldeliste, LK, w.o. … |
| 4 | **[docs/AUFGABEN.md](docs/AUFGABEN.md)** | Rezepte: „Ich soll X ändern — was genau tue ich?" |
| 5 | **[README.md](README.md)** | Das ausführliche Nachschlagewerk: jedes Feature, jede Datenquelle, jede Stolperfalle |
| 6 | [docs/SKILL-VORLAGE-ergebnisse-nachziehen.md](docs/SKILL-VORLAGE-ergebnisse-nachziehen.md) | Schritt-für-Schritt für den Ergebnis-Abgleich |

Für einen **Überblick** reichen 1–3. Wer Daten pflegt, liest 4 und 6. Wer eine
Stolperfalle sucht, sucht in 5 — dort nachlesen statt raten, besonders in den
Abschnitten „Daten pflegen (nuLiga)", „Meldelisten", „Spielberichte selbst crawlen",
„nuLiga-Zugriff" und „Deployment" (inklusive der beiden Stolperfallen am Ende).

**Nachschlagen statt raten.** Fast jede Eigenart dieses Projekts ist irgendwo
dokumentiert und hat einen Grund.

---

## Arbeitsweise (gilt für alle Agenten)

Der aktuelle Nutzerauftrag bestimmt den Umfang. Für das Ausliefern gilt die **stehende
Freigabe des Auftraggebers vom 07.09.2026**: fertige, geprüfte Änderungen werden ohne
Rückfrage gemergt und live genommen (siehe „Harte Regeln"). Sie ersetzt keine der
Prüfpflichten und erlaubt keine Arbeiten außerhalb des Auftrags.

- Zu Beginn und bei jedem Modellwechsel den tatsächlichen Git-Stand prüfen:
  Repository-Root und Remote-Zuordnung, Branch, HEAD, `git status --short --branch`,
  ungestagten und gestagten Diff, letzte Commits und vorhandenen Upstream. Gecachte
  Remote-Refs nicht als frisch abgeglichen ausgeben.
- Bestehende Änderungen, ungetrackte Dateien und andere Worktrees erhalten. Kein
  automatisches Stash, Reset, Clean oder Branchwechsel, um einen vermeintlich sauberen
  Start herzustellen; nur eigene auftragsbezogene Dateien aufnehmen.
- Projekt- und Statusdokumentation vor der Fortsetzung lesen. Wissen aus einer früheren
  Unterhaltung oder aus lokalem Memory nicht voraussetzen und nicht ungeprüft
  übernehmen. Fehlende Informationen als offen kennzeichnen.
- Die betroffene Änderung angemessen prüfen: vorhandene relevante Tests, Lint- und
  Buildbefehle und projektbezogene Browserprüfungen verwenden. Reine
  Dokumentationsänderungen auf Diff, Verweise und Konsistenz prüfen; keine Tests oder
  erfolgreichen Deploys behaupten, die nicht ausgeführt wurden. Strengere
  projektspezifische Prüfregeln bleiben bestehen.
- Dauerhaftes Projektwissen in der unten zugeordneten gemeinsamen Dokumentation
  pflegen. Bestehende Status- und Offene-Punkte-Dokumente bei relevanten Änderungen
  aktualisieren. Zur Übergabe Branch/Commit, Änderungen, tatsächlich ausgeführte
  Prüfungen, offene Punkte und nächsten Schritt knapp festhalten; ohne eigene
  Statusdatei genügt dafür die Aufgabenabschlussnachricht.
- **Sprache: Deutsch** — Oberflächentexte, Code-Kommentare, Commit-Messages, Doku und
  Antworten an den Auftraggeber. Bezeichner, Dateinamen und Fachbegriffe bleiben in
  ihrer Originalform.
- `CLAUDE.md` bleibt der Import (`@AGENTS.md`). Gemeinsame Regeln nur in `AGENTS.md`
  bzw. der ausdrücklich zugeordneten Projektdokumentation pflegen. Historische
  Claude-Bezeichnungen und Selbstverweise in übernommenen Texten ändern diese
  Zuordnung nicht.

### Dokumentationszuordnung

`AGENTS.md`, `README.md`, `docs/ARCHITEKTUR.md`, `docs/GLOSSAR.md`, `docs/AUFGABEN.md`,
`docs/SKILL-VORLAGE-ergebnisse-nachziehen.md`.

---

## Harte Regeln

- **Fertige Arbeit wird ausgeliefert.** Stehende Freigabe vom 07.09.2026: geprüfte
  Änderungen ohne Rückfrage mergen, deployen und live nehmen — das gilt für alle
  Repositories von Thomas. Rückfragepflichtig bleiben **Datenverlust** und **Eingriffe
  in fremde Systeme**.
- **Vorhaben Gegnerbriefing ist gesperrt bis zur Freigabe.** Suche, Spielerhistorie,
  Gegnerbriefing und die automatische Aktualisierung sind seit 09.09.2026 nur **spezifiziert**
  (README „Vorhaben: Suche, Spielerhistorie und Gegnerbriefing", docs/ARCHITEKTUR.md Abschnitt 13,
  docs/AUFGABEN.md Abschnitt 9). Kein Anwendungscode, kein Workflow, kein Cron dafür, bevor die
  offenen Fragen beantwortet, die Mockups abgenommen und die Freigabe **ausdrücklich** erteilt
  sind — die stehende Freigabe „fertige Arbeit ausliefern" deckt das nicht ab.
- **Nie direkt auf `main` pushen.** Änderungen: Branch → PR → `gh pr merge --squash`
  (der Merge löst den Deploy aus). Reine Doku-Commits mit `[skip ci]`. Nach dem Deploy
  den **live ausgelieferten Bundle-Hash** prüfen
  (`curl -s https://tcp-spielplan.de/ | grep -oE 'assets/index-[^"]+\.js'`) und im
  Bundle nach einem neuen Datenschnipsel greppen — „grüner Workflow" allein reicht nicht.
- **Kein Bauen ohne Supabase-Env.** `.env` ist gitignored und existiert nur im
  Haupt-Checkout; im Worktree Dummy-Werte setzen, sonst weiße Seite
  („supabaseUrl is required"):
  `VITE_SUPABASE_URL=https://stub.supabase.co VITE_SUPABASE_ANON_KEY=stub npm run build`
  Im Worktree fehlt außerdem `node_modules` → einmal `npm install`; der Haupt-Checkout
  hat kein `puppeteer-core`, Browser-Crawls scheitern dort mit `ERR_MODULE_NOT_FOUND`.
  Eigene Hilfsskripte müssen **im Repo** liegen (sonst finden sie `node_modules` nicht)
  und danach wieder weg.
- **Uncommittete Fremdstände nie verwerfen.** Der Haupt-Checkout wurde am 09.09.2026 auf
  `origin/main` nachgezogen (hing 61 Commits zurück, blockiert von einem WIP-Stand vom
  April 2026; gesichert auf `wip/score-entry-april-2026`, überholt). Findet sich der
  Checkout wieder so vor: erst auf einem Branch committen und pushen, dann
  `git merge --ff-only origin/main` — kein Reset, kein blindes Stash, und die alten
  Worktrees unter `.claude/worktrees/` in Ruhe lassen.
- **Liga- und Spieldaten nur aus offiziellen BTV-Quellen** übernehmen, **verbatim** —
  auch wenn die BTV-Rangfolge „falsch" aussieht (bei ungleicher Spielzahl sortiert der
  BTV nach Punkt-Quotient). Nichts schätzen, nichts hochrechnen.
- **`src/data/meldelisten.ts` und `src/data/spielberichte-crawled.ts` sind generiert** —
  nur über `npm run crawl:meldelisten` bzw.
  `npm run crawl:spielberichte && npm run gen:spielberichte` ändern. Nach
  Datenänderungen `npm run check` laufen lassen (Tabellen ↔ Berichte ↔ Meldelisten).
- **UI-Änderungen im echten Browser prüfen** (headless Chrome gegen
  `npx vite preview`), nicht nur `tsc` und Build. Die App ist **mobil-erst**: Viewport
  **420×912**, `isMobile`/`hasTouch`, `.tap()` statt `.click()`. Beispiel-Checks:
  Reiter, Sektionen, Drilldown-Inhalt, Leerzustände, kein horizontaler Overflow.

---

## Befehle

```bash
# Entwicklung
npm install                        # im frischen Worktree nötig
npm run dev                        # Vite-Dev-Server
npm run build                      # tsc -b && vite build  (braucht Supabase-Env!)
npm run lint
npm run preview -- --port 4317

# Saison und Daten
npm run season                     # welche Saison ist dran? (alle Runden im Überblick)
npm run gen:standings              # Diff der Ergebnisse ansehen
npm run gen:standings -- --write   # Ergebnisse der laufenden Saison nachziehen
npm run check                      # Konsistenz  (-- --all für alle Saisons)
npm run crawl:spielberichte        # Spielberichte crawlen (langsam, braucht Chrome)
npm run gen:spielberichte          # Cache -> src/data/spielberichte-crawled.ts
npm run crawl:meldelisten          # Meldelisten crawlen
npm run season:new -- --discover-only    # Mannschaften + groupids einer neuen Runde
```

**Die Saison gibt niemand an.** Alle Skripte erkennen sie aus den eingetragenen
Spielterminen (`scripts/seasons.mjs`) und nennen beim Start, worauf sie wirken;
`--season <id>` lenkt um.

---

## Wo was liegt

| Zweck | Datei |
|---|---|
| **Saison-Registry der Skripte** (Gruppen, Layout, Datendatei je Saison) + Erkennung der laufenden Runde | `scripts/seasons.mjs` |
| Neue Saison komplett anlegen (Mannschaften, groupids, Spielplan, Spielorte) | `scripts/new-season.mjs` |
| **Welche Daten eine Saison zieht** (Teams, Matches, Standings, Monate, `supportsPdf`) | `src/data/season-data.ts` |
| Saison-Liste + Vorauswahl (`SEASONS[0]`) | `src/data/seasons.ts` |
| **Alle Typen des Projekts** | `src/types.ts` |
| Format je Konkurrenz (6er/4er) — fehlt ein Eintrag, gilt still „6er" | `src/data/team-format.ts` |
| Tabellen + Kreuztabellen (Sommer) + `SUMMER_STANDINGS_STAND` (Anzeige „BTV-Stand") | `src/data/summer-2026.ts` |
| Winterrunde 2026/27 komplett (Teams, Spielplan, Tabellen, Monatsfarben) | `src/data/winter-2627.ts` |
| Winterrunde 2025/26 (Archiv) | `src/data/winter-2526.ts` |
| Spielplan-Termine Sommer (bei Verlegung: Datum aus dem Spielbericht) | `src/data/matches.ts` |
| Ergebnis je Spielplan-Begegnung aus der Kreuztabelle ableiten | `src/data/results.ts` |
| Spielberichte (Einzel/Doppel je Begegnung) | `src/data/spielberichte-crawled.ts` (**generiert**) |
| Lookup drumherum | `src/data/spielberichte.ts` |
| Meldelisten (alle gemeldeten Spieler) | `src/data/meldelisten.ts` (**generiert**) |
| Crawler + Generatoren | `scripts/crawl-meldelisten.mjs`, `crawl-spielberichte.mjs`, `parse-spielbericht.mjs`, `generate-spielberichte.mjs`, `generate-standings.mjs` |
| Prüf-Skripte | `scripts/check-data.mjs`, `check-names.mjs`, `verify-parser.mjs` |
| Aggregation Spieler/Doppel | `src/data/player-stats.ts` |
| Spieler-Detailseite | `src/components/TeamStatsDetail.tsx` |
| Tabellen-Ansicht + Drilldown (**lazy geladen**) | `src/components/StandingsView.tsx` |
| Spielplan (Sommer und Winter, eine Komponente) | `src/components/TimelineView.tsx`, `MatchRow.tsx`, `MatchDetail.tsx` |
| Live-Zwischenstände (Supabase) | `src/hooks/useLiveScores.ts`, `src/components/LiveScorePanel.tsx`, `ScoreEntry.tsx`, `supabase-setup.sql` |
| Kalender-Downloads (Overlay aus dem ⋯-Menü) | `src/components/CalendarDownloads.tsx` |
| Zustand, Filter, Persistenz | `src/App.tsx` (`localStorage["tcp-filter-prefs"]`) |
| Deploy | `.github/workflows/deploy.yml` |

---

## Datenpflege in Kürze

**Neue Ergebnisse:** `npm run gen:standings` zieht Tabellen **und** (im Winter-Layout)
die Begegnungen selbst aus dem Crawl-Cache; verlegte Termine kommen mit. Sanity-Checks:
Summe der Einzel-/Doppel-Siege = Endergebnis der Begegnung, Kreuztabellen-Zelle =
Matchpunkte, Tabellen-Delta = Sätze/Spiele des neuen Berichts. Das `_STANDINGS_STAND`
der Saison setzt der Generator; bei Hand-Änderungen selbst nachziehen.

**Neue Saison anlegen:**
`npm run season:new -- --id <id> --label "<Name>" --layout winter|summer` schreibt die
Datendatei aus den BTV-Quellen und nennt die fünf Handgriffe danach
(`scripts/seasons.mjs`, `types.ts`, `seasons.ts`, `season-data.ts`, `team-format.ts`).
App-Komponenten bleiben unangetastet — Details im README („Eine Saison anlegen") und in
[docs/AUFGABEN.md](docs/AUFGABEN.md).

---

## Fertig ist eine Aufgabe erst, wenn …

- [ ] die Änderung tut, was beauftragt war — nicht mehr und nicht weniger
- [ ] `npm run lint` und `npm run build` sauber durchlaufen
- [ ] bei Datenänderungen `npm run check` grün ist
- [ ] bei UI-Änderungen im echten Browser (mobil, 420×912) nachgesehen wurde
- [ ] die betroffene Dokumentation im selben Zug nachgezogen ist
- [ ] PR gemergt, Deploy grün **und** der Bundle-Hash live gegengeprüft ist
- [ ] die Übergabe Branch/Commit, Änderung, **tatsächlich ausgeführte** Prüfungen,
      offene Punkte und den nächsten Schritt nennt

Was nicht geprüft wurde, wird auch nicht behauptet.
