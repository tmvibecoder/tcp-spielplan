#!/bin/bash
# Komprimierung für JS, CSS und JSON auf dem Hetzner-Server einschalten.
#
# Befund 08.10.2026: /etc/nginx/nginx.conf hat `gzip on;`, aber `gzip_types`
# ist auskommentiert — nginx komprimiert dann NUR text/html. Das 512-KB-
# Startbundle und die JSON-Daten unter /data gingen roh über die Leitung.
# Das Skript entkommentiert die vier gzip_*-Zeilen (gilt serverweit, also für
# alle Apps), prüft die Konfiguration und lädt nginx neu.
#
# Ausführen als root auf dem Server (SSH-Alias „hetzner"):
#   ssh hetzner 'bash -s' < docs/server/nginx-gzip.sh
# Danach prüfen:
#   curl -sI -H 'Accept-Encoding: gzip' https://tcp-spielplan.de/data/search.json | grep -i content-encoding
set -euo pipefail
cp -n /etc/nginx/nginx.conf "/etc/nginx/nginx.conf.bak-$(date +%Y%m%d)"
sed -i -E 's/^[[:space:]]*#[[:space:]]*(gzip_(vary|proxied|comp_level|types)[[:space:]].*)$/\t\1/' /etc/nginx/nginx.conf
nginx -t
systemctl reload nginx
grep -n -E '^\s*gzip' /etc/nginx/nginx.conf
