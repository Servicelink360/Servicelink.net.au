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

await sql.end();
console.log("ATTRIBUTION_COLUMNS_OK");
