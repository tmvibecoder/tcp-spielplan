// Saison-Registry für die Skripte — das Gegenstück zu src/data/season-data.ts.
//
// Alle Werkzeuge (Crawler, Generatoren, Prüfskripte) arbeiten auf EINER Saison.
// Welche das ist, muss niemand angeben: `resolveSeason()` liest die Spieltermine
// aus den Datendateien und wählt die Saison, in deren Zeitraum das heutige Datum
// fällt. Trägt jemand im April 2027 die Sommer-27-Termine ein, zieht ab dann
// alles automatisch die Sommerrunde 2027.
//
//   node scripts/seasons.mjs            # zeigt, welche Saison gerade aktiv ist
//
// Eine neue Saison eintragen: Block unten ergänzen — groupids liefert
// `npm run season:new -- --discover-only` (laufende Runde) bzw.
// `node scripts/discover-groups.mjs --season "<BTV-Name>"` (jede Runde,
// auch vergangene). Mehr braucht keines der Skripte.
//
// Zwei Arten von Saisons:
//   - mit Spielplan/Tabellen (dataFile gesetzt): erscheinen in der App im
//     Saison-Dropdown, Ergebnisse zieht generate-standings.mjs nach.
//   - nur Historie (dataFile null, historyOnly true): es gibt für sie
//     ausschließlich Spielberichte und Meldelisten — für die Spielerhistorie und
//     die Suche. Die App zeigt keinen Spielplan dafür.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Ablage der gecrawlten Berichte und Meldelisten: seit 08.10.2026 JSON je
// Gruppe und Saison unter public/data/groups/<saison>/ (scripts/generate-data.mjs,
// Lesen über scripts/data-files.mjs). Die Felder reports/rosters je Saison
// bleiben als Hinweis, wo die Daten liegen.
const REPORTS_FILE = "public/data/groups";
const ROSTERS_FILE = "public/data/groups";

// layout: "summer" = Ergebnisse stehen nur in der Kreuztabelle, der Spielplan
//                    (matches.ts) kennt nur Termine.
//         "winter" = jede Begegnung trägt ihr Ergebnis selbst (mp/sets/games/
//                    status) UND steht in der Kreuztabelle.
// prefix: Präfix der Konstanten in der Datendatei (z. B. WINTER_2627_STANDINGS).
// btvLabel: Name der Saison im btv.de-Gruppen-Such-Widget (für discover-groups).
// groups: je Gruppe groupid, leagueName (exakt wie in der Datendatei), teamLabel
//         (Konkurrenz des TC Pliening), mode (herren/damen/mixed für die
//         Meldelisten-Nummerierung) und teamSize (9 = 6 Einzel + 3 Doppel,
//         6 = 4 Einzel + 2 Doppel bzw. Mixed).
//         gegner: true = Gruppe OHNE TC Pliening, erfasst nur für die
//         Spielerhistorie der Gegner (seit 06.10.2026: die Vorsaisons aller
//         Gegner der Winterrunde 2026/27, gefunden mit discover-groups.mjs
//         --clubs). teamLabel ist dort schlicht die Altersklasse. Sie liefern
//         nur Spielberichte und Meldelisten — keine Tabellen, keinen Spielplan;
//         `--gegner` bei den Crawlern beschränkt einen Lauf auf diese Gruppen.
export const SEASONS = [
  {
    id: "winter-2627",
    label: "Winter 2026/27",
    btvLabel: "Winter 2026/2027",
    layout: "winter",
    prefix: "WINTER_2627",
    dataFile: "src/data/winter-2627.ts",
    matchesFile: "src/data/winter-2627.ts",
    reports: REPORTS_FILE,
    rosters: ROSTERS_FILE,
    teamSize: 6, // 4 Einzel + 2 Doppel
    groups: [
      { groupid: "2253303", leagueName: "Bayernliga · Gr. 022 SU",   teamLabel: "Herren 40",    mode: "herren", teamSize: 6 },
      { groupid: "2253304", leagueName: "Bayernliga · Gr. 029 SU",   teamLabel: "Herren 50",    mode: "herren", teamSize: 6 },
      { groupid: "2257785", leagueName: "Südliga 1 · Gr. 119",       teamLabel: "Herren 30",    mode: "herren", teamSize: 6 },
      { groupid: "2257803", leagueName: "Südliga 2 · Gr. 129",       teamLabel: "Herren 30 II", mode: "herren", teamSize: 6 },
      { groupid: "2257743", leagueName: "Südliga 1 · Gr. 082",       teamLabel: "Damen",        mode: "damen",  teamSize: 6 },
      { groupid: "2257871", leagueName: "Südliga 2 · Gr. 200",       teamLabel: "Damen 40",     mode: "damen",  teamSize: 6 },
      { groupid: "2253322", leagueName: "Landesliga 1 · Gr. 054 SU", teamLabel: "Damen 50",     mode: "damen",  teamSize: 6 },
    ],
  },
  {
    id: "sommer-26",
    label: "Sommer 2026",
    btvLabel: "Sommer 2026",
    layout: "summer",
    prefix: "SUMMER",
    dataFile: "src/data/summer-2026.ts",
    matchesFile: "src/data/matches.ts",
    reports: REPORTS_FILE,
    rosters: ROSTERS_FILE,
    teamSize: 9,
    // Ligen mit zurückgezogenen Mannschaften: die offizielle Tabelle weicht
    // bewusst von den Spielplan-Ergebnissen ab, deshalb handgepflegt lassen.
    keepLeagues: ["Landesliga 2 · Gr. 043 SU", "Südliga 2 · Gr. 315"],
    groups: [
      { groupid: "2215909", leagueName: "Südliga 2 · Gr. 023",               teamLabel: "Herren",         mode: "herren", teamSize: 9 },
      { groupid: "2216174", leagueName: "Südliga 4 (4er) · Gr. 292",         teamLabel: "Herren 30",      mode: "herren", teamSize: 6 },
      { groupid: "2144934", leagueName: "Regionalliga Süd-Ost · Gr. 004",    teamLabel: "Herren 40",      mode: "herren", teamSize: 9 },
      { groupid: "2165598", leagueName: "Landesliga 2 · Gr. 043 SU",         teamLabel: "Herren 40 II",   mode: "herren", teamSize: 9 },
      { groupid: "2219941", leagueName: "Südliga 2 · Gr. 315",               teamLabel: "Herren 40 III",  mode: "herren", teamSize: 9 },
      { groupid: "2139346", leagueName: "Regionalliga Süd-Ost · Gr. 005",    teamLabel: "Herren 50",      mode: "herren", teamSize: 9 },
      { groupid: "2224597", leagueName: "Südliga 1 · Gr. 355",               teamLabel: "Herren 50 II",   mode: "herren", teamSize: 9 },
      { groupid: "2216258", leagueName: "Südliga 3 · Gr. 379",               teamLabel: "Herren 50 III",  mode: "herren", teamSize: 9 },
      { groupid: "2224594", leagueName: "Südliga 1 · Gr. 404",               teamLabel: "Herren 60",      mode: "herren", teamSize: 9 },
      { groupid: "2216042", leagueName: "Südliga 2 · Gr. 160",               teamLabel: "Damen",          mode: "damen",  teamSize: 9 },
      { groupid: "2216316", leagueName: "Südliga 1 · Gr. 441",               teamLabel: "Damen 40",       mode: "damen",  teamSize: 9 },
      { groupid: "2165662", leagueName: "Landesliga 1 (4er) · Gr. 103 SU",   teamLabel: "Damen 50",       mode: "damen",  teamSize: 6 },
      { groupid: "2216367", leagueName: "Südliga 2 (4er) · Gr. 488",         teamLabel: "Damen 50 II",    mode: "damen",  teamSize: 6 },
      { groupid: "2244334", leagueName: "Spielebene B · Gr. 074",            teamLabel: "Mixed",          mode: "mixed",  teamSize: 6 },
      { groupid: "2216568", leagueName: "Südliga 3 · Gr. 686",               teamLabel: "Juniorinnen 18", mode: "damen",  teamSize: 6 },
      { groupid: "2216473", leagueName: "Südliga 4 · Gr. 596",               teamLabel: "Knaben 15",      mode: "herren", teamSize: 6 },
      { groupid: "2216513", leagueName: "Südliga 5 · Gr. 638",               teamLabel: "Knaben 15 II",   mode: "herren", teamSize: 6 },
      { groupid: "2219939", leagueName: "Südliga 1 · Gr. 870",               teamLabel: "Midcourt U10",   mode: "mixed",  teamSize: 6 },
      { groupid: "2165586", leagueName: "Bayernliga · Gr. 037 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Pfarrkirchen, TC Vilshofen, TC Gauting, FC Ergolding, TV Altötting, STC Oberland, TC Rot-Weiß Eschenried, HC Wacker München
      { groupid: "2165600", leagueName: "Bayernliga · Gr. 044 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // TC Pfarrkirchen, GW Luitpoldpark München, TC Passau-Neustift, SV Schloßberg-Stephansk., TC Weilheim, TC Dachau 1950, TC Thalkirchen München, TC Erding
      { groupid: "2165654", leagueName: "Bayernliga (4er) · Gr. 101 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // GW Luitpoldpark München, SV Stadtwerke Augsburg, SV Helfendorf, TC Grün-Weiß Dingolfing, TSV Unterhaching, MTTC Iphitos München, TC Zorneding, TF Dachau
      { groupid: "2165580", leagueName: "Landesliga 1 · Gr. 024 SU", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Rot-Weiß Landshut, TC Ismaning, TF Dachau, TC Rot-Weiß Gersthofen, TC Schießgraben Augsburg II, TC Schrobenhausen, TC Rot-Weiß Eschenried, TC Grün-Weiß Dingolfing
      { groupid: "2219918", leagueName: "Landesliga 1 · Gr. 025 SU", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Großhesselohe, TV Feldkirchen, TC Aschheim II, Münchner Sportclub II, TC Puchheim, STK Garching, MTTC Iphitos München III, HC Wacker München
      { groupid: "2165602", leagueName: "Landesliga 1 · Gr. 039 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // SpVgg Langenbruck, TC Malgersdorf, MTTC Iphitos München II, TSV Haar, TC Bad Aibling, TSV Feldkirchen, SV Weichering, TC Rimsting
      { groupid: "2165603", leagueName: "Landesliga 1 · Gr. 046 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // TC Neuperlach-Kail München, TC Ottobrunn, STC München Süd, TC Hengersberg, MTTC Iphitos München II, SC Landesbank München, SV Wacker Burghausen, TuS Traunreut
      { groupid: "2165657", leagueName: "Landesliga 1 (4er) · Gr. 102 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Gernlinden, TC Bad Bayersoien, MTV 1879 München, TC Eichenau, TSV Gilching, TC Mering, TSV Eintracht Karlsfeld II, TCE Gröbenzell
      { groupid: "2165591", leagueName: "Landesliga 2 · Gr. 027 SU", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Blau-Weiß Fürstenzell, TC Hengersberg II, DJK-TC Büchlberg, SC Freimann, TC Rot-Weiß Deggendorf, TC Ismaning II, TC Rot-Weiß Straubing II, TC Passau-Neustift
      { groupid: "2165587", leagueName: "Landesliga 2 · Gr. 036 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // HC Wacker München III, GW Luitpoldpark München II, TSV 1860 Rosenheim, TC Bad Aibling, TC Traunstein, TS Jahn München, TC Grün-Gold München, TC Surheim
      { groupid: "2165601", leagueName: "Landesliga 2 · Gr. 042 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Geretsried, MTV 1879 München, TeG Blumenau-Großhadern, STC München Süd, TF Dachau, TSV Moosach München, TC Gauting II, TC Blutenburg München
      { groupid: "2165615", leagueName: "Landesliga 2 · Gr. 049 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // TC Puchheim, TC Tutzing, TC Großhesselohe, TC Blutenburg München, MTV 1879 München, TC Mering, TC Kreuzlinger Forst, TC Olching
      { groupid: "2216025", leagueName: "Südliga 1 · Gr. 146", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Rot-Weiß Eschenried II, TC Schwaben Augsburg, TSV Haunstetten, TC Gernlinden, TC Puchheim II, TSV Königsbrunn, TC Mering, WF Klingen
      { groupid: "2216024", leagueName: "Südliga 1 · Gr. 148", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Schongau, TC Großhesselohe II, TSV Moosach München, TC Weilheim, WB Fideliopark München, TSV Gilching, TC Blutenburg München II, TC Ramersdorf
      { groupid: "2226494", leagueName: "Südliga 1 · Gr. 250", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TC Schwabing, SV Lochhausen, TC Thalkirchen München, STC München Süd, TSV Milbertshofen II, PSV München, Ausstellungspark München, TC Grün-Gold München II
      { groupid: "2216180", leagueName: "Südliga 1 · Gr. 300", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Großhesselohe II, SV Walpertskirchen, SV Heimstetten, TSV Forstenried München, MTTC Iphitos München III, TC Harlaching München II, SC Baldham-Vaterstetten, BCF Wolfratshausen
      { groupid: "2226502", leagueName: "Südliga 1 · Gr. 443", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TSV Türkenfeld, TC Sportpark Deisenhofen, TC Ottobrunn, TC Riemerling, STC München Süd II, 1. SC Gröbenzell, SV Planegg-Krailling
      { groupid: "2216356", leagueName: "Südliga 1 (4er) · Gr. 476", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // DJK Altdorf, WB Fideliopark München, TC Rot-Weiß Freising II, TC Ismaning, ASV Dachau, TSV Feldkirchen, SV Lohhof, TSV Eintracht Karlsfeld III
      { groupid: "2216355", leagueName: "Südliga 1 (4er) · Gr. 479", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Geretsried, TC Weilheim II, Lenggrieser TC, TSV Schäftlarn, TC Raschke Taufkirchen, SV Söcking, TC Icking, SG Hausham
      { groupid: "2216039", leagueName: "Südliga 2 · Gr. 159", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // Münchner Sportclub III, STK Garching II, TC Ismaning III, TC Moosburg, TC Cosima München, SV Hörgertshausen, TC Blau-Weiß Neufahrn, TC Rot-Weiß Freising II
      { groupid: "2216149", leagueName: "Südliga 2 · Gr. 261", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TC Erding, TeG Wasserburg-Reitmehring, TC Rot-Weiß Poing, TC Oberding, SV Forsting-Pfaffing, SV Heimstetten, TC Steinhöring
      { groupid: "2216141", leagueName: "Südliga 2 · Gr. 262", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // WB Fideliopark München, SVN München, TC Ramersdorf, TC Grünwald, Weißblau Allianz München, TS Jahn München II, TC Neuperlach-Kail München
      { groupid: "2226501", leagueName: "Südliga 2 · Gr. 263", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // SV Esting, TC Mammendorf, ESV Mü Pasing, Ausstellungspark München II, TeG Blumenau-Großhadern, TC Eichenau II, ESV München Sportpark
      { groupid: "2216185", leagueName: "Südliga 2 · Gr. 309", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // DJK Augsburg-Pfersee, SV Hainhofen, TeG Lechrain, TSV Deuringen, TC Augsburg Siebentisch, TC Dasing, TSV Haunstetten, TSV Bobingen
      { groupid: "2216200", leagueName: "Südliga 2 · Gr. 313", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // HC Wacker München II, TC Blutenburg München II, TC Puchheim, TF Fürstenfeldbruck, ESV München Sportpark, TC Pasing München, TC Rot-Weiß Eschenried II, TF Dachau II
      { groupid: "2216260", leagueName: "Südliga 2 · Gr. 369", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // ESV München Sportpark, TC Blutenburg München II, TSV Feldkirchen, TC Grün-Weiß Gräfelfing II, 1. SC Gröbenzell II, TC Olching II, TSV Eintracht Karlsfeld II
      { groupid: "2227814", leagueName: "Südliga 2 · Gr. 448", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TC Sport Scheck, SV Helfendorf, TC Aschheim, TC Unterföhring II, SC Baldham-Vaterstetten II, TC Großhesselohe, TC Sauerlach
      { groupid: "2219937", leagueName: "Südliga 3 · Gr. 182", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Aschheim III, TF Markt Schwaben, TC Ismaning IV, SC Freimann II, TeG Kirchheim, TC Unterföhring II, TC Steinhöring II
      { groupid: "2216154", leagueName: "Südliga 3 · Gr. 275", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // SV Ostermünchen, TC Greiling, SV DJK Heufeld II, SV Helfendorf, TC Riemerling, TSV Irschenberg, TC Schliersee II
      { groupid: "2226498", leagueName: "Südliga 3 · Gr. 277", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // Polizei SV Haar, TC St.Emmeram München, TSV Unterhaching, TC Unterföhring II, PSV München II, STC München Süd III, Weißblau Allianz München II, SV Stadtwerke München
      { groupid: "2216332", leagueName: "Südliga 3 (4er) · Gr. 454", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Isen, SV Haiming, TC Höhenkirchen, TeG Kirchheim, FC Maitenbeth, TC Ismaning II
      { groupid: "2216336", leagueName: "Südliga 3 (4er) · Gr. 458", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TSV Pentenried, TC Grünwald, TC Forstenrieder Park, TC Gauting II, SV DJK Taufkirchen, STC München Süd III
      { groupid: "2216080", leagueName: "Südliga 4 (4er) · Gr. 204", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Rot-Weiß Eschenried III, FC Pipinsried, SG Oberzeitlbach, SV Unterschneitbach, ESV Spfrd.Neuaubing, TC Lauterbach 1973 II, DJK Stotzard
      { groupid: "2226497", leagueName: "Südliga 4 (4er) · Gr. 291", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TC Thalkirchen München II, TSC WWK, Ausstellungspark München III, ESV Mü Pasing II, ESV München Sportpark II, SV Lochhausen II, TF Fürstenfeldbruck
      { groupid: "2216212", leagueName: "Südliga 4 (4er) · Gr. 340", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Schießgraben Augsburg II, DJK Stotzard, TC Dasing II, SV Hainhofen II, TSV Haunstetten II, TSG Augsburg, TeG Lechrain II
      { groupid: "2216277", leagueName: "Südliga 4 (4er) · Gr. 395", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // ESV Mü Pasing, TC Fürstenfeldbruck, TC Eichenau II, TC Schwabing, SV Esting, TC Grün-Weiß Gräfelfing III
      { groupid: "2216342", leagueName: "Südliga 4 (4er) · Gr. 468", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // MTTC Iphitos München II, TF Markt Schwaben, ATSV Kirchseeon, SV Langenbach, TeG Mühldorf III, SC Freimann, TC Neukeferloh II
      { groupid: "2165582", leagueName: "Bayernliga · Gr. 016 SU", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TSV Haar, TC Rot-Weiß Straubing, TC Rot-Weiß Freising, TC Aschheim, GW Luitpoldpark München, SV Wacker Burghausen, TC Schießgraben Augsburg II
      { groupid: "2165583", leagueName: "Landesliga 1 · Gr. 017 SU", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Piding, TC Raschke Taufkirchen, TC Blau-Weiß Fürstenzell, TC Rot-Weiß Landshut, TC Achental Grassau, TC Grün-Weiß Vilsbiburg, TC Grünwald
      { groupid: "2165577", leagueName: "Landesliga 1 · Gr. 018 SU", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Großhesselohe II, TC Augsburg Siebentisch II, Münchner Sportclub, GW Luitpoldpark München II, MTTC Iphitos München II, TC Friedberg, TC Dachau 1950, TC Lindau
      { groupid: "2165579", leagueName: "Landesliga 2 · Gr. 021 SU", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TSV 1860 Rosenheim II, TSV Feldkirchen, TC Ismaning, STK Garching, TC Übersee, GW Luitpoldpark München III, HC Wacker München, TeG Mühldorf
      { groupid: "2185755", leagueName: "Landesliga 2 · Gr. 022 SU", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Grün-Weiß Gräfelfing, TC Blutenburg München, TC Gernlinden, TC Rot-Weiß Eschenried, TC Memmingen, TC Weilheim, TC Eichenau, TC Holzgünz
      { groupid: "2185774", leagueName: "Bayernliga · Gr. 023 SU", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Grün-Weiß Gräfelfing, Münchner Sportclub, SV Wacker Burghausen, TC Rot-Weiß Straubing, TC Raschke Taufkirchen II, MTTC Iphitos München II, TC Augsburg Siebentisch, TC Blutenburg München
      { groupid: "2165592", leagueName: "Landesliga 2 · Gr. 028 SU", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Achental Grassau, TC Raschke Taufkirchen III, TuS Traunreut, TSV 1860 Rosenheim, STC München Süd, SV Wacker Burghausen II, TSV Haar, TC Übersee
      { groupid: "2185754", leagueName: "Landesliga 2 · Gr. 029 SU", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Grün-Weiß Gräfelfing II, GW Luitpoldpark München III, TC Pfaffenhofen/Ilm, TF Dachau II, TC Tutzing, TC Eichenau, TC Friedberg, SV Lochhausen
      { groupid: "2165670", leagueName: "Landesliga 1 (4er) · Gr. 109 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 6, gegner: true }, // TC Blutenburg München, TC Schrobenhausen, TC Eichenau, SpVgg Erdweg, Skiclub Pfronten, TP Isartal Baierbrunn, TSV Harburg, DJK Augsburg-Pfersee
      { groupid: "2165675", leagueName: "Landesliga 1 (4er) · Gr. 110 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 6, gegner: true }, // SV Helfendorf, SpVgg Zolling, GW Luitpoldpark München, SV Lohhof, SV Heimstetten, SV Prutting, MTTC Iphitos München, TSV Rohrbach
      { groupid: "2165666", leagueName: "Landesliga 2 (4er) · Gr. 113 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 6, gegner: true }, // TC Blau-Weiß Neufahrn, TC Finsing, SV Kranzberg, TSV Eintracht Karlsfeld, SV Stadtwerke München, TSV Milbertshofen, SV Heimstetten II
      { groupid: "2165669", leagueName: "Landesliga 2 (4er) · Gr. 114 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 6, gegner: true }, // FC Kirchweidach, TC Thalkirchen München, TC Grünwald, STC München Süd, TC Schwalbe Ottobrunn, ESV Mü Pasing
      { groupid: "2165676", leagueName: "Bayernliga (4er) · Gr. 115 SU", teamLabel: "Damen 65", mode: "damen", teamSize: 6, gegner: true }, // TSV Forstenried München, TSV Schäftlarn, TeG Kirchheim, TC Eichenau, TC Scheyern, TC Rot-Weiß Eschenried, TC Kaufbeuren
      { groupid: "2165672", leagueName: "Landesliga 1 (4er) · Gr. 116 SU", teamLabel: "Damen 65", mode: "damen", teamSize: 6, gegner: true }, // FC Forstern, TC Steinhöring, TSV Siegsdorf II, SV DJK Taufkirchen, TC Blutenburg München, DJK Augsburg-Pfersee
      { groupid: "2165668", leagueName: "Landesliga 2 (4er) · Gr. 117 SU", teamLabel: "Damen 65", mode: "damen", teamSize: 6, gegner: true }, // SV Lochhausen, TSV Schwabmünchen, SV Lohhof, ESV Mü Pasing, 1. SC Gröbenzell, TC Augsburg Siebentisch, TC Blutenburg München II
      { groupid: "2165665", leagueName: "Landesliga 2 (4er) · Gr. 118 SU", teamLabel: "Damen 65", mode: "damen", teamSize: 6, gegner: true }, // SV Prutting, TC Riemerling, SV DJK Heufeld, TC St.Emmeram München, TC Grünwald, TSV Schäftlarn II, SVN München
      { groupid: "2165678", leagueName: "Landesliga 1 (2er) · Gr. 120 SU", teamLabel: "Damen 70", mode: "damen", teamSize: 9, gegner: true }, // TC Kaufbeuren, TC Rot-Weiß Eschenried, TC Friedberg, SV Lohhof, TC Herrsching
      { groupid: "2165590", leagueName: "Bayernliga · Gr. 030 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TC Sport Scheck, TTC Bad Wörishofen, 1. SC Gröbenzell, HC Wacker München, TV Feldkirchen, SC Eching, TC Augsburg Siebentisch, TC Blau-Weiß Fürstenzell
      { groupid: "2165595", leagueName: "Landesliga 1 · Gr. 031 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TC Schießgraben Augsburg, TC Geretsried, TC Kempten, TC Friedberg, HC Wacker München II, TC Reisensburg, TSV Moosach München
      { groupid: "2165585", leagueName: "Landesliga 2 · Gr. 034 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TC Eichenau, TSV Milbertshofen, TC Weilheim, SC Freimann, TC Mittenwald, MTTC Iphitos München II, TSV Gilching, TC Seefeld
      { groupid: "2165589", leagueName: "Landesliga 2 · Gr. 035 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TV Kraiburg, STK Garching II, TV Geisenfeld, SV Hebertsfelden, TC Pfaffenhofen/Ilm, TC Rot-Weiß Freising, TC Grün-Weiß Dingolfing, TC Frauenau
      { groupid: "2165606", leagueName: "Landesliga 1 · Gr. 045 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // FC Seeshaupt, TC Weiler, TC Gauting, TC Peiting, TSV Leitershofen, TC Scheyern, 1. SC Gröbenzell, TCE Gröbenzell
      { groupid: "2165604", leagueName: "Landesliga 2 · Gr. 048 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // Münchner Sportclub, TSV Eintracht Karlsfeld, TV Altötting, TC Dorfen, FC Ergolding, TC Unterföhring, TC Vilshofen, TC Ismaning
      { groupid: "2165610", leagueName: "Bayernliga (5er) · Gr. 051 SU", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // TC Kempten, TC Lamer Winkel, Ausstellungspark München, TSV Haunstetten, MTTC Iphitos München, TeG Mühldorf, TC Gernlinden, TV Altomünster
      { groupid: "2165614", leagueName: "Landesliga 1 (5er) · Gr. 052 SU", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // TC Grün-Weiß Gräfelfing II, SSV Höchstädt, TC Blau-Weiß Gräfelfing, TF Dachau, ASV Dachau, TC Seefeld, TC Kaufbeuren-Kronenberg, TSV Wolnzach
      { groupid: "2165609", leagueName: "Landesliga 1 (5er) · Gr. 053 SU", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // TC Rot-Weiß Bad Tölz, MTV 1879 München, TC Topspin, TC Rot-Weiß Landshut, Post -Telekom-SV Rosenheim, TC Bad Griesbach, SC Baldham-Vaterstetten, TV Kraiburg
      { groupid: "2165607", leagueName: "Landesliga 2 (5er) · Gr. 055 SU", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // TC Friedberg II, TSV Harburg, TC Gauting, STC München Süd, TeG Blumenau-Großhadern
      { groupid: "2165616", leagueName: "Landesliga 2 (5er) · Gr. 056 SU", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // TC Moosburg, TC Ismaning, TC Unterföhring, Weißblau Allianz München, TC Grün-Rot Mainburg, TSV Eintracht Karlsfeld
      { groupid: "2165611", leagueName: "Landesliga 2 (5er) · Gr. 057 SU", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // Polizei SV Haar, SV Leobendorf, TC Inzell, TC Achental Grassau, ETC Siegertsbrunn, TV Schönrain
      { groupid: "2165623", leagueName: "Landesliga 2 SB · Gr. 062 SU", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // MTV 1879 München, TC Herrsching, TeG Blumenau-Großhadern, TF Fürstenfeldbruck, TC Mammendorf, TC Weilheim II, SVO Germaringen, TTC Füssen
      { groupid: "2165619", leagueName: "Landesliga 2 SB · Gr. 064 SU", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // TC Grün-Gold München, SG Hausham, SVN München II, TSV Neubeuern, STC München Süd, SV Prutting, TSV Neubiberg-Ottobrunn, TSV Teisendorf
      { groupid: "2165613", leagueName: "Bayernliga · Gr. 058 SU", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // TC Blutenburg München, SVN München, TC Grün-Weiß Gräfelfing, TC Rot-Weiß Freising, TSV Kottern, TC Geretsried, TC Passau-Neustift, TV Stockdorf
      { groupid: "2165620", leagueName: "Bayernliga (4er) · Gr. 065 SU", teamLabel: "Herren 65", mode: "herren", teamSize: 6, gegner: true }, // DJK Götting, TSV 1880 Starnberg, TSV Haunstetten, TSV Kottern, TC Bad Reichenhall, TC Rot-Weiß Passau, TV Justiz Landsberg, TC Augsburg Siebentisch
      { groupid: "2165625", leagueName: "Landesliga 1 (4er) · Gr. 066 SU", teamLabel: "Herren 65", mode: "herren", teamSize: 6, gegner: true }, // TC Rot-Weiß Gersthofen, TC Sonthofen, TC Grün-Weiß Gräfelfing, TC Donauwörth, TF Dachau, FC Heimertingen, TC Augsburg Siebentisch II, TSV Eintracht Karlsfeld
      { groupid: "2165626", leagueName: "Landesliga 2 (4er) · Gr. 068 SU", teamLabel: "Herren 65", mode: "herren", teamSize: 6, gegner: true }, // TC Rot-Weiß Krumbach, SpVgg Au/Iller, TC Blutenburg München, TC Mammendorf, TSV Sielenbach, TC Schongau, TCE Gröbenzell, TC Peiting
      { groupid: "2165630", leagueName: "Landesliga 1 (4er) · Gr. 074 SU", teamLabel: "Herren 70", mode: "herren", teamSize: 6, gegner: true }, // TC Bad Reichenhall, TC Grün-Weiß Vilsbiburg, SpVgg Zolling, TC Rot-Weiß Bad Tölz, GW Luitpoldpark München II, TC Weiss-Blau Landshut, TC Schwalbe Ottobrunn, TSV Haar
      { groupid: "2165634", leagueName: "Landesliga 2 (4er) · Gr. 076 SU", teamLabel: "Herren 70", mode: "herren", teamSize: 6, gegner: true }, // SV Eggmühl, FC Ergolding, TC Moosburg, TSV Offenstetten, TeG Mühldorf, TC Rotwald Zwiesel, SC Buch am Erlbach, STK Garching
      { groupid: "2165637", leagueName: "Landesliga 2 (4er) · Gr. 077 SU", teamLabel: "Herren 70", mode: "herren", teamSize: 6, gegner: true }, // STC München Süd, TC Blau-Weiß Gräfelfing, TV Schönrain, SV Lochhausen, TC St.Emmeram München, TC Kreuzlinger Forst, TC Unterföhring, TC Karlsfeld am See
      { groupid: "2165633", leagueName: "Bayernliga (4er) · Gr. 079 SU", teamLabel: "Herren 75", mode: "herren", teamSize: 6, gegner: true }, // DJK Götting, TSV Haunstetten, TSV Pentenried, TSV Haar, TSV Milbertshofen, TF Fürstenfeldbruck, Polizei SV Haar, MTTC Iphitos München
      { groupid: "2165635", leagueName: "Landesliga 1 (4er) · Gr. 080 SU", teamLabel: "Herren 75", mode: "herren", teamSize: 6, gegner: true }, // TC Grünwald, TC Pfaffenhofen/Ilm, STC München Süd, MTV 1879 München, TC Blau-Weiß Gräfelfing, TC Aichach, TV Justiz Landsberg, MTV Berg
      { groupid: "2165636", leagueName: "Landesliga 1 (4er) · Gr. 081 SU", teamLabel: "Herren 75", mode: "herren", teamSize: 6, gegner: true }, // TC Rottach-Egern, TC St.Emmeram München, TeG Alzstadt, TSV Unterhaching, FC Ergolding, TSV 1860 Rosenheim, TC Moosburg, TC Oberding
      { groupid: "2165638", leagueName: "Landesliga 2 (4er) · Gr. 082 SU", teamLabel: "Herren 75", mode: "herren", teamSize: 6, gegner: true }, // TSV Offenstetten, TC Mertingen, TC Gernlinden, STK Garching, Post SV Landshut, SV Haimhausen
      { groupid: "2165641", leagueName: "Bayernliga (2er) · Gr. 084 SU", teamLabel: "Herren 80", mode: "herren", teamSize: 9, gegner: true }, // TC Weilheim, MTTC Iphitos München, TC St.Emmeram München, TC Schießgraben Augsburg, TSV Haar, TF Dachau, TC Aschheim, TC Blau-Weiß Gräfelfing
      { groupid: "2165650", leagueName: "Landesliga 1 (2er) · Gr. 086 SU", teamLabel: "Herren 80", mode: "herren", teamSize: 9, gegner: true }, // TC Bad Reichenhall, Polizei SV Haar, TSV 1860 Rosenheim, TC Zorneding, TF Kirchheim-Heimstetten
      { groupid: "2165653", leagueName: "Bayernliga · Gr. 087 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 9, gegner: true }, // TV Altötting, TC Schießgraben Augsburg, SC Riessersee Garmisch-Partk., HC Wacker München, SpVgg Neuching, TSV Moosach München, TC Gauting, TC Sport Scheck
      { groupid: "2165642", leagueName: "Landesliga 2 · Gr. 091 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 9, gegner: true }, // SC Eching, TC Regen, VfB Hallbergmoos, SpVgg Altenerding, SpVgg Zolling, TC Schierling, SC Mainburg, SV Lohhof
      { groupid: "2165643", leagueName: "Landesliga 2 · Gr. 092 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 9, gegner: true }, // SV Heimstetten, TeG Mühldorf, TSV Tann, WB Fideliopark München, SV Wacker Burghausen, SC Freimann, TC Unterföhring
      { groupid: "2165646", leagueName: "Landesliga 2 · Gr. 093 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 9, gegner: true }, // STC München Süd, ETC Siegertsbrunn, ESV Rosenheim, TC Thalkirchen München, TC Ramersdorf, TC Grünwald, HC Wacker München II, TC Grün-Gold München II
      { groupid: "2165651", leagueName: "Bayernliga · Gr. 094 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TC Zwiesel, TC Malgersdorf, SV Schloßberg-Stephansk., TC Seefeld, TSV Unterhaching, MTTC Iphitos München, TC Weyarn, HC Wacker München
      { groupid: "2165644", leagueName: "Landesliga 1 · Gr. 095 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TC Unterföhring, ASV Glonn, TC Schrobenhausen, TC Pfaffenhofen/Ilm, Polizei SV Haar, TC Raschke Taufkirchen, TSV Feldkirchen, TC Topspin
      { groupid: "2165656", leagueName: "Landesliga 1 · Gr. 096 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TSV Schondorf, MTV 1879 München, TeG Lech-Schmuttertal, TC Grün-Weiß Gräfelfing, STC München Süd, TC Eichenau, ASV Dachau, TeG Allgäuer Tor
      { groupid: "2229454", leagueName: "Landesliga 2 · Gr. 098 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TSV Allershausen, DJK Altdorf, TC Gottfrieding, TC Erding, GW Luitpoldpark München II, TC Neukeferloh, TC St.Emmeram München, TeG Mühldorf
      { groupid: "2165659", leagueName: "Landesliga 2 · Gr. 099 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TC Tutzing, TC Gernlinden, TC Olching, DJK Würmtal München, TC Blutenburg München, TeG Blumenau-Großhadern, TCE Gröbenzell, TV Stockdorf
      { groupid: "2165655", leagueName: "Landesliga 2 · Gr. 100 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // SV Bruckmühl, TC Ramersdorf, TSV Neubiberg-Ottobrunn, TSV Forstenried München, TC Piding, TSV Grabenstätt, TV Dürnbach, SV Arget
      { groupid: "2165663", leagueName: "Landesliga 2 (4er) · Gr. 105 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TF Markt Schwaben, Weißblau Allianz München, Münchner Sportclub, GW Luitpoldpark München II, TC Dorfen, FC Langengeisling, TC Rot-Weiß Landshut, TC Rot-Weiß Freising
      { groupid: "2165673", leagueName: "Landesliga 2 (4er) · Gr. 107 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Bad Reichenhall, TC Holzkirchen, TC Schnaitsee, TSV Siegsdorf, TC Großhesselohe, TC Thalkirchen München, STC München Süd, TC Bad Aibling
      { groupid: "2215950", leagueName: "Südliga 4 · Gr. 068", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // SV Haspelmoor, TSV Königsbrunn, TC Mammendorf, TSV Oberottmarshausen, TC Großaitingen II, TSV Haunstetten III, TSV Klosterlechfeld, TSV Schwabmünchen II
      { groupid: "2215962", leagueName: "Südliga 4 · Gr. 084", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Aying, ASV Au, TC Holzkirchen, SV Bruckmühl, SV Helfendorf, SV DJK Heufeld II, TC Höhenkirchen II
      { groupid: "2215968", leagueName: "Südliga 4 · Gr. 088", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC St.Emmeram München, TC Cosima München II, SV Lohhof, TF Dachau III, Münchner Sportclub V, TC Ismaning III, TC Dachau 1950 III, SC Eching III
      { groupid: "2215969", leagueName: "Südliga 4 · Gr. 089", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Sportpark Deisenhofen II, TC Ottobrunn, TC Schwalbe Ottobrunn, TP Isartal Baierbrunn, TC Raschke Taufkirchen III, TC Straßlach, SV DJK Taufkirchen III
      { groupid: "2215971", leagueName: "Südliga 4 · Gr. 090", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // SVN München, TC Grün-Gold München II, MTV 1879 München II, TC Neukeferloh, Ausstellungspark München III, TC Ramersdorf II, TC Neuperlach-Kail München, TC Vaterstetten
      { groupid: "2215986", leagueName: "Südliga 5 (4er) · Gr. 105", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Ismaning IV, DJK Fasangarten München, ETC Siegertsbrunn II, TC Philathlos München, STC München Süd III, SV Stadtwerke München, TSV Neubiberg-Ottobrunn III
      { groupid: "2215993", leagueName: "Südliga 6 (4er) · Gr. 114", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TSV Deuringen II, FSV Inningen II, TC Schießgraben Augsburg VII, TSV Haunstetten IV, TC Augsburg Siebentisch VI, TC Kissing II, TSG Stadtbergen II
      { groupid: "2216019", leagueName: "Südliga 6 (4er) · Gr. 138", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Grün-Weiß Gräfelfing III, TA-SV Gelting, TC Thalkirchen München II, TC Egling, SV Lochhausen III, TC Berg, DJK Waldram II, 1. SC Gröbenzell II
      { groupid: "2216017", leagueName: "Südliga 6 (4er) · Gr. 139", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Serve & Sip Neubiberg, TC Seeschneid, TSV Hofolding, ATSV Kirchseeon, TSV Oberpframmern, TC Riemerling II, TC Neukeferloh II, TC Putzbrunn
      { groupid: "2216013", leagueName: "Südliga 6 (4er) · Gr. 140", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // FC Forstern II, TF Markt Schwaben III, DJK Fasangarten München II, TeG Kirchheim II, TC Finsing II, WB Fideliopark München III, Team München II
      { groupid: "2215886", leagueName: "Südliga 1 · Gr. 002", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Augsburg Siebentisch IV, TC Mering, FC Gundelfingen, TSV Haunstetten, TC Schießgraben Augsburg IV, DJK Augsburg-Lechhausen, TSV Zusmarshausen, SpVgg Riedlingen
      { groupid: "2215891", leagueName: "Südliga 1 · Gr. 003", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Puchheim, TC Eichenau II, TC Utting, SV Lochhausen, TV Stockdorf, SV Unterzeitlbach, TC Motzenhofen
      { groupid: "2215888", leagueName: "Südliga 1 · Gr. 006", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TV Dürnbach, STC München Süd, TC Großhesselohe III, HC Wacker München II, TC Penzberg, ESV Spfrd.Neuaubing, SG Hausham, TeG Blumenau-Großhadern
      { groupid: "2215885", leagueName: "Südliga 1 · Gr. 007", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Aschheim II, TSV Moosach München, SV Wacker Burghausen II, TC Unterföhring, Münchner Sportclub II, ESV München Sportpark, SC Freimann, TS Jahn München
      { groupid: "2215893", leagueName: "Südliga 2 · Gr. 019", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Raschke Taufkirchen II, TC Sportpark Deisenhofen, TC Neuhaus, TSV Otterfing, TC Mittenwald, TC Rot-Weiß Bad Tölz, TSV 1860 Rosenheim IV, TV Dürnbach II
      { groupid: "2215901", leagueName: "Südliga 2 · Gr. 021", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Thalkirchen München, TC Grün-Weiß Gräfelfing II, DJK Würmtal München, TC Harlaching München, TC Blau-Weiß Gräfelfing, TSV Forstenried München, TC Großhesselohe IV, Ausstellungspark München
      { groupid: "2215900", leagueName: "Südliga 2 · Gr. 022", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // Münchner Sportclub III, STK Garching II, TC Sport Scheck, TSV Moosach München II, TCE Gröbenzell, 1. SC Gröbenzell, SC Freimann II, GW Luitpoldpark München IV
      { groupid: "2215915", leagueName: "Südliga 3 · Gr. 035", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Mering II, TSV Diedorf, TSV Haunstetten II, TeG Rothtal, TC Neusäß II, TC Adelsried, TC Rot-Weiß Gersthofen III, TSV Steppach
      { groupid: "2215926", leagueName: "Südliga 3 · Gr. 047", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // ASV Glonn, TC Höhenkirchen, ETC Siegertsbrunn, TC Riemerling, TSV Neubiberg-Ottobrunn II, TC Sauerlach, SC Höhenrain, DJK Darching
      { groupid: "2215925", leagueName: "Südliga 3 · Gr. 050", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // MTV 1879 München, STC München Süd II, TC Ramersdorf, TC Harlaching München II, HC Wacker München III, TC Großhesselohe V, TeG Blumenau-Großhadern II, SV DJK Taufkirchen II
      { groupid: "2215931", leagueName: "Südliga 3 · Gr. 051", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // ESV Spfrd.Neuaubing II, TC Grün-Gold München, TC Pasing München, TC Blutenburg München II, SV Lochhausen II, Ausstellungspark München II, ESV München Sportpark II, TC Blau-Weiß Gräfelfing II
      { groupid: "2215933", leagueName: "Südliga 3 · Gr. 052", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Eichenau III, TC Schwabing, TC Puchheim II, ESV Spfrd.Neuaubing III, TF Fürstenfeldbruck II, TC Gernlinden III, PSV München, TC Olching
      { groupid: "2215930", leagueName: "Südliga 3 · Gr. 053", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // ASV Dachau, TC Rot-Weiß Eschenried III, TC Machtenstein, SV Hohenzell, TSV Bergkirchen, TSV Eintracht Karlsfeld, SpVgg Erdweg, TC Karlsfeld am See
      { groupid: "2215927", leagueName: "Südliga 3 · Gr. 054", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // Weißblau Allianz München, TC Ismaning II, MTTC Iphitos München III, TSV Milbertshofen, TC Cosima München, STK Garching III, SV Kranzberg II, SC Eching II
      { groupid: "2215938", leagueName: "Südliga 3 · Gr. 055", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // Münchner Sportclub IV, WB Fideliopark München, TSV Feldkirchen III, TS Jahn München II, TSV Haar III, SV Heimstetten, Team München, SC Freimann III
      { groupid: "2215937", leagueName: "Südliga 3 · Gr. 056", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TeG Kirchheim, WB Fideliopark München II, TC Rot-Weiß Poing, TC Topspin II, SC Baldham-Vaterstetten, TF Markt Schwaben II, SV Walpertskirchen, DJK-SV Oberndorf
      { groupid: "2216064", leagueName: "Südliga 3 · Gr. 181", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Raschke Taufkirchen IV, TC Ottobrunn, TC Zorneding, SC Höhenrain, TSV 1860 Rosenheim III, SV DJK Heufeld, TC Höhenkirchen II
      { groupid: "2216071", leagueName: "Südliga 3 · Gr. 184", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Schwaben Augsburg II, TSV Haunstetten III, TC Großaitingen, TC Mering II, TSV Schwabmünchen, TC Kissing, TSV Königsbrunn II
      { groupid: "2216063", leagueName: "Südliga 3 · Gr. 187", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Schleißheim, SVN München, TSV Milbertshofen, TC Olching, TC Harlaching München, TC St.Emmeram München, TC Dachau 1950
      { groupid: "2216087", leagueName: "Südliga 4 (4er) · Gr. 206", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // SV DJK Taufkirchen, SC Baldham-Vaterstetten, TC Bad Aibling, MTTC Iphitos München IV, TV Feldkirchen II, TC Aying
      { groupid: "2216120", leagueName: "Südliga 5 (4er) · Gr. 241", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // MTV 1879 München, TG Germerswang, 1. SC Gröbenzell, SV Petershausen, TSV Hilgertshausen, TSV Geiselbullach, TC Schleißheim II
      { groupid: "2219938", leagueName: "Südliga 5 (4er) · Gr. 242", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // PSV München, MTV 1879 München II, SV Lochhausen II, ESV Mü Pasing, TG Germerswang II, TV Stockdorf, TC Schwalbe Ottobrunn, TC Thalkirchen München II
      { groupid: "2216027", leagueName: "Südliga 1 · Gr. 144", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TeG Mühldorf, TC Rot-Weiß Freising, TC Hengersberg III, DJK Altdorf, TC Rot-Weiß Deggendorf II, SV Heimstetten, TC Grün-Weiß Dingolfing II, TuS Alztal Garching
      { groupid: "2216028", leagueName: "Südliga 1 · Gr. 147", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // ASV Dachau, SC Eching, TC Schwabing, SV Haimhausen, TV Geisenfeld, TSV Allershausen, GW Luitpoldpark München IV, SV Lohhof
      { groupid: "2227815", leagueName: "Südliga 2 · Gr. 157", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TV Dürnbach, TC Murnau, HC Wacker München II, BSC Oberhausen, TC Rot-Weiß Bad Tölz, SV Raisting, TC Penzberg, STC München Süd II
      { groupid: "2216044", leagueName: "Südliga 2 · Gr. 161", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TeG Blumenau-Großhadern, TC Pasing München, TC Thalkirchen München, TSV Eintracht Karlsfeld, TSV Moosach München II, Ausstellungspark München, Münchner Sportclub IV, ASV Dachau II
      { groupid: "2216043", leagueName: "Südliga 2 · Gr. 162", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TSV Markt Wald, SpVgg Lagerlechfeld, TC Buchloe, TSV Deuringen, TSV Haunstetten II, DJK Augsburg-Pfersee, TC Augsburg Siebentisch III, FSV Inningen
      { groupid: "2216138", leagueName: "Südliga 2 · Gr. 259", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // SC Freimann II, TC Scheyern, TC Wolfersdorf, TC Rot-Weiß Freising II, TC Moosburg, SV Petershausen, TC Neustadt
      { groupid: "2226496", leagueName: "Südliga 2 · Gr. 260", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TC Herrsching, STC München Süd II, TC Kreuzlinger Forst, TC Kochel, MTV Berg, TC Ohlstadt, BSC Oberhausen
      { groupid: "2216163", leagueName: "Südliga 3 · Gr. 278", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // FC Tandern, 1. SC Gröbenzell II, SV Dietersheim, TC Puchheim II, SC Eching II, TSV Sielenbach, SpVgg.Steinkirchen
      { groupid: "2216121", leagueName: "Südliga 1 · Gr. 246", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // SpVgg Zolling, TC Schleißheim, TC Ergoldsbach, SC Mainburg, TSV Neubiberg-Ottobrunn, TC Unterföhring, SC Freising, SpVgg Altenerding
      { groupid: "2216136", leagueName: "Südliga 1 · Gr. 249", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TC Puchheim, TC Blau-Weiß Gräfelfing, TCE Gröbenzell, MTV 1879 München, TC Fürstenfeldbruck, TSV Türkenfeld, TC Kaufering, SV Erpfting
      { groupid: "2226504", leagueName: "Südliga 2 · Gr. 312", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // STC München Süd II, TC Berg, TV Stockdorf, TC Geretsried II, ESV Spfrd.Neuaubing II, TC Großhesselohe III, TSV Schäftlarn, TC Ramersdorf II
      { groupid: "2216193", leagueName: "Südliga 2 · Gr. 314", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // Münchner Sportclub, TSV Altfraunhofen, WB Fideliopark München, TSV Milbertshofen, Weißblau Allianz München, SC Freising, SC Buch am Erlbach, STK Garching
      { groupid: "2216196", leagueName: "Südliga 2 · Gr. 316", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Thalkirchen München, TC Neuperlach-Kail München, TC Sportpark Deisenhofen, ETC Siegertsbrunn, TC Brunnthal, TC Schwalbe Ottobrunn, TC Raschke Taufkirchen, TC Höhenkirchen
      { groupid: "2216209", leagueName: "Südliga 3 · Gr. 327", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Zorneding II, TC Vaterstetten, ATSV Kirchseeon, SV Forsting-Pfaffing, TSV Soyen, TC Neukeferloh, SC Baldham-Vaterstetten II
      { groupid: "2216217", leagueName: "Südliga 3 · Gr. 331", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Oberhaching, TC Blau-Weiß Gräfelfing II, SVN München, TC Thalkirchen München II, TC Sauerlach, TC Puchheim II
      { groupid: "2216211", leagueName: "Südliga 3 · Gr. 332", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Schwabing, Ausstellungspark München, SV Lochhausen, PSV München, TS Jahn München, ASV Dachau, TC Cosima München
      { groupid: "2216220", leagueName: "Südliga 3 · Gr. 334", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Schleißheim, ASV München, TC Karlsfeld am See, TSV Geiselbullach, STK Garching II, TC Ismaning, VfB Hallbergmoos II
      { groupid: "2216221", leagueName: "Südliga 4 (4er) · Gr. 346", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // SV Walpertskirchen II, TeG Kirchheim, FC Inning Holz, TC Moosinning, SV Hörlkofen, TC Aschheim II, SC Moosen
      { groupid: "2222014", leagueName: "Südliga 4 (4er) · Gr. 350", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Sport Scheck II, SV Esting, TC Eichenau II, TC St.Emmeram München, TF Fürstenfeldbruck II, TSV Eintracht Karlsfeld, TC Olching II, TG Germerswang III
      { groupid: "2219943", leagueName: "Südliga 4 (4er) · Gr. 351", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TSV Unterhaching, TSV Forstenried München II, TC Harlaching München III, TC Grünwald, TS Jahn München II, STC München Süd III, TC Ottobrunn II
      { groupid: "2219935", leagueName: "Südliga 1 · Gr. 296", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Übersee, ASV Au, TC Bayrischzell, TC Zorneding, Polizei SV Haar, TC Bad Reichenhall, TC Ottobrunn
      { groupid: "2226495", leagueName: "Südliga 2 · Gr. 367", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // TV Stockdorf, STC München Süd II, MTV Berg, TC Geretsried, TC Rot-Weiß Bad Tölz, TC Großhesselohe II, TC Ramersdorf II
      { groupid: "2216256", leagueName: "Südliga 2 · Gr. 368", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // SV Helfendorf, TSV Unterhaching III, TC Kolbermoor, TSV Otterfing, TC Neukeferloh, TSV Irschenberg, TC Sauerlach II
      { groupid: "2216254", leagueName: "Südliga 3 · Gr. 376", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // TC Oberhaching, Ausstellungspark München, TP Isartal Baierbrunn II, MTV 1879 München II, SV Uffing, SV Bad Heilbrunn
      { groupid: "2216261", leagueName: "Südliga 3 · Gr. 377", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // TC Blau-Weiß Gräfelfing, SV Fuchstal, TC Gauting II, SF Windach, TSV Türkenfeld, TSV Schondorf
      { groupid: "2216273", leagueName: "Südliga 4 (4er) · Gr. 393", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Oberding, TC Rot-Weiß Poing II, SV Vötting, TC Ismaning II, SV Marzling, TeG Kirchheim, SC Eching
      { groupid: "2216276", leagueName: "Südliga 4 (4er) · Gr. 396", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Raschke Taufkirchen, TC Höhenkirchen, TC Aschheim II, TSV Feldkirchen II, TC Riemerling, ETC Siegertsbrunn II
      { groupid: "2216235", leagueName: "Südliga 1 · Gr. 359", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // TSV Milbertshofen, TSV Moosach München, SV Lohhof, TC Ramersdorf, TSV Haar, Münchner Sportclub II, TC Aschheim, TF Dachau
      { groupid: "2216290", leagueName: "Südliga 1 (5er) · Gr. 399", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // Polizei SV Haar II, TC Ismaning II, FC Langengeisling, ASV Glonn, TC Brunnthal, TC Zorneding
      { groupid: "2216289", leagueName: "Südliga 1 (5er) · Gr. 400", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // 1. SC Gröbenzell, GW Luitpoldpark München II, TSV Forstenried München, TC Sport Scheck, TSC WWK, TSV Moosach München
      { groupid: "2216294", leagueName: "Südliga 1 · Gr. 405", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // TCE Gröbenzell, TSV Eintracht Karlsfeld, SV Ilmmünster, STK Garching II, TF Dachau, SV Lochhausen
      { groupid: "2216284", leagueName: "Südliga 1 · Gr. 406", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // TC Tutzing, SV Planegg-Krailling, TC Seefeld, TC Ramersdorf, TC Pasing München, TC Riemerling, ESV Spfrd.Neuaubing, TSV Feldafing II
      { groupid: "2216291", leagueName: "Südliga 2 · Gr. 409", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // TC Eching, TSV Allershausen, SV Sulzemoos, TC Puchheim, TC Gernlinden II, TC Penzberg, SV Haimhausen
      { groupid: "2216281", leagueName: "Südliga 2 · Gr. 410", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // TV Kraiburg, WB Fideliopark München, TC Schwalbe Ottobrunn, TeG Kirchheim, VfL Waldkraiburg, TSV Buchbach
      { groupid: "2216308", leagueName: "Südliga 3 (4er) · Gr. 420", teamLabel: "Herren 60", mode: "herren", teamSize: 6, gegner: true }, // TC Thalkirchen München, SVN München III, TC Sauerlach, TSV Forstenried München, TC Greiling, TC Weyarn, TSV Unterhaching II, TC Höhenkirchen
      { groupid: "2216301", leagueName: "Südliga 3 (4er) · Gr. 421", teamLabel: "Herren 60", mode: "herren", teamSize: 6, gegner: true }, // TC Blau-Weiß Neufahrn, ASV Dachau, TC St.Emmeram München, VfB Hallbergmoos, SV Hörlkofen II, SC Eching II, SpVgg Altenerding
      { groupid: "2216302", leagueName: "Südliga 1 · Gr. 423", teamLabel: "Damen 30", mode: "damen", teamSize: 9, gegner: true }, // TG Germerswang, SV Lochhausen, Ausstellungspark München, HC Wacker München III, SC Pöcking-Possenhofen
      { groupid: "2216320", leagueName: "Südliga 2 (4er) · Gr. 437", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // STC München Süd II, TC Neuperlach-Kail München, TC Straßlach, TP Isartal Baierbrunn, TC Deisenhofen, TS Jahn München, DJK Fasangarten München
      { groupid: "2216310", leagueName: "Südliga 2 (4er) · Gr. 438", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // TC Philathlos München, TC Anzing, FC Forstern, VfB Forstinning, TC St.Emmeram München, TC Sport Scheck II, SV Oberbergkirchen
      { groupid: "2216312", leagueName: "Südliga 2 (4er) · Gr. 439", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // Münchner Sportclub, TC Blau-Weiß Gräfelfing, SC Eching II, ESV Spfrd.Neuaubing, Ausstellungspark München II, 1. SC Gröbenzell, TC Dachau 1950
      { groupid: "2216325", leagueName: "Südliga 2 · Gr. 446", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TC Ismaning, SC Mühlried, TSV Rohrbach, SV Kranzberg, TC Scheyern, TC Schleißheim, TSV Allershausen II
      { groupid: "2216326", leagueName: "Südliga 2 · Gr. 449", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TC Puchheim, TC Thalkirchen München, TC Harlaching München, TSV Forstenried München II, Münchner Sportclub, ESV Mü Pasing, ASV Dachau II
      { groupid: "2226500", leagueName: "Südliga 3 (4er) · Gr. 457", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // Ausstellungspark München, TC Grün-Weiß Gräfelfing II, SV Esting, TCE Gröbenzell II, TC Blutenburg München II, TC Karlsfeld am See, ESV München Sportpark II
      { groupid: "2216345", leagueName: "Südliga 4 (4er) · Gr. 461", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // SV Fuchstal, TSV Haunstetten, SV Untermeitingen, SV Erpfting, TC Penzing, TC Schongau, TSV Königsbrunn II
      { groupid: "2216346", leagueName: "Südliga 4 (4er) · Gr. 469", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TSV Marquartstein, TC Rimsting, TC Weyarn II, TC Ruhpolding, SG Hausham II, TV Feldkirchen, SV Helfendorf II
      { groupid: "2216344", leagueName: "Südliga 4 (4er) · Gr. 470", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Icking, ETC Siegertsbrunn II, TC Tutzing II, FC Seeshaupt, TC Höhenkirchen II, TSV Neubiberg-Ottobrunn II, TC Raschke Taufkirchen II
      { groupid: "2216348", leagueName: "Südliga 4 (4er) · Gr. 472", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Rot-Weiß Eschenried, TC Eichenau III, SV Lochhausen, TF Dachau, TG Germerswang, TCE Gröbenzell III, TSV Geiselbullach
      { groupid: "2216353", leagueName: "Südliga 4 (4er) · Gr. 473", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // SV Planegg-Krailling II, TC Pasing München, TC Ramersdorf II, TC Grün-Gold München, TSV Forstenried München III, MTV 1879 München II, SVN München
      { groupid: "2216359", leagueName: "Südliga 1 (4er) · Gr. 478", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // WSV Zellerreit, ETC Siegertsbrunn, ATSV Kirchseeon, TC Riemerling, Polizei SV Haar, SV Arget, TC Ramersdorf, TV Feldkirchen
      { groupid: "2216363", leagueName: "Südliga 1 (4er) · Gr. 481", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Puchheim, 1. SC Gröbenzell, TC Blau-Weiß Gräfelfing, TC Grün-Weiß Gräfelfing, TC Olching, ESV Mü Pasing, TC Kreuzlinger Forst, TV Stockdorf
      { groupid: "2219936", leagueName: "Südliga 2 (4er) · Gr. 487", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TSV Neubiberg-Ottobrunn, TSV Unterhaching III, TC Schwalbe Ottobrunn, TC Großhesselohe II, TC Ottobrunn, TC Riemerling II, TP Isartal Baierbrunn III
      { groupid: "2216365", leagueName: "Südliga 2 (4er) · Gr. 489", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Aschheim, TC Pasing München, TC Sport Scheck, STK Garching, TC Schwabing, ESV Freimann, ESV München Sportpark II
      { groupid: "2139354", leagueName: "Regionalliga Süd-Ost · Gr. 001", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // MTTC Iphitos München, ATV 1873 Frankonia Nbg, TC Weiß-Blau Würzburg, TC Amberg am Schanzl, TC Rot-Weiß Gersthofen, TC Schießgraben Augsburg, 1. FC Nürnberg, TC RC Sport
      { groupid: "2139356", leagueName: "Regionalliga Süd-Ost · Gr. 002", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Aschheim, TC im TSV Zella-Mehlis, TC Schießgraben Augsburg, TC Hengersberg, TC Weiß-Blau Würzburg, GW Luitpoldpark München II, CaM Nürnberg, TSV Altenfurt
      { groupid: "2139359", leagueName: "Regionalliga Süd-Ost · Gr. 015", teamLabel: "Damen 65", mode: "damen", teamSize: 9, gegner: true }, // TSV Siegsdorf, TSV Unterhaching, TC Geretsried, MTTC Iphitos München
      { groupid: "2139357", leagueName: "Regionalliga Süd-Ost · Gr. 003", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TC Übersee, TSV Altenfurt, LSC 1901, CTC Küchwald / Freiberg, TC Neutraubling, TeG Mühldorf, GW Luitpoldpark München, TC Hochspessart
      { groupid: "2139351", leagueName: "Regionalliga Süd-Ost · Gr. 006", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // TC Blutenburg München, TC Altenburg, TC Grün-Weiß Gräfelfing, TC Friedberg, TV Feldkirchen, TSV Altenfurt, TC Ingolstadt, GW Luitpoldpark München
      { groupid: "2145118", leagueName: "Regionalliga Süd-Ost · Gr. 007", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // STK Garching, TC Weilheim, TSV Altenfurt, TC Augsburg Siebentisch, TV Fürth 1860, TSV Altenfurt II, GW Luitpoldpark München, TV Feldkirchen
      { groupid: "2144935", leagueName: "Regionalliga Süd-Ost · Gr. 008", teamLabel: "Herren 65", mode: "herren", teamSize: 9, gegner: true }, // TC Hof, FC 74 München, 1.TC Waldheim, GW Luitpoldpark München, TSV Altenfurt
      { groupid: "2139348", leagueName: "Regionalliga Süd-Ost · Gr. 009", teamLabel: "Herren 70", mode: "herren", teamSize: 9, gegner: true }, // GW Luitpoldpark München, FC 74 München, TC Schönb. Aschaffenburg, SG Herrieden, TC Neutraubling, TC Seefeld, TF Dachau, TC Augsburg Siebentisch
      { groupid: "2139353", leagueName: "Regionalliga Süd-Ost · Gr. 010", teamLabel: "Herren 75", mode: "herren", teamSize: 9, gegner: true }, // TC Großhesselohe, TC Rot-Weiß Cham, TC Bad Reichenhall, TF Dachau, GW Luitpoldpark München, TC Hopfen am See, TC Grün-Weiß Bayreuth, TSV Feldafing
      { groupid: "2139347", leagueName: "Regionalliga Süd-Ost · Gr. 011", teamLabel: "Damen 30", mode: "damen", teamSize: 9, gegner: true }, // STK Garching, TC Rot-Weiß Eschenried, GW Luitpoldpark München, TC Vilshofen, TF Dachau, BW DD Blasewitz, TC Augsburg Siebentisch, TB Erlangen
      { groupid: "2139349", leagueName: "Regionalliga Süd-Ost · Gr. 012", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TSV Altenfurt, TC Laufen, TC Gauting, CaM Nürnberg, GW Luitpoldpark München, STK Garching, TC Kempten
      // DISCOVER:sommer-26
    ],
  },
  {
    id: "winter-2526",
    label: "Winter 2025/26",
    btvLabel: "Winter 2025/2026",
    layout: "winter",
    prefix: "WINTER",
    dataFile: "src/data/winter-2526.ts",
    matchesFile: "src/data/winter-2526.ts",
    reports: REPORTS_FILE,
    rosters: ROSTERS_FILE,
    teamSize: 6,
    // groupids am 09.09.2026 über discover-groups.mjs aus dem btv.de-Archiv geholt
    groups: [
      { groupid: "2114538", leagueName: "Bayernliga · Gr. 022 SU",   teamLabel: "Herren 40", mode: "herren", teamSize: 6 },
      { groupid: "2115145", leagueName: "Südliga 1 · Gr. 109",       teamLabel: "Herren 30", mode: "herren", teamSize: 6 },
      { groupid: "2114563", leagueName: "Landesliga 2 · Gr. 056 SU", teamLabel: "Damen 50",  mode: "damen",  teamSize: 6 },
      { groupid: "2114542", leagueName: "Bayernliga · Gr. 029 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 6 },
      { groupid: "2115131", leagueName: "Südliga 2 · Gr. 100", teamLabel: "Damen", mode: "damen", teamSize: 6 },
      { groupid: "2117525", leagueName: "Südliga 2 · Gr. 117", teamLabel: "Herren 30 II", mode: "herren", teamSize: 6 },
      { groupid: "2117516", leagueName: "Südliga 2 · Gr. 192", teamLabel: "Damen 40", mode: "damen", teamSize: 6 },
      { groupid: "2114520", leagueName: "Landesliga 1 · Gr. 010 SU", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // SV Wacker Burghausen, MTTC Iphitos München, TC Ismaning, TC Rot-Weiß Landshut, TC Großhesselohe, GW Luitpoldpark München
      { groupid: "2117537", leagueName: "Landesliga 1 · Gr. 017 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TC Übersee, TSV Haar, ETC Siegertsbrunn, TC Zorneding, TS Jahn München, TSV Milbertshofen
      { groupid: "2116776", leagueName: "Landesliga 1 · Gr. 023 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TSV Haunstetten, SSV Höchstädt, TC Puchheim, TC Eichenau, TCE Gröbenzell, SV Unterschneitbach
      { groupid: "2114540", leagueName: "Landesliga 1 · Gr. 024 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Grün-Weiß Gräfelfing, SpVgg Zolling, SpVgg Langenbruck, TC Taufkirchen, FC Ergolding, STC München Süd
      { groupid: "2116774", leagueName: "Landesliga 1 · Gr. 030 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Puchheim, TSV Haunstetten, TV Altomünster, SSV Höchstädt, TCE Gröbenzell, TF Dachau
      { groupid: "2114543", leagueName: "Landesliga 1 · Gr. 031 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // GW Luitpoldpark München, TC Passau-Neustift, FC Ergolding, STC München Süd, Ausstellungspark München, TC Harlaching München
      { groupid: "2114556", leagueName: "Landesliga 1 · Gr. 052 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Grün-Weiß Gräfelfing, TC Karlsfeld am See, TC Landsberg, SV Stadtwerke Augsburg, TCE Gröbenzell, SV Lohhof, TF Dachau
      { groupid: "2114572", leagueName: "Landesliga 1 · Gr. 053 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Höhenkirchen, TC Bad Endorf, GW Luitpoldpark München, ASV Glonn, SV Helfendorf, TC Steinhöring
      { groupid: "2114514", leagueName: "Landesliga 2 · Gr. 012 SU", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Rot-Weiß Straubing, TC Hengersberg II, TC Rot-Weiß Freising, TC Ismaning II, TC Grün-Weiß Dingolfing, VfL Waldkraiburg
      { groupid: "2114519", leagueName: "Landesliga 2 · Gr. 013 SU", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Pfaffenhofen/Ilm, HC Wacker München, SC Riessersee Garmisch-Partk., ASV Dachau, TC Rot-Weiß Eschenried II, TC Grün-Weiß Gräfelfing II
      { groupid: "2114524", leagueName: "Landesliga 2 · Gr. 014 SU", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Rot-Weiß Eschenried, TF Dachau II, TC Achental Grassau, DJK Rosenheim, TSV Haar, WB Fideliopark München
      { groupid: "2114522", leagueName: "Landesliga 2 · Gr. 019 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // SC Freimann, TV Geisenfeld, TC Schwabing, TSV Haar II, TC Ramersdorf
      { groupid: "2117615", leagueName: "Landesliga 2 · Gr. 025 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Holzgünz, TC Schießgraben Augsburg, TC Gauting II, TC Pürgen, TC Mering, TC Puchheim II
      { groupid: "2117540", leagueName: "Landesliga 2 · Gr. 034 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Gauting, MTV 1879 München, MTTC Iphitos München II, TC Grün-Weiß Gräfelfing II, TC Olching, 1. SC Gröbenzell
      { groupid: "2114562", leagueName: "Landesliga 2 · Gr. 051 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Unterföhring, TC Eichenau, 1. SC Gröbenzell, DJK Würmtal München, SV Bruckmühl, ETC Siegertsbrunn, TC St.Emmeram München
      { groupid: "2114569", leagueName: "Landesliga 2 · Gr. 057 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Raschke Taufkirchen, TSV Unterhaching, TSV Siegsdorf, TC Schnaitsee, TC Holzkirchen
      { groupid: "2115105", leagueName: "Südliga 1 · Gr. 078", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // SC Freimann, GW Luitpoldpark München II, HC Wacker München II, TC Ramersdorf, STC München Süd II, TC Thalkirchen München
      { groupid: "2117528", leagueName: "Südliga 1 · Gr. 079", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Rot-Weiß Eschenried III, SV Haimhausen, TC Ismaning III, SC Freimann II, TC Unterföhring, TC Gernlinden II
      { groupid: "2115165", leagueName: "Südliga 1 · Gr. 128", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Großhesselohe II, TC Thalkirchen München, MTTC Iphitos München II, TC Kreuzlinger Forst, TC Rot-Weiß Eschenried, FC Ampertal Unterbruck
      { groupid: "2117530", leagueName: "Südliga 1 · Gr. 156", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Großhesselohe, TC Ramersdorf, TC Ottobrunn II, TC Rot-Weiß Bad Tölz, STC München Süd II, TC Sauerlach
      { groupid: "2117589", leagueName: "Südliga 1 · Gr. 157", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Grün-Gold München, TSV Milbertshofen, SV Lochhausen, GW Luitpoldpark München II, TF Dachau II
      { groupid: "2117520", leagueName: "Südliga 1 · Gr. 198", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // ETC Siegertsbrunn, TC Raschke Taufkirchen II, SV Großkarolinenfeld, TC Riemerling, TC Geretsried, TC Ottobrunn
      { groupid: "2116295", leagueName: "Südliga 2 · Gr. 102", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TSV Moosach München, SV Lohhof, STK Garching, TC Schwabing, MTTC Iphitos München II, Sport Center Oberschleißheim, TC Ismaning IV
      { groupid: "2117515", leagueName: "Südliga 2 · Gr. 118", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TC Grünwald, TC Oberhaching, Polizei SV Haar, SVN München, STC München Süd II
      { groupid: "2117518", leagueName: "Südliga 2 · Gr. 119", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TS Jahn München II, Ausstellungspark München, TC St.Emmeram München, TC Unterföhring II, STC München Süd III, ESV München Sportpark
      { groupid: "2115164", leagueName: "Südliga 2 · Gr. 134", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // SV Hainhofen, TC Dasing, TC Friedberg, TSV Königsbrunn, TC Kissing, TSV Haunstetten II
      { groupid: "2115157", leagueName: "Südliga 2 · Gr. 146", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TeG Blumenau-Großhadern, HC Wacker München II, TC Ramersdorf, TSV Forstenried München II, TC Blau-Weiß Gräfelfing, TS Jahn München II
      { groupid: "2117587", leagueName: "Südliga 2 · Gr. 169", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Gauting II, TC Grün-Weiß Gräfelfing III, TC Gernlinden II, TSV Gilching, 1. SC Gröbenzell III, TCE Gröbenzell II
      { groupid: "2117594", leagueName: "Südliga 2 · Gr. 189", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // SV Planegg-Krailling II, TSV Forstenried München, TC Gauting II, STC München Süd II, TSV Gilching II, MTV 1879 München II
      { groupid: "2115221", leagueName: "Südliga 2 · Gr. 190", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Puchheim, STC München Süd, ESV Mü Pasing, ESV München Sportpark II, TG Germerswang, TC Eichenau III
      { groupid: "2117541", leagueName: "Südliga 2 · Gr. 193", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Neukeferloh, TF Markt Schwaben, SC Baldham-Vaterstetten, TC Zorneding, ATSV Kirchseeon
      { groupid: "2115092", leagueName: "Südliga 3 · Gr. 064", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Sportpark Deisenhofen II, TC Ottobrunn, ETC Siegertsbrunn, TC Riemerling, SV Ascholding, TC Egling, TSV Oberpframmern
      { groupid: "2114530", leagueName: "Bayernliga · Gr. 001 SU", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Rot-Weiß Freising, TC Schießgraben Augsburg, TSV Haar, GW Luitpoldpark München, TC Schießgraben Augsburg II, TC Friedberg
      { groupid: "2114526", leagueName: "Landesliga 1 · Gr. 002 SU", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Rot-Weiß Eschenried, TC Augsburg Siebentisch, TC Dachau 1950, TC Weilheim, TC Gauting, TC Eichenau
      { groupid: "2114523", leagueName: "Landesliga 1 · Gr. 003 SU", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Aschheim, TC Rot-Weiß Freising II, TC Hengersberg, DJK-TC Büchlberg, MTTC Iphitos München, TC Grün-Weiß Vilsbiburg
      { groupid: "2114516", leagueName: "Landesliga 2 · Gr. 004 SU", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Augsburg Siebentisch II, TC Grün-Weiß Gräfelfing, HC Wacker München, TC Gernlinden, ARC Herrsching, TC Pfronten
      { groupid: "2114515", leagueName: "Landesliga 2 · Gr. 005 SU", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TF Dachau, TC Schrobenhausen, Münchner Sportclub, TC Großhesselohe II, TC Ismaning, TC Rot-Weiß Eschenried II
      { groupid: "2114532", leagueName: "Landesliga 2 · Gr. 006 SU", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TSV Neubeuern, TC Übersee, TC Achental Grassau, HC Wacker München II, TC Großhesselohe, TC Raschke Taufkirchen
      { groupid: "2114531", leagueName: "Bayernliga · Gr. 008 SU", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Raschke Taufkirchen, TC Hengersberg, Münchner Sportclub, TC Schießgraben Augsburg, TC Aschheim, TC Grün-Weiß Gräfelfing
      { groupid: "2114528", leagueName: "Landesliga 1 · Gr. 009 SU", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Augsburg Siebentisch, TF Dachau, TC Puchheim, Münchner Sportclub II, TC Blutenburg München, TC Friedberg
      { groupid: "2114567", leagueName: "Landesliga 2 · Gr. 054 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Bad Bayersoien, TSV Gilching, TP Isartal Baierbrunn, TC Eichenau, TC Gernlinden, TC Puchheim
      { groupid: "2114564", leagueName: "Landesliga 1 · Gr. 058 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 6, gegner: true }, // TC Herrsching, TSV Unterhaching, TC Steinhöring, TSV Schäftlarn, SV Heimstetten, FC Forstern, STC München Süd
      { groupid: "2114575", leagueName: "Landesliga 2 · Gr. 060 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 6, gegner: true }, // MTTC Iphitos München, TC Riemerling, TC Finsing, GW Luitpoldpark München, TC Grünwald, TC Schwalbe Ottobrunn
      { groupid: "2116775", leagueName: "Landesliga 1 · Gr. 061 SU", teamLabel: "Damen 65", mode: "damen", teamSize: 6, gegner: true }, // TSV Schäftlarn, TC Eichenau, TSV Forstenried München, TC Rot-Weiß Eschenried, TC Blutenburg München
      { groupid: "2114518", leagueName: "Bayernliga · Gr. 015 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TeG Mühldorf, HC Wacker München, TC Rot-Weiß Eschenried, TC Geretsried, TC Reisensburg
      { groupid: "2117614", leagueName: "Landesliga 1 · Gr. 016 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TeG Neuburg/Donau, TTC Bad Wörishofen, HC Wacker München II, TSV Moosach München, TC Mittenwald, TC Seefeld
      { groupid: "2114533", leagueName: "Landesliga 2 · Gr. 018 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TC Eichenau, TC Kirchheim, TC Schießgraben Augsburg, TC Puchheim, FC Gundelfingen, TC Rot-Weiß Rain am Lech
      { groupid: "2114534", leagueName: "Landesliga 2 · Gr. 021 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // STC München Süd, MTV 1879 München, HC Wacker München III, TC Weilheim, TC Murnau, TC Schliersee
      { groupid: "2116772", leagueName: "Landesliga 2 · Gr. 027 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // MTV 1879 München, TC Unterföhring, Münchner Sportclub, SV Lohhof, TF Dachau, TC Blutenburg München
      { groupid: "2117539", leagueName: "Landesliga 2 · Gr. 028 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Geretsried, SV Wacker Burghausen, TC Traunstein, TC Großhesselohe, TC Harlaching München, Polizei SV Haar
      { groupid: "2114550", leagueName: "Landesliga 2 · Gr. 033 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // MTTC Iphitos München, TC Thalkirchen München, TC Unterföhring, TSV Moosach München, TC Ismaning, TC Weiss-Blau Landshut
      { groupid: "2114545", leagueName: "Landesliga 1 · Gr. 036 SU", teamLabel: "Herren 60", mode: "herren", teamSize: 6, gegner: true }, // STK Garching, MTV 1879 München, TC Augsburg Siebentisch, GW Luitpoldpark München, TC Grün-Weiß Gräfelfing, SVN München
      { groupid: "2116769", leagueName: "Landesliga 2 · Gr. 038 SU", teamLabel: "Herren 60", mode: "herren", teamSize: 6, gegner: true }, // TC Weilheim, TC Blutenburg München, TC Herrsching, STC München Süd, SVN München II, TSV Moosach München
      { groupid: "2114549", leagueName: "Landesliga 2 · Gr. 039 SU", teamLabel: "Herren 60", mode: "herren", teamSize: 6, gegner: true }, // ETC Siegertsbrunn, DJK Götting, TC Passau-Neustift, TC Anzing, TC Riemerling, SV Seeon
      { groupid: "2114551", leagueName: "Landesliga 1 · Gr. 040 SU", teamLabel: "Herren 65", mode: "herren", teamSize: 6, gegner: true }, // SVN München, SV Prutting, TC Bad Reichenhall, TF Dachau, TC Seeschneid, SV Lohhof
      { groupid: "2114553", leagueName: "Landesliga 1 · Gr. 041 SU", teamLabel: "Herren 70", mode: "herren", teamSize: 6, gegner: true }, // TC Passau-Neustift, SV Prutting, TF Dachau, GW Luitpoldpark München, TC Karlsfeld am See, TSV Pentenried, TSV Schondorf
      { groupid: "2114570", leagueName: "Landesliga 1 · Gr. 042 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // TC Schießgraben Augsburg, FC Gundelfingen, TC Gauting, TSV Moosach München
      { groupid: "2114558", leagueName: "Landesliga 1 · Gr. 043 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // GW Luitpoldpark München, HC Wacker München, TV Altötting, TC Rot-Weiß Landshut, STC München Süd
      { groupid: "2114568", leagueName: "Landesliga 2 · Gr. 044 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // TF Dachau, TC Kreuzlinger Forst, TSV Forstenried München, STC München Süd II, TG Germerswang, TP Isartal Baierbrunn
      { groupid: "2117538", leagueName: "Landesliga 2 · Gr. 045 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // SV Schloßberg-Stephansk., TC Thalkirchen München, SV Heimstetten, TC Grün-Gold München, ATSV Kirchseeon
      { groupid: "2114555", leagueName: "Landesliga 2 · Gr. 046 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // SC Eching, VfB Hallbergmoos, TC Unterföhring, SpVgg Zolling, SC Freimann
      { groupid: "2114560", leagueName: "Bayernliga · Gr. 047 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // GW Luitpoldpark München, TC Gauting, STK Garching, TC Kempten, TC Harlaching München, HC Wacker München
      { groupid: "2117536", leagueName: "Landesliga 1 · Gr. 049 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Weyarn, MTV 1879 München, ASV Glonn, TC Raschke Taufkirchen, SC Eibsee Grainau, Polizei SV Haar
      { groupid: "2115031", leagueName: "Südliga 1 · Gr. 001", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Mering, TC Kempten, TSV Haunstetten, TC Holzgünz, TC Sonthofen, SpVgg Rieden
      { groupid: "2128854", leagueName: "Südliga 1 · Gr. 003", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Rot-Weiß Landshut, TC Rot-Weiß Freising III, STK Garching II, TC Pfaffenhofen/Ilm, TeG Neuburg/Donau II, SC Mainburg
      { groupid: "2117542", leagueName: "Südliga 1 · Gr. 004", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Grün-Weiß Vilsbiburg II, TC Unterföhring, STK Garching, TeG Mühldorf, SV Hebertsfelden, TSV Haar II
      { groupid: "2115047", leagueName: "Südliga 1 · Gr. 006", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TSV 1860 Rosenheim, TC Penzberg, TSV Neubiberg-Ottobrunn, TC Raschke Taufkirchen II, TC Bad Aibling, TC Neuhaus
      { groupid: "2115045", leagueName: "Südliga 1 · Gr. 007", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // SC Freimann, TV Stockdorf, Münchner Sportclub II, TSV Moosach München, TC Harlaching München, TC Großhesselohe III
      { groupid: "2115039", leagueName: "Südliga 1 · Gr. 008", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Dachau 1950 II, TC Eichenau II, TC Lauterbach 1973, TC Gernlinden II, TC Blutenburg München, ESV München Sportpark
      { groupid: "2115038", leagueName: "Südliga 2 · Gr. 014", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Puchheim, TCE Gröbenzell, SV Lochhausen, TF Fürstenfeldbruck, TC Mering II, TC Friedberg II
      { groupid: "2117514", leagueName: "Südliga 2 · Gr. 020", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TV Dürnbach, TC Sportpark Deisenhofen, TC Geretsried, TSV 1860 Rosenheim II, Polizei SV Haar, SV Söcking
      { groupid: "2115055", leagueName: "Südliga 2 · Gr. 021", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Rot-Weiß Freising IV, TC Blau-Weiß Neufahrn, TF Markt Schwaben, TC Unterföhring III, SC Eching, TC Rot-Weiß Poing
      { groupid: "2117523", leagueName: "Südliga 2 · Gr. 022", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TS Jahn München, TSV Feldkirchen, GW Luitpoldpark München II, TC Sport Scheck, TC Unterföhring II, TSV Haar III
      { groupid: "2115054", leagueName: "Südliga 2 · Gr. 023", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Schleißheim, TC Rot-Weiß Eschenried III, TS Jahn München II, TSV Feldkirchen II, TC Cosima München, TSV Eintracht Karlsfeld
      { groupid: "2115052", leagueName: "Südliga 2 · Gr. 024", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Grün-Weiß Gräfelfing II, STC München Süd, ESV Spfrd.Neuaubing, TC Blau-Weiß Gräfelfing, TC Kreuzlinger Forst, TC Thalkirchen München
      { groupid: "2115059", leagueName: "Südliga 3 · Gr. 039", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TSV Haunstetten III, TSV Steppach, TC Schwaben Augsburg, TSG Stadtbergen, TSV Diedorf II, DJK Augsburg-Pfersee, TC Schießgraben Augsburg V
      { groupid: "2115061", leagueName: "Südliga 3 · Gr. 040", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TSV Haunstetten II, TSV Königsbrunn, TC Großaitingen II, TSV Fischach II, SSV Bobingen, SV Bergheim II
      { groupid: "2115081", leagueName: "Südliga 3 · Gr. 056", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TV Dürnbach II, SV Ostermünchen, ASV Au, TC Bad Aibling II, SV Helfendorf, TC Weyarn
      { groupid: "2115090", leagueName: "Südliga 3 · Gr. 061", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Rot-Weiß Freising V, TC Ismaning II, SV Lohhof, TC Blau-Weiß Neufahrn II, SV Haimhausen, Sport Center Oberschleißheim
      { groupid: "2115091", leagueName: "Südliga 3 · Gr. 062", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // FC Forstern, STK Garching III, TC Isen, TC Finsing, TF Markt Schwaben II, TC Ismaning III
      { groupid: "2115101", leagueName: "Südliga 3 · Gr. 063", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Vaterstetten, TeG Kirchheim, TC Neukeferloh, TC Neuperlach-Kail München, WB Fideliopark München III, FC Forstern II
      { groupid: "2115103", leagueName: "Südliga 3 · Gr. 066", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // ASV Dachau, TC Gernlinden III, TC Puchheim II, TC Karlsfeld am See, TC Dachau 1950 III, TCE Gröbenzell II
      { groupid: "2116767", leagueName: "Südliga 3 · Gr. 067", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Puchheim III, TC Blau-Weiß Gräfelfing II, TC Kreuzlinger Forst II, TC Gernlinden IV, ESV Spfrd.Neuaubing II, 1. SC Gröbenzell
      { groupid: "2115094", leagueName: "Südliga 3 · Gr. 069", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TeG Blumenau-Großhadern, STC München Süd II, Ausstellungspark München, TSV Forstenried München, MTV 1879 München II, ESV München Sportpark II, ESV Mü Pasing
      { groupid: "2115106", leagueName: "Südliga 3 · Gr. 070", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // MTV 1879 München, TC Grün-Gold München, WB Fideliopark München II, HC Wacker München III, Ausstellungspark München II, TC Ramersdorf, STC München Süd III
      { groupid: "2117519", leagueName: "Südliga 3 · Gr. 071", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Aschheim II, Weißblau Allianz München, WB Fideliopark München, SC Freimann II, TC Ramersdorf II, SV Studentenstadt Freimann, TeG Kirchheim II
      { groupid: "2117577", leagueName: "Südliga 1 · Gr. 073", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TSV Haunstetten, TC Friedberg II, TC Mammendorf, SV Stadtwerke Augsburg, SpVgg Lagerlechfeld, SV Erpfting
      { groupid: "2117584", leagueName: "Südliga 1 · Gr. 074", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Eichenau, TC Puchheim II, SV Lochhausen, TC Gernlinden, TSV Königsbrunn, TC Mering
      { groupid: "2115097", leagueName: "Südliga 1 · Gr. 077", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // STC München Süd, TC Raschke Taufkirchen II, TSV 1860 Rosenheim, TC Übersee, TC Großhesselohe II, TC Sauerlach
      { groupid: "2115127", leagueName: "Südliga 2 · Gr. 097", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // ESV Rosenheim, TC Steinhöring, TC Höhenkirchen, ETC Siegertsbrunn, TC Ottobrunn
      { groupid: "2115123", leagueName: "Südliga 2 · Gr. 098", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Raschke Taufkirchen III, SVN München, ETC Siegertsbrunn II, HC Wacker München III, MTV 1879 München II, TC Thalkirchen München II
      { groupid: "2115129", leagueName: "Südliga 2 · Gr. 099", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TeG Blumenau-Großhadern, MTV 1879 München, Ausstellungspark München, TS Jahn München, TC Harlaching München, SV Planegg-Krailling
      { groupid: "2115148", leagueName: "Südliga 2 · Gr. 104", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Eichenau II, TSV Gilching, TC Blutenburg München II, TC Blau-Weiß Gräfelfing, TC Eching, ESV Spfrd.Neuaubing
      { groupid: "2115236", leagueName: "Südliga 1 · Gr. 201", teamLabel: "Mixed 00", mode: "mixed", teamSize: 6, gegner: true }, // TC Neuhaus, TSV Haar, TC Murnau, HC Wacker München, TV Feldkirchen, FC Forstern
      { groupid: "2115231", leagueName: "Südliga 1 · Gr. 202", teamLabel: "Mixed 00", mode: "mixed", teamSize: 6, gegner: true }, // BC Adelzhausen, SV Weichs, TC Rot-Weiß Eschenried, SV Haimhausen, TC Waidhofen, TC Kreuzlinger Forst
      { groupid: "2115229", leagueName: "Südliga 2 · Gr. 210", teamLabel: "Mixed 00", mode: "mixed", teamSize: 6, gegner: true }, // TC Ramersdorf, PSV München, TC Krün, TC Olching, HC Wacker München II, TC Thalkirchen München
      { groupid: "2115206", leagueName: "Südliga 1 · Gr. 174", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // SV Lochhausen, TC Pfaffenhofen/Ilm, TSV Rohrbach, TSG Stadtbergen, TC Rot-Weiß Eschenried, TC Großaitingen
      { groupid: "2115201", leagueName: "Südliga 1 · Gr. 175", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // TV Dürnbach, ETC Siegertsbrunn, TC Murnau, TC Kreuzlinger Forst II, SC Pöcking-Possenhofen, HC Wacker München II
      { groupid: "2115200", leagueName: "Südliga 1 · Gr. 176", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // WB Fideliopark München, Weißblau Allianz München, SV Lohhof, TC Sport Scheck, FC Ergolding, DJK Altdorf
      { groupid: "2115203", leagueName: "Südliga 1 · Gr. 177", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TSV Gilching, TC Grün-Weiß Gräfelfing, TSV Oberbeuren, TeG Blumenau-Großhadern, TCE Gröbenzell, TSV Pentenried
      { groupid: "2115205", leagueName: "Südliga 1 · Gr. 179", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TV Dürnbach, SV Arget, TC Sportpark Deisenhofen, TC Riemerling, SV DJK Heufeld, TC Grünwald
      { groupid: "2115204", leagueName: "Südliga 1 · Gr. 180", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Ramersdorf, SV Planegg-Krailling, ESV München Sportpark, TC Blutenburg München, TC Karlsfeld am See
      { groupid: "2115213", leagueName: "Südliga 2 · Gr. 188", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Ottobrunn, MBB Ottobrunn, TC Raschke Taufkirchen II, TC Höhenkirchen, TC Großhesselohe, ETC Siegertsbrunn II
      { groupid: "2115220", leagueName: "Südliga 2 · Gr. 191", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // GW Luitpoldpark München II, WB Fideliopark München, TC Sport Scheck, MTTC Iphitos München, TC Eichenau II, SV Lochhausen
      { groupid: "2115230", leagueName: "Südliga 1 · Gr. 196", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // GW Luitpoldpark München II, ASV Dachau, TC Harlaching München, SV Petershausen
      { groupid: "2115226", leagueName: "Südliga 1 · Gr. 197", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Ismaning, TF Markt Schwaben, TC Steinhöring II, TC Blau-Weiß Neufahrn, TeG Kirchheim
      { groupid: "2117595", leagueName: "Südliga 1 · Gr. 199", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Grün-Weiß Gräfelfing II, TC Inning, TC Forstenrieder Park, ESV Mü Pasing, TC Seefeld
      { groupid: "2115139", leagueName: "Südliga 2 · Gr. 115", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // SV Helfendorf, TC Schliersee II, SV Bruckmühl, Post -Telekom-SV Rosenheim
      { groupid: "2117580", leagueName: "Südliga 2 · Gr. 120", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TF Fürstenfeldbruck, TC Eichenau II, 1. SC Gröbenzell, TC Puchheim II, TC Kreuzlinger Forst, SV Kottgeisering
      { groupid: "2115162", leagueName: "Südliga 1 · Gr. 127", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // STC München Süd II, TC Ottobrunn, TC Tutzing, TC Großhesselohe III, TC Berg, TSV Unterhaching
      { groupid: "2117522", leagueName: "Südliga 1 · Gr. 129", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // SC Baldham-Vaterstetten, TC Aschheim, TF Markt Schwaben, TSV Haar, SV Walpertskirchen, TSV Feldkirchen
      { groupid: "2115155", leagueName: "Südliga 2 · Gr. 145", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TSV Forstenried München, TC Sportpark Deisenhofen, TC Raschke Taufkirchen, TC Schwalbe Ottobrunn, STC München Süd III
      { groupid: "2117517", leagueName: "Südliga 2 · Gr. 147", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TSV Haar II, WB Fideliopark München, SV Heimstetten, TC Zorneding II, TC Vaterstetten, ATSV Kirchseeon
      { groupid: "2115168", leagueName: "Südliga 2 · Gr. 148", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // Weißblau Allianz München, Münchner Sportclub II, WB Fideliopark München II, STK Garching, TC Schwabing, TS Jahn München
      { groupid: "2117401", leagueName: "Südliga 2 · Gr. 150", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // ESV München Sportpark, VfB Hallbergmoos, TC Karlsfeld am See, PSV München, STK Garching II, ASV Dachau
      { groupid: "2115199", leagueName: "Südliga 2 · Gr. 151", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // SV Lohhof II, SpVgg Röhrmoos, TC Schleißheim, VfB Hallbergmoos II, SV Petershausen, TC Ismaning
      { groupid: "2115186", leagueName: "Südliga 1 · Gr. 154", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Scheyern, TSV Rottenburg, SV Lohhof, TC Ismaning II, TSV Altfraunhofen
      { groupid: "2117527", leagueName: "Südliga 1 · Gr. 155", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TV Altötting, TeG Mühldorf, Polizei SV Haar, TC Topspin, TC Seeschneid
      { groupid: "2115188", leagueName: "Südliga 2 · Gr. 162", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Au, TC Ismaning III, SpVgg Röhrmoos, TSV Eintracht Karlsfeld, TC Marzling, TC Schleißheim
      { groupid: "2117526", leagueName: "Südliga 2 · Gr. 163", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Taufkirchen, TSV Feldkirchen, TeG Mühldorf II, TC Neukeferloh, TC Aschheim, TC Finsing
      { groupid: "2115180", leagueName: "Südliga 2 · Gr. 164", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // SV Helfendorf, TC Sauerlach II, TC Holzkirchen, TSV Oberpframmern, TC Rimsting
      { groupid: "2115191", leagueName: "Südliga 2 · Gr. 165", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TSV Unterhaching II, ETC Siegertsbrunn II, TC Raschke Taufkirchen, TC Schwabing, TC Höhenkirchen, TC Brunnthal
      { groupid: "2115182", leagueName: "Südliga 2 · Gr. 166", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Thalkirchen München II, STC München Süd III, TSV Unterhaching III, TC Ramersdorf II, TSV Forstenried München, MTV 1879 München II
      { groupid: "2115179", leagueName: "Südliga 2 · Gr. 168", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Unterföhring II, SV Planegg-Krailling, TSV Moosach München II, WB Fideliopark München, TS Jahn München, Weißblau Allianz München
      { groupid: "2115198", leagueName: "Südliga 1 · Gr. 171", teamLabel: "Herren 60", mode: "herren", teamSize: 6, gegner: true }, // SV Hainhofen, TC Dasing, TC Puchheim, TC Neusäß II
      { groupid: "2117156", leagueName: "Südliga 1 · Gr. 172", teamLabel: "Herren 60", mode: "herren", teamSize: 6, gegner: true }, // TSV Rottenburg, TeG Mühldorf, TC Au, STK Garching II, TC Marzling
      { groupid: "2115202", leagueName: "Südliga 1 · Gr. 173", teamLabel: "Herren 60", mode: "herren", teamSize: 6, gegner: true }, // SV Planegg-Krailling, TeG Blumenau-Großhadern, TSV Unterhaching, TeG Kirchheim, TC Gauting, TC Höhenkirchen
      // DISCOVER:winter-2526
    ],
  },
  // ── Nur Historie (Spielberichte + Meldelisten für Spielerhistorie und Suche) ──
  {
    id: "sommer-25",
    label: "Sommer 2025",
    btvLabel: "Sommer 2025",
    layout: "summer",
    prefix: null,
    historyOnly: true,
    dataFile: null,
    matchesFile: null,
    reports: REPORTS_FILE,
    rosters: ROSTERS_FILE,
    teamSize: 9,
    groups: [
      { groupid: "2049303", leagueName: "Landesliga 2 · Gr. 042 SU", teamLabel: "Herren 40 II", mode: "herren", teamSize: 9 },
      { groupid: "2049373", leagueName: "Landesliga 2 (4er) · Gr. 106 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6 },
      { groupid: "2103442", leagueName: "Spielebene A · Gr. 087", teamLabel: "Mixed 40", mode: "mixed", teamSize: 6 },
      { groupid: "2078437", leagueName: "Südliga 3 · Gr. 049", teamLabel: "Herren", mode: "herren", teamSize: 9 },
      { groupid: "2078669", leagueName: "Südliga 3 · Gr. 274", teamLabel: "Herren 30", mode: "herren", teamSize: 9 },
      { groupid: "2078593", leagueName: "Südliga 4 (4er) · Gr. 203", teamLabel: "Damen", mode: "damen", teamSize: 6 },
      { groupid: "2008978", leagueName: "Regionalliga Süd-Ost · Gr. 004", teamLabel: "Herren 40", mode: "herren", teamSize: 9 },
      { groupid: "2078701", leagueName: "Südliga 2 · Gr. 309", teamLabel: "Herren 40 III", mode: "herren", teamSize: 9 },
      { groupid: "2008975", leagueName: "Regionalliga Süd-Ost · Gr. 005", teamLabel: "Herren 50", mode: "herren", teamSize: 9 },
      { groupid: "2078739", leagueName: "Südliga 1 · Gr. 353", teamLabel: "Herren 50 II", mode: "herren", teamSize: 9 },
      { groupid: "2078790", leagueName: "Südliga 1 · Gr. 400", teamLabel: "Herren 60", mode: "herren", teamSize: 9 },
      { groupid: "2078830", leagueName: "Südliga 1 · Gr. 434", teamLabel: "Damen 40", mode: "damen", teamSize: 9 },
      { groupid: "2078865", leagueName: "Südliga 2 (4er) · Gr. 478", teamLabel: "Damen 50 II", mode: "damen", teamSize: 6 },
      { groupid: "2050814", leagueName: "Bayernliga · Gr. 036 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TSV Kottern, TC Gauting, TV Altötting, TC Pfarrkirchen, FC Ergolding, TC Rot-Weiß Eschenried, TC Thyrnau-Kellberg, ESV Spfrd.Neuaubing
      { groupid: "2049284", leagueName: "Landesliga 1 · Gr. 024 SU", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // SV Wacker Burghausen, TC Ismaning, MTTC Iphitos München II, TC Aschheim II, STK Garching, TC Grün-Weiß Dingolfing, TC Glückauf Kropfmühl, TC Pfaffenhofen/Ilm
      { groupid: "2049302", leagueName: "Landesliga 1 · Gr. 037 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // HC Wacker München, TC Kempten, TC Harlaching München, TC Blau-Weiß Gräfelfing, TC Sonthofen, TC Großhesselohe, DJK SV Ost Memmingen, TC Puchheim
      { groupid: "2049299", leagueName: "Landesliga 1 · Gr. 038 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Vilshofen, TSV Feldkirchen, SpVgg Langenbruck, MTTC Iphitos München II, TC Sport Scheck, SV Weichering, TC Bad Aibling, TC Rot-Weiß Landshut
      { groupid: "2049306", leagueName: "Landesliga 1 · Gr. 044 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // GW Luitpoldpark München, TC TP Herrsching, TSV Leitershofen, TC Weiler, SC Landesbank München, FC Seeshaupt, 1. SC Gröbenzell, TC Schwangau
      { groupid: "2049308", leagueName: "Landesliga 1 · Gr. 045 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // SV Schloßberg-Stephansk., TC Ottobrunn, TC Neuperlach-Kail München, TC Hengersberg, TuS Traunreut, TC Rot-Weiß Landshut, TC Dorfen, SV Pang
      { groupid: "2049361", leagueName: "Landesliga 1 (4er) · Gr. 101 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // SV Stadtwerke Augsburg, TC Gernlinden, TC Eichenau, MTV 1879 München, TC Holzkirchen, TSV Unterhaching II, TC Landsberg, TC Thalkirchen München
      { groupid: "2049356", leagueName: "Landesliga 1 (4er) · Gr. 102 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TF Dachau, TC Karlsfeld am See, TeG Kirchheim, SV Lohhof, TC Hofkirchen, TC Gernlinden II, Münchner Sportclub, TC Dorfen
      { groupid: "2049289", leagueName: "Landesliga 2 · Gr. 027 SU", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TV Feldkirchen, GW Luitpoldpark München III, TC Achental Grassau, SC Freimann, TuS Traunreut, TSV Haar, SV Seeon, DJK Rosenheim
      { groupid: "2049292", leagueName: "Landesliga 2 · Gr. 028 SU", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Rot-Weiß Eschenried, HC Wacker München, TC Raschke Taufkirchen III, TF Dachau II, TC Grün-Weiß Gräfelfing II, SV Lochhausen, TC Tutzing, ASV Dachau
      { groupid: "2049291", leagueName: "Landesliga 2 · Gr. 034 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TC Hengersberg, MTTC Iphitos München II, SC Freimann, TC Grün-Gold München, TV Kraiburg, TC Grün-Weiß Dingolfing, DJK Altdorf, TC Ramersdorf
      { groupid: "2049301", leagueName: "Landesliga 2 · Gr. 039 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Utting, TC Gauting II, TeG Blumenau-Großhadern, MTV 1879 München, TC Eichenau, TC Blutenburg München, TV Türkheim, TSV Kottern II
      { groupid: "2049309", leagueName: "Landesliga 2 · Gr. 047 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // TC Gauting, TC Peiting, TC Blutenburg München, TC Wasserburg, TC Kreuzlinger Forst, TC Pfronten, TTC Füssen, TC Murnau
      { groupid: "2049360", leagueName: "Landesliga 2 · Gr. 098 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TC Unterföhring, TC Gernlinden, TC Olching, TC Gottfrieding, SV Odelzhausen, TC Blutenburg München, DJK Altdorf, Weißblau Allianz München
      { groupid: "2008986", leagueName: "Regionalliga Süd-Ost · Gr. 013", teamLabel: "Damen 50", mode: "damen", teamSize: 9, gegner: true }, // TSV Altenfurt, TC Bad Endorf, TP Isartal Baierbrunn, TSV Marktoberdorf, TC Höhenkirchen, TC Bad Füssing, TSV Grafenrheinfeld, SV Helfendorf
      { groupid: "2078534", leagueName: "Südliga 1 · Gr. 149", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Ismaning II, WB Fideliopark München, TC Schwabing, SV Haimhausen, TSV Allershausen, SC Eching, TC Erding, FC Forstern
      { groupid: "2078549", leagueName: "Südliga 1 · Gr. 150", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // STC München Süd, TC Rot-Weiß Eschenried II, TC Großhesselohe II, TSV Moosach München, TC Ramersdorf, TC Sauerlach, TeG Blumenau-Großhadern, TC Thalkirchen München
      { groupid: "2078687", leagueName: "Südliga 1 · Gr. 296", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Unterföhring, SC Baldham-Vaterstetten, MTTC Iphitos München III, TC Ottobrunn, SV Heimstetten, SV Walpertskirchen, TC Zorneding, TC Neuperlach-Kail München
      { groupid: "2078745", leagueName: "Südliga 1 · Gr. 355", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // MTV 1879 München, TC Puchheim, SV Lochhausen, TF Fürstenfeldbruck, TSV Moosach München, SV Planegg-Krailling, TC Eichenau, 1. SC Gröbenzell II
      { groupid: "2078849", leagueName: "Südliga 1 (4er) · Gr. 468", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Rot-Weiß Freising, ASV Dachau, SV Lohhof II, TC Ismaning, SV Petershausen, SC Eching, SpVgg.Steinkirchen, TC Blau-Weiß Neufahrn
      { groupid: "2078861", leagueName: "Südliga 1 (4er) · Gr. 470", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Bad Aibling, TC Raschke Taufkirchen, Lenggrieser TC, TV Feldkirchen, ETC Siegertsbrunn, SV Arget, TC Geretsried
      { groupid: "2078558", leagueName: "Südliga 2 · Gr. 163", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Rot-Weiß Freising, STK Garching II, FC Schweitenkirchen, TC Unterföhring, TC Blau-Weiß Neufahrn, SV Hörgertshausen, TC Moosburg, TC Ismaning III
      { groupid: "2078700", leagueName: "Südliga 2 · Gr. 311", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TSV Forstenried München, TC Blutenburg München II, TSV Milbertshofen, HC Wacker München II, TC Pasing München, Weißblau Allianz München, ESV München Sportpark, TC Schwabing
      { groupid: "2078760", leagueName: "Südliga 2 · Gr. 364", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // TSV Unterhaching II, TF Dachau, TSV Eintracht Karlsfeld II, TC Grün-Weiß Gräfelfing II, TSV Bergkirchen, TC Ramersdorf II
      { groupid: "2078825", leagueName: "Südliga 2 · Gr. 440", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // ETC Siegertsbrunn, TC Riemerling, STC München Süd, TSV Forstenried München, TC Großhesselohe, TSV Neubiberg-Ottobrunn, TC Zorneding
      { groupid: "2078829", leagueName: "Südliga 2 · Gr. 441", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // 1. SC Gröbenzell, TC Puchheim, TC Aschheim, TC Unterföhring II, ESV Mü Pasing, TC Pasing München, TC Schleißheim
      { groupid: "2078575", leagueName: "Südliga 3 · Gr. 184", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // SV Ilmmünster, TSV Moosach München II, PSV München, SC Freimann II, SV Langenbach, SpVgg Erdweg, TC Dachau 1950
      { groupid: "2078696", leagueName: "Südliga 3 · Gr. 316", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TSV Haunstetten, TC Friedberg, TSV Königsbrunn II, TC Kissing, TSC 2010 Krumbach, TC Kirchheim, TC Mering
      { groupid: "2078764", leagueName: "Südliga 3 · Gr. 375", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // ESV München Sportpark, TC Blutenburg München II, TC Pasing München, Weißblau Allianz München, BSG Raiffeisen München, Münchner Sportclub II, TSV Eintracht Karlsfeld III
      { groupid: "2086418", leagueName: "Südliga 4 (4er) · Gr. 205", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Schleißheim, TC Raschke Taufkirchen IV, TC Eichenau II, TC Rot-Weiß Eschenried III, TSV Bergkirchen, TSV Schwabhausen, SV Lochhausen II
      { groupid: "2078719", leagueName: "Südliga 4 (4er) · Gr. 332", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // MBB-SG Augsburg, SSV Obermeitingen, TC Schießgraben Augsburg II, TSV Haunstetten II, TSV Bobingen II, TSV Klosterlechfeld, TC Augsburg Siebentisch II
      { groupid: "2078852", leagueName: "Südliga 4 (4er) · Gr. 458", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // SC Moosen, TSV Velden/Vils, FC Maitenbeth, VfL Waldkraiburg, TF Markt Schwaben, SV Langenbach, TeG Mühldorf II
      { groupid: "2078856", leagueName: "Südliga 4 (4er) · Gr. 461", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TeG Kirchheim, TC Rot-Weiß Poing, TC Ismaning II, TC Sport Scheck, MTTC Iphitos München II, TC Grün-Gold München, SV Haimhausen II
      { groupid: "2086422", leagueName: "Südliga 4 (4er) · Gr. 463", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // STC München Süd II, SV Hohenfurch, TC Eichenau III, TSV Gilching II, TC Herrsching, TSV Forstenried München II, TCE Gröbenzell III
      { groupid: "2078631", leagueName: "Südliga 5 (4er) · Gr. 241", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // WB Fideliopark München II, ESV Mü Pasing, TC Schwabing II, SV Studentenstadt Freimann, SV Stadtwerke München, TC Philathlos München, TeG Kirchheim II
      { groupid: "2049287", leagueName: "Bayernliga · Gr. 015 SU", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // MTTC Iphitos München, TC Aschheim, TC Friedberg, GW Luitpoldpark München, TC Hengersberg, TC Rot-Weiß Passau, SV Wacker Burghausen, STC Oberland
      { groupid: "2049283", leagueName: "Landesliga 1 · Gr. 016 SU", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // GW Luitpoldpark München II, TC Blutenburg München, TC Schießgraben Augsburg II, TC Augsburg Siebentisch II, TTC Bad Wörishofen, TC Gauting, TC Dachau 1950, TC Eichenau
      { groupid: "2049286", leagueName: "Landesliga 1 · Gr. 017 SU", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Rot-Weiß Freising, TC Blau-Weiß Fürstenzell, TC Piding, TC Rot-Weiß Landshut, TC Raschke Taufkirchen, TC Großhesselohe II, DJK-TC Büchlberg, TC Ismaning
      { groupid: "2049277", leagueName: "Landesliga 2 · Gr. 019 SU", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // Münchner Sportclub, MTTC Iphitos München II, TF Dachau, TC Rot-Weiß Eschenried, TC Pfaffenhofen/Ilm, STK Garching, DJK Altdorf, TC Erding
      { groupid: "2049285", leagueName: "Landesliga 2 · Gr. 020 SU", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TSV Haar, TC Achental Grassau, TC Übersee, TSV Feldkirchen, TC Grün-Weiß Gräfelfing, TeG Mühldorf, TC Großhesselohe III, TC Piding II
      { groupid: "2049281", leagueName: "Bayernliga · Gr. 022 SU", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Schießgraben Augsburg, TC Hengersberg, TC Grün-Weiß Gräfelfing, Münchner Sportclub, TC Rot-Weiß Gersthofen, TC Rot-Weiß Straubing, TC Raschke Taufkirchen II, TF Dachau
      { groupid: "2049279", leagueName: "Landesliga 1 · Gr. 023 SU", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Augsburg Siebentisch, TC Blutenburg München, Münchner Sportclub II, TC Großhesselohe, TC Schießgraben Augsburg II, TC Puchheim, MTTC Iphitos München III, TC Augsburg Siebentisch II
      { groupid: "2049295", leagueName: "Landesliga 2 · Gr. 026 SU", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Rot-Weiß Landshut, TC Hengersberg II, DJK-TC Büchlberg, TC Rot-Weiß Deggendorf, SV Wacker Burghausen II, SV Heimstetten, TeG Mühldorf
      { groupid: "2049374", leagueName: "Landesliga 1 · Gr. 108 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 9, gegner: true }, // TC Friedberg, TC Blutenburg München, TC Eichenau, Skiclub Pfronten, TSV Harburg, MTV Dießen, TP Starnberg 1987
      { groupid: "2049378", leagueName: "Landesliga 1 · Gr. 109 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 9, gegner: true }, // SV Pang, SpVgg Zolling, SV Heimstetten, TSV Rohrbach, GW Luitpoldpark München, MTTC Iphitos München, TSV Eintracht Karlsfeld, TC Grünwald
      { groupid: "2049370", leagueName: "Landesliga 2 · Gr. 111 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 9, gegner: true }, // SV Lohhof, SV Kranzberg, SV Stadtwerke München, ESV Mü Pasing, 1. SC Gröbenzell, TSV Milbertshofen
      { groupid: "2064398", leagueName: "Landesliga 2 · Gr. 113 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 9, gegner: true }, // SV Prutting, TC Thalkirchen München, TC Schwalbe Ottobrunn, TC Raschke Taufkirchen, STC München Süd
      { groupid: "2049379", leagueName: "Bayernliga · Gr. 114 SU", teamLabel: "Damen 65", mode: "damen", teamSize: 9, gegner: true }, // TSV Unterhaching, TSV Forstenried München, TC Geretsried, MTTC Iphitos München, TSV Schäftlarn, TC Scheyern, TC Rot-Weiß Eschenried, TC Blutenburg München
      { groupid: "2049368", leagueName: "Landesliga 1 · Gr. 116 SU", teamLabel: "Damen 65", mode: "damen", teamSize: 9, gegner: true }, // TeG Kirchheim, TC Steinhöring, FC Forstern, SV DJK Taufkirchen, TC Unterföhring
      { groupid: "2049367", leagueName: "Landesliga 2 · Gr. 117 SU", teamLabel: "Damen 65", mode: "damen", teamSize: 9, gegner: true }, // DJK Augsburg-Pfersee, SV Lochhausen, 1. SC Gröbenzell, TC Grünwald, ESV Mü Pasing, SV Uffing, TC Blutenburg München II
      { groupid: "2049376", leagueName: "Landesliga 2 · Gr. 118 SU", teamLabel: "Damen 65", mode: "damen", teamSize: 9, gegner: true }, // TSV Siegsdorf, SV Lohhof, TC St.Emmeram München, SV DJK Heufeld, SV Prutting, SVN München
      { groupid: "2049381", leagueName: "Bayernliga · Gr. 119 SU", teamLabel: "Damen 70", mode: "damen", teamSize: 9, gegner: true }, // TSV Forstenried München, TC Geretsried, TSV Unterhaching, TSV Deuringen, TSV Schäftlarn, TC Herrsching, SV Lohhof
      { groupid: "2050834", leagueName: "Bayernliga · Gr. 029 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TeG Mühldorf, HC Wacker München, TC Blau-Weiß Fürstenzell, TC Augsburg Siebentisch, TC Sport Scheck, SC Eching, TC Geretsried, TC Zorneding
      { groupid: "2049288", leagueName: "Landesliga 1 · Gr. 030 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TTC Bad Wörishofen, TC Schießgraben Augsburg, TC Friedberg, TC Reisensburg, TSV Moosach München, TSV Haunstetten, TC Mittenwald, TSV Pöttmes
      { groupid: "2049296", leagueName: "Landesliga 1 · Gr. 031 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TV Feldkirchen, DJK-TC Büchlberg, HC Wacker München II, FC Ergolding, TSV Teisendorf, TSV Haar, STK Garching II, TC Pfaffenhofen/Ilm
      { groupid: "2049298", leagueName: "Landesliga 2 · Gr. 033 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TC Grün-Rot Kelheim, TSV Milbertshofen, TV Geisenfeld, TC Donauwörth, SV Unterschneitbach, GW Luitpoldpark München II, TC Rot-Weiß Gersthofen, SV Haimhausen
      { groupid: "2049293", leagueName: "Landesliga 2 · Gr. 035 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // ETC Siegertsbrunn, TSV 1860 Rosenheim, TC Weilheim, TC Seefeld, HC Wacker München III, TC Traunstein, STC München Süd, TSV Neubiberg-Ottobrunn
      { groupid: "2049304", leagueName: "Bayernliga · Gr. 043 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // MTTC Iphitos München, TC Passau-Neustift, TC Pfarrkirchen, TC Dachau 1950, TC Kempten, TC Erding, TC Thalkirchen München, TSV Haunstetten
      { groupid: "2049319", leagueName: "Landesliga 2 · Gr. 048 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // STC München Süd, SV Arget, TC Grün-Gold München, TSV Unterhaching, SG Hausham, TC Schwalbe Ottobrunn, TC Bad Aibling, TC Sauerlach
      { groupid: "2049312", leagueName: "Landesliga 2 · Gr. 049 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // SV Wacker Burghausen, TV Altötting, TSV Eintracht Karlsfeld, FC Ergolding, TC Ismaning, TC Topspin, TC Zwiesel, TC Straßkirchen
      { groupid: "2049310", leagueName: "Bayernliga (5er) · Gr. 050 SU", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // GW Luitpoldpark München, Ausstellungspark München, MTTC Iphitos München, TV Stockdorf, TV Altomünster, TeG Mühldorf, TC Rot-Weiß Bad Tölz, TSV Siegsdorf
      { groupid: "2049317", leagueName: "Landesliga 1 (5er) · Gr. 051 SU", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // TC Gernlinden, MTV 1879 München, SSV Höchstädt, TSV Schwabmünchen, TC Kaufbeuren-Kronenberg, TC Seefeld, TC Herrsching, TSV Haunstetten
      { groupid: "2049313", leagueName: "Landesliga 1 (5er) · Gr. 052 SU", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // TC Lamer Winkel, TF Dachau, SC Baldham-Vaterstetten, Post -Telekom-SV Rosenheim, TSV Wolnzach, TC Zwiesel, SVN München, TC Ismaning
      { groupid: "2049314", leagueName: "Landesliga 2 (5er) · Gr. 053 SU", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // TC Grün-Weiß Gräfelfing II, TSV Pentenried, TeG Blumenau-Großhadern, TC Eching, TV Schönrain, TC Greiling, TC Peiting, BSC Oberhausen
      { groupid: "2049316", leagueName: "Landesliga 2 (5er) · Gr. 056 SU", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // TV Kraiburg, Polizei SV Haar, TC Achental Grassau, SV Seeon, SV Leobendorf, TSV Neubeuern, TC Inzell, TC Rottach-Egern
      { groupid: "2049322", leagueName: "Landesliga 1 · Gr. 058 SU", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // TC Blutenburg München, TC Großhesselohe, TSV Hilgertshausen, TC Gernlinden, TC Forstenrieder Park, FC Heimertingen, DJK Augsburg-Pfersee, TC Mammendorf
      { groupid: "2049326", leagueName: "Landesliga 2 SB · Gr. 063 SU", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // DJK Götting, TSV Neubiberg-Ottobrunn, TSV Teisendorf, SVN München II, TF Fürstenfeldbruck, SV Prutting, STC München Süd, TC Riemerling
      { groupid: "2049318", leagueName: "Bayernliga · Gr. 057 SU", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // TV Feldkirchen, TSV Kottern, SVN München, TC Geretsried, TC Grün-Weiß Gräfelfing, TC Rot-Weiß Freising, TSV Feldafing, TC Sonthofen
      { groupid: "2049328", leagueName: "Landesliga 1 · Gr. 065 SU", teamLabel: "Herren 65", mode: "herren", teamSize: 9, gegner: true }, // TSV Haunstetten, TV Justiz Landsberg, TC Grün-Weiß Gräfelfing, TC Donauwörth, TC Großhesselohe, TSV Eintracht Karlsfeld, TSV Moosach München, SpVgg Au/Iller
      { groupid: "2049333", leagueName: "Landesliga 2 · Gr. 069 SU", teamLabel: "Herren 65", mode: "herren", teamSize: 9, gegner: true }, // GW Luitpoldpark München II, TC Mittenwald, SV Stadtwerke München, TC Peiting, TC Blutenburg München, TeG Blumenau-Großhadern, TTC Bad Wörishofen, TC Geretsried
      { groupid: "2049332", leagueName: "Landesliga 2 · Gr. 070 SU", teamLabel: "Herren 65", mode: "herren", teamSize: 9, gegner: true }, // TSV Siegsdorf, TSV Unterhaching, TC Seeschneid, SVN München II, Polizei SV Haar, TeG Alzstadt, TC Rimsting, SV Forsting-Pfaffing
      { groupid: "2049331", leagueName: "Bayernliga · Gr. 071 SU", teamLabel: "Herren 70", mode: "herren", teamSize: 9, gegner: true }, // TF Fürstenfeldbruck, DJK Götting, TC Augsburg Siebentisch, TSV Haunstetten, TSV Pentenried, TC Hopfen am See, SpVgg Zolling, TSV Haar
      { groupid: "2049339", leagueName: "Landesliga 2 · Gr. 075 SU", teamLabel: "Herren 70", mode: "herren", teamSize: 9, gegner: true }, // TC Rot-Weiß Nördlingen, TC Blau-Weiß Gräfelfing, TC Karlsfeld am See, SV Lochhausen, STC München Süd, SVN München, TC Gernlinden, TSV Unterhaching
      { groupid: "2049337", leagueName: "Landesliga 2 · Gr. 076 SU", teamLabel: "Herren 70", mode: "herren", teamSize: 9, gegner: true }, // TC Weiss-Blau Landshut, TeG Mühldorf, SC Buch am Erlbach, TSV Offenstetten, TC Unterföhring, TC St.Emmeram München, Post SV Landshut
      { groupid: "2049340", leagueName: "Bayernliga · Gr. 078 SU", teamLabel: "Herren 75", mode: "herren", teamSize: 9, gegner: true }, // TC Hopfen am See, DJK Götting, Polizei SV Haar, TSV Milbertshofen, TC Günzburg, MTTC Iphitos München, TSV Haar, TC St.Emmeram München
      { groupid: "2049338", leagueName: "Landesliga 1 · Gr. 079 SU", teamLabel: "Herren 75", mode: "herren", teamSize: 9, gegner: true }, // TF Fürstenfeldbruck, TC Aschheim, TC Aichach, FC Ergolding, TC Pfaffenhofen/Ilm, TC Blau-Weiß Gräfelfing, TV Stockdorf, TC Moosburg
      { groupid: "2049348", leagueName: "Landesliga 1 · Gr. 080 SU", teamLabel: "Herren 75", mode: "herren", teamSize: 9, gegner: true }, // TeG Alzstadt, TC Weilheim, TSV 1860 Rosenheim, TSV Unterhaching, MTV 1879 München, TSV Neubiberg-Ottobrunn, STC München Süd
      { groupid: "2049350", leagueName: "Landesliga 2 · Gr. 082 SU", teamLabel: "Herren 75", mode: "herren", teamSize: 9, gegner: true }, // TC Oberding, TSV Offenstetten, Post SV Landshut, SV Haimhausen, TC Gernlinden, TeG Kirchheim
      { groupid: "2049352", leagueName: "Bayernliga · Gr. 084 SU", teamLabel: "Herren 80", mode: "herren", teamSize: 9, gegner: true }, // TC Schießgraben Augsburg, TSV Haar, MTTC Iphitos München, TC Aschheim, TC Blau-Weiß Gräfelfing, TF Dachau, TSV 1860 Rosenheim, ASV Dachau
      { groupid: "2049346", leagueName: "Landesliga 1 · Gr. 085 SU", teamLabel: "Herren 80", mode: "herren", teamSize: 9, gegner: true }, // TC St.Emmeram München, TC Eichenau, TP Isartal Baierbrunn, STC München Süd, TSV Dachau, TC Zorneding, TF Kirchheim-Heimstetten
      { groupid: "2049347", leagueName: "Bayernliga · Gr. 086 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 9, gegner: true }, // TC Vilshofen, SC Riessersee Garmisch-Partk., TSV Moosach München, TC Sport Scheck, SpVgg Neuching, TC Gauting, TV Altötting, TC Pfaffenhofen/Ilm
      { groupid: "2049354", leagueName: "Landesliga 1 · Gr. 087 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 9, gegner: true }, // HC Wacker München, TC Wemding, TC Fischen, STC München Süd, TC Wittelsbach-Aichach, TC Tutzing, TC Grün-Gold München, SV Hohenfurch
      { groupid: "2049344", leagueName: "Landesliga 1 · Gr. 088 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 9, gegner: true }, // TC Malgersdorf, TC Rot-Weiß Landshut, TF Dachau II, SV Schloßberg-Stephansk., VfL Waldkraiburg, Weißblau Allianz München, TSV Neubiberg-Ottobrunn, TC Thalkirchen München
      { groupid: "2049355", leagueName: "Landesliga 2 · Gr. 091 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 9, gegner: true }, // TC Erding, SC Eching, VfB Hallbergmoos, SV Heimstetten, SpVgg Zolling, SV Lohhof, SC Mainburg, SpVgg Altenerding
      { groupid: "2049345", leagueName: "Landesliga 2 · Gr. 092 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 9, gegner: true }, // TSV Forstenried München, TC Ramersdorf, TSV 1860 Rosenheim, ETC Siegertsbrunn, BCF Wolfratshausen, Ausstellungspark München, TC Ottobrunn
      { groupid: "2049351", leagueName: "Bayernliga · Gr. 093 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TC Kempten, TSV Unterhaching, HC Wacker München, TC Weyarn, MTTC Iphitos München, SV Schloßberg-Stephansk., MTV 1879 München, TSV Schondorf
      { groupid: "2049365", leagueName: "Landesliga 1 · Gr. 095 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TC Pfaffenhofen/Ilm, ASV Glonn, TC Schrobenhausen, Polizei SV Haar, TC Topspin, TSV Feldkirchen, TSV Allershausen, TC Erding
      { groupid: "2049359", leagueName: "Landesliga 2 · Gr. 097 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TC Grün-Weiß Gräfelfing, DJK Würmtal München, TC Pfronten, TV Stockdorf, TC Tutzing, TeG Blumenau-Großhadern, ESV München Sportpark, TC Peiting
      { groupid: "2049362", leagueName: "Landesliga 2 · Gr. 099 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TC Raschke Taufkirchen, TC Piding, SV Bruckmühl, TC St.Emmeram München, TeG Mühldorf, SV Arget, TC Neukeferloh, SV Seeon
      { groupid: "2049363", leagueName: "Bayernliga (4er) · Gr. 100 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Schwaben Augsburg, GW Luitpoldpark München, TSV Unterhaching, TC Zorneding, TC Grün-Weiß Dingolfing, MTTC Iphitos München, TC Steinhöring, TCE Gröbenzell
      { groupid: "2049371", leagueName: "Landesliga 2 (4er) · Gr. 104 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TSV Eintracht Karlsfeld, STC München Süd, TC Großhesselohe, PSV München, TC Würmsee Feldafing, TP Isartal Baierbrunn II, TC Kreuzlinger Forst, TC Blau-Weiß Gräfelfing
      { groupid: "2049366", leagueName: "Landesliga 2 (4er) · Gr. 105 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TSV Eintracht Karlsfeld II, Weißblau Allianz München, TC Rot-Weiß Landshut, FC Langengeisling, SpVgg Erdweg, GW Luitpoldpark München II, MTV Pfaffenhofen/Ilm, TSV Rohrbach
      { groupid: "2078454", leagueName: "Südliga 4 · Gr. 068", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TSV Oberottmarshausen, SSV Bobingen, TSV Königsbrunn, FSV Inningen II, TC Ziemetshausen II, TSV Fischach II, TSV Haunstetten III
      { groupid: "2078478", leagueName: "Südliga 4 · Gr. 086", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // SC Höhenrain, DJK Darching, TC Holzkirchen, TC Neukeferloh, TSV Hofolding, SV Helfendorf
      { groupid: "2078476", leagueName: "Südliga 4 · Gr. 088", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TSV Haar III, SV Heimstetten, WB Fideliopark München II, SVN München, Weißblau Allianz München II, TC Vaterstetten, TC St.Emmeram München
      { groupid: "2078477", leagueName: "Südliga 4 · Gr. 089", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // Team München, Münchner Sportclub IV, SC Freimann III, TC Ismaning III, ASV Dachau II, TC Lauterbach 1973 II, TC Dachau 1950 III
      { groupid: "2078479", leagueName: "Südliga 4 · Gr. 091", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // HC Wacker München III, ESV München Sportpark II, TeG Blumenau-Großhadern III, TC Grün-Gold München II, TC Pasing München II, Ausstellungspark München III, ESV Mü Pasing
      { groupid: "2078494", leagueName: "Südliga 5 (4er) · Gr. 106", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Aying, TC Raschke Taufkirchen III, TC Rot-Weiß Bad Tölz II, ETC Siegertsbrunn II, TSV Otterfing II, TC Schliersee II, TC Neuhaus II, TC Geretsried II
      { groupid: "2078495", leagueName: "Südliga 5 (4er) · Gr. 108", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // SV Planegg-Krailling, TF Dachau III, DJK Würmtal München II, TSV Forstenried München II, TSV Türkenfeld, TC Puchheim II, STC München Süd III, TC Philathlos München
      { groupid: "2078519", leagueName: "Südliga 6 (4er) · Gr. 136", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TSV St.Wolfgang, TeG Kirchheim II, TC Seeschneid, FC Forstern II, TC Finsing II, TF Markt Schwaben III
      { groupid: "2078531", leagueName: "Südliga 6 (4er) · Gr. 138", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Ismaning IV, TV Feldkirchen II, SV Studentenstadt Freimann II, TC Schleißheim II, SV Dietersheim, Team München II, WB Fideliopark München III
      { groupid: "2078533", leagueName: "Südliga 6 (4er) · Gr. 140", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // DJK Fasangarten München, TSV Neubiberg-Ottobrunn III, TC Ramersdorf II, SV DJK Taufkirchen III, TC Weyarn, TC Höhenkirchen II
      { groupid: "2078527", leagueName: "Südliga 6 (4er) · Gr. 141", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // MTV 1879 München II, TC Blau-Weiß Gräfelfing III, TC Penzberg III, TA-SV Gelting, TC Egling, DJK Waldram II, TSV Forstenried München III, SV Ascholding II
      { groupid: "2078392", leagueName: "Südliga 1 · Gr. 003", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Schrobenhausen, TC Rot-Weiß Freising II, SpVgg Zolling, FC Schweitenkirchen, TC Moosburg, SV Weichering, STK Garching II, TC Lauterbach 1973
      { groupid: "2078394", leagueName: "Südliga 1 · Gr. 005", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TSV 1860 Rosenheim II, TC Aschheim II, TSV Neubiberg-Ottobrunn, TC Rimsting, TC Topspin, TS Jahn München, TSV Neubeuern, TeG Wasserburg-Reitmehring
      { groupid: "2078396", leagueName: "Südliga 1 · Gr. 006", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Grünwald, TV Dürnbach, SV DJK Taufkirchen, TC Penzberg, STC München Süd, SG Hausham, TSV 1860 Rosenheim III, TC Großhesselohe IV
      { groupid: "2078391", leagueName: "Südliga 1 · Gr. 007", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // GW Luitpoldpark München III, HC Wacker München, TSV Moosach München, ESV München Sportpark, TC Unterföhring, SC Freimann, TC Thalkirchen München, TC Harlaching München
      { groupid: "2088796", leagueName: "Südliga 1 · Gr. 008", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Blutenburg München II, TC Utting, TC Schießgraben Augsburg IV, TC Rot-Weiß Eschenried II, SV Lochhausen, ESV Spfrd.Neuaubing, TSV Gilching, SV Söcking
      { groupid: "2078401", leagueName: "Südliga 2 · Gr. 013", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TSV Haunstetten, DJK Augsburg-Lechhausen, TTC Geltendorf, TC Schießgraben Augsburg V, TC Friedberg III, TSV Fischach, TSV Bobingen, TC Mering II
      { groupid: "2078403", leagueName: "Südliga 2 · Gr. 020", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TV Feldkirchen, TC Zorneding, TSV Otterfing, TC Raschke Taufkirchen II, TSV Feldkirchen II, Polizei SV Haar, TSV Neubiberg-Ottobrunn II, ASV Glonn
      { groupid: "2078407", leagueName: "Südliga 2 · Gr. 021", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TSV Haar II, TC Rot-Weiß Freising III, TF Markt Schwaben, TC Blau-Weiß Neufahrn, TC Erding II, TC Finsing, TC Aschheim III, TC Ismaning II
      { groupid: "2078411", leagueName: "Südliga 2 · Gr. 022", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // Münchner Sportclub II, SC Eching, TC Dachau 1950 II, TC Sport Scheck, TC Schleißheim, SC Freimann II, TSV Schwabhausen, ASV Dachau
      { groupid: "2086415", leagueName: "Südliga 2 · Gr. 023", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TeG Blumenau-Großhadern, TV Stockdorf, DJK Würmtal München, TSV Forstenried München, TC Blau-Weiß Gräfelfing, TC Thalkirchen München II, ESV Spfrd.Neuaubing II
      { groupid: "2078417", leagueName: "Südliga 2 · Gr. 024", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // HC Wacker München II, TC Gernlinden II, TC Eichenau II, TCE Gröbenzell, TF Fürstenfeldbruck, TSV Moosach München II, TC Puchheim, TC Blutenburg München III
      { groupid: "2078433", leagueName: "Südliga 3 · Gr. 035", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // FSV Inningen, TSV Haunstetten II, TC Dasing, TV Augsburg, TC Kissing, TC Wehringen, TC Schwaben Augsburg, TSV Leitershofen II
      { groupid: "2078436", leagueName: "Südliga 3 · Gr. 048", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Sportpark Deisenhofen, TC Großhesselohe V, TC Grün-Gold München, TC Ramersdorf, STC München Süd II, SV DJK Taufkirchen II, TC Riemerling, TC Schwalbe Ottobrunn
      { groupid: "2078444", leagueName: "Südliga 3 · Gr. 050", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Unterföhring II, TC Rot-Weiß Freising IV, SV Langenbach, SpVgg Zolling II, TC Oberding, STK Garching III, TC Moosinning, SV Lohhof
      { groupid: "2078440", leagueName: "Südliga 3 · Gr. 052", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // GW Luitpoldpark München IV, Weißblau Allianz München, WB Fideliopark München, TSV Milbertshofen, TC Cosima München, MTTC Iphitos München III, TS Jahn München II, SV Studentenstadt Freimann
      { groupid: "2078441", leagueName: "Südliga 3 · Gr. 053", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // Münchner Sportclub III, TC Pasing München, Ausstellungspark München, MTV 1879 München, TC Harlaching München II, TC Schwabing, PSV München, SV Stadtwerke München
      { groupid: "2078434", leagueName: "Südliga 3 · Gr. 054", teamLabel: "Herren", mode: "herren", teamSize: 9, gegner: true }, // TC Grün-Weiß Gräfelfing II, TeG Blumenau-Großhadern II, SV Lochhausen II, TC Rot-Weiß Eschenried III, ESV Spfrd.Neuaubing III, TC Blau-Weiß Gräfelfing II, TSV Eintracht Karlsfeld, Ausstellungspark München II
      { groupid: "2078562", leagueName: "Südliga 3 · Gr. 175", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Augsburg Siebentisch III, BC Adelzhausen, SV Haspelmoor, TC Mering II, TC Schwaben Augsburg II, TC Kissing, TSV Haunstetten III
      { groupid: "2078574", leagueName: "Südliga 3 · Gr. 183", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // ETC Siegertsbrunn, SV Hörlkofen, TF Markt Schwaben, TC Zorneding, DJK-SV Oberndorf, HC Wacker München III, TC Steinhöring II
      { groupid: "2078571", leagueName: "Südliga 3 · Gr. 185", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Lauterbach 1973, MTV 1879 München, TC Eching, TC Gernlinden II, 1. SC Gröbenzell, TG Germerswang, MTV Berg
      { groupid: "2078596", leagueName: "Südliga 4 (4er) · Gr. 204", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TSV Haar II, Weißblau Allianz München, SV DJK Taufkirchen, MTTC Iphitos München IV, TC Unterföhring II, TC Neukeferloh II, TC Thalkirchen München II
      { groupid: "2078599", leagueName: "Südliga 5 (4er) · Gr. 214", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TSV Haunstetten IV, TSV Diedorf, SSV Bobingen, TSV Bobingen II, SV Wulfertshausen, TC TAS Augsburg, TSV Königsbrunn III
      { groupid: "2078628", leagueName: "Südliga 5 (4er) · Gr. 237", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Bad Aibling, TC Miesbach, TV Feldkirchen II, SV Helfendorf, SC Höhenrain II, TSV Irschenberg
      { groupid: "2086417", leagueName: "Südliga 5 (4er) · Gr. 239", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TSV Forstenried München, ESV Spfrd.Neuaubing, DJK Waldram, TC Schwalbe Ottobrunn, STC München Süd III, TV Stockdorf, MTV 1879 München II
      { groupid: "2078632", leagueName: "Südliga 5 (4er) · Gr. 240", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Rot-Weiß Poing, SC Baldham-Vaterstetten, TC Topspin II, TSV Feldkirchen, TC Anzing, FC Forstern II, TeG Kirchheim
      { groupid: "2078542", leagueName: "Südliga 1 · Gr. 151", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Eichenau, TC Schwaben Augsburg, TC Puchheim II, TSV Haunstetten, TC Mering, TC Gernlinden, TC Greifenberg, SC Weßling
      { groupid: "2078547", leagueName: "Südliga 2 · Gr. 158", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TSV Königsbrunn, TSV Markt Wald, TSV Schwabmünchen, TSV Haunstetten II, SV Stöttwang, TC Buchloe, TC Mauerstetten, TV Justiz Landsberg
      { groupid: "2078560", leagueName: "Südliga 2 · Gr. 162", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Höhenkirchen, TC Steinhöring, TC Riemerling, TSV Otterfing, TC Neukeferloh, TC Rot-Weiß Bad Tölz, TV Dürnbach, SV DJK Heufeld
      { groupid: "2078555", leagueName: "Südliga 2 · Gr. 164", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // SV Lohhof, TF Dachau III, Münchner Sportclub III, SV Weichs, ASV Dachau II, TSV Eintracht Karlsfeld, TC Rot-Weiß Freising II, TSV Milbertshofen
      { groupid: "2078556", leagueName: "Südliga 2 · Gr. 165", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // GW Luitpoldpark München IV, HC Wacker München II, SVN München, TC Grün-Gold München, TC Cosima München, Ausstellungspark München, TS Jahn München, TC Harlaching München
      { groupid: "2089557", leagueName: "Südliga 2 · Gr. 166", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Blutenburg München II, TSV Gilching, TC Pasing München, TC Mammendorf, TC Kreuzlinger Forst, TCE Gröbenzell, SV Hohenzell, TC Olching
      { groupid: "2078550", leagueName: "Südliga 2 · Gr. 167", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // TC Weilheim, TC Murnau, SV Raisting, TC Blau-Weiß Gräfelfing, STC München Süd II, SC Eibsee Grainau
      { groupid: "2078654", leagueName: "Südliga 2 · Gr. 259", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // SpVgg Altenerding, TC Anzing, TS Jahn München II, SV Heimstetten, TC Neuperlach-Kail München, TC Rot-Weiß Freising II
      { groupid: "2078658", leagueName: "Südliga 2 · Gr. 260", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TSV Milbertshofen II, TC Unterföhring, PSV München, SC Freimann II, Weißblau Allianz München, SV Petershausen, Münchner Sportclub
      { groupid: "2078651", leagueName: "Südliga 2 · Gr. 261", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // TC Grün-Gold München II, SC Freising, TeG Blumenau-Großhadern, ESV Mü Pasing, TC Ramersdorf II, SVN München II
      { groupid: "2078705", leagueName: "Südliga 2 · Gr. 308", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // BCF Wolfratshausen, TSV Oberpframmern, ETC Siegertsbrunn, TC Raschke Taufkirchen, DJK Darching, TSV Schäftlarn, TC Geretsried II, SV DJK Heufeld
      { groupid: "2086424", leagueName: "Südliga 2 · Gr. 310", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Blau-Weiß Neufahrn, SC Freising, SV Weichs, TC Rot-Weiß Eschenried II, TF Dachau II, TC Lauterbach 1973, SpVgg Röhrmoos, TC Schleißheim
      { groupid: "2078704", leagueName: "Südliga 2 · Gr. 313", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Großhesselohe II, TC Weilheim, STC München Süd II, TSV Unterhaching, TC Tutzing, SC Pöcking-Possenhofen, SV Apfeldorf, TeG Schwabbruck-Schwabsoien
      { groupid: "2078707", leagueName: "Südliga 3 · Gr. 325", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // WB Fideliopark München II, ASV München, ASV Dachau, SpVgg Erdweg, TC Ismaning, VfB Hallbergmoos II, STK Garching II
      { groupid: "2078716", leagueName: "Südliga 3 · Gr. 326", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Schwalbe Ottobrunn, TC Grün-Gold München II, TS Jahn München, SVN München, PSV München, STC München Süd III, Ausstellungspark München
      { groupid: "2078735", leagueName: "Südliga 4 (4er) · Gr. 342", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Oberhaching, TC Sportpark Deisenhofen, TC St.Emmeram München, TC Holzkirchen, TC Weyarn, ETC Siegertsbrunn II, TS Jahn München II
      { groupid: "2078731", leagueName: "Südliga 4 (4er) · Gr. 343", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Moosinning, ATSV Kirchseeon, TC Vaterstetten, SV Marzling, TC Rot-Weiß Freising, SV Langenbach
      { groupid: "2078732", leagueName: "Südliga 4 (4er) · Gr. 346", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // SV Lochhausen, DJK Würmtal München, TSV Forstenried München II, TC Harlaching München III, TC Thalkirchen München, Ausstellungspark München II
      { groupid: "2078677", leagueName: "Südliga 1 · Gr. 292", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Schießgraben Augsburg, SC Eching, TC Jetzendorf, TC Olching, TC Kreuzlinger Forst, TC Schwaben Augsburg, TC Puchheim II, STK Garching
      { groupid: "2078688", leagueName: "Südliga 1 · Gr. 297", teamLabel: "Herren 40", mode: "herren", teamSize: 9, gegner: true }, // TC Grün-Gold München, MTV Dießen, TC Schongau, TC Herrsching, TC Harlaching München II, TSV Peißenberg, TC Berg, TC Ramersdorf
      { groupid: "2078759", leagueName: "Südliga 2 · Gr. 363", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // TC Aschheim, TC Topspin II, TC Seeschneid, SV Helfendorf, FC Forstern, TSV Unterhaching III, TC Sauerlach II
      { groupid: "2078755", leagueName: "Südliga 3 · Gr. 374", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // TC Zorneding, TC Finsing, ETC Siegertsbrunn II, TeG Kirchheim, TC Oberhaching, TC Neuperlach-Kail München II, TSV Oberpframmern
      { groupid: "2078757", leagueName: "Südliga 3 · Gr. 376", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // STC München Süd II, TC Großhesselohe II, TCE Gröbenzell II, TC Gauting II, TP Isartal Baierbrunn II, 1. SC Gröbenzell III, TSV Schondorf
      { groupid: "2078777", leagueName: "Südliga 4 (4er) · Gr. 387", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Brunnthal, TC Höhenkirchen, SV DJK Taufkirchen, TV Feldkirchen, TC Schwalbe Ottobrunn II, SV Bruckmühl, TC Riemerling
      { groupid: "2089534", leagueName: "Südliga 4 (4er) · Gr. 389", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Raschke Taufkirchen, TC Ismaning II, TF Markt Schwaben, TC Rot-Weiß Poing II, TC Aschheim II, TSV Feldkirchen II, TC Brunnthal II
      { groupid: "2078780", leagueName: "Südliga 4 (4er) · Gr. 390", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // ESV Mü Pasing, MTV 1879 München II, TS Jahn München, TSV Schwabhausen, SV Esting, TC Schwabing, SpVgg Röhrmoos
      { groupid: "2078746", leagueName: "Südliga 1 · Gr. 354", teamLabel: "Herren 50", mode: "herren", teamSize: 9, gegner: true }, // TC Großhesselohe, ETC Siegertsbrunn, TSV Milbertshofen, TC Sportpark Deisenhofen, Münchner Sportclub, TC Ramersdorf, TSV Haar, TSV Feldkirchen
      { groupid: "2078797", leagueName: "Südliga 1 (5er) · Gr. 395", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // TC Neukeferloh, WB Fideliopark München, TC Egling, TC Steinhöring, ASV Glonn, TC Höhenkirchen
      { groupid: "2078784", leagueName: "Südliga 1 (5er) · Gr. 397", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // TC Unterföhring, TSV Eintracht Karlsfeld, GW Luitpoldpark München II, Münchner Sportclub, TC Sport Scheck, TSV Moosach München II
      { groupid: "2078785", leagueName: "Südliga 1 (5er) · Gr. 398", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // STC München Süd, TSV Schäftlarn, TSC WWK, TSV Forstenried München, TC Olching
      { groupid: "2078799", leagueName: "Südliga 1 · Gr. 402", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // MTV 1879 München, TSV Feldafing II, TC Pasing München, TCE Gröbenzell, ESV Spfrd.Neuaubing, TC Seefeld, SV Planegg-Krailling
      { groupid: "2078791", leagueName: "Südliga 2 · Gr. 406", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // SV Lochhausen, TC Ramersdorf, STK Garching II, SC Eching II, SV Sulzemoos, TC Puchheim, TC Gernlinden II
      { groupid: "2078803", leagueName: "Südliga 3 (4er) · Gr. 414", teamLabel: "Herren 60", mode: "herren", teamSize: 6, gegner: true }, // TC Thalkirchen München, TeG Kirchheim, TC Sauerlach, TSV Unterhaching II, TC St.Emmeram München, TC Philathlos München, TC Vaterstetten
      { groupid: "2086420", leagueName: "Südliga 3 (4er) · Gr. 415", teamLabel: "Herren 60", mode: "herren", teamSize: 6, gegner: true }, // TC Gauting, ASV Dachau, TC Utting, TC Forstenrieder Park II, TSV Forstenried München, TSV Gilching, TC Eching, TeG Blumenau-Großhadern
      { groupid: "2079349", leagueName: "Südliga 1 · Gr. 967", teamLabel: "Herren 65", mode: "herren", teamSize: 9, gegner: true }, // TC Bad Reichenhall II, TC Piding, TC Anzing, ATSV Kirchseeon, TC Topspin
      { groupid: "2079356", leagueName: "Südliga 1 · Gr. 968", teamLabel: "Herren 65", mode: "herren", teamSize: 9, gegner: true }, // TC Kochel, TSV Hofolding, Polizei SV Haar II, TC Ohlstadt, TC Eurasburg, TC Blau-Weiß Gräfelfing
      { groupid: "2079367", leagueName: "Südliga 1 · Gr. 969", teamLabel: "Herren 65", mode: "herren", teamSize: 9, gegner: true }, // TC Oberding, TF Eitting, SV Hörlkofen, SV Walpertskirchen, TC Unterföhring, MTTC Iphitos München
      { groupid: "2079362", leagueName: "Südliga 1 · Gr. 970", teamLabel: "Herren 65", mode: "herren", teamSize: 9, gegner: true }, // TCE Gröbenzell, TC Karlsfeld am See, TSV Eintracht Karlsfeld II, SV Lohhof, TSV Gilching
      { groupid: "2079375", leagueName: "Südliga 2 · Gr. 979", teamLabel: "Herren 65", mode: "herren", teamSize: 9, gegner: true }, // MTV 1879 München, Weißblau Allianz München, TC Riemerling, TC Ramersdorf, ESV Mü Pasing, SV DJK Taufkirchen
      { groupid: "2079361", leagueName: "Südliga 1 · Gr. 985", teamLabel: "Herren 70", mode: "herren", teamSize: 9, gegner: true }, // STK Garching, SV Lohhof, TC Ismaning, TC Finsing, VfB Forstinning, TF Kirchheim-Heimstetten
      { groupid: "2079373", leagueName: "Südliga 1 · Gr. 986", teamLabel: "Herren 70", mode: "herren", teamSize: 9, gegner: true }, // TC Mammendorf, TC Kreuzlinger Forst, TC Grün-Gold München, TC Fürstenfeldbruck, TC Blutenburg München, TC Karlsfeld am See II
      { groupid: "2078801", leagueName: "Südliga 1 · Gr. 417", teamLabel: "Damen 30", mode: "damen", teamSize: 9, gegner: true }, // TC Unterföhring, WB Fideliopark München, TC Meitingen, SC Freimann, DJK Langenmosen
      { groupid: "2078822", leagueName: "Südliga 2 (4er) · Gr. 429", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // TSV Feldkirchen, TC Neuperlach-Kail München, TC Anzing, TC Philathlos München, VfB Forstinning, TC St.Emmeram München, DJK Fasangarten München
      { groupid: "2078828", leagueName: "Südliga 2 (4er) · Gr. 430", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // Münchner Sportclub, HC Wacker München II, TC Grünwald, Ausstellungspark München II, TC Schwabing, TC Thalkirchen München II, SV Stadtwerke München, TS Jahn München
      { groupid: "2078823", leagueName: "Südliga 2 (4er) · Gr. 431", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // TSV 1880 Starnberg, TC Blau-Weiß Gräfelfing, STC München Süd II, SV Planegg-Krailling, SV Esting, TC Herrsching, ESV Spfrd.Neuaubing
      { groupid: "2078833", leagueName: "Südliga 3 (4er) · Gr. 447", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Bayrischzell, TC Holzkirchen, SV Helfendorf, TC Schliersee, TC Aying, DJK Darching, TC Deisenhofen
      { groupid: "2078836", leagueName: "Südliga 3 (4er) · Gr. 448", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // SV Haimhausen, VfB Hallbergmoos, TC Ismaning, Münchner Sportclub, TC Karlsfeld am See, SC Freimann, ESV Freimann
      { groupid: "2086423", leagueName: "Südliga 3 (4er) · Gr. 449", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // Ausstellungspark München, TC Grün-Weiß Gräfelfing II, TSV Pentenried, TC Forstenrieder Park, TC Thalkirchen München, TC Blutenburg München II, ESV München Sportpark II, TC Gauting II
      { groupid: "2078847", leagueName: "Südliga 4 (4er) · Gr. 460", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Höhenkirchen, ETC Siegertsbrunn II, SG Hausham II, ATSV Kirchseeon, TC Weyarn II, TC Vaterstetten, SC Baldham-Vaterstetten II
      { groupid: "2078846", leagueName: "Südliga 4 (4er) · Gr. 464", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Grünwald, SV DJK Taufkirchen, TC Tutzing II, BCF Wolfratshausen, TC Icking, TC Raschke Taufkirchen II, FC Seeshaupt, SV Uffing
      { groupid: "2078815", leagueName: "Südliga 1 · Gr. 433", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TSF Ludwigsfeld Neu-Ulm, GW Luitpoldpark München II, TC Dasing, SV Bonstetten
      { groupid: "2078863", leagueName: "Südliga 1 (4er) · Gr. 471", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // Münchner Sportclub II, TC Finsing, WB Fideliopark München, TC Rot-Weiß Freising II, ATSV Kirchseeon, FC Forstern, TC Anzing
      { groupid: "2078864", leagueName: "Südliga 1 (4er) · Gr. 472", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // ESV München Sportpark, TC Puchheim, 1. SC Gröbenzell, Münchner Sportclub III, ESV Mü Pasing, TC Ramersdorf, TSV Eintracht Karlsfeld III, TC Sport Scheck
      { groupid: "2078867", leagueName: "Südliga 1 (4er) · Gr. 473", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TSV Pentenried, TC Grün-Weiß Gräfelfing, TV Stockdorf, TC Schongau, TSV Schäftlarn, MTV Dießen, TC Weilheim, SV Söcking
      { groupid: "2078862", leagueName: "Südliga 2 (4er) · Gr. 477", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // SG Hausham, TC Rottach-Egern, TC Holzkirchen II, SV Bruckmühl, TC Ottobrunn, TV Dürnbach, TC Schwalbe Ottobrunn, DJK Götting
      { groupid: "2078859", leagueName: "Südliga 2 (4er) · Gr. 479", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Eichenau II, TC Harlaching München, STK Garching, 1. SC Gröbenzell II, ESV München Sportpark II, SV Lochhausen, TC Schwabing
      { groupid: "2079398", leagueName: "Freizeit-Herren Doppel 60 Südliga 1 Gr. 991", teamLabel: "Freizeit-Herren Doppel 60 Südliga 1 Gr. 991", mode: "herren", teamSize: 9, gegner: true }, // TP Isartal Baierbrunn, TC Schwalbe Ottobrunn, TC Icking, SV Ascholding, TC Oberhaching, TC Unterföhring
      { groupid: "2079396", leagueName: "Freizeit-Herren Doppel 60 Südliga 1 Gr. 992", teamLabel: "Freizeit-Herren Doppel 60 Südliga 1 Gr. 992", mode: "herren", teamSize: 9, gegner: true }, // TC Landsberied, MTV 1879 München, ESV Mü Pasing, SV Lochhausen, TC Utting, TSV Pähl, TTC Geltendorf
      { groupid: "2008974", leagueName: "Regionalliga Süd-Ost · Gr. 002", teamLabel: "Damen", mode: "damen", teamSize: 9, gegner: true }, // MTTC Iphitos München, TC Raschke Taufkirchen, TC Aschheim, TC im TSV Zella-Mehlis, CaM Nürnberg, GW Luitpoldpark München II, TLZ Espenhain, DRC Ingolstadt
      { groupid: "2008980", leagueName: "Regionalliga Süd-Ost · Gr. 012", teamLabel: "Damen 40", mode: "damen", teamSize: 9, gegner: true }, // TC Laufen, TC Gauting, GW Luitpoldpark München, STK Garching, TC Zwiesel, CaM Nürnberg, TeG Wasserburg-Reitmehring, TC RW Bad Königshofen
      { groupid: "2008981", leagueName: "Regionalliga Süd-Ost · Gr. 003", teamLabel: "Herren 30", mode: "herren", teamSize: 9, gegner: true }, // MTTC Iphitos München, LSC 1901, CTC Küchwald / Freiberg, TSV Altenfurt, TC Übersee, GW Luitpoldpark München, TC Weiß-Blau Würzburg, TC Neutraubling
      { groupid: "2008985", leagueName: "Regionalliga Süd-Ost · Gr. 006", teamLabel: "Herren 55", mode: "herren", teamSize: 9, gegner: true }, // TC Blutenburg München, TC Grün-Weiß Gräfelfing, TV Feldkirchen, TC Friedberg, TSV Altenfurt, TSV Kottern, Bad WH Dresden, TC Grün-Rot Weiden
      { groupid: "2008983", leagueName: "Regionalliga Süd-Ost · Gr. 007", teamLabel: "Herren 60", mode: "herren", teamSize: 9, gegner: true }, // TSV Altenfurt, TC Weilheim, STK Garching, TC Augsburg Siebentisch, TV Fürth 1860, GW Luitpoldpark München, TC Hof, MSC Pfatter
      { groupid: "2008982", leagueName: "Regionalliga Süd-Ost · Gr. 008", teamLabel: "Herren 65", mode: "herren", teamSize: 9, gegner: true }, // 1.TC Waldheim, TC Hof, GW Luitpoldpark München, FC 74 München, TSV Altenfurt, TC Seefeld
      { groupid: "2008979", leagueName: "Regionalliga Süd-Ost · Gr. 009", teamLabel: "Herren 70", mode: "herren", teamSize: 9, gegner: true }, // TP Lichtenfels, GW Luitpoldpark München, FC 74 München, TC Dorfen, TC Schönb. Aschaffenburg, TC Schrobenhausen, NHTC Nürnberg, TF Dachau
      { groupid: "2008976", leagueName: "Regionalliga Süd-Ost · Gr. 010", teamLabel: "Herren 75", mode: "herren", teamSize: 9, gegner: true }, // GW Luitpoldpark München, 1. FC Nürnberg, TC Großhesselohe, TF Dachau, TC Bad Reichenhall, TC Grün-Weiß Bayreuth, TSV Feldafing, TC Schönb. Aschaffenburg
      { groupid: "2011314", leagueName: "Regionalliga Süd-Ost · Gr. 011", teamLabel: "Damen 30", mode: "damen", teamSize: 9, gegner: true }, // STK Garching, TC Rot-Weiß Eschenried, TF Dachau, TC Augsburg Siebentisch, GW Luitpoldpark München, TC Schießgraben Augsburg, TC Bamberg, TC Lerchenbühl Bayreuth
      // DISCOVER:sommer-25
    ],
  },
  {
    id: "winter-2425",
    label: "Winter 2024/25",
    btvLabel: "Winter 2024/2025",
    layout: "winter",
    prefix: null,
    historyOnly: true,
    dataFile: null,
    matchesFile: null,
    reports: REPORTS_FILE,
    rosters: ROSTERS_FILE,
    teamSize: 6,
    groups: [
      { groupid: "1987180", leagueName: "Bayernliga · Gr. 022 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 6 },
      { groupid: "1987178", leagueName: "Landesliga 1 · Gr. 024 SU", teamLabel: "Herren 40 II", mode: "herren", teamSize: 6 },
      { groupid: "1987177", leagueName: "Bayernliga · Gr. 029 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 6 },
      { groupid: "1986784", leagueName: "Südliga 1 · Gr. 093", teamLabel: "Herren 30", mode: "herren", teamSize: 6 },
      { groupid: "1986797", leagueName: "Südliga 2 · Gr. 100", teamLabel: "Herren 30 II", mode: "herren", teamSize: 6 },
      { groupid: "1986854", leagueName: "Südliga 2 · Gr. 155", teamLabel: "Damen 40", mode: "damen", teamSize: 6 },
      { groupid: "1986859", leagueName: "Südliga 1 · Gr. 164", teamLabel: "Damen 50", mode: "damen", teamSize: 6 },
      { groupid: "1987156", leagueName: "Bayernliga · Gr. 008 SU", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Hengersberg, TC Aschheim, TC Grün-Weiß Gräfelfing, Münchner Sportclub, MTTC Iphitos München, TF Dachau, STK Garching
      { groupid: "1987170", leagueName: "Landesliga 1 · Gr. 009 SU", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Schießgraben Augsburg, TC Augsburg Siebentisch, TC Blutenburg München, TC Rot-Weiß Gersthofen, TC Puchheim, TC Rot-Weiß Eschenried
      { groupid: "1987168", leagueName: "Landesliga 1 · Gr. 017 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TC Geretsried, TC Mittenwald, TC Seefeld, TS Jahn München
      { groupid: "1987187", leagueName: "Landesliga 1 · Gr. 031 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Ottobrunn, TC Harlaching München, FC Ergolding, TF Dachau, MTTC Iphitos München, TC Grün-Weiß Gräfelfing II
      { groupid: "1987208", leagueName: "Landesliga 1 · Gr. 051 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // GW Luitpoldpark München, TC Schongau, TCE Gröbenzell, SV Stadtwerke Augsburg, TC Landsberg, SV Lohhof, TC Gernlinden
      { groupid: "1987198", leagueName: "Landesliga 1 · Gr. 052 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Höhenkirchen, TC Bad Endorf, ASV Glonn, SV Helfendorf, TC Steinhöring, MTTC Iphitos München, TP Isartal Baierbrunn
      { groupid: "1987172", leagueName: "Landesliga 2 · Gr. 012 SU", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Ismaning, TC Rot-Weiß Landshut, VfL Waldkraiburg, TC Glückauf Kropfmühl, TC Grün-Weiß Dingolfing, TC Rot-Weiß Deggendorf
      { groupid: "1987167", leagueName: "Landesliga 2 · Gr. 013 SU", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // GW Luitpoldpark München, TF Dachau II, TC Pfaffenhofen/Ilm, TC Rot-Weiß Eschenried II, TSV Haar, SC Freimann
      { groupid: "1987157", leagueName: "Landesliga 2 · Gr. 014 SU", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Großhesselohe, SC Riessersee Garmisch-Partk., TC Ismaning II, TC Grün-Weiß Gräfelfing II, DJK Rosenheim, STC München Süd
      { groupid: "1987173", leagueName: "Landesliga 2 · Gr. 019 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // HC Wacker München II, TV Geisenfeld, TSV Haar II, TC Ramersdorf, TC Schleißheim, SpVgg Zolling II
      { groupid: "1987179", leagueName: "Landesliga 2 · Gr. 026 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Sonthofen, STC München Süd, TC Gauting II, TC Großhesselohe, GW Luitpoldpark München, TC Kreuzlinger Forst
      { groupid: "1987183", leagueName: "Landesliga 2 · Gr. 027 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Taufkirchen, TC Unterföhring, TC Geretsried, TC Traunstein, MTTC Iphitos München II
      { groupid: "1987189", leagueName: "Landesliga 2 · Gr. 033 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Puchheim, TC Penzberg, TC Murnau, TP Isartal Baierbrunn, TC Herrsching, TC Seefeld
      { groupid: "1986761", leagueName: "Südliga 1 · Gr. 069", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // WB Fideliopark München, TC Ramersdorf, TC Großhesselohe II, TC Thalkirchen München, HC Wacker München II, Ausstellungspark München
      { groupid: "1986769", leagueName: "Südliga 1 · Gr. 070", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // ASV Dachau, SV Lochhausen, TC Rot-Weiß Eschenried III, SV Haimhausen, SC Eching, STK Garching II
      { groupid: "1986790", leagueName: "Südliga 1 · Gr. 091", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TC Thalkirchen München, Ausstellungspark München, ESV Mü Pasing, TC Rot-Weiß Gersthofen, ESV München Sportpark
      { groupid: "1986791", leagueName: "Südliga 1 · Gr. 092", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TC Murnau, TC Herrsching, TC Grün-Gold München, TC Straßlach, TS Jahn München II
      { groupid: "1986826", leagueName: "Südliga 1 · Gr. 132", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Sauerlach, ETC Siegertsbrunn, TC Thalkirchen München, GW Luitpoldpark München II, TC Ramersdorf, SV Helfendorf
      { groupid: "1986862", leagueName: "Südliga 1 · Gr. 165", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Raschke Taufkirchen, SV Großkarolinenfeld, TC Riemerling, SV Arget, ETC Siegertsbrunn, TC Rottach-Egern
      { groupid: "1986787", leagueName: "Südliga 2 · Gr. 090", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Ismaning III, TC Cosima München, WB Fideliopark München II, TS Jahn München, TC Unterföhring II, TeG Kirchheim
      { groupid: "1986786", leagueName: "Südliga 2 · Gr. 098", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TeG Wasserburg-Reitmehring, TV Obing, SV Forsting-Pfaffing, ATSV Kirchseeon, Polizei SV Haar, SV Schechen
      { groupid: "1986802", leagueName: "Südliga 2 · Gr. 102", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TC Fürstenfeldbruck, PSV München, 1. SC Gröbenzell, TC Puchheim II, Ausstellungspark München II, TF Fürstenfeldbruck
      { groupid: "1986799", leagueName: "Südliga 2 · Gr. 114", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TSV Zusmarshausen, SV Hainhofen, TSV Haunstetten II, TSV Königsbrunn, TeG Rothtal, SV Bergheim
      { groupid: "1986830", leagueName: "Südliga 2 · Gr. 128", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Thalkirchen München, HC Wacker München II, TC Ramersdorf, STC München Süd III, TSV Forstenried München
      { groupid: "1986841", leagueName: "Südliga 2 · Gr. 140", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // SV Planegg-Krailling, STC München Süd III, TSV Unterhaching III, TC Grün-Weiß Gräfelfing III, TSV Moosach München II, TC Ramersdorf II
      { groupid: "1986847", leagueName: "Südliga 2 · Gr. 159", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Blutenburg München, TSV Gilching, SV Lochhausen, TC Schleißheim, STC München Süd, ESV München Sportpark II, TC Eichenau II
      { groupid: "1986846", leagueName: "Südliga 2 · Gr. 160", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // GW Luitpoldpark München II, TC Raschke Taufkirchen II, MBB Ottobrunn, STC München Süd II, TSV Gilching II, TC Eichenau III
      { groupid: "1986844", leagueName: "Südliga 2 · Gr. 161", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Zorneding, SC Baldham-Vaterstetten, TC Unterföhring, TC Aschheim, TC Sport Scheck, MTTC Iphitos München II
      { groupid: "1986750", leagueName: "Südliga 3 · Gr. 058", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TSV Haar III, TC Neuperlach-Kail München, TC Riemerling, MTV 1879 München, TC Vaterstetten, ETC Siegertsbrunn II
      { groupid: "1987160", leagueName: "Bayernliga · Gr. 001 SU", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Rot-Weiß Freising, TC Schießgraben Augsburg, GW Luitpoldpark München, TC Schießgraben Augsburg II, TC Rot-Weiß Eschenried, TC Aschheim
      { groupid: "1987174", leagueName: "Landesliga 1 · Gr. 003 SU", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TSV Haar, TC Thyrnau-Kellberg, DJK-TC Büchlberg, TC Grün-Weiß Vilsbiburg, TC Raschke Taufkirchen, TC Großhesselohe
      { groupid: "1987159", leagueName: "Landesliga 2 · Gr. 004 SU", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Augsburg Siebentisch II, TC Schrobenhausen, TC Rot-Weiß Eschenried II, TC Gernlinden, TC Mering, TC Lauterbach 1973
      { groupid: "1987175", leagueName: "Landesliga 2 · Gr. 005 SU", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Gauting, TTC Bad Wörishofen, TC Grün-Weiß Gräfelfing, HC Wacker München, TC Sonthofen, TC Blutenburg München
      { groupid: "1987158", leagueName: "Landesliga 2 · Gr. 006 SU", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Rot-Weiß Freising II, TC Achental Grassau, TC Großhesselohe II, TSV Neubeuern, STK Garching, TC Harlaching München
      { groupid: "1987165", leagueName: "Landesliga 1 · Gr. 010 SU", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Raschke Taufkirchen, SV Wacker Burghausen, DJK-TC Büchlberg, Münchner Sportclub II, TC Rot-Weiß Straubing, HC Wacker München
      { groupid: "1987199", leagueName: "Landesliga 2 · Gr. 053 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TF Dachau, TC Karlsfeld am See, TC Eichenau, SpVgg Erdweg, TC Puchheim, TC Gernlinden II, TC Dasing
      { groupid: "1987209", leagueName: "Landesliga 2 · Gr. 054 SU", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TC Grün-Weiß Gräfelfing, TSV Unterhaching, TSV Siegsdorf, TC Rot-Weiß Freising, Münchner Sportclub, TC Holzkirchen, WB Fideliopark München
      { groupid: "1987200", leagueName: "Landesliga 1 · Gr. 055 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 6, gegner: true }, // TC Herrsching, TC Weilheim, TSV Schäftlarn, STC München Süd
      { groupid: "1987214", leagueName: "Landesliga 1 · Gr. 056 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 6, gegner: true }, // TC Steinhöring, SV Heimstetten, TC Unterföhring, TSV Rohrbach, FC Forstern
      { groupid: "1987211", leagueName: "Landesliga 2 · Gr. 057 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 6, gegner: true }, // TC Eichenau, TC Schrobenhausen, MTTC Iphitos München, TC Rot-Weiß Nördlingen, TC Friedberg, GW Luitpoldpark München
      { groupid: "1990374", leagueName: "Landesliga 2 · Gr. 058 SU", teamLabel: "Damen 60", mode: "damen", teamSize: 6, gegner: true }, // TSV Unterhaching, TeG Kirchheim, TC Landsberg, TC Schwalbe Ottobrunn, TC Raschke Taufkirchen, TC Grünwald
      { groupid: "1987210", leagueName: "Landesliga 1 · Gr. 059 SU", teamLabel: "Damen 65", mode: "damen", teamSize: 6, gegner: true }, // TSV Forstenried München, TSV Schäftlarn, TC Rot-Weiß Eschenried, TC Blutenburg München
      { groupid: "1987176", leagueName: "Bayernliga · Gr. 015 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // HC Wacker München, SpVgg Zolling, STK Garching, TeG Mühldorf, TC Zorneding, TSV Haar
      { groupid: "1987171", leagueName: "Landesliga 1 · Gr. 016 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // TC Reisensburg, TC Rot-Weiß Eschenried, TeG Neuburg/Donau, TC Puchheim
      { groupid: "1987169", leagueName: "Landesliga 2 · Gr. 020 SU", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // ETC Siegertsbrunn, TC Weilheim, TC Schliersee, HC Wacker München III, STC München Süd, MTV 1879 München
      { groupid: "1987184", leagueName: "Landesliga 1 · Gr. 023 SU", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Puchheim, TV Hörzhausen, SV Unterschneitbach, TC Eichenau, TCE Gröbenzell, TC TP Herrsching
      { groupid: "1987191", leagueName: "Landesliga 1 · Gr. 030 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC TP Herrsching, TV Altomünster, TSV Haunstetten, SSV Höchstädt, TC Illertissen, TSF Ludwigsfeld Neu-Ulm
      { groupid: "1987188", leagueName: "Landesliga 2 · Gr. 034 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Passau-Neustift, TC Ismaning, TC Aschheim, MTTC Iphitos München II, TSV Milbertshofen, TF Dachau II
      { groupid: "1987185", leagueName: "Landesliga 2 · Gr. 035 SU", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // STC München Süd, MTV 1879 München, TSV Unterhaching, TC Gauting, TC Topspin, TC Grün-Gold München
      { groupid: "1987195", leagueName: "Landesliga 1 · Gr. 036 SU", teamLabel: "Herren 60", mode: "herren", teamSize: 6, gegner: true }, // TC Augsburg Siebentisch, STK Garching, GW Luitpoldpark München, SVN München, TC Grün-Weiß Gräfelfing, TC Passau-Neustift, TC Neusäß
      { groupid: "1987196", leagueName: "Landesliga 2 · Gr. 038 SU", teamLabel: "Herren 60", mode: "herren", teamSize: 6, gegner: true }, // MTV 1879 München, TC Anzing, ETC Siegertsbrunn, DJK Götting, SV Planegg-Krailling
      { groupid: "1987193", leagueName: "Landesliga 1 · Gr. 039 SU", teamLabel: "Herren 65", mode: "herren", teamSize: 6, gegner: true }, // TC Bad Reichenhall, SV Prutting, TF Dachau, SVN München, TC Ohlstadt, TC Zorneding, SV Lohhof
      { groupid: "1987190", leagueName: "Landesliga 1 · Gr. 040 SU", teamLabel: "Herren 70", mode: "herren", teamSize: 6, gegner: true }, // TC Karlsfeld am See, TF Dachau, GW Luitpoldpark München, TSV Schondorf, TC St.Emmeram München
      { groupid: "1987192", leagueName: "Landesliga 1 · Gr. 041 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // TC Schießgraben Augsburg, GW Luitpoldpark München, TSV Moosach München, TC Gauting, HC Wacker München, TC Unterföhring, STC München Süd
      { groupid: "1987205", leagueName: "Landesliga 2 · Gr. 043 SU", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // TC Rot-Weiß Landshut, SV Heimstetten, TC Grün-Gold München, VfB Hallbergmoos, SV Schloßberg-Stephansk., TC Thalkirchen München, TV Dürnbach
      { groupid: "1987213", leagueName: "Bayernliga · Gr. 044 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Gauting, SV Schloßberg-Stephansk., STK Garching, TC Kempten, GW Luitpoldpark München, TC Weyarn
      { groupid: "1987201", leagueName: "Landesliga 1 · Gr. 045 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Harlaching München, MTV 1879 München, TeG Lech-Schmuttertal, TC Mering
      { groupid: "1987206", leagueName: "Landesliga 1 · Gr. 046 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TV Altötting, Polizei SV Haar, TC Erding
      { groupid: "1987212", leagueName: "Landesliga 2 · Gr. 048 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // ASV Dachau, MTTC Iphitos München, TC Olching, TC Rot-Weiß Landshut, SV Neufraunhofen
      { groupid: "1987204", leagueName: "Landesliga 2 · Gr. 049 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // SC Eibsee Grainau, TC Raschke Taufkirchen, DJK Würmtal München, TC Eichenau, ESV München Sportpark
      { groupid: "1987203", leagueName: "Landesliga 2 · Gr. 050 SU", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // ASV Glonn, TC Topspin, ETC Siegertsbrunn, TC Holzkirchen, TSV Unterhaching, TV Dürnbach
      { groupid: "1986697", leagueName: "Südliga 1 · Gr. 001", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Pfronten, TSV Haunstetten, TC Augsburg Siebentisch III, TC Kempten, FC Gundelfingen, TV Bellenberg
      { groupid: "1986703", leagueName: "Südliga 1 · Gr. 005", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Ismaning, SC Freimann, TeG Mühldorf, TC Unterföhring, TSV Feldkirchen, Polizei SV Haar
      { groupid: "1986709", leagueName: "Südliga 1 · Gr. 006", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // HC Wacker München II, TC Neuhaus, TC Bad Aibling, TSV Neubiberg-Ottobrunn, STC München Süd, TV Feldkirchen
      { groupid: "1986714", leagueName: "Südliga 1 · Gr. 008", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // Münchner Sportclub, TC Eichenau II, TC Gernlinden II, STK Garching II, TCE Gröbenzell, SV Lochhausen
      { groupid: "1986706", leagueName: "Südliga 2 · Gr. 010", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // SpVgg Rieden, TC Großaitingen, TSV Fischach, TC Mering II, TV Türkheim, TSV Haunstetten II
      { groupid: "1986704", leagueName: "Südliga 2 · Gr. 020", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Raschke Taufkirchen II, TC Rimsting, TSV 1860 Rosenheim, TV Dürnbach, SV DJK Taufkirchen, TC Topspin
      { groupid: "1986694", leagueName: "Südliga 2 · Gr. 021", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Großhesselohe III, TC Thalkirchen München, SV Söcking, TC Mittenwald, Ausstellungspark München, STC München Süd II
      { groupid: "1986721", leagueName: "Südliga 2 · Gr. 022", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Dachau 1950 II, TC Puchheim, TC Rot-Weiß Eschenried III, TF Dachau, TC Eichenau III, TC Kreuzlinger Forst II
      { groupid: "1986716", leagueName: "Südliga 2 · Gr. 023", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // Münchner Sportclub II, GW Luitpoldpark München II, ESV Spfrd.Neuaubing, TC Blau-Weiß Gräfelfing, TS Jahn München II, TeG Blumenau-Großhadern, TC Ramersdorf
      { groupid: "1986718", leagueName: "Südliga 2 · Gr. 024", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TSV Haar II, TC Sport Scheck, TS Jahn München, TSV Feldkirchen II, TF Markt Schwaben, WB Fideliopark München, STK Garching III
      { groupid: "1986732", leagueName: "Südliga 3 · Gr. 037", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TV Augsburg, TC Schwaben Augsburg, FSV Inningen, TSV Haunstetten III, DJK Augsburg-Pfersee, TC Schießgraben Augsburg V, TC Dasing II
      { groupid: "1986751", leagueName: "Südliga 3 · Gr. 051", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Achental Grassau II, SV Ostermünchen, SV Helfendorf, TC Weyarn, ASV Au, SV Schechen
      { groupid: "1986748", leagueName: "Südliga 3 · Gr. 054", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Grün-Weiß Gräfelfing II, TC Utting, DJK Würmtal München, TC Blau-Weiß Gräfelfing II, FC Hofstetten, SC Weßling
      { groupid: "1986741", leagueName: "Südliga 3 · Gr. 055", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TSV Forstenried München, ESV Spfrd.Neuaubing II, SC Pöcking-Possenhofen, FT 09 Starnberg, TC Tutzing, TC Puchheim III
      { groupid: "1986743", leagueName: "Südliga 3 · Gr. 056", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TF Fürstenfeldbruck, TCE Gröbenzell II, TC Gernlinden III, Ausstellungspark München II, TC Puchheim II, ESV München Sportpark II
      { groupid: "1986747", leagueName: "Südliga 3 · Gr. 057", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TSV Eintracht Karlsfeld, TC Karlsfeld am See, ASV Dachau, TF Dachau II, SV Lohhof, TC Dachau 1950 III
      { groupid: "1986752", leagueName: "Südliga 3 · Gr. 059", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Unterföhring II, Weißblau Allianz München, SC Freimann II, TC Schwabing, SV Studentenstadt Freimann, HC Wacker München III
      { groupid: "1986771", leagueName: "Südliga 3 · Gr. 060", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Unterföhring III, TC Cosima München, TeG Kirchheim, SC Freimann III, TC St.Emmeram München, WB Fideliopark München III
      { groupid: "1986758", leagueName: "Südliga 3 · Gr. 061", teamLabel: "Herren", mode: "herren", teamSize: 6, gegner: true }, // TC Rot-Weiß Poing, TF Markt Schwaben II, TC Ismaning II, SV Stadtwerke München, WB Fideliopark München II, TC Finsing
      { groupid: "1986759", leagueName: "Südliga 1 · Gr. 064", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // SV Gablingen, TSV Königsbrunn, TSV Haunstetten, TeG Allgäuer Tor, SpVgg Lagerlechfeld, TC Motzenhofen
      { groupid: "1986754", leagueName: "Südliga 1 · Gr. 065", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Schrobenhausen, TC Puchheim II, TC Gernlinden, TC Eichenau, TC Mammendorf, TCE Gröbenzell
      { groupid: "1986762", leagueName: "Südliga 1 · Gr. 068", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Achental Grassau, TC Raschke Taufkirchen II, TSV 1860 Rosenheim, TC Übersee, SV Seeon, TC Rot-Weiß Bad Tölz
      { groupid: "1986778", leagueName: "Südliga 2 · Gr. 085", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // STC München Süd II, ETC Siegertsbrunn II, SVN München, TC Harlaching München, HC Wacker München III, MTV 1879 München II, TC Thalkirchen München III
      { groupid: "1986782", leagueName: "Südliga 2 · Gr. 087", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // TC Unterföhring, TC Thalkirchen München II, MTV 1879 München, TC Schwabing, TSV Eintracht Karlsfeld, Weißblau Allianz München, MTTC Iphitos München II
      { groupid: "1986781", leagueName: "Südliga 2 · Gr. 089", teamLabel: "Damen", mode: "damen", teamSize: 6, gegner: true }, // SV Lohhof, SV Haimhausen II, FC Schweitenkirchen, TC Pfaffenhofen/Ilm II, TSV Hilgertshausen, FC Tandern
      { groupid: "1986872", leagueName: "Südliga 2 · Gr. 171", teamLabel: "Mixed 00", mode: "mixed", teamSize: 6, gegner: true }, // TC Rot-Weiß Eschenried, TC Waidhofen, HC Wacker München, TC Thalkirchen München, TC Olching, TC Dasing, SV Hohenzell
      { groupid: "1986867", leagueName: "Südliga 2 · Gr. 175", teamLabel: "Mixed 00", mode: "mixed", teamSize: 6, gegner: true }, // TV Feldkirchen, STC München Süd, PSV München, TC Weilheim, TC Ramersdorf, MTV Dießen, TSV Oberpframmern
      { groupid: "1986840", leagueName: "Südliga 1 · Gr. 145", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // SC Freimann, VfL Waldkraiburg, TSV Rohrbach, FC Ergolding, TSV Allershausen
      { groupid: "1986842", leagueName: "Südliga 1 · Gr. 146", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // TC Wittelsbach-Aichach, STC München Süd II, SV Lochhausen, TC Kreuzlinger Forst II, TC Herrsching
      { groupid: "1986837", leagueName: "Südliga 1 · Gr. 147", teamLabel: "Damen 30", mode: "damen", teamSize: 6, gegner: true }, // ATSV Kirchseeon, TP Isartal Baierbrunn, ETC Siegertsbrunn, SG Hausham, TC Egling
      { groupid: "1986843", leagueName: "Südliga 1 · Gr. 150", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC Pfaffenhofen/Ilm, TC Grün-Weiß Gräfelfing, TC Rot-Weiß Freising, ESV Mü Pasing, FC Schweitenkirchen
      { groupid: "1986845", leagueName: "Südliga 1 · Gr. 151", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC St.Emmeram München, SV Arget, TC Sportpark Deisenhofen, TC Ramersdorf, WB Fideliopark München, TC Riemerling
      { groupid: "1986849", leagueName: "Südliga 2 · Gr. 156", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // SV DJK Heufeld, TC Aying, ATSV Kirchseeon, TC Höhenkirchen, ETC Siegertsbrunn II, TC Weyarn II
      { groupid: "1986851", leagueName: "Südliga 2 · Gr. 158", teamLabel: "Damen 40", mode: "damen", teamSize: 6, gegner: true }, // TC TP Herrsching, TC Puchheim, TC Utting, SV Planegg-Krailling II, SV Söcking, TC Gauting II, TC Herrsching
      { groupid: "1986858", leagueName: "Südliga 1 · Gr. 163", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // TSV Eintracht Karlsfeld, SV Petershausen, TC Ismaning, TF Dachau II, TC Blau-Weiß Neufahrn
      { groupid: "1986866", leagueName: "Südliga 1 · Gr. 166", teamLabel: "Damen 50", mode: "damen", teamSize: 6, gegner: true }, // GW Luitpoldpark München II, TC Grün-Weiß Gräfelfing II, ESV Mü Pasing, TC Harlaching München, TC Riemerling II
      { groupid: "1986785", leagueName: "Südliga 1 · Gr. 094", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // SC Freimann, TC Unterföhring, TC Rottach-Egern, TC Holzkirchen, TC Schliersee II
      { groupid: "1986810", leagueName: "Südliga 2 · Gr. 099", teamLabel: "Herren 30", mode: "herren", teamSize: 6, gegner: true }, // WSV Samerberg, ETC Siegertsbrunn II, TC Oberhaching, STC München Süd II, Post -Telekom-SV Rosenheim, SV Helfendorf
      { groupid: "1986795", leagueName: "Südliga 1 · Gr. 108", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Puchheim II, STC München Süd II, TC Herrsching, TC Kreuzlinger Forst II, TC Großhesselohe II, TC Berg, TC Sportpark Deisenhofen
      { groupid: "1986804", leagueName: "Südliga 1 · Gr. 109", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // Polizei SV Haar, TC Ottobrunn, TC Zorneding, TSV Unterhaching, TSV Haar, TC Raschke Taufkirchen
      { groupid: "1986809", leagueName: "Südliga 1 · Gr. 110", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // SV Lohhof, SC Baldham-Vaterstetten, TSV Feldkirchen, TF Markt Schwaben, TSV Haar II, WB Fideliopark München
      { groupid: "1986813", leagueName: "Südliga 2 · Gr. 120", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TSV Oberpframmern, TC Schwalbe Ottobrunn, TC Holzkirchen, TC Ottobrunn II, TC Weyarn, TV Feldkirchen
      { groupid: "1986817", leagueName: "Südliga 2 · Gr. 123", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Rot-Weiß Eschenried, TC Gernlinden, TC Lauterbach 1973, TC Eichenau II, TC Karlsfeld am See, TG Germerswang
      { groupid: "1986828", leagueName: "Südliga 2 · Gr. 124", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // FC Ampertal Unterbruck, TC Schleißheim, SV Petershausen, STK Garching, TSV Hilgertshausen, VfB Hallbergmoos
      { groupid: "1986829", leagueName: "Südliga 2 · Gr. 125", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // SV Walpertskirchen, STK Garching II, TeG Kirchheim, WB Fideliopark München II, TC Ismaning, TS Jahn München II
      { groupid: "1986818", leagueName: "Südliga 2 · Gr. 126", teamLabel: "Herren 40", mode: "herren", teamSize: 6, gegner: true }, // TC Harlaching München, Weißblau Allianz München, Münchner Sportclub II, TS Jahn München, TC Schwabing, TC St.Emmeram München
      { groupid: "1986825", leagueName: "Südliga 1 · Gr. 131", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Unterföhring, VfL Waldkraiburg, TV Altötting, Polizei SV Haar, TC Seeschneid, TC Neukeferloh
      { groupid: "1986824", leagueName: "Südliga 1 · Gr. 134", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Olching, SV Lohhof, SV Lochhausen, TC Eichenau, 1. SC Gröbenzell II, TC Gernlinden II
      { groupid: "1986836", leagueName: "Südliga 2 · Gr. 139", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Großhesselohe, TSV Unterhaching II, STC München Süd II, TSV Forstenried München, TeG Blumenau-Großhadern II, MTV 1879 München II
      { groupid: "1986832", leagueName: "Südliga 2 · Gr. 142", teamLabel: "Herren 50", mode: "herren", teamSize: 6, gegner: true }, // TC Ismaning II, TSV Eintracht Karlsfeld, Weißblau Allianz München, WB Fideliopark München, TeG Kirchheim
      { groupid: "1986839", leagueName: "Südliga 1 · Gr. 144", teamLabel: "Herren 60", mode: "herren", teamSize: 6, gegner: true }, // SV Seeon, TC Gauting, TC Rimsting, TSV Pähl, TC Höhenkirchen
      // DISCOVER:winter-2425
    ],
  },
];

export function seasonById(id) {
  const s = SEASONS.find((x) => x.id === id);
  if (!s) {
    throw new Error(`Unbekannte Saison "${id}". Bekannt: ${SEASONS.map((x) => x.id).join(", ")}`);
  }
  return s;
}

/** Cache-Datei des Spielbericht-Crawls — je Saison eine eigene, damit ein
 *  Winter-Crawl die Sommer-Berichte nicht überschreibt. */
export function cacheFile(season) {
  return path.join(ROOT, `scripts/.spielberichte-cache-${season.id}.json`);
}

/** Cache-Datei des Meldelisten-Crawls, ebenfalls je Saison. */
export function rosterCacheFile(season) {
  return path.join(ROOT, `scripts/.meldelisten-cache-${season.id}.json`);
}

export function readFileIfExists(rel) {
  if (!rel) return null;
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

/** Alle Spieltermine einer Saison aus ihrer Datendatei (nur die Daten, nach
 *  Datum sortiert). Reicht, um den Zeitraum der Saison zu bestimmen.
 *  Saisons ohne Datendatei (nur Historie) haben keine Termine. */
export function seasonDates(season) {
  const src = readFileIfExists(season.matchesFile);
  if (!src) return [];
  return [...src.matchAll(/date:\s*"(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]).sort();
}

/** Zeitraum einer Saison: erster und letzter eingetragener Spieltag. */
export function seasonWindow(season) {
  const dates = seasonDates(season);
  if (!dates.length) return null;
  return { from: dates[0], to: dates[dates.length - 1], count: dates.length };
}

function todayStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Welche Saison ist gerade dran?
 *
 *  1. Läuft eine Saison (heute liegt zwischen erstem und letztem Spieltag) → die.
 *     Bei Überlappung gewinnt die, die früher endet (sie ist eher fertig).
 *  2. Sonst die Saison, die als nächstes beginnt — ab 60 Tagen vor dem ersten
 *     Spieltag, damit Terminverlegungen vor dem Start schon gezogen werden.
 *  3. Sonst die zuletzt beendete (Nachlese nach Rundenende).
 *
 * Saisons ohne Termine (nur Historie) kommen nie automatisch dran — nur per
 * `--season <id>`.
 *
 * Rückgabe: { season, reason, window, today }
 */
export function detectSeason(today = todayStr()) {
  const known = SEASONS.map((s) => ({ season: s, window: seasonWindow(s) })).filter((x) => x.window);
  if (!known.length) throw new Error("Keine Saison mit Spielterminen gefunden.");

  const days = (a, b) => Math.round((new Date(a) - new Date(b)) / 86400000);

  const running = known
    .filter((x) => x.window.from <= today && today <= x.window.to)
    .sort((a, b) => a.window.to.localeCompare(b.window.to));
  const upcoming = known
    .filter((x) => x.window.from > today)
    .sort((a, b) => a.window.from.localeCompare(b.window.from));
  const finished = known
    .filter((x) => x.window.to < today)
    .sort((a, b) => b.window.to.localeCompare(a.window.to));

  // Im Übergang zwischen zwei Runden ist die Wahl nicht eindeutig: die alte
  // Saison braucht vielleicht noch eine Nachlese, die neue liegt schon vor.
  // Dann wird die zweite Kandidatin mitgemeldet, statt sie zu verschweigen.
  const hint = (chosen) => {
    const other = [...running, ...upcoming, ...finished].find((x) => x.season.id !== chosen.season.id);
    if (!other) return null;
    if (other.window.to < today && days(today, other.window.to) <= 45) {
      return `${other.season.label} endete vor ${days(today, other.window.to)} Tagen — Nachlese mit --season ${other.season.id}`;
    }
    if (other.window.from > today && days(other.window.from, today) <= 45) {
      return `${other.season.label} startet in ${days(other.window.from, today)} Tagen — mit --season ${other.season.id}`;
    }
    return null;
  };

  let chosen;
  if (running.length) {
    chosen = { ...running[0], reason: "läuft gerade", today };
  } else if (upcoming.length && days(upcoming[0].window.from, today) <= 60) {
    chosen = { ...upcoming[0], reason: `startet in ${days(upcoming[0].window.from, today)} Tagen`, today };
  } else if (finished.length) {
    chosen = { ...finished[0], reason: `endete vor ${days(today, finished[0].window.to)} Tagen`, today };
  } else {
    chosen = { ...upcoming[0], reason: "nächste Saison (Start liegt weiter weg)", today };
  }
  return { ...chosen, alsoRelevant: hint(chosen) };
}

/**
 * Saison für einen Skriptlauf bestimmen: `--season <id>` schlägt die
 * automatische Erkennung. `--season list` zeigt alle bekannten Saisons.
 */
export function resolveSeason(argv = process.argv.slice(2)) {
  const i = argv.indexOf("--season");
  if (i >= 0 && argv[i + 1] && argv[i + 1] !== "auto") {
    const season = seasonById(argv[i + 1]);
    return { season, window: seasonWindow(season), reason: "per --season gewählt", today: todayStr() };
  }
  return detectSeason();
}

/** Einzeiler fürs Log, damit in jedem Skriptlauf sichtbar ist, worauf er wirkt. */
export function describe(res) {
  const w = res.window;
  const range = w ? `${w.from} – ${w.to}, ${w.count} Begegnungen` : (res.season.historyOnly ? "nur Historie, keine Termine" : "keine Termine");
  let s = `Saison: ${res.season.label} (${res.season.id}) — ${res.reason}; ${range}`;
  if (res.alsoRelevant) s += `\n        Hinweis: ${res.alsoRelevant}`;
  return s;
}

// Direktaufruf: Übersicht aller Saisons und der aktiven.
if (import.meta.url === `file://${process.argv[1]}`) {
  const active = resolveSeason();
  console.log("Bekannte Saisons:\n");
  for (const s of SEASONS) {
    const w = seasonWindow(s);
    const mark = s.id === active.season.id ? "→" : " ";
    const range = w ? `${w.from} – ${w.to}  (${String(w.count).padStart(3)} Begegnungen)` : (s.historyOnly ? "(nur Historie)                     " : "(keine Termine)                    ");
    console.log(`${mark} ${s.id.padEnd(13)} ${s.label.padEnd(16)} ${range}  ${s.groups.length} Gruppen, Layout ${s.layout}`);
  }
  console.log(`\n${describe(active)}`);
}
