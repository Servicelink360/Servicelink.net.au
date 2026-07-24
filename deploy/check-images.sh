#!/bin/bash
set -euo pipefail
cd /var/www/servicelink/web
set -a
source ./.env
set +a
echo "=== site files ==="
ls public/uploads/images/site/ | head
echo "=== asset service files ==="
ls public/uploads/images/services/asset-management/ | head
echo "=== adelaide location files ==="
ls public/uploads/images/locations/adelaide/ 2>/dev/null | head || echo none
echo "=== homepage settings ==="
psql "$DATABASE_URL" -t -A -c "SELECT settings FROM site_pages WHERE slug='home';" | head -c 800
echo
echo "=== sample seo service hero ==="
psql "$DATABASE_URL" -c "SELECT slug, hero_image FROM seo_services ORDER BY sort_order LIMIT 5;"
echo "=== curl ==="
curl -s -o /dev/null -w "hero-main:%{http_code}\n" http://127.0.0.1:3000/uploads/images/site/hero-main.jpg
curl -s -o /dev/null -w "asset-card:%{http_code}\n" http://127.0.0.1:3000/uploads/images/services/asset-management/card-1.jpg
curl -s http://127.0.0.1:3000/ | tr '"' '\n' | grep -E 'uploads|/images/|_next/image' | head -40
