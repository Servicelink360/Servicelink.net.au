import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = postgres(url);

await sql`
  ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS page_path varchar(512),
  ADD COLUMN IF NOT EXISTS landing_path varchar(512),
  ADD COLUMN IF NOT EXISTS traffic_referrer varchar(512),
  ADD COLUMN IF NOT EXISTS search_engine varchar(64)
`;

await sql`
  ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS page_path varchar(512),
  ADD COLUMN IF NOT EXISTS landing_path varchar(512),
  ADD COLUMN IF NOT EXISTS traffic_referrer varchar(512),
  ADD COLUMN IF NOT EXISTS search_engine varchar(64)
`;

await sql`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS page_path varchar(512),
  ADD COLUMN IF NOT EXISTS landing_path varchar(512),
  ADD COLUMN IF NOT EXISTS traffic_referrer varchar(512),
  ADD COLUMN IF NOT EXISTS search_engine varchar(64)
`;

await sql`
  CREATE TABLE IF NOT EXISTS site_visits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id varchar(64) NOT NULL,
    path varchar(512) NOT NULL,
    landing_path varchar(512),
    search_engine varchar(64),
    traffic_referrer varchar(512),
    created_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`CREATE INDEX IF NOT EXISTS site_visits_created_at_idx ON site_visits (created_at)`;
await sql`CREATE INDEX IF NOT EXISTS site_visits_session_id_idx ON site_visits (session_id)`;
await sql`CREATE INDEX IF NOT EXISTS site_visits_path_idx ON site_visits (path)`;

await sql`
  CREATE TABLE IF NOT EXISTS stats_exclude_ips (
    ip varchar(64) PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql.end();
console.log("ATTRIBUTION_COLUMNS_OK");
