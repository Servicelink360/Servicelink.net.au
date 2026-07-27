import postgres from "postgres";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { australiaLocations } from "./data/australia-locations.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = postgres(url);

await sql`
  ALTER TABLE news_posts
  ADD COLUMN IF NOT EXISTS meta_title varchar(255),
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS featured_image varchar(512),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()
`;

await sql`
  CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug varchar(128) NOT NULL,
    name varchar(255) NOT NULL,
    type varchar(16) NOT NULL,
    state varchar(8) NOT NULL,
    parent_id uuid REFERENCES locations(id) ON DELETE CASCADE,
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS locations_parent_slug_idx
  ON locations (parent_id, slug)
`;

await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS locations_city_slug_idx
  ON locations (slug)
  WHERE parent_id IS NULL AND type = 'city'
`;

await sql`
  CREATE TABLE IF NOT EXISTS seo_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug varchar(128) NOT NULL UNIQUE,
    name varchar(255) NOT NULL,
    summary text NOT NULL,
    description text NOT NULL,
    linked_service_slug varchar(128),
    sort_order integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS seo_pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    path varchar(512) NOT NULL UNIQUE,
    page_type varchar(32) NOT NULL,
    city_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    metro_id uuid REFERENCES locations(id) ON DELETE CASCADE,
    seo_service_id uuid REFERENCES seo_services(id) ON DELETE CASCADE,
    meta_title varchar(255) NOT NULL,
    meta_description text NOT NULL,
    h1 varchar(255) NOT NULL,
    intro text NOT NULL,
    body text NOT NULL,
    published boolean NOT NULL DEFAULT false,
    no_index boolean NOT NULL DEFAULT false,
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS hero_image varchar(512)
`;

await sql`
  ALTER TABLE seo_services
  ADD COLUMN IF NOT EXISTS hero_image varchar(512),
  ADD COLUMN IF NOT EXISTS card_images text
`;

await sql`
  ALTER TABLE seo_pages
  ADD COLUMN IF NOT EXISTS hero_image varchar(512),
  ADD COLUMN IF NOT EXISTS card_images text
`;

await sql`
  ALTER TABLE seo_pages
  ADD COLUMN IF NOT EXISTS content_source varchar(32) NOT NULL DEFAULT 'template'
`;

await sql`
  CREATE TABLE IF NOT EXISTS location_service_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    metro_id uuid REFERENCES locations(id) ON DELETE CASCADE,
    seo_service_id uuid NOT NULL REFERENCES seo_services(id) ON DELETE CASCADE,
    hero_image varchar(512),
    card_images text,
    updated_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS location_service_images_city_service_idx
  ON location_service_images (city_id, seo_service_id)
  WHERE metro_id IS NULL
`;

await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS location_service_images_metro_service_idx
  ON location_service_images (city_id, metro_id, seo_service_id)
  WHERE metro_id IS NOT NULL
`;

await sql`
  CREATE TABLE IF NOT EXISTS site_settings (
    key varchar(64) PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )
`;

const seoServiceSeed = [
  {
    slug: "facilities-management",
    name: "Facilities Management",
    summary:
      "One accountable partner for your whole portfolio — integrated FM for commercial and multi-site businesses.",
    description:
      "Modern facilities management is about more than keeping the lights on. It is one coordinated team across your assets — not a patchwork of contractors. We deliver integrated hard and soft services for offices, retail, industrial, healthcare, education, and multi-site portfolios, with clear reporting, WHS compliance, and outcomes you can measure.",
    linkedServiceSlug: "facilities-management",
    sortOrder: 1,
  },
  {
    slug: "cleaning",
    name: "General Cleaning",
    summary:
      "Reliable, presentation-ready cleaning for workplaces and commercial sites.",
    description:
      "From corporate offices and retail stores to warehouses, childcare centres, and aged care facilities, we deliver cleaning that stands up to audit and daily use. Our teams work to documented standards, use safe products, and adapt schedules around your operations — so every space feels consistently cared for.",
    linkedServiceSlug: "general-cleaning",
    sortOrder: 2,
  },
  {
    slug: "ground-maintenance",
    name: "Ground Maintenance",
    summary:
      "Professional grounds care and landscaping for business sites.",
    description:
      "First impressions start outdoors. We maintain lawns, gardens, car parks, and open spaces to a standard that keeps staff, customers, and visitors safe — and your business looking its best year-round. Seasonal works, reactive call-outs, and planned improvements are all handled by one reliable team.",
    linkedServiceSlug: "ground-maintenance",
    sortOrder: 3,
  },
  {
    slug: "tree-services",
    name: "Tree Services and Management",
    summary:
      "Qualified arborists for safe tree care, reporting, and compliant works on commercial sites.",
    description:
      "Trees are assets and liabilities on any business property. We deliver pruning, removals, stump grinding, and arborist reporting with qualified crews — helping property owners and facility managers manage risk, meet compliance requirements, and protect the health of their landscape.",
    linkedServiceSlug: "tree-lopping-and-trees-assessments",
    sortOrder: 4,
  },
  {
    slug: "asset-management",
    name: "Asset Management",
    summary:
      "Structured asset registers, lifecycle planning, and compliance reporting for commercial portfolios.",
    description:
      "Effective asset management turns building data into better decisions. We maintain accurate asset registers, track condition and lifecycle costs, coordinate planned maintenance, and deliver reporting that supports capital planning, audit readiness, and portfolio performance across single sites and multi-location businesses.",
    linkedServiceSlug: "asset-management",
    sortOrder: 5,
  },
  {
    slug: "maintenance",
    name: "Maintenance Services",
    summary:
      "Responsive building maintenance with 24/7 coverage when your business cannot afford downtime.",
    description:
      "When something breaks, you need it fixed properly the first time. Our maintenance teams handle everything from reactive repairs to programmed works — plumbing, electrical, carpentry, painting, and HVAC — with qualified trades, documented job cards, and clear escalation for urgent issues.",
    linkedServiceSlug: "maintenance-services",
    sortOrder: 6,
  },
  {
    slug: "roof-gutter-solar-cleaning",
    name: "Roof, Gutter & Solar Cleaning",
    summary:
      "Commercial roof, gutter, and solar panel cleaning that protects assets and keeps drainage and energy systems performing.",
    description:
      "Debris on roofs and in gutters leads to overflows, staining, and water damage. Soiled solar panels lose efficiency. Servicelink provides scheduled and reactive roof, gutter, and solar cleaning for commercial sites — with safe working-at-height practices, clear reporting, and minimal disruption to your operations.",
    linkedServiceSlug: "roof-gutter-solar-cleaning",
    sortOrder: 7,
  },
  {
    slug: "support-services",
    name: "Support Services",
    summary:
      "Practical back-office and project support that keeps FM programmes running smoothly.",
    description:
      "Strong facilities delivery needs more than trades on site. We help with procurement, project coordination, refurbishments, and client helpdesk support — giving businesses a single point of coordination when priorities shift, sites expand, and deadlines are tight.",
    linkedServiceSlug: "support-services",
    sortOrder: 8,
  },
];

for (const city of australiaLocations) {
  const [existingCity] = await sql`
    SELECT id FROM locations
    WHERE slug = ${city.slug} AND type = 'city' AND parent_id IS NULL
    LIMIT 1
  `;

  let cityId = existingCity?.id;

  if (cityId) {
    await sql`
      UPDATE locations
      SET name = ${city.name}, state = ${city.state}, sort_order = ${city.sortOrder}, published = true
      WHERE id = ${cityId}
    `;
  } else {
    const [inserted] = await sql`
      INSERT INTO locations (slug, name, type, state, sort_order, published)
      VALUES (${city.slug}, ${city.name}, ${"city"}, ${city.state}, ${city.sortOrder}, true)
      RETURNING id
    `;
    cityId = inserted.id;
  }

  let metroSort = 1;
  for (const metro of city.metros) {
    const [existingMetro] = await sql`
      SELECT id FROM locations
      WHERE slug = ${metro.slug} AND parent_id = ${cityId} AND type = 'metro'
      LIMIT 1
    `;

    if (existingMetro) {
      await sql`
        UPDATE locations
        SET name = ${metro.name}, state = ${city.state}, sort_order = ${metroSort}, published = true
        WHERE id = ${existingMetro.id}
      `;
    } else {
      await sql`
        INSERT INTO locations (slug, name, type, state, parent_id, sort_order, published)
        VALUES (${metro.slug}, ${metro.name}, ${"metro"}, ${city.state}, ${cityId}, ${metroSort}, true)
      `;
    }
    metroSort += 1;
  }

  const staleMetros = await sql`
    SELECT id, slug FROM locations WHERE parent_id = ${cityId} AND type = 'metro'
  `;
  for (const stale of staleMetros) {
    if (!city.metros.some((metro) => metro.slug === stale.slug)) {
      await sql`DELETE FROM locations WHERE id = ${stale.id}`;
    }
  }
}

const staleCities = await sql`
  SELECT id, slug FROM locations WHERE type = 'city' AND parent_id IS NULL
`;
const validSlugs = new Set(australiaLocations.map((city) => city.slug));
for (const stale of staleCities) {
  if (!validSlugs.has(stale.slug)) {
    await sql`DELETE FROM locations WHERE id = ${stale.id}`;
  }
}

for (const service of seoServiceSeed) {
  await sql`
    INSERT INTO seo_services (
      slug, name, summary, description, linked_service_slug, sort_order, published
    )
    VALUES (
      ${service.slug},
      ${service.name},
      ${service.summary},
      ${service.description},
      ${service.linkedServiceSlug},
      ${service.sortOrder},
      true
    )
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      summary = EXCLUDED.summary,
      description = EXCLUDED.description,
      linked_service_slug = EXCLUDED.linked_service_slug,
      sort_order = EXCLUDED.sort_order,
      published = true
  `;
}

await sql`UPDATE locations SET hero_image = NULL WHERE hero_image LIKE 'http%'`;
await sql`UPDATE seo_pages SET hero_image = NULL WHERE hero_image LIKE 'http%'`;
await sql`UPDATE seo_pages SET card_images = NULL WHERE card_images LIKE '%http%'`;
await sql`
  DELETE FROM location_service_images
  WHERE hero_image LIKE 'http%' OR card_images LIKE '%http%'
`;

console.log("SEO tables ready.");
console.log(`Australia geo: ${australiaLocations.length} cities synced from australia-locations.mjs`);

await sql.end();

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const result = spawnSync(
  process.execPath,
  ["--env-file=.env", path.join(scriptDir, "generate-all-seo-pages.mjs")],
  { stdio: "inherit", cwd: path.join(scriptDir, "..") },
);

process.exit(result.status ?? 1);
