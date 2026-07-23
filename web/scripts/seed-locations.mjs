import postgres from "postgres";
import { australiaLocations, australiaCitySlugs } from "./data/australia-locations.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = postgres(url);

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

const canonicalMetroKeys = new Set();
let citiesSynced = 0;
let metrosSynced = 0;

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
      SET name = ${city.name},
          state = ${city.state},
          sort_order = ${city.sortOrder},
          published = true,
          type = 'city'
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

  citiesSynced += 1;

  let metroSort = 1;
  for (const metro of city.metros) {
    canonicalMetroKeys.add(`${city.slug}/${metro.slug}`);

    const [existingMetro] = await sql`
      SELECT id FROM locations
      WHERE slug = ${metro.slug} AND parent_id = ${cityId} AND type = 'metro'
      LIMIT 1
    `;

    if (existingMetro) {
      await sql`
        UPDATE locations
        SET name = ${metro.name},
            state = ${city.state},
            sort_order = ${metroSort},
            published = true
        WHERE id = ${existingMetro.id}
      `;
    } else {
      await sql`
        INSERT INTO locations (slug, name, type, state, parent_id, sort_order, published)
        VALUES (
          ${metro.slug},
          ${metro.name},
          ${"metro"},
          ${city.state},
          ${cityId},
          ${metroSort},
          true
        )
      `;
    }

    metrosSynced += 1;
    metroSort += 1;
  }

  const staleMetros = await sql`
    SELECT id, slug FROM locations
    WHERE parent_id = ${cityId} AND type = 'metro'
  `;

  for (const stale of staleMetros) {
    if (!city.metros.some((metro) => metro.slug === stale.slug)) {
      await sql`DELETE FROM locations WHERE id = ${stale.id}`;
    }
  }
}

const staleCities = await sql`
  SELECT id, slug FROM locations
  WHERE type = 'city' AND parent_id IS NULL
`;

let citiesRemoved = 0;
for (const stale of staleCities) {
  if (!australiaCitySlugs.has(stale.slug)) {
    await sql`DELETE FROM locations WHERE id = ${stale.id}`;
    citiesRemoved += 1;
  }
}

const cityCountRows = await sql`
  SELECT COUNT(*)::int AS city_count FROM locations WHERE type = 'city' AND parent_id IS NULL
`;
const metroCountRows = await sql`
  SELECT COUNT(*)::int AS metro_count FROM locations WHERE type = 'metro'
`;

console.log(`Australia geo synced.`);
console.log(`  Cities:  ${cityCountRows[0].city_count} (${citiesSynced} processed, ${citiesRemoved} removed)`);
console.log(`  Metros:  ${metroCountRows[0].metro_count} (${metrosSynced} processed)`);
console.log(`  Source:  scripts/data/australia-locations.mjs`);

await sql.end();
