#!/bin/bash
set -euo pipefail
DB_URL=$(cat /root/servicelink-db.url)

update_env() {
  local file="$1"
  if [ ! -f "$file" ]; then
    echo "DATABASE_URL=${DB_URL}" > "$file"
  elif grep -q '^DATABASE_URL=' "$file"; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${DB_URL}|" "$file"
  else
    echo "DATABASE_URL=${DB_URL}" >> "$file"
  fi
  chmod 600 "$file"
}

update_env /var/www/servicelink/web/.env
update_env /var/www/servicelink/admin/.env

# Ensure admin AUTH secret exists
if ! grep -q '^AUTH_SECRET=' /var/www/servicelink/admin/.env 2>/dev/null && ! grep -q '^ADMIN_SESSION_SECRET=' /var/www/servicelink/admin/.env 2>/dev/null; then
  echo "AUTH_SECRET=$(openssl rand -hex 32)" >> /var/www/servicelink/admin/.env
fi

cd /var/www/servicelink/web
npm ci
npm run build

cd /var/www/servicelink/admin
npm ci
npm run build

# Ensure admin .env.example fields - check PORT
pm2 delete sl-web sl-admin 2>/dev/null || true
cd /var/www/servicelink/web
pm2 start npm --name sl-web -- start
cd /var/www/servicelink/admin
pm2 start npm --name sl-admin -- start -- -p 3001
pm2 save
pm2 startup systemd -u root --hp /root | tail -n 1 > /tmp/pm2-startup.sh || true
bash /tmp/pm2-startup.sh 2>/dev/null || true
pm2 status
echo BUILD_OK
