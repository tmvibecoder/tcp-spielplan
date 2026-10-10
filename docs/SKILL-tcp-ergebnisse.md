---
name: tcp-ergebnisse
description: Prüft für die Tennis-App tcp-spielplan.de (Repo tmvibecoder/tcp-spielplan), ob es beim BTV neue Mannschaftsergebnisse der laufenden Runde gibt, und zieht sie komplett nach — Spielberichte crawlen, Tabellen, Begegnungen und Meldelisten aktualisieren, Konsistenz prüfen, bauen, per PR deployen und die Live-Daten verifizieren. Nutze diesen Skill immer, wenn Tommy nach neuen Tennis-Ergebnissen fragt oder die Seite aktualisieren will — auch bei knappen Zurufen wie "gibt's was Neues?", "Ergebnisse nachziehen", "tcp-spielplan aktualisieren", "Wochenende eintragen", "BTV prüfen", "Spielbericht fehlt noch" oder wenn er nur eine Begegnung, eine Gruppennummer oder einen Spieltag nennt, ohne den Ablauf zu erklären.
---

# BTV-Ergebnisse prüfen und auf tcp-spielplan.de nachziehen

> Stand 09.10.2026 (Live-Checks mit Anmelde-Cookie). Diese Datei im Repo (`docs/SKILL-tcp-ergebnisse.md`) ist die Quelle des
> Skills in der Claude-App — bei Änderungen dort den Text neu einfügen.

## Auftrag

Prüfe alle Gruppen der **laufenden Saison** auf neue Ergebnisse, trage sie ins Repo ein und
bringe sie bis auf die Live-Seite. Gibt es nichts Neues, ist der Auftrag nach Schritt 1 erledigt —
dann nur kurz Bescheid geben, nichts crawlen, nichts committen.

Repo `tmvibecoder/tcp-spielplan`, lokal `/Users/thomasmiler/Claude/Projects/tcp-spielplan`,
live https://tcp-spielplan.de.

**Die Doku steht im Repo — lies sie, dupliziere sie nicht:** `AGENTS.md` (Regeln, Befehle, wo was
liegt), `docs/AUFGABEN.md` §2 und §7 (Rezept und Ausliefern), `README.md` „Daten pflegen", bei
Crawler-Problemen `docs/SKILL-VORLAGE-ergebnisse-nachziehen.md` (Stolperfallen).

## Was der Wecker schon macht

`.github/workflows/briefing.yml` crawlt die Gruppen jeder TCP-Begegnung automatisch 7, 4 und 0
Tage davor **und 1 und 3 Tage danach** (Ergebnis-Nachlauf) und deployt per Bot-PR. Dieser Skill
ist die wöchentliche Kontrolle und der Nachlauf für alles, was der Wecker nicht sieht:
Begegnungen anderer Vereine in unseren Gruppen, Nachholspiele, Korrekturen des BTV, ein roter
Wecker-Lauf (GitHub schickt dann eine E-Mail). Zuerst nachsehen, ob der Wecker zuletzt grün war:
`gh run list --workflow briefing.yml --limit 5` und das ⋯-Menü der App („Datenstand").

## Harte Regeln

1. **Immer im frischen Worktree von `origin/main` arbeiten**, nie im Haupt-Checkout (er hängt
   regelmäßig zurück): `git fetch origin && git worktree add .claude/worktrees/ergebnisse-<datum> -b ergebnisse-<datum> origin/main`,
   dort `npm ci`.
2. **Nie direkt auf `main` pushen.** Branch → PR → `gh pr merge --squash`. Der Merge löst den Deploy aus.
3. **Nach dem Merge die Live-Daten verifizieren** (Schritt 6). Ein grüner Actions-Run allein beweist nichts.
4. **Generierte Dateien nie von Hand editieren**: `public/data/**`, `src/data/data-version.ts`,
   `src/data/data-stand.ts`. Sie entstehen aus den Skripten. **`public/data` immer mitcommitten.**
5. **Bekannte korrekte Ausnahmen nicht „reparieren"** (siehe unten).
6. **Rangfolgen verbatim vom BTV übernehmen.** Bei ungleicher Spielzahl sortiert der BTV nach
   Punkt-Quotient — „falsch" aussehende Reihenfolgen sind korrekt.
7. **Die Saison gibt niemand an.** Die Skripte erkennen sie selbst (`npm run season` zeigt sie);
   `--season <id>` nur für Nachlesen einer beendeten Runde.

## Ablauf

### 1. Schnell-Check per curl (immer zuerst, kein Browser)

Für jede Gruppe der laufenden Saison (groupids in `scripts/seasons.mjs`, Block der Saison ohne
`gegner: true`) das Spielplan-PDF ziehen und mit der Datendatei der Saison vergleichen
(`src/data/winter-2627.ts` im Winter: Begegnungen mit `status: "open"`, deren Termin vorbei ist;
im Sommer `summer-20xx.ts`: Kreuztabellen-Zellen `"0:0"`):

```
curl -sL -A "Mozilla/5.0" "https://btv.liga.nu/cgi-bin/WebObjects/nuLigaDokumentTENDE.woa/wa/nuDokument?dokument=ScheduleReportFOP&group=<groupid>" | pdftotext -layout - - | head -80
```

`-L` ist Pflicht (der Redirect hängt das `etag` an). **Nichts Neues → hier aufhören und melden.**

### 2. Spielberichte crawlen — nur für betroffene Gruppen

```
npm run crawl:spielberichte -- <groupid> --force     # je Gruppe, wenige Minuten
npm run crawl:meldelisten  -- <groupid>              # Nachmeldungen, LK-Änderungen (Cache-Hinweis unten)
npm run gen:spielberichte                            # Caches + Bestand → public/data
```

`--force` ist nötig, sonst kommt der gecachte alte Stand zurück. Der **Meldelisten-Crawler kennt
kein `--force`** und überspringt alles, was im Saison-Cache steht — auch leere Listen. Für frische
Meldelisten vorher `rm scripts/.meldelisten-cache-<saison>.json` (gefahrlos: Gruppen ohne Cache
übernimmt der Generator aus dem Bestand). Braucht Google Chrome
(`CHROME_PATH` überschreibbar) und `puppeteer-core`. Nie pauschal alles neu crawlen.

### 3. Tabellen und Begegnungen nachziehen

```
npm run gen:standings              # Diff ansehen
npm run gen:standings -- --write   # schreiben (Winter: Tabellen UND Begegnungen inkl. Verlegungen)
```

### 4. Konsistenz prüfen (Pflicht vor jedem Commit)

```
npm run check                  # Tabellen <-> Berichte <-> Meldelisten, Winter: Begegnung <-> Kreuztabelle
node scripts/check-names.mjs   # Berichts-Spieler ohne Meldelisten-Eintrag (= Ersatzspieler, kein Fehler)
```

Meldungen gegen die Ausnahmenliste abgleichen, bevor du etwas änderst. `check` meldet fehlende
Spielplan-Zeilen NICHT — bei Zweifeln Begegnungen je Team gegen Gruppengröße (n−1) gegenlesen.

### 5. Bauen und im Browser prüfen

```
VITE_SUPABASE_URL=https://stub.supabase.co VITE_SUPABASE_ANON_KEY=stub npm run build
npx vite preview --port 4517
```

Ohne die Stub-Env crasht die App (weiße Seite). Im headless Chrome (Viewport 420×912) den Pfad
Spielplan → Begegnung → Spielbericht und Tabelle → Liga → Mannschaft durchklicken und die neuen
Ergebnisse tatsächlich sehen; die Daten kommen per `fetch` aus `/data/…` (Netzwerkfehler = rot).

### 6. Deployen und verifizieren

```
git add -A && git commit -m "<Saison>: Ergebnisse vom <Datum> nachgezogen"
git push -u origin <branch>
gh pr create --fill && gh pr merge <nr> --squash
```

Warten, bis der Actions-Run auf `main` grün ist, dann prüfen — **die Daten liegen nicht im
Bundle, sondern unter `/data`**:

```
curl -sI https://tcp-spielplan.de/ | head -1          # muss 200 sein
curl -s https://tcp-spielplan.de/data/groups/<saison>/<liga-slug>.json | grep -c "<Nachname eines neuen Berichts>"
curl -s https://tcp-spielplan.de/ | grep -oE 'assets/index-[^"]+\.js'     # Bundle-Hash nur zur Info
```

Liga-Slug = Liganame klein, Umlaute aufgelöst, alles andere Bindestrich („Südliga 2 · Gr. 129" →
`suedliga-2-gr-129`). Trifft der grep 0, ist der Deploy nicht durch — nicht „grün" melden.
**Aber erst die erste Zeile prüfen:** Ohne gültiges Cookie kommt `302` (Weiterleitung zur
Anmeldeseite), und der grep zählt dann immer 0 — das ist ein falsches Cookie, kein fehlender Deploy.

## Bekannte korrekte Ausnahmen — nicht reparieren

- **Sommer 2026 Gr. 315**: Markt Schwaben–Forstinning 6:3 ohne Spielbericht (Forstinning
  zurückgezogen, nuLiga liefert nichts mehr). **Gr. 043 SU**: Schloßberg–Grün-Gold 1:3 in der
  Tabelle, gespielt 2:7 (BTV-Streichung). Beide Ligen stehen in `keepLeagues` und bleiben handgepflegt.
- **Gr. 870 (Midcourt U10)**: keine Meldelisten in nuLiga.
- **Spieler ohne Meldelisten-Eintrag**: Ersatzspieler aus anderen Mannschaften des Vereins, in
  der App unter „Weitere Einsätze".
- **Endstand ≠ Summe der Matchsiege** kommt bei Strafwertungen vor. Der Spielplan-Endstand gilt;
  der Generator meldet das als HINWEIS.
- Vereins-Aliasse gelten je Liga (`CLUB_ALIASES` im Meldelisten-Crawler).

## Abschlussmeldung an Tommy

Kompakt, auf Deutsch, keine Code-Ausgaben. Tommy liest keinen Code — beschreibe Ergebnisse, nicht Befehle.

**Wenn nichts Neues:** ein Satz, z. B. „Alle 7 Gruppen geprüft, keine neuen Ergebnisse seit dem
Wecker-Lauf vom <Datum>." Nichts anderes anhängen.

**Wenn etwas Neues:** genau diese vier Punkte.

```
**Neue Ergebnisse:** <Konkurrenz — Begegnung — Endstand>, je eine Zeile
**Tabelle:** was sich geändert hat, TC Pliening zuerst (Rang vorher → nachher, Punkte)
**PR:** #<Nummer>, gemerged
**Live:** verifiziert / nicht verifiziert (mit Grund)
```

Danach höchstens noch offene Punkte in ein bis zwei Sätzen (fehlender Bericht, Hinweis aus den
Konsistenz-Checks, Crawl abgebrochen). Wenn ein Schritt fehlgeschlagen ist, sag klar wo.
