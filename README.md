# TC Pliening – Spielplan & Tabellen

React/Vite-App für Spielplan, Tabellen und Statistik des TC Pliening. Live: https://tcp-spielplan.de

> ### 📖 Diese Datei ist das Nachschlagewerk — nicht der Einstieg
>
> Wer das Projekt **zum ersten Mal** sieht (Mensch oder KI-Agent), liest in dieser
> Reihenfolge:
>
> 1. **[AGENTS.md](AGENTS.md)** — Regeln, Befehle, Wo-was-liegt · **zuerst lesen**
> 2. **[docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md)** — Aufbau, Datenfluss, Datenmodell, Registries, Deploy
> 3. **[docs/GLOSSAR.md](docs/GLOSSAR.md)** — die Fachsprache: Konkurrenz, Kreuztabelle, Matchpunkte, Meldeliste, LK …
> 4. **[docs/AUFGABEN.md](docs/AUFGABEN.md)** — Rezepte: „Ich soll X ändern — was genau tue ich?"
>
> **Dieses README** beschreibt danach jedes Feature, jede Datenquelle und jede
> Stolperfalle im Detail. Es ist zum **Nachschlagen** gedacht, nicht zum Lesen am Stück.

**Saisons** stehen im Dropdown oben links; die laufende Runde ist die Vorauswahl (`SEASONS[0]` in
`src/data/seasons.ts`). Aktuell: **Winter 2026/27** (7 Mannschaften, 34 Begegnungen), Sommer 2026
(18 Konkurrenzen) und Winter 2025/26 als Archiv. Welche Daten eine Saison zieht, steht an **einer**
Stelle — der Registry `src/data/season-data.ts`; siehe „Eine Saison anlegen" weiter unten.

## Features

- **Spielplan** – alle Begegnungen mit **offiziellem Endergebnis** (grün/rot/gelb aus Sicht des TC Pliening, „gestrichen" bei zurückgezogenen Mannschaften); springt beim Laden automatisch ans nächste Wochenende („Nächstes"-Marke), davor eine Trennlinie **„Heute · &lt;Datum&gt;"** (alles darüber ist gespielt, alles darunter steht aus; erscheint nicht über dem ersten Wochenende der Saison und nicht mehr nach Rundenende). Vergangene Begegnungen ohne Ergebnis stehen gedimmt auf „offen". Spiel antippen → Endergebnis, Spielort mit Google-Maps-Link und **Spielbericht (Einzel/Doppel)**; die Zeile hat keinen Aufklapp-Pfeil mehr, dafür brechen lange Gegnernamen um statt abgeschnitten zu werden. Die Ergebnisse kommen ohne Extra-Daten aus den Kreuztabellen (`src/data/results.ts`), Winter-Begegnungen bringen sie direkt mit.
- **Konkurrenz-Filter** – einzelne Mannschaften/Konkurrenzen ein-/ausblenden, `Nur Heim`, `Alle aus`/`Alle an` und **gespeicherte Auswahl** (seit 2026-06-22) – siehe unten.
- **Kalender-Downloads** – im **⋯-Menü** (Spielplan-Reiter, jede Saison) → Overlay mit einer ICS-Datei je Mannschaft. Bis 07.09.2026 stand der Block dauerhaft aufgeklappt unter dem Spielplan. `PDF exportieren` steht im selben Menü, aber nur in Saisons mit Druck-Spielplan (`supportsPdf` in der Registry — derzeit nur die Sommerrunde).
- **Tabellen** je Konkurrenz mit **Kreuztabelle**. Auf ein Ergebnis in der Kreuztabelle tippen → **Spielbericht** (Einzel/Doppel) der Begegnung. Solange eine Runde **noch nicht begonnen** hat (alle Punkte 0:0), zeigt der Kopf „*n* Mannschaften" statt „Platz *x*" und die Medaillen bleiben weg — die Reihenfolge ist dort nur die Setzliste des BTV.
- **Spieler-Statistik je Mannschaft** (seit 2026-06-18) – Mannschaftszeile antippen. Seit 15.08.2026 mit **kompletter Meldeliste** (alle gemeldeten Spieler mit Rang), getrennt nach **Einzel** und **Doppel**; die Reiter nennen die Zahl der Personen **im Einsatz** (nicht die Meldelistengröße), die Spaltenerklärung liegt hinter **„ⓘ Was bedeuten die Werte?"** – siehe unten.
- **Live-Zwischenstände** – im aufgeklappten Spiel lässt sich während einer laufenden Begegnung jedes Einzel/Doppel eintragen; die Stände liegen in Supabase und aktualisieren sich bei allen Betrachtern per Realtime. Der **einzige** Teil der App mit Laufzeit-Daten – siehe unten.

### Konkurrenz-Filter & gespeicherte Auswahl

Über dem Spielplan stehen die Konkurrenzen nach Kategorie (HERREN/DAMEN/MIXED/JUGEND); ein Klick blendet eine Mannschaft ein/aus, ein Klick auf die Kategorie-Überschrift schaltet die ganze Kategorie um. In der unteren Zeile:

- **`Alle aus` / `Alle an`** – ein Toggle-Button, der sich nach dem Zustand richtet: solange **noch eine** Konkurrenz aktiv ist, heißt er `Alle aus` (Klick → alle ab); ist **keine** aktiv, heißt er `Alle an` (Klick → alle ein). Wirkt nur auf die **gerade angezeigte Saison**, nicht auf die anderen.
- **`Nur Heim`** – blendet Auswärtsbegegnungen aus (saisonübergreifender Schalter).

**Auswahl speichern:** Unten im **„Konkurrenzen"-Panel** liegt **`Auswahl speichern`**. Das schreibt die aktuelle Auswahl **explizit** (nicht automatisch) in `localStorage` und zeigt kurz „✓ Gespeichert". Beim nächsten Seitenaufruf wird sie automatisch geladen – ohne erneutes Einstellen.

**Code-Landkarte:**
- `src/components/TeamFilter.tsx` – Filter-UI; `Alle aus`/`Alle an` leitet sich aus `anyActive` über alle Kategorie-IDs ab und ruft den Prop `setAllTeams(on)`.
- `src/App.tsx` – Quelle der Wahrheit: `activeTeams` als ein Set **je Saison** (+ `homeOnly`). `setAllTeams` und die Toggles wirken über `updateSelection` nur auf die aktive Saison. **Persistenz**: `loadPrefs()`/`initialSelection()` einmalig beim Mount, `savePrefs()` schreibt auf Knopfdruck.
- `src/components/TeamFilterDropdown.tsx` – Button `Auswahl speichern` (Prop `onSavePrefs`) inkl. „✓ Gespeichert"-Flash.
- `localStorage`-Key **`tcp-filter-prefs`**, Format `{ "teams": { "<seasonId>": string[] }, "homeOnly": boolean }` (Team-IDs der **aktiven** Konkurrenzen, alle Saisons in einem Eintrag). Die alte Fassung `{ "summer": [...], "winter": [...] }` wird beim Laden weiterhin übernommen. Liegt neben dem separaten Favoriten-Key `tcp-favorites` aus `src/hooks/useFavorites.ts`.

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

### Live-Zwischenstände (Supabase) — der einzige dynamische Teil

Während eine Begegnung läuft, kann **jeder Besucher** im aufgeklappten Spiel die
einzelnen Einzel und Doppel eintragen. Diese Stände sind **unabhängig** von den
offiziellen BTV-Ergebnissen und werden später von ihnen abgelöst.

- **Schema:** `supabase-setup.sql` — `match_scores` (eine Begegnung, eindeutig über
  `team_id + match_date + match_time`) und `individual_matches` (ein Einzel/Doppel je
  Position, per `match_score_id` verknüpft, `ON DELETE CASCADE`).
- **Kein Login.** Die RLS-Policies erlauben der Rolle `anon` ausdrücklich Lesen,
  Einfügen und Ändern — bewusst so für eine Vereins-App ohne Benutzerkonten.
- **Code-Landkarte:** `src/hooks/useLiveScores.ts` (Initial-Load beider Tabellen +
  Realtime-Abo + `saveScores`), `src/components/LiveScorePanel.tsx` (Anzeige und
  Bearbeiten-Umschaltung, eingebunden aus `MatchDetail.tsx`),
  `src/components/ScoreEntry.tsx` (Eingabemaske),
  `src/utils/score-helpers.ts` (`computeWinner`, `needsThirdSet`,
  `isRegularSetComplete`, `isChampionsTiebreakComplete`),
  `src/components/ScoreBadge.tsx` (Kurzstand in der Spielplan-Zeile).
- Wie viele Positionen eine Begegnung hat, kommt aus `src/data/team-format.ts`
  (`getSinglesCount`/`getDoublesCount`) — steht eine Konkurrenz dort nicht drin, zeigt
  die Eingabemaske still **6 Einzel + 3 Doppel** statt 4 + 2.

⚠️ **Daran hängt die häufigste Build-Falle des Projekts:** `src/lib/supabase.ts` ruft
`createClient(...)` schon beim Modul-Import auf. Ohne `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` wirft das beim Laden und die App rendert eine **komplett leere
Seite** — nicht etwa nur ohne Live-Scores. Details unter „Stolperfalle ‚leere Seite im
git-worktree'" weiter unten.

---

## Vorhaben: Suche, Spielerhistorie und Gegnerbriefing (Spezifikation, Stand 09.09.2026)

> **Status: nur dokumentiert, nichts davon ist gebaut.** Auftrag vom 09.09.2026, erste
> Rückmeldung des Auftraggebers vom selben Abend eingearbeitet (Suche-Knopf, Datenstand im
> ⋯-Menü, LK an jedem Namen, Farblogik aus Sicht der betrachteten Mannschaft, F1–F4 und F8
> entschieden). Umsetzung der App-Teile **und** der Automatik erst nach **ausdrücklicher
> Freigabe** — vorher sind die noch offenen Fragen F5–F7 zu klären und die Mockups abzunehmen.
> Die stehende Freigabe „fertige Arbeit ausliefern" gilt für dieses Vorhaben **nicht**, solange
> die Freigabe fehlt. Rezept und Gate: [docs/AUFGABEN.md, Abschnitt 9](docs/AUFGABEN.md);
> Auswirkungen auf den Aufbau: [docs/ARCHITEKTUR.md, Abschnitt 13](docs/ARCHITEKTUR.md);
> Begriffe im [Glossar](docs/GLOSSAR.md) („Vorhaben Gegnerbriefing").

### 1. Suche oben

- In der Kopfzeile (Zeile 1, links vom ⋯-Menü) steht ein **beschrifteter Knopf „🔍 Suche"** —
  deutlich größer als die übrigen Pillen, damit er als Einstieg erkennbar ist. Er öffnet ein
  Such-Overlay; Treffer erscheinen ab dem zweiten Zeichen in zwei Gruppen: **Mannschaften** und
  **Spieler**.
- **Suche über alle erfassten Saisons** (entschieden, F1); jeder Treffer nennt die Saisons, in
  denen er vorkommt.
- **Spieler:** eigene **und** gegnerische — alle Namen aus Meldelisten und Spielberichten. Treffer
  zeigen Name, Verein/Mannschaft, aktuelle LK und Saisons. Antippen → **Spielerhistorie**.
- **Mannschaften:** ausschließlich Mannschaften, die **mit einer TCP-Konkurrenz in derselben Gruppe**
  spielen — nicht der ganze Verein (vom TC Gauting also nur „Herren 40 · Bayernliga Gr. 022 SU").
  Antippen → **vollständige Meldeliste** in der bestehenden Darstellung (`TeamStatsDetail`).
- Kein Router: das Overlay ist Zustand in `App.tsx` wie `calendarOpen`; Zurück schließt es.

### 2. Spielerhistorie ab Winter 2024/25

- Eine Spielerseite je Person mit **allen Einzeln und Doppeln ab der Winterrunde 2024/25**, nach
  **Sommer-/Wintersaisons getrennt, neueste zuerst**. Je Einsatz: Datum, Einsatzposition (E1–E6,
  D1–D3), Gegner mit LK (Einzel) bzw. Gegnerpaar **und Doppelpartner** (Doppel), Sieg/Niederlage
  und die Satzergebnisse als Satzfelder (wie in `MatchCard`).
- Filter **„Nur gegen TC Pliening"** blendet alles aus, was nicht gegen eine TCP-Mannschaft war;
  Zeilen gegen Pliening tragen eine kleine **„TCP"-Marke** (nur Kennzeichnung, keine andere Farbe).
- **Fehlende Saisons sind zu ergänzen** — heute liegen Spielberichte nur für Sommer 2026 vor
  (Winter 2025/26: nur Tabellen, keine Berichte, groupids nicht mehr hinterlegt; Winter 2024/25 und
  Sommer 2025 gar nicht im Projekt). **Erster Schritt der Umsetzung ist die Prüfung, was der BTV
  noch liefert** (entschieden, F2). Was sich nicht mehr beschaffen lässt, wird als **Datenlücke**
  in der Historie **ausgewiesen**, nicht stillschweigend weggelassen.
- Spieler-Identität: normalisierter Name (`normalizePlayerName`) **plus Verein**. **Vereinswechsel
  ergibt zwei getrennte Einträge** (entschieden, F3); die Historie nennt den Verein je Saison.

### 3. Gegnerbriefing je TCP-Begegnung

- Sitzt **direkt in der aufgeklappten Begegnung im Spielplan** (`MatchDetail`), unter Endergebnis/
  Termin/Spielort, als Block **„Gegnerbriefing"** mit drei Reitern. **Alles darin stammt aus der
  laufenden Saison** (entschieden, F4) — keine saisonübergreifenden Duelle im Briefing; ältere
  Begegnungen findet man über die Spielerhistorie.
  1. **Meldeliste** des Gegners (kompakt, `RosterRow`-Optik) — je Spieler Rang, Name, **LK**,
     **Einsatzhäufigkeit** („3× E1 · 2× Doppel mit Reiter"), Bilanz.
  2. **Aufstellungen** — die **tatsächlichen** Aufstellungen jeder bisher gespielten Begegnung des
     Gegners (E1…D2 als **Nachname + LK**, z. B. „Gautsch 6,4") **und** darunter **„Unsere
     Aufstellungen"** der eigenen TCP-Konkurrenz in derselben Darstellung.
  3. **Ergebnisse** — die Begegnungsergebnisse des Gegners in dieser Runde.
- **Keine Aufstellungsprognosen.** Nur **belegte Einsätze** aus Spielberichten; Wörter wie
  „voraussichtlich" kommen nicht vor.
- **Datenstand nicht im Briefing.** Datum + Uhrzeit des letzten Einlesens und der **nächste
  geplante Lauf** stehen im **⋯-Menü** oben rechts (unter „Kalender-Downloads"), damit das
  Briefing selbst schlank bleibt.
- Vor dem ersten Spieltag zeigt das Briefing nur die Meldeliste; Aufstellungen/Ergebnisse haben
  dann einen Leerzustand („noch keine Begegnung gespielt").

### 4. Automatische Aktualisierung (nicht aktiviert)

- **Zeitpunkte je TCP-Begegnung:** erstmals **7 Tage vorher**, erneut **4 Tage vorher** und **am
  Spieltag um 01:00 Uhr deutscher Zeit** (Europe/Berlin — nicht fest in UTC verdrahten).
- **Vorgehen je Lauf:** (1) Spielplan-Reports (`ScheduleReportFOP`) der betroffenen Gruppen ziehen
  — so sind **Spielverlegungen** bekannt, bevor das Briefing entsteht; (2) neue/korrigierte
  **Spielberichte** der Gruppe crawlen, damit die zwischenzeitlichen Gegnerspiele enthalten sind;
  (3) Meldelisten der Gruppe nachziehen; (4) `gen:spielberichte`, `gen:standings -- --write`,
  `npm run check`; (5) Datenstand und nächsten Lauf schreiben; (6) Commit → Deploy. Ergebnisse,
  Tabellen und Spielberichte werden im selben Lauf aktuell.
- **Empfohlener Mechanismus (F5 offen):** ein **täglicher Wecker um 01:00 Uhr Berlin**, der die
  Spieltermine liest und **nur dann** den vollen Lauf startet, wenn eine TCP-Begegnung in genau 7,
  4 oder 0 Tagen liegt. Verlegt der BTV einen Termin, greifen die neuen Abstände beim nächsten
  Wecker von selbst.
- **F5–F7 in einfachen Worten** (die Fragen, die noch zu entscheiden sind):
  - **F5 — Wo läuft der Automat?** Er braucht einen Rechner mit Chrome, der nachts läuft.
    *Option A: GitHub* — dort liegt der Code ohnehin, und GitHub stellt für jeden Lauf kostenlos
    einen frischen Rechner mit Chrome; nichts zu installieren, nichts zu warten. *Option B: unser
    Hetzner-Server* — läuft zwar rund um die Uhr, hat aber keinen Chrome; der müsste installiert
    und gepflegt werden und frisst Arbeitsspeicher, den die anderen Apps dort brauchen.
    **Empfehlung: A.**
  - **F6 — Wie speichert der Automat seine Daten?** Heute gilt: niemand schreibt direkt in den
    Hauptstand (`main`); jede Änderung ist ein Pull Request, der gemergt wird. Ein Automat, der
    nachts neue Daten holt, muss sie ebenfalls ablegen. *Option A:* er legt selbst einen Pull
    Request an und mergt ihn sofort — die Regel bleibt, und jeder nächtliche Lauf ist später in
    der PR-Liste nachlesbar. *Option B:* der Automat darf als einzige Ausnahme direkt schreiben —
    einfacher, aber die Regel bekommt ein Loch. Für dich sieht beides gleich aus (Daten sind
    morgens live). **Empfehlung: A.**
  - **F7 — Was, wenn ein Lauf scheitert** (BTV nicht erreichbar, Chrome stürzt ab)? Dann bleibt
    der alte Datenstand stehen, und das ⋯-Menü zeigt das Alter. *Zusätzlich* kann GitHub dir bei
    jedem gescheiterten Lauf automatisch eine E-Mail schicken. **Empfehlung: ja, E-Mail an.**

### 5. Mobile first, bestehendes Design

- Bestehende Bausteine **wiederverwenden**: Kopfzeile/Segment-Leiste aus `Header`,
  Mannschaftsfarben (`Team.color`), kompakte Meldelisten (`RosterRow`, `LkPill`, `ResultBadge`),
  Satzfelder und Namenszeilen aus `MatchCard`/`SideLine`, Bottom-Sheet aus `SpielberichtDrawer`.
- Viewport **420×912** (iPhone Air) ist der Maßstab; Tap-Ziele mindestens 44 px hoch; **kein
  horizontales Scrollen**.

### 6. Farblogik: immer aus Sicht dessen, den man gerade anschaut

Entschieden am 09.09.2026 (ersetzt die erste Fassung „Grün = positiv für Pliening" für
Profile und Briefing):

- **Betrachtete Mannschaft / betrachteter Spieler bestimmt die Farbe.** Öffnet man den TC
  Gauting oder einen Gautinger Spieler, heißt **Grün: Gauting hat gewonnen, Rot: Gauting hat
  verloren — auch gegen den TC Pliening.** Es gibt keinen Farbwechsel innerhalb einer Liste;
  die „TCP"-Marke kennzeichnet nur, dass die Zeile gegen Pliening war.
- **Gegnerbriefing:** Ergebnisse und Aufstellungen des Gegners aus **Gegnersicht**, der Block
  „Unsere Aufstellungen" aus **Pliening-Sicht** — jeweils die Mannschaft, die dort gezeigt wird.
- **Spielbericht einer TCP-Begegnung** (aus Spielplan oder Kreuztabelle geöffnet) bleibt wie
  heute aus **Pliening-Sicht** (`tcpWin`/`oppWin`) — dort ist Pliening die betrachtete Mannschaft.
- Gewonnene Satzfelder werden in derselben Sicht dezent gefärbt (`setCellClass`). Technisch ist
  das ein Parameter „Sicht = betrachtete Seite" für `sideOutcome` in `src/utils/spielbericht.ts`;
  neue Farbwerte gibt es nicht.

### Entschieden (09.09.2026)

| # | Frage | Entscheidung |
|---|---|---|
| F1 | Suche über alle Saisons? | **Ja**, alle erfassten Saisons; Treffer nennen die Saisons. |
| F2 | Sind die BTV-Berichte von Winter 2024/25 und Sommer 2025 noch abrufbar? | **Erst prüfen** (eine Gruppe testen); was fehlt, wird Datenlücke. |
| F3 | Vereinswechsel eines Spielers? | **Zwei getrennte Einträge.** |
| F4 | Briefing-Reichweite? | **Nur laufende Saison** — Meldeliste, Aufstellungen, Ergebnisse. |
| F8 | Farblogik in Profilen? | **Immer aus Sicht der betrachteten Mannschaft/des Spielers**, auch gegen Pliening. |

### Offen (vor der Umsetzung zu klären)

| # | Frage | Vorschlag |
|---|---|---|
| F5 | Wo läuft der Automat — GitHub oder Hetzner-Server? (Erklärung oben, Punkt 4) | GitHub. |
| F6 | Wie speichert der Automat — eigener Pull Request oder direkt? (Erklärung oben) | Eigener Pull Request mit sofortigem Merge. |
| F7 | E-Mail bei gescheitertem Lauf? | Ja. |

**Mockups:** Artefakt „TCP Gegnerbriefing Mockups" — <https://claude.ai/code/artifact/5e357869-f7e8-468b-81c6-147cc6c190e5> (Beispieldaten; Stationen 1–6, im
Handy antippbar; Stand nach der Rückmeldung vom 09.09.2026)

---

## Daten pflegen (nuLiga)

Alle Liga-/Spieldaten stammen aus offiziellen **BTV-nuLiga-PDFs** und liegen in zwei Dateien. `club=22844` = TC Pliening; Saison Sommer 2026 = `season=18103` (wechselt je Saison — aktuellen Link von der [Vereinsseite](https://www.btv.de/de/mein-verein/vereinsseite/tc-pliening.html) holen).

> **Zuordnung passiert automatisch aus dem PDF.** Jedes Spielbericht-PDF (MeetingReportFOP) nennt im Kopf **Liga/Gruppe, Termin, beide Mannschaften und Endergebnis** — daraus folgt eindeutig die Ziel-Liga und -Begegnung. Es genügt also, die **PDF-Links zu liefern** (die Konkurrenz muss nicht dazugeschrieben werden). Auch Begegnungen **ohne TC Pliening** werden eingetragen (sie füllen die Kreuztabelle der jeweiligen Liga). Den **Gesamt-Tabellen-Report** (ResultReportFOP, s. u.) holt man sich selbst dazu — er steckt NICHT im einzelnen Spielbericht.

### Winterrunde 2026/27 → `src/data/winter-2627.ts`

Angelegt am **09.09.2026**, als der BTV die Spieltage veröffentlicht hatte. **Sieben Mannschaften,
34 Begegnungen, Spieltage 10.10.2026 – 20.03.2027.** Alles steht auf `status: "open"`, die Tabellen
auf `0:0` — die Reihenfolge dort ist die **Setzliste** des BTV, kein erspielter Platz (die App zeigt
deshalb „*n* Mannschaften" statt „Platz *x*", solange alle Punkte 0:0 sind).

| Mannschaft | Liga | `groupid` |
| --- | --- | --- |
| Herren 40 | Bayernliga · Gr. 022 SU | 2253303 |
| Herren 50 | Bayernliga · Gr. 029 SU | 2253304 |
| Herren 30 | Südliga 1 · Gr. 119 | 2257785 |
| Herren 30 II | Südliga 2 · Gr. 129 | 2257803 |
| Damen | Südliga 1 · Gr. 082 | 2257743 |
| Damen 40 | Südliga 2 · Gr. 200 | 2257871 |
| Damen 50 | Landesliga 1 · Gr. 054 SU | 2253322 |

Quellen und Fallstricke:

- **Spielplan + Teilnehmer:** je Gruppe der Report „Tabelle und Spielplan" (nu.Dokument 013),
  `nuDokument?dokument=ScheduleReportFOP&group=<groupid>` — per `curl -L` erreichbar.
  In diesem PDF sind die **Hallennamen abgeschnitten** („TC Grün-Weiß Gräfe…"); die vollen Namen
  stehen im btv.de-Widget zwischen den Ergebnis-Spalten und dem Gastverein.
- Der Spielort kann **wörtlich der Heimverein** sein (Gräfelfing spielt in Gräfelfing). Beim Parsen
  des Widgets deshalb erst den **Gast aus dem PDF** festhalten und den Spielort als „die andere
  Zeile" bestimmen — sonst vertauschen sich beide.
- **Der vereinsweite `ResultReportFOP` deckt die Winterrunde nicht ab.** Ein Durchprobieren der
  `season`-IDs (18106–18420) fand nur Sommer-2026-Reports; die Winter-Saison-ID ist auf diesem Weg
  nicht zu finden. Die sieben Gruppen-Reports oben sind die Datenbasis.
- **Format: 4 Einzel + 2 Doppel** in *allen* Winter-Ligen, von der Bayernliga bis zur Südliga
  (geprüft am Blanko-Spielbericht, nu.Dokument 011d). In `team-format.ts` sind die `w27-*`-Ids
  darum durchgängig `"4er"`. *(Die alten `w-*`-Ids aus Winter 2025/26 stehen dort noch auf `"6er"`
  — folgenlos, weil in jener Saison jede Begegnung ein Endergebnis hat und „Ergebnis eintragen"
  deshalb gar nicht erscheint.)*
- **Neue `groupid` finden:** siehe „Meldelisten" weiter unten — im Widget
  `btv-prod.burdadigitalsystems.de/btvteams/?clubnr=02467` zuerst so oft **„MEHR LADEN"** klicken,
  bis der Button verschwindet (sonst fehlen Mannschaften), dann `window.open` überschreiben und die
  **„Tabelle/Spielplan [PDF]"**-Elemente klicken.

### Eine Saison anlegen

Sobald der BTV die Termine der nächsten Runde veröffentlicht hat, macht das Skript die Arbeit:

```bash
npm run season:new -- --discover-only                                  # nur ansehen, was gelistet ist
npm run season:new -- --id sommer-27 --label "Sommer 2027" --layout summer
```

Es öffnet das Vereins-Widget (klickt „MEHR LADEN" bis zum Ende), fängt die groupids ab, zieht je
Gruppe den Spielplan-Report, ergänzt die Spielorte aus dem Widget — im PDF sind die Hallennamen
abgeschnitten — und schreibt eine fertige `src/data/<id>.ts`: Teams, Kategorien, Tabellen auf 0:0,
Begegnungen auf `"open"`, Monate und Monatsfarben. Am Ende druckt es die Schnipsel für die fünf
Stellen, die es nicht selbst setzen kann:

1. `scripts/seasons.mjs` — Saison-Block **nach vorn** (fertig ausgegeben, inkl. groupids).
2. `SeasonId` in `src/types.ts` erweitern.
3. `src/data/seasons.ts` — **die laufende Runde nach vorn**, `SEASONS[0]` ist die Vorauswahl.
4. Eintrag in der Registry `src/data/season-data.ts` (`supportsPdf` nur für die Sommerrunde, weil
   `pdf-export.ts` deren Monatsfarben kennt).
5. `team-format.ts` um die neuen Konkurrenz-Ids ergänzen, sonst gilt still `"6er"`.

Danach `npm run season` — steht die neue Runde vorn, ziehen Crawler, Generator und Prüfskript ab
sofort auf sie. **Gegenlesen**, was das Skript nicht wissen kann: Das Widget nennt zweite
Mannschaften oft nur „Herren 30"; die römische Ziffer leitet das Skript aus dem Vereinsnamen ab
(„TC Pliening II") und meldet, wenn ein Name doppelt bleibt. Auch `layout` (Sommer = Ergebnisse nur
in der Kreuztabelle) und `teamSize` je Gruppe gegen den Blanko-Spielbericht prüfen.

App-Komponenten müssen **nicht** angefasst werden: `App.tsx` und `CalendarDownloads.tsx`
lesen alles aus der Registry. Die gespeicherte Filter-Auswahl liegt seit Winter 2026/27 als
`{ teams: { <seasonId>: [...] }, homeOnly }` im `localStorage`; die alte Fassung mit
`summer`/`winter` wird beim Laden weiterhin übernommen, neue Saisons starten mit allen
Konkurrenzen an.

### Welche Saison ziehen die Skripte?

Keines der Werkzeuge fragt danach — `scripts/seasons.mjs` liest die eingetragenen Spieltermine und
wählt die Runde, in deren Zeitraum das heutige Datum fällt (bzw. die in weniger als 60 Tagen
beginnt oder zuletzt endete). Im Übergang zwischen zwei Runden nennt es die zweite Kandidatin dazu.

```
$ npm run season
→ winter-2627   Winter 2026/27   2026-10-10 – 2027-03-20  ( 34 Begegnungen)  7 Gruppen, Layout winter
  sommer-26     Sommer 2026      2026-05-02 – 2026-09-06  (114 Begegnungen)  18 Gruppen, Layout summer
  winter-2526   Winter 2025/26   2025-10-04 – 2026-03-28  ( 27 Begegnungen)  0 Gruppen, Layout winter

Saison: Winter 2026/27 (winter-2627) — startet in 31 Tagen; 2026-10-10 – 2027-03-20, 34 Begegnungen
        Hinweis: Sommer 2026 endete vor 3 Tagen — Nachlese mit --season sommer-26
```

Jedes Skript nennt beim Start die Saison, auf die es wirkt, und lässt sich mit `--season <id>`
umlenken. `layout` entscheidet, wie Ergebnisse gespeichert sind: `"summer"` nur in der
Kreuztabelle (der Spielplan `matches.ts` kennt bloß Termine), `"winter"` zusätzlich an jeder
Begegnung (`mp`/`sets`/`games`/`status`) — `gen:standings` schreibt beides, `check` vergleicht sie.

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
- **Stand 07.09.2026 (letzter Abgleich):** Alle **zehn** bisher gespielten Begegnungen der Gruppe sind
  **mit Spielbericht** erfasst. TC Pliening hat seine **fünf** Begegnungen komplett: Kirchheim **4:2**,
  Haar **2:4** (A), Feldkirchen **4:2**, **Forstern 6:0** (30.08., H) und **Markt Schwaben 5:1**
  (06.09., A) — damit **Pliening 1.** (8:2, 21:9) vor Haar (7:1). Offen bleiben nur noch Begegnungen
  **ohne Pliening** (12.09.–27.09., mehrfach verlegt); sie stehen in der Kreuztabelle als `"0:0"`.
  Die Mixed-Berichte haben inzwischen Meeting-IDs (z. B. Nr. 5 = meeting 12927839) — die
  Druckversion-Links stehen im Spielbericht-Modal des btv.de-Widgets (s. u.).
- **Meldelisten:** siehe eigenen Abschnitt „Meldelisten" weiter unten — auch die Mixed-Vereine
  sind dort erfasst (Herren und Damen separat nummeriert, z. B. Markt Schwaben 35 H + 23 D).

**Datenstand (Tabellen-Abgleich 07.09.2026): Sommer 2026 vollständig.** Alle 18 Konkurrenzen sind mit
Tabelle, Kreuztabelle, Spielberichten und Meldelisten erfasst — 407 Berichte, 3.198 Einzel/Doppel,
132 Meldelisten mit 4.238 Spielern. `node scripts/check-data.mjs` meldet: von 816
Kreuztabellen-Zellen mit Ergebnis haben **814 einen passenden Spielbericht**, 0 Abweichungen. Die
zwei Ausnahmen sind bekannt und korrekt so:

- **Gr. 315 Markt Schwaben–Forstinning 6:3** (2 Zellen): Forstinning ist zurückgezogen, nuLiga liefert
  den Bericht nicht mehr aus — das Tabellen-Ergebnis bleibt.

Erledigt: Die früher hier dokumentierte Abweichung **Gr. 043 SU Schloßberg–Grün-Gold** (Tabelle 1:3
gegen gespielte 2:7) besteht nicht mehr — der BTV führt inzwischen 2:7, `check-data` meldet 0
Abweichungen.

Ebenfalls erwartbar: **Midcourt U10 (Gr. 870)** hat keine Meldelisten (s. o.), und rund 0,5 % der
Spieler-Nennungen (43 von 8.269) stehen nicht auf der Meldeliste ihrer Mannschaft — das sind
Ersatzspieler aus anderen Mannschaften des Vereins und erscheinen unter „Weitere Einsätze"
(`node scripts/check-names.mjs`). **Für den TC Pliening ist die Saison damit komplett** — auch die
Mixed-Runde. In Gr. 074 laufen nur noch Begegnungen ohne Pliening (12.09.–27.09.), die beim
nächsten Abgleich in die Kreuztabelle der Gruppe nachrücken.

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

**AUTO-GENERIERT — nicht von Hand editieren.** Seit 16.08.2026 sind **alle** Begegnungen aller 18 Konkurrenzen erfasst (Stand 07.09.2026: **407 Berichte, 3.198 Einzel/Doppel**); `src/data/spielberichte.ts` ist nur noch der Lookup drumherum (`getSpielbericht`, `getAllSpielberichte`). Die früher handgepflegten Berichte sind entfallen — der Crawl deckt sie alle ab (117/117 identisch bis auf Länderkürzel-Schreibweise und zwei Namen, die nuLiga inzwischen korrigiert hat).

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
npm run crawl:meldelisten                      # alle Gruppen der laufenden Saison
npm run crawl:meldelisten -- 074               # nur passende Gruppe(n) (Filter auf leagueName/groupid)
npm run crawl:meldelisten -- --season sommer-26   # andere Saison
```

Der Crawler (`scripts/crawl-meldelisten.mjs`, braucht Google Chrome, Pfad via `CHROME_PATH`
überschreibbar) holt die Listen aus den **btv.de-Mannschaftsportraits**. Stand 16.08.2026:
**132 Mannschaften, 4.238 Spieler** — alle 18 Konkurrenzen der Sommer-Saison. Die Gruppen stehen
je Saison in **`scripts/seasons.mjs`** (`groupid`, `leagueName`, `mode` herren/damen/mixed,
`teamSize` 9 oder 6); dieselbe Registry nutzen Spielbericht-Crawler, Generator und Prüfskript.

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

PDF(s) ziehen → **erst prüfen, ob `SB_<meetingID>` schon existiert** (gelieferte Link-Listen enthalten öfter bereits eingetragene oder doppelte Links → überspringen) → Daten eintragen → `npm run build` (`tsc -b` + `vite`) → **PR + `gh pr merge --squash`** (löst Deploy aus; seit 07.09.2026 **ohne Rückfrage**, siehe „Deployment"). Sanity-Checks: Summe der gewonnenen Einzel/Doppel = Endstand der Begegnung; Kreuztabellen-Wert = Mannschafts-Matchpunkte. Nach dem Deploy den live ausgelieferten Bundle-Hash prüfen (siehe „Stolperfalle" unten).

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

**Es gibt keine automatisierten Tests** (kein Vitest/Jest, keine `*.test.ts`). Die Rolle der
Testsuite übernehmen vier andere Ebenen — Typen/Build (`npm run build`), Lint
(`npm run lint`), der **Daten-Konsistenzcheck** (`npm run check`, `-- --all` für alle
Saisons) und der **Browser-Smoke-Test** (headless Chrome, mobil). Was das im Einzelnen
prüft, steht in [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md) („Prüfen statt testen").

## Deployment

Seit 2026-06-17 Auto-Deploy via GitHub Actions (`.github/workflows/deploy.yml`):
Push auf `main` → SSH zu Server web01 → Repo synchronisieren + `npm ci` + `npm run build` (Vite).

- Statische Site: nginx serviert `/var/www/tcp-spielplan.de/dist`, kein pm2/Server-Prozess.
- Repo-Secrets: `SERVER_IP`, `SERVER_USER`, `SSH_PRIVATE_KEY` (gemeinsamer Deploy-Key auf web01).
- Deploy nur via **PR-Merge** auf `main` (kein Direkt-Push).
- **Stehende Freigabe (07.09.2026):** Fertige, geprüfte Änderungen werden **ohne Rückfrage** gemergt
  und live genommen — vorher die Prüfungen des Repos laufen lassen, danach das ausgelieferte Bundle
  verifizieren (s. u.). Das gilt für alle Repositories von Thomas.
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
curl -s https://tcp-spielplan.de/ | grep -oE 'assets/index-[^"]+\.js'   # Hash kann - und _ enthalten
curl -s https://tcp-spielplan.de/assets/index-XXXX.js | grep -c <feature-string>
```
Dabei beachten: **Tabellen- und Spielbericht-Texte stehen nicht im Startbundle**, sondern in den
lazy geladenen Chunks (`StandingsView-*.js`, `SpielberichtDrawer-*.js`). Ein `grep` nach „BTV-Stand"
oder „im Einsatz" im Startbundle schlägt deshalb korrekt fehl — für diese Teile die Live-Seite im
Browser aufrufen und den Tabellen-Reiter öffnen.

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
das ⋯-Menü-Öffnen ab). Sinnvolle Viewports: **iPhone Air `420×912`** (das Gerät, auf dem die Seite
tatsächlich gelesen wird), iPhone 13 `390×844` und iPhone SE `375×667` (kleinster gängiger Screen). Zusätzlich auf **horizontalen Overflow** prüfen
(`document.documentElement.scrollWidth > clientWidth` muss `false` sein).
