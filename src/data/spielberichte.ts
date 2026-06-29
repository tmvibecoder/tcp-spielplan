import type { IndividualMatch } from "../types";
import type { Spielbericht } from "../utils/spielbericht";

// Spielberichte (Einzel/Doppel je Begegnung) je Liga — ECHTE nuLiga-Daten.
// Quelle: BTV nuLiga "MeetingReportFOP" je Begegnung (…/nuDokument?dokument=MeetingReportFOP&meeting=<ID>).
// Auto-generiert aus den Spielbericht-PDFs (Stand 28.06.2026). Doppel ohne LK, da nuLiga sie dort nicht ausweist.
// Lookup ist richtungsunabhängig: eine Begegnung erscheint in zwei Kreuztabellen-Zellen.

function key(league: string, homeClub: string, awayClub: string): string {
  return `${league}::${homeClub}::${awayClub}`;
}

function m(
  id: string,
  position: number,
  type: "singles" | "doubles",
  home: string,
  away: string,
  sets: Array<[number, number]>,
  winner: "home" | "away",
): IndividualMatch {
  return {
    id,
    match_score_id: id.split("-")[0],
    position,
    match_type: type,
    home_player: home,
    away_player: away,
    set1_home: sets[0]?.[0] ?? null,
    set1_away: sets[0]?.[1] ?? null,
    set2_home: sets[1]?.[0] ?? null,
    set2_away: sets[1]?.[1] ?? null,
    set3_home: sets[2]?.[0] ?? null,
    set3_away: sets[2]?.[1] ?? null,
    winner,
  };
}

// Polizei SV Haar 3:6 TF Markt Schwaben — echte nuLiga-Daten (meeting 12686331)
const SB_12686331: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "Polizei SV Haar",
  awayClub: "TF Markt Schwaben",
  date: "2026-06-14",
  day: "So",
  finalHome: 3,
  finalAway: 6,
  matches: [
    m("12686331-e1", 1, "singles", "Bobinger, Benno (5, LK10,7)", "Simml, Marco (1, LK5,8)", [[3, 6], [0, 6]], "away"),
    m("12686331-e2", 2, "singles", "Henning, Ralf (9, LK11,8)", "Lohmaier, Lukas (3, LK8,0)", [[0, 6], [2, 6]], "away"),
    m("12686331-e3", 3, "singles", "Armbrüster, Christian (14, LK13,6)", "Nahrhaft, Lukas (6, LK9,3)", [[2, 6], [5, 7]], "away"),
    m("12686331-e4", 4, "singles", "Zelonka, Matus (19, LK15,5)", "Warta, Roland (7, LK9,9)", [[7, 6], [6, 4]], "home"),
    m("12686331-e5", 5, "singles", "Bingold, Konstantin (27, LK18,0)", "Schwarz, Constantin (9, LK10,7)", [[6, 4], [7, 6]], "home"),
    m("12686331-e6", 6, "singles", "Doerr, Constantin (28, LK18,8)", "Handl, Ralph (10, LK12,1)", [[1, 6], [0, 6]], "away"),
    m("12686331-d1", 7, "doubles", "Terlinde, Christoph / Zelonka, Matus", "Simml, Marco / Warta, Roland", [[0, 6], [3, 6]], "away"),
    m("12686331-d2", 8, "doubles", "Bobinger, Benno / Armbrüster, Christian", "Lohmaier, Lukas / Handl, Ralph", [[6, 1], [6, 4]], "home"),
    m("12686331-d3", 9, "doubles", "Henning, Ralf / Bingold, Konstantin", "Nahrhaft, Lukas / Schwarz, Constantin", [[4, 6], [2, 6]], "away"),
  ],
};

// TSV Feldkirchen II 9:0 TC Pliening — echte nuLiga-Daten (meeting 12686332)
const SB_12686332: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "TSV Feldkirchen II",
  awayClub: "TC Pliening",
  date: "2026-05-10",
  day: "So",
  finalHome: 9,
  finalAway: 0,
  matches: [
    m("12686332-e1", 1, "singles", "El-Wafi, Sofian (11, LK8,2)", "Kerger, Justus (15, LK12,7)", [[6, 3], [6, 2]], "home"),
    m("12686332-e2", 2, "singles", "Hargasser, Niclas (14, LK8,7)", "Volkwein, Samuel (16, LK13,3)", [[6, 0], [6, 1]], "home"),
    m("12686332-e3", 3, "singles", "Schumacher, Tobias (15, LK8,8)", "Miler, Thomas (18, LK14,3)", [[6, 1], [6, 3]], "home"),
    m("12686332-e4", 4, "singles", "Fauth, Felix (18, LK9,9)", "Hempel, Frederick (25, LK19,7)", [[6, 1], [6, 2]], "home"),
    m("12686332-e5", 5, "singles", "Kellerer, Felix (22, LK11,6)", "Davis, Louis (28, LK21,8)", [[6, 0], [6, 1]], "home"),
    m("12686332-e6", 6, "singles", "Baade, Sebastian (24, LK11,9)", "Mittwollen, Tjark (32, LK22,3)", [[6, 0], [6, 0]], "home"),
    m("12686332-d1", 7, "doubles", "El-Wafi, Sofian / Hargasser, Niclas", "Kerger, Justus / Volkwein, Samuel", [[4, 6], [6, 2], [10, 6]], "home"),
    m("12686332-d2", 8, "doubles", "Schumacher, Tobias / Fauth, Felix", "Miler, Thomas / Davis, Louis", [[6, 2], [6, 0]], "home"),
    m("12686332-d3", 9, "doubles", "Kellerer, Felix / Baade, Sebastian", "Hempel, Frederick / Mittwollen, Tjark", [[6, 1], [6, 0]], "home"),
  ],
};

// TC Aschheim III 8:1 TC Unterföhring II — echte nuLiga-Daten (meeting 12686339)
const SB_12686339: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "TC Aschheim III",
  awayClub: "TC Unterföhring II",
  date: "2026-05-17",
  day: "So",
  finalHome: 8,
  finalAway: 1,
  matches: [
    m("12686339-e1", 1, "singles", "Hajcik, Maximilian (22, LK6,2)", "Mayrhofer, Jonas (14, LK9,7)", [[6, 2], [7, 5]], "home"),
    m("12686339-e2", 2, "singles", "Faschang, Michael (23, LK7,2)", "Schweykart, Julius (15, LK10,0)", [[6, 4], [6, 4]], "home"),
    m("12686339-e3", 3, "singles", "Steidle, Raphael (24, LK8,6)", "Djordjevic, Noah (24, LK12,4)", [[6, 1], [6, 0]], "home"),
    m("12686339-e4", 4, "singles", "Fausch, Yannik (26, LK10,4)", "Hafner, Daniel Jan (28, LK13,2)", [[6, 1], [6, 2]], "home"),
    m("12686339-e5", 5, "singles", "Fischer, Maddox (28, LK10,8)", "Faghihzadeh, Peyman (45, LK17,3)", [[6, 0], [6, 0]], "home"),
    m("12686339-e6", 6, "singles", "Kannewurf, Nils (31, LK13,1)", "Sabieraj, Martin (61, LK20,4)", [[6, 1], [6, 0]], "home"),
    m("12686339-d1", 7, "doubles", "Hajcik, Maximilian / Fausch, Quirin", "Mayrhofer, Jonas / Schweykart, Julius", [[1, 6], [1, 6]], "away"),
    m("12686339-d2", 8, "doubles", "Steidle, Raphael / Kannewurf, Nils", "Djordjevic, Noah / Faghihzadeh, Peyman", [[6, 2], [6, 0]], "home"),
    m("12686339-d3", 9, "doubles", "Fausch, Yannik / Fischer, Maddox", "Hafner, Daniel Jan / Sabieraj, Martin", [[6, 0], [6, 0]], "home"),
  ],
};

// TC Aschheim III 5:4 TC Finsing — echte nuLiga-Daten (meeting 12686344)
const SB_12686344: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "TC Aschheim III",
  awayClub: "TC Finsing",
  date: "2026-06-14",
  day: "So",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12686344-e1", 1, "singles", "Baltz, Stefan (14, LK2,8)", "Keller, Florian (1, LK4,2)", [[6, 1], [4, 6], [10, 7]], "home"),
    m("12686344-e2", 2, "singles", "Popescu, Marc (15, LK3,8)", "Keller, Marco (2, LK5,6)", [[6, 1], [6, 0]], "home"),
    m("12686344-e3", 3, "singles", "Faschang, Michael (23, LK7,2)", "Malik, Daniel (3, LK8,9)", [[2, 6], [6, 7]], "away"),
    m("12686344-e4", 4, "singles", "Steidle, Raphael (24, LK8,6)", "Ioan, Niklas (4, LK12,4)", [[6, 2], [6, 0]], "home"),
    m("12686344-e5", 5, "singles", "Fausch, Yannik (26, LK10,4)", "Keller, Timo (6, LK14,3)", [[0, 1]], "away"),
    m("12686344-e6", 6, "singles", "Gaißert, Till (30, LK12,9)", "Bunk, Michael (9, LK15,9)", [[6, 1], [6, 1]], "home"),
    m("12686344-d1", 7, "doubles", "Baltz, Stefan / Popescu, Marc", "Keller, Marco / Keller, Timo", [[7, 5], [6, 0]], "home"),
    m("12686344-d2", 8, "doubles", "Faschang, Michael / Steidle, Raphael", "Keller, Florian / Bunk, Michael", [[4, 6], [1, 6]], "away"),
    m("12686344-d3", 9, "doubles", "Gaißert, Till / Brandt, Philip", "Malik, Daniel / Ioan, Niklas", [[3, 6], [4, 6]], "away"),
  ],
};

// TSV Feldkirchen II 9:0 TC Finsing — echte nuLiga-Daten (meeting 12686362)
const SB_12686362: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "TSV Feldkirchen II",
  awayClub: "TC Finsing",
  date: "2026-05-17",
  day: "So",
  finalHome: 9,
  finalAway: 0,
  matches: [
    m("12686362-e1", 1, "singles", "El-Wafi, Sofian (11, LK8,2)", "Keller, Florian (1, LK4,2)", [[6, 7], [6, 3], [10, 7]], "home"),
    m("12686362-e2", 2, "singles", "Hargasser, Niclas (14, LK8,7)", "Malik, Daniel (3, LK8,9)", [[6, 2], [4, 6], [10, 3]], "home"),
    m("12686362-e3", 3, "singles", "Schumacher, Tobias (15, LK8,8)", "Ioan, Niklas (4, LK12,4)", [[6, 1], [6, 3]], "home"),
    m("12686362-e4", 4, "singles", "Fauth, Felix (18, LK9,9)", "Kawulok, Viktor (5, LK13,1)", [[7, 6], [6, 1]], "home"),
    m("12686362-e5", 5, "singles", "Kellerer, Felix (22, LK11,6)", "Keller, Timo (6, LK14,3)", [[6, 3], [6, 3]], "home"),
    m("12686362-e6", 6, "singles", "Baade, Sebastian (24, LK11,9)", "Huber, Jonas (7, LK15,1)", [[6, 0], [6, 2]], "home"),
    m("12686362-d1", 7, "doubles", "El-Wafi, Sofian / Schumacher, Tobias", "Keller, Florian / Keller, Timo", [[0, 6], [7, 6], [10, 7]], "home"),
    m("12686362-d2", 8, "doubles", "Fauth, Felix / Baade, Sebastian", "Malik, Daniel / Kawulok, Viktor", [[6, 2], [6, 2]], "home"),
    m("12686362-d3", 9, "doubles", "Kellerer, Felix / Geuer, Felix", "Ioan, Niklas / Bunk, Michael", [[6, 2], [6, 2]], "home"),
  ],
};

// TC Erding II 0:9 TC Pliening — echte nuLiga-Daten (meeting 12686367)
const SB_12686367: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "TC Erding II",
  awayClub: "TC Pliening",
  date: "2026-06-14",
  day: "So",
  finalHome: 0,
  finalAway: 9,
  matches: [
    m("12686367-e1", 1, "singles", "Lachner, Zeno (14, LK10,5)", "Krug, Max (9, LK8,8)", [[7, 5], [1, 6], [6, 10]], "away"),
    m("12686367-e2", 2, "singles", "Widmann, Valentin (17, LK11,8)", "Slepchenko, Vitaliy (13, LK12,2)", [[5, 7], [0, 6]], "away"),
    m("12686367-e3", 3, "singles", "Müller, Maximilian (27, LK15,7)", "Kerger, Justus (15, LK12,7)", [[0, 6], [0, 6]], "away"),
    m("12686367-e4", 4, "singles", "Lübbe, Raphael (28, LK16,8)", "Volkwein, Samuel (16, LK13,3)", [[1, 6], [3, 6]], "away"),
    m("12686367-e5", 5, "singles", "Widmann, Benedikt (31, LK17,7)", "Anetzberger, Martin (17, LK14,0)", [[2, 6], [1, 6]], "away"),
    m("12686367-e6", 6, "singles", "Neupärtl, Ferdinand (35, LK19,1)", "Davis, Louis (28, LK21,8)", [[0, 6], [4, 6]], "away"),
    m("12686367-d1", 7, "doubles", "Lachner, Zeno / Müller, Maximilian", "Krug, Max / Kerger, Justus", [[6, 4], [0, 6], [2, 10]], "away"),
    m("12686367-d2", 8, "doubles", "Widmann, Valentin / Lübbe, Raphael", "Slepchenko, Vitaliy / Volkwein, Samuel", [[3, 6], [1, 6]], "away"),
    m("12686367-d3", 9, "doubles", "Widmann, Benedikt / Neupärtl, Ferdinand", "Anetzberger, Martin / Davis, Louis", [[0, 6], [3, 6]], "away"),
  ],
};

// TF Markt Schwaben 7:2 TC Unterföhring II — echte nuLiga-Daten (meeting 12686404)
const SB_12686404: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "TF Markt Schwaben",
  awayClub: "TC Unterföhring II",
  date: "2026-05-10",
  day: "So",
  finalHome: 7,
  finalAway: 2,
  matches: [
    m("12686404-e1", 1, "singles", "Huber, Andreas (2, LK7,9)", "Srednoselec, Tino (12, LK9,5)", [[6, 4], [6, 3]], "home"),
    m("12686404-e2", 2, "singles", "Lohmaier, Lukas (3, LK8,0)", "Teichmann, Luis (13, LK9,7)", [[6, 2], [6, 2]], "home"),
    m("12686404-e3", 3, "singles", "Camerzan, Flavio (4, LK8,2)", "Mayrhofer, Jonas (14, LK9,7)", [[3, 6], [1, 6]], "away"),
    m("12686404-e4", 4, "singles", "Widmann, Vitus (5, LK9,1)", "Schweykart, Julius (15, LK10,0)", [[6, 2], [6, 1]], "home"),
    m("12686404-e5", 5, "singles", "Nahrhaft, Lukas (6, LK9,3)", "Maier, Kilian (20, LK10,8)", [[3, 6], [2, 6]], "away"),
    m("12686404-e6", 6, "singles", "Warta, Roland (7, LK9,9)", "Djordjevic, Noah (24, LK12,4)", [[6, 4], [6, 2]], "home"),
    m("12686404-d1", 7, "doubles", "Simml, Marco / Malterer, Felix", "Teichmann, Luis / Mayrhofer, Jonas", [[6, 4], [6, 1]], "home"),
    m("12686404-d2", 8, "doubles", "Camerzan, Flavio / Nahrhaft, Lukas", "Srednoselec, Tino / Djordjevic, Noah", [[7, 6], [6, 2]], "home"),
    m("12686404-d3", 9, "doubles", "Huber, Andreas / Warta, Roland", "Schweykart, Julius / Maier, Kilian", [[6, 3], [6, 2]], "home"),
  ],
};

// TC Pliening 8:1 Polizei SV Haar — echte nuLiga-Daten (meeting 12686409)
const SB_12686409: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "TC Pliening",
  awayClub: "Polizei SV Haar",
  date: "2026-05-17",
  day: "So",
  finalHome: 8,
  finalAway: 1,
  matches: [
    m("12686409-e1", 1, "singles", "Hauser, Michael (2, LK3,2)", "Ullrich, Matthias (7, LK11,4)", [[6, 0], [6, 1]], "home"),
    m("12686409-e2", 2, "singles", "Bosch, Simon (5, LK5,4)", "Michler, Vincent (18, LK15,4)", [[6, 0], [6, 1]], "home"),
    m("12686409-e3", 3, "singles", "Krug, Max (9, LK8,8)", "Zelonka, Matus (19, LK15,5)", [[6, 1], [6, 0]], "home"),
    m("12686409-e4", 4, "singles", "Gartner, Christoph (14, LK12,7)", "Erath, Andreas (22, LK17,4)", [[6, 1], [6, 2]], "home"),
    m("12686409-e5", 5, "singles", "Volkwein, Samuel (16, LK13,3)", "Mülfarth, Noah (33, LK19,5)", [[6, 0], [6, 0]], "home"),
    m("12686409-e6", 6, "singles", "Anetzberger, Martin (17, LK14,0)", "Stenger, Moritz (37, LK20,9)", [[6, 3], [6, 1]], "home"),
    m("12686409-d1", 7, "doubles", "Hauser, Michael / Volkwein, Samuel", "Ullrich, Matthias / Erath, Andreas", [[6, 1], [6, 1]], "home"),
    m("12686409-d2", 8, "doubles", "Krug, Max / Gartner, Christoph", "Zelonka, Matus / Mülfarth, Noah", [[6, 0], [6, 0]], "home"),
    m("12686409-d3", 9, "doubles", "Anetzberger, Martin / Forchhammer, Sebastian", "Michler, Vincent / Stenger, Moritz", [[4, 6], [6, 2], [5, 10]], "away"),
  ],
};

// Polizei SV Haar 1:8 TC Aschheim III — echte nuLiga-Daten (meeting 12686412)
const SB_12686412: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "Polizei SV Haar",
  awayClub: "TC Aschheim III",
  date: "2026-05-10",
  day: "So",
  finalHome: 1,
  finalAway: 8,
  matches: [
    m("12686412-e1", 1, "singles", "Bobinger, Benno (5, LK10,7)", "Hajcik, Maximilian (22, LK6,2)", [[0, 6], [1, 6]], "away"),
    m("12686412-e2", 2, "singles", "Ullrich, Matthias (7, LK11,4)", "Steidle, Raphael (24, LK8,6)", [[2, 6], [2, 6]], "away"),
    m("12686412-e3", 3, "singles", "Armbrüster, Christian (14, LK13,6)", "Fausch, Yannik (26, LK10,4)", [[5, 7], [5, 7]], "away"),
    m("12686412-e4", 4, "singles", "Zelonka, Matus (19, LK15,5)", "Fischer, Maddox (28, LK10,8)", [[0, 6], [4, 6]], "away"),
    m("12686412-e5", 5, "singles", "Erath, Andreas (22, LK17,4)", "Kannewurf, Nils (31, LK13,1)", [[5, 7], [3, 6]], "away"),
    m("12686412-e6", 6, "singles", "Cayé, Lucas (31, LK19,4)", "Brandt, Philip (37, LK16,2)", [[7, 6], [3, 6], [5, 10]], "away"),
    m("12686412-d1", 7, "doubles", "Bobinger, Benno / Jessen, Frederik", "Hajcik, Maximilian / Fischer, Maddox", [[1, 6], [5, 2]], "away"),
    m("12686412-d2", 8, "doubles", "Ullrich, Matthias / Armbrüster, Christian", "Steidle, Raphael / Fausch, Yannik", [[0, 6], [6, 1], [8, 10]], "away"),
    m("12686412-d3", 9, "doubles", "Zelonka, Matus / Cayé, Lucas", "Kannewurf, Nils / Brandt, Philip", [[6, 3], [2, 6], [11, 9]], "home"),
  ],
};

// TF Markt Schwaben 7:2 TC Erding II — echte nuLiga-Daten (meeting 12686481)
const SB_12686481: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "TF Markt Schwaben",
  awayClub: "TC Erding II",
  date: "2026-05-17",
  day: "So",
  finalHome: 7,
  finalAway: 2,
  matches: [
    m("12686481-e1", 1, "singles", "Huber, Andreas (2, LK7,9)", "Widmann, Maximilian (7, LK8,5)", [[6, 2], [4, 6], [10, 7]], "home"),
    m("12686481-e2", 2, "singles", "Lohmaier, Lukas (3, LK8,0)", "Hildenbrand, Maximilian (20, LK12,7)", [[6, 0], [6, 2]], "home"),
    m("12686481-e3", 3, "singles", "Camerzan, Flavio (4, LK8,2)", "Brayer, Thomas (21, LK13,0)", [[3, 6], [6, 3], [8, 10]], "away"),
    m("12686481-e4", 4, "singles", "Nahrhaft, Lukas (6, LK9,3)", "Lübbe, Raphael (28, LK16,8)", [[6, 3], [6, 0]], "home"),
    m("12686481-e5", 5, "singles", "Warta, Roland (7, LK9,9)", "Hager, Maximilian (33, LK18,7)", [[6, 2], [6, 0]], "home"),
    m("12686481-e6", 6, "singles", "Malterer, Felix (14, LK13,7)", "Huber, Michael (45, LK21,2)", [[6, 2], [6, 0]], "home"),
    m("12686481-d1", 7, "doubles", "Huber, Andreas / Warta, Roland", "Widmann, Maximilian / Hildenbrand, Maximilian", [[4, 6], [3, 6]], "away"),
    m("12686481-d2", 8, "doubles", "Camerzan, Flavio / Nahrhaft, Lukas", "Brayer, Thomas / Huber, Michael", [[6, 0], [6, 0]], "home"),
    m("12686481-d3", 9, "doubles", "Lohmaier, Lukas / Malterer, Felix", "Lübbe, Raphael / Hager, Maximilian", [[6, 1], [6, 2]], "home"),
  ],
};

// TC Finsing 7:2 TC Erding II — echte nuLiga-Daten (meeting 12686499)
const SB_12686499: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "TC Finsing",
  awayClub: "TC Erding II",
  date: "2026-05-10",
  day: "So",
  finalHome: 7,
  finalAway: 2,
  matches: [
    m("12686499-e1", 1, "singles", "Keller, Florian (1, LK4,2)", "Hildenbrand, Maximilian (20, LK12,7)", [[6, 1], [6, 0]], "home"),
    m("12686499-e2", 2, "singles", "Keller, Marco (2, LK5,6)", "Brayer, Thomas (21, LK13,0)", [[6, 1], [6, 1]], "home"),
    m("12686499-e3", 3, "singles", "Malik, Daniel (3, LK8,9)", "Lübbe, Raphael (28, LK16,8)", [[6, 2], [6, 1]], "home"),
    m("12686499-e4", 4, "singles", "Kawulok, Viktor (5, LK13,1)", "Müller, Michael (32, LK17,7)", [[6, 1], [6, 1]], "home"),
    m("12686499-e5", 5, "singles", "Keller, Timo (6, LK14,3)", "Braun, Julian (42, LK21,1)", [[6, 2], [6, 3]], "home"),
    m("12686499-e6", 6, "singles", "Huber, Jonas (7, LK15,1)", "Neundorf, Dominik (46, LK21,6)", [[6, 0], [6, 1]], "home"),
    m("12686499-d1", 7, "doubles", "Kawulok, Viktor / Keller, Timo", "Hildenbrand, Maximilian / Brayer, Thomas", [[5, 7], [6, 4], [8, 10]], "away"),
    m("12686499-d2", 8, "doubles", "Keller, Florian / Töpfer, Daniel", "Müller, Michael / Braun, Julian", [[7, 6], [4, 6], [6, 10]], "away"),
    m("12686499-d3", 9, "doubles", "Malik, Daniel / Huber, Jonas", "Huber, Michael / Neundorf, Dominik", [[6, 0], [6, 0]], "home"),
  ],
};

// TC Unterföhring II 1:8 TSV Feldkirchen II — echte nuLiga-Daten (meeting 12686506)
const SB_12686506: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "TC Unterföhring II",
  awayClub: "TSV Feldkirchen II",
  date: "2026-06-14",
  day: "So",
  finalHome: 1,
  finalAway: 8,
  matches: [
    m("12686506-e1", 1, "singles", "Teichmann, Luis (13, LK9,7)", "El-Wafi, Sofian (11, LK8,2)", [[2, 6], [6, 7]], "away"),
    m("12686506-e2", 2, "singles", "Mayrhofer, Jonas (14, LK9,7)", "Hargasser, Niclas (14, LK8,7)", [[2, 6], [0, 6]], "away"),
    m("12686506-e3", 3, "singles", "Schweykart, Julius (15, LK10,0)", "Schumacher, Tobias (15, LK8,8)", [[1, 6], [3, 6]], "away"),
    m("12686506-e4", 4, "singles", "Maier, Kilian (20, LK10,8)", "Fauth, Felix (18, LK9,9)", [[2, 6], [2, 6]], "away"),
    m("12686506-e5", 5, "singles", "Djordjevic, Noah (24, LK12,4)", "Kellerer, Felix (22, LK11,6)", [[2, 6], [3, 6]], "away"),
    m("12686506-e6", 6, "singles", "Hafner, Daniel Jan (28, LK13,2)", "Geuer, Felix (27, LK12,6)", [[2, 6], [1, 6]], "away"),
    m("12686506-d1", 7, "doubles", "Teichmann, Luis / Mayrhofer, Jonas", "El-Wafi, Sofian / Hargasser, Niclas", [[6, 4], [6, 4]], "home"),
    m("12686506-d2", 8, "doubles", "Schweykart, Julius / Maier, Kilian", "Schumacher, Tobias / Kellerer, Felix", [[1, 6], [2, 6]], "away"),
    m("12686506-d3", 9, "doubles", "Djordjevic, Noah / Hafner, Daniel Jan", "Fauth, Felix / Geuer, Felix", [[2, 6], [0, 6]], "away"),
  ],
};

// TC Pliening 6:0 TC Putzbrunn — echte nuLiga-Daten (meeting 12692665)
const SB_12692665: Spielbericht = {
  league: "Südliga 4 (4er) · Gr. 292",
  homeClub: "TC Pliening",
  awayClub: "TC Putzbrunn",
  date: "2026-06-13",
  day: "Sa",
  finalHome: 6,
  finalAway: 0,
  matches: [
    m("12692665-e1", 1, "singles", "Miler, Thomas (10, LK14,3)", "Schnurr, Matthias (4, LK20,4)", [[6, 1], [6, 1]], "home"),
    m("12692665-e2", 2, "singles", "Widl, Alexander (20, LK19,8)", "Sturm, Kevin (5, LK20,7)", [[6, 3], [6, 0]], "home"),
    m("12692665-e3", 3, "singles", "Bauer, Maximilian (27, LK22,1)", "Frey, Michael (9, LK23,2)", [[7, 5], [6, 1]], "home"),
    m("12692665-e4", 4, "singles", "Merkl, Julian (34, LK25,0)", "Johannes, Maximilian (10, LK23,4)", [[6, 3], [1, 6], [10, 5]], "home"),
    m("12692665-d1", 7, "doubles", "Gelhart, Daniel / Widl, Alexander", "Karatasos, Kostantinos / Johannes, Maximilian", [[6, 0], [6, 7], [10, 5]], "home"),
    m("12692665-d2", 8, "doubles", "Miler, Thomas / Bauer, Maximilian", "Sturm, Kevin / Frey, Michael", [[6, 4], [6, 2]], "home"),
  ],
};

// TSV Oberpframmern 2:4 TC Finsing — echte nuLiga-Daten (meeting 12692624)
const SB_12692624: Spielbericht = {
  league: "Südliga 4 (4er) · Gr. 292",
  homeClub: "TSV Oberpframmern",
  awayClub: "TC Finsing",
  date: "2026-06-13",
  day: "Sa",
  finalHome: 2,
  finalAway: 4,
  matches: [
    m("12692624-e1", 1, "singles", "Putzke, Christian (1, LK9,5)", "Bunk, Michael (2, LK15,9)", [[4, 6], [4, 6]], "away"),
    m("12692624-e2", 2, "singles", "Bauer, Andreas (3, LK14,9)", "Weinreich, Matthias (3, LK18,3)", [[5, 7], [1, 6]], "away"),
    m("12692624-e3", 3, "singles", "Janetschko, Florian (4, LK16,3)", "Greiner, Dennis (6, LK19,2)", [[6, 7], [3, 6]], "away"),
    m("12692624-e4", 4, "singles", "Meßner, Tobias (10, LK19,9)", "Zillner, Benedikt (17, LK24,8)", [[6, 0], [6, 1]], "home"),
    m("12692624-d1", 7, "doubles", "Putzke, Christian / Bauer, Andreas", "Bunk, Michael / Greiner, Dennis", [[6, 3], [6, 7], [6, 10]], "away"),
    m("12692624-d2", 8, "doubles", "Janetschko, Florian / Meßner, Tobias", "Weinreich, Matthias / Zillner, Benedikt", [[6, 1], [6, 2]], "home"),
  ],
};

// TC Pliening 3:3 TC Philathlos München — echte nuLiga-Daten (meeting 12692763)
const SB_12692763: Spielbericht = {
  league: "Südliga 4 (4er) · Gr. 292",
  homeClub: "TC Pliening",
  awayClub: "TC Philathlos München",
  date: "2026-05-16",
  day: "Sa",
  finalHome: 3,
  finalAway: 3,
  matches: [
    m("12692763-e1", 1, "singles", "Krug, Max (3, LK8,8)", "Stöcklein, Veit (1, LK15,4)", [[6, 0], [6, 0]], "home"),
    m("12692763-e2", 2, "singles", "Miler, Thomas (10, LK14,3)", "Schetter, Daniel (5, LK17,2)", [[6, 1], [6, 2]], "home"),
    m("12692763-e3", 3, "singles", "Bauer, Maximilian (27, LK22,1)", "Daubeuf, Nicolas (7, LK18,4)", [[0, 6], [1, 6]], "away"),
    m("12692763-e4", 4, "singles", "Nowroth, Fabian (28, LK22,6)", "Kasperek, Jan (14, LK22,0)", [[5, 7], [4, 6]], "away"),
    m("12692763-d1", 7, "doubles", "Krug, Max / Ehlers, Nico", "Stöcklein, Veit / Kasperek, Jan", [[6, 0], [6, 0]], "home"),
    m("12692763-d2", 8, "doubles", "Miler, Thomas / Nowroth, Fabian", "Schetter, Daniel / Daubeuf, Nicolas", [[1, 6], [1, 6]], "away"),
  ],
};

// TC Putzbrunn 2:4 TC Finsing — echte nuLiga-Daten (meeting 12692807)
const SB_12692807: Spielbericht = {
  league: "Südliga 4 (4er) · Gr. 292",
  homeClub: "TC Putzbrunn",
  awayClub: "TC Finsing",
  date: "2026-05-16",
  day: "Sa",
  finalHome: 2,
  finalAway: 4,
  matches: [
    m("12692807-e1", 1, "singles", "Karatasos, Kostantinos (2, LK15,4)", "Bunk, Michael (2, LK15,9)", [[6, 4], [3, 6], [20, 18]], "home"),
    m("12692807-e2", 2, "singles", "Schnurr, Matthias (4, LK20,4)", "Weinreich, Matthias (3, LK18,3)", [[3, 6], [6, 0], [6, 10]], "away"),
    m("12692807-e3", 3, "singles", "Sturm, Kevin (5, LK20,7)", "Greiner, Dennis (6, LK19,2)", [[0, 6], [2, 6]], "away"),
    m("12692807-e4", 4, "singles", "Hierlmeier, Tobias (6, LK21,6)", "Schauer, Jakob (8, LK21,2)", [[3, 6], [6, 2], [10, 4]], "home"),
    m("12692807-d1", 7, "doubles", "Karatasos, Kostantinos / Hierlmeier, Tobias", "Weinreich, Matthias / Greiner, Dennis", [[3, 6], [6, 2], [7, 10]], "away"),
    m("12692807-d2", 8, "doubles", "Schnurr, Matthias / Frey, Michael", "Bunk, Michael / Schauer, Jakob", [[0, 6], [2, 6]], "away"),
  ],
};

// SpVgg Zolling 5:4 TC Grün-Weiß Gräfelfing — echte nuLiga-Daten (meeting 12556760)
const SB_12556760: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "SpVgg Zolling",
  awayClub: "TC Grün-Weiß Gräfelfing",
  date: "2026-05-09",
  day: "Sa",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12556760-e1", 1, "singles", "Knieper, Philipp (2, LK2,6)", "Gürtner, Andreas (3, LK2,0)", [[2, 6], [2, 6]], "away"),
    m("12556760-e2", 2, "singles", "Tomiska, Ondrej CZE (3, LK2,6)", "Weislmaier, Dieter (4, LK3,4)", [[6, 2], [3, 6], [10, 8]], "home"),
    m("12556760-e3", 3, "singles", "Spousta, Jiri CZE (4, LK2,6)", "Stempnowski, Richard POL (6, LK4,4)", [[6, 4], [2, 6], [10, 7]], "home"),
    m("12556760-e4", 4, "singles", "Jarczyk, Herbert (5, LK2,6)", "Kozisek, Tomas CZE (8, LK4,4)", [[7, 6], [6, 0]], "home"),
    m("12556760-e5", 5, "singles", "Stippler, Toni (6, LK2,8)", "Schwenk, Christian AUT (13, LK5,5)", [[6, 1], [6, 2]], "home"),
    m("12556760-e6", 6, "singles", "Lehner, Marcus (30, LK12,8)", "Geissler, Mathias (16, LK6,1)", [[1, 6], [0, 6]], "away"),
    m("12556760-d1", 7, "doubles", "Knieper, Philipp (w.o.) / Gaisbacher, Florian (w.o.)", "Gürtner, Andreas / Stempnowski, Richard POL", [], "away"),
    m("12556760-d2", 8, "doubles", "Spousta, Jiri CZE / Jarczyk, Herbert", "Weislmaier, Dieter / Geissler, Mathias", [[6, 4], [5, 7], [7, 10]], "away"),
    m("12556760-d3", 9, "doubles", "Tomiska, Ondrej CZE / Stippler, Toni", "Kozisek, Tomas CZE / Schwenk, Christian AUT", [[6, 3], [6, 2]], "home"),
  ],
};

// TSV Kottern 5:4 SpVgg Zolling — echte nuLiga-Daten (meeting 12556761)
const SB_12556761: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "TSV Kottern",
  awayClub: "SpVgg Zolling",
  date: "2026-05-16",
  day: "Sa",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12556761-e1", 1, "singles", "Marsoun, Lukas CZE (1, LK3,5)", "Knieper, Philipp (2, LK2,6)", [[6, 3], [7, 6]], "home"),
    m("12556761-e2", 2, "singles", "Pansi, Marco AUT (4, LK4,9)", "Tomiska, Ondrej CZE (3, LK2,6)", [[6, 2], [1, 6], [4, 10]], "away"),
    m("12556761-e3", 3, "singles", "Kiefer, Florian AUT (6, LK5,5)", "Spousta, Jiri CZE (4, LK2,6)", [[6, 3], [1, 6], [10, 7]], "home"),
    m("12556761-e4", 4, "singles", "Erhart, Pauli AUT (7, LK5,7)", "Jarczyk, Herbert (5, LK2,6)", [[6, 4], [6, 2]], "home"),
    m("12556761-e5", 5, "singles", "Hörmann, Thomas (8, LK7,0)", "Ludwig, Sven (8, LK4,6)", [[7, 6], [3, 6], [6, 10]], "away"),
    m("12556761-e6", 6, "singles", "Riess, Manfred AUT (9, LK7,5)", "Braun, Michael (20, LK8,9)", [[7, 5], [6, 0]], "home"),
    m("12556761-d1", 7, "doubles", "Marsoun, Lukas CZE (w.o.) / Pansi, Marco AUT (w.o.)", "Knieper, Philipp / Tomiska, Ondrej CZE", [], "away"),
    m("12556761-d2", 8, "doubles", "Kiefer, Florian AUT / Erhart, Pauli AUT", "Spousta, Jiri CZE (w.o.) / Jarczyk, Herbert (w.o.)", [], "home"),
    m("12556761-d3", 9, "doubles", "Hörmann, Thomas (w.o.) / Riess, Manfred AUT (w.o.)", "Ludwig, Sven / Braun, Michael", [], "away"),
  ],
};

// TC Kümmersbruck 5:4 TC Grün-Weiß Gräfelfing — echte nuLiga-Daten (meeting 12556763)
const SB_12556763: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "TC Kümmersbruck",
  awayClub: "TC Grün-Weiß Gräfelfing",
  date: "2026-05-16",
  day: "Sa",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12556763-e1", 1, "singles", "Schiessl, Sebastian (1, LK1,6)", "Gürtner, Andreas (3, LK2,0)", [[7, 6], [6, 2]], "home"),
    m("12556763-e2", 2, "singles", "Vögeli, Roman CZE (2, LK2,5)", "Weislmaier, Dieter (4, LK3,4)", [[6, 3], [6, 0]], "home"),
    m("12556763-e3", 3, "singles", "Bauer, Jochen (3, LK2,6)", "Fellner, Helmuth AUT (7, LK4,4)", [[2, 6], [2, 6]], "away"),
    m("12556763-e4", 4, "singles", "Stork, Robin CZE (4, LK4,8)", "Drapal, Ladislav (10, LK4,6)", [[6, 2], [7, 5]], "home"),
    m("12556763-e5", 5, "singles", "Schönwetter, Dominik (5, LK5,3)", "Reitenbach, Boris (11, LK5,1)", [[6, 2], [6, 2]], "home"),
    m("12556763-e6", 6, "singles", "Meier, Stefan (8, LK8,3)", "Geissler, Mathias (16, LK6,1)", [[4, 6], [2, 6]], "away"),
    m("12556763-d1", 7, "doubles", "Schiessl, Sebastian / Vögeli, Roman CZE", "Gürtner, Andreas (w.o.) / Weislmaier, Dieter (w.o.)", [], "home"),
    m("12556763-d2", 8, "doubles", "Bauer, Jochen (w.o.) / Heckmann, Tobias (w.o.)", "Fellner, Helmuth AUT / Drapal, Ladislav", [], "away"),
    m("12556763-d3", 9, "doubles", "Stork, Robin CZE (w.o.) / Schönwetter, Dominik (w.o.)", "Reitenbach, Boris / Geissler, Mathias", [], "away"),
  ],
};

// Bad WH Dresden 6:3 TC Pliening — echte nuLiga-Daten (meeting 12556767)
const SB_12556767: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "Bad WH Dresden",
  awayClub: "TC Pliening",
  date: "2026-06-13",
  day: "Sa",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12556767-e1", 1, "singles", "Seká#, Branislav SVK (1, LK2,3)", "Jöhl, Oliver (6, LK2,8)", [[6, 1], [6, 0]], "home"),
    m("12556767-e2", 2, "singles", "Nebojsa, Stanislav CZE (2, LK2,4)", "Reicherseder, Christian (8, LK3,2)", [[6, 4], [6, 1]], "home"),
    m("12556767-e3", 3, "singles", "Triebe, Mathias (3, LK2,5)", "Hauser, Michael (9, LK3,2)", [[6, 3], [4, 6], [11, 9]], "home"),
    m("12556767-e4", 4, "singles", "Tränkner, Stefan (4, LK2,6)", "Gottwald, Markus (15, LK4,6)", [[4, 6], [6, 0], [11, 13]], "away"),
    m("12556767-e5", 5, "singles", "Jentsch, Oliver (6, LK3,5)", "Bosch, Simon (18, LK5,4)", [[3, 6], [7, 6], [10, 8]], "home"),
    m("12556767-e6", 6, "singles", "Makaschin, Sergej (8, LK4,3)", "Lenart, Emil (21, LK5,7)", [[6, 2], [1, 6], [6, 10]], "away"),
    m("12556767-d1", 7, "doubles", "Seká#, Branislav SVK / Triebe, Mathias", "Jöhl, Oliver (w.o.) / Reicherseder, Christian (w.o.)", [], "home"),
    m("12556767-d2", 8, "doubles", "Nebojsa, Stanislav CZE / Jentsch, Oliver", "Hauser, Michael (w.o.) / Gottwald, Markus (w.o.)", [], "home"),
    m("12556767-d3", 9, "doubles", "Tränkner, Stefan (w.o.) / Möhrke, Christian (w.o.)", "Bosch, Simon / Lenart, Emil", [], "away"),
  ],
};

// TC Herzogenaurach 2:7 MTTC Iphitos München — echte nuLiga-Daten (meeting 12556771)
const SB_12556771: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "TC Herzogenaurach",
  awayClub: "MTTC Iphitos München",
  date: "2026-05-09",
  day: "Sa",
  finalHome: 2,
  finalAway: 7,
  matches: [
    m("12556771-e1", 1, "singles", "Moser, Klaus-Ferdinand (2, LK3,1)", "Beck, Karol SVK (3, LK2,0)", [[3, 6], [1, 6]], "away"),
    m("12556771-e2", 2, "singles", "Gaber, Jakob SLO (3, LK3,1)", "Kralert, Petr CZE (5, LK2,0)", [[3, 6], [3, 6]], "away"),
    m("12556771-e3", 3, "singles", "Allinger, Martin (4, LK3,7)", "Senkbeil, Marc (7, LK2,0)", [[7, 5], [6, 2]], "home"),
    m("12556771-e4", 4, "singles", "Hippenstiel, Björn (5, LK3,7)", "Uebel, Lars (14, LK3,9)", [[1, 6], [1, 6]], "away"),
    m("12556771-e5", 5, "singles", "Dörschuck, Thomas (w.o.) (7, LK3,9)", "Gottesleben, Patrick (16, LK5,3)", [[6, 1], [2, 1]], "away"),
    m("12556771-e6", 6, "singles", "Roth, Stephan (8, LK4,1)", "Schmid, Fabian (17, LK5,8)", [[6, 4], [3, 6], [10, 6]], "home"),
    m("12556771-d1", 7, "doubles", "Moser, Klaus-Ferdinand / Gaber, Jakob SLO", "Beck, Karol SVK / Senkbeil, Marc", [[7, 5], [0, 6], [5, 10]], "away"),
    m("12556771-d2", 8, "doubles", "Allinger, Martin / Hippenstiel, Björn", "Kralert, Petr CZE / Uebel, Lars", [[2, 6], [3, 6]], "away"),
    m("12556771-d3", 9, "doubles", "Roth, Stephan / Hinkmann, Fabian", "Gottesleben, Patrick / Schmid, Fabian", [[6, 7], [3, 6]], "away"),
  ],
};

// SpVgg Zolling 1:8 MTTC Iphitos München — echte nuLiga-Daten (meeting 12556776)
const SB_12556776: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "SpVgg Zolling",
  awayClub: "MTTC Iphitos München",
  date: "2026-05-02",
  day: "Sa",
  finalHome: 1,
  finalAway: 8,
  matches: [
    m("12556776-e1", 1, "singles", "Knieper, Philipp (w.o.) (2, LK2,6)", "Kralert, Petr CZE (5, LK2,0)", [[0, 1]], "away"),
    m("12556776-e2", 2, "singles", "Spousta, Jiri CZE (4, LK2,6)", "Senkbeil, Marc (7, LK2,0)", [[5, 7], [6, 2], [5, 10]], "away"),
    m("12556776-e3", 3, "singles", "Jarczyk, Herbert (5, LK2,6)", "Hutt, Felix (8, LK2,7)", [[3, 6], [3, 6]], "away"),
    m("12556776-e4", 4, "singles", "Stippler, Toni (6, LK2,8)", "Imielski, Stefan (9, LK3,2)", [[6, 2], [6, 7], [5, 10]], "away"),
    m("12556776-e5", 5, "singles", "Faulent, Robert (13, LK5,2)", "Soulier, Andre (10, LK3,2)", [[2, 6], [3, 6]], "away"),
    m("12556776-e6", 6, "singles", "Braun, Michael (20, LK8,9)", "Gottesleben, Patrick (16, LK5,3)", [[3, 6], [1, 6]], "away"),
    m("12556776-d1", 7, "doubles", "Knieper, Philipp (w.o.) / Spousta, Jiri CZE (w.o.)", "Kralert, Petr CZE / Senkbeil, Marc", [], "away"),
    m("12556776-d2", 8, "doubles", "Jarczyk, Herbert / Stippler, Toni", "Hutt, Felix (w.o.) / Imielski, Stefan (w.o.)", [], "home"),
    m("12556776-d3", 9, "doubles", "Faulent, Robert (w.o.) / Braun, Michael (w.o.)", "Soulier, Andre / Gottesleben, Patrick", [], "away"),
  ],
};

// TC Kümmersbruck 6:3 SpVgg Zolling — echte nuLiga-Daten (meeting 12556777)
const SB_12556777: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "TC Kümmersbruck",
  awayClub: "SpVgg Zolling",
  date: "2026-06-13",
  day: "Sa",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12556777-e1", 1, "singles", "Stork, Robin CZE (4, LK4,8)", "Knieper, Philipp (2, LK2,6)", [[6, 2], [5, 7], [10, 12]], "away"),
    m("12556777-e2", 2, "singles", "Schönwetter, Dominik (5, LK5,3)", "Spousta, Jiri CZE (w.o.) (4, LK2,6)", [[6, 4], [1, 1]], "home"),
    m("12556777-e3", 3, "singles", "Izdebski, Maciej POL (w.o.) (6, LK5,4)", "Jarczyk, Herbert (5, LK2,6)", [], "away"),
    m("12556777-e4", 4, "singles", "Heckmann, Tobias (7, LK7,4)", "Stippler, Toni (w.o.) (6, LK2,8)", [], "home"),
    m("12556777-e5", 5, "singles", "Meier, Stefan (8, LK8,3)", "Ludwig, Sven (8, LK4,6)", [[3, 6], [7, 5], [10, 8]], "home"),
    m("12556777-e6", 6, "singles", "Sperber, Christoph (21, LK14,0)", "Braun, Michael (w.o.) (20, LK8,9)", [], "home"),
    m("12556777-d1", 7, "doubles", "Stork, Robin CZE (w.o.) / Schönwetter, Dominik (w.o.)", "Knieper, Philipp / Spousta, Jiri CZE", [], "away"),
    m("12556777-d2", 8, "doubles", "Heckmann, Tobias / Meier, Stefan", "Jarczyk, Herbert (w.o.) / Ludwig, Sven (w.o.)", [], "home"),
    m("12556777-d3", 9, "doubles", "Sperber, Christoph / Szautner, Florian", "— / —", [], "home"),
  ],
};

// TC Pliening 7:2 TC Herzogenaurach — echte nuLiga-Daten (meeting 12556778)
const SB_12556778: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "TC Pliening",
  awayClub: "TC Herzogenaurach",
  date: "2026-05-02",
  day: "Sa",
  finalHome: 7,
  finalAway: 2,
  matches: [
    m("12556778-e1", 1, "singles", "Hennig, Florian (2, LK2,1)", "Devoty, Theodor CZE (1, LK3,1)", [[4, 6], [2, 6]], "away"),
    m("12556778-e2", 2, "singles", "Hahn, Matthias (4, LK2,1)", "Gaber, Jakob SLO (3, LK3,1)", [[6, 4], [6, 2]], "home"),
    m("12556778-e3", 3, "singles", "Fuchs, Christian (5, LK2,7)", "Allinger, Martin (4, LK3,7)", [[3, 6], [7, 5], [10, 6]], "home"),
    m("12556778-e4", 4, "singles", "Hauser, Michael (9, LK3,2)", "Hippenstiel, Björn (5, LK3,7)", [[6, 3], [6, 3]], "home"),
    m("12556778-e5", 5, "singles", "Gottwald, Markus (15, LK4,6)", "Dörschuck, Thomas (7, LK3,9)", [[6, 2], [7, 6]], "home"),
    m("12556778-e6", 6, "singles", "Aigner, Peter (23, LK6,1)", "Hinkmann, Fabian (10, LK4,5)", [[6, 1], [6, 3]], "home"),
    m("12556778-d1", 7, "doubles", "Maucher, Steffen / Fuchs, Christian", "Gaber, Jakob SLO (w.o.) / Allinger, Martin (w.o.)", [], "home"),
    m("12556778-d2", 8, "doubles", "Hahn, Matthias / Aigner, Peter", "Devoty, Theodor CZE / Dörschuck, Thomas", [[6, 4], [3, 6], [5, 10]], "away"),
    m("12556778-d3", 9, "doubles", "Reicherseder, Christian / Hauser, Michael", "Hippenstiel, Björn (w.o.) / Hinkmann, Fabian (w.o.)", [[6, 4], [3, 0]], "home"),
  ],
};

// MTTC Iphitos München 5:4 TSV Kottern — echte nuLiga-Daten (meeting 12556782)
const SB_12556782: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "MTTC Iphitos München",
  awayClub: "TSV Kottern",
  date: "2026-06-13",
  day: "Sa",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12556782-e1", 1, "singles", "Beck, Karol SVK (3, LK2,0)", "Kesthely, Soma NOR* (2, LK4,3)", [[6, 2], [6, 4]], "home"),
    m("12556782-e2", 2, "singles", "Kralert, Petr CZE (5, LK2,0)", "Birner, Christoph (3, LK4,6)", [[6, 1], [6, 2]], "home"),
    m("12556782-e3", 3, "singles", "Senkbeil, Marc (7, LK2,0)", "Kiefer, Florian AUT (6, LK5,5)", [[3, 6], [0, 6]], "away"),
    m("12556782-e4", 4, "singles", "Hutt, Felix (8, LK2,7)", "Hörmann, Thomas (8, LK7,0)", [[6, 2], [6, 4]], "home"),
    m("12556782-e5", 5, "singles", "Gottesleben, Patrick (16, LK5,3)", "Riess, Manfred AUT (9, LK7,5)", [[1, 6], [3, 6]], "away"),
    m("12556782-e6", 6, "singles", "Schmid, Fabian (17, LK5,8)", "Jakob, Frank (14, LK10,5)", [[6, 1], [6, 3]], "home"),
    m("12556782-d1", 7, "doubles", "Beck, Karol SVK / Kralert, Petr CZE", "Kesthely, Soma NOR* / Jakob, Frank", [[6, 1], [6, 2]], "home"),
    m("12556782-d2", 8, "doubles", "Gottesleben, Patrick / Schmid, Fabian", "Birner, Christoph / Riess, Manfred AUT", [[4, 6], [2, 6]], "away"),
    m("12556782-d3", 9, "doubles", "Hutt, Felix / Fehske, Stephan", "Kiefer, Florian AUT / Hörmann, Thomas", [[4, 6], [4, 6]], "away"),
  ],
};

// TC Grün-Weiß Gräfelfing 5:4 TC Herzogenaurach — echte nuLiga-Daten (meeting 12556790)
const SB_12556790: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "TC Grün-Weiß Gräfelfing",
  awayClub: "TC Herzogenaurach",
  date: "2026-06-13",
  day: "Sa",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12556790-e1", 1, "singles", "Gürtner, Andreas (3, LK2,0)", "Devoty, Theodor CZE (1, LK3,1)", [[0, 6], [1, 6]], "away"),
    m("12556790-e2", 2, "singles", "Weislmaier, Dieter (4, LK3,4)", "Moser, Klaus-Ferdinand (2, LK3,1)", [[6, 4], [6, 1]], "home"),
    m("12556790-e3", 3, "singles", "Fellner, Helmuth AUT (7, LK4,4)", "Gaber, Jakob SLO (3, LK3,1)", [[6, 1], [3, 6], [6, 10]], "away"),
    m("12556790-e4", 4, "singles", "Kozisek, Tomas CZE (8, LK4,4)", "Hippenstiel, Björn (5, LK3,7)", [[6, 1], [6, 3]], "home"),
    m("12556790-e5", 5, "singles", "Drapal, Ladislav (10, LK4,6)", "Dörschuck, Thomas (7, LK3,9)", [[3, 6], [6, 2], [9, 11]], "away"),
    m("12556790-e6", 6, "singles", "Geissler, Mathias (16, LK6,1)", "Roth, Stephan (8, LK4,1)", [[7, 5], [6, 3]], "home"),
    m("12556790-d1", 7, "doubles", "Gürtner, Andreas / Fellner, Helmuth AUT", "Moser, Klaus-Ferdinand / Gaber, Jakob SLO", [[6, 2], [6, 2]], "home"),
    m("12556790-d2", 8, "doubles", "Weislmaier, Dieter / Geissler, Mathias", "Devoty, Theodor CZE / Dörschuck, Thomas", [[3, 6], [4, 6]], "away"),
    m("12556790-d3", 9, "doubles", "Kozisek, Tomas CZE / Schwenk, Christian AUT", "Hippenstiel, Björn / Hinkmann, Fabian", [[6, 2], [6, 0]], "home"),
  ],
};

// Bad WH Dresden 6:3 TC Kümmersbruck — echte nuLiga-Daten (meeting 12556791)
const SB_12556791: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "Bad WH Dresden",
  awayClub: "TC Kümmersbruck",
  date: "2026-05-09",
  day: "Sa",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12556791-e1", 1, "singles", "Nebojsa, Stanislav CZE (2, LK2,4)", "Stork, Robin CZE (4, LK4,8)", [[6, 1], [2, 6], [8, 10]], "away"),
    m("12556791-e2", 2, "singles", "Triebe, Mathias (3, LK2,5)", "Schönwetter, Dominik (5, LK5,3)", [[1, 6], [3, 6]], "away"),
    m("12556791-e3", 3, "singles", "Tränkner, Stefan (4, LK2,6)", "Izdebski, Maciej POL (6, LK5,4)", [[6, 3], [4, 6], [10, 3]], "home"),
    m("12556791-e4", 4, "singles", "Möhrke, Christian (5, LK2,9)", "Heckmann, Tobias (7, LK7,4)", [[2, 6], [6, 4], [15, 13]], "home"),
    m("12556791-e5", 5, "singles", "Jentsch, Oliver (6, LK3,5)", "Meier, Stefan (8, LK8,3)", [[6, 1], [7, 6]], "home"),
    m("12556791-e6", 6, "singles", "Makaschin, Sergej (8, LK4,3)", "Sperber, Christoph (21, LK14,0)", [[6, 1], [6, 1]], "home"),
    m("12556791-d1", 7, "doubles", "Nebojsa, Stanislav CZE / Jentsch, Oliver", "Stork, Robin CZE / Schönwetter, Dominik", [[4, 6], [6, 7]], "away"),
    m("12556791-d2", 8, "doubles", "Tränkner, Stefan / Möhrke, Christian", "Izdebski, Maciej POL / Sperber, Christoph", [[6, 0], [6, 3]], "home"),
    m("12556791-d3", 9, "doubles", "Triebe, Mathias / Makaschin, Sergej", "Heckmann, Tobias / Meier, Stefan", [[6, 3], [6, 3]], "home"),
  ],
};

// TSV Kottern 3:6 TC Pliening — echte nuLiga-Daten (meeting 12556793)
const SB_12556793: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "TSV Kottern",
  awayClub: "TC Pliening",
  date: "2026-05-09",
  day: "Sa",
  finalHome: 3,
  finalAway: 6,
  matches: [
    m("12556793-e1", 1, "singles", "Marsoun, Lukas CZE (1, LK3,5)", "Hahn, Matthias (4, LK2,1)", [[4, 6], [2, 6]], "away"),
    m("12556793-e2", 2, "singles", "Birner, Christoph (3, LK4,6)", "Fuchs, Christian (5, LK2,7)", [[1, 6], [1, 6]], "away"),
    m("12556793-e3", 3, "singles", "Kiefer, Florian AUT (6, LK5,5)", "Reicherseder, Christian (8, LK3,2)", [[6, 2], [6, 7], [10, 8]], "home"),
    m("12556793-e4", 4, "singles", "Erhart, Pauli AUT (7, LK5,7)", "Hauser, Michael (9, LK3,2)", [[6, 2], [6, 1]], "home"),
    m("12556793-e5", 5, "singles", "Maier, Moritz (12, LK9,3)", "Gottwald, Markus (15, LK4,6)", [[3, 6], [4, 6]], "away"),
    m("12556793-e6", 6, "singles", "Jakob, Frank (14, LK10,5)", "Bosch, Simon (18, LK5,4)", [[1, 6], [1, 6]], "away"),
    m("12556793-d1", 7, "doubles", "Marsoun, Lukas CZE / Kiefer, Florian AUT", "Hahn, Matthias / Bosch, Simon", [[6, 1], [6, 1]], "home"),
    m("12556793-d2", 8, "doubles", "Erhart, Pauli AUT / Scholz, Bernd", "Reicherseder, Christian / Hauser, Michael", [[0, 6], [1, 6]], "away"),
    m("12556793-d3", 9, "doubles", "Hörmann, Thomas / Maier, Moritz", "Fuchs, Christian / Gottwald, Markus", [[3, 6], [1, 6]], "away"),
  ],
};

// Bad WH Dresden 3:6 TC Grün-Weiß Gräfelfing — echte nuLiga-Daten (meeting 12556809)
const SB_12556809: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "Bad WH Dresden",
  awayClub: "TC Grün-Weiß Gräfelfing",
  date: "2026-05-02",
  day: "Sa",
  finalHome: 3,
  finalAway: 6,
  matches: [
    m("12556809-e1", 1, "singles", "Nebojsa, Stanislav CZE (2, LK2,4)", "Gürtner, Andreas (3, LK2,0)", [[3, 6], [2, 6]], "away"),
    m("12556809-e2", 2, "singles", "Triebe, Mathias (3, LK2,5)", "Weislmaier, Dieter (4, LK3,4)", [[2, 6], [0, 6]], "away"),
    m("12556809-e3", 3, "singles", "Tränkner, Stefan (4, LK2,6)", "Herz, Ivan SVK (5, LK4,2)", [[2, 6], [5, 7]], "away"),
    m("12556809-e4", 4, "singles", "Möhrke, Christian (5, LK2,9)", "Stempnowski, Richard POL (6, LK4,4)", [[1, 6], [1, 6]], "away"),
    m("12556809-e5", 5, "singles", "Jentsch, Oliver (6, LK3,5)", "Bardins, Stanislaus LAT (12, LK5,3)", [[6, 2], [5, 7], [7, 10]], "away"),
    m("12556809-e6", 6, "singles", "Makaschin, Sergej (8, LK4,3)", "Schwenk, Christian AUT (13, LK5,5)", [[6, 3], [7, 5]], "home"),
    m("12556809-d1", 7, "doubles", "Nebojsa, Stanislav CZE / Jentsch, Oliver", "Gürtner, Andreas (w.o.) / Weislmaier, Dieter (w.o.)", [], "home"),
    m("12556809-d2", 8, "doubles", "Tränkner, Stefan / Möhrke, Christian", "Herz, Ivan SVK (w.o.) / Stempnowski, Richard POL (w.o.)", [], "home"),
    m("12556809-d3", 9, "doubles", "Triebe, Mathias (w.o.) / Makaschin, Sergej (w.o.)", "Bardins, Stanislaus LAT / Schwenk, Christian AUT", [], "away"),
  ],
};

// MTTC Iphitos München 5:4 TC Pliening — echte nuLiga-Daten (meeting 12556812)
const SB_12556812: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "MTTC Iphitos München",
  awayClub: "TC Pliening",
  date: "2026-05-16",
  day: "Sa",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12556812-e1", 1, "singles", "Beck, Karol SVK (3, LK2,0)", "Hahn, Matthias (4, LK2,1)", [[6, 4], [7, 6]], "home"),
    m("12556812-e2", 2, "singles", "Kralert, Petr CZE (5, LK2,0)", "Fuchs, Christian (5, LK2,7)", [[6, 3], [3, 6], [10, 6]], "home"),
    m("12556812-e3", 3, "singles", "Senkbeil, Marc (7, LK2,0)", "Reicherseder, Christian (8, LK3,2)", [[6, 3], [4, 6], [7, 10]], "away"),
    m("12556812-e4", 4, "singles", "Hutt, Felix (8, LK2,7)", "Hauser, Michael (9, LK3,2)", [[6, 3], [6, 4]], "home"),
    m("12556812-e5", 5, "singles", "Imielski, Stefan (9, LK3,2)", "Gottwald, Markus (15, LK4,6)", [[6, 3], [6, 3]], "home"),
    m("12556812-e6", 6, "singles", "Soulier, Andre (w.o.) (10, LK3,2)", "Aigner, Peter (23, LK6,1)", [[2, 6], [5, 6]], "away"),
    m("12556812-d1", 7, "doubles", "Beck, Karol SVK / Kralert, Petr CZE", "Reicherseder, Christian (w.o.) / Hauser, Michael (w.o.)", [[5, 0]], "home"),
    m("12556812-d2", 8, "doubles", "Senkbeil, Marc / Fehske, Stephan", "Hahn, Matthias / Aigner, Peter", [[1, 6], [2, 6]], "away"),
    m("12556812-d3", 9, "doubles", "Hutt, Felix / Imielski, Stefan", "Fuchs, Christian / Bosch, Simon", [[7, 6], [4, 6], [1, 10]], "away"),
  ],
};

// TSV Kottern 3:6 TC Kümmersbruck — echte nuLiga-Daten (meeting 12556819)
const SB_12556819: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "TSV Kottern",
  awayClub: "TC Kümmersbruck",
  date: "2026-05-02",
  day: "Sa",
  finalHome: 3,
  finalAway: 6,
  matches: [
    m("12556819-e1", 1, "singles", "Birner, Christoph (w.o.) (3, LK4,6)", "Schiessl, Sebastian (1, LK1,6)", [[3, 6]], "away"),
    m("12556819-e2", 2, "singles", "Pansi, Marco AUT (4, LK4,9)", "Vögeli, Roman CZE (2, LK2,5)", [[1, 6], [0, 6]], "away"),
    m("12556819-e3", 3, "singles", "Kiefer, Florian AUT (6, LK5,5)", "Bauer, Jochen (3, LK2,6)", [[6, 3], [6, 3]], "home"),
    m("12556819-e4", 4, "singles", "Erhart, Pauli AUT (7, LK5,7)", "Stork, Robin CZE (4, LK4,8)", [[4, 6], [6, 1], [6, 10]], "away"),
    m("12556819-e5", 5, "singles", "Hörmann, Thomas (8, LK7,0)", "Schönwetter, Dominik (5, LK5,3)", [[4, 6], [2, 6]], "away"),
    m("12556819-e6", 6, "singles", "Riess, Manfred AUT (9, LK7,5)", "Meier, Stefan (8, LK8,3)", [[6, 0], [6, 2]], "home"),
    m("12556819-d1", 7, "doubles", "Pansi, Marco AUT / Erhart, Pauli AUT", "Schiessl, Sebastian / Vögeli, Roman CZE", [[4, 6], [1, 6]], "away"),
    m("12556819-d2", 8, "doubles", "Kiefer, Florian AUT / Riess, Manfred AUT", "Bauer, Jochen / Meier, Stefan", [[6, 3], [6, 3]], "home"),
    m("12556819-d3", 9, "doubles", "Hörmann, Thomas / Maier, Moritz", "Stork, Robin CZE / Schönwetter, Dominik", [[2, 6], [4, 6]], "away"),
  ],
};

// TC Herzogenaurach 4:5 Bad WH Dresden — echte nuLiga-Daten (meeting 12556822)
const SB_12556822: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "TC Herzogenaurach",
  awayClub: "Bad WH Dresden",
  date: "2026-05-16",
  day: "Sa",
  finalHome: 4,
  finalAway: 5,
  matches: [
    m("12556822-e1", 1, "singles", "Devoty, Theodor CZE (1, LK3,1)", "Nebojsa, Stanislav CZE (2, LK2,4)", [[4, 6], [2, 6]], "away"),
    m("12556822-e2", 2, "singles", "Moser, Klaus-Ferdinand (2, LK3,1)", "Triebe, Mathias (3, LK2,5)", [[6, 1], [4, 6], [10, 8]], "home"),
    m("12556822-e3", 3, "singles", "Gaber, Jakob SLO (3, LK3,1)", "Tränkner, Stefan (4, LK2,6)", [[6, 2], [6, 2]], "home"),
    m("12556822-e4", 4, "singles", "Hippenstiel, Björn (5, LK3,7)", "Möhrke, Christian (5, LK2,9)", [[2, 6], [3, 6]], "away"),
    m("12556822-e5", 5, "singles", "Roth, Stephan (8, LK4,1)", "Jentsch, Oliver (6, LK3,5)", [[3, 6], [5, 7]], "away"),
    m("12556822-e6", 6, "singles", "Hinkmann, Fabian (10, LK4,5)", "Makaschin, Sergej (8, LK4,3)", [[5, 7], [3, 6]], "away"),
    m("12556822-d1", 7, "doubles", "Moser, Klaus-Ferdinand / Gaber, Jakob SLO", "Nebojsa, Stanislav CZE / Jentsch, Oliver", [[6, 2], [1, 6], [10, 7]], "home"),
    m("12556822-d2", 8, "doubles", "Devoty, Theodor CZE / Frenzel, Matthias", "Tränkner, Stefan / Möhrke, Christian", [[6, 3], [4, 6], [10, 6]], "home"),
    m("12556822-d3", 9, "doubles", "Hippenstiel, Björn / Hinkmann, Fabian", "Triebe, Mathias / Makaschin, Sergej", [[4, 6], [4, 6]], "away"),
  ],
};

// ── Herren 40 III · Südliga 2 · Gr. 315 ── echte nuLiga-Daten (Stand 18.06.2026).
// Quelle: BTV nuLiga MeetingReportFOP je Begegnung. Forstinning ist zurückgezogen,
// daher liegt für deren Begegnung (TF Markt Schwaben 6:3) kein Spielbericht vor.
// TC Grün-Gold München II 6:3 TF Markt Schwaben — echte nuLiga-Daten (meeting 12742402)
const SB_12742402: Spielbericht = {
  league: "Südliga 2 · Gr. 315",
  homeClub: "TC Grün-Gold München II",
  awayClub: "TF Markt Schwaben",
  date: "2026-05-17",
  day: "So",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12742402-e1", 1, "singles", "Harz, Karsten (17, LK14,1)", "Eraerds, Patrick (1, LK10,4)", [[2, 6], [4, 6]], "away"),
    m("12742402-e2", 2, "singles", "Hasselmann, Roland (21, LK14,5)", "Krahnke, Andreas (3, LK13,0)", [[4, 6], [4, 6]], "away"),
    m("12742402-e3", 3, "singles", "Diener, Christian (24, LK15,0)", "Walther, Oliver (4, LK13,1)", [[6, 3], [6, 1]], "home"),
    m("12742402-e4", 4, "singles", "Hallenberger, Philipp (26, LK16,0)", "Leon Diaz, Esteban (5, LK14,9)", [[6, 0], [6, 1]], "home"),
    m("12742402-e5", 5, "singles", "Kopachev, Alexey (42, LK20,8)", "Eckert, Thomas (9, LK21,6)", [[6, 1], [6, 7], [10, 8]], "home"),
    m("12742402-e6", 6, "singles", "Souche, Thomas FRA (43, LK20,9)", "Göhrum, Andreas (14, LK22,2)", [[6, 7], [5, 7]], "away"),
    m("12742402-d1", 7, "doubles", "Harz, Karsten / Hasselmann, Roland", "Krahnke, Andreas / Walther, Oliver", [[6, 1], [3, 6], [14, 12]], "home"),
    m("12742402-d2", 8, "doubles", "Hallenberger, Philipp / Richter, Sönke", "Eraerds, Patrick / Göhrum, Andreas", [[4, 6], [6, 3], [10, 7]], "home"),
    m("12742402-d3", 9, "doubles", "Diener, Christian / Kuhlmann, Peter", "Leon Diaz, Esteban / Eckert, Thomas", [[7, 6], [6, 0]], "home"),
  ],
};

// TSV Haar II 5:4 TSV Feldkirchen II — echte nuLiga-Daten (meeting 12742413)
const SB_12742413: Spielbericht = {
  league: "Südliga 2 · Gr. 315",
  homeClub: "TSV Haar II",
  awayClub: "TSV Feldkirchen II",
  date: "2026-05-16",
  day: "Sa",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12742413-e1", 1, "singles", "Rebele, Tobias (17, LK12,8)", "Petz, Veit (10, LK12,9)", [[2, 6], [2, 6]], "away"),
    m("12742413-e2", 2, "singles", "Lenders, Matthias (19, LK13,4)", "Körber, Simon (12, LK13,3)", [[3, 6], [1, 6]], "away"),
    m("12742413-e3", 3, "singles", "Malik, Oliver (20, LK13,5)", "Brand, Michael (16, LK14,4)", [[6, 3], [6, 1]], "home"),
    m("12742413-e4", 4, "singles", "Brasse, Matthias (23, LK13,8)", "Parzefall, Florian (17, LK15,0)", [[6, 1], [6, 7], [10, 4]], "home"),
    m("12742413-e5", 5, "singles", "Amend, Philipp (30, LK16,4)", "Keil, Patrick (20, LK16,1)", [[6, 2], [0, 6], [10, 8]], "home"),
    m("12742413-e6", 6, "singles", "Potschkat, Torsten (46, LK21,2)", "Ide, Dennis (w.o.) (32, LK24,3)", [[3, 2]], "home"),
    m("12742413-d1", 7, "doubles", "Rebele, Tobias / Brasse, Matthias", "Körber, Simon / Hargasser, Manfred", [[7, 6], [3, 6], [7, 10]], "away"),
    m("12742413-d2", 8, "doubles", "Lenders, Matthias / Malik, Oliver", "Petz, Veit / Brand, Michael", [[6, 0], [2, 6], [10, 7]], "home"),
    m("12742413-d3", 9, "doubles", "Amend, Philipp / Potschkat, Torsten", "Parzefall, Florian / Keil, Patrick", [[2, 6], [1, 6]], "away"),
  ],
};

// TC Pliening III 7:2 WB Fideliopark München II — echte nuLiga-Daten (meeting 12742450)
const SB_12742450: Spielbericht = {
  league: "Südliga 2 · Gr. 315",
  homeClub: "TC Pliening III",
  awayClub: "WB Fideliopark München II",
  date: "2026-05-16",
  day: "Sa",
  finalHome: 7,
  finalAway: 2,
  matches: [
    m("12742450-e1", 1, "singles", "Wörner, Martin (31, LK10,4)", "Schütz, Alexander (12, LK15,5)", [[6, 0], [6, 2]], "home"),
    m("12742450-e2", 2, "singles", "Anetzberger, Martin (42, LK14,0)", "Steinbach, Jan (15, LK17,2)", [[6, 3], [3, 6], [10, 3]], "home"),
    m("12742450-e3", 3, "singles", "Forchhammer, Sebastian (49, LK16,6)", "Pröll, Markus (20, LK19,1)", [[6, 0], [4, 6], [8, 10]], "away"),
    m("12742450-e4", 4, "singles", "Gelhart, Daniel (54, LK18,6)", "Ockert, Tim (21, LK19,3)", [[6, 7], [1, 6]], "away"),
    m("12742450-e5", 5, "singles", "Widl, Alexander (59, LK19,8)", "Ries, Sebastian (25, LK20,0)", [[7, 6], [6, 2]], "home"),
    m("12742450-e6", 6, "singles", "Wagner, Patrick IRL (62, LK20,3)", "Wagh, Vijay (26, LK20,1)", [[7, 6], [6, 0]], "home"),
    m("12742450-d1", 7, "doubles", "Wörner, Martin / Forchhammer, Sebastian", "Schütz, Alexander / Ockert, Tim", [[7, 5], [6, 3]], "home"),
    m("12742450-d2", 8, "doubles", "Anetzberger, Martin / Wagner, Patrick IRL", "Steinbach, Jan / Ries, Sebastian", [[4, 6], [6, 3], [10, 3]], "home"),
    m("12742450-d3", 9, "doubles", "Gelhart, Daniel / Widl, Alexander", "Pröll, Markus / Wagh, Vijay", [[6, 4], [6, 1]], "home"),
  ],
};

// TSV Feldkirchen II 4:5 TC Grün-Gold München II — echte nuLiga-Daten (meeting 12742475)
const SB_12742475: Spielbericht = {
  league: "Südliga 2 · Gr. 315",
  homeClub: "TSV Feldkirchen II",
  awayClub: "TC Grün-Gold München II",
  date: "2026-06-13",
  day: "Sa",
  finalHome: 4,
  finalAway: 5,
  matches: [
    m("12742475-e1", 1, "singles", "Petz, Veit (10, LK12,9)", "Hasselmann, Roland (21, LK14,5)", [[6, 2], [6, 1]], "home"),
    m("12742475-e2", 2, "singles", "Körber, Simon (12, LK13,3)", "Diener, Christian (24, LK15,0)", [[5, 7], [3, 6]], "away"),
    m("12742475-e3", 3, "singles", "Hargasser, Manfred (15, LK13,9)", "Maier, Ulf (27, LK16,0)", [[5, 7], [1, 6]], "away"),
    m("12742475-e4", 4, "singles", "Parzefall, Florian (17, LK15,0)", "Gammisch, Sebastian (30, LK17,6)", [[4, 6], [2, 6]], "away"),
    m("12742475-e5", 5, "singles", "Mutter, Sebastian (21, LK16,3)", "Kopachev, Alexey (42, LK20,8)", [[6, 1], [6, 3]], "home"),
    m("12742475-e6", 6, "singles", "Ide, Dennis (32, LK24,3)", "Kuhlmann, Peter (45, LK22,3)", [[6, 4], [6, 4]], "home"),
    m("12742475-d1", 7, "doubles", "Körber, Simon / Hargasser, Manfred", "Hasselmann, Roland / Kopachev, Alexey", [[6, 1], [7, 5]], "home"),
    m("12742475-d2", 8, "doubles", "Petz, Veit (w.o.) / Parzefall, Florian (w.o.)", "Diener, Christian / Gammisch, Sebastian", [[1, 6], [0, 2]], "away"),
    m("12742475-d3", 9, "doubles", "Mutter, Sebastian / Ide, Dennis", "Maier, Ulf / Kuhlmann, Peter", [[5, 7], [5, 7]], "away"),
  ],
};

// TC Pliening III 7:2 TC Aschheim — echte nuLiga-Daten (meeting 12742477)
const SB_12742477: Spielbericht = {
  league: "Südliga 2 · Gr. 315",
  homeClub: "TC Pliening III",
  awayClub: "TC Aschheim",
  date: "2026-06-13",
  day: "Sa",
  finalHome: 7,
  finalAway: 2,
  matches: [
    m("12742477-e1", 1, "singles", "Wörner, Martin (31, LK10,4)", "Faschang, Michael AUT (1, LK7,2)", [[2, 6], [6, 4], [10, 7]], "home"),
    m("12742477-e2", 2, "singles", "Anetzberger, Martin (42, LK14,0)", "Bodai, Daniel HUN (8, LK17,9)", [[6, 1], [6, 1]], "home"),
    m("12742477-e3", 3, "singles", "Schwarz, Heiko (44, LK15,6)", "Dietzel, Patrice (9, LK18,6)", [[6, 4], [2, 6], [11, 9]], "home"),
    m("12742477-e4", 4, "singles", "Forchhammer, Sebastian (49, LK16,6)", "Ahmetaj, Erton ALB (13, LK19,8)", [[5, 7], [7, 5], [10, 6]], "home"),
    m("12742477-e5", 5, "singles", "Lange, Marc (56, LK18,8)", "Norris, David GBR (21, LK22,7)", [[0, 6], [6, 3], [10, 6]], "home"),
    m("12742477-e6", 6, "singles", "Rohrmeier, Patrick (63, LK20,6)", "Musielak, Radoslaw (25, LK24,2)", [[3, 6], [6, 2], [5, 10]], "away"),
    m("12742477-d1", 7, "doubles", "Wörner, Martin / Schwarz, Heiko", "Bodai, Daniel HUN (w.o.) / Norris, David GBR (w.o.)", [], "home"),
    m("12742477-d2", 8, "doubles", "Anetzberger, Martin / Rohrmeier, Patrick", "Faschang, Michael AUT / Musielak, Radoslaw", [[6, 0], [6, 7], [10, 6]], "home"),
    m("12742477-d3", 9, "doubles", "Ehlers, Nico / Lange, Marc", "Dietzel, Patrice / Ahmetaj, Erton ALB", [[6, 7], [3, 6]], "away"),
  ],
};

// TSV Haar II 5:4 TF Markt Schwaben — echte nuLiga-Daten (meeting 12742536)
const SB_12742536: Spielbericht = {
  league: "Südliga 2 · Gr. 315",
  homeClub: "TSV Haar II",
  awayClub: "TF Markt Schwaben",
  date: "2026-06-13",
  day: "Sa",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12742536-e1", 1, "singles", "Schmid, Christian (16, LK12,8)", "Eraerds, Patrick (1, LK10,4)", [[6, 3], [4, 6], [10, 8]], "home"),
    m("12742536-e2", 2, "singles", "Rebele, Tobias (17, LK12,8)", "Krahnke, Andreas (3, LK13,0)", [[5, 7], [1, 6]], "away"),
    m("12742536-e3", 3, "singles", "Zirngibl, Rupert (22, LK13,6)", "Walther, Oliver (4, LK13,1)", [[6, 3], [6, 1]], "home"),
    m("12742536-e4", 4, "singles", "Venus, Ulrich (27, LK15,0)", "Leon Diaz, Esteban (5, LK14,9)", [[4, 6], [6, 3], [10, 5]], "home"),
    m("12742536-e5", 5, "singles", "Herrmann, Philipp (43, LK20,0)", "Eckert, Thomas (9, LK21,6)", [[6, 4], [6, 0]], "home"),
    m("12742536-e6", 6, "singles", "Mehrlich, Thomas (54, LK25,0)", "Göhrum, Andreas (14, LK22,2)", [[1, 6], [1, 6]], "away"),
    m("12742536-d1", 7, "doubles", "Rebele, Tobias / Zirngibl, Rupert", "Krahnke, Andreas / Walther, Oliver", [[6, 4], [1, 6], [6, 10]], "away"),
    m("12742536-d2", 8, "doubles", "Schmid, Christian / Venus, Ulrich", "Eraerds, Patrick / Göhrum, Andreas", [[7, 6], [6, 4]], "home"),
    m("12742536-d3", 9, "doubles", "Herrmann, Philipp / Mehrlich, Thomas", "Leon Diaz, Esteban / Eckert, Thomas", [[3, 6], [3, 6]], "away"),
  ],
};

// TSV Feldkirchen II 7:2 WB Fideliopark München II — echte nuLiga-Daten (meeting 12742553)
const SB_12742553: Spielbericht = {
  league: "Südliga 2 · Gr. 315",
  homeClub: "TSV Feldkirchen II",
  awayClub: "WB Fideliopark München II",
  date: "2026-05-02",
  day: "Sa",
  finalHome: 7,
  finalAway: 2,
  matches: [
    m("12742553-e1", 1, "singles", "Amrehn, Michael (9, LK12,5)", "Savci-Keck, Koray (10, LK15,3)", [[6, 2], [6, 3]], "home"),
    m("12742553-e2", 2, "singles", "Körber, Simon (12, LK13,3)", "Steinbach, Jan (15, LK17,2)", [[7, 5], [6, 4]], "home"),
    m("12742553-e3", 3, "singles", "Brand, Michael (16, LK14,4)", "Kahle, Robert (19, LK18,1)", [[6, 7], [4, 6]], "away"),
    m("12742553-e4", 4, "singles", "Parzefall, Florian (17, LK15,0)", "Pröll, Markus (20, LK19,1)", [[6, 4], [6, 2]], "home"),
    m("12742553-e5", 5, "singles", "Kruschwitz, Martin (19, LK16,1)", "Ockert, Tim (21, LK19,3)", [[6, 0], [6, 1]], "home"),
    m("12742553-e6", 6, "singles", "Schmid, Peter (23, LK17,2)", "Mutter, Jan (31, LK22,4)", [[6, 1], [6, 2]], "home"),
    m("12742553-d1", 7, "doubles", "Amrehn, Michael / Kruschwitz, Martin", "Steinbach, Jan / Pröll, Markus", [[6, 1], [6, 0]], "home"),
    m("12742553-d2", 8, "doubles", "Brand, Michael / Parzefall, Florian", "Savci-Keck, Koray / Ockert, Tim", [[4, 6], [4, 6]], "away"),
    m("12742553-d3", 9, "doubles", "Körber, Simon / Schmid, Peter", "Kahle, Robert / Mutter, Jan", [[6, 1], [6, 0]], "home"),
  ],
};

// TC Grün-Gold München II 5:4 TC Pliening III — echte nuLiga-Daten (meeting 12742565)
const SB_12742565: Spielbericht = {
  league: "Südliga 2 · Gr. 315",
  homeClub: "TC Grün-Gold München II",
  awayClub: "TC Pliening III",
  date: "2026-05-03",
  day: "So",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12742565-e1", 1, "singles", "Harz, Karsten (17, LK14,1)", "Wörner, Martin (31, LK10,4)", [[4, 6], [2, 6]], "away"),
    m("12742565-e2", 2, "singles", "Hasselmann, Roland (21, LK14,5)", "Forchhammer, Sebastian (49, LK16,6)", [[6, 2], [6, 3]], "home"),
    m("12742565-e3", 3, "singles", "Diener, Christian (24, LK15,0)", "Ehlers, Nico (53, LK18,5)", [[6, 0], [6, 1]], "home"),
    m("12742565-e4", 4, "singles", "Hallenberger, Philipp (26, LK16,0)", "Gelhart, Daniel (54, LK18,6)", [[6, 1], [6, 4]], "home"),
    m("12742565-e5", 5, "singles", "Maier, Ulf (27, LK16,0)", "Widl, Alexander (59, LK19,8)", [[6, 1], [6, 2]], "home"),
    m("12742565-e6", 6, "singles", "Richter, Sönke (36, LK18,4)", "Rohrmeier, Patrick (63, LK20,6)", [[3, 6], [6, 4], [3, 10]], "away"),
    m("12742565-d1", 7, "doubles", "Harz, Karsten / Hasselmann, Roland", "Wörner, Martin / Forchhammer, Sebastian", [[3, 6], [6, 4], [6, 10]], "away"),
    m("12742565-d2", 8, "doubles", "Diener, Christian / Maier, Ulf", "Ehlers, Nico / Schwarz, Heiko", [[6, 4], [6, 3]], "home"),
    m("12742565-d3", 9, "doubles", "Lausch, Felix / Hallenberger, Philipp", "Rohrmeier, Patrick / Gelhart, Daniel", [[0, 6], [0, 6]], "away"),
  ],
};

// TC Aschheim 6:3 TSV Haar II — echte nuLiga-Daten (meeting 12742577)
const SB_12742577: Spielbericht = {
  league: "Südliga 2 · Gr. 315",
  homeClub: "TC Aschheim",
  awayClub: "TSV Haar II",
  date: "2026-05-02",
  day: "Sa",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12742577-e1", 1, "singles", "Faschang, Michael AUT (1, LK7,2)", "Lenders, Matthias (19, LK13,4)", [[6, 2], [6, 1]], "home"),
    m("12742577-e2", 2, "singles", "Höcherl, Georg (2, LK10,5)", "Malik, Oliver (20, LK13,5)", [[5, 7], [6, 3], [10, 3]], "home"),
    m("12742577-e3", 3, "singles", "Bodai, Daniel HUN (8, LK17,9)", "Zirngibl, Rupert (22, LK13,6)", [[0, 6], [6, 4], [4, 10]], "away"),
    m("12742577-e4", 4, "singles", "Dietzel, Patrice (9, LK18,6)", "Pettazzi, Lorenzo ITA (26, LK14,9)", [[5, 7], [6, 7]], "away"),
    m("12742577-e5", 5, "singles", "Trügler, Marcus (10, LK19,2)", "Füller, Christian (29, LK15,8)", [[5, 7], [6, 2], [10, 8]], "home"),
    m("12742577-e6", 6, "singles", "Musielak, Radoslaw (25, LK24,2)", "Herrmann, Philipp (43, LK20,0)", [[6, 4], [7, 5]], "home"),
    m("12742577-d1", 7, "doubles", "Faschang, Michael AUT / Dietzel, Patrice", "Malik, Oliver / Pettazzi, Lorenzo ITA", [[7, 5], [6, 4]], "home"),
    m("12742577-d2", 8, "doubles", "Höcherl, Georg / Vogelhuber, Axel", "Lenders, Matthias / Füller, Christian", [[6, 4], [6, 2]], "home"),
    m("12742577-d3", 9, "doubles", "Trügler, Marcus / Musielak, Radoslaw", "Zirngibl, Rupert / Herrmann, Philipp", [[4, 6], [2, 6]], "away"),
  ],
};

// TSV Oberpframmern 5:1 TC Pliening — echte nuLiga-Daten (meeting 12692679)
const SB_12692679: Spielbericht = {
  league: "Südliga 4 (4er) · Gr. 292",
  homeClub: "TSV Oberpframmern",
  awayClub: "TC Pliening",
  date: "2026-06-20",
  day: "Sa",
  finalHome: 5,
  finalAway: 1,
  matches: [
    m("12692679-e1", 1, "singles", "Putzke, Christian (1, LK9,5)", "Miler, Thomas (10, LK14,3)", [[1, 6], [2, 6]], "away"),
    m("12692679-e2", 2, "singles", "Bauer, Andreas (3, LK14,9)", "Widl, Alexander (20, LK19,8)", [[6, 0], [6, 1]], "home"),
    m("12692679-e3", 3, "singles", "Lutz, Emanuel (8, LK19,5)", "Wagner, Patrick IRL (22, LK20,3)", [[6, 3], [6, 1]], "home"),
    m("12692679-e4", 4, "singles", "Meßner, Tobias (10, LK19,9)", "Bauer, Maximilian (27, LK22,1)", [[6, 2], [6, 0]], "home"),
    m("12692679-d1", 7, "doubles", "Putzke, Christian / Bauer, Andreas", "Miler, Thomas / Merkl, Maximilian", [[7, 5], [6, 4]], "home"),
    m("12692679-d2", 8, "doubles", "Lutz, Emanuel / Meßner, Tobias", "Widl, Alexander / Wagner, Patrick IRL", [[3, 6], [6, 1], [10, 6]], "home"),
  ],
};

// TSV Feldkirchen II 8:1 TC Aschheim III — echte nuLiga-Daten (meeting 12686393)
const SB_12686393: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "TSV Feldkirchen II",
  awayClub: "TC Aschheim III",
  date: "2026-06-21",
  day: "So",
  finalHome: 8,
  finalAway: 1,
  matches: [
    m("12686393-e1", 1, "singles", "Hargasser, Niclas (14, LK8,7)", "Faschang, Michael AUT (23, LK7,2)", [[6, 1], [6, 4]], "home"),
    m("12686393-e2", 2, "singles", "Schumacher, Tobias (15, LK8,8)", "Steidle, Raphael (24, LK8,6)", [[3, 6], [5, 7]], "away"),
    m("12686393-e3", 3, "singles", "Fauth, Felix (18, LK9,9)", "Fischer, Maddox (28, LK10,8)", [[6, 4], [6, 1]], "home"),
    m("12686393-e4", 4, "singles", "Kellerer, Felix (22, LK11,6)", "Kannewurf, Nils (31, LK13,1)", [[7, 6], [4, 6], [10, 6]], "home"),
    m("12686393-e5", 5, "singles", "Baade, Sebastian (24, LK11,9)", "Fausch, Quirin (36, LK16,0)", [[6, 0], [6, 1]], "home"),
    m("12686393-e6", 6, "singles", "Geuer, Felix (27, LK12,6)", "Brandt, Philip (37, LK16,2)", [[6, 2], [7, 6]], "home"),
    m("12686393-d1", 7, "doubles", "Hargasser, Niclas / Geuer, Felix", "Steidle, Raphael / Fischer, Maddox", [[6, 7], [6, 3], [10, 7]], "home"),
    m("12686393-d2", 8, "doubles", "Schumacher, Tobias / Baade, Sebastian", "Faschang, Michael AUT (w.o.) / Fausch, Quirin (w.o.)", [], "home"),
    m("12686393-d3", 9, "doubles", "Fauth, Felix / Kellerer, Felix", "Kannewurf, Nils / Brandt, Stefan", [[7, 6], [6, 1]], "home"),
  ],
};

// Polizei SV Haar 4:5 TC Erding II — echte nuLiga-Daten (meeting 12686342)
const SB_12686342: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "Polizei SV Haar",
  awayClub: "TC Erding II",
  date: "2026-06-21",
  day: "So",
  finalHome: 4,
  finalAway: 5,
  matches: [
    m("12686342-e1", 1, "singles", "Bobinger, Benno (5, LK10,7)", "Widmann, Maximilian (7, LK8,5)", [[4, 6], [3, 6]], "away"),
    m("12686342-e2", 2, "singles", "Koppmann, Tobias (16, LK14,7)", "Lachner, Zeno (14, LK10,5)", [[2, 6], [0, 6]], "away"),
    m("12686342-e3", 3, "singles", "Jessen, Frederik (17, LK14,9)", "Widmann, Florian (16, LK11,6)", [[6, 4], [4, 6], [2, 10]], "away"),
    m("12686342-e4", 4, "singles", "Zelonka, Matus (19, LK15,5)", "Widmann, Valentin (17, LK11,8)", [[7, 5], [6, 1]], "home"),
    m("12686342-e5", 5, "singles", "Erath, Andreas (22, LK17,4)", "Hildenbrand, Maximilian (20, LK12,7)", [[6, 2], [3, 6], [11, 9]], "home"),
    m("12686342-e6", 6, "singles", "Bingold, Konstantin (27, LK18,0)", "Müller, Maximilian (27, LK15,7)", [[6, 0], [6, 1]], "home"),
    m("12686342-d1", 7, "doubles", "Bobinger, Benno / Jessen, Frederik", "Widmann, Maximilian / Widmann, Valentin", [[4, 6], [2, 6]], "away"),
    m("12686342-d2", 8, "doubles", "Koppmann, Tobias / Erath, Andreas", "Lachner, Zeno / Hildenbrand, Maximilian", [[3, 6], [1, 6]], "away"),
    m("12686342-d3", 9, "doubles", "Zelonka, Matus / Stenger, Moritz", "Widmann, Florian / Müller, Maximilian", [[6, 2], [6, 3]], "home"),
  ],
};

// TF Markt Schwaben 4:5 TSV Feldkirchen II — echte nuLiga-Daten (meeting 12742502)
const SB_12742502: Spielbericht = {
  league: "Südliga 2 · Gr. 315",
  homeClub: "TF Markt Schwaben",
  awayClub: "TSV Feldkirchen II",
  date: "2026-06-20",
  day: "Sa",
  finalHome: 4,
  finalAway: 5,
  matches: [
    m("12742502-e1", 1, "singles", "Eraerds, Patrick (1, LK10,4)", "Körber, Simon (12, LK13,3)", [[3, 6], [6, 1], [10, 8]], "home"),
    m("12742502-e2", 2, "singles", "Krahnke, Andreas (3, LK13,0)", "Hargasser, Manfred (15, LK13,9)", [[6, 2], [6, 1]], "home"),
    m("12742502-e3", 3, "singles", "Leon Diaz, Esteban (5, LK14,9)", "Brand, Michael (16, LK14,4)", [[6, 3], [6, 7], [10, 7]], "home"),
    m("12742502-e4", 4, "singles", "Schreib, Ronny (10, LK21,4)", "Keil, Patrick (20, LK16,1)", [[1, 6], [0, 6]], "away"),
    m("12742502-e5", 5, "singles", "Göhrum, Andreas (14, LK22,2)", "Mutter, Sebastian (21, LK16,3)", [[0, 6], [6, 3], [10, 1]], "home"),
    m("12742502-e6", 6, "singles", "Klotz-Zürbig, Matthias (15, LK22,6)", "Eckel, Frank Alexander (27, LK20,6)", [[2, 6], [4, 6]], "away"),
    m("12742502-d1", 7, "doubles", "Krahnke, Andreas / Walther, Oliver", "Körber, Simon / Hargasser, Manfred", [[4, 6], [3, 6]], "away"),
    m("12742502-d2", 8, "doubles", "Eraerds, Patrick / Göhrum, Andreas", "Petz, Veit / Mutter, Sebastian", [[6, 3], [4, 6], [5, 10]], "away"),
    m("12742502-d3", 9, "doubles", "Leon Diaz, Esteban / Eckert, Thomas", "Brand, Michael / Keil, Patrick", [[1, 6], [0, 6]], "away"),
  ],
};

// TC Aschheim 6:3 TC Grün-Gold München II — echte nuLiga-Daten (meeting 12742404)
const SB_12742404: Spielbericht = {
  league: "Südliga 2 · Gr. 315",
  homeClub: "TC Aschheim",
  awayClub: "TC Grün-Gold München II",
  date: "2026-06-20",
  day: "Sa",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12742404-e1", 1, "singles", "Faschang, Michael AUT (1, LK7,2)", "Harz, Karsten (17, LK14,1)", [[6, 2], [6, 4]], "home"),
    m("12742404-e2", 2, "singles", "Höcherl, Georg (2, LK10,5)", "Hasselmann, Roland (21, LK14,5)", [[6, 1], [6, 3]], "home"),
    m("12742404-e3", 3, "singles", "Bodai, Daniel HUN (8, LK17,9)", "Maier, Ulf (27, LK16,0)", [[0, 6], [1, 6]], "away"),
    m("12742404-e4", 4, "singles", "Dietzel, Patrice (9, LK18,6)", "Gammisch, Sebastian (30, LK17,6)", [[6, 7], [6, 3], [14, 12]], "home"),
    m("12742404-e5", 5, "singles", "Trügler, Marcus (10, LK19,2)", "Erb, Stefan (34, LK18,2)", [[4, 6], [4, 6]], "away"),
    m("12742404-e6", 6, "singles", "Mexis, Nikolaus (18, LK23,1)", "Mummert, Markus (41, LK20,6)", [[6, 0], [6, 1]], "home"),
    m("12742404-d1", 7, "doubles", "Faschang, Michael AUT / Höcherl, Georg", "Harz, Karsten / Hasselmann, Roland", [[2, 6], [6, 4], [10, 2]], "home"),
    m("12742404-d2", 8, "doubles", "Bodai, Daniel HUN / Trügler, Marcus", "Maier, Ulf / Gammisch, Sebastian", [[1, 6], [6, 3], [8, 10]], "away"),
    m("12742404-d3", 9, "doubles", "Dietzel, Patrice / Mexis, Nikolaus", "Erb, Stefan / Kopachev, Alexey", [[7, 6], [6, 2]], "home"),
  ],
};

// ── Damen Südliga 2 · Gr. 160 (D00 Sommer 2026) — 16 Begegnungen aus nuLiga-Spielberichten ──
// TC Pliening 2:7 WB Fideliopark München II — echte nuLiga-Daten (meeting 12689650)
const SB_12689650: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Pliening",
  awayClub: "WB Fideliopark München II",
  date: "2026-05-10",
  day: "So",
  finalHome: 2,
  finalAway: 7,
  matches: [
    m("12689650-e1", 1, "singles", "Rehberg, Hanna (8, LK15,4)", "Krause, Sabine (11, LK14,3)", [[6, 2], [7, 5]], "home"),
    m("12689650-e2", 2, "singles", "Wörner, Ella (12, LK17,9)", "Gantner, Sarah (20, LK16,2)", [[3, 6], [3, 6]], "away"),
    m("12689650-e3", 3, "singles", "Erhard, Martina (15, LK18,6)", "Zerlin, Verena (26, LK18,0)", [[4, 6], [3, 6]], "away"),
    m("12689650-e4", 4, "singles", "Hollerith, Emma (17, LK19,8)", "Fendt, Leonora (27, LK18,2)", [[6, 4], [6, 7], [6, 10]], "away"),
    m("12689650-e5", 5, "singles", "Zelger, Selina (18, LK20,0)", "Denkinger, Martha (35, LK20,9)", [[1, 6], [1, 6]], "away"),
    m("12689650-e6", 6, "singles", "Bothe, Alina (32, LK25,0)", "Fichte, Annelina (36, LK21,3)", [[1, 6], [0, 6]], "away"),
    m("12689650-d1", 7, "doubles", "Rehberg, Hanna / Wörner, Ella", "Krause, Sabine / Gantner, Sarah", [[6, 2], [6, 4]], "home"),
    m("12689650-d2", 8, "doubles", "Kaltenberger, Theresa / Zelger, Selina", "Zerlin, Verena / Fendt, Leonora", [[6, 7], [6, 7]], "away"),
    m("12689650-d3", 9, "doubles", "Erhard, Martina / Hollerith, Emma", "Denkinger, Martha / Fichte, Annelina", [[3, 6], [4, 6]], "away"),
  ],
};

// TS Jahn München 5:4 TC Unterföhring — echte nuLiga-Daten (meeting 12689660)
const SB_12689660: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TS Jahn München",
  awayClub: "TC Unterföhring",
  date: "2026-06-21",
  day: "So",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12689660-e1", 1, "singles", "Fanta, Julia (1, LK14,7)", "Anic, Ana Lara (5, LK11,7)", [[6, 2], [6, 0]], "home"),
    m("12689660-e2", 2, "singles", "Mayerhofer, Monika (3, LK16,3)", "Djordjevic, Mila (w.o.) (13, LK14,2)", [], "home"),
    m("12689660-e3", 3, "singles", "Riegler, Nicola (4, LK16,9)", "Weidemann, Clara (14, LK14,4)", [[3, 6], [6, 4], [11, 13]], "away"),
    m("12689660-e4", 4, "singles", "Vogel, Joy (8, LK19,9)", "Gavrilovic, Lara (15, LK14,5)", [[2, 6], [7, 5], [10, 7]], "home"),
    m("12689660-e5", 5, "singles", "Greiser, Josefa (13, LK21,3)", "Oetzbach, Melina (27, LK17,4)", [[6, 2], [5, 7], [11, 9]], "home"),
    m("12689660-e6", 6, "singles", "Franke, Victoria (32, LK22,0)", "Winderl, Vivien (38, LK19,7)", [[2, 6], [2, 6]], "away"),
    m("12689660-d1", 7, "doubles", "Fanta, Julia / Riegler, Nicola", "Anic, Ana Lara / Gavrilovic, Lara", [[2, 6], [6, 3], [10, 5]], "home"),
    m("12689660-d2", 8, "doubles", "Mayerhofer, Monika / Vogel, Joy", "Weidemann, Clara / Oetzbach, Melina", [[6, 3], [2, 6], [1, 10]], "away"),
    m("12689660-d3", 9, "doubles", "Greiser, Josefa / Jähnigen, Charlotte", "Weihe, Theresia / Winderl, Vivien", [[3, 6], [2, 6]], "away"),
  ],
};

// TC Pliening 6:3 TS Jahn München — echte nuLiga-Daten (meeting 12689663)
const SB_12689663: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Pliening",
  awayClub: "TS Jahn München",
  date: "2026-06-14",
  day: "So",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12689663-e1", 1, "singles", "Bauer, Emma (5, LK13,1)", "Rudolph, Laura Sophie (w.o.) (6, LK19,3)", [[4, 6], [1, 0]], "home"),
    m("12689663-e2", 2, "singles", "Rehberg, Hanna (8, LK15,4)", "Laumer, Julia Theresa (7, LK19,4)", [[6, 1], [6, 2]], "home"),
    m("12689663-e3", 3, "singles", "Kaltenberger, Theresa (10, LK16,4)", "Vogel, Joy (8, LK19,9)", [[6, 4], [2, 6], [10, 8]], "home"),
    m("12689663-e4", 4, "singles", "Hollerith, Emma (17, LK19,8)", "Eichelberg, Jule (9, LK20,0)", [[6, 4], [7, 5]], "home"),
    m("12689663-e5", 5, "singles", "Zelger, Selina (18, LK20,0)", "Greiser, Josefa (13, LK21,3)", [[0, 6], [4, 6]], "away"),
    m("12689663-e6", 6, "singles", "Haun, Franziska (19, LK20,2)", "Bayer, Patricia (15, LK21,5)", [[4, 6], [1, 6]], "away"),
    m("12689663-d1", 7, "doubles", "Bauer, Emma / Rehberg, Hanna", "Laumer, Julia Theresa / D‘Andrea, Daniela", [[6, 1], [6, 0]], "home"),
    m("12689663-d2", 8, "doubles", "Kaltenberger, Theresa / Zelger, Selina", "Vogel, Joy / Eichelberg, Jule", [[6, 4], [7, 5]], "home"),
    m("12689663-d3", 9, "doubles", "Hollerith, Emma / Haun, Franziska", "Greiser, Josefa / Bayer, Patricia", [[1, 6], [5, 7]], "away"),
  ],
};

// TC Topspin 7:2 TC Unterföhring — echte nuLiga-Daten (meeting 12689666)
const SB_12689666: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Topspin",
  awayClub: "TC Unterföhring",
  date: "2026-05-10",
  day: "So",
  finalHome: 7,
  finalAway: 2,
  matches: [
    m("12689666-e1", 1, "singles", "Settele, Bärbel (1, LK9,5)", "Anic, Ana Lara (5, LK11,7)", [[6, 3], [6, 3]], "home"),
    m("12689666-e2", 2, "singles", "Quattrer, Astrid (3, LK11,7)", "Weidemann, Clara (14, LK14,4)", [[7, 5], [6, 3]], "home"),
    m("12689666-e3", 3, "singles", "Ahammer, Josefine (8, LK17,0)", "Gavrilovic, Lara (15, LK14,5)", [[1, 6], [6, 1], [10, 5]], "home"),
    m("12689666-e4", 4, "singles", "Settele, Franziska (9, LK17,2)", "Brietzke, Mira Sophie (16, LK14,7)", [[3, 6], [4, 6]], "away"),
    m("12689666-e5", 5, "singles", "Mühlbauer, Fabia (12, LK18,2)", "Oetzbach, Melina (27, LK17,4)", [[4, 6], [6, 2], [10, 7]], "home"),
    m("12689666-e6", 6, "singles", "Settmacher, Sophia (16, LK19,4)", "Winderl, Vivien (38, LK19,7)", [[6, 2], [4, 6], [7, 10]], "away"),
    m("12689666-d1", 7, "doubles", "Quattrer, Astrid / Ahammer, Josefine", "Anic, Ana Lara / Gavrilovic, Lara", [[7, 6], [2, 6], [10, 8]], "home"),
    m("12689666-d2", 8, "doubles", "Settele, Bärbel / Mühlbauer, Fabia", "Weidemann, Clara / Brietzke, Mira Sophie", [[6, 1], [7, 5]], "home"),
    m("12689666-d3", 9, "doubles", "Settmacher, Franziska / Settele, Franziska", "Oetzbach, Melina / Winderl, Vivien", [[6, 3], [6, 1]], "home"),
  ],
};

// TC Grün-Gold München 3:6 TC Neukeferloh — echte nuLiga-Daten (meeting 12689674)
const SB_12689674: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Grün-Gold München",
  awayClub: "TC Neukeferloh",
  date: "2026-06-14",
  day: "So",
  finalHome: 3,
  finalAway: 6,
  matches: [
    m("12689674-e1", 1, "singles", "Steffan, Lea (4, LK12,6)", "Sauer, Sabine (2, LK10,7)", [[2, 6], [6, 7]], "away"),
    m("12689674-e2", 2, "singles", "Strobl, Tamara (7, LK13,4)", "Brühl, Samira (4, LK13,0)", [[6, 4], [6, 3]], "home"),
    m("12689674-e3", 3, "singles", "Stadler, Amanda (20, LK19,1)", "Peters, Lara (7, LK18,2)", [[6, 2], [6, 0]], "home"),
    m("12689674-e4", 4, "singles", "Stadler, Mathilda (22, LK20,0)", "Stewardson, Rachael (8, LK18,9)", [[1, 6], [6, 4], [7, 10]], "away"),
    m("12689674-e5", 5, "singles", "Gavriilidou, Christina GRE (25, LK21,1)", "Nowara, Lena (9, LK20,0)", [[1, 6], [4, 6]], "away"),
    m("12689674-e6", 6, "singles", "Röth, Carolin (29, LK22,2)", "Wächter, Malena (13, LK21,4)", [[0, 6], [3, 6]], "away"),
    m("12689674-d1", 7, "doubles", "Steffan, Lea / Stadler, Mathilda", "Sauer, Sabine / Brühl, Samira", [[3, 6], [1, 6]], "away"),
    m("12689674-d2", 8, "doubles", "Strobl, Tamara / Stadler, Amanda", "Peters, Lara / Stewardson, Rachael", [[6, 2], [7, 6]], "home"),
    m("12689674-d3", 9, "doubles", "Gavriilidou, Christina GRE / Röth, Carolin", "Nowara, Lena / Wächter, Malena", [[3, 6], [3, 6]], "away"),
  ],
};

// TC Unterföhring 4:5 WB Fideliopark München II — echte nuLiga-Daten (meeting 12689679)
const SB_12689679: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Unterföhring",
  awayClub: "WB Fideliopark München II",
  date: "2026-05-17",
  day: "So",
  finalHome: 4,
  finalAway: 5,
  matches: [
    m("12689679-e1", 1, "singles", "Anic, Ana Lara (5, LK11,7)", "Zerlin, Verena (26, LK18,0)", [[6, 4], [4, 6], [5, 10]], "away"),
    m("12689679-e2", 2, "singles", "Brunnett, Luisa (6, LK13,1)", "Fendt, Leonora (27, LK18,2)", [[6, 3], [7, 5]], "home"),
    m("12689679-e3", 3, "singles", "Weidemann, Clara (14, LK14,4)", "Preyhs, Amelie (29, LK19,1)", [[7, 5], [6, 4]], "home"),
    m("12689679-e4", 4, "singles", "Brietzke, Felicitas (17, LK15,0)", "Denkinger, Martha (35, LK20,9)", [[1, 6], [2, 6]], "away"),
    m("12689679-e5", 5, "singles", "Oetzbach, Melina (27, LK17,4)", "Fichte, Annelina (36, LK21,3)", [[1, 6], [2, 6]], "away"),
    m("12689679-e6", 6, "singles", "Winderl, Vivien (38, LK19,7)", "Lipsky, Katharina (48, LK25,0)", [[0, 6], [2, 6]], "away"),
    m("12689679-d1", 7, "doubles", "Anic, Ana Lara / Brunnett, Luisa", "Zhu, Xiaoyun / Zerlin, Verena", [[6, 2], [6, 4]], "home"),
    m("12689679-d2", 8, "doubles", "Weidemann, Clara / Brietzke, Felicitas", "Preyhs, Amelie / Fichte, Annelina", [[6, 4], [6, 7], [10, 3]], "home"),
    m("12689679-d3", 9, "doubles", "Oetzbach, Melina / Winderl, Vivien", "Fendt, Leonora / Lipsky, Katharina", [[6, 4], [4, 6], [5, 10]], "away"),
  ],
};

// TC Steinhöring 5:4 TC Pliening — echte nuLiga-Daten (meeting 12689699)
const SB_12689699: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Steinhöring",
  awayClub: "TC Pliening",
  date: "2026-06-21",
  day: "So",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12689699-e1", 1, "singles", "Altmann, Christine (1, LK2,8)", "Bauer, Emma (5, LK13,1)", [[6, 3], [6, 3]], "home"),
    m("12689699-e2", 2, "singles", "Windstetter, Sabrina (8, LK14,1)", "Rehberg, Hanna (8, LK15,4)", [[6, 4], [4, 6], [3, 10]], "away"),
    m("12689699-e3", 3, "singles", "Herbst, Martina (10, LK17,1)", "Kaltenberger, Theresa (10, LK16,4)", [[6, 0], [6, 3]], "home"),
    m("12689699-e4", 4, "singles", "Kreuzer, Franziska (11, LK17,5)", "Wörner, Ella (12, LK17,9)", [[7, 5], [6, 3]], "home"),
    m("12689699-e5", 5, "singles", "Scheib, Sophia (12, LK17,6)", "Erhard, Martina (15, LK18,6)", [[3, 6], [1, 6]], "away"),
    m("12689699-e6", 6, "singles", "Holzgaßner, Manuela (17, LK20,3)", "Hollerith, Emma (17, LK19,8)", [[6, 3], [6, 4]], "home"),
    m("12689699-d1", 7, "doubles", "Windstetter, Sabrina / Herbst, Martina", "Bauer, Emma / Rehberg, Hanna", [[4, 6], [4, 6]], "away"),
    m("12689699-d2", 8, "doubles", "Kreuzer, Franziska / Scheib, Sophia", "Kaltenberger, Theresa / Erhard, Martina", [[6, 1], [6, 2]], "home"),
    m("12689699-d3", 9, "doubles", "Strotmann, Gaby / Holzgaßner, Manuela", "Wörner, Ella / Hollerith, Emma", [[1, 6], [2, 6]], "away"),
  ],
};

// TC Unterföhring 6:3 TC Steinhöring — echte nuLiga-Daten (meeting 12689725)
const SB_12689725: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Unterföhring",
  awayClub: "TC Steinhöring",
  date: "2026-05-03",
  day: "So",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12689725-e1", 1, "singles", "Anic, Ana Lara (5, LK11,7)", "Altmann, Christine (1, LK2,8)", [[4, 6], [0, 6]], "away"),
    m("12689725-e2", 2, "singles", "Teichmann, Letizia (12, LK14,2)", "Decker, Annette (2, LK5,3)", [[6, 2], [6, 2]], "home"),
    m("12689725-e3", 3, "singles", "Djordjevic, Mila (13, LK14,2)", "Kohlen, Franziska (9, LK14,7)", [[2, 6], [6, 4], [10, 6]], "home"),
    m("12689725-e4", 4, "singles", "Weidemann, Clara (14, LK14,4)", "Herbst, Martina (10, LK17,1)", [[6, 2], [6, 4]], "home"),
    m("12689725-e5", 5, "singles", "Gavrilovic, Lara (15, LK14,5)", "Kreuzer, Franziska (11, LK17,5)", [[7, 5], [3, 6], [10, 5]], "home"),
    m("12689725-e6", 6, "singles", "Oetzbach, Melina (27, LK17,4)", "Scheib, Sophia (12, LK17,6)", [[6, 4], [7, 5]], "home"),
    m("12689725-d1", 7, "doubles", "Anic, Ana Lara / Weidemann, Clara", "Altmann, Christine / Kohlen, Franziska", [[1, 6], [4, 6]], "away"),
    m("12689725-d2", 8, "doubles", "Teichmann, Letizia / Gavrilovic, Lara", "Windstetter, Sabrina (w.o.) / Herbst, Martina (w.o.)", [[6, 3]], "home"),
    m("12689725-d3", 9, "doubles", "Djordjevic, Mila / Oetzbach, Melina", "Windstetter, Liselotte / Kreuzer, Franziska", [[4, 6], [4, 6]], "away"),
  ],
};

// TC Steinhöring 6:3 TC Grün-Gold München — echte nuLiga-Daten (meeting 12689788)
const SB_12689788: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Steinhöring",
  awayClub: "TC Grün-Gold München",
  date: "2026-05-10",
  day: "So",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12689788-e1", 1, "singles", "Windstetter, Sabrina (8, LK14,1)", "Steffan, Lea (4, LK12,6)", [[5, 7], [2, 6]], "away"),
    m("12689788-e2", 2, "singles", "Kohlen, Franziska (9, LK14,7)", "Hetzenecker, Julia (10, LK14,0)", [[6, 7], [3, 6]], "away"),
    m("12689788-e3", 3, "singles", "Herbst, Martina (10, LK17,1)", "Hering, Paulina (w.o.) (23, LK20,3)", [], "home"),
    m("12689788-e4", 4, "singles", "Kreuzer, Franziska (11, LK17,5)", "Röth, Carolin (29, LK22,2)", [[6, 0], [6, 2]], "home"),
    m("12689788-e5", 5, "singles", "Scheib, Sophia (12, LK17,6)", "Schönfeld, Natalie (30, LK22,6)", [[6, 1], [6, 0]], "home"),
    m("12689788-e6", 6, "singles", "Lerch, Lisa (15, LK20,1)", "Reiter-Brennan, Cara (48, LK25,0)", [[6, 2], [6, 0]], "home"),
    m("12689788-d1", 7, "doubles", "Herbst, Martina / Kreuzer, Franziska", "Steffan, Lea / Hetzenecker, Julia", [[4, 6], [1, 6]], "away"),
    m("12689788-d2", 8, "doubles", "Windstetter, Sabrina / Lerch, Lisa", "Röth, Carolin / Schönfeld, Natalie", [[6, 0], [6, 0]], "home"),
    m("12689788-d3", 9, "doubles", "Kohlen, Franziska / Scheib, Sophia", "Hering, Paulina (w.o.) / Reiter-Brennan, Cara (w.o.)", [], "home"),
  ],
};

// TC Neukeferloh 5:4 TC Steinhöring — echte nuLiga-Daten (meeting 12689810)
const SB_12689810: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Neukeferloh",
  awayClub: "TC Steinhöring",
  date: "2026-05-17",
  day: "So",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12689810-e1", 1, "singles", "Sauer, Sabine (2, LK10,7)", "Windstetter, Sabrina (8, LK14,1)", [[6, 1], [6, 4]], "home"),
    m("12689810-e2", 2, "singles", "Roßberg, Franziska (6, LK14,0)", "Kohlen, Franziska (9, LK14,7)", [[6, 0], [6, 0]], "home"),
    m("12689810-e3", 3, "singles", "Stewardson, Rachael (8, LK18,9)", "Herbst, Martina (10, LK17,1)", [[7, 6], [2, 6], [8, 10]], "away"),
    m("12689810-e4", 4, "singles", "Wächter, Malena (13, LK21,4)", "Kreuzer, Franziska (11, LK17,5)", [[3, 6], [1, 6]], "away"),
    m("12689810-e5", 5, "singles", "Ulsamer, Nina-Sophia (19, LK23,6)", "Scheib, Sophia (12, LK17,6)", [[2, 6], [2, 6]], "away"),
    m("12689810-e6", 6, "singles", "Weber, Felicitas (22, LK23,9)", "Lerch, Lisa (15, LK20,1)", [[2, 6], [6, 2], [12, 10]], "home"),
    m("12689810-d1", 7, "doubles", "Sauer, Sabine / Stewardson, Rachael", "Windstetter, Sabrina / Kreuzer, Franziska", [[6, 3], [6, 2]], "home"),
    m("12689810-d2", 8, "doubles", "Roßberg, Franziska / Wächter, Malena", "Herbst, Martina / Scheib, Sophia", [[6, 1], [6, 1]], "home"),
    m("12689810-d3", 9, "doubles", "Ulsamer, Nina-Sophia / Weber, Felicitas", "Kohlen, Franziska / Lerch, Lisa", [[2, 6], [3, 6]], "away"),
  ],
};

// WB Fideliopark München II 8:1 TC Grün-Gold München — echte nuLiga-Daten (meeting 12689830)
const SB_12689830: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "WB Fideliopark München II",
  awayClub: "TC Grün-Gold München",
  date: "2026-06-21",
  day: "So",
  finalHome: 8,
  finalAway: 1,
  matches: [
    m("12689830-e1", 1, "singles", "Steger, Katharina (7, LK13,4)", "Steffan, Lea (4, LK12,6)", [[2, 6], [6, 3], [10, 3]], "home"),
    m("12689830-e2", 2, "singles", "Zhu, Xiaoyun (w.o.) (21, LK16,4)", "Wachtel, Alexandra (16, LK17,4)", [[1, 2]], "away"),
    m("12689830-e3", 3, "singles", "Zerlin, Verena (26, LK18,0)", "Offermann, Cathrin (18, LK18,1)", [[6, 4], [7, 5]], "home"),
    m("12689830-e4", 4, "singles", "Fendt, Leonora (27, LK18,2)", "Stadler, Amanda (20, LK19,1)", [[7, 5], [3, 6], [10, 8]], "home"),
    m("12689830-e5", 5, "singles", "Preyhs, Amelie (29, LK19,1)", "Stadler, Mathilda (22, LK20,0)", [[3, 6], [6, 1], [10, 6]], "home"),
    m("12689830-e6", 6, "singles", "Denkinger, Martha (35, LK20,9)", "Werner, Sarah (28, LK21,4)", [[6, 1], [6, 3]], "home"),
    m("12689830-d1", 7, "doubles", "Steger, Katharina / Keck, Jennifer", "Steffan, Lea / Stadler, Mathilda", [[6, 4], [6, 1]], "home"),
    m("12689830-d2", 8, "doubles", "Zerlin, Verena / Fendt, Leonora", "Offermann, Cathrin / Stadler, Amanda", [[6, 1], [6, 3]], "home"),
    m("12689830-d3", 9, "doubles", "Preyhs, Amelie / Denkinger, Martha", "Wachtel, Alexandra / Werner, Sarah", [[5, 7], [6, 2], [10, 4]], "home"),
  ],
};

// TS Jahn München 6:3 TC Topspin — echte nuLiga-Daten (meeting 12689844)
const SB_12689844: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TS Jahn München",
  awayClub: "TC Topspin",
  date: "2026-05-17",
  day: "So",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12689844-e1", 1, "singles", "Fanta, Julia (1, LK14,7)", "Quattrer, Astrid (3, LK11,7)", [[3, 6], [2, 6]], "away"),
    m("12689844-e2", 2, "singles", "Stuhler, Francesca (2, LK15,0)", "Daumoser, Melanie (5, LK15,9)", [[6, 0], [6, 1]], "home"),
    m("12689844-e3", 3, "singles", "Mayerhofer, Monika (3, LK16,3)", "Ahammer, Josefine (8, LK17,0)", [[6, 4], [1, 6], [10, 5]], "home"),
    m("12689844-e4", 4, "singles", "Riegler, Nicola (4, LK16,9)", "Schütze, Veronika (13, LK18,5)", [[3, 6], [2, 6]], "away"),
    m("12689844-e5", 5, "singles", "Rudolph, Laura Sophie (6, LK19,3)", "Kerscher, Eva (19, LK20,3)", [[6, 0], [6, 0]], "home"),
    m("12689844-e6", 6, "singles", "Vogel, Joy (8, LK19,9)", "Ahammer, Leonie (20, LK20,4)", [[6, 3], [6, 3]], "home"),
    m("12689844-d1", 7, "doubles", "Fanta, Julia / Stuhler, Francesca", "Ahammer, Josefine / Schütze, Veronika", [[6, 2], [6, 1]], "home"),
    m("12689844-d2", 8, "doubles", "Riegler, Nicola / Rudolph, Laura Sophie", "Quattrer, Astrid / Ahammer, Leonie", [[5, 7], [6, 2], [8, 10]], "away"),
    m("12689844-d3", 9, "doubles", "Mayerhofer, Monika / Vogel, Joy", "Daumoser, Melanie / Kerscher, Eva", [[6, 0], [6, 1]], "home"),
  ],
};

// TC Topspin 5:4 TC Neukeferloh — echte nuLiga-Daten (meeting 12689855)
const SB_12689855: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Topspin",
  awayClub: "TC Neukeferloh",
  date: "2026-06-21",
  day: "So",
  finalHome: 5,
  finalAway: 4,
  matches: [
    m("12689855-e1", 1, "singles", "Daumoser, Melanie (5, LK15,9)", "Brühl, Samira (4, LK13,0)", [[6, 7], [6, 1], [6, 10]], "away"),
    m("12689855-e2", 2, "singles", "Kilian, Sandra (7, LK16,2)", "Roßberg, Franziska (6, LK14,0)", [[0, 6], [4, 6]], "away"),
    m("12689855-e3", 3, "singles", "Ahammer, Josefine (8, LK17,0)", "Stewardson, Rachael (8, LK18,9)", [[5, 7], [6, 2], [10, 12]], "away"),
    m("12689855-e4", 4, "singles", "Settele, Franziska (9, LK17,2)", "Gortol, Lena (10, LK20,0)", [[6, 1], [6, 1]], "home"),
    m("12689855-e5", 5, "singles", "Adler, Miriam (10, LK17,6)", "Kahlhammer, Katharina (16, LK23,0)", [[6, 2], [3, 6], [10, 8]], "home"),
    m("12689855-e6", 6, "singles", "Kerscher, Lena (21, LK20,5)", "Peters, Nicole (20, LK23,6)", [[6, 2], [6, 4]], "home"),
    m("12689855-d1", 7, "doubles", "Settele, Bärbel / Kilian, Sandra", "Brühl, Samira / Stewardson, Rachael", [[6, 1], [6, 3]], "home"),
    m("12689855-d2", 8, "doubles", "Daumoser, Melanie / Adler, Miriam", "Roßberg, Franziska / Kahlhammer, Katharina", [[2, 6], [1, 6]], "away"),
    m("12689855-d3", 9, "doubles", "Ahammer, Josefine / Kerscher, Lena", "Gortol, Lena / Peters, Nicole", [[6, 2], [6, 0]], "home"),
  ],
};

// TC Pliening 6:3 TC Grün-Gold München — echte nuLiga-Daten (meeting 12689883)
const SB_12689883: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Pliening",
  awayClub: "TC Grün-Gold München",
  date: "2026-05-03",
  day: "So",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12689883-e1", 1, "singles", "Bauer, Emma (5, LK13,1)", "Steffan, Lea (4, LK12,6)", [[4, 6], [6, 0], [10, 3]], "home"),
    m("12689883-e2", 2, "singles", "Rehberg, Hanna (8, LK15,4)", "Hetzenecker, Julia (10, LK14,0)", [[6, 2], [7, 6]], "home"),
    m("12689883-e3", 3, "singles", "Wörner, Ella (12, LK17,9)", "Vennemann, Emma (17, LK18,1)", [[6, 4], [6, 3]], "home"),
    m("12689883-e4", 4, "singles", "Erhard, Martina (15, LK18,6)", "Offermann, Cathrin (18, LK18,1)", [[4, 6], [2, 6]], "away"),
    m("12689883-e5", 5, "singles", "Zelger, Selina (18, LK20,0)", "Hombach, Victoria (36, LK23,0)", [[6, 1], [6, 1]], "home"),
    m("12689883-e6", 6, "singles", "Haun, Franziska (19, LK20,2)", "Gerischer, Marina (45, LK24,2)", [[6, 3], [4, 6], [7, 10]], "away"),
    m("12689883-d1", 7, "doubles", "Rehberg, Hanna / Wörner, Ella", "Steffan, Lea / Gerischer, Marina", [[2, 6], [6, 4], [10, 4]], "home"),
    m("12689883-d2", 8, "doubles", "Bauer, Emma / Zelger, Selina", "Hetzenecker, Julia / Hombach, Victoria", [[6, 0], [6, 2]], "home"),
    m("12689883-d3", 9, "doubles", "Hollerith, Emma / Haun, Franziska", "Vennemann, Emma / Offermann, Cathrin", [[6, 4], [5, 7], [8, 10]], "away"),
  ],
};

// WB Fideliopark München II 8:1 TC Topspin — echte nuLiga-Daten (meeting 12689899)
const SB_12689899: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "WB Fideliopark München II",
  awayClub: "TC Topspin",
  date: "2026-05-03",
  day: "So",
  finalHome: 8,
  finalAway: 1,
  matches: [
    m("12689899-e1", 1, "singles", "Mayr, Ramona (8, LK13,9)", "Ahammer, Josefine (8, LK17,0)", [[6, 4], [6, 3]], "home"),
    m("12689899-e2", 2, "singles", "Berghüser, Sophie Marie (9, LK13,9)", "Settele, Franziska (9, LK17,2)", [[6, 3], [6, 2]], "home"),
    m("12689899-e3", 3, "singles", "Gonzalo Saul, Carlota (16, LK15,5)", "Schütze, Veronika (13, LK18,5)", [[6, 3], [6, 2]], "home"),
    m("12689899-e4", 4, "singles", "Fendt, Leonora (27, LK18,2)", "Kerscher, Eva (w.o.) (19, LK20,3)", [[6, 0]], "home"),
    m("12689899-e5", 5, "singles", "Ehlert, Stefanie (43, LK24,5)", "Kerscher, Lena (21, LK20,5)", [[5, 7], [0, 6]], "away"),
    m("12689899-e6", 6, "singles", "Lipsky, Katharina (48, LK25,0)", "Kerscher, Hanna (27, LK23,4)", [[6, 4], [4, 6], [10, 6]], "home"),
    m("12689899-d1", 7, "doubles", "Berghüser, Sophie Marie / Gonzalo Saul, Carlota", "Settele, Franziska / Schütze, Veronika", [[6, 1], [6, 3]], "home"),
    m("12689899-d2", 8, "doubles", "Mayr, Ramona / Fendt, Leonora", "Ahammer, Josefine / Kerscher, Lena", [[7, 5], [6, 0]], "home"),
    m("12689899-d3", 9, "doubles", "Ehlert, Stefanie / Lipsky, Katharina", "Kerscher, Eva / Kerscher, Hanna", [[6, 2], [6, 3]], "home"),
  ],
};

// TC Neukeferloh 6:3 TS Jahn München — echte nuLiga-Daten (meeting 12689902)
const SB_12689902: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Neukeferloh",
  awayClub: "TS Jahn München",
  date: "2026-05-10",
  day: "So",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12689902-e1", 1, "singles", "Roßberg, Franziska (6, LK14,0)", "Fanta, Julia (1, LK14,7)", [[4, 6], [6, 2], [10, 2]], "home"),
    m("12689902-e2", 2, "singles", "Peters, Lara (7, LK18,2)", "Stuhler, Francesca (2, LK15,0)", [[2, 6], [2, 6]], "away"),
    m("12689902-e3", 3, "singles", "Stewardson, Rachael (8, LK18,9)", "Vogel, Joy (8, LK19,9)", [[6, 2], [6, 4]], "home"),
    m("12689902-e4", 4, "singles", "Wächter, Malena (13, LK21,4)", "D‘Andrea, Daniela (12, LK20,9)", [[3, 6], [7, 5], [2, 10]], "away"),
    m("12689902-e5", 5, "singles", "Silbereisen, Theresa (14, LK22,1)", "Eberle, Marina RUS* (22, LK21,6)", [[6, 4], [6, 1]], "home"),
    m("12689902-e6", 6, "singles", "Ulsamer, Nina-Sophia (19, LK23,6)", "Matthäus, Fernanda Anne (30, LK25,0)", [[7, 6], [6, 4]], "home"),
    m("12689902-d1", 7, "doubles", "Roßberg, Franziska / Wächter, Malena", "Fanta, Julia / Stuhler, Francesca", [[6, 4], [4, 6], [10, 12]], "away"),
    m("12689902-d2", 8, "doubles", "Peters, Lara / Stewardson, Rachael", "Vogel, Joy / D‘Andrea, Daniela", [[6, 4], [6, 2]], "home"),
    m("12689902-d3", 9, "doubles", "Silbereisen, Theresa / Ulsamer, Nina-Sophia", "Eberle, Marina RUS* / Matthäus, Fernanda Anne", [[6, 3], [6, 2]], "home"),
  ],
};

// TC Philathlos München 2:4 TC Putzbrunn — echte nuLiga-Daten (meeting 12692627)
const SB_12692627: Spielbericht = {
  league: "Südliga 4 (4er) · Gr. 292",
  homeClub: "TC Philathlos München",
  awayClub: "TC Putzbrunn",
  date: "2026-06-20",
  day: "Sa",
  finalHome: 2,
  finalAway: 4,
  matches: [
    m("12692627-e1", 1, "singles", "Stöcklein, Veit (1, LK15,4)", "Karatasos, Kostantinos GRE (2, LK15,4)", [[6, 2], [6, 4]], "home"),
    m("12692627-e2", 2, "singles", "Lehner, Ulrich AUT (10, LK20,4)", "Schnurr, Matthias (4, LK20,4)", [[2, 6], [1, 6]], "away"),
    m("12692627-e3", 3, "singles", "Meckbach, Konstantin (12, LK21,7)", "Sturm, Kevin (5, LK20,7)", [[6, 1], [3, 6], [0, 10]], "away"),
    m("12692627-e4", 4, "singles", "Schob, Victor (17, LK22,9)", "Sohn, Andreas (7, LK22,8)", [[3, 6], [2, 6]], "away"),
    m("12692627-d1", 7, "doubles", "Stöcklein, Veit / Schob, Victor", "Karatasos, Kostantinos GRE / Schnurr, Matthias", [[3, 6], [4, 6]], "away"),
    m("12692627-d2", 8, "doubles", "Lehner, Ulrich AUT / Meckbach, Konstantin", "Sturm, Kevin / Sohn, Andreas", [[5, 7], [6, 3], [10, 8]], "home"),
  ],
};

// TC Pliening 4:5 TC Grün-Weiß Gräfelfing — echte nuLiga-Daten (meeting 12556794)
const SB_12556794: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "TC Pliening",
  awayClub: "TC Grün-Weiß Gräfelfing",
  date: "2026-06-20",
  day: "Sa",
  finalHome: 4,
  finalAway: 5,
  matches: [
    m("12556794-e1", 1, "singles", "Hahn, Matthias (4, LK2,1)", "Gürtner, Andreas (3, LK2,0)", [[6, 2], [3, 6], [10, 2]], "home"),
    m("12556794-e2", 2, "singles", "Reicherseder, Christian (8, LK3,2)", "Weislmaier, Dieter (4, LK3,4)", [[6, 3], [0, 6], [3, 10]], "away"),
    m("12556794-e3", 3, "singles", "Hauser, Michael (9, LK3,2)", "Fellner, Helmuth AUT (7, LK4,4)", [[4, 6], [4, 6]], "away"),
    m("12556794-e4", 4, "singles", "Gottwald, Markus (15, LK4,6)", "Kozisek, Tomas CZE (8, LK4,4)", [[2, 6], [3, 6]], "away"),
    m("12556794-e5", 5, "singles", "Bosch, Simon (18, LK5,4)", "Schwenk, Christian AUT (13, LK5,5)", [[6, 2], [6, 2]], "home"),
    m("12556794-e6", 6, "singles", "Aigner, Peter (23, LK6,1)", "Geissler, Mathias (16, LK6,1)", [[6, 1], [6, 0]], "home"),
    m("12556794-d1", 7, "doubles", "Reicherseder, Christian / Hauser, Michael", "Gürtner, Andreas / Fellner, Helmuth AUT", [[6, 7], [4, 6]], "away"),
    m("12556794-d2", 8, "doubles", "Hahn, Matthias / Lenart, Emil", "Weislmaier, Dieter / Geissler, Mathias", [[3, 6], [2, 6]], "away"),
    m("12556794-d3", 9, "doubles", "Bosch, Simon / Aigner, Peter", "Kozisek, Tomas CZE / Schwenk, Christian AUT", [[3, 6], [6, 3], [10, 5]], "home"),
  ],
};

// TSV Kottern 6:3 TC Herzogenaurach — echte nuLiga-Daten (meeting 12556792)
const SB_12556792: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "TSV Kottern",
  awayClub: "TC Herzogenaurach",
  date: "2026-06-20",
  day: "Sa",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12556792-e1", 1, "singles", "Marsoun, Lukas CZE (1, LK3,5)", "Devoty, Theodor CZE (1, LK3,1)", [[4, 6], [0, 6]], "away"),
    m("12556792-e2", 2, "singles", "Birner, Christoph (3, LK4,6)", "Moser, Klaus-Ferdinand (2, LK3,1)", [[6, 4], [6, 1]], "home"),
    m("12556792-e3", 3, "singles", "Kiefer, Florian AUT (6, LK5,5)", "Dörschuck, Thomas (7, LK3,9)", [[2, 6], [1, 6]], "away"),
    m("12556792-e4", 4, "singles", "Erhart, Pauli AUT (7, LK5,7)", "Roth, Stephan (8, LK4,1)", [[6, 1], [6, 2]], "home"),
    m("12556792-e5", 5, "singles", "Hörmann, Thomas (8, LK7,0)", "Hinkmann, Fabian (10, LK4,5)", [[6, 4], [7, 5]], "home"),
    m("12556792-e6", 6, "singles", "Rampazzo, Sascha ITA (11, LK8,4)", "Nicklisch, Oliver (18, LK12,0)", [[6, 3], [6, 0]], "home"),
    m("12556792-d1", 7, "doubles", "Marsoun, Lukas CZE / Kiefer, Florian AUT", "Moser, Klaus-Ferdinand / Dörschuck, Thomas", [[6, 1], [7, 5]], "home"),
    m("12556792-d2", 8, "doubles", "Birner, Christoph / Hörmann, Thomas", "Devoty, Theodor CZE / Roth, Stephan", [[5, 7], [6, 7]], "away"),
    m("12556792-d3", 9, "doubles", "Erhart, Pauli AUT / Rampazzo, Sascha ITA", "Hinkmann, Fabian / Nicklisch, Oliver", [[6, 2], [6, 2]], "home"),
  ],
};

// SpVgg Zolling 2:7 Bad WH Dresden — echte nuLiga-Daten (meeting 12556773)
const SB_12556773: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "SpVgg Zolling",
  awayClub: "Bad WH Dresden",
  date: "2026-06-21",
  day: "So",
  finalHome: 2,
  finalAway: 7,
  matches: [
    m("12556773-e1", 1, "singles", "Jarczyk, Herbert (w.o.) (5, LK2,6)", "Nebojsa, Stanislav CZE (2, LK2,4)", [[2, 6], [0, 3]], "away"),
    m("12556773-e2", 2, "singles", "Stippler, Toni (w.o.) (6, LK2,8)", "Triebe, Mathias (3, LK2,5)", [[0, 1]], "away"),
    m("12556773-e3", 3, "singles", "Braun, Michael (w.o.) (20, LK8,9)", "Tränkner, Stefan (4, LK2,6)", [[0, 1]], "away"),
    m("12556773-e4", 4, "singles", "Garcia Wannack, Markus (23, LK10,0)", "Möhrke, Christian (5, LK2,9)", [[0, 6], [0, 6]], "away"),
    m("12556773-e5", 5, "singles", "Weisshuhn, Philip (25, LK10,6)", "Makaschin, Sergej (8, LK4,3)", [[2, 6], [1, 6]], "away"),
    m("12556773-e6", 6, "singles", "Sorg, Michael (27, LK11,0)", "Simon, Tim (w.o.) (13, LK25,0)", [[0, 1]], "home"),
    m("12556773-d1", 7, "doubles", "Jarczyk, Herbert (w.o.) / Stippler, Toni (w.o.)", "Nebojsa, Stanislav CZE / Triebe, Mathias", [], "away"),
    m("12556773-d2", 8, "doubles", "Braun, Michael (w.o.) / Garcia Wannack, Markus (w.o.)", "Tränkner, Stefan / Möhrke, Christian", [], "away"),
    m("12556773-d3", 9, "doubles", "Weisshuhn, Philip / Sorg, Michael", "Makaschin, Sergej (w.o.) / Simon, Tim (w.o.)", [], "home"),
  ],
};

// MTTC Iphitos München 8:1 TC Kümmersbruck — echte nuLiga-Daten (meeting 12556802)
const SB_12556802: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "MTTC Iphitos München",
  awayClub: "TC Kümmersbruck",
  date: "2026-06-21",
  day: "So",
  finalHome: 8,
  finalAway: 1,
  matches: [
    m("12556802-e1", 1, "singles", "Beck, Karol SVK (3, LK2,0)", "Bauer, Jochen (3, LK2,6)", [[6, 2], [6, 1]], "home"),
    m("12556802-e2", 2, "singles", "Kralert, Petr CZE (5, LK2,0)", "Schönwetter, Dominik (w.o.) (5, LK5,3)", [[7, 5]], "home"),
    m("12556802-e3", 3, "singles", "Senkbeil, Marc (7, LK2,0)", "Heckmann, Tobias (7, LK7,4)", [[6, 2], [1, 6], [12, 10]], "home"),
    m("12556802-e4", 4, "singles", "Hutt, Felix (8, LK2,7)", "Meier, Stefan (8, LK8,3)", [[6, 1], [6, 3]], "home"),
    m("12556802-e5", 5, "singles", "Soulier, Andre (10, LK3,2)", "Gietl, Alexander (15, LK10,9)", [[6, 4], [7, 5]], "home"),
    m("12556802-e6", 6, "singles", "Gottesleben, Patrick (16, LK5,3)", "Sperber, Christoph (21, LK14,0)", [[6, 3], [6, 4]], "home"),
    m("12556802-d1", 7, "doubles", "Beck, Karol SVK (w.o.) / Kralert, Petr CZE (w.o.)", "Bauer, Jochen / Schönwetter, Dominik", [], "away"),
    m("12556802-d2", 8, "doubles", "Senkbeil, Marc / Hutt, Felix", "Heckmann, Tobias (w.o.) / Meier, Stefan (w.o.)", [], "home"),
    m("12556802-d3", 9, "doubles", "Soulier, Andre / Gottesleben, Patrick", "Gietl, Alexander (w.o.) / Sperber, Christoph (w.o.)", [], "home"),
  ],
};

// TC Herzogenaurach 6:3 SpVgg Zolling — echte nuLiga-Daten (meeting 12556798)
const SB_12556798: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "TC Herzogenaurach",
  awayClub: "SpVgg Zolling",
  date: "2026-06-27",
  day: "Sa",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12556798-e1", 1, "singles", "Moser, Klaus-Ferdinand (2, LK3,1)", "Knieper, Philipp (2, LK2,6)", [[6, 7], [4, 6]], "away"),
    m("12556798-e2", 2, "singles", "Gaber, Jakob SLO (3, LK3,1)", "Spousta, Jiri CZE (w.o.) (4, LK2,6)", [[1, 0]], "home"),
    m("12556798-e3", 3, "singles", "Hippenstiel, Björn (5, LK3,7)", "Jarczyk, Herbert (5, LK2,6)", [[3, 6], [4, 6]], "away"),
    m("12556798-e4", 4, "singles", "Dörschuck, Thomas (7, LK3,9)", "Ludwig, Sven (w.o.) (8, LK4,6)", [[2, 1]], "home"),
    m("12556798-e5", 5, "singles", "Roth, Stephan (8, LK4,1)", "Weisshuhn, Philip (25, LK10,6)", [[6, 3], [6, 1]], "home"),
    m("12556798-e6", 6, "singles", "Hinkmann, Fabian (10, LK4,5)", "Lehner, Marcus (w.o.) (30, LK12,8)", [[4, 0]], "home"),
    m("12556798-d1", 7, "doubles", "Moser, Klaus-Ferdinand (w.o.) / Gaber, Jakob SLO (w.o.)", "Knieper, Philipp / Spousta, Jiri CZE", [[0, 1]], "away"),
    m("12556798-d2", 8, "doubles", "Hippenstiel, Björn / Hinkmann, Fabian", "Jarczyk, Herbert (w.o.) / Ludwig, Sven (w.o.)", [[1, 0]], "home"),
    m("12556798-d3", 9, "doubles", "Dörschuck, Thomas / Roth, Stephan", "Weisshuhn, Philip (w.o.) / Lehner, Marcus (w.o.)", [[1, 0]], "home"),
  ],
};

// TC Kümmersbruck 6:3 TC Pliening — echte nuLiga-Daten (meeting 12556821)
const SB_12556821: Spielbericht = {
  league: "Regionalliga Süd-Ost · Gr. 004",
  homeClub: "TC Kümmersbruck",
  awayClub: "TC Pliening",
  date: "2026-06-27",
  day: "Sa",
  finalHome: 6,
  finalAway: 3,
  matches: [
    m("12556821-e1", 1, "singles", "Schiessl, Sebastian (1, LK1,6)", "Maucher, Steffen (3, LK2,1)", [[6, 1], [6, 1]], "home"),
    m("12556821-e2", 2, "singles", "Vögeli, Roman CZE (2, LK2,5)", "Hahn, Matthias (4, LK2,1)", [[6, 0], [6, 7], [10, 7]], "home"),
    m("12556821-e3", 3, "singles", "Stork, Robin CZE (4, LK4,8)", "Reicherseder, Christian (8, LK3,2)", [[6, 7], [6, 3], [10, 7]], "home"),
    m("12556821-e4", 4, "singles", "Schönwetter, Dominik (5, LK5,3)", "Hauser, Michael (9, LK3,2)", [[6, 2], [6, 0]], "home"),
    m("12556821-e5", 5, "singles", "Heckmann, Tobias (7, LK7,4)", "Bosch, Simon (18, LK5,4)", [[6, 3], [6, 4]], "home"),
    m("12556821-e6", 6, "singles", "Meier, Stefan (w.o.) (8, LK8,3)", "Aigner, Peter (23, LK6,1)", [[1, 6], [0, 3]], "away"),
    m("12556821-d1", 7, "doubles", "Schiessl, Sebastian (w.o.) / Vögeli, Roman CZE (w.o.)", "Maucher, Steffen / Hahn, Matthias", [], "away"),
    m("12556821-d2", 8, "doubles", "Stork, Robin CZE / Schönwetter, Dominik", "Reicherseder, Christian (w.o.) / Hauser, Michael (w.o.)", [], "home"),
    m("12556821-d3", 9, "doubles", "Heckmann, Tobias (w.o.) / Meier, Stefan (w.o.)", "Bosch, Simon / Aigner, Peter", [], "away"),
  ],
};

// TC Pliening 0:9 TF Markt Schwaben — echte nuLiga-Daten (meeting 12686527)
const SB_12686527: Spielbericht = {
  league: "Südliga 2 · Gr. 023",
  homeClub: "TC Pliening",
  awayClub: "TF Markt Schwaben",
  date: "2026-06-21",
  day: "So",
  finalHome: 0,
  finalAway: 9,
  matches: [
    m("12686527-e1", 1, "singles", "Krug, Max (9, LK8,8)", "Simml, Marco (1, LK5,8)", [[5, 7], [0, 6]], "away"),
    m("12686527-e2", 2, "singles", "Kerger, Justus (15, LK12,7)", "Huber, Andreas (2, LK7,9)", [[2, 6], [3, 6]], "away"),
    m("12686527-e3", 3, "singles", "Volkwein, Samuel (16, LK13,3)", "Lohmaier, Lukas (3, LK8,0)", [[0, 6], [1, 6]], "away"),
    m("12686527-e4", 4, "singles", "Miler, Thomas (18, LK14,3)", "Nahrhaft, Lukas (6, LK9,3)", [[4, 6], [6, 4], [10, 12]], "away"),
    m("12686527-e5", 5, "singles", "Graeve, Ben (21, LK16,9)", "Warta, Roland (7, LK9,9)", [[0, 6], [0, 6]], "away"),
    m("12686527-e6", 6, "singles", "Hempel, Frederick (25, LK19,7)", "Herling, Fabian (11, LK12,7)", [[0, 6], [2, 6]], "away"),
    m("12686527-d1", 7, "doubles", "Slepchenko, Vitaliy / Kerger, Justus", "Simml, Marco / Huber, Andreas", [[1, 6], [4, 6]], "away"),
    m("12686527-d2", 8, "doubles", "Volkwein, Samuel / Davis, Louis", "Lohmaier, Lukas / Warta, Roland", [[2, 6], [0, 6]], "away"),
    m("12686527-d3", 9, "doubles", "Miler, Thomas / Hempel, Frederick", "Nahrhaft, Lukas / Herling, Fabian", [[2, 6], [2, 6]], "away"),
  ],
};

// TC Topspin 2:7 TC Pliening — echte nuLiga-Daten (meeting 12689623)
const SB_12689623: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Topspin",
  awayClub: "TC Pliening",
  date: "2026-06-28",
  day: "So",
  finalHome: 2,
  finalAway: 7,
  matches: [
    m("12689623-e1", 1, "singles", "Settele, Bärbel (1, LK9,5)", "Bauer, Emma (5, LK13,1)", [[5, 7], [1, 6]], "away"),
    m("12689623-e2", 2, "singles", "Quattrer, Astrid (3, LK11,7)", "Rehberg, Hanna (8, LK15,4)", [[6, 4], [7, 6]], "home"),
    m("12689623-e3", 3, "singles", "Ahammer, Josefine (8, LK17,0)", "Kaltenberger, Theresa (10, LK16,4)", [[3, 6], [2, 6]], "away"),
    m("12689623-e4", 4, "singles", "Mühlbauer, Fabia (12, LK18,2)", "Erhard, Martina (15, LK18,6)", [[6, 7], [1, 6]], "away"),
    m("12689623-e5", 5, "singles", "Ludwig, Sophie (18, LK20,2)", "Hollerith, Emma (17, LK19,8)", [[0, 6], [0, 6]], "away"),
    m("12689623-e6", 6, "singles", "Weinzierl, Christina (28, LK23,6)", "Zelger, Selina (18, LK20,0)", [[0, 6], [1, 6]], "away"),
    m("12689623-d1", 7, "doubles", "Settele, Bärbel (w.o.) / Quattrer, Astrid (w.o.)", "Bauer, Emma / Rehberg, Hanna", [], "away"),
    m("12689623-d2", 8, "doubles", "Ahammer, Josefine / Mühlbauer, Fabia", "Kaltenberger, Theresa (w.o.) / Erhard, Martina (w.o.)", [], "home"),
    m("12689623-d3", 9, "doubles", "Ludwig, Sophie (w.o.) / Ahammer, Leonie (w.o.)", "Hollerith, Emma / Zelger, Selina", [], "away"),
  ],
};

// TC Neukeferloh 2:7 TC Unterföhring — echte nuLiga-Daten (meeting 12689661)
const SB_12689661: Spielbericht = {
  league: "Südliga 2 · Gr. 160",
  homeClub: "TC Neukeferloh",
  awayClub: "TC Unterföhring",
  date: "2026-06-28",
  day: "So",
  finalHome: 2,
  finalAway: 7,
  matches: [
    m("12689661-e1", 1, "singles", "Sauer, Sabine (2, LK10,7)", "Anic, Ana Lara (5, LK11,7)", [[7, 6], [6, 3]], "home"),
    m("12689661-e2", 2, "singles", "Stewardson, Rachael (8, LK18,9)", "Djordjevic, Mila (13, LK14,2)", [[1, 6], [1, 6]], "away"),
    m("12689661-e3", 3, "singles", "Gortol, Lena (10, LK20,0)", "Weidemann, Clara (14, LK14,4)", [[1, 6], [1, 6]], "away"),
    m("12689661-e4", 4, "singles", "Bretting, Stefanie (12, LK21,2)", "Gavrilovic, Lara (15, LK14,5)", [[5, 7], [2, 6]], "away"),
    m("12689661-e5", 5, "singles", "Wächter, Malena (13, LK21,4)", "Brietzke, Felicitas (17, LK15,0)", [[0, 6], [0, 6]], "away"),
    m("12689661-e6", 6, "singles", "Peters, Nicole (20, LK23,6)", "Oetzbach, Melina (27, LK17,4)", [[2, 6], [1, 6]], "away"),
    m("12689661-d1", 7, "doubles", "Sauer, Sabine / Wächter, Malena", "Djordjevic, Mila / Weidemann, Clara", [[6, 3], [6, 0]], "home"),
    m("12689661-d2", 8, "doubles", "Gortol, Lena / Peters, Nicole", "Anic, Ana Lara / Gavrilovic, Lara", [[0, 6], [0, 6]], "away"),
    m("12689661-d3", 9, "doubles", "Bretting, Stefanie / Kahlhammer, Katharina", "Brietzke, Felicitas / Oetzbach, Melina", [[4, 6], [0, 6]], "away"),
  ],
};

const ALL: Spielbericht[] = [
  SB_12692627,
  SB_12556794,
  SB_12556792,
  SB_12556773,
  SB_12556802,
  SB_12556798,
  SB_12556821,
  SB_12686527,
  SB_12689623,
  SB_12689661,
  SB_12689650,
  SB_12689660,
  SB_12689663,
  SB_12689666,
  SB_12689674,
  SB_12689679,
  SB_12689699,
  SB_12689725,
  SB_12689788,
  SB_12689810,
  SB_12689830,
  SB_12689844,
  SB_12689855,
  SB_12689883,
  SB_12689899,
  SB_12689902,
  SB_12686331,
  SB_12686332,
  SB_12686339,
  SB_12686344,
  SB_12686362,
  SB_12686367,
  SB_12686404,
  SB_12686409,
  SB_12686412,
  SB_12686481,
  SB_12686499,
  SB_12686506,
  SB_12692665,
  SB_12692624,
  SB_12692763,
  SB_12692807,
  SB_12556760,
  SB_12556761,
  SB_12556763,
  SB_12556767,
  SB_12556771,
  SB_12556776,
  SB_12556777,
  SB_12556778,
  SB_12556782,
  SB_12556790,
  SB_12556791,
  SB_12556793,
  SB_12556809,
  SB_12556812,
  SB_12556819,
  SB_12556822,
  SB_12742402,
  SB_12742413,
  SB_12742450,
  SB_12742475,
  SB_12742477,
  SB_12742536,
  SB_12742553,
  SB_12742565,
  SB_12742577,
  SB_12692679,
  SB_12686393,
  SB_12686342,
  SB_12742502,
  SB_12742404,
];

const SPIELBERICHTE: Record<string, Spielbericht> = Object.fromEntries(
  ALL.map((b) => [key(b.league, b.homeClub, b.awayClub), b]),
);

// Richtungsunabhängig: prüft beide Reihenfolgen (Zeilen-/Spalten-Verein der Kreuztabelle).
export function getSpielbericht(league: string, clubA: string, clubB: string): Spielbericht | null {
  return SPIELBERICHTE[key(league, clubA, clubB)] ?? SPIELBERICHTE[key(league, clubB, clubA)] ?? null;
}

// Alle erfassten Spielberichte (für saisonweite Auswertungen wie die Spieler-Statistik).
export function getAllSpielberichte(): Spielbericht[] {
  return ALL;
}
