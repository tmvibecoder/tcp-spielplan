import type { IndividualMatch } from "../types";
import type { Spielbericht } from "../utils/spielbericht";

// Spielberichte (Einzel/Doppel je Begegnung) der H00-Konkurrenz — ECHTE nuLiga-Daten.
// Quelle: BTV nuLiga "MeetingReportFOP" je Begegnung (…/nuDokument?dokument=MeetingReportFOP&meeting=<ID>).
// Auto-generiert aus den Spielbericht-PDFs (Stand 17.06.2026). Doppel ohne LK, da nuLiga sie dort nicht ausweist.
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

const ALL: Spielbericht[] = [
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
];

const SPIELBERICHTE: Record<string, Spielbericht> = Object.fromEntries(
  ALL.map((b) => [key(b.league, b.homeClub, b.awayClub), b]),
);

// Richtungsunabhängig: prüft beide Reihenfolgen (Zeilen-/Spalten-Verein der Kreuztabelle).
export function getSpielbericht(league: string, clubA: string, clubB: string): Spielbericht | null {
  return SPIELBERICHTE[key(league, clubA, clubB)] ?? SPIELBERICHTE[key(league, clubB, clubA)] ?? null;
}
