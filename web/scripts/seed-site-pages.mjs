import postgres from "postgres";
import {
  SYSTEM_SITE_PAGES,
  defaultHomepageSettings,
  defaultService360Settings,
  HOME_PAGE_SLUG,
} from "./data/system-site-pages.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = postgres(url);

await sql`
  CREATE TABLE IF NOT EXISTS site_pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    slug varchar(255) NOT NULL UNIQUE,
    content text NOT NULL DEFAULT '',
    published boolean NOT NULL DEFAULT false,
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  ALTER TABLE site_pages
  ADD COLUMN IF NOT EXISTS page_type varchar(32) NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS settings text
`;

await sql`
  ALTER TABLE site_pages
  ALTER COLUMN content SET DEFAULT ''
`;

const [legacyHomepage] = await sql`
  SELECT value FROM site_settings WHERE key = 'homepage' LIMIT 1
`.catch(() => [null]);

let homepageSettings = defaultHomepageSettings;
if (legacyHomepage?.value) {
  try {
    homepageSettings = {
      ...defaultHomepageSettings,
      ...JSON.parse(legacyHomepage.value),
    };
  } catch {
    homepageSettings = defaultHomepageSettings;
  }
}

for (const page of SYSTEM_SITE_PAGES) {
  let settings = null;
  if (page.pageType === "homepage") settings = JSON.stringify(homepageSettings);
  if (page.pageType === "service360") settings = JSON.stringify(defaultService360Settings);

  await sql`
    INSERT INTO site_pages (title, slug, page_type, content, settings, published)
    VALUES (
      ${page.title},
      ${page.slug},
      ${page.pageType},
      '',
      ${settings},
      true
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      page_type = EXCLUDED.page_type,
      settings = COALESCE(site_pages.settings, EXCLUDED.settings),
      published = CASE
        WHEN site_pages.slug = ${HOME_PAGE_SLUG} THEN COALESCE(site_pages.published, EXCLUDED.published)
        ELSE EXCLUDED.published
      END,
      updated_at = now()
  `;
}

console.log(`Site pages ready (${SYSTEM_SITE_PAGES.length} system pages).`);

await sql.end();
