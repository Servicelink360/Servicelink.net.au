import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { generateJson, rateLimitDelay } from "./lib/gemini-client.mjs";
import { buildServicesPrompt } from "./lib/seo-content-prompts.mjs";
import { SERVICE_DEFINITIONS } from "./lib/service-definitions.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const contentPath = path.join(scriptDir, "../src/data/services-content.json");

const sql = postgres(url);

console.log("Generating service content with Gemini…");
if (dryRun) console.log("(dry run — no database or file writes)");

const payload = await generateJson(buildServicesPrompt());

if (!Array.isArray(payload?.services) || payload.services.length !== SERVICE_DEFINITIONS.length) {
  console.error("Gemini returned unexpected service count.", payload);
  await sql.end();
  process.exit(1);
}

const servicesForJson = [];
let updated = 0;

for (const definition of SERVICE_DEFINITIONS) {
  const generated = payload.services.find((item) => item.seoSlug === definition.seoSlug);
  if (!generated) {
    console.error(`Missing service in Gemini response: ${definition.seoSlug}`);
    await sql.end();
    process.exit(1);
  }

  if (!generated.highlights || generated.highlights.length !== 5) {
    console.warn(`  Warning: ${definition.name} has ${generated.highlights?.length ?? 0} highlights (expected 5)`);
  }

  servicesForJson.push({
    slug: definition.staticSlug,
    title: generated.title ?? definition.name,
    summary: generated.summary,
    description: generated.description,
    highlights: generated.highlights ?? [],
  });

  if (!dryRun) {
    await sql`
      UPDATE seo_services
      SET
        name = ${generated.title ?? definition.name},
        summary = ${generated.summary},
        description = ${generated.description},
        published = true
      WHERE slug = ${definition.seoSlug}
    `;
    updated += 1;
  }

  console.log(`  ✓ ${definition.name}`);
}

if (!dryRun) {
  fs.mkdirSync(path.dirname(contentPath), { recursive: true });

  if (fs.existsSync(contentPath) && !force) {
    const backupPath = `${contentPath}.bak`;
    fs.copyFileSync(contentPath, backupPath);
    console.log(`  Backed up existing content to ${path.basename(backupPath)}`);
  }

  fs.writeFileSync(contentPath, `${JSON.stringify(servicesForJson, null, 2)}\n`);
  console.log(`\nWrote ${contentPath}`);
  console.log(`Updated ${updated} rows in seo_services.`);
} else {
  console.log("\nSample (first service):");
  console.log(JSON.stringify(servicesForJson[0], null, 2).slice(0, 800) + "…");
}

await sql.end();
