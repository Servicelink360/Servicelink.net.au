#!/bin/bash
set -euo pipefail
cd /var/www/servicelink/web
set -a
# shellcheck disable=SC1091
source ./.env
set +a

echo "=== copy timestamped location heroes to hero.jpg/png ==="
python3 - <<'PY'
import os, shutil
root = "public/uploads/images/locations"
fixed = 0
for dirpath, _, files in os.walk(root):
    heroes = [f for f in files if f.startswith("hero")]
    if not heroes:
        continue
    if "hero.jpg" in files or "hero.png" in files:
        continue
    heroes.sort()
    src = os.path.join(dirpath, heroes[-1])
    ext = ".png" if heroes[-1].endswith(".png") else ".jpg"
    dst = os.path.join(dirpath, f"hero{ext}")
    shutil.copy2(src, dst)
    print(f"copied {dst} <- {src}")
    fixed += 1
print(f"location heroes fixed: {fixed}")
PY

echo "=== import image metadata from local export ==="
if [[ ! -f /tmp/image-meta-export.json ]]; then
  echo "MISSING /tmp/image-meta-export.json" >&2
  exit 1
fi

cat > scripts/import-image-meta.mjs <<'NODE'
import fs from "node:fs";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);
const data = JSON.parse(fs.readFileSync("/tmp/image-meta-export.json", "utf8"));

let pages = 0, services = 0, locations = 0;

for (const row of data.sitePages ?? []) {
  const r = await sql`UPDATE site_pages SET settings = ${row.settings}, updated_at = now() WHERE slug = ${row.slug}`;
  pages += r.count;
}

for (const row of data.seoServices ?? []) {
  const r = await sql`
    UPDATE seo_services
    SET hero_image = ${row.hero_image},
        card_images = ${row.card_images}
    WHERE slug = ${row.slug}
  `;
  services += r.count;
}

for (const row of data.locations ?? []) {
  const r = await sql`
    UPDATE locations
    SET hero_image = ${row.hero_image}
    WHERE slug = ${row.slug} AND type = ${row.type}
  `;
  locations += r.count;
}

console.log("imported", { pages, services, locations });
await sql.end();
NODE

node --env-file=.env scripts/import-image-meta.mjs

echo "=== fill blank city heroes when hero.jpg exists ==="
python3 - <<'PY'
import os, json, subprocess
env = dict(os.environ)
# load DATABASE_URL from .env if needed
if "DATABASE_URL" not in env or not env["DATABASE_URL"]:
    for line in open(".env"):
        if line.startswith("DATABASE_URL="):
            env["DATABASE_URL"] = line.split("=",1)[1].strip().strip('"').strip("'")
            break

root = "public/uploads/images/locations"
updates = []
for name in os.listdir(root):
    d = os.path.join(root, name)
    if not os.path.isdir(d):
        continue
    for fname in ("hero.jpg", "hero.png"):
        if os.path.isfile(os.path.join(d, fname)):
            updates.append((name, f"/uploads/images/locations/{name}/{fname}"))
            break

sql = "BEGIN;\n"
for slug, path in updates:
    sql += f"UPDATE locations SET hero_image = '{path}' WHERE type = 'city' AND slug = '{slug}' AND (hero_image IS NULL OR hero_image = '');\n"
sql += "COMMIT;\n"
open("/tmp/fill-heroes.sql","w").write(sql)
print(f"cities with hero file: {len(updates)}")
subprocess.check_call(["psql", env["DATABASE_URL"], "-v", "ON_ERROR_STOP=1", "-f", "/tmp/fill-heroes.sql"])
PY

echo "=== verify sample paths ==="
psql "$DATABASE_URL" -c "SELECT slug, left(settings::text,120) FROM site_pages;"
psql "$DATABASE_URL" -c "SELECT slug, hero_image FROM seo_services ORDER BY sort_order;"
psql "$DATABASE_URL" -c "SELECT slug, type, hero_image FROM locations WHERE hero_image IS NOT NULL ORDER BY type, slug LIMIT 15;"

pm2 restart sl-web --update-env
sleep 2
curl -s -o /dev/null -w "home:%{http_code}\n" http://127.0.0.1:3000/
curl -s http://127.0.0.1:3000/ | tr '"' '\n' | grep -E '/uploads/' | head -25
echo IMAGE_FIX_OK
