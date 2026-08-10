#!/bin/bash
# One-time: copy hub heroes from seo_pages → locations so Locations admin matches live pages.
set -euo pipefail
cd /var/www/servicelink/web
set -a
# shellcheck disable=SC1091
source ./.env
set +a

psql "$DATABASE_URL" <<'SQL'
BEGIN;

UPDATE locations l
SET hero_image = sp.hero_image
FROM seo_pages sp
WHERE sp.page_type = 'metro_hub'
  AND sp.metro_id = l.id
  AND sp.hero_image IS NOT NULL
  AND btrim(sp.hero_image) <> ''
  AND (l.hero_image IS NULL OR btrim(l.hero_image) = '');

UPDATE locations l
SET hero_image = sp.hero_image
FROM seo_pages sp
WHERE sp.page_type = 'city_hub'
  AND sp.city_id = l.id
  AND sp.metro_id IS NULL
  AND sp.hero_image IS NOT NULL
  AND btrim(sp.hero_image) <> ''
  AND (l.hero_image IS NULL OR btrim(l.hero_image) = '');

COMMIT;

SELECT type, slug, left(hero_image, 80) AS hero
FROM locations
WHERE hero_image ILIKE '%pagessydney%' OR hero_image ILIKE '%pages/%'
ORDER BY type, slug;
SQL

echo SYNC_HUB_HEROES_OK
