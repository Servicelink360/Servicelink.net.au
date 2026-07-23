import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = postgres(url);

await sql`
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS subscribers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) NOT NULL UNIQUE,
    name varchar(255),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    source varchar(64) NOT NULL DEFAULT 'website',
    active boolean NOT NULL DEFAULT true,
    subscribed_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS contact_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    phone varchar(64),
    company varchar(255),
    portfolio_size varchar(32),
    message text NOT NULL,
    source varchar(64) NOT NULL DEFAULT 'website',
    created_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS news_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    slug varchar(255) NOT NULL UNIQUE,
    summary text NOT NULL,
    body text NOT NULL,
    published boolean NOT NULL DEFAULT false,
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  INSERT INTO news_posts (title, slug, summary, body, published, published_at)
  VALUES (
    'Welcome to Servicelink',
    'welcome-to-servicelink',
    'Servicelink is your partner in integrated facilities management across Australia.',
    'We are pleased to launch our updated digital presence. Register for updates to hear about service expansions, operational insights, and news from the Servicelink team.',
    true,
    now()
  )
  ON CONFLICT (slug) DO NOTHING
`;

const [seeded] = await sql`
  SELECT id FROM news_posts WHERE slug = 'welcome-to-servicelink' LIMIT 1
`;

if (seeded) {
  console.log("Sample news post ready (welcome-to-servicelink).");
}

console.log("Database schema ready.");
await sql.end();
