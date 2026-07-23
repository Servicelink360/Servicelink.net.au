import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { australiaLocations } from "./data/australia-locations.mjs";
import { SERVICE_DEFINITIONS } from "./lib/service-definitions.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const watch = process.argv.includes("--watch");
const intervalMs = Number(
  process.argv.find((arg) => arg.startsWith("--interval="))?.split("=")[1] ?? 15000,
);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(scriptDir, ".cache/gemini-locations");
const totalBatches = australiaLocations.length * SERVICE_DEFINITIONS.length;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function printProgress() {
  const cacheFiles = fs.existsSync(cacheDir)
    ? fs.readdirSync(cacheDir).filter((name) => name.endsWith(".json"))
    : [];

  const latestCache = cacheFiles
    .map((name) => ({
      name,
      mtime: fs.statSync(path.join(cacheDir, name)).mtime,
    }))
    .sort((a, b) => b.mtime - a.mtime)[0];

  const sql = postgres(url);

  const [geminiPages] = await sql`
    SELECT COUNT(*)::int AS count
    FROM seo_pages
    WHERE content_source = 'gemini' AND published = true
  `;

  const [servicePages] = await sql`
    SELECT COUNT(*)::int AS count
    FROM seo_pages
    WHERE content_source = 'gemini'
      AND published = true
      AND page_type IN ('city_service', 'metro_service')
  `;

  await sql.end();

  const percent = totalBatches > 0 ? ((cacheFiles.length / totalBatches) * 100).toFixed(1) : "0.0";
  const barWidth = 30;
  const filled = Math.round((cacheFiles.length / totalBatches) * barWidth);
  const bar = "█".repeat(filled) + "░".repeat(barWidth - filled);

  console.clear();
  console.log(`Gemini location content — ${new Date().toLocaleTimeString()}`);
  console.log("=".repeat(50));
  console.log(`[${bar}] ${percent}%`);
  console.log(`Batches:  ${cacheFiles.length} / ${totalBatches}`);
  console.log(`DB pages: ${geminiPages.count} total (${servicePages.count} service pages)`);
  if (latestCache) {
    console.log(`Latest:   ${latestCache.name.replace(".json", "")}`);
    console.log(`Updated:  ${latestCache.mtime.toLocaleString()}`);
  }
  if (watch) {
    console.log("");
    console.log(`Refreshing every ${intervalMs / 1000}s — Ctrl+C to stop`);
  }
}

await printProgress();

if (watch) {
  while (true) {
    await sleep(intervalMs);
    await printProgress();
  }
}
