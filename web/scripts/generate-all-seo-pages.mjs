import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = postgres(url);

await sql`
  ALTER TABLE seo_pages
  ADD COLUMN IF NOT EXISTS content_source varchar(32) NOT NULL DEFAULT 'template'
`;

function buildSeoPath(citySlug, metroSlug, serviceSlug) {
  const parts = [citySlug];
  if (metroSlug) parts.push(metroSlug);
  if (serviceSlug) parts.push(serviceSlug);
  return parts.join("/");
}

function inferSeoPageType(metroSlug, serviceSlug) {
  if (metroSlug && serviceSlug) return "metro_service";
  if (metroSlug) return "metro_hub";
  if (serviceSlug) return "city_service";
  return "city_hub";
}

function buildSeoPageContent(pageType, city, service, metro) {
  if (pageType === "city_hub") {
    return {
      metaTitle: `Facilities Services in ${city.name}, ${city.state} | Servicelink`,
      metaDescription: `Servicelink delivers facilities management, cleaning, ground maintenance, tree services, building maintenance, and support services for businesses across ${city.name}, ${city.state} and surrounding metro areas.`,
      h1: `Facilities services in ${city.name}`,
      intro: `Servicelink delivers integrated facilities management, cleaning, maintenance, and specialist support for businesses across ${city.name} and nearby metro areas.`,
      body: `From commercial offices and retail sites to community facilities and multi-site portfolios, our team delivers consistent standards, clear reporting, and responsive support across ${city.state}. Explore metro areas and services below.`,
    };
  }

  if (pageType === "metro_hub" && metro) {
    return {
      metaTitle: `${metro.name} Facilities Services | ${city.name}, ${city.state}`,
      metaDescription: `Servicelink delivers facilities management, cleaning, maintenance, and support services for businesses in ${metro.name}, ${city.name}, ${city.state}.`,
      h1: metro.name,
      intro: `Servicelink delivers facilities management, cleaning, maintenance, and specialist support for businesses in ${metro.name} and the wider ${city.name}, ${city.state} region.`,
      body: `Whether you manage a single site or a multi-location portfolio in ${metro.name}, we deliver practical, accountable facilities services tailored to local businesses across ${city.name}.`,
    };
  }

  if (pageType === "city_service") {
    return {
      metaTitle: `${service.name} in ${city.name}, ${city.state}`,
      metaDescription: `${service.summary} Servicelink delivers ${service.name.toLowerCase()} for businesses across ${city.name}, ${city.state}.`,
      h1: `${service.name} in ${city.name}`,
      intro: `Servicelink delivers professional ${service.name.toLowerCase()} for businesses across ${city.name}, ${city.state} — with clear communication and measurable results.`,
      body: `${service.description} We deliver ${service.name.toLowerCase()} for businesses across ${city.name}, ${city.state} and surrounding metro areas with responsive teams and documented service standards.`,
    };
  }

  return {
    metaTitle: `${service.name} in ${metro.name}, ${city.name}`,
    metaDescription: `${service.summary} Servicelink delivers ${service.name.toLowerCase()} for businesses in ${metro.name}, ${city.name}, ${city.state}.`,
    h1: `${service.name} in ${metro.name}`,
    intro: `Servicelink delivers ${service.name.toLowerCase()} for businesses in ${metro.name}, ${city.name} and surrounding ${city.state} locations.`,
    body: `${service.description} We deliver reliable, audit-ready ${service.name.toLowerCase()} for businesses across ${metro.name} and ${city.name}.`,
  };
}

const cities = await sql`
  SELECT id, slug, name, state
  FROM locations
  WHERE type = 'city' AND parent_id IS NULL
  ORDER BY sort_order, name
`;

const metros = await sql`
  SELECT id, slug, name, state, parent_id
  FROM locations
  WHERE type = 'metro'
  ORDER BY sort_order, name
`;

const services = await sql`
  SELECT id, slug, name, summary, description
  FROM seo_services
  WHERE published = true
  ORDER BY sort_order, name
`;

if (cities.length === 0) {
  console.error("No cities found. Run npm run db:seed-seo first.");
  await sql.end();
  process.exit(1);
}

if (services.length === 0) {
  console.error("No SEO services found. Run npm run db:seed-seo first.");
  await sql.end();
  process.exit(1);
}

const metrosByCity = metros.reduce((map, metro) => {
  const list = map.get(metro.parent_id) ?? [];
  list.push(metro);
  map.set(metro.parent_id, list);
  return map;
}, new Map());

let created = 0;
let skipped = 0;

for (const city of cities) {
  const cityMetros = metrosByCity.get(city.id) ?? [];

  const targets = [
    { metro: null, service: null },
    ...cityMetros.map((metro) => ({ metro, service: null })),
    ...services.map((service) => ({ metro: null, service })),
    ...cityMetros.flatMap((metro) => services.map((service) => ({ metro, service }))),
  ];

  for (const target of targets) {
    const pageType = inferSeoPageType(target.metro?.slug, target.service?.slug);
    const path = buildSeoPath(city.slug, target.metro?.slug, target.service?.slug);
    const content = buildSeoPageContent(
      pageType,
      { name: city.name, state: city.state },
      target.service,
      target.metro ? { name: target.metro.name, state: target.metro.state } : null,
    );

    const result = await sql`
      INSERT INTO seo_pages (
        path, page_type, city_id, metro_id, seo_service_id,
        meta_title, meta_description, h1, intro, body, published, no_index, updated_at
      )
      VALUES (
        ${path},
        ${pageType},
        ${city.id},
        ${target.metro?.id ?? null},
        ${target.service?.id ?? null},
        ${content.metaTitle},
        ${content.metaDescription},
        ${content.h1},
        ${content.intro},
        ${content.body},
        true,
        false,
        now()
      )
      ON CONFLICT (path) DO UPDATE SET
        page_type = EXCLUDED.page_type,
        city_id = EXCLUDED.city_id,
        metro_id = EXCLUDED.metro_id,
        seo_service_id = EXCLUDED.seo_service_id,
        meta_title = CASE
          WHEN seo_pages.content_source = 'gemini' THEN seo_pages.meta_title
          ELSE EXCLUDED.meta_title
        END,
        meta_description = CASE
          WHEN seo_pages.content_source = 'gemini' THEN seo_pages.meta_description
          ELSE EXCLUDED.meta_description
        END,
        h1 = CASE
          WHEN seo_pages.content_source = 'gemini' THEN seo_pages.h1
          ELSE EXCLUDED.h1
        END,
        intro = CASE
          WHEN seo_pages.content_source = 'gemini' THEN seo_pages.intro
          ELSE EXCLUDED.intro
        END,
        body = CASE
          WHEN seo_pages.content_source = 'gemini' THEN seo_pages.body
          ELSE EXCLUDED.body
        END,
        published = true,
        updated_at = now()
      RETURNING (xmax = 0) AS inserted
    `;

    if (result[0]?.inserted) {
      created += 1;
    } else {
      skipped += 1;
    }
  }
}

const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM seo_pages WHERE published = true`;

console.log(`SEO pages generated for ${cities.length} cities.`);
console.log(`  New pages:     ${created}`);
console.log(`  Updated pages: ${skipped}`);
console.log(`  Total live:    ${count}`);
console.log("");
console.log("Examples:");
console.log("  /locations/sydney");
console.log("  /locations/melbourne/cleaning");
console.log("  /locations/brisbane/south-brisbane/maintenance");

await sql.end();
