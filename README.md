# TC Pliening – Spielplan & Tabellen

React/Vite-App für Spielplan, Tabellen und Statistik des TC Pliening (Sommer-Saison 2026). Live: https://tcp-spielplan.de

## Features

- **Spielplan** – alle Begegnungen mit **offiziellem Endergebnis** (grün/rot/gelb aus Sicht des TC Pliening, „gestrichen" bei zurückgezogenen Mannschaften); springt beim Laden automatisch ans nächste Wochenende („Nächstes"-Marke). Spiel antippen → Endergebnis, Spielort mit Google-Maps-Link und **Spielbericht (Einzel/Doppel)**. Die Ergebnisse kommen ohne Extra-Daten aus den Kreuztabellen (`src/data/results.ts`), Winter-Begegnungen bringen sie direkt mit.
- **Konkurrenz-Filter** – einzelne Mannschaften/Konkurrenzen ein-/ausblenden, `Nur Heim`, `Alle aus`/`Alle an` und **gespeicherte Auswahl** (seit 2026-06-22) – siehe unten.
- **Tabellen** je Konkurrenz mit **Kreuztabelle**. Auf ein Ergebnis in der Kreuztabelle tippen → **Spielbericht** (Einzel/Doppel) der Begegnung.
- **Spieler-Statistik je Mannschaft** (seit 2026-06-18) – Mannschaftszeile antippen. Seit 15.08.2026 mit **kompletter Meldeliste** (alle gemeldeten Spieler mit Rang), getrennt nach **Einzel** und **Doppel** – siehe unten.

### Konkurrenz-Filter & gespeicherte Auswahl

Über dem Spielplan stehen die Konkurrenzen nach Kategorie (HERREN/DAMEN/MIXED/JUGEND); ein Klick blendet eine Mannschaft ein/aus, ein Klick auf die Kategorie-Überschrift schaltet die ganze Kategorie um. In der unteren Zeile:

- **`Alle aus` / `Alle an`** – ein Toggle-Button, der sich nach dem Zustand richtet: solange **noch eine** Konkurrenz aktiv ist, heißt er `Alle aus` (Klick → alle ab); ist **keine** aktiv, heißt er `Alle an` (Klick → alle ein). Wirkt nur auf die **gerade angezeigte Saison** (Sommer **oder** Winter), nicht auf beide.
- **`Nur Heim`** – blendet Auswärtsbegegnungen aus (saisonübergreifender Schalter).

**Auswahl speichern:** Unten im **„Konkurrenzen"-Panel** liegt **`Auswahl speichern`**. Das schreibt die aktuelle Auswahl **explizit** (nicht automatisch) in `localStorage` und zeigt kurz „✓ Gespeichert". Beim nächsten Seitenaufruf wird sie automatisch geladen – ohne erneutes Einstellen.

**Code-Landkarte:**
- `src/components/TeamFilter.tsx` – Filter-UI; `Alle aus`/`Alle an` leitet sich aus `anyActive` über alle Kategorie-IDs ab und ruft den Prop `setAllTeams(on)`.
- `src/App.tsx` – Quelle der Wahrheit: getrennte Sets `activeSummerTeams` / `activeWinterTeams` (+ `homeOnly`). `setAllTeams` wirkt auf die aktive Saison. **Persistenz**: `loadPrefs()` einmalig beim Mount (initialisiert die State-Sets), `savePrefs()` schreibt auf Knopfdruck.
- `src/components/TeamFilterDropdown.tsx` – Button `Auswahl speichern` (Prop `onSavePrefs`) inkl. „✓ Gespeichert"-Flash.
- `localStorage`-Key **`tcp-filter-prefs`**, Format `{ "summer": string[], "winter": string[], "homeOnly": boolean }` (Team-IDs der **aktiven** Konkurrenzen, beide Saisons in einem Eintrag). Liegt neben dem separaten Favoriten-Key `tcp-favorites` aus `src/hooks/useFavorites.ts`.

### Spieler-Statistik je Mannschaft

In der **Tabelle** eine **Mannschaftszeile antippen** (›-Pfeil rechts) → Detailseite mit zwei Reitern.
Welche Ansicht erscheint, hängt davon ab, ob für die Mannschaft eine **Meldeliste** vorliegt
(`src/data/meldelisten.ts`, seit 15.08.2026 für alle sechs Spielbericht-Konkurrenzen):

**A) Mit Meldeliste — „Einzel" / „Doppel", jeweils die KOMPLETTE Mannschaft** (Normalfall)

- Beide Reiter listen **alle gemeldeten Spieler** in **Rang-Reihenfolge** (Rang = Meldeposition laut
  nuLiga, steht vorne in der Pille), Herren und Damen als eigene Sektionen — leere Sektionen werden
  ausgeblendet, Herren-Ligen zeigen also keine leere Damen-Liste.
- **Einzel**: Ø-Einzel-Position + Einzel-Bilanz (grün:rot). Aufklappen → jedes Einzel mit Gegner,
  dessen LK, Satz-Ergebnis, **SIEG/NIEDERL.**; **▲ LK-Sieg** = gegen besseren (niedrigeren) LK
  gewonnen, **▼** = gegen schwächeren verloren.
- **Doppel**: Doppel-Bilanz **pro Person** (nicht pro Paarung). Aufklappen → je Einsatz
  „mit &lt;Partner&gt;", darunter Gegnerpaar · gegnerische Mannschaft · Ergebnis.
- Wer noch nicht gespielt hat, steht gedimmt auf **„ohne Einzel"/„ohne Doppel"**.
- **„Weitere Einsätze"** am Ende = Spieler, die in Berichten auftauchen, aber **nicht auf der
  Meldeliste dieser Mannschaft** stehen — echte **Ersatzspieler** aus anderen Mannschaften des
  Vereins (z. B. Schönwetter bei Kümmersbruck). Kein Datenfehler.

**B) Ohne Meldeliste — klassische Ansicht** (Ligen, die nur Spielberichte hätten)

- **Spieler**: nur Spieler **mit** Einzel-Einsatz, nach Ø-Position sortiert.
- **Doppel**: **Paarungen** als Einheit (Schlüssel = sortierte Nachnamen), ohne LK.
- Mannschaften ganz ohne Spielbericht **und** ohne Meldeliste zeigen den Hinweis-Leerzustand.

**Datenquelle & Funktionsweise:** Bilanzen werden **live aus den echten nuLiga-Spielberichten**
(`src/data/spielberichte-crawled.ts`) aggregiert – es gibt **keine Beispieldaten**; die Namensliste
kommt aus `meldelisten.ts`. Funktioniert für **jede** Mannschaft, die in einem Spielbericht vorkommt
(auch Gegner), da jeder Bericht beide Aufstellungen enthält. Seit 16.08.2026 sind **alle 18
Konkurrenzen** der Sommer-Saison komplett erfasst: 402 Spielberichte (3.168 Einzel/Doppel) und
132 Meldelisten (4.238 Spieler) — jede Mannschaft jedes Gegners inklusive.

**Code-Landkarte:**
- `src/data/player-stats.ts` – Aggregation: `getTeamStats(leagueName, club)`, `emptyTeamStats`,
  `aggregatePlayers`, `aggregateDoubles`, `parseLk`, `normalizePlayerName`. Doppel-Einsätze werden
  **zusätzlich jedem der beiden Spieler** zugeordnet (`PlayerStat.doubles`, mit `partner`), damit die
  Doppel-Ansicht pro Person funktioniert.
- `src/components/TeamStatsDetail.tsx` – Detailseite; `RosterRow` rendert eine Meldelisten-Zeile im
  `mode` `einzel`/`doppel`, `AppearanceRow` eine Match-Zeile (bei `partner` „mit …" statt „vs …").
- `src/components/StandingsView.tsx` – Tabellenzeile klickbar (`selectedClub`), lädt Stats **und**
  Meldeliste; bei Meldeliste ohne Bericht wird `emptyTeamStats` verwendet.
- **Namens-Matching Bericht ↔ Meldeliste:** `normalizePlayerName` entfernt Walkover-Vermerk und
  Länderkürzel (`"Faschang, Michael AUT (w.o.)"` → `"Faschang, Michael"`); Einträge desselben Spielers
  aus mehreren Schreibweisen werden in `TeamStatsDetail` zusammengeführt. Ohne diese beiden Schritte
  landen ~100 statt 8 Spieler fälschlich unter „Weitere Einsätze".
- Spieler-Strings in Berichten: `"Nachname, Vorname (Meldeposition, LKxx,x)"`, geparst von
  `src/utils/spielbericht.ts` (`parsePlayer`/`parseSide`). LK-Format `"LK14,3"` (Komma!).

---

## Daten pflegen (nuLiga)

Alle Liga-/Spieldaten stammen aus offiziellen **BTV-nuLiga-PDFs** und liegen in zwei Dateien. `club=22844` = TC Pliening; Saison Sommer 2026 = `season=18103` (wechselt je Saison — aktuellen Link von der [Vereinsseite](https://www.btv.de/de/mein-verein/vereinsseite/tc-pliening.html) holen).

> **Zuordnung passiert automatisch aus dem PDF.** Jedes Spielbericht-PDF (MeetingReportFOP) nennt im Kopf **Liga/Gruppe, Termin, beide Mannschaften und Endergebnis** — daraus folgt eindeutig die Ziel-Liga und -Begegnung. Es genügt also, die **PDF-Links zu liefern** (die Konkurrenz muss nicht dazugeschrieben werden). Auch Begegnungen **ohne TC Pliening** werden eingetragen (sie füllen die Kreuztabelle der jeweiligen Liga). Den **Gesamt-Tabellen-Report** (ResultReportFOP, s. u.) holt man sich selbst dazu — er steckt NICHT im einzelnen Spielbericht.

### Mixed-Runde (Gr. 074) — Sonderfall

Seit 05.08.2026 ist die **Mixed-Mannschaft** (`mixed`, „Spielebene B · Gr. 074") in Sommer 2026 mit
aufgenommen. Sie gehört zur **Südbayern Mixed-Runde**, die **nach** der Sommerrunde läuft
(Spieltage **01.08.–27.09.2026**) und deshalb ein paar Besonderheiten hat:

- **Eigene Quelle:** Der vereinsweite `ResultReportFOP` deckt sie **nicht** ab. Datenbasis ist der
  Gruppen-Report **„Tabelle und Spielplan"** (`nu.Dokument 013`) der Gruppe 074 — er enthält Tabelle
  **und** Spielplan, aber **keine Kreuztabelle**; die `crossResults` werden aus den Spielplan-Ergebnissen
  abgeleitet (alles Ungespielte `"0:0"`).
- **Format:** 2 Herren-Einzel + 2 Damen-Einzel + 2 Mixed-Doppel = 6 Matches → in `team-format.ts` als
  `"4er"` geführt (Einzel 1–4, Doppel 7–8), damit Positions-Logik und Spielberichte passen.
- **August/September** sind in `MONTHS`/`MONTH_COLORS` (`src/data/constants.ts`) und in den
  Druckfarben von `src/utils/pdf-export.ts` ergänzt (Violett bzw. Türkis), sonst blieben die
  Monatsköpfe im Spielplan farb- und namenlos.
- **Spielbericht-PDFs ohne Meeting-ID:** Die Mixed-Berichte (`nu.Dokument 011d`) nennen im Kopf nur
  eine gruppeninterne **„Spielbericht (Nr. n)"**, keine Meeting-ID. Schlüssel in
  `spielberichte.ts` daher **`SB_mx074n<Nr>`** statt `SB_<meetingID>`.
- **Stand 15.08.2026 (abends):** Pliening–Kirchheim **4:2** (Nr. 1), Feldkirchen–Markt Schwaben
  **2:4** (Nr. 3), Haar–Pliening **4:2** (Nr. 4), Pliening–Feldkirchen **4:2** (Nr. 5, 15.08.)
  und Markt Schwaben–Haar **1:5** (Nr. 7, 15.08.) — alle **mit Spielbericht** erfasst;
  Forstern–Haar (Nr. 2) auf den **27.09.** verlegt. Tabelle: Haar 1. (4:0), **Pliening 2.** (4:2).
  Auch die Mixed-Berichte haben inzwischen Meeting-IDs (z. B. Nr. 5 = meeting 12927839) — die
  Druckversion-Links stehen im Spielbericht-Modal des btv.de-Widgets (s. u.).
- **Meldelisten:** siehe eigenen Abschnitt „Meldelisten" weiter unten — auch die Mixed-Vereine
  sind dort erfasst (Herren und Damen separat nummeriert, z. B. Markt Schwaben 35 H + 23 D).

**Datenstand (16.08.2026): Sommer 2026 vollständig.** Alle 18 Konkurrenzen sind mit Tabelle,
Kreuztabelle, Spielberichten und Meldelisten erfasst — 402 Berichte, 3.168 Einzel/Doppel,
132 Meldelisten mit 4.238 Spielern. `node scripts/check-data.mjs` bestätigt: von 798
Kreuztabellen-Zellen mit Ergebnis haben **794 einen passenden Spielbericht**. Die vier Ausnahmen
sind bekannt und korrekt so:

- **Gr. 315 Markt Schwaben–Forstinning 6:3** (2 Zellen): Forstinning ist zurückgezogen, nuLiga liefert
  den Bericht nicht mehr aus — das Tabellen-Ergebnis bleibt.
- **Gr. 043 SU Schloßberg–Grün-Gold**: Tabelle zeigt **1:3**, gespielt wurde 2:7 (BTV streicht bei
  zurückgezogenen Mannschaften Teile der Wertung). Tabelle verbatim, Bericht wie gespielt.

Ebenfalls erwartbar: **Midcourt U10 (Gr. 870)** hat keine Meldelisten (s. o.), und rund 0,5 % der
Spieler-Nennungen (42 von 8.189) stehen nicht auf der Meldeliste ihrer Mannschaft — das sind
Ersatzspieler aus anderen Mannschaften des Vereins und erscheinen unter „Weitere Einsätze"
(`node scripts/check-names.mjs`). **Offen ist nur noch die laufende Mixed-Runde** — nächster
Spieltag **22.08.** (Kirchheim–Feldkirchen, Forstern–Markt Schwaben), danach
30.08./06.09./19.09./26.09./27.09.

### Tabellen → `src/data/summer-2026.ts` (`SUMMER_STANDINGS`)

**`SUMMER_STANDINGS_STAND`** (bzw. `WINTER_STANDINGS_STAND` in `winter-2526.ts`) ist das Datum des
letzten BTV-Abgleichs und wird in der App über den Tabellen als „BTV-Stand" angezeigt.
`generate-standings.mjs --write` setzt es automatisch auf das Tagesdatum; bei Hand-Änderungen mitpflegen.
Verlegte Begegnungen im Spielplan (`matches.ts`) auf das tatsächliche Spieldatum aus dem
Spielbericht setzen, sonst steht das Ergebnis am falschen Wochenende.

Quelle: **eine** PDF mit allen Ligen, „Ergebnistabellen gesamt":
`https://btv.liga.nu/.../nuDokument?dokument=ResultReportFOP&type=full&club=22844&season=18103`

Pro Liga ein `LeagueStandings`-Objekt; `entries` in **Rang-Reihenfolge**. `crossResults[i]` = Ergebnis der Zeilen-Mannschaft gegen die Mannschaft mit `rank = i+1` (`"***"` = Diagonale, `"0:0"` = noch nicht gespielt → „n.a."); Array-Länge = Mannschaftszahl. Werte **1:1** übernehmen — auch bei zurückgezogenen Teams, wo offizielle Matchpunkte von der Kreuztabelle abweichen. Erfasst sind die 13 Herren-/Damen-Ligen (Jugend bewusst nicht). `ownRank`/`isOwnClub` zeigen auf den TC-Pliening-Eintrag.

### Spielberichte (Kreuztabellen-Detailansicht) → `src/data/spielberichte-crawled.ts`

**AUTO-GENERIERT — nicht von Hand editieren.** Seit 16.08.2026 sind **alle** Begegnungen aller 18 Konkurrenzen erfasst (**402 Berichte, 3.168 Einzel/Doppel**); `src/data/spielberichte.ts` ist nur noch der Lookup drumherum (`getSpielbericht`, `getAllSpielberichte`). Die früher handgepflegten Berichte sind entfallen — der Crawl deckt sie alle ab (117/117 identisch bis auf Länderkürzel-Schreibweise und zwei Namen, die nuLiga inzwischen korrigiert hat).

```bash
npm run crawl:spielberichte          # alle Gruppen (~45 min) -> scripts/.spielberichte-cache.json
npm run crawl:spielberichte -- 292   # nur eine Gruppe; --force verwirft deren Cache
npm run gen:spielberichte            # Cache -> src/data/spielberichte-crawled.ts (Sekunden)
node scripts/verify-parser.mjs       # Parser gegen vorhandene Daten diffen
node scripts/check-data.mjs          # Tabellen <-> Berichte <-> Meldelisten prüfen
```

Crawl und Parsing sind getrennt: am Parser (`scripts/parse-spielbericht.mjs`) kann man iterieren, ohne erneut zu crawlen. Datenkonventionen (Parser hält sie ein):

- `league` / `homeClub` / `awayClub` müssen **exakt** den Strings in `summer-2026.ts` entsprechen (Lookup ist richtungsunabhängig — eine Begegnung steht in 2 Spiegel-Zellen der Kreuztabelle).
- Einzel-Spieler: `"Nachname, Vorname [LÄNDERKÜRZEL≠GER] (Meldeposition, LKx,x)"` — Meldeposition = Spalte „Nr. laut Meldeliste"; `GER` weglassen. Doppel: `"Nachname, Vorname [NAT] / …"` ohne LK.
- **`(w.o.)` gehört VOR die Klammer** (`"Name (w.o.) (23, LK7,2)"`): `src/utils/spielbericht.ts` erwartet `(Position, LK…)` am Zeilenende, sonst fehlen Position und LK.
- `position`: Einzel 1–6, Doppel 7–9 (4er-Ligen: Einzel 1–4, Doppel 7–8).
- `sets`: Liste von `[heim, gast]`; ein 3. Eintrag ist der Match-Tiebreak. Nicht gespielte Sätze fehlen im Modal und bleiben weg; reiner Walkover → `sets: []`.
- Unbenannte/abwesende Spieler („nicht anwesend k.A.*", „unbekannt / wird nachgenannt") → `"— (w.o.)"` bzw. `"—"`.
- **Endstand = offizielles Ergebnis aus dem Spielplan**, auch wenn die Summe der Matchsiege abweicht: bei Verstößen wertet der Spielleiter Matches um (z. B. Strafwertung aller Doppel nach WO §60.1). Der Generator meldet solche Fälle als HINWEIS.

### Meldelisten (Spielerlisten) → `src/data/meldelisten.ts`

**AUTO-GENERIERT — nicht von Hand editieren.** Neu erzeugen mit:

```bash
npm run crawl:meldelisten          # alle Gruppen aus GROUPS
npm run crawl:meldelisten -- 074   # nur passende Gruppe(n) (Filter auf leagueName/groupid)
```

Der Crawler (`scripts/crawl-meldelisten.mjs`, braucht Google Chrome, Pfad via `CHROME_PATH`
überschreibbar) holt die Listen aus den **btv.de-Mannschaftsportraits**. Stand 16.08.2026:
**132 Mannschaften, 4.238 Spieler** — alle 18 Konkurrenzen der Sommer-Saison. Die Gruppen stehen
zentral in **`scripts/groups.mjs`** (`groupid`, `leagueName`, `mode` herren/damen/mixed,
`teamSize` 9 oder 6); dieselbe Liste nutzt auch der Spielbericht-Crawler.

Ausnahme: **Midcourt U10 (Gr. 870)** hat in nuLiga keine namentliche Meldeliste (keine LK in dieser
Altersklasse) — die sechs Mannschaften stehen deshalb nicht in `meldelisten.ts` und zeigen in der App
die klassische Spieler-Ansicht.

**groupid einer beliebigen Mannschaft finden:** auf der [Vereinsseite](https://www.btv.de/de/mein-verein/vereinsseite/tc-pliening.html)
steckt das Mannschafts-Widget in einem iframe von `btv-prod.burdadigitalsystems.de/btvteams/?clubnr=02467`.
Dort `window.open` überschreiben und die **„Tabelle/Spielplan [PDF]"**-Elemente klicken → die
abgefangene URL enthält `group=<id>` (vorher ggf. „MEHR LADEN" klicken). Alle TCP-Gruppen 2026:
004→2144934, 005→2139346, 043 SU→2165598, 103 SU→2165662, 023→2215909, 160→2216042, 292→2216174,
315→2219941, 355→2224597, 379→2216258, 404→2224594, 441→2216316, 488→2216367, 596→2216473,
638→2216513, 686→2216568, 870→2219939, Mixed 074→2244334.

**Stolperfallen (alle im Script behandelt — nicht „wegoptimieren"):**

- **Rang startet nicht bei 1.** Die Meldeliste einer **II./III. Mannschaft** ist ein Ausschnitt der
  vereinsweiten Liste und beginnt bei dem Rang, ab dem der Verein für diese Mannschaft meldet
  (Feldkirchen II ab **7**, Aschheim III ab **13**). Nur **Lückenlosigkeit** prüfen, nicht den Start.
- **Nations-Spalte fehlt** in manchen Portraits komplett (z. B. Gr. 004) → im Zeilen-Regex optional.
- **ZK-Pager bleibt stehen:** Nach dem Wechsel zur nächsten Mannschaft zeigt das Grid noch die alte
  Seite → vor dem Auslesen `a.z-paging-first` klicken, bis die erste Zeile passt.
- **Vereinslinks nur aus der Tabelle** oben holen: im Spielplan darunter stehen auch **Spielort**-Links
  („TC Kirchheim bei Mü."), die kein Portrait haben und ins Timeout laufen.
- **Frame wird detached**, sobald etwas schiefgeht → Seite (notfalls Browser) neu aufbauen und den
  Frame **neu holen**; der alte Handle bleibt sonst für den Rest des Laufs kaputt.
- **Cache:** Nach jeder Mannschaft wird `scripts/.meldelisten-cache.json` geschrieben (gitignored).
  Ein Wiederanlauf überspringt fertige Mannschaften — Abbrüche kosten daher fast nichts. Cache löschen
  = kompletter Neu-Crawl (dauert ~30–40 min für alle sechs Gruppen).
- **Vereinsnamen müssen exakt** den `club`-Strings in `summer-2026.ts` entsprechen; Abweichungen über
  `CLUB_ALIASES` im Script abfangen (z. B. „VfB Forstinning" → „VfB Forstinning (zurückgezogen)").
  Nach dem Crawl gegenprüfen, dass jede Tabellen-Mannschaft eine Meldeliste hat.

### Workflow

PDF(s) ziehen → **erst prüfen, ob `SB_<meetingID>` schon existiert** (gelieferte Link-Listen enthalten öfter bereits eingetragene oder doppelte Links → überspringen) → Daten eintragen → `npm run build` (`tsc -b` + `vite`) → **PR + `gh pr merge`** (löst Deploy aus). Sanity-Checks: Summe der gewonnenen Einzel/Doppel = Endstand der Begegnung; Kreuztabellen-Wert = Mannschafts-Matchpunkte. Nach dem Deploy den live ausgelieferten Bundle-Hash prüfen (siehe „Stolperfalle" unten).

**Fehlende Spiele finden:** aktuellen Gesamt-Report (ResultReportFOP) ziehen und dessen Kreuztabellen gegen `SUMMER_STANDINGS` diffen — Zellen, die bei uns `"0:0"` sind und offiziell ein Ergebnis haben, fehlen. Die **Spieltage** von Fremd-Begegnungen stehen nicht im Gesamt-Report; sie folgen aber eindeutig aus der Rundenlogik (jede Paarung genau 1×, pro Spieltag jedes Team genau 1×) — Vorsicht bei **Nachholspielen** (Beispiel Gr. 292: Finsing–Philathlos, Termin 27.06., erst am 18.07. „abgeschlossen" und damit lange ohne Ergebnis im Report). Der Spielbericht-PDF-Kopf nennt immer den echten Termin.

**Rangfolge verbatim übernehmen**, auch wenn sie „falsch" aussieht: bei ungleicher Spielzahl (ungespielte Begegnungen) sortiert der BTV nach Punkt-**Quotient**, nicht -Summe — z. B. steht in Gr. 292 Finsing (6:2 aus 4) vor Pliening (5:3 aus 4).

### nuLiga-Zugriff: Was funktioniert (und was nicht)

- ✅ **PDF-Endpoints** (`nuDokument`) sind per `curl` erreichbar: `ResultReportFOP` (Gesamt-Tabellen), `MeetingReportFOP&meeting=<ID>` (Einzelbericht; `etag` optional) und `ScheduleReportFOP&group=<interne-Gruppen-ID>` („Tabelle und Spielplan" einer Gruppe, nu.Dokument 013 — die interne ID steht im `groupid`-Parameter der btv.de-Seite, z. B. 2244334 = Gr. 074). Voller Pfad: `https://btv.liga.nu/cgi-bin/WebObjects/nuLigaDokumentTENDE.woa/wa/nuDokument?...` (`-L` nötig, der Redirect hängt das `etag` an).
- ❌ `btv.liga.nu/...groupPage?...` und alle anderen nuLiga-**HTML**-Seiten leiten generisch auf das btv.de-Portal um.
- ✅ **Das btv.de-Widget ist doch scrapbar** (Korrektur der alten Notiz „nicht scrapbar"): Die Seite „Tabelle/Spielplan" (`tabelle-spielplan.html?groupid=<id>`) ist ein iframe auf `widget.btv.de/btvgroup/` (**ZK-Java-App**). Das Widget **direkt** aufzurufen liefert nur ein Fehlerbild, und plain-HTTP/`--dump-dom` bleibt leer (Inhalte kommen per ZK-AJAX). Mit **Puppeteer über die einbettende btv.de-Seite** funktioniert es headless: Cookiebot-Banner wegklicken („Alle ablehnen"/„Nur notwendige Cookies"/„OK" — Texte variieren, im Zweifel alle Kandidaten probieren), dann im `widget.btv.de`-Frame arbeiten.

### Spielberichte selbst crawlen (statt Links liefern zu lassen)

Seit 15.08.2026 müssen **keine MeetingReportFOP-Links mehr geliefert werden** — sie lassen sich aus dem Widget holen (das gilt auch für die Mixed-Runde, deren PDFs im Kopf nur „Spielbericht (Nr. n)" nennen):

1. btv.de-Gruppenseite mit Puppeteer laden, Consent wegklicken, `widget.btv.de`-Frame greifen.
2. Gespielte Begegnungen erkennt man an **`span.gb-status`** mit Text **„anzeigen"** (CSS macht daraus optisch „ANZEIGEN"; ein Text-Match auf Großschreibung schlägt fehl). Offene Begegnungen haben „OFFEN"/„Blanko-Spielbericht".
3. Klick darauf öffnet ein **Inline-Modal** (`.z-window`) mit dem **kompletten Spielbericht** — Einzel und Doppel mit Namen, Meldeposition, LK und allen Sätzen. `innerText` des Modals reicht zum Auswerten.
4. Im Modal `window.open` überschreiben und **„Druckversion [PDF]"** klicken → die abgefangene URL ist der `MeetingReportFOP&meeting=<ID>`-Link; damit bekommt man auch die **Meeting-ID** (und via PDF die offizielle „Spielbericht (Nr. n)").
5. Modal schließen (ZK-Close-Icon oder `Escape`), nächste Begegnung.

**Vollständigkeits-Check:** alle gecrawlten Meeting-IDs gegen die `SB_<meetingID>`-Konstanten in `spielberichte.ts` diffen — was fehlt, ist wirklich neu (Vorsicht: ein paar alte Begegnungen liegen als Papier-Spielbericht ohne Meeting-ID vor, z. B. Gr. 292 Nr. 6961/6962 — die tauchen im Diff auf, sind aber erfasst).

---

## Tooling

Vite + React 19 + TypeScript + Tailwind 4. `npm run dev` (Entwicklung), `npm run build`
(`tsc -b` + `vite build`), `npm run lint`, `npm run preview`. Die Tabellen-Ansicht und die
Spielbericht-Daten werden per `React.lazy` als eigene Chunks nachgeladen, damit der Spielplan
schnell startet.

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
praktisch zur Nach-Deploy-Kontrolle, ganz ohne lokale `.env`/Build. Achtung Race: direkt
nach „Deploy erfolgreich" kann der erste Aufruf noch den alten Stand liefern — bei rotem
Ergebnis zuerst den Bundle-Hash prüfen (s. o.) und den Test einfach wiederholen.

**Mobil mitprüfen (die App ist mobil-erst).** Geräte emulieren statt nur Desktop-Viewport:
`page.setUserAgent(<iPhone-UA>)` + `page.setViewport({ width, height, isMobile: true, hasTouch: true })`
und mit **`elementHandle.tap()` statt `.click()`** interagieren (echte Touch-Events; deckt z. B.
das ⋯-Menü-Öffnen ab). Sinnvolle Viewports: iPhone 13 `390×844` und iPhone SE `375×667`
(kleinster gängiger Screen). Zusätzlich auf **horizontalen Overflow** prüfen
(`document.documentElement.scrollWidth > clientWidth` muss `false` sein).
