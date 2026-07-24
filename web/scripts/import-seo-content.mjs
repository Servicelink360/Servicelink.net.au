/**
 * Import seo_pages content from export JSON (updates matching paths).
 * Usage: node --env-file=.env scripts/import-seo-content.mjs [/path/to/export.json]
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

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const inPath =
  process.argv[2] ?? path.join(scriptDir, ".cache/seo-content-export.json");

if (!fs.existsSync(inPath)) {
  console.error(`Missing export file: ${inPath}`);
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(inPath, "utf8"));
if (!Array.isArray(rows) || rows.length === 0) {
  console.error("Export file is empty");
  process.exit(1);
}

const sql = postgres(url);
let updated = 0;
let missing = 0;

for (const row of rows) {
  const result = await sql`
    UPDATE seo_pages
    SET
      meta_title = ${row.meta_title},
      meta_description = ${row.meta_description},
      h1 = ${row.h1},
      intro = ${row.intro},
      body = ${row.body},
      content_source = ${row.content_source},
      updated_at = now()
    WHERE path = ${row.path}
  `;
  if (result.count > 0) updated += 1;
  else missing += 1;
}

console.log(`imported: updated=${updated} missing_paths=${missing} total=${rows.length}`);

const [sample] = await sql`
  SELECT path, content_source, left(intro, 100) AS intro
  FROM seo_pages
  WHERE path = 'adelaide/asset-management'
`;
console.log("sample adelaide/asset-management:", sample);

await sql.end();
console.log("SEO_CONTENT_IMPORT_OK");
