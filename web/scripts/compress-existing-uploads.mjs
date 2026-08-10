/**
 * Recompress existing public/uploads images.
 * - jpg/jpeg/webp: overwrite in place (same URL)
 * - png: write sibling .webp, rewrite DB/settings paths, remove old png when safe
 *
 * Usage:
 *   node --env-file=.env scripts/compress-existing-uploads.mjs
 *   node --env-file=.env scripts/compress-existing-uploads.mjs --dry-run
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import sharp from "sharp";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const minBytes = Number(
  args.find((a) => a.startsWith("--min-bytes="))?.split("=")[1] ?? 120_000,
);
const maxEdge = 1920;
const webpQuality = 78;
const jpegQuality = 80;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(scriptDir, "../public");
const uploadsRoot = path.join(publicDir, "uploads");

const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const sql = process.env.DATABASE_URL ? postgres(process.env.DATABASE_URL) : null;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function toPublicUrl(absPath) {
  return `/${path.relative(publicDir, absPath).replaceAll("\\", "/")}`;
}

async function replacePathEverywhere(fromUrl, toUrl) {
  if (!sql || fromUrl === toUrl) return 0;
  let touched = 0;

  const direct = await Promise.all([
    sql`UPDATE locations SET hero_image = ${toUrl} WHERE hero_image = ${fromUrl}`,
    sql`UPDATE seo_pages SET hero_image = ${toUrl} WHERE hero_image = ${fromUrl}`,
    sql`UPDATE seo_services SET hero_image = ${toUrl} WHERE hero_image = ${fromUrl}`,
    sql`UPDATE news_posts SET featured_image = ${toUrl} WHERE featured_image = ${fromUrl}`,
    sql`UPDATE location_service_images SET hero_image = ${toUrl} WHERE hero_image = ${fromUrl}`.catch(() => []),
  ]);
  for (const result of direct) touched += result.count ?? 0;

  const like = `%${fromUrl}%`;
  const blobs = await Promise.all([
    sql`UPDATE seo_pages SET card_images = replace(card_images, ${fromUrl}, ${toUrl}) WHERE card_images LIKE ${like}`,
    sql`UPDATE seo_services SET card_images = replace(card_images, ${fromUrl}, ${toUrl}) WHERE card_images LIKE ${like}`,
    sql`UPDATE location_service_images SET card_images = replace(card_images, ${fromUrl}, ${toUrl}) WHERE card_images LIKE ${like}`.catch(() => []),
    sql`UPDATE site_pages SET settings = replace(settings, ${fromUrl}, ${toUrl}) WHERE settings LIKE ${like}`,
    sql`UPDATE site_settings SET value = replace(value, ${fromUrl}, ${toUrl}) WHERE value LIKE ${like}`.catch(() => []),
  ]);
  for (const result of blobs) touched += result.count ?? 0;

  return touched;
}

let scanned = 0;
let skipped = 0;
let compressed = 0;
let savedBytes = 0;
let pathRewrites = 0;
let errors = 0;

console.log(
  `Scanning ${uploadsRoot} (min ${minBytes} bytes)${dryRun ? " [dry-run]" : ""}…`,
);

const files = await walk(uploadsRoot);

for (const filePath of files) {
  const ext = path.extname(filePath).toLowerCase();
  if (!RASTER.has(ext)) continue;

  scanned += 1;
  const beforeStat = await fs.stat(filePath);
  if (beforeStat.size < minBytes) {
    skipped += 1;
    continue;
  }

  try {
    const input = await fs.readFile(filePath);
    const pipeline = sharp(input, { failOn: "none", animated: false })
      .rotate()
      .resize({
        width: maxEdge,
        height: maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      });

    const fromUrl = toPublicUrl(filePath);
    let outPath = filePath;
    let outUrl = fromUrl;
    let output;

    if (ext === ".png") {
      output = await pipeline.webp({ quality: webpQuality, effort: 4 }).toBuffer();
      outPath = filePath.replace(/\.png$/i, ".webp");
      outUrl = toPublicUrl(outPath);
    } else if (ext === ".webp") {
      output = await pipeline.webp({ quality: webpQuality, effort: 4 }).toBuffer();
    } else {
      output = await pipeline.jpeg({ quality: jpegQuality, mozjpeg: true }).toBuffer();
    }

    if (output.length >= beforeStat.size * 0.97 && outPath === filePath) {
      skipped += 1;
      continue;
    }

    const delta = beforeStat.size - output.length;
    const rel = path.relative(uploadsRoot, filePath);
    console.log(
      `  ${rel}: ${(beforeStat.size / 1024).toFixed(0)}KB → ${(output.length / 1024).toFixed(0)}KB (−${Math.max(0, (delta / beforeStat.size) * 100).toFixed(0)}%)${outPath !== filePath ? " → .webp" : ""}`,
    );

    if (!dryRun) {
      const tmp = `${outPath}.tmp`;
      await fs.writeFile(tmp, output);
      await fs.rename(tmp, outPath);

      if (outPath !== filePath) {
        const rewritten = await replacePathEverywhere(fromUrl, outUrl);
        pathRewrites += rewritten;
        // Only delete original when a webp sibling exists
        await fs.unlink(filePath).catch(() => {});
      }
    }

    compressed += 1;
    savedBytes += Math.max(0, delta);
  } catch (error) {
    errors += 1;
    console.error(`  Error ${filePath}: ${error.message}`);
  }
}

console.log("");
console.log(`Scanned: ${scanned}`);
console.log(`Compressed: ${compressed}`);
console.log(`Skipped: ${skipped}`);
console.log(`Path rewrites: ${pathRewrites}`);
console.log(`Errors: ${errors}`);
console.log(`Saved: ${(savedBytes / 1024 / 1024).toFixed(1)} MB${dryRun ? " (dry-run)" : ""}`);

if (sql) await sql.end();
