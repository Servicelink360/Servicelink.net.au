/**
 * Phase 1 SEO publish set (~270 pages):
 * - 20 priority city hubs + city×service
 * - Sydney top 10 metro hubs + metro×service
 *
 * Additive only: never unpublish pages/locations outside this set, so admin
 * one-click publishes (e.g. Manly) survive deploys.
 */
import postgres from "postgres";
import { SERVICE_DEFINITIONS } from "./lib/service-definitions.mjs";
import { buildPhase2Allowlist, PHASE2_METROS } from "./publish-seo-phase2.mjs";

const PHASE1_CITIES = [
  "sydney",
  "melbourne",
  "brisbane",
  "perth",
  "adelaide",
  "canberra",
  "gold-coast",
  "newcastle",
  "geelong",
  "wollongong",
  "sunshine-coast",
  "hobart",
  "darwin",
  "townsville",
  "cairns",
  "toowoomba",
  "ballarat",
  "bendigo",
  "launceston",
  "central-coast",
];

const SYDNEY_TOP_METROS = [
  "sydney-cbd",
  "parramatta",
  "north-sydney",
  "macquarie-park",
  "liverpool",
  "penrith",
  "blacktown",
  "bondi-junction",
  "alexandria",
  "surry-hills",
];

const SERVICES = SERVICE_DEFINITIONS.map((s) => s.seoSlug);

function buildAllowlist() {
  const paths = new Set();

  for (const city of PHASE1_CITIES) {
    paths.add(city);
    for (const service of SERVICES) {
      paths.add(`${city}/${service}`);
    }
  }

  for (const metro of SYDNEY_TOP_METROS) {
    paths.add(`sydney/${metro}`);
    for (const service of SERVICES) {
      paths.add(`sydney/${metro}/${service}`);
    }
  }

  return [...paths];
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const allowlist = buildAllowlist();
console.log(`Phase 1 allowlist: ${allowlist.length} paths`);
if (allowlist.length !== 270) {
  console.warn(`Expected 270 paths, got ${allowlist.length}`);
}

const sql = postgres(url);

const before = await sql`
  SELECT
    count(*) FILTER (WHERE published)::int AS published,
    count(*) FILTER (WHERE NOT published)::int AS unpublished,
    count(*) FILTER (WHERE no_index)::int AS noindex,
    count(*)::int AS total
  FROM seo_pages
`;
console.log("seo_pages before:", before[0]);

if (!dryRun) {
  // Additive publish only — never wipe admin-published pages on deploy.
  const published = await sql`
    UPDATE seo_pages
    SET published = true,
        no_index = false,
        updated_at = now()
    WHERE path = ANY(${allowlist})
    RETURNING path
  `;

  await sql`
    UPDATE locations
    SET published = true
    WHERE type = 'city' AND slug = ANY(${PHASE1_CITIES})
  `;
  await sql`
    UPDATE locations m
    SET published = true
    FROM locations c
    WHERE m.type = 'metro'
      AND m.parent_id = c.id
      AND c.slug = 'sydney'
      AND m.slug = ANY(${SYDNEY_TOP_METROS})
  `;

  for (const [citySlug, metroSlugs] of Object.entries(PHASE2_METROS)) {
    await sql`
      UPDATE locations m
      SET published = true
      FROM locations c
      WHERE m.type = 'metro'
        AND m.parent_id = c.id
        AND c.slug = ${citySlug}
        AND m.slug = ANY(${metroSlugs})
    `;
  }

  const phase2 = buildPhase2Allowlist();
  const phase2Published = await sql`
    UPDATE seo_pages
    SET published = true,
        no_index = false,
        updated_at = now()
    WHERE path = ANY(${phase2})
    RETURNING path
  `;
  console.log(`Phase 2 rows re-published: ${phase2Published.length}`);

  // Align location flags with published hub pages (admin one-click publish).
  await sql`
    UPDATE locations m
    SET published = true
    FROM seo_pages sp
    WHERE m.type = 'metro'
      AND sp.metro_id = m.id
      AND sp.page_type = 'metro_hub'
      AND sp.published = true
  `;
  await sql`
    UPDATE locations c
    SET published = true
    FROM seo_pages sp
    WHERE c.type = 'city'
      AND sp.city_id = c.id
      AND sp.metro_id IS NULL
      AND sp.page_type = 'city_hub'
      AND sp.published = true
  `;

  const after = await sql`
    SELECT
      count(*) FILTER (WHERE published)::int AS published,
      count(*) FILTER (WHERE NOT published)::int AS unpublished,
      count(*) FILTER (WHERE no_index)::int AS noindex,
      count(*)::int AS total
    FROM seo_pages
  `;

  const missing = allowlist.filter((p) => !published.some((r) => r.path === p));
  console.log("seo_pages after:", after[0]);
  console.log(`Phase 1 rows updated: ${published.length}`);
  if (missing.length) {
    console.warn(`Missing from DB (${missing.length}):`, missing.slice(0, 20));
  }

  const locCities = await sql`
    SELECT count(*)::int AS n FROM locations WHERE type = 'city' AND published = true
  `;
  const locMetros = await sql`
    SELECT count(*)::int AS n FROM locations WHERE type = 'metro' AND published = true
  `;
  console.log(`locations published: ${locCities[0].n} cities, ${locMetros[0].n} metros`);
} else {
  console.log("(dry run — no writes)");
  const existing = await sql`
    SELECT count(*)::int AS n FROM seo_pages WHERE path = ANY(${allowlist})
  `;
  console.log(`allowlist paths present in DB: ${existing[0].n}`);
}

await sql.end();
console.log(dryRun ? "DRY_RUN_OK" : "PHASE1_PUBLISH_OK");
