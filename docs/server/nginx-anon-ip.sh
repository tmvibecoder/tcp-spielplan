#!/bin/bash
# IP-Adressen in den nginx-Zugriffslogs anonymisieren (letztes Oktett bei IPv4,
# alles nach dem zweiten Block bei IPv6) — serverweit, für alle Apps auf dem Hetzner.
#
# Hintergrund (DSGVO-Prüfung 09.10.2026): nginx schrieb die vollen IP-Adressen
# ins access.log (14 Tage Aufbewahrung). Mit dem Log-Format „anon" steht dort
# nur noch 1.2.3.0 bzw. 2001:db8:: — für Fehlersuche und Statistik reicht das.
#
# Ausführen als root auf dem Server:
#   ssh hetzner 'bash -s' < docs/server/nginx-anon-ip.sh
# Prüfen (nach dem nächsten Zugriff):
#   ssh hetzner 'tail -2 /var/log/nginx/access.log'
set -euo pipefail
CONF=/etc/nginx/nginx.conf
if grep -q remote_addr_anon "$CONF"; then echo "schon eingerichtet"; exit 0; fi
cp "$CONF" "$CONF.bak-anon-$(date +%Y%m%d)"
# map + log_format direkt vor die access_log-Zeile im http-Block setzen, dann die Zeile umstellen
python3 - "$CONF" <<'EOF'
import re, sys
p = sys.argv[1]
s = open(p).read()
block = """\t# IP-Anonymisierung in den Logs (DSGVO, 09.10.2026): letztes Oktett / IPv6-Rest weg
\tmap $remote_addr $remote_addr_anon {
\t\t~(?P<ip>\\d+\\.\\d+\\.\\d+)\\.    $ip.0;
\t\t~(?P<ip>[^:]+:[^:]+):       $ip::;
\t\tdefault                     0.0.0.0;
\t}
\tlog_format anon '$remote_addr_anon - $remote_user [$time_local] "$request" '
\t\t'$status $body_bytes_sent "$http_referer" "$http_user_agent"';

"""
m = re.search(r"^[ \t]*access_log[ \t]+/var/log/nginx/access\.log;[ \t]*$", s, re.M)
if not m:
    sys.exit("access_log-Zeile nicht gefunden — nichts geändert")
s = s[:m.start()] + block + "\taccess_log /var/log/nginx/access.log anon;" + s[m.end():]
open(p, "w").write(s)
print("nginx.conf angepasst")
EOF
if nginx -t; then
  systemctl reload nginx
  echo "nginx neu geladen"
  grep -rn "access_log" /etc/nginx/sites-enabled/ 2>/dev/null | grep -v anon | grep -v "off;" && echo "HINWEIS: obige Site-Konfigurationen loggen mit eigenem Format — dort ' anon' anhängen" || echo "keine abweichenden access_log-Zeilen in sites-enabled"
else
  cp "$CONF.bak-anon-$(date +%Y%m%d)" "$CONF"
  echo "FEHLER: Konfiguration ungültig, Sicherung zurückgespielt"
  exit 1
fi
