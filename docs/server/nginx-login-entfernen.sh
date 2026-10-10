#!/bin/bash
# Anmeldung wieder entfernen (Thomas' Auftrag vom 10.10.2026): Die Seite ist danach wieder ohne
# Passwort erreichbar. Nimmt zurück, was nginx-login.sh (Cookie-Tor, 09.10.2026) und
# nginx-passwort.sh (Basic Auth, 09.10.2026 vormittags) eingerichtet haben — beide Skripte sind
# seit diesem Auftrag aus dem Repo entfernt (Git-Historie).
#
#   - Site-Konfiguration: das Anmelde-Tor (freie locations + location / mit den zwei `if`) wird
#     wieder zur schlichten `location / { try_files $uri $uri/ =404; }`; etwaige auth_basic-Zeilen
#     fliegen raus
#   - /etc/nginx/conf.d/tcp-spielplan-auth.conf (die Passwort-Hashes) wird gelöscht
#   - /etc/nginx/.htpasswd-tcp (Basic-Auth-Rest, falls vorhanden) wird gelöscht
#
# Ausführen als root (keine Argumente):
#   ssh hetzner 'bash -s' < docs/server/nginx-login-entfernen.sh
# Prüfen:
#   curl -sI https://tcp-spielplan.de/ | head -1                          → 200
#   curl -sI https://tcp-spielplan.de/data/search.json | head -1          → 200
# Ein Wiederholungslauf ist harmlos („schon offen"). Scheitert ein Schritt, spielt das Skript die
# Sicherung aus /etc/nginx/backups/ zurück.
set -euo pipefail
SITE=/etc/nginx/sites-enabled/tcp-spielplan.de
AUTH=/etc/nginx/conf.d/tcp-spielplan-auth.conf
HT=/etc/nginx/.htpasswd-tcp
mkdir -p /etc/nginx/backups
BAK="/etc/nginx/backups/tcp-spielplan.de.bak-offen-$(date +%Y%m%d-%H%M)"
cp "$SITE" "$BAK"
[ -f "$AUTH" ] && cp "$AUTH" "$BAK.auth"
[ -f "$HT" ] && cp "$HT" "$BAK.htpasswd"

zurueck() {
  cp "$BAK" "$SITE"
  [ -f "$BAK.auth" ] && cp "$BAK.auth" "$AUTH"
  [ -f "$BAK.htpasswd" ] && cp "$BAK.htpasswd" "$HT"
  echo "FEHLER: $1, Sicherung zurückgespielt"; exit 1
}

# 1. Site: Tor und Basic-Auth raus. Erst die Site ändern, dann die map löschen — die map allein
#    zu löschen ließe das Tor auf eine unbekannte Variable zeigen (nginx -t schlüge fehl).
python3 - "$SITE" <<'EOF' || zurueck "Site-Konfiguration nicht anpassbar"
import re, sys
p = sys.argv[1]
orig = open(p).read()
s = re.sub(r"^[ \t]*auth_basic[^\n]*\n", "", orig, flags=re.M)
offen = """    location / {
        try_files $uri $uri/ =404;
    }
"""
s = re.sub(r"    # Anmeldung \(docs/server/nginx-login\.sh\).*?\n    location / \{.*?\n    \}\n", offen, s, count=1, flags=re.S)
if "tcp_auth" in s:
    sys.exit("Reste des Anmelde-Tors gefunden, die das Skript nicht kennt — nichts geändert")
if s != orig:
    open(p, "w").write(s)
    print("Site-Konfiguration angepasst: Anmelde-Tor entfernt")
else:
    print("Site-Konfiguration schon offen (kein Anmelde-Tor vorhanden)")
EOF

# 2. Passwort-Hashes und Basic-Auth-Datei löschen
rm -f "$AUTH" "$HT"

if nginx -t; then
  systemctl reload nginx
  echo "Anmeldung entfernt — tcp-spielplan.de ist ohne Passwort erreichbar"
else
  zurueck "Konfiguration ungültig"
fi
