#!/bin/bash
set -euo pipefail
sed -i 's/\r$//' /var/www/servicelink/web/.env /var/www/servicelink/admin/.env
cd /var/www/servicelink/web
set -a
# shellcheck disable=SC1091
source ./.env
set +a
npx drizzle-kit push --force
node --env-file=.env scripts/seed-site-pages.mjs
node --env-file=.env scripts/seed-seo.mjs
pm2 restart sl-web sl-admin --update-env
sleep 2
curl -s -o /dev/null -w 'web:%{http_code}\n' http://127.0.0.1:3000/
curl -s -o /dev/null -w 'admin:%{http_code}\n' http://127.0.0.1:3001/login
echo SCHEMA_OK
