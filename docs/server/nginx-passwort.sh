#!/bin/bash
# Passwortschutz für tcp-spielplan.de (HTTP Basic Auth in nginx) — Thomas' Auftrag vom 09.10.2026.
# Benutzer „tcp", Passwort als bcrypt-Hash in /etc/nginx/.htpasswd-tcp (Klartext steht
# nicht auf dem Server). Gilt für die ganze Seite inklusive /data — ohne Passwort liefert
# nginx 401, der Browser merkt sich die Eingabe.
#
# Ausführen als root (Passwort wird als Argument übergeben, landet nicht im Repo):
#   ssh hetzner 'bash -s -- "<Passwort>"' < docs/server/nginx-passwort.sh
# Prüfen:
#   curl -sI https://tcp-spielplan.de/ | head -1                      → HTTP/1.1 401 Unauthorized
#   curl -sI -u tcp:<Passwort> https://tcp-spielplan.de/ | head -1   → HTTP/1.1 200 OK
# Passwort später ändern: Skript einfach mit dem neuen Passwort erneut ausführen.
set -euo pipefail
PW="${1:-}"
[ -z "$PW" ] && { echo "Aufruf: bash -s -- '<Passwort>'"; exit 1; }
SITE=/etc/nginx/sites-enabled/tcp-spielplan.de
HT=/etc/nginx/.htpasswd-tcp
htpasswd -bcB "$HT" tcp "$PW"
chown root:www-data "$HT" && chmod 640 "$HT"
if grep -q "auth_basic" "$SITE"; then
  echo "auth_basic schon in $SITE — nur das Passwort wurde erneuert"
  systemctl reload nginx
else
  BAK="$SITE.bak-auth-$(date +%Y%m%d)"
  cp "$SITE" "$BAK"
  # Die beiden Zeilen in den 443-Block direkt nach der root-Zeile setzen
  python3 - "$SITE" <<'EOF'
import re, sys
p = sys.argv[1]
s = open(p).read()
m = re.search(r"^([ \t]*)root[ \t]+/var/www/tcp-spielplan\.de/dist;[ \t]*$", s, re.M)
if not m:
    sys.exit("root-Zeile nicht gefunden — nichts geändert")
ind = m.group(1)
add = f'\n{ind}auth_basic "TC Pliening Spielplan";\n{ind}auth_basic_user_file /etc/nginx/.htpasswd-tcp;'
s = s[:m.end()] + add + s[m.end():]
open(p, "w").write(s)
print("Site-Konfiguration angepasst")
EOF
  if nginx -t; then
    systemctl reload nginx
    echo "Passwortschutz aktiv"
  else
    cp "$BAK" "$SITE"
    echo "FEHLER: Konfiguration ungültig, Sicherung zurückgespielt"; exit 1
  fi
fi
grep -n "auth_basic" "$SITE"
