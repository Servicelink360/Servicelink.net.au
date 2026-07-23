import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

const sydneyMetros = await sql`
  SELECT l.slug, l.name, c.slug AS city_slug
  FROM locations l
  JOIN locations c ON c.id = l.parent_id
  WHERE c.slug = 'sydney' AND l.type = 'metro'
  ORDER BY l.name
`;

const sydneyPages = await sql`
  SELECT sp.path, m.name AS metro, ss.slug AS service
  FROM seo_pages sp
  JOIN locations c ON c.id = sp.city_id
  LEFT JOIN locations m ON m.id = sp.metro_id
  LEFT JOIN seo_services ss ON ss.id = sp.seo_service_id
  WHERE c.slug = 'sydney'
  ORDER BY sp.path
`;

const wrongParent = await sql`
  SELECT sp.path, c.slug AS page_city, mc.slug AS metro_city, m.name AS metro
  FROM seo_pages sp
  JOIN locations c ON c.id = sp.city_id
  LEFT JOIN locations m ON m.id = sp.metro_id
  LEFT JOIN locations mc ON mc.id = m.parent_id
  WHERE sp.metro_id IS NOT NULL AND mc.id IS DISTINCT FROM sp.city_id
`;

console.log("Sydney metros:", sydneyMetros);
console.log("Sydney page count:", sydneyPages.length);
console.log("Wrong metro/city pairings:", wrongParent);
console.log("Sample sydney paths:", sydneyPages.slice(0, 15));

const allCities = await sql`
  SELECT slug, name, COUNT(*)::int AS count
  FROM locations
  WHERE type = 'city'
  GROUP BY slug, name
  HAVING COUNT(*) > 1
`;
console.log("Duplicate cities:", allCities);

const geelongOnSydney = await sql`
  SELECT path FROM seo_pages WHERE path LIKE 'sydney/%geelong%'
`;
console.log("Geelong on sydney paths:", geelongOnSydney);

const sydneyHubRelated = await sql`
  SELECT path, h1 FROM seo_pages
  WHERE city_id = (SELECT id FROM locations WHERE slug='sydney' AND type='city' LIMIT 1)
  AND metro_id IS NULL AND published = true
  ORDER BY path
`;
console.log("Sydney hub related candidates:", sydneyHubRelated);

await sql.end();
