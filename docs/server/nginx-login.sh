#!/bin/bash
# Anmeldeseite statt Browser-Dialog (Thomas' Auftrag 09.10.2026): nginx prüft ein Cookie
# `tcp_auth`, dessen Wert SHA-256("benutzer:passwort") ist. Die Seite /login.html (im Repo,
# public/login.html) rechnet den Hash im Browser und setzt das Cookie; nginx kennt nur den
# erwarteten Hash (hier erzeugt, Klartext bleibt nicht auf dem Server). Ohne gültiges Cookie:
# 302 nach /login.html (bei vorhandenem, falschem Cookie mit ?fehler=1). Frei bleiben nur die
# Anmeldeseite, die Schriftdateien und das Favicon. Ersetzt die Basic-Auth-Zeilen vom 09.10.
#
# Ausführen als root (Benutzer und Passwort als Argumente, landen nicht im Repo):
#   ssh hetzner 'bash -s -- tcp "<Passwort>"' < docs/server/nginx-login.sh
# Prüfen:
#   curl -sI https://tcp-spielplan.de/ | grep -iE "^HTTP|^location"        → 302 /login.html
#   curl -sI https://tcp-spielplan.de/login.html | head -1                  → 200
#   H=$(printf 'tcp:<Passwort>' | sha256sum | cut -d' ' -f1); curl -sI -b "tcp_auth=$H" https://tcp-spielplan.de/ | head -1   → 200
# Passwort ändern: Skript mit neuem Passwort erneut ausführen (alte Cookies werden ungültig).
set -euo pipefail
USER_="${1:-}"; PW="${2:-}"
[ -z "$USER_" ] || [ -z "$PW" ] && { echo "Aufruf: bash -s -- <benutzer> '<Passwort>'"; exit 1; }
HASH=$(printf '%s:%s' "$(echo "$USER_" | tr 'A-Z' 'a-z')" "$PW" | sha256sum | cut -d' ' -f1)
SITE=/etc/nginx/sites-enabled/tcp-spielplan.de
AUTH=/etc/nginx/conf.d/tcp-spielplan-auth.conf
mkdir -p /etc/nginx/backups
BAK="/etc/nginx/backups/tcp-spielplan.de.bak-login-$(date +%Y%m%d-%H%M)"
cp "$SITE" "$BAK"
[ -f "$AUTH" ] && cp "$AUTH" "$BAK.auth"

# 1. Hash-Vergleich im http-Kontext (conf.d wird von nginx.conf eingebunden)
cat > "$AUTH" <<EOF
# tcp-spielplan.de: Anmeldung über Cookie tcp_auth = SHA-256("benutzer:passwort"), siehe docs/server/nginx-login.sh
# 64-Zeichen-Schlüssel passen nicht in die Standard-Bucketgröße (64) der map-Hashtabelle
map_hash_bucket_size 128;
map \$cookie_tcp_auth \$tcp_auth_ok {
    default 0;
    "$HASH" 1;
}
EOF
chmod 600 "$AUTH"

# 2. Site: Basic-Auth raus, Cookie-Tor rein (nur im 443-Block, der die root-Zeile hat)
python3 - "$SITE" <<'EOF'
import re, sys
p = sys.argv[1]
s = open(p).read()
s = re.sub(r"^[ \t]*auth_basic[^\n]*\n", "", s, flags=re.M)
gate = """    # Anmeldung (docs/server/nginx-login.sh): frei sind nur Login-Seite, Schriften, Favicon
    location = /login.html { try_files $uri =404; }
    location /fonts/ { try_files $uri =404; }
    location = /favicon.svg { try_files $uri =404; }

    location / {
        set $login /login.html;
        if ($cookie_tcp_auth != "") { set $login /login.html?fehler=1; }
        if ($tcp_auth_ok = 0) { return 302 $login; }
        try_files $uri $uri/ =404;
    }
"""
# vorhandenes Tor (Wiederholungslauf) oder die ursprüngliche location / ersetzen
s2 = re.sub(r"    # Anmeldung \(docs/server/nginx-login\.sh\).*?\n    location / \{.*?\n    \}\n", gate, s, count=1, flags=re.S)
if s2 == s:
    s2 = re.sub(r"    location / \{\n        try_files \$uri \$uri/ =404;\n    \}\n", gate, s, count=1)
if s2 == s:
    sys.exit("location / nicht gefunden — nichts geändert")
open(p, "w").write(s2)
print("Site-Konfiguration angepasst")
EOF

if nginx -t; then
  systemctl reload nginx
  echo "Anmeldung über /login.html aktiv (Benutzer $USER_)"
else
  cp "$BAK" "$SITE"; [ -f "$BAK.auth" ] && cp "$BAK.auth" "$AUTH" || rm -f "$AUTH"
  echo "FEHLER: Konfiguration ungültig, Sicherung zurückgespielt"; exit 1
fi
