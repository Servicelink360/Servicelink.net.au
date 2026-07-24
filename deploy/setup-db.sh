#!/bin/bash
set -euo pipefail
DB_PASS=$(openssl rand -hex 16)
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'servicelink') THEN
    CREATE ROLE servicelink LOGIN PASSWORD '${DB_PASS}';
  ELSE
    ALTER ROLE servicelink WITH LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE servicelink OWNER servicelink'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'servicelink')\gexec
SQL
echo "postgresql://servicelink:${DB_PASS}@127.0.0.1:5432/servicelink" > /root/servicelink-db.url
chmod 600 /root/servicelink-db.url
echo "DB password reset OK"
