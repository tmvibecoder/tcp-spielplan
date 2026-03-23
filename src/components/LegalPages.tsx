interface LegalPageProps {
  onBack: () => void;
}

export function Impressum({ onBack }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="mb-6 text-sm text-sky-400 hover:text-sky-300 transition-colors"
        >
          ← Zurück zum Spielplan
        </button>

        <h1 className="text-2xl font-extrabold mb-6">Impressum</h1>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-2">Angaben gemäß § 5 TMG</h2>
            <p>
              Thomas Miler<br />
              E-Mail:{" "}
              <a
                href="mailto:thomas.miler1234@gmail.com"
                className="text-sky-400 hover:text-sky-300"
              >
                thomas.miler1234@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-2">Verantwortlich für den Inhalt</h2>
            <p>Thomas Miler</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-2">Haftungsausschluss</h2>
            <h3 className="font-semibold text-slate-200 mt-3 mb-1">Haftung für Inhalte</h3>
            <p>
              Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
              Insbesondere die Spieltermine und Beginnzeiten basieren auf Angaben des Bayerischen
              Tennis-Verbands (BTV) und können sich kurzfristig ändern.
            </p>

            <h3 className="font-semibold text-slate-200 mt-3 mb-1">Haftung für Links</h3>
            <p>
              Diese Seite enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich. Eine permanente inhaltliche Kontrolle der
              verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-2">Urheberrecht</h2>
            <p>
              Die Spielplandaten stammen vom Bayerischen Tennis-Verband (BTV Südbayern). Diese Webseite
              ist ein privates, nicht-kommerzielles Informationsangebot für Mitglieder und Interessierte
              des TC Pliening e.V.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function Datenschutz({ onBack }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="mb-6 text-sm text-sky-400 hover:text-sky-300 transition-colors"
        >
          ← Zurück zum Spielplan
        </button>

        <h1 className="text-2xl font-extrabold mb-6">Datenschutzerklärung</h1>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-2">1. Verantwortlicher</h2>
            <p>
              Thomas Miler<br />
              E-Mail:{" "}
              <a
                href="mailto:thomas.miler1234@gmail.com"
                className="text-sky-400 hover:text-sky-300"
              >
                thomas.miler1234@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-2">2. Hosting</h2>
            <p>
              Diese Webseite wird bei der Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen,
              Deutschland gehostet. Beim Besuch dieser Webseite werden durch den Hosting-Anbieter
              automatisch Informationen in sogenannten Server-Logfiles erfasst:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>IP-Adresse des zugreifenden Geräts</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Aufgerufene Seite / Datei</li>
              <li>Übertragene Datenmenge</li>
              <li>Browser-Typ und -Version</li>
              <li>Betriebssystem</li>
              <li>Referrer-URL (zuvor besuchte Seite)</li>
            </ul>
            <p className="mt-2">
              Die Speicherung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
              Interesse an der technischen Bereitstellung und Sicherheit der Webseite). Die
              Server-Logfiles werden nach spätestens 14 Tagen automatisch gelöscht.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-2">3. SSL-/TLS-Verschlüsselung</h2>
            <p>
              Diese Seite nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine
              verschlüsselte Verbindung erkennst du daran, dass die Adresszeile des Browsers von
              „http://" auf „https://" wechselt und an dem Schloss-Symbol in der Browserzeile.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-2">4. Google Fonts</h2>
            <p>
              Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten sogenannte Google Fonts,
              bereitgestellt von Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.
              Beim Aufruf der Seite lädt dein Browser die benötigten Schriftarten direkt von
              Google-Servern. Dabei wird deine IP-Adresse an Google übermittelt.
            </p>
            <p className="mt-2">
              Die Nutzung von Google Fonts erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse an einer ansprechenden Darstellung). Weitere Informationen
              findest du in der{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300"
              >
                Datenschutzerklärung von Google
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-2">5. Externe Links</h2>
            <p>
              Diese Seite enthält Links zu externen Webseiten, insbesondere:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>
                <strong className="text-slate-300">Google Maps</strong> — Bei Klick auf
                Adress-Links wirst du zu Google Maps weitergeleitet. Es gelten die{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300"
                >
                  Datenschutzbestimmungen von Google
                </a>
                .
              </li>
              <li>
                <strong className="text-slate-300">BTV Südbayern</strong> — Links zur Vereinsseite
                beim Bayerischen Tennis-Verband.
              </li>
            </ul>
            <p className="mt-2">
              Bei Klick auf diese Links verlässt du diese Webseite. Für den Datenschutz auf den
              verlinkten Seiten ist der jeweilige Betreiber verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-2">6. Cookies</h2>
            <p>
              Diese Webseite verwendet <strong className="text-slate-100">keine Cookies</strong> und
              setzt keine Tracking- oder Analyse-Tools ein.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-2">7. Keine Datenerfassung durch die App</h2>
            <p>
              Diese Webseite ist eine rein statische Informationsseite. Es werden keine Formulare,
              Registrierungen, Newsletter-Anmeldungen oder sonstige Nutzereingaben erhoben. Alle
              angezeigten Spielplandaten sind öffentlich zugängliche Informationen des BTV.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-2">8. Deine Rechte</h2>
            <p>Du hast jederzeit das Recht auf:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
              <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>
            <p className="mt-2">
              Zuständige Aufsichtsbehörde: Bayerisches Landesamt für Datenschutzaufsicht (BayLDA),
              Promenade 18, 91522 Ansbach.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-2">9. Aktualität</h2>
            <p>
              Diese Datenschutzerklärung ist aktuell gültig und hat den Stand März 2026. Durch
              Weiterentwicklung der Webseite oder aufgrund geänderter gesetzlicher Bestimmungen kann
              eine Anpassung notwendig werden.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
