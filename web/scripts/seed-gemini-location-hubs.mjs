import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { australiaLocations } from "./data/australia-locations.mjs";
import { generateJson, rateLimitDelay } from "./lib/gemini-client.mjs";
import { buildLocationHubPrompt } from "./lib/seo-content-prompts.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const includeCityHub = args.includes("--include-city-hub");
const cityFilter = args.find((arg) => arg.startsWith("--city="))?.split("=")[1];
const metrosArg = args.find((arg) => arg.startsWith("--metros="))?.split("=")[1];
const chunkArg = args.find((arg) => arg.startsWith("--chunk="))?.split("=")[1];
const chunkSize = Math.max(1, Number(chunkArg) || 10);
const metroFilter = metrosArg
  ? new Set(
      metrosArg
        .split(",")
        .map((slug) => slug.trim().toLowerCase())
        .filter(Boolean),
    )
  : null;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(scriptDir, ".cache/gemini-hubs");

const sql = postgres(url);

await sql`
  ALTER TABLE seo_pages
  ADD COLUMN IF NOT EXISTS content_source varchar(32) NOT NULL DEFAULT 'template'
`;

function buildSeoPath(citySlug, metroSlug) {
  return metroSlug ? `${citySlug}/${metroSlug}` : citySlug;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

const cities = australiaLocations.filter((city) => !cityFilter || city.slug === cityFilter);
if (cityFilter && cities.length === 0) {
  console.error(`Unknown city slug: ${cityFilter}`);
  await sql.end();
  process.exit(1);
}

const [dbCities, dbMetros] = await Promise.all([
  sql`SELECT id, slug, name, state FROM locations WHERE type = 'city' AND parent_id IS NULL`,
  sql`SELECT id, slug, name, parent_id FROM locations WHERE type = 'metro'`,
]);

const cityIdBySlug = new Map(dbCities.map((city) => [city.slug, city.id]));
const metroIdByCityAndSlug = new Map(
  dbMetros.map((metro) => [`${metro.parent_id}:${metro.slug}`, metro.id]),
);

fs.mkdirSync(cacheDir, { recursive: true });

let processed = 0;
let skipped = 0;
let written = 0;
let errors = 0;

console.log(`Generating location hub pages with Gemini…`);
if (dryRun) console.log("(dry run — no database writes)");
if (!includeCityHub) console.log("(metro hubs only — pass --include-city-hub to also seed city hubs)");

for (const city of cities) {
  const cityId = cityIdBySlug.get(city.slug);
  if (!cityId) {
    console.warn(`  Skipping ${city.name}: not in database`);
    continue;
  }

  let metros = city.metros;
  if (metroFilter) {
    metros = metros.filter((metro) => metroFilter.has(metro.slug));
    const missing = [...metroFilter].filter((slug) => !city.metros.some((m) => m.slug === slug));
    if (missing.length) {
      console.warn(`  Unknown metro slug(s) for ${city.name}: ${missing.join(", ")}`);
    }
  }

  if (!includeCityHub && metros.length === 0) {
    console.log(`  No metros to seed for ${city.name}`);
    continue;
  }

  // Only seed hubs that are still template (unless --force).
  let metrosToSeed = metros;
  if (!force && !dryRun) {
    const paths = metros.map((metro) => buildSeoPath(city.slug, metro.slug));
    const existing =
      paths.length > 0
        ? await sql`
            SELECT path, content_source
            FROM seo_pages
            WHERE path = ANY(${paths}) AND page_type = 'metro_hub'
          `
        : [];
    const geminiPaths = new Set(
      existing.filter((row) => row.content_source === "gemini").map((row) => row.path),
    );
    metrosToSeed = metros.filter((metro) => !geminiPaths.has(buildSeoPath(city.slug, metro.slug)));
  }

  let needCityHub = includeCityHub;
  if (includeCityHub && !force && !dryRun) {
    const [cityHub] = await sql`
      SELECT content_source FROM seo_pages
      WHERE path = ${city.slug} AND page_type = 'city_hub'
      LIMIT 1
    `;
    if (cityHub?.content_source === "gemini") needCityHub = false;
  }

  if (!needCityHub && metrosToSeed.length === 0) {
    console.log(`  ↷ ${city.name} hubs already gemini`);
    skipped += 1;
    continue;
  }

  const metroChunks = chunkArray(metrosToSeed, chunkSize);
  // First chunk may include city hub; later chunks are metros only.
  const batches =
    metroChunks.length > 0
      ? metroChunks.map((chunk, index) => ({
          metros: chunk,
          withCityHub: needCityHub && index === 0,
        }))
      : needCityHub
        ? [{ metros: [], withCityHub: true }]
        : [];

  for (const [batchIndex, batch] of batches.entries()) {
    const cacheKey = `${city.slug}__hubs__${batch.metros.map((m) => m.slug).join("_") || "city"}.json`;
    const cachePath = path.join(cacheDir, cacheKey);
    const hasCache = fs.existsSync(cachePath);
    const label = `[${city.slug} batch ${batchIndex + 1}/${batches.length}]`;

    if (hasCache && !force) {
      console.log(`  ${label} ↷ cached (${batch.metros.length} metros)`);
    } else {
      console.log(
        `  ${label} → ${batch.metros.length} metros${batch.withCityHub ? " + city hub" : ""}`,
      );
    }

    try {
      let content;
      if (hasCache && !force) {
        content = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        skipped += 1;
      } else {
        content = await generateJson(
          buildLocationHubPrompt(city, batch.metros, { includeCityHub: batch.withCityHub }),
        );
        if (!dryRun) {
          fs.writeFileSync(cachePath, `${JSON.stringify(content, null, 2)}\n`);
        }
        await rateLimitDelay();
      }

      const upserts = [];

      if (batch.withCityHub) {
        if (!content?.cityHub) throw new Error("Missing cityHub in response");
        upserts.push({
          path: buildSeoPath(city.slug, null),
          pageType: "city_hub",
          metroId: null,
          content: content.cityHub,
        });
      }

      for (const metro of batch.metros) {
        const metroContent = content.metroHubs?.find((item) => item.metroSlug === metro.slug);
        if (!metroContent) {
          console.warn(`    Missing metro hub content for ${metro.slug}`);
          continue;
        }
        const metroId = metroIdByCityAndSlug.get(`${cityId}:${metro.slug}`);
        if (!metroId) {
          console.warn(`    Metro not in DB: ${metro.slug}`);
          continue;
        }
        upserts.push({
          path: buildSeoPath(city.slug, metro.slug),
          pageType: "metro_hub",
          metroId,
          content: metroContent,
        });
      }

      if (!dryRun) {
        for (const page of upserts) {
          // Never publish or change existing publish/noindex flags.
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
              null,
              ${page.content.metaTitle},
              ${page.content.metaDescription},
              ${page.content.h1},
              ${page.content.intro},
              ${page.content.body},
              ${"gemini"},
              false,
              true,
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
              updated_at = now()
          `;
          written += 1;
        }
      }

      processed += 1;
      console.log(`  ${label} ✓ ${upserts.length} hub pages saved`);
    } catch (error) {
      errors += 1;
      console.error(`    Error: ${error.message.slice(0, 200)}`);
      console.error(`    Will retry this batch on next run (not cached).`);
    }
  }
}

console.log("");
console.log(`Batches processed: ${processed}`);
console.log(`Skipped (cached/already gemini): ${skipped}`);
console.log(`Hub pages upserted: ${written}`);
console.log(`Errors: ${errors}`);
console.log(`Cache: ${cacheDir}`);

await sql.end();
