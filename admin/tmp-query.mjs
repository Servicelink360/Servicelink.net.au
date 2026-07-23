import postgres from "postgres";

const sql = postgres("postgresql://postgres:123456@localhost:5432/servicelink");

const locs = await sql`
  SELECT id, name, slug, type, state, parent_id
  FROM locations
  WHERE lower(name) LIKE '%inner%west%' OR lower(slug) LIKE '%inner%west%'
  ORDER BY type, name
`;

console.log("locations:", JSON.stringify(locs, null, 2));

const pages = await sql`
  SELECT sp.id, sp.path, sp.page_type, sp.h1, city.name AS city, metro.name AS metro
  FROM seo_pages sp
  JOIN locations city ON city.id = sp.city_id
  LEFT JOIN locations metro ON metro.id = sp.metro_id
  WHERE lower(sp.path) LIKE '%inner%west%' OR lower(sp.h1) LIKE '%inner%west%' OR lower(metro.name) LIKE '%inner%west%'
  ORDER BY sp.path
  LIMIT 30
`;

console.log("seo pages:", JSON.stringify(pages, null, 2));
await sql.end();
