# Glossar — die Fachbegriffe dieses Projekts

> Der Code, die Daten und die Oberfläche sind voller Begriffe aus dem deutschen
> Tennis-Ligabetrieb. Ohne sie sind `crossResults`, `mp` oder `w.o.` nicht zu deuten.
> Diese Seite erklärt jeden Begriff **so, wie er in diesem Projekt verwendet wird**.
>
> Grundregel dazu: **Die App rechnet nichts aus.** Punkte, Matchpunkte, Sätze und
> Rangfolgen werden vom BTV übernommen, nicht neu berechnet.

---

## Organisation und Quellen

**BTV — Bayerischer Tennis-Verband.**
Der Landesverband, der den Ligabetrieb in Bayern organisiert. **Einzige zulässige
Datenquelle** dieses Projekts. Vereinsseite des TC Pliening:
<https://www.btv.de/de/mein-verein/vereinsseite/tc-pliening.html>

**nuLiga.**
Die Verbandssoftware hinter dem BTV (Domain `btv.liga.nu`). Liefert die amtlichen
Reports als PDF. **Die HTML-Seiten von nuLiga sind für uns tot** — sie leiten generisch
auf das btv.de-Portal um. Nur die PDF-Endpunkte (`nuDokument?dokument=…`) sind per
`curl -L` erreichbar.

**btv.de-Widget.**
Die Ergebnis-Oberfläche auf btv.de. Technisch ein iframe auf eine **ZK-Java-Anwendung**
(`widget.btv.de/btvgroup/` bzw. `btv-prod.burdadigitalsystems.de/btvteams/`). Inhalte
kommen per AJAX nach — reines `curl` liefert nichts, deshalb Puppeteer. Das Widget ist
die Quelle für Spielberichte, Meldelisten und Spielorte.

**Report-Typen (die PDF-Endpunkte):**

| Endpunkt | Inhalt | Wofür |
|---|---|---|
| `ResultReportFOP&type=full&club=…&season=…` | **alle** Ligen eines Vereins mit Tabelle und Kreuztabelle | Sommer-Gesamtabgleich |
| `ScheduleReportFOP&group=<groupid>` | „Tabelle und Spielplan" **einer** Gruppe (nu.Dokument 013) | Winterrunde, Mixed, neue Saison |
| `MeetingReportFOP&meeting=<ID>` | **ein** Spielbericht | einzelne Begegnung |
| nu.Dokument **011d** | Blanko-Spielbericht | verrät das **Format** einer Liga (4er oder 6er) |

**Achtung:** Der vereinsweite `ResultReportFOP` deckt **nicht alles** ab — die
Winterrunde und die Mixed-Runde fehlen dort. Für die braucht es die Gruppen-Reports.

**`groupid`.**
Die interne nuLiga-Nummer einer Gruppe, z. B. `2253303`. **Nicht** identisch mit der
sichtbaren Gruppennummer („Gr. 022"). Alle bekannten `groupid`s stehen in
`scripts/seasons.mjs`; neue findet man über das Vereins-Widget (siehe README,
„Meldelisten"). Zwei verschiedene Vereins-Nummern kommen vor: `club=22844` (nuLiga)
und `clubnr=02467` (btv.de-Widget) — beide meinen den TC Pliening.

---

## Wettbewerbs-Struktur

**Konkurrenz.**
Der projekteigene Sammelbegriff für **eine Mannschaft des TC Pliening in ihrer
Altersklasse**, z. B. „Herren 40" oder „Damen 50 II". Im Code ist das ein `Team` mit
einer `id` wie `herren40` oder `w27-damen50`. Die Filterleiste der App blendet
Konkurrenzen ein und aus.

Ein Verein kann mehrere Mannschaften derselben Altersklasse melden; die werden mit
römischen Ziffern durchnummeriert: **„Herren 40 II"** ist die zweite Herren-40-Mannschaft.

**Liga / Gruppe / Staffel.**
Die Spielklasse, in der eine Konkurrenz antritt — im Code ein String wie
`"Südliga 2 · Gr. 023"` oder `"Bayernliga · Gr. 022 SU"`. Er besteht aus der
**Spielklasse** und der **Gruppennummer**. In den Daten dieses Projekts kommen von oben
nach unten vor: Regionalliga Süd-Ost, Bayernliga, Landesliga, Südliga. Angehängte Kürzel wie `SU` und Zusätze wie `(4er)` sind Teil
der offiziellen BTV-Bezeichnung und werden **unverändert** übernommen.

> **Diese Strings sind Schlüssel.** `league`, `homeClub` und `awayClub` müssen in
> Spielberichten, Meldelisten und Tabellen **zeichengenau** übereinstimmen, sonst
> findet der Lookup nichts. Abweichende Vereinsschreibweisen fängt `CLUB_ALIASES` in
> den Crawler-Skripten ab.

**Spielebene (Mixed).**
Die Mixed-Runde ist nicht nach Ligen, sondern nach „Spielebenen" gegliedert —
`"Spielebene B · Gr. 074"`. Sie läuft **nach** der Sommerrunde (August/September) und
ist deshalb in mehrfacher Hinsicht ein Sonderfall (eigene Quelle, eigene Monatsfarben,
eigene Spielbericht-Schlüssel).

**Midcourt U10.**
Jugend-Wettbewerb auf verkleinertem Feld. Hat in nuLiga **keine namentliche
Meldeliste** (in dieser Altersklasse gibt es keine LK) — das Fehlen ist korrekt und
kein Datenfehler.

---

## Der Spielbetrieb

**Begegnung (im Code: `Match`).**
Ein Mannschaftskampf zwischen zwei Vereinen an einem Spieltag — die Einheit, die im
Spielplan als eine Zeile steht. Eine Begegnung besteht aus mehreren Einzeln und Doppeln.

**Einzel und Doppel (im Code: `IndividualMatch`).**
Die einzelnen Partien innerhalb einer Begegnung. Jede hat eine **Position**:

| Format | Einzel | Doppel | Positionen im Code |
|---|---|---|---|
| **6er** | 6 | 3 | Einzel `1–6`, Doppel `7–9` |
| **4er** | 4 | 2 | Einzel `1–4`, Doppel `7–8` |

Die Positionsnummer ist zugleich die **Stärke-Reihenfolge**: Position 1 ist das
Spitzeneinzel. Welche Konkurrenz welches Format hat, steht in
`src/data/team-format.ts` — **fehlt ein Eintrag, gilt still `"6er"`**, was bei einer
4er-Liga falsche Positionen erzeugt. Das Format einer Liga verrät der Blanko-Spielbericht
(nu.Dokument 011d).

*Sonderfall Mixed:* 2 Herren-Einzel + 2 Damen-Einzel + 2 Mixed-Doppel = 6 Partien. Wird
im Code als `"4er"` geführt, weil die Positions-Logik (Einzel 1–4, Doppel 7–8) passt.

**Matchpunkte (`mp`, `matchPoints`).**
Die **gewonnenen Einzel und Doppel** einer Begegnung, z. B. `"4:2"`. Das Ergebnis einer
Begegnung ist immer ein Matchpunkt-Verhältnis. In der Tabelle steht die Summe über alle
Begegnungen.

**Punkte (`points`).**
Die **Mannschaftspunkte** in der Tabelle, z. B. `"8:2"` — pro gewonnener Begegnung 2:0,
pro verlorener 0:2. Das ist das primäre Sortierkriterium der Tabelle.

**Sätze (`sets`) und Spiele (`games`).**
Die feineren Sortierkriterien: gewonnene zu verlorene Sätze (`"21:9"`) bzw. Spiele
(`"45:20"`). `games` gibt es nur am `WinterMatch`.

**Satz-Ergebnisse im Spielbericht.**
`sets` ist dort eine Liste von Paaren, z. B. `[[6,4],[3,6],[10,7]]`. Ein **dritter**
Eintrag ist in aller Regel der **Match-Tiebreak** (auch Champions-Tiebreak): statt eines
dritten Satzes wird bis 10 Punkte gespielt. Nicht gespielte Sätze fehlen einfach.

**w.o. (walkover).**
Kampflos gewonnen — der Gegner ist nicht angetreten. Reiner Walkover heißt `sets: []`.

> **Format-Falle:** Der Vermerk gehört **vor** die Klammer:
> `"Name (w.o.) (23, LK7,2)"`. Der Parser in `src/utils/spielbericht.ts` erwartet
> `(Meldeposition, LK…)` am Zeilenende — steht das `(w.o.)` dahinter, fehlen Position
> und LK stillschweigend.

**Nachholspiel / Verlegung.**
Begegnungen werden häufig verlegt. Der **echte** Termin steht immer im Kopf des
Spielbericht-PDFs. Im Spielplan (`matches.ts`) muss das tatsächliche Spieldatum stehen,
sonst erscheint das Ergebnis am falschen Wochenende.

**Zurückgezogene Mannschaft.**
Zieht ein Verein während der Saison zurück, liefert nuLiga deren Spielberichte nicht
mehr aus, die offiziellen Tabellen-Matchpunkte weichen dann von den gespielten
Ergebnissen ab. **Das ist korrekt so** — solche Ligen stehen als `keepLeagues` in
`scripts/seasons.mjs` und werden vom Generator nicht überschrieben. In der App
erscheinen solche Begegnungen als „gestrichen".

**Strafwertung.**
Bei Verstößen (z. B. gegen die Aufstellungsregeln) wertet der Spielleiter Partien um —
etwa alle Doppel nach WO §60.1. Dann stimmt die Summe der gewonnenen Partien **nicht**
mit dem offiziellen Endstand überein. **Das offizielle Ergebnis gewinnt**; der
Generator meldet solche Fälle als HINWEIS.

---

## Tabellen

**Tabelle (`LeagueStandings`).**
Die Rangliste einer Liga. Enthält je Mannschaft Rang, Verein, Punkte, Matchpunkte,
Sätze und deren Zeile der Kreuztabelle.

**Kreuztabelle (`crossResults`).**
Die Matrix „jeder gegen jeden": In der Zeile einer Mannschaft steht in Spalte *i* das
Ergebnis gegen die Mannschaft auf Rang *i+1*.

- `"***"` = die Diagonale (gegen sich selbst)
- `"0:0"` = noch nicht gespielt (die App zeigt „n.a.")
- sonst die Matchpunkte, z. B. `"5:1"`

Jede Begegnung steht **zweimal** in der Matrix — einmal aus Sicht jeder Mannschaft.
Deshalb ist der Spielbericht-Lookup richtungsunabhängig.

**BTV-Stand (`standingsStand`, `*_STANDINGS_STAND`).**
Das Datum des letzten Abgleichs mit dem BTV, das die App über den Tabellen anzeigt.
`generate-standings.mjs --write` setzt es automatisch; bei Handänderungen mitpflegen.

**Setzliste.**
**Vor** dem ersten Spieltag stehen alle Punkte auf `0:0`. Die Reihenfolge in der
BTV-Tabelle ist dann **keine erspielte Platzierung**, sondern die vom Verband gesetzte
Startreihenfolge. Die App erkennt das und zeigt „*n* Mannschaften" statt „Platz *x*",
ohne Medaillen.

**Punkt-Quotient.**
Haben Mannschaften **unterschiedlich viele** Begegnungen gespielt, sortiert der BTV
nach Quotient statt nach Summe. Dann steht eine Mannschaft mit 6:2 aus 4 Spielen vor
einer mit 5:3 aus 4. **Die Rangfolge wird verbatim übernommen**, auch wenn sie auf den
ersten Blick falsch wirkt.

---

## Spieler

**LK — Leistungsklasse.**
Die bundesweite Spielstärke-Kennzahl, im Datenformat `"LK14,3"` (mit **Komma**).
**Niedriger ist besser** (LK 1 ist Spitze, LK 25 Anfang). Die App wertet daraus
**▲ LK-Sieg** (gegen eine bessere LK gewonnen) und **▼** (gegen eine schwächere
verloren).

**Meldeliste.**
Die vom Verein vor der Saison gemeldete, nach Stärke sortierte Spielerliste einer
Mannschaft. Quelle für die Namen in der Spieler-Statistik.

**Meldeposition / Rang.**
Der Platz auf dieser Liste. Steht in Spielberichten in der Klammer:
`"Nachname, Vorname (23, LK7,2)"`.

> **Falle:** Bei einer **II.** oder **III.** Mannschaft ist die Meldeliste ein
> *Ausschnitt* der vereinsweiten Liste und **beginnt nicht bei 1** (z. B. ab Rang 7 oder
> 13). Prüfen darf man nur die **Lückenlosigkeit**, nicht den Startwert.

Herren und Damen werden **getrennt** nummeriert — ein Verein kann in derselben
Mixed-Mannschaft eine Herren-Nr. 3 und eine Damen-Nr. 3 haben.

**Ersatzspieler / „Weitere Einsätze".**
Spieler, die in einem Bericht auftauchen, aber nicht auf der Meldeliste **dieser**
Mannschaft stehen — meist Aushilfen aus einer anderen Mannschaft desselben Vereins.
Die App sammelt sie unter „Weitere Einsätze". Rund 0,5 % der Nennungen sind so;
**kein Datenfehler**, `scripts/check-names.mjs` zählt sie.

**Nation.**
Nicht-deutsche Spieler tragen im Bericht ein Länderkürzel (`"Faschang, Michael AUT"`).
`GER` wird weggelassen. Beim Namensabgleich entfernt `normalizePlayerName` Kürzel und
Walkover-Vermerk — ohne diesen Schritt landen ~100 statt 8 Spieler fälschlich unter
„Weitere Einsätze".

---

## Projekteigene Begriffe

**Layout (`summer` / `winter`).**
Kein Tennis-, sondern ein Projektbegriff: **wo das Ergebnis einer Begegnung gespeichert
ist.** `summer` = nur in der Kreuztabelle, `winter` = zusätzlich an der Begegnung
selbst. Siehe [ARCHITEKTUR.md, Abschnitt 6.3](ARCHITEKTUR.md).

**Registry.**
Die zwei Tabellen, über die alles läuft: `src/data/season-data.ts` (was die App zeigt)
und `scripts/seasons.mjs` (womit die Werkzeuge arbeiten).

**Spielbericht-Schlüssel.**
Normalerweise `SB_<meetingID>`. Die Mixed-Berichte hatten anfangs keine Meeting-ID,
nur eine gruppeninterne Nummer — deren Schlüssel heißen deshalb `SB_mx074n<Nr>`.

**Live-Score.**
Ein von Besuchern **während** der Begegnung eingetippter Zwischenstand (Supabase). Hat
nichts mit den offiziellen BTV-Ergebnissen zu tun und wird von ihnen später abgelöst.

---

## Vorhaben Gegnerbriefing (Stand 09.09.2026 — spezifiziert, nicht gebaut)

Die Begriffe gelten für die im README beschriebene Erweiterung („Vorhaben: Suche, Spielerhistorie
und Gegnerbriefing"). Sie tauchen bisher in keinem Code auf.

**Gegnerbriefing.**
Der Block in der aufgeklappten TCP-Begegnung im Spielplan, der vor dem Spieltag zeigt, **was über
den Gegner belegt ist**: Meldeliste mit Einsatzhäufigkeit, tatsächliche Aufstellungen, bisherige
Ergebnisse — plus unsere eigenen bisherigen Aufstellungen, alles aus der **laufenden Saison** und
mit **LK an jedem Namen**. **Keine Prognose:** Es steht nur darin, was in einem Spielbericht steht.

**Spielerhistorie.**
Alle Einzel und Doppel **einer Person** über alle erfassten Saisons ab Winter 2024/25, nach
Saison getrennt, neueste zuerst — mit Datum, Position, Gegner, Doppelpartner, Sätzen und Ergebnis.
Gibt es für eigene und für gegnerische Spieler. Filter „Nur gegen TC Pliening". Ein
Vereinswechsel ergibt zwei getrennte Einträge.

**Einsatzhäufigkeit.**
Wie oft ein Spieler in der laufenden Runde eingesetzt wurde, getrennt nach Einzel und Doppel, und
auf welchen **Positionen** (z. B. „3× Einzel · Pos 1–2 · 2× Doppel"). Reine Zählung aus
Spielberichten, keine Bewertung.

**Datenstand (Briefing-Lauf).**
Datum **und Uhrzeit** des letzten Einlesens der BTV-Berichte einer Gruppe, plus der **nächste
geplante Lauf**. Steht im **⋯-Menü** der Kopfzeile, nicht im Briefing. Nicht zu verwechseln mit
dem **BTV-Stand** der Tabellen (nur Datum, gesetzt von `gen:standings`).

**Datenlücke.**
Eine Saison oder Gruppe, deren Spielberichte beim BTV **nicht mehr beschafft** werden konnten.
Wird in der Spielerhistorie **ausgewiesen** („Winter 2025/26 — Spielberichte nicht verfügbar"),
nie stillschweigend weggelassen. Stand 09.09.2026 sind Winter 2024/25, Sommer 2025 und Winter
2025/26 noch nicht erfasst.

**Betrachtete Seite (Farblogik).**
Die Mannschaft oder der Spieler, dessen Profil gerade offen ist, bestimmt die Farbe: **Grün =
diese Seite hat gewonnen, Rot = sie hat verloren** — auch gegen den TC Pliening. Im Profil eines
Gautingers ist sein Sieg gegen Pliening also grün. Nur der Spielbericht einer TCP-Begegnung
(aus Spielplan oder Kreuztabelle) bleibt aus Pliening-Sicht, weil dort Pliening die betrachtete
Seite ist. Zeilen gegen Pliening tragen in der Historie eine „TCP"-Marke — reine Kennzeichnung.

**Briefing-Lauf / Wecker.**
Der geplante automatische Lauf: täglich 01:00 Uhr Berlin prüfen, ob eine TCP-Begegnung in 7, 4
oder 0 Tagen liegt; wenn ja, BTV-Reports und Spielberichte der Gruppe neu einlesen, Daten
generieren, prüfen, als Bot-PR mergen, deployen; bei Fehlschlag E-Mail. Läuft in GitHub Actions.
**Nicht aktiviert**, solange die Freigabe fehlt.
