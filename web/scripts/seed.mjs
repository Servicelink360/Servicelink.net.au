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
  ALTER TABLE news_posts
  ADD COLUMN IF NOT EXISTS meta_title varchar(255),
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS featured_image varchar(512),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()
`;

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
  INSERT INTO news_posts (
    title, slug, summary, body, meta_title, meta_description,
    featured_image, published, published_at
  )
  VALUES (
    'Servicelink launches updated website and Service360 visibility',
    'servicelink-launches-updated-website-and-service360',
    'Our new website makes it easier to explore services, locations, and Service360 — the platform that brings every site into one clear view.',
    $body$Servicelink has launched an updated website built for the way facilities teams actually work — clear service pages, location coverage across Australia, and a direct path to request a quote or get in touch.

At the centre of our delivery model is Service360: one platform for site visibility, work activity, and operational reporting. Whether you manage a single commercial site or a national portfolio, the goal is the same — fewer surprises, faster decisions, and accountable service delivery.

What you can do on the new site

Explore our full facilities management service range, from cleaning and grounds care to maintenance and asset support. Find local coverage through our locations directory. Request a tailored quote or contact our team for support. Follow news and updates as we grow across Sydney, NSW, and nationally.

Why this matters

Facilities management succeeds when information is current and ownership is clear. Our updated digital presence reflects how Servicelink operates every day: practical communication, documented standards, and technology that keeps every site visible.

If you would like a briefing on Service360 or a quote for your sites, our team is ready to help.$body$,
    'Servicelink launches updated website and Service360',
    'Explore Servicelink’s updated website and Service360 platform for clearer facilities visibility, local service coverage, and faster quotes across Australia.',
    '/uploads/images/site/news-hero-1785211411570.webp',
    true,
    now()
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    body = EXCLUDED.body,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    featured_image = COALESCE(news_posts.featured_image, EXCLUDED.featured_image),
    published = true,
    published_at = COALESCE(news_posts.published_at, EXCLUDED.published_at)
`;

const [seeded] = await sql`
  SELECT id FROM news_posts
  WHERE slug = 'servicelink-launches-updated-website-and-service360'
  LIMIT 1
`;

if (seeded) {
  console.log("Sample news post ready (servicelink-launches-updated-website-and-service360).");
}

console.log("Database schema ready.");
await sql.end();
