import type { ReactNode } from "react";

interface LegalPageProps {
  onBack: () => void;
}

// Impressum und Datenschutzerklärung — Stand 09.10.2026 nach der DSGVO-Prüfung.
// Was hier steht, muss zur Technik passen: keine Google Fonts mehr (selbst
// gehostet), Live-Zwischenstände (Supabase) standardmäßig aus, Spielerdaten aus
// dem BTV-Spielbetrieb mit Schutz für Minderjährige (scripts/schutz.mjs) und
// Widerspruchsweg (scripts/sperrliste.json). Ändert sich die Technik, diese
// Texte im selben Zug anpassen.

const KONTAKT = "thomas.miler1234@gmail.com";

function Mail() {
  return (
    <a href={`mailto:${KONTAKT}`} className="text-sky-400 hover:text-sky-300">
      {KONTAKT}
    </a>
  );
}

function Page({ title, onBack, children }: LegalPageProps & { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={onBack} className="mb-6 text-sm text-sky-400 hover:text-sky-300 transition-colors">
          ← Zurück zum Spielplan
        </button>
        <h1 className="text-2xl font-extrabold mb-6">{title}</h1>
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-bold text-slate-100 mb-2">{children}</h2>;
}

export function Impressum({ onBack }: LegalPageProps) {
  return (
    <Page title="Impressum" onBack={onBack}>
      <section>
        <H2>Anbieter</H2>
        <p>
          Thomas Miler<br />
          E-Mail: <Mail />
        </p>
        <p className="mt-2">
          Diese Webseite ist ein <strong className="text-slate-100">privates, nicht-kommerzielles Angebot</strong> eines
          Vereinsmitglieds für Spielerinnen, Spieler und Interessierte des TC Pliening. Sie ist{" "}
          <strong className="text-slate-100">kein Angebot des TC Pliening e.V.</strong> und keine offizielle
          Vereinsseite; der Verein ist für Inhalt und Betrieb nicht verantwortlich. Es werden keine Einnahmen erzielt,
          keine Werbung geschaltet und keine Leistungen angeboten.
        </p>
      </section>

      <section>
        <H2>Verantwortlich für den Inhalt</H2>
        <p>Thomas Miler (Anschrift auf Anfrage per E-Mail)</p>
      </section>

      <section>
        <H2>Quellen</H2>
        <p>
          Spielpläne, Tabellen, Spielberichte und Meldelisten stammen aus dem öffentlichen Spielbetrieb des
          Bayerischen Tennis-Verbands (BTV, nuLiga). Die Daten werden automatisiert übernommen und können vom
          aktuellen Stand beim BTV abweichen; verbindlich ist immer die Veröffentlichung des BTV.
        </p>
      </section>

      <section>
        <H2>Haftung</H2>
        <p>
          Die Inhalte wurden mit Sorgfalt erstellt, für Richtigkeit, Vollständigkeit und Aktualität wird keine Gewähr
          übernommen. Insbesondere Spieltermine und Beginnzeiten können sich kurzfristig ändern. Für die Inhalte
          verlinkter externer Seiten (BTV, Google Maps) sind deren Betreiber verantwortlich.
        </p>
      </section>
    </Page>
  );
}

export function Datenschutz({ onBack }: LegalPageProps) {
  return (
    <Page title="Datenschutzerklärung" onBack={onBack}>
      <section>
        <H2>1. Verantwortlicher</H2>
        <p>
          Thomas Miler, E-Mail: <Mail /> (Anschrift auf Anfrage). Diese Seite ist ein privates Angebot, kein
          Angebot des TC Pliening e.V.
        </p>
      </section>

      <section>
        <H2>2. Kurz gesagt</H2>
        <ul className="list-disc list-inside mt-1 space-y-1 text-slate-400">
          <li>Keine Cookies, kein Tracking, keine Analyse-Tools, keine Werbung.</li>
          <li>Keine Verbindung zu Google oder anderen Drittanbietern beim Aufruf der Seite.</li>
          <li>Gezeigt werden Spiel- und Spielerdaten aus dem öffentlichen BTV-Spielbetrieb (Abschnitt 5).</li>
          <li>Minderjährige erscheinen nur mit Initialen und sind nicht suchbar (Abschnitt 6).</li>
          <li>Du kannst der Nennung deines Namens widersprechen (Abschnitt 7).</li>
        </ul>
      </section>

      <section>
        <H2>3. Hosting und Server-Logfiles</H2>
        <p>
          Die Seite wird bei der Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, gehostet. Beim Aufruf
          speichert der Webserver automatisch in Logfiles: die <strong className="text-slate-100">gekürzte</strong>{" "}
          IP-Adresse (letzter Block entfernt, z. B. 85.212.14.0), Datum und Uhrzeit, aufgerufene Datei, übertragene
          Datenmenge, Browser und Betriebssystem sowie die zuvor besuchte Seite. Die Logfiles dienen der
          technischen Bereitstellung und Sicherheit der Seite (Art. 6 Abs. 1 lit. f DSGVO) und werden nach 14 Tagen
          automatisch gelöscht. Die Verbindung ist TLS-verschlüsselt (https).
        </p>
      </section>

      <section>
        <H2>4. Was die App auf deinem Gerät speichert</H2>
        <p>
          Die App merkt sich im Browser-Speicher (localStorage) deine Auswahl der Konkurrenzen, markierte
          Lieblingsbegegnungen und die zuletzt angesehenen Spieler der Suche. Diese Daten verlassen dein Gerät nicht,
          werden nicht an den Server übertragen und sind für die gewünschte Funktion erforderlich (§ 25 Abs. 2 TDDDG).
          Du löschst sie jederzeit über die Browser-Einstellungen oder „Verlauf löschen" in der Suche.
        </p>
      </section>

      <section>
        <H2>5. Spiel- und Spielerdaten aus dem BTV-Spielbetrieb</H2>
        <p>
          Die App zeigt Spielpläne, Tabellen, Spielberichte und namentliche Meldelisten des Mannschaftsspielbetriebs,
          die der Bayerische Tennis-Verband (BTV) in nuLiga öffentlich veröffentlicht. Zu Spielerinnen und Spielern
          werden verarbeitet: Name, Verein und Mannschaft, Leistungsklasse (LK), Meldeposition sowie Ergebnisse der
          Einzel und Doppel. Für die eigenen Mannschaften des TC Pliening zusätzlich das Geburtsjahr laut
          Meldeliste. Nationalitätsangaben werden nicht übernommen.
        </p>
        <p className="mt-2">
          <strong className="text-slate-100">Zweck:</strong> Vorbereitung auf Begegnungen (Aufstellungen,
          Bilanzen, Spielerhistorie über mehrere Saisons) und Information der Vereinsmitglieder.{" "}
          <strong className="text-slate-100">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO — berechtigtes
          Interesse an der Auswertung des öffentlichen Ligabetriebs, dem sich alle Beteiligten durch die
          Teilnahme am Verbandsspielbetrieb stellen; die Daten stammen ausschließlich aus der öffentlichen
          Verbandsveröffentlichung und werden nicht mit anderen Quellen verknüpft.{" "}
          <strong className="text-slate-100">Speicherdauer:</strong> die laufende Saison und die vier Runden davor
          (zwei Sommer-, zwei Winterrunden); ältere Daten werden beim Saisonwechsel entfernt.{" "}
          <strong className="text-slate-100">Berichtigung:</strong> Die Daten werden unverändert aus nuLiga
          übernommen; Fehler bitte beim BTV bzw. beim meldenden Verein korrigieren lassen, die App zieht die
          Korrektur beim nächsten Abgleich nach.
        </p>
      </section>

      <section>
        <H2>6. Schutz Minderjähriger</H2>
        <p>
          Personen, die laut Meldeliste im laufenden Jahr 18 oder jünger sind, sowie alle Teilnehmer von
          Jugendkonkurrenzen erscheinen in dieser App nur mit Initialen (z. B. „B., S."), ohne Geburtsjahr und ohne
          Nationalität. Sie sind nicht über die Suche auffindbar und haben keine Spielerhistorie. Ihre Ergebnisse
          bleiben in den Spielberichten enthalten, weil sonst das Mannschaftsergebnis nicht nachvollziehbar wäre.
        </p>
      </section>

      <section>
        <H2>7. Widerspruch und Entfernung</H2>
        <p>
          Du möchtest nicht, dass dein Name in dieser App erscheint? Schreib eine E-Mail an <Mail /> mit Name und
          Verein. Dein Name wird dann überall durch Initialen ersetzt, du bist nicht mehr suchbar und hast keine
          Spielerhistorie mehr — in der Regel innerhalb einer Woche, spätestens mit dem nächsten Datenabgleich. Ein
          Nachweis der Identität ist nicht nötig, solange die Angabe plausibel ist. Die Veröffentlichung beim BTV
          selbst ist davon nicht betroffen.
        </p>
      </section>

      <section>
        <H2>8. Live-Zwischenstände</H2>
        <p>
          Die App enthält eine Funktion zur Eingabe von Zwischenständen während einer laufenden Begegnung, die über
          den Dienst Supabase (Supabase Inc., USA) gespeichert würde. Diese Funktion ist{" "}
          <strong className="text-slate-100">abgeschaltet</strong>: Es wird keine Verbindung zu Supabase aufgebaut
          und nichts übertragen. Sollte sie künftig aktiviert werden, wird diese Erklärung vorher ergänzt.
        </p>
      </section>

      <section>
        <H2>9. Externe Links</H2>
        <p>
          Adress-Links führen zu Google Maps, Vereins- und Gruppenlinks zum BTV. Die Verbindung zu diesen Anbietern
          entsteht erst, wenn du einen solchen Link antippst; ab dann gelten deren Datenschutzbestimmungen (
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">
            Google
          </a>
          ,{" "}
          <a href="https://www.btv.de/de/datenschutz.html" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">
            BTV
          </a>
          ). Kalender-Downloads werden im Browser erzeugt, ohne Serverkontakt.
        </p>
      </section>

      <section>
        <H2>10. Deine Rechte</H2>
        <p>Du hast gegenüber dem Verantwortlichen das Recht auf:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
          <li>Auskunft über die zu deiner Person verarbeiteten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung (Art. 16) und Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung aus berechtigtem Interesse (Art. 21 DSGVO, siehe Abschnitt 7)</li>
          <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
        </ul>
        <p className="mt-2">
          Zuständige Aufsichtsbehörde: Bayerisches Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18,
          91522 Ansbach.
        </p>
      </section>

      <section>
        <H2>11. Stand</H2>
        <p>
          Diese Erklärung hat den Stand 9. Oktober 2026. Sie wird angepasst, wenn sich die Technik der App oder die
          Rechtslage ändert.
        </p>
      </section>
    </Page>
  );
}
