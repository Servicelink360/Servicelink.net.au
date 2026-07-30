#!/bin/bash
set -euo pipefail
cd /var/www/servicelink
git pull origin main
cd web
npm ci
npm run build
cd ../admin
npm ci
npm run build
cd /var/www/servicelink/web
node --env-file=.env scripts/publish-seo-phase1.mjs
node --env-file=.env scripts/fix-seo-meta.mjs
pm2 restart sl-web sl-admin --update-env
sleep 2
curl -s -o /dev/null -w "web:%{http_code}\n" http://127.0.0.1:3000/
curl -s -o /dev/null -w "admin:%{http_code}\n" http://127.0.0.1:3001/
echo DEPLOY_OK
