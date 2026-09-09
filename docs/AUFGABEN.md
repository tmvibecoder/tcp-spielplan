# Aufgaben — Rezepte für die typischen Aufträge

> Diese Seite beantwortet: **„Ich soll X ändern — was genau tue ich?"**
> Sie setzt voraus, dass [ARCHITEKTUR.md](ARCHITEKTUR.md) gelesen ist; Fachbegriffe
> stehen im [Glossar](GLOSSAR.md). Die verbindlichen Regeln stehen in
> [../AGENTS.md](../AGENTS.md) — sie gehen im Zweifel vor.

---

## 0. Die ersten Minuten in diesem Repo

Immer zuerst, bei jedem neuen Auftrag:

```bash
git status --short --branch      # was liegt hier herum?
git log --oneline -5             # wo stehen wir?
npm run season                   # welche Saison ist gerade dran?
```

**Nichts wegräumen, was man nicht selbst angelegt hat.** Uncommittete Änderungen,
untracked Dateien und fremde Worktrees bleiben unberührt — kein `stash`, kein `reset`,
kein `clean`, kein Branchwechsel „für einen sauberen Start".

Entwicklungsumgebung:

```bash
npm install                      # in einem frischen Worktree nötig
npm run dev                      # Vite-Dev-Server
```

Zum Bauen und für jeden Browser-Test werden **Supabase-Env-Variablen** gebraucht, sonst
rendert die App eine leere Seite. Im Haupt-Checkout liegt eine `.env` (gitignored); in
einem Worktree genügen Attrappen:

```bash
VITE_SUPABASE_URL=https://stub.supabase.co VITE_SUPABASE_ANON_KEY=stub npm run build
```

---

## 1. Eine Funktion oder die Oberfläche ändern (der Normalfall)

**Vorgehen**

1. Die zuständige Datei über die Tabelle „Wo was liegt" in [AGENTS.md](../AGENTS.md)
   finden — nicht raten, nicht querbeet suchen.
2. Ändern. Dabei den Stil der Umgebung übernehmen: Tailwind-Klassen statt eigener CSS,
   deutsche Kommentare, bestehende Hilfsfunktionen aus `src/utils/` nutzen.
3. **Saisonneutral bleiben.** Kein `if (season === "sommer-26")` in Komponenten — wenn
   sich Saisons unterscheiden, gehört das Merkmal in `SeasonData`
   (`src/data/season-data.ts`), so wie `supportsPdf`.
4. Prüfen:

```bash
npm run lint
VITE_SUPABASE_URL=https://stub.supabase.co VITE_SUPABASE_ANON_KEY=stub npm run build
npm run preview -- --port 4317
```

5. **Im echten Browser ansehen** — headless Chrome, mobiler Viewport **420×912**,
   `isMobile: true, hasTouch: true`, `.tap()` statt `.click()`. Prüfen: rendert die
   Seite überhaupt, funktionieren beide Reiter, sieht die Änderung aus wie gedacht, und
   ist `document.documentElement.scrollWidth > clientWidth` weiterhin `false`?
6. Ausliefern nach Abschnitt 7.

**Nützliche Selektoren für den Smoke-Test**

| Was | Selektor |
|---|---|
| Liga-Akkordeon in der Tabelle | `button` mit Text `Gr. <NNN>` |
| Kreuztabellen-Zelle | `button[title$="Spielbericht öffnen"]` |
| gespeicherte Filterauswahl | `localStorage["tcp-filter-prefs"]` |

**Fallen**

- `StandingsView` ist **lazy** — nach einer Änderung dort den Reiter „Tabelle" wirklich
  öffnen, sonst prüft man nichts.
- `TeamFilter` fällt ohne Props still auf die **Sommer**-Daten zurück.
- Der PDF-Export kann nur Sommer (`supportsPdf`).

---

## 2. Ergebnisse nachziehen (der häufigste Datenauftrag)

Neue Spieltage sind gelaufen, die App soll aktuell werden.

```bash
npm run season                     # welche Saison ist dran?
npm run crawl:spielberichte        # Berichte holen (langsam; -- <gruppe> für eine einzelne)
npm run gen:standings              # Diff ansehen — schreibt noch nichts
npm run gen:standings -- --write   # übernehmen
npm run check                      # Konsistenz prüfen
```

Der Generator schreibt bei Winter-Saisons **Tabellen und Begegnungen**, bei
Sommer-Saisons nur die Tabellen; verlegte Termine kommen mit. `standingsStand` setzt er
selbst.

**Sanity-Checks von Hand** (der Reihe nach, sie greifen ineinander):

- Summe der gewonnenen Einzel und Doppel = Endstand der Begegnung
  *(Ausnahme: Strafwertung — dann gewinnt das offizielle Ergebnis)*
- Kreuztabellen-Zelle = Matchpunkte der Begegnung
- Tabellen-Delta = Sätze und Spiele des neuen Berichts

Eine ausführliche Schritt-für-Schritt-Fassung inklusive Formulierungen steht in
**[SKILL-VORLAGE-ergebnisse-nachziehen.md](SKILL-VORLAGE-ergebnisse-nachziehen.md)**.

**Niemals** `src/data/spielberichte-crawled.ts`, `src/data/meldelisten.ts` oder
`src/data/data-stand.ts` von Hand editieren — sie werden komplett neu geschrieben, Handänderungen
gehen verloren. Beide Datendateien enthalten **alle Saisons**; ein Crawl einer Saison lässt die
anderen unberührt.

Seit 10.09.2026 macht das der **Wecker** rund um jede TCP-Begegnung automatisch (Abschnitt 9);
von Hand ist es weiter für Nachlesen und Gruppen ohne TCP-Begegnung nötig.

---

## 3. Eine neue Saison anlegen

Sobald der BTV die Spieltage der nächsten Runde veröffentlicht hat:

```bash
npm run season:new -- --discover-only                                   # nur ansehen
npm run season:new -- --id sommer-27 --label "Sommer 2027" --layout summer
```

Das Skript holt Mannschaften und `groupid`s aus dem Vereins-Widget, zieht die
Spielplan-Reports, ergänzt die Spielorte und schreibt eine fertige `src/data/<id>.ts`.
Danach nennt es die **fünf Handgriffe**, die es nicht selbst erledigen kann:

1. `scripts/seasons.mjs` — neuen Saison-Block **nach vorn** (inklusive `groupid`s)
2. `src/types.ts` — `SeasonId` um die neue Id erweitern
3. `src/data/seasons.ts` — die laufende Runde **nach vorn**, `SEASONS[0]` ist die Vorauswahl
4. `src/data/season-data.ts` — Eintrag in der Registry (`supportsPdf` nur bei Sommer)
5. `src/data/team-format.ts` — neue Konkurrenz-Ids eintragen, **sonst gilt still `"6er"`**

Danach `npm run season` — steht die neue Runde vorn, ziehen alle Werkzeuge ab sofort
auf sie.

**Gegenlesen, was das Skript nicht wissen kann:**

- Das Widget nennt zweite Mannschaften oft nur „Herren 30"; die römische Ziffer leitet
  das Skript aus dem Vereinsnamen ab („TC Pliening II") und meldet doppelte Namen.
- `layout` und `teamSize` je Gruppe gegen den Blanko-Spielbericht (nu.Dokument 011d)
  prüfen — das Format bestimmt die Positionsnummern.

**Komponenten müssen nicht angefasst werden.** Wer beim Anlegen einer Saison eine
Komponente ändern muss, hat vermutlich die Registry übersehen.

---

## 4. Am Crawler oder Parser arbeiten

Crawl und Parsing sind **absichtlich getrennt**: der Crawl legt Rohtext im Cache ab,
der Parser wertet ihn aus. Am Parser lässt sich deshalb iterieren, ohne erneut zu
crawlen (was ~45 Minuten kostet).

```bash
node scripts/parse-spielbericht.mjs   # reines Text-Parsing, kein Netz
node scripts/verify-parser.mjs        # Ausgabe gegen bekannte Daten diffen
```

**Die dokumentierten Stolperfallen in den Crawlern sind Narben, keine Umständlichkeit** —
nicht „wegoptimieren". Die wichtigsten (vollständig im README):

- „MEHR LADEN" so oft klicken, bis der Button verschwindet, sonst fehlen Mannschaften.
- ZK-Pager bleibt beim Mannschaftswechsel stehen → vorher `a.z-paging-first` klicken.
- Der Frame wird bei Fehlern *detached* → Seite neu aufbauen **und den Frame neu holen**.
- Gespielte Begegnungen erkennt man an `span.gb-status` mit Text **„anzeigen"**
  (kleingeschrieben — die Großschreibung macht erst das CSS).
- Vereinslinks nur aus der oberen Tabelle holen, nicht aus dem Spielplan darunter (dort
  stehen Spielorte ohne Portrait, die ins Timeout laufen).

---

## 5. Nur die Dokumentation ändern

- Prüfen heißt hier: **Diff lesen, Querverweise und Konsistenz prüfen**. Keine Tests
  behaupten, die nicht gelaufen sind.
- Commit-Message mit **`[skip ci]`** versehen — dann läuft korrekt kein Deploy und der
  ausgelieferte Bundle-Hash bleibt gleich.
- Neues dauerhaftes Projektwissen gehört in die zugeordnete Doku
  (`AGENTS.md`, `README.md`, `docs/…`), nicht in eine neue Streudatei.

---

## 6. Etwas, das nicht in dieses Repo gehört

Nicht selbst entscheiden, sondern nachfragen — insbesondere bei:

- **Datenverlust-Risiko** (Caches verwerfen, `--force`, generierte Dateien überschreiben,
  fremde Branches oder Worktrees anfassen)
- **Eingriffen in fremde Systeme** (Server, DNS, Supabase-Projekt, GitHub-Secrets)
- **Daten aus inoffiziellen Quellen** — es gibt nur BTV/nuLiga

---

## 7. Ausliefern — die verbindliche Reihenfolge

Es gibt eine **stehende Freigabe (07.09.2026)**: fertige, geprüfte Änderungen werden
**ohne Rückfrage** gemergt und live genommen. Sie ersetzt **keine** Prüfung.

```bash
git checkout -b <sprechender-branchname>
git add <nur die eigenen Dateien>
git commit -m "…"                       # Doku-Commits: [skip ci]
git push -u origin <branch>
gh pr create --fill
gh pr merge --squash                    # löst den Deploy aus
```

**Nie direkt auf `main` pushen.** Nach dem Merge:

```bash
gh run list --limit 3                                                   # Action grün?
curl -s https://tcp-spielplan.de/ | grep -oE 'assets/index-[^"]+\.js'   # neuer Hash?
curl -s https://tcp-spielplan.de/assets/index-XXXX.js | grep -c '<schnipsel>'
```

**Ein grüner Workflow allein ist kein Beweis** — genau diese Verwechslung hat im Juni
2026 einen Deploy vorgetäuscht, der nie live ging. Deshalb immer der Griff ins
ausgelieferte Bundle. Für Tabellen- und Spielbericht-Inhalte im Chunk
`StandingsView-*.js` suchen oder die Live-Seite im Browser prüfen — sie stehen **nicht**
im Startbundle.

Direkt nach „Deploy erfolgreich" kann der erste Abruf noch den alten Stand liefern.
Bei rotem Ergebnis erst den Hash prüfen, dann den Test wiederholen.

---

## 8. Fertig ist eine Aufgabe erst, wenn …

- [ ] die Änderung tut, was beauftragt war — nicht mehr und nicht weniger
- [ ] `npm run lint` und `npm run build` laufen sauber durch
- [ ] bei Datenänderungen: `npm run check` ist grün
- [ ] bei UI-Änderungen: im echten Browser gesehen, mobil (420×912)
- [ ] die betroffene Dokumentation ist im selben Zug nachgezogen
- [ ] PR gemergt, Deploy grün **und** der Bundle-Hash live gegengeprüft
- [ ] die Übergabe nennt: Branch/Commit, Änderung, **tatsächlich ausgeführte** Prüfungen,
      offene Punkte, nächster Schritt

Was nicht geprüft wurde, wird auch nicht behauptet.

---

## 9. Suche, Spielerhistorie, Gegnerbriefing und Wecker pflegen

Gebaut am 09./10.09.2026 (Freigabe des Auftraggebers). Aufbau in
[ARCHITEKTUR.md, Abschnitt 13](ARCHITEKTUR.md), Fachliches im README.

**Eine weitere (auch vergangene) Saison erfassen:**

```bash
node scripts/discover-groups.mjs --season "Sommer 2024"        # groupids mit TC Pliening (btv.de-Archiv)
# → Block in scripts/seasons.mjs anlegen (historyOnly: true, dataFile: null, groups aus der Ausgabe),
#   SeasonId in src/types.ts und HISTORY_SEASONS in src/data/seasons.ts erweitern
npm run crawl:spielberichte -- --season sommer-24               # Berichte (Cache je Saison)
npm run crawl:meldelisten -- --season sommer-24                 # Meldelisten (schreibt die Datei gleich mit)
npm run gen:spielberichte && npm run check -- --all
```

Mixed-Runden sind beim BTV eigene Saisons („Mixed 2025", Region Südbayern, Altersbereiche wie
sonst — Klassen heißen „MIXED 00 A/B", „MIXED 40 A" …); ihre Gruppen gehören in den Block der
zugehörigen Sommer-Saison. Jugend-Klassen nur mit `--jugend`.

**Wecker prüfen oder von Hand auslösen:**

```bash
node scripts/briefing-run.mjs --dry-run          # was wäre heute fällig, wann ist der nächste Lauf?
node scripts/briefing-run.mjs --force            # alle Gruppen mit Begegnungen ab heute einlesen (lokal)
node scripts/briefing-run.mjs --stand-only       # nur src/data/data-stand.ts (nächster Lauf) neu schreiben
```

Auf GitHub: *Actions → „Gegnerbriefing aktualisieren" → Run workflow* (Haken „Lauf erzwingen").
Der Lauf erzeugt bei Änderungen einen Bot-PR `bot/briefing-<Datum>`, mergt ihn selbst und startet
den Deploy — danach wie immer den Bundle-Hash prüfen, wenn man es genau wissen will.

**Wenn ein Wecker-Lauf rot ist** (E-Mail von GitHub): Protokoll im Actions-Reiter lesen. Typisch:
BTV/Widget nicht erreichbar (nächste Nacht klappt es meist), `check-data` rot (dann die Abweichung
wie in Abschnitt 2 klären), Chrome-Absturz (nochmal per *Run workflow*). Der alte Datenstand
bleibt bis dahin live; das ⋯-Menü zeigt sein Alter.

**Fallen:**

- Gruppennummern wiederholen sich über Jahre — ohne `season` im Schlüssel überschreiben sich
  Berichte. Alle Lookups nehmen die Saison als ersten Parameter.
- Die Generatoren übernehmen Ligen ohne Cache aus dem Bestand; wer eine Liga wirklich **entfernen**
  will, muss sie aus der Datendatei löschen, nicht nur aus dem Cache.
- Der Wecker darf nie Ligen aus `keepLeagues` überschreiben (`generate-standings.mjs` lässt sie
  aus) und crawlt nur die Gruppen der fälligen Begegnungen.
- `discover-groups.mjs` braucht `pdftotext` (poppler) für die Liganamen; ohne rekonstruiert es die
  Schreibweise aus der Großschreibung des Widgets — dann gegenlesen.
