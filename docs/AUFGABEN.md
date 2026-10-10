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
npm run crawl:spielberichte        # Berichte holen (langsam; -- <gruppe> --force für eine einzelne)
npm run gen:spielberichte          # Caches + Bestand → public/data (JSON je Gruppe/Verein, Suchindex)
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

**Niemals** `public/data/**`, `src/data/data-version.ts` oder `src/data/data-stand.ts` von Hand
editieren — sie werden vom Generator bzw. Wecker neu geschrieben, Handänderungen gehen verloren.
Der Generator übernimmt Gruppen ohne Cache aus dem Bestand; ein Crawl einer Saison lässt die
anderen unberührt. **Commit immer mit `public/data`** — die JSON-Dateien sind die Daten.

Seit 10.09.2026 macht das der **Wecker** rund um jede TCP-Begegnung automatisch — 7, 4 und 0
Tage davor und seit 08.10.2026 auch 1 und 3 Tage danach, sodass die Ergebnisse des Wochenendes
montags von selbst live sind (Abschnitt 9). Von Hand ist es für Nachlesen, Gruppen ohne
TCP-Begegnung und als wöchentliche Kontrolle (Skill `tcp-ergebnisse`) weiter nötig.

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
6. **Älteste Runde austragen** (Datenschutzerklärung Abschnitt 5 verspricht: laufende Runde
   plus vier davor, nicht mehr): ihren Block aus `scripts/seasons.mjs` entfernen, ihre Id aus
   `SeasonId` (`src/types.ts`) und `HISTORY_SEASONS` (`src/data/seasons.ts`) streichen,
   `public/data/groups/<id>/` löschen, danach `npm run gen:spielberichte` (baut Vereinsdateien
   und Suchindex ohne die alte Runde neu).

Danach `npm run season` — steht die neue Runde vorn, ziehen alle Werkzeuge ab sofort
auf sie. Und `node scripts/vollcrawl-gegner.mjs --all` für die Vorsaisons der neuen Gegner
(Abschnitt 9).

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
curl -s https://tcp-spielplan.de/data/groups/<saison>/<liga-slug>.json | grep -c '<schnipsel>'
```


**Ein grüner Workflow allein ist kein Beweis** — genau diese Verwechslung hat im Juni
2026 einen Deploy vorgetäuscht, der nie live ging. Deshalb immer der Griff ins
ausgelieferte Bundle. Spielberichte und Meldelisten stehen seit 08.10.2026 **nicht** im
Bundle, sondern unter `/data/…` (letzte Zeile oben); Tabellen und Spielplan stecken im
Chunk `StandingsView-*.js`.

Direkt nach „Deploy erfolgreich" kann der erste Abruf noch den alten Stand liefern.
Bei rotem Ergebnis erst den Hash prüfen, dann den Test wiederholen.

---

## 8. Fertig ist eine Aufgabe erst, wenn …

- [ ] die Änderung tut, was beauftragt war — nicht mehr und nicht weniger
- [ ] `npm run lint` und `npm run build` laufen sauber durch
- [ ] bei Datenänderungen: `npm run check` ist grün
- [ ] bei UI-Änderungen: im echten Browser gesehen, mobil (420×912)
- [ ] die betroffene Dokumentation ist im selben Zug nachgezogen
- [ ] PR gemergt, Deploy grün **und** der Bundle-Hash live gegengeprüft (mit Anmelde-Cookie —
      ohne ist jede Live-Prüfung wertlos, siehe Abschnitt 7)
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

**Voll-Crawl der Gegner zum Saisonwechsel** (neue Runde = neue Gegner; Thomas' Entscheidung vom
08.10.2026: **alle Erwachsenenklassen** jedes Gegnervereins, nicht nur die Klasse, in der er gegen
uns spielt — Spieler wechseln die Altersklasse, siehe README „Voll-Crawl aller Altersklassen"):

```bash
# Voraussetzung: die neue Saison ist angelegt (Abschnitt 3) und ihre Tabellen nennen die Gegner.
node scripts/vollcrawl-gegner.mjs --discover      # 1 je Vorsaison eine Gruppensuche, parallel (~3 h)
node scripts/vollcrawl-gegner.mjs --merge         # 2 Treffer als gegner: true in scripts/seasons.mjs
node scripts/vollcrawl-gegner.mjs --crawl         # 3 fehlende Gruppen crawlen, 6 parallel (--parallel n)
node scripts/vollcrawl-gegner.mjs --gen           # 4 generate-data, check --all, check-luecken
# oder alles hintereinander: node scripts/vollcrawl-gegner.mjs --all
```

Gegnervereine liest das Skript aus den Tabellen der laufenden Saison, Vorsaisons sind alle
anderen Saisons der Registry (`--seasons a,b` schränkt ein). Zwischenstände liegen in
`scripts/tmp/` (gitignored): `found-<saison>.json` je Suche, `logs/` je Crawl. Abgebrochene
Läufe einfach neu starten — Suche und Crawl überspringen, was schon da ist. Danach
`scripts/check-luecken.mjs` lesen: Gemeldete ohne Einsatz unter den Top 6 einer Gegnerliste
deuten auf eine Gruppe, die der BTV in keiner durchsuchten Region führt (dann von Hand mit
`discover-groups.mjs --clubs "<Verein>" --klassen "<Klasse>" --regions …`). Pro Altersklasse
und Region braucht die Suche drei bis acht Minuten, der Crawl zwei bis vier Minuten je Gruppe.
`gegner`-Gruppen tauchen nie in Tabellen, Spielplan oder Wecker auf; `gen:standings` überspringt
Ligen, die nicht in der Datendatei stehen.

Einzelne Gruppe nachziehen (wie bis 06.10.2026):

```bash
node scripts/discover-groups.mjs --season "Sommer 2026" --klassen "Herren" \
  --clubs "TC Riemerling" --out scripts/tmp/found-x.json
# → Treffer als { …, gegner: true } vor "// DISCOVER:<id>" in scripts/seasons.mjs (oder --merge)
npm run crawl:spielberichte -- <groupid> --season sommer-26
npm run crawl:meldelisten  -- <groupid> --season sommer-26
npm run gen:spielberichte && npm run check -- --all
```

**Widerspruch einer Person eintragen** (Datenschutzerklärung Abschnitt 7; Zusage: innerhalb
einer Woche):

```bash
# scripts/sperrliste.json: { "club": "<Verein ohne Ziffer>", "name": "Nachname, Vorname" } anhängen
npm run gen:spielberichte          # schreibt die Person überall als Initialen, entfernt Suche + Historie
npm run check -- --all
# Branch → PR → Squash-Merge, Live prüfen: der Klarname darf in keiner /data-Datei mehr vorkommen
curl -s https://tcp-spielplan.de/data/search.json | grep -c "<Nachname>"
```

**Achtung, Gegenprobe:** „0" beweist hier nur dann etwas, wenn der Abruf wirklich die Datei
liefert (ein Tippfehler im Pfad liefert eine Fehlerseite, und „0" täuscht eine Löschung vor). Deshalb
denselben Befehl einmal mit einem Namen laufen lassen, der sicher drinsteht (er muss > 0 zählen).

Der Schutz läuft im Generator (`scripts/schutz.mjs`): Minderjährige (Jahrgang ≥ laufendes
Jahr − 18 laut irgendeiner Meldeliste) und Jugend-Konkurrenzen werden automatisch genauso
behandelt — Initialen, kein Jahrgang, keine Nation, nicht suchbar, keine Historie. Jahrgänge
stehen nur noch in den TCP-eigenen Meldelisten.

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
- **Meldelisten frisch holen:** `crawl:meldelisten` überspringt alles, was im Saison-Cache steht —
  auch Mannschaften mit **leerer** Liste — und hat kein `--force`. Vor dem Saisonstart sind die
  Listen beim BTV noch leer (Winter 26/27: am 10.09. leer, am 16.09. die vorläufigen Meldungen
  da — sichtbar erst mit einem Crawl ohne den alten Cache). Lokal deshalb vorher
  `rm scripts/.meldelisten-cache-<saison>.json` — gefahrlos, die übrigen
  Gruppen übernimmt der Generator aus dem Bestand. Der Wecker auf dem Runner hat keinen Cache.

---

## 10. Zugang: die Seite ist offen

Seit 10.10.2026 ist die Seite wieder **ohne Passwort** erreichbar (Hintergrund: ARCHITEKTUR.md,
Abschnitt 11.1). Die Anmeldung vom 09.10.2026 nimmt auf dem Server ein Skript zurück — ein
**Eingriff auf dem Server** (Abschnitt 6): Thomas führt es selbst als root aus, Agenten bereiten
den Befehl vor:

```bash
# aus dem Haupt-Checkout, nach git pull (das Skript wird lokal gelesen und per ssh hineingereicht)
ssh hetzner 'bash -s' < docs/server/nginx-login-entfernen.sh
```

Erwartete Ausgabe:

```
Site-Konfiguration angepasst: Anmelde-Tor entfernt
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
Anmeldung entfernt — tcp-spielplan.de ist ohne Passwort erreichbar
```

Prüfen (beides `200`, kein `302`):

```bash
curl -sI https://tcp-spielplan.de/ | head -1
curl -sI https://tcp-spielplan.de/data/search.json | head -1
```

- **Wiederholungslauf** ist harmlos („schon offen"). Scheitert ein Schritt, spielt das Skript die
  Sicherung aus `/etc/nginx/backups/` zurück — dann gilt der alte Stand unverändert weiter.
- **Wieder schließen** ginge mit den alten Skripten aus der Git-Historie (`nginx-login.sh`, bis
  Commit `3e670b0`) plus `public/login.html` — nur auf ausdrücklichen Auftrag, und die
  Datenschutzerklärung (`src/components/LegalPages.tsx`) im selben Zug anpassen.
