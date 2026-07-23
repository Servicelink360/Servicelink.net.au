import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { australiaLocations } from "./data/australia-locations.mjs";
import { generateJson, rateLimitDelay } from "./lib/gemini-client.mjs";
import { buildLocationServicePrompt } from "./lib/seo-content-prompts.mjs";
import { SERVICE_DEFINITIONS } from "./lib/service-definitions.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const cityFilter = args.find((arg) => arg.startsWith("--city="))?.split("=")[1];
const serviceFilter = args.find((arg) => arg.startsWith("--service="))?.split("=")[1];
const limitArg = args.find((arg) => arg.startsWith("--limit="))?.split("=")[1];
const limit = limitArg ? Number(limitArg) : Infinity;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(scriptDir, ".cache/gemini-locations");

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

const cities = australiaLocations.filter((city) => !cityFilter || city.slug === cityFilter);
if (cityFilter && cities.length === 0) {
  console.error(`Unknown city slug: ${cityFilter}`);
  await sql.end();
  process.exit(1);
}

const services = SERVICE_DEFINITIONS.filter(
  (service) => !serviceFilter || service.seoSlug === serviceFilter,
);
if (serviceFilter && services.length === 0) {
  console.error(`Unknown service slug: ${serviceFilter}`);
  await sql.end();
  process.exit(1);
}

const [dbCities, dbMetros, dbServices] = await Promise.all([
  sql`SELECT id, slug, name, state FROM locations WHERE type = 'city' AND parent_id IS NULL`,
  sql`SELECT id, slug, name, parent_id FROM locations WHERE type = 'metro'`,
  sql`SELECT id, slug FROM seo_services WHERE published = true`,
]);

const cityIdBySlug = new Map(dbCities.map((city) => [city.slug, city.id]));
const metroIdByCityAndSlug = new Map(
  dbMetros.map((metro) => [`${metro.parent_id}:${metro.slug}`, metro.id]),
);
const serviceIdBySlug = new Map(dbServices.map((service) => [service.slug, service.id]));

fs.mkdirSync(cacheDir, { recursive: true });

let processed = 0;
let skipped = 0;
let written = 0;
let errors = 0;

const totalBatches = cities.length * services.length;
let batchNum = 0;

function progressLabel() {
  const pct = totalBatches > 0 ? ((batchNum / totalBatches) * 100).toFixed(1) : "0.0";
  return `[${batchNum}/${totalBatches}] ${pct}%`;
}

console.log(
  `Generating location service pages with Gemini for ${cities.length} cities × ${services.length} services (${totalBatches} batches)…`,
);
if (dryRun) console.log("(dry run — no database writes)");

for (const city of cities) {
  const cityId = cityIdBySlug.get(city.slug);
  if (!cityId) {
    console.warn(`  Skipping ${city.name}: not in database (run db:seed-seo first)`);
    continue;
  }

  for (const service of services) {
    if (processed >= limit) break;

    const serviceId = serviceIdBySlug.get(service.seoSlug);
    if (!serviceId) {
      console.warn(`  Skipping ${service.name}: not in seo_services`);
      continue;
    }

    const cacheKey = `${city.slug}__${service.seoSlug}.json`;
    const cachePath = path.join(cacheDir, cacheKey);
    const hasCache = fs.existsSync(cachePath);

    batchNum += 1;
    const label = progressLabel();

    if (hasCache && !force) {
      console.log(`  ${label} ↷ ${city.name} / ${service.name} (cached)`);
    } else {
      console.log(`  ${label} → ${city.name} / ${service.name}`);
    }

    try {
      let content;
      if (hasCache && !force) {
        content = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        skipped += 1;
      } else {
        content = await generateJson(buildLocationServicePrompt(city, service));
        if (!dryRun) {
          fs.writeFileSync(cachePath, `${JSON.stringify(content, null, 2)}\n`);
        }
        await rateLimitDelay();
      }

      if (!content?.cityService) {
        throw new Error("Missing cityService in response");
      }

      const upserts = [];

      upserts.push({
        path: buildSeoPath(city.slug, null, service.seoSlug),
        pageType: "city_service",
        metroId: null,
        content: content.cityService,
      });

      for (const metro of city.metros) {
        const metroContent = content.metroServices?.find((item) => item.metroSlug === metro.slug);
        if (!metroContent) {
          console.warn(`    Missing metro content for ${metro.slug}`);
          continue;
        }

        const metroId = metroIdByCityAndSlug.get(`${cityId}:${metro.slug}`);
        if (!metroId) continue;

        upserts.push({
          path: buildSeoPath(city.slug, metro.slug, service.seoSlug),
          pageType: "metro_service",
          metroId,
          content: metroContent,
        });
      }

      if (!dryRun) {
        for (const page of upserts) {
          await sql`
            INSERT INTO seo_pages (
              path, page_type, city_id, metro_id, seo_service_id,
              meta_title, meta_description, h1, intro, body, content_source, published, no_index, updated_at
            )
            VALUES (
              ${page.path},
              ${page.pageType},
              ${cityId},
              ${page.metroId},
              ${serviceId},
              ${page.content.metaTitle},
              ${page.content.metaDescription},
              ${page.content.h1},
              ${page.content.intro},
              ${page.content.body},
              ${"gemini"},
              true,
              false,
              now()
            )
            ON CONFLICT (path) DO UPDATE SET
              page_type = EXCLUDED.page_type,
              meta_title = EXCLUDED.meta_title,
              meta_description = EXCLUDED.meta_description,
              h1 = EXCLUDED.h1,
              intro = EXCLUDED.intro,
              body = EXCLUDED.body,
              content_source = 'gemini',
              published = true,
              updated_at = now()
          `;
          written += 1;
        }
      }

      processed += 1;
      if (!hasCache || force) {
        console.log(`  ${label} ✓ ${city.name} / ${service.name} — ${upserts.length} pages saved`);
      }
    } catch (error) {
      errors += 1;
      console.error(`    Error: ${error.message.slice(0, 200)}`);
      console.error(`    Will retry this batch on next run (not cached).`);
    }
  }

  if (processed >= limit) break;
}

console.log("");
console.log(`Processed: ${processed}`);
console.log(`Skipped (cached): ${skipped}`);
console.log(`Pages upserted: ${written}`);
console.log(`Errors: ${errors}`);
console.log(`Cache: ${cacheDir}`);

await sql.end();
