/**
 * Export Gemini (or all) seo_pages content for syncing to another environment.
 * Usage: node --env-file=.env scripts/export-seo-content.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const all = process.argv.includes("--all");
const outArg = process.argv.find((a) => a.startsWith("--out="))?.split("=")[1];
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outPath =
  outArg ?? path.join(scriptDir, ".cache/seo-content-export.json");

const sql = postgres(url);
const rows = all
  ? await sql`
      SELECT path, page_type, meta_title, meta_description, h1, intro, body,
             content_source, published, no_index
      FROM seo_pages
      ORDER BY path
    `
  : await sql`
      SELECT path, page_type, meta_title, meta_description, h1, intro, body,
             content_source, published, no_index
      FROM seo_pages
      WHERE content_source = 'gemini'
      ORDER BY path
    `;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
console.log(`exported ${rows.length} pages → ${outPath}`);
await sql.end();
