/**
 * Phase 2 SEO publish (additive — does not unpublish Phase 1):
 * Melbourne / Brisbane / Perth / Adelaide — top 10 metros each
 * + metro hubs + metro × service
 *
 * ~360 paths. Leaves all other pages unpublished.
 */
import postgres from "postgres";
import { SERVICE_DEFINITIONS } from "./lib/service-definitions.mjs";

const PHASE2_METROS = {
  melbourne: [
    "melbourne-cbd",
    "docklands",
    "southbank",
    "south-melbourne",
    "richmond",
    "carlton",
    "fitzroy",
    "collingwood",
    "brunswick",
    "north-melbourne",
  ],
  brisbane: [
    "brisbane-cbd",
    "south-brisbane",
    "fortitude-valley",
    "bowen-hills",
    "newstead",
    "indooroopilly",
    "toowong",
    "st-lucia",
    "chermside",
    "aspley",
  ],
  perth: [
    "perth-cbd",
    "northbridge",
    "subiaco",
    "nedlands",
    "claremont",
    "fremantle",
    "rockingham",
    "joondalup",
    "wanneroo",
    "butler",
  ],
  adelaide: [
    "adelaide-cbd",
    "north-adelaide",
    "port-adelaide",
    "norwood",
    "unley",
    "burnside",
    "glenelg",
    "brighton-adelaide",
    "marion",
    "noarlunga",
  ],
};

const SERVICES = SERVICE_DEFINITIONS.map((s) => s.seoSlug);

export function buildPhase2Allowlist() {
  const paths = [];
  for (const [city, metros] of Object.entries(PHASE2_METROS)) {
    for (const metro of metros) {
      paths.push(`${city}/${metro}`);
      for (const service of SERVICES) {
        paths.push(`${city}/${metro}/${service}`);
      }
    }
  }
  return paths;
}

export { PHASE2_METROS };

const isMain = process.argv[1]?.includes("publish-seo-phase2");

if (isMain) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const dryRun = process.argv.includes("--dry-run");
  const allowlist = buildPhase2Allowlist();
  console.log(`Phase 2 allowlist: ${allowlist.length} paths`);

  const sql = postgres(url);

  const before = await sql`
    SELECT
      count(*) FILTER (WHERE published)::int AS published,
      count(*) FILTER (WHERE NOT published)::int AS unpublished,
      count(*)::int AS total
    FROM seo_pages
  `;
  console.log("seo_pages before:", before[0]);

  if (!dryRun) {
    const published = await sql`
      UPDATE seo_pages
      SET published = true,
          no_index = false,
          updated_at = now()
      WHERE path = ANY(${allowlist})
      RETURNING path
    `;

    // Publish Phase 2 metro locations (do not touch other metros/cities)
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
    console.log(`Phase 2 rows published: ${published.length}`);
    if (missing.length) {
      console.warn(`Missing from DB (${missing.length}):`, missing.slice(0, 20));
    }

    const locMetros = await sql`
      SELECT count(*)::int AS n FROM locations WHERE type = 'metro' AND published = true
    `;
    console.log(`locations metros published: ${locMetros[0].n}`);
  } else {
    const existing = await sql`
      SELECT count(*)::int AS n FROM seo_pages WHERE path = ANY(${allowlist})
    `;
    console.log(`allowlist paths present in DB: ${existing[0].n}`);
  }

  await sql.end();
  console.log(dryRun ? "DRY_RUN_OK" : "PHASE2_PUBLISH_OK");
}
